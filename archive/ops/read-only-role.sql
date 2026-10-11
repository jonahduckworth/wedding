-- REVIEW TEMPLATE ONLY. NOT loaded by startup, Dockerfile, or tests.
-- Run only against a dedicated, verified RESTORED ARCHIVE database after
-- explicit provisioning approval. Never run against the live source database.
-- psql variables: archive_database (exact restored DB name).
-- A new NOLOGIN role is intentional; enabling login and entering a strong
-- password is a later secure, user-controlled credential setup.
\set ON_ERROR_STOP on
SELECT current_database() = :'archive_database' AS correct_database \gset
\if :correct_database
\else
  \echo Wrong database connection. No changes made.
  \quit
\endif
BEGIN;
CREATE ROLE wedding_archive_reader NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS;
REVOKE ALL ON DATABASE :"archive_database" FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL PROCEDURES IN SCHEMA public FROM PUBLIC;
-- PostgreSQL large-object functions write through SELECT and ordinarily have
-- PUBLIC EXECUTE. Restrict them inside this dedicated restored database too.
SELECT format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC;', p.oid::regprocedure)
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'pg_catalog'
  AND p.proname IN ('lo_create', 'lo_creat', 'lo_from_bytea', 'lo_put', 'lo_unlink', 'lo_import', 'lo_export', 'lowrite', 'lo_truncate', 'lo_truncate64')
\gexec
GRANT CONNECT ON DATABASE :"archive_database" TO wedding_archive_reader;
GRANT USAGE ON SCHEMA public TO wedding_archive_reader;
GRANT SELECT ON public.guests, public.invites, public.rsvps,
  public.honeymoon_categories, public.honeymoon_items,
  public.registry_contributions, public.email_campaigns, public.email_sends
  TO wedding_archive_reader;
ALTER ROLE wedding_archive_reader SET default_transaction_read_only = on;
ALTER ROLE wedding_archive_reader SET statement_timeout = '5s';
ALTER ROLE wedding_archive_reader SET lock_timeout = '1s';
COMMIT;
-- Do not grant role memberships, TEMP, CREATE, table/column writes,
-- sequence USAGE/UPDATE, or custom function EXECUTE to this runtime role.
-- Keep the restoring/owner role entirely separate and out of runtime secrets.
