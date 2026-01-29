import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:8081'
  : 'https://api.samandjonah.com';

interface RsvpStats {
  total_invited: number;
  total_responded: number;
  total_attending: number;
  total_declined: number;
  total_pending: number;
}

interface Guest {
  id: string;
  name: string;
  email: string;
}

interface RsvpWithGuest {
  id: string;
  guest_id: string;
  attending: boolean;
  dietary_restrictions: string | null;
  song_requests: string | null;
  message: string | null;
  submitted_at: string | null;
  guest_name: string;
  guest_email: string;
}

interface AdminRsvpEntry {
  id: string;
  unique_code: string;
  invite_type: string;
  guests: Guest[];
  rsvps: RsvpWithGuest[];
  status: string;
}

type FilterType = 'all' | 'attending' | 'declined' | 'pending' | 'partial';

export default function RsvpManagement() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery<RsvpStats>({
    queryKey: ['rsvp-stats'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/admin/rsvps/stats`);
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
  });

  const { data: rsvpEntries, isLoading: entriesLoading } = useQuery<AdminRsvpEntry[]>({
    queryKey: ['rsvp-entries'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/admin/rsvps`);
      if (!res.ok) throw new Error('Failed to fetch RSVPs');
      return res.json();
    },
  });

  const handleExport = () => {
    window.open(`${apiUrl}/api/admin/rsvps/export`, '_blank');
  };

  const filteredEntries = rsvpEntries
    ?.filter(entry => {
      if (filter === 'all') return true;
      return entry.status === filter;
    })
    .filter(entry => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return entry.guests.some(g =>
        g.name.toLowerCase().includes(search) ||
        g.email.toLowerCase().includes(search)
      ) || entry.unique_code.toLowerCase().includes(search);
    })
    .sort((a, b) => {
      // Sort: responded first, then pending
      const statusOrder: Record<string, number> = { attending: 0, partial: 1, declined: 2, pending: 3 };
      return (statusOrder[a.status] ?? 4) - (statusOrder[b.status] ?? 4);
    });

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      attending: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      partial: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-600',
    };
    const labels: Record<string, string> = {
      attending: '✓ Attending',
      declined: '✗ Declined',
      partial: '◐ Partial',
      pending: '⏳ Pending',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary mb-2">RSVP Management</h2>
        <p className="text-gray-600">Track guest responses and manage RSVPs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Invited"
          value={stats?.total_invited ?? 0}
          color="bg-blue-50 text-blue-800 border-blue-200"
          loading={statsLoading}
        />
        <StatCard
          label="Responded"
          value={stats?.total_responded ?? 0}
          color="bg-purple-50 text-purple-800 border-purple-200"
          loading={statsLoading}
        />
        <StatCard
          label="Attending"
          value={stats?.total_attending ?? 0}
          color="bg-green-50 text-green-800 border-green-200"
          loading={statsLoading}
        />
        <StatCard
          label="Declined"
          value={stats?.total_declined ?? 0}
          color="bg-red-50 text-red-800 border-red-200"
          loading={statsLoading}
        />
        <StatCard
          label="Pending"
          value={stats?.total_pending ?? 0}
          color="bg-yellow-50 text-yellow-800 border-yellow-200"
          loading={statsLoading}
        />
      </div>

      {/* Response Rate */}
      {stats && stats.total_invited > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-sage">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Response Rate</span>
            <span className="text-sm font-bold text-primary">
              {Math.round((stats.total_responded / stats.total_invited) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-sage to-primary transition-all duration-500"
              style={{ width: `${(stats.total_responded / stats.total_invited) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Filters & Actions */}
      <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-rose">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex gap-2 flex-wrap">
            {(['all', 'attending', 'declined', 'pending', 'partial'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                {f !== 'all' && rsvpEntries && (
                  <span className="ml-1 text-xs">
                    ({rsvpEntries.filter(e => e.status === f).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-3 items-center w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            />
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-sage text-olive rounded-lg hover:bg-sage/80 transition-colors text-sm font-semibold whitespace-nowrap"
            >
              📥 Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* RSVP Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {entriesLoading ? (
          <div className="p-8 text-center text-gray-500">Loading RSVPs...</div>
        ) : !filteredEntries || filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {filter === 'all' ? 'No invites found.' : `No ${filter} invites found.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dietary
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Song Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.unique_code} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {entry.guests.map(g => {
                          const rsvp = entry.rsvps.find(r => r.guest_id === g.id);
                          return (
                            <div key={g.id} className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">{g.name}</span>
                              {rsvp && (
                                <span className={`text-xs ${rsvp.attending ? 'text-green-600' : 'text-red-500'}`}>
                                  {rsvp.attending ? '✓' : '✗'}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {statusBadge(entry.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {entry.rsvps.filter(r => r.dietary_restrictions).map(r => (
                          <div key={r.id} className="text-sm text-gray-600">
                            {entry.guests.length > 1 && (
                              <span className="font-medium">{r.guest_name.split(' ')[0]}: </span>
                            )}
                            {r.dietary_restrictions}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {entry.rsvps.filter(r => r.song_requests).map(r => (
                          <div key={r.id} className="text-sm text-gray-600">
                            {entry.guests.length > 1 && (
                              <span className="font-medium">{r.guest_name.split(' ')[0]}: </span>
                            )}
                            {r.song_requests}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {entry.rsvps.filter(r => r.message).map(r => (
                          <div key={r.id} className="text-sm text-gray-600 max-w-xs truncate" title={r.message || ''}>
                            {r.message}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {entry.unique_code}
                      </code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, loading }: { label: string; value: number; color: string; loading: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${color}`}>
      <p className="text-xs font-medium uppercase tracking-wider opacity-75">{label}</p>
      <p className="text-3xl font-bold mt-1">
        {loading ? '...' : value}
      </p>
    </div>
  );
}
