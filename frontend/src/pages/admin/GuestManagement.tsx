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
  created_at: string;
}

export default function GuestManagement() {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any>(null);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const queryClient = useQueryClient();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8081';

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
          <h3 className="text-xl font-display font-semibold text-primary">
            Guest List ({guests?.length || 0})
          </h3>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {guests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-gray-50">
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
                      <button
                        onClick={() => setEditingGuest(guest)}
                        className="text-primary hover:text-mauve font-semibold text-sm"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-600">
            No guests yet. Import a CSV file to get started.
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
    </div>
  );
}
