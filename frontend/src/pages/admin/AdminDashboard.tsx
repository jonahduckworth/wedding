import { Routes, Route, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import GuestManagement from './GuestManagement';
import InviteManagement from './InviteManagement';
import EmailCampaigns from './EmailCampaigns';
import RegistryManagement from './RegistryManagement';
import RsvpManagement from './RsvpManagement';
import InvitationSending from './InvitationSending';

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 bg-white rounded-lg shadow-md p-6">
            <nav className="space-y-2">
              <Link
                to="/admin"
                className="block px-4 py-2 rounded hover:bg-gray-100"
              >
                Overview
              </Link>
              <Link
                to="/admin/guests"
                className="block px-4 py-2 rounded hover:bg-gray-100"
              >
                Guest List
              </Link>
              <Link
                to="/admin/invites"
                className="block px-4 py-2 rounded hover:bg-gray-100"
              >
                Invites
              </Link>
              <Link
                to="/admin/emails"
                className="block px-4 py-2 rounded hover:bg-gray-100"
              >
                Email Campaigns
              </Link>
              <Link
                to="/admin/rsvps"
                className="block px-4 py-2 rounded hover:bg-gray-100"
              >
                RSVPs
              </Link>
              <Link
                to="/admin/invitations"
                className="block px-4 py-2 rounded hover:bg-gray-100"
              >
                Invitation Emails
              </Link>
              <Link
                to="/admin/registry"
                className="block px-4 py-2 rounded hover:bg-gray-100"
              >
                Registry Management
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route index element={<AdminOverview />} />
              <Route path="guests" element={<GuestManagement />} />
              <Route path="invites" element={<InviteManagement />} />
              <Route path="emails" element={<EmailCampaigns />} />
              <Route path="rsvps" element={<RsvpManagement />} />
              <Route path="invitations" element={<InvitationSending />} />
              <Route path="registry" element={<RegistryManagement />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8081'
    : 'https://api.samandjonah.com';

  const { data: rsvpStats } = useQuery({
    queryKey: ['overview-rsvp-stats'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/admin/rsvps/stats`);
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: guests } = useQuery({
    queryKey: ['overview-guests'],
    queryFn: async () => {
      const res = await fetch(`${apiUrl}/api/admin/guests`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const activeGuests = guests?.filter((g: any) => !g.removed) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Guests</h3>
          <p className="text-3xl font-bold text-primary">{activeGuests.length}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">RSVPs Received</h3>
          <p className="text-3xl font-bold text-primary">{rsvpStats?.total_responded ?? 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Attending</h3>
          <p className="text-3xl font-bold text-green-600">{rsvpStats?.total_attending ?? 0}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Pending</h3>
          <p className="text-3xl font-bold text-yellow-600">{rsvpStats?.total_pending ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid md:grid-cols-2 gap-3">
          <Link
            to="/admin/guests"
            className="block px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 text-center font-medium"
          >
            Manage Guests
          </Link>
          <Link
            to="/admin/rsvps"
            className="block px-4 py-3 bg-sage text-olive rounded-lg hover:bg-sage/80 text-center font-medium"
          >
            View RSVPs
          </Link>
          <Link
            to="/admin/invitations"
            className="block px-4 py-3 bg-rose text-mauve rounded-lg hover:bg-rose/80 text-center font-medium"
          >
            Send Invitations
          </Link>
          <Link
            to="/admin/emails"
            className="block px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-center font-medium"
          >
            Email Campaigns
          </Link>
        </div>
      </div>
    </div>
  );
}
