import Layout from '../components/Layout';

export default function HomePage() {
  const weddingDate = new Date('2026-08-15T16:00:00');
  const now = new Date();
  const daysUntil = Math.ceil((weddingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Layout>
      <div className="relative">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-light via-white to-white py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-7xl md:text-8xl font-display mb-6 text-primary">Sam & Jonah</h1>
            <p className="text-3xl text-mauve mb-3 font-light italic">are getting married</p>
            <p className="text-2xl text-rose mb-4">August 15, 2026</p>
            <p className="text-lg text-gray-600 mb-12">Rouge, Calgary, Alberta</p>

            {/* Countdown */}
            <div className="inline-block bg-white border-2 border-rose shadow-xl rounded-lg px-12 py-8">
              <p className="text-5xl font-bold text-primary mb-2">{daysUntil}</p>
              <p className="text-rose font-medium tracking-wide">days to go</p>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="container mx-auto px-4 py-20 bg-gradient-to-b from-white to-light/30">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-sage hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-display mb-3 text-primary">Our Story</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Learn how we met and fell in love</p>
              <a href="/story" className="inline-block text-mauve hover:text-primary font-semibold transition-colors">
                Read More →
              </a>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-rose hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-display mb-3 text-primary">Wedding Details</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Timeline, venue, and everything you need to know</p>
              <a href="/details" className="inline-block text-mauve hover:text-primary font-semibold transition-colors">
                View Details →
              </a>
            </div>
            <div className="text-center p-8 bg-white rounded-xl shadow-lg border-t-4 border-olive hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-display mb-3 text-primary">Honeymoon Registry</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">Help us make memories in Italy</p>
              <a href="/registry" className="inline-block text-mauve hover:text-primary font-semibold transition-colors">
                View Registry →
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
