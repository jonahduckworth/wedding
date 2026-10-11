import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { collections, errorMessage, getSession, login, logout, Session, SessionExpired } from './api';
import Records from './Records';
import './archive.css';

type AuthState =
  | { status: 'checking' | 'login' | 'error'; message?: string }
  | { status: 'authenticated'; session: Session }
  | { status: 'signing-out' | 'logout-error'; csrfToken: string };

export default function ArchiveAdmin() {
  const [auth, setAuth] = useState<AuthState>({ status: 'checking' });
  const requestRef = useRef<AbortController | null>(null);

  const newRequest = useCallback(() => {
    requestRef.current?.abort();
    const controller = new AbortController();
    requestRef.current = controller;
    return controller;
  }, []);

  const checkSession = useCallback(async (clearRecords = true) => {
    const controller = newRequest();
    // Initial validation clears the page; background validation must not remount
    // record views, because rereading records would extend an idle session.
    if (clearRecords) setAuth({ status: 'checking' });
    try {
      const session = await getSession(controller.signal);
      if (!controller.signal.aborted) setAuth({ status: 'authenticated', session });
    } catch (error) {
      if (!controller.signal.aborted) setAuth(error instanceof SessionExpired
        ? { status: 'login' }
        : { status: 'error', message: errorMessage(error) });
    }
  }, [newRequest]);

  const expireSession = useCallback(() => {
    requestRef.current?.abort();
    setAuth({ status: 'login', message: 'Your session ended. Sign in again to view the archive.' });
  }, []);

  useEffect(() => {
    void checkSession();
    return () => requestRef.current?.abort();
  }, [checkSession]);

  useEffect(() => {
    if (auth.status !== 'authenticated') return;
    const recheck = () => { if (document.visibilityState === 'visible') void checkSession(false); };
    window.addEventListener('focus', recheck);
    document.addEventListener('visibilitychange', recheck);
    // Expired sessions are cleared even if no collection navigation occurs.
    const timer = window.setInterval(recheck, 60_000);
    return () => {
      window.removeEventListener('focus', recheck);
      document.removeEventListener('visibilitychange', recheck);
      window.clearInterval(timer);
    };
  }, [auth.status, checkSession]);

  const signOut = async (csrfToken: string) => {
    const controller = newRequest();
    setAuth({ status: 'signing-out', csrfToken });
    try {
      await logout(csrfToken, controller.signal);
      if (!controller.signal.aborted) setAuth({ status: 'login', message: 'You have signed out.' });
    } catch (error) {
      if (!controller.signal.aborted) setAuth(error instanceof SessionExpired
        ? { status: 'login', message: 'Your session has ended.' }
        : { status: 'logout-error', csrfToken });
    }
  };

  return (
    <div className="archive-shell">
      <header className="archive-header">
        <div>
          <Link to="/" className="archive-brand">Sam &amp; Jonah</Link>
          <p>Private wedding archive · Read only</p>
        </div>
        {auth.status === 'authenticated' && (
          <div className="archive-account">
            <span>Signed in as {auth.session.user.name}</span>
            <button type="button" onClick={() => void signOut(auth.session.csrfToken)}>Sign out</button>
          </div>
        )}
      </header>
      {auth.status === 'authenticated' ? (
        <div className="archive-workspace">
          <nav className="archive-nav" aria-label="Archive collections">
            <NavLink end to="/admin">Overview</NavLink>
            {collections.map(collection => <NavLink key={collection} to={`/admin/${collection}`}>{label(collection)}</NavLink>)}
          </nav>
          <main className="archive-main">
            <Routes>
              <Route index element={<Overview />} />
              <Route path=":collection" element={<Records onSessionExpired={expireSession} />} />
              <Route path=":collection/:row" element={<Records onSessionExpired={expireSession} />} />
              <Route path="*" element={<p>This archive page does not exist. <Link to="/admin">Back to overview</Link></p>} />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="archive-auth">
          {auth.status === 'checking' && <p role="status">Checking your session…</p>}
          {auth.status === 'error' && <div role="alert"><p>{auth.message}</p><button onClick={() => void checkSession()}>Retry connection</button></div>}
          {auth.status === 'login' && <LoginForm message={auth.message} newRequest={newRequest} onSession={session => setAuth({ status: 'authenticated', session })} />}
          {auth.status === 'signing-out' && <p role="status">Signing out…</p>}
          {auth.status === 'logout-error' && <div role="alert">
            <h1>Sign-out could not be confirmed</h1>
            <p>Private records have been cleared from this page. Please retry to end the server session.</p>
            <button onClick={() => void signOut(auth.csrfToken)}>Retry sign out</button>
          </div>}
        </main>
      )}
    </div>
  );
}

function LoginForm({ message, newRequest, onSession }: {
  message?: string;
  newRequest: () => AbortController;
  onSession: (session: Session) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const busyRef = useRef(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busyRef.current) return;
    busyRef.current = true;
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get('email') ?? '').trim();
    const passwordInput = form.elements.namedItem('password') as HTMLInputElement;
    const password = String(data.get('password') ?? '');
    const controller = newRequest();
    setBusy(true);
    setError('');
    // Do not retain the submitted password in component state or browser storage.
    passwordInput.value = '';
    data.delete('password');
    try {
      const session = await login(email, password, controller.signal);
      if (!controller.signal.aborted) onSession(session);
    } catch (failure) {
      if (!controller.signal.aborted) setError(failure instanceof SessionExpired
        ? 'Unable to sign in with those details.' : errorMessage(failure));
    } finally {
      if (!controller.signal.aborted) { setBusy(false); busyRef.current = false; }
    }
  };

  return <div>
    <p className="archive-eyebrow">Private history</p>
    <h1>Archive sign in</h1>
    <p>Use your archive account to view saved wedding records.</p>
    {message && <p role="status">{message}</p>}
    {error && <p className="archive-error" role="alert">{error}</p>}
    <form onSubmit={event => void submit(event)}>
      <label htmlFor="archive-email">Email</label>
      <input id="archive-email" type="email" name="email" autoComplete="username" required disabled={busy} />
      <label htmlFor="archive-password">Password</label>
      <input id="archive-password" type="password" name="password" autoComplete="current-password" required disabled={busy} />
      <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
    <Link to="/">Return to the wedding archive</Link>
  </div>;
}

function label(value: string): string {
  return value === 'rsvps' ? 'RSVPs' : value.charAt(0).toUpperCase() + value.slice(1);
}

function Overview() {
  return <>
    <p className="archive-eyebrow">August 15, 2026</p>
    <h1>Wedding history</h1>
    <p>This private archive preserves the wedding records as they were saved. Choose a collection to browse its history and complete record details.</p>
    <p className="archive-notice">Read only. Invitations, reminders, RSVP edits, registry contributions, and other changes are closed.</p>
    <div className="archive-cards">
      {collections.map(collection => <Link key={collection} to={`/admin/${collection}`}>
        <h2>{label(collection)}</h2><span>View saved records →</span>
      </Link>)}
    </div>
  </>;
}
