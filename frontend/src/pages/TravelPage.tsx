import Layout from '../components/Layout';

export default function TravelPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-center mb-12">Travel & Accommodations</h1>

        <div className="max-w-3xl mx-auto space-y-12">
          {/* Getting There */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">Getting to Rouge</h2>
            <p className="text-gray-700 mb-4">
              Rouge is located in Calgary, Alberta.
            </p>
            <div className="bg-gray-100 p-4 rounded">
              <p className="font-semibold mb-2">Address:</p>
              <p className="text-gray-700">[Venue Address]</p>
            </div>
          </section>

          {/* Parking */}
          <section>
            <h2 className="text-2xl font-semibold mb-4">Parking Information</h2>
            <p className="text-gray-700">
              Parking is available at the venue. Additional details will be provided closer to the date.
            </p>
          </section>

          {/* Accommodations */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Recommended Hotels</h2>
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Hotel Option 1</h3>
                <p className="text-gray-600 mb-2">[Hotel description and distance]</p>
                <a
                  href="#"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Hotel →
                </a>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Hotel Option 2</h3>
                <p className="text-gray-600 mb-2">[Hotel description and distance]</p>
                <a
                  href="#"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Hotel →
                </a>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Hotel Option 3</h3>
                <p className="text-gray-600 mb-2">[Hotel description and distance]</p>
                <a
                  href="#"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Hotel →
                </a>
              </div>
            </div>
          </section>

          {/* Airport */}
          <section className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Airport</h2>
            <p className="text-gray-700">
              The nearest airport is Calgary International Airport (YYC), approximately [X] minutes from the venue.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
