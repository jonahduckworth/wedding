import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArchiveRecord, Collection, collections, errorMessage, getRecords, PAGE_SIZE, RecordPage, SessionExpired } from './api';

type LoadState = { status: 'loading' } | { status: 'error'; message: string } | { status: 'ready'; page: RecordPage };

function parseIndex(value: string): number | null {
  if (!/^(0|[1-9]\d*)$/.test(value)) return null;
  const index = Number(value);
  return Number.isSafeInteger(index) && index <= Number.MAX_SAFE_INTEGER - PAGE_SIZE ? index : null;
}

export default function Records({ onSessionExpired }: { onSessionExpired: () => void }) {
  const { collection, row } = useParams();
  const [search] = useSearchParams();
  const rowIndex = row === undefined ? undefined : parseIndex(row);
  const offset = rowIndex === undefined ? parseIndex(search.get('offset') ?? '0')
    : rowIndex === null ? null : Math.floor(rowIndex / PAGE_SIZE) * PAGE_SIZE;
  if (!collections.includes(collection as Collection) || offset === null || offset % PAGE_SIZE !== 0 || rowIndex === null) {
    return <div role="alert"><h1>Page not found</h1><p>This is not a valid archive collection or record page.</p><Link to="/admin">Back to overview</Link></div>;
  }
  return <RecordView key={`${collection}:${offset}:${row ?? 'list'}`} collection={collection as Collection} offset={offset} row={rowIndex} onSessionExpired={onSessionExpired} />;
}

function RecordView({ collection, offset, row, onSessionExpired }: {
  collection: Collection; offset: number; row?: number; onSessionExpired: () => void;
}) {
  const [state, setState] = useState<LoadState>({ status: 'loading' });
  const [revision, setRevision] = useState(0);
  const title = collection === 'rsvps' ? 'RSVPs' : collection.charAt(0).toUpperCase() + collection.slice(1);
  const listPath = `/admin/${collection}?offset=${offset}`;

  useEffect(() => {
    const controller = new AbortController();
    getRecords(collection, offset, controller.signal).then(page => {
      if (!controller.signal.aborted) setState({ status: 'ready', page });
    }).catch(error => {
      if (controller.signal.aborted) return;
      if (error instanceof SessionExpired) onSessionExpired();
      else setState({ status: 'error', message: errorMessage(error) });
    });
    return () => controller.abort();
  }, [collection, offset, revision, onSessionExpired]);

  const reload = () => { setState({ status: 'loading' }); setRevision(value => value + 1); };
  return <section aria-busy={state.status === 'loading'}>
    <p className="archive-eyebrow">Read-only history</p>
    <div className="archive-title-row">
      <h1>{title}{row !== undefined ? ' · Record detail' : ''}</h1>
      <button onClick={reload} disabled={state.status === 'loading'}>Refresh</button>
    </div>
    {row !== undefined && <Link to={listPath}>← Back to {title.toLowerCase()}</Link>}
    {state.status === 'loading' && <p role="status">Loading {title.toLowerCase()}…</p>}
    {state.status === 'error' && <div className="archive-notice archive-error" role="alert">
      <p>{state.message}</p><button onClick={reload}>Retry records</button>
    </div>}
    {state.status === 'ready' && (row === undefined ? <RecordTable collection={collection} page={state.page} />
      : <RecordDetail record={state.page.records[row - offset]} />)}
  </section>;
}

function RecordTable({ collection, page }: { collection: Collection; page: RecordPage }) {
  const columns = [...new Set(page.records.flatMap(record => Object.keys(record)))].slice(0, 6);
  return <>
    <p className="archive-count">{page.total.toLocaleString()} saved {page.total === 1 ? 'record' : 'records'}
      {page.records.length > 0 && ` · Showing ${page.offset + 1}–${page.offset + page.records.length}`}
    </p>
    {page.records.length === 0 ? <div className="archive-notice" role="status">
      <h2>{page.total === 0 ? 'No saved records' : 'No records on this page'}</h2>
      <p>{page.total === 0 ? 'This collection is empty in the archive.' : 'Return to the first page to browse this collection.'}</p>
      {page.offset > 0 && <Link to={`/admin/${collection}`}>First page</Link>}
    </div> : <>
      <p className="archive-hint">The table previews up to six fields. Open a record for its complete saved JSON. Image URLs and HTML are shown as text only.</p>
      <div className="archive-table-scroll" tabIndex={0} role="region" aria-label={`${collection} history table`}>
        <table>
          <caption className="archive-sr-only">Saved {collection} records</caption>
          <thead><tr><th scope="col">Record</th>{columns.map(column => <th key={column} scope="col">{column.replace(/_/g, ' ')}</th>)}</tr></thead>
          <tbody>{page.records.map((record, index) => <tr key={index}>
            <th scope="row"><Link to={`/admin/${collection}/${page.offset + index}`}>View {page.offset + index + 1}</Link></th>
            {columns.map(column => <td key={column}>{preview(record[column])}</td>)}
          </tr>)}</tbody>
        </table>
      </div>
    </>}
    <nav className="archive-pagination" aria-label="Record pages">
      {page.offset > 0 && <Link to={`/admin/${collection}?offset=${Math.max(0, page.offset - PAGE_SIZE)}`}>← Previous 100</Link>}
      {page.offset + PAGE_SIZE < page.total && <Link to={`/admin/${collection}?offset=${page.offset + PAGE_SIZE}`}>Next 100 →</Link>}
    </nav>
  </>;
}

function preview(value: unknown): string {
  if (value === undefined || value === null) return '—';
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > 160 ? `${text.slice(0, 160)}…` : text;
}

function RecordDetail({ record }: { record?: ArchiveRecord }) {
  if (!record) return <p role="status">This record is not present in the archive.</p>;
  return <>
    <p className="archive-hint">Complete saved JSON. Content is inert text; private images and email HTML are never loaded or rendered.</p>
    <pre className="archive-json" tabIndex={0} aria-label="Saved record JSON">{JSON.stringify(record, null, 2)}</pre>
  </>;
}
