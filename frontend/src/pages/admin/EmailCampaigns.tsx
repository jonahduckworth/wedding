import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Campaign {
  id: string;
  name: string;
  subject: string;
  template_type: string;
  sent_count: number;
  created_at: string;
  sent_at: string | null;
}

interface CampaignStats {
  total_invites: number;
  sent_count: number;
  opened_count: number;
  not_opened_count: number;
  pending_count: number;
}

interface Guest {
  id: string;
  name: string;
  email: string;
}

interface InviteWithGuests {
  id: string;
  unique_code: string;
  invite_type: string;
  guests: Guest[];
}

interface RecipientStatus {
  invite: InviteWithGuests;
  sent_at: string | null;
  opened_at: string | null;
  opened_count: number;
}

export default function EmailCampaigns() {
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [previewingCampaignId, setPreviewingCampaignId] = useState<string | null>(null);
  const [viewingCampaignId, setViewingCampaignId] = useState<string | null>(null);
  const [sendingCampaignId, setSendingCampaignId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8081'
    : 'https://api.samandjonah.com';

  // Fetch campaigns
  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/campaigns`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
  });

  // Fetch campaign stats
  const { data: stats } = useQuery<CampaignStats>({
    queryKey: ['campaign-stats', viewingCampaignId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/campaigns/${viewingCampaignId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    enabled: !!viewingCampaignId,
  });

  // Fetch campaign recipients
  const { data: recipients } = useQuery<RecipientStatus[]>({
    queryKey: ['campaign-recipients', viewingCampaignId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/campaigns/${viewingCampaignId}/recipients`);
      if (!response.ok) throw new Error('Failed to fetch recipients');
      return response.json();
    },
    enabled: !!viewingCampaignId,
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (data: { name: string; subject: string }) => {
      const response = await fetch(`${apiUrl}/api/admin/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          template_type: 'save_the_date',
        }),
      });
      if (!response.ok) throw new Error('Failed to create campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      setCreatingCampaign(false);
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const response = await fetch(`${apiUrl}/api/admin/campaigns/${campaignId}/send`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to send campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-stats'] });
      setSendingCampaignId(null);
    },
  });

  const handleCreateCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createCampaignMutation.mutate({
      name: formData.get('name') as string,
      subject: formData.get('subject') as string,
    });
  };

  const handleSendCampaign = (campaignId: string) => {
    setSendingCampaignId(campaignId);
  };

  const confirmSendCampaign = () => {
    if (sendingCampaignId) {
      sendCampaignMutation.mutate(sendingCampaignId);
    }
  };

  const openRate = stats
    ? stats.sent_count > 0
      ? Math.round((stats.opened_count / stats.sent_count) * 100)
      : 0
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary mb-2">Email Campaigns</h2>
        <p className="text-gray-600">Create and manage save-the-date email campaigns</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => setCreatingCampaign(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-mauve transition-colors"
        >
          + Create Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="text-center text-gray-600 py-8">Loading campaigns...</div>
        ) : campaigns && campaigns.length > 0 ? (
          campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white rounded-xl shadow-md border-t-4 border-primary overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-display font-bold text-primary">
                      {campaign.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewingCampaignId(campaign.id)}
                      className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                    >
                      Preview
                    </button>
                    {!campaign.sent_at ? (
                      <button
                        onClick={() => handleSendCampaign(campaign.id)}
                        className="px-3 py-1 bg-primary text-white rounded-lg text-sm hover:bg-mauve"
                      >
                        Send
                      </button>
                    ) : (
                      <button
                        onClick={() => setViewingCampaignId(campaign.id)}
                        className="px-3 py-1 bg-olive text-white rounded-lg text-sm hover:bg-sage"
                      >
                        View Stats
                      </button>
                    )}
                  </div>
                </div>

                {campaign.sent_at && (
                  <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-sm text-gray-600">Sent</div>
                      <div className="text-2xl font-bold text-primary">{campaign.sent_count}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Status</div>
                      <div className="text-sm font-semibold text-green-600">Sent</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-600">
            No campaigns yet. Create your first save-the-date campaign to get started.
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {creatingCampaign && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-primary">
                Create Save the Date Campaign
              </h3>
            </div>

            <form onSubmit={handleCreateCampaign} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Save the Date - August 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  required
                  placeholder="Save the Date - Sam & Jonah's Wedding"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="bg-blush/20 border border-rose/30 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <strong>Template:</strong> Save the Date
                  <br />
                  <strong>Recipients:</strong> All active invites
                  <br />
                  <strong>Tracking:</strong> Email opens will be tracked automatically
                </p>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreatingCampaign(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createCampaignMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-mauve transition-colors disabled:opacity-50"
                >
                  {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewingCampaignId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-primary">Email Preview</h3>
            </div>

            <div className="p-6">
              <iframe
                src={`${apiUrl}/api/admin/campaigns/${previewingCampaignId}/preview`}
                className="w-full h-[600px] border border-gray-200 rounded-lg"
                title="Email Preview"
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setPreviewingCampaignId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats Modal */}
      {viewingCampaignId && stats && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-2xl font-display font-bold text-primary">Campaign Statistics</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Total Invites</div>
                  <div className="text-2xl font-bold text-primary">{stats.total_invites}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Sent</div>
                  <div className="text-2xl font-bold text-green-600">{stats.sent_count}</div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Opened</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.opened_count}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Not Opened</div>
                  <div className="text-2xl font-bold text-yellow-600">{stats.not_opened_count}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600">Open Rate</div>
                  <div className="text-2xl font-bold text-purple-600">{openRate}%</div>
                </div>
              </div>

              {/* Recipients List */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Recipients</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Guests
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          RSVP Code
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Sent
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Opens
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {recipients?.map((recipient) => (
                        <tr key={recipient.invite.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {recipient.invite.guests.map(g => g.name).join(' & ')}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              {recipient.invite.unique_code}
                            </code>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {recipient.sent_at
                              ? new Date(recipient.sent_at).toLocaleDateString()
                              : '-'}
                          </td>
                          <td className="px-4 py-3">
                            {recipient.opened_at ? (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                Opened
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                Not Opened
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {recipient.opened_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setViewingCampaignId(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Confirmation Modal */}
      {sendingCampaignId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-display font-bold text-primary mb-4">Send Campaign</h3>
              <p className="text-gray-700 mb-6">
                This will send the save-the-date email to all active invites. This action cannot be
                undone.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSendingCampaignId(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSendCampaign}
                  disabled={sendCampaignMutation.isPending}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-mauve transition-colors disabled:opacity-50"
                >
                  {sendCampaignMutation.isPending ? 'Sending...' : 'Send Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
