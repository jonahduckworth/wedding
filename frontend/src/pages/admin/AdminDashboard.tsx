import { Routes, Route, Link } from 'react-router-dom';

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
              <Route path="guests" element={<div>Guest Management (Coming Soon)</div>} />
              <Route path="emails" element={<div>Email Campaigns (Coming Soon)</div>} />
              <Route path="rsvps" element={<div>RSVP Management (Coming Soon)</div>} />
              <Route path="registry" element={<div>Registry Management (Coming Soon)</div>} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

function AdminOverview() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Overview</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Total Guests</h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">RSVPs Received</h3>
          <p className="text-3xl font-bold text-primary">0</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">Registry Contributions</h3>
          <p className="text-3xl font-bold text-primary">$0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <Link
            to="/admin/guests"
            className="block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Import Guest List
          </Link>
          <Link
            to="/admin/emails"
            className="block px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Send Email Campaign
          </Link>
        </div>
      </div>
    </div>
  );
}
