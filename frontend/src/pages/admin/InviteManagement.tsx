import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Guest {
  id: string;
  name: string;
  email: string;
  relationship: string;
  sam_or_jonah: string;
  maybe: boolean;
  unique_code: string;
  invite_type: string;
  removed: boolean;
  invite_id: string | null;
  created_at: string;
}

interface InviteWithGuests {
  id: string;
  unique_code: string;
  invite_type: string;
  created_at: string;
  updated_at: string;
  guests: Guest[];
}

export default function InviteManagement() {
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const editingInviteState = useState<InviteWithGuests | null>(null);
  const setEditingInvite = editingInviteState[1];
  const [deletingInviteId, setDeletingInviteId] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const queryClient = useQueryClient();

  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8081'
    : 'https://api.samandjonah.com';

  // Fetch all invites
  const { data: invites, isLoading: invitesLoading } = useQuery<InviteWithGuests[]>({
    queryKey: ['invites'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/invites`);
      if (!response.ok) throw new Error('Failed to fetch invites');
      return response.json();
    },
  });

  // Fetch all guests without invites
  const { data: unassignedGuests } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/guests`);
      if (!response.ok) throw new Error('Failed to fetch guests');
      const allGuests: Guest[] = await response.json();
      return allGuests.filter(g => !g.removed && !g.invite_id);
    },
  });

  // Auto-suggest pairings
  const { data: suggestions, refetch: refetchSuggestions } = useQuery<Guest[][]>({
    queryKey: ['invite-suggestions'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/invites/auto-suggest`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to get suggestions');
      return response.json();
    },
    enabled: false,
  });

  // Create invite mutation
  const createInviteMutation = useMutation({
    mutationFn: async (guestIds: string[]) => {
      const inviteType = guestIds.length === 1 ? 'single' : 'couple';
      const response = await fetch(`${apiUrl}/api/admin/invites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guest_ids: guestIds, invite_type: inviteType }),
      });
      if (!response.ok) throw new Error('Failed to create invite');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setCreatingInvite(false);
      setSelectedGuestIds([]);
    },
  });

  // TODO: Wire up update invite mutation when edit UI is built
  // const updateInviteMutation = useMutation({
  //   mutationFn: async ({ id, guestIds }: { id: string; guestIds: string[] }) => {
  //     const inviteType = guestIds.length === 1 ? 'single' : 'couple';
  //     const response = await fetch(`${apiUrl}/api/admin/invites/${id}`, {
  //       method: 'PUT',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ guest_ids: guestIds, invite_type: inviteType }),
  //     });
  //     if (!response.ok) throw new Error('Failed to update invite');
  //     return response.json();
  //   },
  //   onSuccess: () => {
  //     queryClient.invalidateQueries({ queryKey: ['invites'] });
  //     queryClient.invalidateQueries({ queryKey: ['guests'] });
  //     setEditingInvite(null);
  //   },
  // });

  // Delete invite mutation
  const deleteInviteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiUrl}/api/admin/invites/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete invite');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invites'] });
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setDeletingInviteId(null);
    },
  });

  const handleCreateInvite = () => {
    if (selectedGuestIds.length === 0 || selectedGuestIds.length > 2) return;
    createInviteMutation.mutate(selectedGuestIds);
  };

  const handleAutoSuggest = async () => {
    const result = await refetchSuggestions();
    if (result.data) {
      setShowSuggestions(true);
    }
  };

  const handleApplySuggestion = (guestIds: string[]) => {
    createInviteMutation.mutate(guestIds);
  };

  const toggleGuestSelection = (guestId: string) => {
    setSelectedGuestIds(prev =>
      prev.includes(guestId)
        ? prev.filter(id => id !== guestId)
        : prev.length < 2
        ? [...prev, guestId]
        : prev
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary mb-2">Invite Management</h2>
        <p className="text-gray-600">Group guests into invites (1-2 people per invite)</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-sage">
          <div className="text-sm text-gray-600">Total Invites</div>
          <div className="text-3xl font-bold text-primary">{invites?.length || 0}</div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-rose">
          <div className="text-sm text-gray-600">Assigned Guests</div>
          <div className="text-3xl font-bold text-primary">
            {invites?.reduce((sum, inv) => sum + inv.guests.length, 0) || 0}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blush">
          <div className="text-sm text-gray-600">Unassigned Guests</div>
          <div className="text-3xl font-bold text-primary">{unassignedGuests?.length || 0}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setCreatingInvite(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-mauve transition-colors"
        >
          + Create Invite
        </button>
        <button
          onClick={handleAutoSuggest}
          className="bg-olive text-white px-4 py-2 rounded-lg hover:bg-sage transition-colors"
          disabled={!unassignedGuests || unassignedGuests.length === 0}
        >
          🤖 Auto-Suggest Pairs
        </button>
      </div>

      {/* Invites List */}
      <div className="bg-white rounded-xl shadow-md border-t-4 border-primary">
        <div className="p-6 border-b">
          <h3 className="text-xl font-display font-semibold text-primary">
            Invites ({invites?.length || 0})
          </h3>
        </div>

        {invitesLoading ? (
          <div className="p-6 text-center text-gray-600">Loading invites...</div>
        ) : invites && invites.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Guests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invites.map((invite) => (
                  <tr key={invite.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {invite.unique_code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {invite.guests.map((guest) => (
                          <div key={guest.id} className="text-sm text-gray-900">
                            {guest.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sage/20 text-olive">
                        {invite.invite_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingInvite(invite)}
                          className="text-primary hover:text-mauve font-semibold text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingInviteId(invite.id)}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">
            No invites yet. Create invites to group guests together.
          </div>
        )}
      </div>

      {/* Create Invite Modal */}
      {creatingInvite && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-primary">Create Invite</h3>
              <p className="text-sm text-gray-600 mt-2">Select 1-2 guests for this invite</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600 mb-4">
                Selected: {selectedGuestIds.length} / 2
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unassignedGuests && unassignedGuests.length > 0 ? (
                  unassignedGuests.map((guest) => (
                    <label
                      key={guest.id}
                      className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedGuestIds.includes(guest.id)
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGuestIds.includes(guest.id)}
                        onChange={() => toggleGuestSelection(guest.id)}
                        disabled={
                          !selectedGuestIds.includes(guest.id) && selectedGuestIds.length >= 2
                        }
                        className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{guest.name}</div>
                        <div className="text-sm text-gray-500">
                          {guest.relationship} • {guest.sam_or_jonah}
                        </div>
                      </div>
                    </label>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No unassigned guests available
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setCreatingInvite(false);
                  setSelectedGuestIds([]);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateInvite}
                disabled={
                  selectedGuestIds.length === 0 ||
                  selectedGuestIds.length > 2 ||
                  createInviteMutation.isPending
                }
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-mauve transition-colors disabled:opacity-50"
              >
                {createInviteMutation.isPending ? 'Creating...' : 'Create Invite'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auto-Suggest Modal */}
      {showSuggestions && suggestions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-primary">
                Suggested Invite Pairings
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Found {suggestions.length} suggested invites based on guest data
              </p>
            </div>

            <div className="p-6 space-y-3">
              {suggestions.map((guestGroup, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                >
                  <div>
                    {guestGroup.map((guest, gIdx) => (
                      <div key={guest.id} className="text-sm">
                        <span className="font-medium text-gray-900">{guest.name}</span>
                        <span className="text-gray-500"> • {guest.relationship}</span>
                        {gIdx < guestGroup.length - 1 && <span className="text-gray-400"> & </span>}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleApplySuggestion(guestGroup.map(g => g.id))}
                    className="px-3 py-1 bg-primary text-white text-sm rounded-lg hover:bg-mauve transition-colors"
                  >
                    Create
                  </button>
                </div>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowSuggestions(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingInviteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-display font-bold text-red-600 mb-4">Delete Invite</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this invite? Guests will be unassigned but not
                removed.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingInviteId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteInviteMutation.mutate(deletingInviteId)}
                  disabled={deleteInviteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteInviteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
