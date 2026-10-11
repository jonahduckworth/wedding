export const COLLECTIONS = Object.freeze({
  guests: 'guests', invites: 'invites', rsvps: 'rsvps',
  categories: 'honeymoon_categories', items: 'honeymoon_items',
  contributions: 'registry_contributions', campaigns: 'email_campaigns', sends: 'email_sends',
});

// Deliberately no migration, DDL, DML, email, or upload module is imported.
// Role verification is additional defense, not a substitute for provisioning.
export async function verifyReadOnlyRole(pool) {
  const { rows } = await pool.query(`
    SELECT r.rolsuper OR r.rolcreaterole OR r.rolcreatedb OR r.rolreplication OR r.rolbypassrls AS powerful,
      EXISTS (SELECT 1 FROM pg_auth_members WHERE member = r.oid) AS membership,
      has_database_privilege(current_user, current_database(), 'CREATE') OR
      has_database_privilege(current_user, current_database(), 'TEMP') OR
      EXISTS (SELECT 1 FROM pg_database WHERE datname = current_database() AND datdba = r.oid) AS database_write,
      EXISTS (SELECT 1 FROM pg_namespace n WHERE left(n.nspname, 3) <> 'pg_' AND n.nspname <> 'information_schema'
        AND (n.nspowner = r.oid OR has_schema_privilege(current_user, n.oid, 'CREATE'))) AS schema_write,
      EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE left(n.nspname, 3) <> 'pg_' AND n.nspname <> 'information_schema' AND
        (c.relowner = r.oid OR (c.relkind IN ('r', 'p', 'v', 'm', 'f') AND
          (has_table_privilege(current_user, c.oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') OR
           has_any_column_privilege(current_user, c.oid, 'INSERT,UPDATE,REFERENCES'))) OR
          (c.relkind = 'S' AND has_sequence_privilege(current_user, c.oid, 'USAGE,UPDATE')))) AS relation_write,
      EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE left(n.nspname, 3) <> 'pg_' AND n.nspname <> 'information_schema'
        AND (p.proowner = r.oid OR has_function_privilege(current_user, p.oid, 'EXECUTE'))) AS custom_function_access,
      EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname = 'pg_catalog'
        AND p.proname IN ('lo_create', 'lo_creat', 'lo_from_bytea', 'lo_put', 'lo_unlink', 'lo_import', 'lo_export', 'lowrite', 'lo_truncate', 'lo_truncate64')
        AND has_function_privilege(current_user, p.oid, 'EXECUTE')) AS large_object_write
    FROM pg_roles r WHERE r.rolname = current_user
  `);
  if (rows.length !== 1 || Object.values(rows[0]).some((v) => v !== false)) {
    throw new Error('Archive database role is not restricted to read-only access');
  }
  // Ensure the expected restored schema exists. Failure stays a failure, never
  // an invitation to auto-create or fix tables.
  const schema = await pool.query(`SELECT c.relname, c.relkind, c.relrowsecurity
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname = ANY($1::text[])`, [Object.values(COLLECTIONS)]);
  if (schema.rows.length !== 8 || schema.rows.some((t) => t.relkind !== 'r' || t.relrowsecurity !== false)) {
    throw new Error('Archive requires all eight ordinary tables without row-level filtering');
  }
  for (const table of Object.values(COLLECTIONS)) {
    await pool.query(`SELECT id FROM public.${table} LIMIT 0`);
  }
}

export function createRecordsReader(pool) {
  return async function readRecords(collection, offset, limit) {
    const table = COLLECTIONS[collection];
    if (!Object.hasOwn(COLLECTIONS, collection)) throw new Error('Unknown collection');
    const client = await pool.connect();
    try {
      await client.query('BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY');
      await client.query("SET LOCAL statement_timeout = '5s'");
      await client.query("SET LOCAL lock_timeout = '1s'");
      await client.query('SET LOCAL row_security = off');
      // Fixed allowlisted identifiers, bound pagination, and NO removed/status
      // filters. Preserve every surviving row in the restored snapshot.
      const count = await client.query(`SELECT count(*)::text AS total FROM public.${table}`);
      const result = await client.query(`SELECT to_jsonb(t) - 'unique_code' AS record FROM public.${table} t ORDER BY id LIMIT $1 OFFSET $2`, [limit, offset]);
      await client.query('COMMIT');
      return { records: result.rows.map(({ record }) => record), total: Number(count.rows[0].total), offset, limit };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally { client.release(); }
  };
}
