import { useState, useEffect, ReactNode } from 'react';

interface AdminAuthProps {
  children: ReactNode;
}

const ADMIN_USERS = [
  { username: 'jonah', password: 'poo' },
  { username: 'sam', password: 'poo' },
];

const SESSION_KEY = 'wedding_admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getSession(): { user: string; expires: number } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (Date.now() > session.expires) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function useAdminUser(): string | null {
  const session = getSession();
  return session?.user ?? null;
}

export function adminLogout() {
  sessionStorage.removeItem(SESSION_KEY);
  window.location.reload();
}

export default function AdminAuth({ children }: AdminAuthProps) {
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (Date.now() < lockedUntil) {
      const seconds = Math.ceil((lockedUntil - Date.now()) / 1000);
      setError(`Too many attempts. Try again in ${seconds}s.`);
      return;
    }

    const user = ADMIN_USERS.find(
      u => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (user) {
      const session = {
        user: user.username.toLowerCase(),
        expires: Date.now() + SESSION_DURATION,
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      setAuthenticated(true);
      setAttempts(0);
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= 5) {
        setLockedUntil(Date.now() + 30000); // 30s lockout
        setError('Too many attempts. Try again in 30 seconds.');
        setAttempts(0);
      } else {
        setError('Invalid username or password');
      }
    }
  };

  if (authenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-display font-bold text-gray-800">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">Sam & Jonah's Wedding</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 outline-none"
              autoFocus
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-300 focus:border-rose-300 outline-none"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</p>
          )}

          <button
            type="submit"
            disabled={Date.now() < lockedUntil}
            className="w-full py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 font-medium"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
