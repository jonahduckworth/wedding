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
  created_at: string;
}

export default function GuestManagement() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [addingGuest, setAddingGuest] = useState(false);
  const [deletingGuestId, setDeletingGuestId] = useState<string | null>(null);
  const [showRemoved, setShowRemoved] = useState(false);
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>([]);
  const [selectedSamOrJonah, setSelectedSamOrJonah] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // API URL: use localhost in development, api subdomain in production
  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8081'
    : 'https://api.samandjonah.com';

  // Fetch guests
  const { data: guests, isLoading } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/guests`);
      if (!response.ok) throw new Error('Failed to fetch guests');
      return response.json();
    },
  });

  // Import CSV mutation
  const importMutation = useMutation({
    mutationFn: async (csvContent: string) => {
      const response = await fetch(`${apiUrl}/api/admin/guests/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: csvContent,
      });
      if (!response.ok) throw new Error('Failed to import CSV');
      return response.json();
    },
    onSuccess: (data) => {
      setImportResult(data);
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  // Create guest mutation
  const createMutation = useMutation({
    mutationFn: async (guest: Omit<Guest, 'id' | 'unique_code' | 'created_at' | 'removed'>) => {
      const response = await fetch(`${apiUrl}/api/admin/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guest),
      });
      if (!response.ok) throw new Error('Failed to create guest');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setAddingGuest(false);
    },
  });

  // Update guest mutation
  const updateMutation = useMutation({
    mutationFn: async (guest: Guest) => {
      const response = await fetch(`${apiUrl}/api/admin/guests/${guest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: guest.name,
          email: guest.email,
          relationship: guest.relationship,
          sam_or_jonah: guest.sam_or_jonah,
          maybe: guest.maybe,
          invite_type: guest.invite_type,
        }),
      });
      if (!response.ok) throw new Error('Failed to update guest');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setEditingGuest(null);
    },
  });

  // Delete guest mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiUrl}/api/admin/guests/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete guest');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setDeletingGuestId(null);
    },
  });

  // Mark guest as removed mutation
  const markRemovedMutation = useMutation({
    mutationFn: async ({ id, removed }: { id: string; removed: boolean }) => {
      const response = await fetch(`${apiUrl}/api/admin/guests/${id}/removed`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ removed }),
      });
      if (!response.ok) throw new Error('Failed to update guest');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvContent = e.target?.result as string;
      importMutation.mutate(csvContent);
    };
    reader.readAsText(importFile);
  };

  // Get unique values for filters
  const relationships = Array.from(new Set(guests?.map(g => g.relationship) || []));
  const samOrJonahOptions = Array.from(new Set(guests?.map(g => g.sam_or_jonah) || []));

  // Filter and sort guests
  const filteredAndSortedGuests = guests
    ?.filter(g => showRemoved || !g.removed)
    .filter(g => selectedRelationships.length === 0 || selectedRelationships.includes(g.relationship))
    .filter(g => selectedSamOrJonah.length === 0 || selectedSamOrJonah.includes(g.sam_or_jonah))
    .sort((a, b) => a.name.localeCompare(b.name)) || [];

  const toggleRelationship = (relationship: string) => {
    setSelectedRelationships(prev =>
      prev.includes(relationship)
        ? prev.filter(r => r !== relationship)
        : [...prev, relationship]
    );
  };

  const toggleSamOrJonah = (value: string) => {
    setSelectedSamOrJonah(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary mb-2">Guest Management</h2>
        <p className="text-gray-600">Manage your wedding guest list</p>
      </div>

      {/* CSV Import Section */}
      <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-sage">
        <h3 className="text-xl font-display font-semibold text-primary mb-4">Import from CSV</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a CSV file with columns: Name, Relationship, Sam/Jonah, Maybe
        </p>

        <div className="space-y-4">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-600
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-white
                hover:file:bg-mauve file:cursor-pointer"
            />
          </div>

          {importFile && (
            <button
              onClick={handleImport}
              disabled={importMutation.isPending}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-mauve transition-colors disabled:opacity-50"
            >
              {importMutation.isPending ? 'Importing...' : 'Import Guests'}
            </button>
          )}

          {importResult && (
            <div className={`p-4 rounded-lg ${importResult.success ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className={`font-semibold ${importResult.success ? 'text-green-800' : 'text-yellow-800'}`}>
                Imported {importResult.imported_count} guests
              </p>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold text-red-700">Errors:</p>
                  <ul className="text-sm text-red-600 list-disc list-inside">
                    {importResult.errors.map((error: string, idx: number) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Guest List */}
      <div className="bg-white rounded-xl shadow-md border-t-4 border-rose">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-display font-semibold text-primary">
                Guest List ({filteredAndSortedGuests.length})
              </h3>
            </div>
            <div className="flex gap-3 items-center">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={showRemoved}
                  onChange={(e) => setShowRemoved(e.target.checked)}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                Show removed
              </label>
              <button
                onClick={() => setAddingGuest(true)}
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-mauve transition-colors"
              >
                + Add Guest
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-6 flex-wrap">
            {/* Relationship Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
              <div className="flex gap-2 flex-wrap">
                {relationships.map(rel => (
                  <button
                    key={rel}
                    onClick={() => toggleRelationship(rel)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                      selectedRelationships.includes(rel)
                        ? 'bg-sage text-olive'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>

            {/* Sam/Jonah Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sam/Jonah</label>
              <div className="flex gap-2 flex-wrap">
                {samOrJonahOptions.map(option => (
                  <button
                    key={option}
                    onClick={() => toggleSamOrJonah(option)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                      selectedSamOrJonah.includes(option)
                        ? 'bg-rose text-mauve'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedRelationships.length > 0 || selectedSamOrJonah.length > 0) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedRelationships([]);
                    setSelectedSamOrJonah([]);
                  }}
                  className="px-3 py-1 text-sm text-red-600 hover:text-red-800 font-semibold"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-gray-600">Loading guests...</div>
        ) : guests && guests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Relationship
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sam/Jonah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    RSVP Code
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
                {filteredAndSortedGuests.map((guest) => (
                  <tr key={guest.id} className={`hover:bg-gray-50 ${guest.removed ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{guest.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{guest.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-sage/20 text-olive">
                        {guest.relationship}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-rose/20 text-mauve">
                        {guest.sam_or_jonah}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {guest.unique_code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {guest.removed ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                          Removed
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingGuest(guest)}
                          className="text-primary hover:text-mauve font-semibold text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => markRemovedMutation.mutate({ id: guest.id, removed: !guest.removed })}
                          className="text-yellow-600 hover:text-yellow-800 font-semibold text-sm"
                        >
                          {guest.removed ? 'Restore' : 'Remove'}
                        </button>
                        <button
                          onClick={() => setDeletingGuestId(guest.id)}
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
            No guests yet. Import a CSV file or add a guest to get started.
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-primary">Edit Guest</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={editingGuest.name}
                  onChange={(e) => setEditingGuest({ ...editingGuest, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={editingGuest.email}
                  onChange={(e) => setEditingGuest({ ...editingGuest, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="guest@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship</label>
                <select
                  value={editingGuest.relationship}
                  onChange={(e) => setEditingGuest({ ...editingGuest, relationship: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Friend">Friend</option>
                  <option value="Family">Family</option>
                  <option value="+1">+1</option>
                  <option value="1">1</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sam/Jonah</label>
                <select
                  value={editingGuest.sam_or_jonah}
                  onChange={(e) => setEditingGuest({ ...editingGuest, sam_or_jonah: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Sam">Sam</option>
                  <option value="Jonah">Jonah</option>
                  <option value="Both">Both</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invite Type</label>
                <select
                  value={editingGuest.invite_type}
                  onChange={(e) => setEditingGuest({ ...editingGuest, invite_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="single">Single</option>
                  <option value="couple">Couple</option>
                  <option value="plus_one">Plus One</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maybe"
                  checked={editingGuest.maybe}
                  onChange={(e) => setEditingGuest({ ...editingGuest, maybe: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="maybe" className="ml-2 text-sm text-gray-700">Maybe</label>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>RSVP Code:</strong> <code className="font-mono bg-white px-2 py-1 rounded">{editingGuest.unique_code}</code>
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setEditingGuest(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => updateMutation.mutate(editingGuest)}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-mauve transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Guest Modal */}
      {addingGuest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-primary">Add New Guest</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createMutation.mutate({
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                  relationship: formData.get('relationship') as string,
                  sam_or_jonah: formData.get('sam_or_jonah') as string,
                  maybe: formData.get('maybe') === 'on',
                  invite_type: formData.get('invite_type') as string,
                });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="guest@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Relationship *</label>
                <select
                  name="relationship"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Friend">Friend</option>
                  <option value="Family">Family</option>
                  <option value="+1">+1</option>
                  <option value="1">1</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sam/Jonah *</label>
                <select
                  name="sam_or_jonah"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Sam">Sam</option>
                  <option value="Jonah">Jonah</option>
                  <option value="Both">Both</option>
                  <option value="Maybe">Maybe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Invite Type *</label>
                <select
                  name="invite_type"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="single">Single</option>
                  <option value="couple">Couple</option>
                  <option value="plus_one">Plus One</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="maybe"
                  id="add-maybe"
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="add-maybe" className="ml-2 text-sm text-gray-700">Maybe</label>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddingGuest(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-mauve transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Adding...' : 'Add Guest'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGuestId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-display font-bold text-red-600 mb-4">Delete Guest</h3>
              <p className="text-gray-700 mb-6">
                Are you sure you want to permanently delete this guest? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingGuestId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteMutation.mutate(deletingGuestId)}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
