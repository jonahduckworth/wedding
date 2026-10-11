import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import StoryPage from './pages/StoryPage';
import WeddingPartyPage from './pages/WeddingPartyPage';
import DetailsPage from './pages/DetailsPage';
import TravelPage from './pages/TravelPage';
import FAQPage from './pages/FAQPage';
import RSVPPage from './pages/RSVPPage';
import RegistryPage from './pages/RegistryPage';
// This chunk is requested only when an admin route is rendered.
const ArchiveAdmin = lazy(() => import('./pages/archive/ArchiveAdmin'));

function App() {
  return (
    <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/story" element={<StoryPage />} />
      <Route path="/party" element={<WeddingPartyPage />} />
      <Route path="/details" element={<DetailsPage />} />
      <Route path="/travel" element={<TravelPage />} />
      <Route path="/faq" element={<FAQPage />} />
      <Route path="/rsvp/*" element={<RSVPPage />} />
      <Route path="/registry/*" element={<RegistryPage />} />
      <Route path="/admin/*" element={
        <Suspense fallback={<p className="archive-loading" role="status">Loading private archive…</p>}>
          <ArchiveAdmin />
        </Suspense>
      } />
      <Route path="*" element={<HomePage />} />
    </Routes>
    </>
  );
}

export default App;
