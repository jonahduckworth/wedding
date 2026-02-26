import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface HoneymoonCategory {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

interface HoneymoonItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  total_contributed: string;
  is_fully_funded: boolean;
  display_order: number;
  created_at: string;
}

interface RegistryContribution {
  id: string;
  item_id: string | null;
  contributor_name: string | null;
  contributor_email: string | null;
  amount: string;
  status: string;
  is_anonymous: boolean;
  message: string | null;
  purpose: string | null;
  confirmed_at: string | null;
  created_at: string;
}

interface RegistryStats {
  total_confirmed: string;
  total_pending: string;
  contribution_count: number;
  item_count: number;
}

type Tab = 'categories' | 'items' | 'contributions';

export default function RegistryManagement() {
  const [activeTab, setActiveTab] = useState<Tab>('items');

  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8081'
    : 'https://api.samandjonah.com';

  // Fetch stats
  const { data: stats } = useQuery<RegistryStats>({
    queryKey: ['registry-stats'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/registry/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Registry Management</h2>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Confirmed</h3>
          <p className="text-2xl font-bold text-green-600">
            ${stats ? parseFloat(stats.total_confirmed).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-amber-600">
            ${stats ? parseFloat(stats.total_pending).toFixed(2) : '0.00'}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Contributions</h3>
          <p className="text-2xl font-bold text-primary">{stats?.contribution_count ?? 0}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-500">Registry Items</h3>
          <p className="text-2xl font-bold text-primary">{stats?.item_count ?? 0}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['categories', 'items', 'contributions'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'categories' && <CategoriesTab apiUrl={apiUrl} />}
      {activeTab === 'items' && <ItemsTab apiUrl={apiUrl} />}
      {activeTab === 'contributions' && <ContributionsTab apiUrl={apiUrl} />}
    </div>
  );
}

// Categories Tab
function CategoriesTab({ apiUrl }: { apiUrl: string }) {
  const [editingCategory, setEditingCategory] = useState<HoneymoonCategory | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryOrder, setNewCategoryOrder] = useState(0);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery<HoneymoonCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/registry/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; display_order: number }) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setNewCategoryName('');
      setNewCategoryOrder(0);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string; name: string; display_order: number }) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/categories/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, display_order: data.display_order }),
      });
      if (!response.ok) throw new Error('Failed to update category');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingCategory(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/categories/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete category');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Add Category Form */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold mb-3">Add Category</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Category name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            value={newCategoryOrder}
            onChange={(e) => setNewCategoryOrder(parseInt(e.target.value) || 0)}
            placeholder="Order"
            className="w-20 px-3 py-2 border border-gray-300 rounded-md"
          />
          <button
            onClick={() => createMutation.mutate({ name: newCategoryName, display_order: newCategoryOrder })}
            disabled={!newCategoryName || createMutation.isPending}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : categories?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No categories yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Order</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories?.map((category) => (
                <tr key={category.id}>
                  <td className="px-4 py-3">
                    {editingCategory?.id === category.id ? (
                      <input
                        type="text"
                        value={editingCategory.name}
                        onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      category.name
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingCategory?.id === category.id ? (
                      <input
                        type="number"
                        value={editingCategory.display_order}
                        onChange={(e) => setEditingCategory({ ...editingCategory, display_order: parseInt(e.target.value) || 0 })}
                        className="w-20 px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      category.display_order
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {editingCategory?.id === category.id ? (
                      <>
                        <button
                          onClick={() => updateMutation.mutate({
                            id: editingCategory.id,
                            name: editingCategory.name,
                            display_order: editingCategory.display_order,
                          })}
                          className="text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingCategory(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingCategory(category)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this category?')) {
                              deleteMutation.mutate(category.id);
                            }
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// Items Tab
function ItemsTab({ apiUrl }: { apiUrl: string }) {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<HoneymoonItem | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    name: '',
    description: '',
    price: '',
    display_order: 0,
  });
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<HoneymoonCategory[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/registry/categories`);
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const { data: items, isLoading } = useQuery<HoneymoonItem[]>({
    queryKey: ['admin-items'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/registry/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          category_id: data.category_id || null,
          price: data.price,
        }),
      });
      if (!response.ok) throw new Error('Failed to create item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { id: string } & typeof formData) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/items/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: data.category_id || null,
          name: data.name,
          description: data.description || null,
          price: data.price,
          display_order: data.display_order,
        }),
      });
      if (!response.ok) throw new Error('Failed to update item');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData();
      formData.append('image', file);
      const response = await fetch(`${apiUrl}/api/admin/registry/items/${id}/image`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
    },
  });

  const resetForm = () => {
    setFormData({ category_id: '', name: '', description: '', price: '', display_order: 0 });
    setShowForm(false);
    setEditingItem(null);
  };

  const handleEdit = (item: HoneymoonItem) => {
    setEditingItem(item);
    setFormData({
      category_id: item.category_id || '',
      name: item.name,
      description: item.description || '',
      price: item.price,
      display_order: item.display_order,
    });
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = (item: HoneymoonItem, file: File) => {
    uploadImageMutation.mutate({ id: item.id, file });
  };

  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return 'Uncategorized';
    return categories?.find(c => c.id === categoryId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      {showForm ? (
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold mb-3">{editingItem ? 'Edit Item' : 'Add Item'}</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">No Category</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (CAD)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.price}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50"
              >
                {editingItem ? 'Update' : 'Add'} Item
              </button>
              <button
                onClick={resetForm}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          + Add Item
        </button>
      )}

      {/* Items List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : items?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No items yet</div>
        ) : (
          <div className="grid gap-4 p-4">
            {items?.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg">
                {/* Image */}
                <div className="w-32 h-24 flex-shrink-0">
                  {item.image_url ? (
                    <img
                      src={`${apiUrl}${item.image_url}`}
                      alt={item.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No image</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-500">{getCategoryName(item.category_id)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${parseFloat(item.price).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">
                        ${parseFloat(item.total_contributed).toFixed(2)} raised
                      </p>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                  )}
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <label className="text-sm text-green-600 hover:text-green-800 cursor-pointer">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(item, file);
                        }}
                      />
                    </label>
                    <button
                      onClick={() => {
                        if (confirm('Delete this item?')) {
                          deleteMutation.mutate(item.id);
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="w-24 flex-shrink-0">
                  {item.is_fully_funded ? (
                    <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                      Fully Funded
                    </span>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm font-medium">
                        {Math.round((parseFloat(item.total_contributed) / parseFloat(item.price)) * 100)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${Math.min((parseFloat(item.total_contributed) / parseFloat(item.price)) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Contributions Tab
function ContributionsTab({ apiUrl }: { apiUrl: string }) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  const { data: contributions, isLoading } = useQuery<RegistryContribution[]>({
    queryKey: ['admin-contributions'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/registry/contributions`);
      if (!response.ok) throw new Error('Failed to fetch contributions');
      return response.json();
    },
  });

  const { data: items } = useQuery<HoneymoonItem[]>({
    queryKey: ['admin-items'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/registry/items`);
      if (!response.ok) throw new Error('Failed to fetch items');
      return response.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/contributions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update contribution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`${apiUrl}/api/admin/registry/contributions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete contribution');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-contributions'] });
      queryClient.invalidateQueries({ queryKey: ['admin-items'] });
      queryClient.invalidateQueries({ queryKey: ['registry-stats'] });
    },
  });

  const getItemName = (itemId: string | null) => {
    if (!itemId) return 'General Contribution';
    return items?.find(i => i.id === itemId)?.name || 'Unknown Item';
  };

  const filteredContributions = contributions?.filter(c =>
    statusFilter === 'all' || c.status === statusFilter
  );

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Contributions List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading...</div>
        ) : filteredContributions?.length === 0 ? (
          <div className="p-4 text-center text-gray-500">No contributions yet</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Contributor</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Item/Purpose</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredContributions?.map((contribution) => (
                <tr key={contribution.id} className={contribution.status === 'pending' ? 'bg-amber-50' : ''}>
                  <td className="px-4 py-3 text-sm">
                    {new Date(contribution.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">
                        {contribution.contributor_name || 'Anonymous'}
                        {contribution.is_anonymous && (
                          <span className="ml-1 text-xs text-gray-500">(anon display)</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">{contribution.contributor_email}</p>
                      {contribution.message && (
                        <p className="text-sm text-gray-600 italic mt-1">"{contribution.message}"</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{getItemName(contribution.item_id)}</p>
                    {contribution.purpose && (
                      <p className="text-sm text-gray-500">For: {contribution.purpose}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ${parseFloat(contribution.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded ${
                      contribution.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      contribution.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {contribution.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    {contribution.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateMutation.mutate({ id: contribution.id, status: 'confirmed' })}
                          className="text-green-600 hover:text-green-800"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => updateMutation.mutate({ id: contribution.id, status: 'rejected' })}
                          className="text-red-600 hover:text-red-800"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {contribution.status === 'confirmed' && (
                      <button
                        onClick={() => updateMutation.mutate({ id: contribution.id, status: 'pending' })}
                        className="text-amber-600 hover:text-amber-800"
                      >
                        Unconfirm
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('Delete this contribution?')) {
                          deleteMutation.mutate(contribution.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
