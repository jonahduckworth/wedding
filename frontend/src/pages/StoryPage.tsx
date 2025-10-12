import Layout from '../components/Layout';

export default function StoryPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-center mb-12">Our Story</h1>

        <div className="max-w-3xl mx-auto space-y-12">
          {/* How We Met */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">How We Met</h2>
            <p className="text-gray-700 leading-relaxed">
              [Story content to be added]
            </p>
          </section>

          {/* Photo Placeholder */}
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Photo Placeholder</p>
          </div>

          {/* Our Journey */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Our Journey</h2>
            <div className="space-y-6">
              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="font-semibold text-lg">First Date</h3>
                <p className="text-gray-600">[Date and story]</p>
              </div>
              <div className="border-l-4 border-primary pl-6 py-2">
                <h3 className="font-semibold text-lg">The Proposal</h3>
                <p className="text-gray-600">[Proposal story]</p>
              </div>
            </div>
          </section>

          {/* Photo Gallery Placeholder */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Photo Gallery</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Photo {i}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
