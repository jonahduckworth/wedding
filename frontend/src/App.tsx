import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryPage';
import DetailsPage from './pages/DetailsPage';
import TravelPage from './pages/TravelPage';
import FAQPage from './pages/FAQPage';
import RSVPPage from './pages/RSVPPage';
import RegistryPage from './pages/RegistryPage';
import AdminDashboard from './pages/admin/AdminDashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/details" element={<DetailsPage />} />
      <Route path="/travel" element={<TravelPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/rsvp/:code" element={<RSVPPage />} />
      <Route path="/registry" element={<RegistryPage />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
    </Routes>
  );
}

export default App;
