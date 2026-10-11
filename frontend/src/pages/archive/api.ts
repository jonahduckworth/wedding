export const collections = ['guests', 'invites', 'rsvps', 'categories', 'items', 'contributions', 'campaigns', 'sends'] as const;
export type Collection = typeof collections[number];
export type ArchiveRecord = Record<string, unknown>;
export type Session = { user: { name: string }; csrfToken: string };
export type RecordPage = { records: ArchiveRecord[]; total: number; offset: number; limit: number };
export const PAGE_SIZE = 100;

export class SessionExpired extends Error {}

// These are the only frontend API calls. The server authorizes every request.
async function request(path: string, options: RequestInit = {}): Promise<unknown> {
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort, { once: true });
  if (options.signal?.aborted) controller.abort();
  // A stalled session check must not leave private records visible indefinitely.
  const timer = window.setTimeout(abort, 15_000);
  try {
    const response = await fetch(`/api/archive/${path}`, {
      ...options,
      signal: controller.signal,
      credentials: 'same-origin',
      cache: 'no-store',
      redirect: 'error',
      headers: { Accept: 'application/json', ...options.headers },
    });
    // A logout CSRF rejection does not prove that the server session ended.
    if (response.status === 401 || (response.status === 403 && path !== 'logout')) throw new SessionExpired();
    if (!response.ok) throw new Error(response.status === 429
      ? 'Too many attempts. Please wait before trying again.'
      : 'The archive is unavailable. Please try again.');
    return response.status === 204 ? undefined : await response.json();
  } finally {
    window.clearTimeout(timer);
    options.signal?.removeEventListener('abort', abort);
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseSession(value: unknown): Session {
  if (!isObject(value) || !isObject(value.user) || typeof value.user.name !== 'string' ||
      typeof value.csrfToken !== 'string' || !value.csrfToken) {
    throw new Error('The archive returned an invalid session. Please try again.');
  }
  return { user: { name: value.user.name }, csrfToken: value.csrfToken };
}

export async function getSession(signal: AbortSignal): Promise<Session> {
  return parseSession(await request('session', { signal }));
}

export async function login(email: string, password: string, signal: AbortSignal): Promise<Session> {
  return parseSession(await request('login', {
    method: 'POST', signal, headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  }));
}

export async function logout(csrfToken: string, signal: AbortSignal): Promise<void> {
  await request('logout', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
    body: '{}',
  });
}

export async function getRecords(collection: Collection, offset: number, signal: AbortSignal): Promise<RecordPage> {
  const value = await request(`records/${collection}?offset=${offset}&limit=${PAGE_SIZE}`, { signal });
  if (!isObject(value) || !Array.isArray(value.records) || !value.records.every(isObject) ||
      !Number.isSafeInteger(value.total) || (value.total as number) < 0 ||
      value.offset !== offset || value.limit !== PAGE_SIZE || value.records.length > PAGE_SIZE) {
    throw new Error('The archive returned an invalid record page. Please try again.');
  }
  return value as RecordPage;
}

export function errorMessage(error: unknown): string {
  if (error instanceof Error && (error.message.startsWith('The archive') ||
      error.message.startsWith('Too many attempts'))) return error.message;
  return 'Unable to reach the archive. Please try again.';
}
