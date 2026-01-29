import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:8081'
  : 'https://api.samandjonah.com';

interface Guest {
  id: string;
  name: string;
  email: string;
}

interface InviteWithGuests {
  id: string;
  unique_code: string;
  invite_type: string;
  invite_sent_at: string | null;
  guests: Guest[];
}

interface SendResult {
  success: boolean;
  sent_count: number;
  errors: string[];
}

type FilterType = 'all' | 'sent' | 'unsent';

export default function InvitationSending() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lastResult, setLastResult] = useState<SendResult | null>(null);
  const queryClient = useQueryClient();

  const { data: invites, isLoading } = useQuery<InviteWithGuests[]>({
    queryKey: ['invitation-status'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/admin/invitations/status`);
      if (!res.ok) throw new Error('Failed to fetch invitation status');
      return res.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (inviteIds: string[]) => {
      const res = await fetch(`${apiUrl}/api/admin/invitations/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_ids: inviteIds }),
      });
      if (!res.ok) throw new Error('Failed to send invitations');
      return res.json() as Promise<SendResult>;
    },
    onSuccess: (result) => {
      setLastResult(result);
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['invitation-status'] });
    },
  });

  const filteredInvites = invites?.filter(inv => {
    if (filter === 'sent') return inv.invite_sent_at !== null;
    if (filter === 'unsent') return inv.invite_sent_at === null;
    return true;
  }) || [];

  const unsentInvites = invites?.filter(inv => !inv.invite_sent_at) || [];
  const sentInvites = invites?.filter(inv => inv.invite_sent_at) || [];

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAllUnsent = () => {
    setSelectedIds(new Set(unsentInvites.map(inv => inv.id)));
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleSend = () => {
    if (selectedIds.size === 0) return;
    sendMutation.mutate(Array.from(selectedIds));
  };

  const hasValidEmails = (invite: InviteWithGuests) =>
    invite.guests.some(g => g.email.includes('@') && g.email.split('@')[1]?.includes('.'));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary mb-2">Invitation Emails</h2>
        <p className="text-gray-600">Send and track wedding invitation emails with RSVP links</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-400">
          <p className="text-sm text-gray-500 uppercase tracking-wider">Total Invites</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{invites?.length ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-400">
          <p className="text-sm text-gray-500 uppercase tracking-wider">Sent</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{sentInvites.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-yellow-400">
          <p className="text-sm text-gray-500 uppercase tracking-wider">Not Yet Sent</p>
          <p className="text-3xl font-bold text-yellow-700 mt-1">{unsentInvites.length}</p>
        </div>
      </div>

      {/* Send Result */}
      {lastResult && (
        <div className={`rounded-xl p-4 ${lastResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <p className={`font-semibold ${lastResult.success ? 'text-green-800' : 'text-yellow-800'}`}>
            ✉️ Sent {lastResult.sent_count} invitation{lastResult.sent_count !== 1 ? 's' : ''}
          </p>
          {lastResult.errors.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-semibold text-red-700">Errors:</p>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {lastResult.errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-rose">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          {/* Filters */}
          <div className="flex gap-2">
            {(['all', 'unsent', 'sent'] as FilterType[]).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filter === f
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Selection & Send */}
          <div className="flex gap-3 items-center flex-wrap">
            {selectedIds.size > 0 && (
              <span className="text-sm text-gray-600">
                {selectedIds.size} selected
              </span>
            )}
            <button
              onClick={selectAllUnsent}
              disabled={unsentInvites.length === 0}
              className="px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors disabled:opacity-50"
            >
              Select All Unsent
            </button>
            {selectedIds.size > 0 && (
              <button
                onClick={clearSelection}
                className="px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={handleSend}
              disabled={selectedIds.size === 0 || sendMutation.isPending}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-mauve transition-colors disabled:opacity-50 text-sm font-semibold"
            >
              {sendMutation.isPending
                ? `Sending ${selectedIds.size}...`
                : `Send ${selectedIds.size > 0 ? selectedIds.size : ''} Invitation${selectedIds.size !== 1 ? 's' : ''}`}
            </button>
          </div>
        </div>
      </div>

      {/* Invites Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading invites...</div>
        ) : filteredInvites.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No invites found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={filteredInvites.length > 0 && filteredInvites.every(inv => selectedIds.has(inv.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(new Set(filteredInvites.map(inv => inv.id)));
                        } else {
                          clearSelection();
                        }
                      }}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guest(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email(s)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(invite.id)}
                        onChange={() => toggleSelect(invite.id)}
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {invite.guests.map(g => (
                          <div key={g.id} className="text-sm font-medium text-gray-900">{g.name}</div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {invite.guests.map(g => (
                          <div key={g.id} className="text-sm text-gray-600">
                            {g.email.includes('@') ? g.email : (
                              <span className="text-red-400 italic">No valid email</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-sage/20 text-olive">
                        {invite.invite_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                        {invite.unique_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {invite.invite_sent_at ? (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                          ✓ Sent
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                          Not sent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {hasValidEmails(invite) && (
                        <button
                          onClick={() => {
                            setSelectedIds(new Set([invite.id]));
                            sendMutation.mutate([invite.id]);
                          }}
                          disabled={sendMutation.isPending}
                          className="text-primary hover:text-mauve font-semibold text-sm disabled:opacity-50"
                        >
                          {invite.invite_sent_at ? 'Resend' : 'Send'}
                        </button>
                      )}
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
