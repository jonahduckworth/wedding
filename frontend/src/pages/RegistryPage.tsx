import Layout from '../components/Layout';

export default function RegistryPage() {
  // Mock data - will be replaced with API call
  const categories = [
    {
      id: 1,
      name: 'Experiences',
      items: [
        {
          id: 1,
          name: 'Gondola Ride in Venice',
          description: 'Help us experience a romantic gondola ride through the canals of Venice',
          price: 150,
          contributed: 75,
        },
        {
          id: 2,
          name: 'Wine Tasting in Tuscany',
          description: 'Join us for a wine tasting tour in the beautiful Tuscan countryside',
          price: 200,
          contributed: 0,
        },
      ],
    },
    {
      id: 2,
      name: 'Dining',
      items: [
        {
          id: 3,
          name: 'Romantic Dinner in Rome',
          description: 'Help us enjoy an authentic Italian dinner under the stars',
          price: 180,
          contributed: 180,
        },
      ],
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-6">Honeymoon Registry</h1>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Your presence at our wedding is the greatest gift of all. However, if you wish to
            contribute to our honeymoon in Italy, we would be incredibly grateful.
          </p>

          {categories.map((category) => (
            <div key={category.id} className="mb-12">
              <h2 className="text-2xl font-semibold mb-6">{category.name}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {category.items.map((item) => {
                  const percentage = (item.contributed / item.price) * 100;
                  const isFullyFunded = percentage >= 100;

                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      {/* Image Placeholder */}
                      <div className="bg-gray-200 h-48 flex items-center justify-center">
                        <p className="text-gray-500">Image</p>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                        <p className="text-gray-600 mb-4 text-sm">{item.description}</p>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">
                              ${item.contributed} of ${item.price}
                            </span>
                            <span className="text-gray-600">{Math.round(percentage)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                isFullyFunded ? 'bg-green-500' : 'bg-primary'
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            />
                          </div>
                        </div>

                        {isFullyFunded ? (
                          <div className="text-center py-2 bg-green-50 text-green-700 rounded-md font-semibold">
                            Fully Funded - Thank You!
                          </div>
                        ) : (
                          <button className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors">
                            Contribute
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
