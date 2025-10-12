import Layout from '../components/Layout';

export default function DetailsPage() {
  const timeline = [
    { time: '12:00pm', event: 'Getting Ready Photos (guys)' },
    { time: '1:00pm', event: 'Getting Ready Photos (girls)' },
    { time: '2:00pm', event: 'First Look' },
    { time: '2:15pm', event: 'Wedding Party Portraits' },
    { time: '2:45pm', event: 'Couples Portraits' },
    { time: '3:30pm', event: 'Head to Rogue' },
    { time: '4:00pm', event: 'Ceremony' },
    { time: '4:30pm', event: 'Family Portraits/Cocktail Hour' },
    { time: '5:00pm', event: 'Bride & Groom Join Cocktail Hour' },
    { time: '6:00pm', event: 'Reception Begins' },
    { time: '6:15pm', event: 'Dinner with Speeches' },
    { time: '8:00pm', event: 'Cake Cutting' },
    { time: '8:15pm', event: 'Dance Floor Opens' },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-serif font-bold text-center mb-12">Wedding Details</h1>

        <div className="max-w-3xl mx-auto space-y-12">
          {/* Venue Information */}
          <section className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold mb-4">Venue</h2>
            <div className="space-y-2">
              <p className="text-xl">Rouge</p>
              <p className="text-gray-600">Calgary, Alberta</p>
              <p className="text-gray-600">August 15, 2026</p>
            </div>
          </section>

          {/* Timeline */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">Timeline of the Day</h2>
            <div className="space-y-4">
              {timeline.map((item, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 pb-4 border-b last:border-b-0"
                >
                  <div className="font-semibold text-primary min-w-[100px]">
                    {item.time}
                  </div>
                  <div className="text-gray-700">{item.event}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Dress Code */}
          <section className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Dress Code</h2>
            <p className="text-gray-700">
              Formal attire requested
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}
