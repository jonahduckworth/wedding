import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import ContributionModal, { ContributionData } from '../components/ContributionModal';
import ItemDetailModal from '../components/ItemDetailModal';

interface HoneymoonItem {
  id: string;
  category_id: string | null;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  total_contributed: string;
  is_fully_funded: boolean;
  display_order: number;
}

interface HoneymoonCategory {
  id: string;
  name: string;
  display_order: number;
}

interface CategoryWithItems {
  id: string;
  name: string;
  display_order: number;
  items: HoneymoonItem[];
}

export default function RegistryPage() {
  const [selectedItem, setSelectedItem] = useState<HoneymoonItem | null>(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isGeneralContribution, setIsGeneralContribution] = useState(false);
  const queryClient = useQueryClient();

  // API URL
  const apiUrl = window.location.hostname === 'localhost'
    ? 'http://localhost:8081'
    : 'https://api.samandjonah.com';

  // Fetch categories with items
  const { data: categories, isLoading, error } = useQuery<CategoryWithItems[]>({
    queryKey: ['registry-categories'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/registry/categories`);
      if (!response.ok) throw new Error('Failed to fetch registry');
      return response.json();
    },
  });

  // Submit contribution mutation
  const contributionMutation = useMutation({
    mutationFn: async (data: ContributionData) => {
      const response = await fetch(`${apiUrl}/api/registry/contributions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to submit contribution');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registry-categories'] });
    },
  });

  const handleViewDetails = (item: HoneymoonItem) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleContribute = (item: HoneymoonItem) => {
    setSelectedItem(item);
    setIsGeneralContribution(false);
    setShowDetailModal(false);
    setShowContributionModal(true);
  };

  const handleContributeFromDetail = () => {
    if (selectedItem) {
      setShowDetailModal(false);
      setIsGeneralContribution(false);
      setShowContributionModal(true);
    }
  };

  const handleGeneralContribution = () => {
    setSelectedItem(null);
    setIsGeneralContribution(true);
    setShowContributionModal(true);
  };

  const handleSubmitContribution = async (data: ContributionData) => {
    await contributionMutation.mutateAsync(data);
  };

  const hasItems = categories && categories.some(cat => cat.items.length > 0);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-serif font-bold text-center mb-6">Honeymoon Registry</h1>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Your presence at our wedding is the greatest gift of all. However, if you wish to
            contribute to our honeymoon in Italy, we would be incredibly grateful.
          </p>

          {/* General Contribution Card */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-12 text-center">
            <h2 className="text-xl font-semibold mb-2">Contribute Any Amount</h2>
            <p className="text-gray-600 mb-4">
              Not sure what to pick? Make a general contribution and we'll put it towards our honeymoon adventures!
            </p>
            <button
              onClick={handleGeneralContribution}
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Make a Contribution
            </button>
          </div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading registry...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-600">Failed to load registry. Please try again later.</p>
            </div>
          )}

          {!isLoading && !hasItems && (
            <div className="text-center py-12 text-gray-500">
              <p>Registry items coming soon!</p>
            </div>
          )}

          {categories?.map((category) => (
            category.items.length > 0 && (
              <div key={category.id} className="mb-12">
                <h2 className="text-2xl font-semibold mb-6">{category.name}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {category.items.map((item) => {
                    const price = parseFloat(item.price);
                    const contributed = parseFloat(item.total_contributed);
                    const percentage = price > 0 ? (contributed / price) * 100 : 0;

                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden"
                      >
                        {/* Clickable area for details */}
                        <button
                          onClick={() => handleViewDetails(item)}
                          className="w-full text-left focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset"
                        >
                          {/* Image */}
                          {item.image_url ? (
                            <img
                              src={`${apiUrl}${item.image_url}`}
                              alt={item.name}
                              className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
                            />
                          ) : (
                            <div className="bg-gray-200 h-48 flex items-center justify-center hover:bg-gray-300 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}

                          <div className="p-6 pb-0">
                            <h3 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">{item.name}</h3>
                            {item.description && (
                              <p className="text-gray-600 mb-4 text-sm line-clamp-2">{item.description}</p>
                            )}
                          </div>
                        </button>

                        <div className="p-6 pt-0">

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-600">
                                ${contributed.toFixed(0)} of ${price.toFixed(0)}
                              </span>
                              <span className="text-gray-600">{Math.round(percentage)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  item.is_fully_funded ? 'bg-green-500' : 'bg-primary'
                                }`}
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>

                          {item.is_fully_funded ? (
                            <div className="text-center py-2 bg-green-50 text-green-700 rounded-md font-semibold">
                              Fully Funded - Thank You!
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleContribute(item);
                              }}
                              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
                            >
                              Contribute
                            </button>
                          )}

                          <button
                            onClick={() => handleViewDetails(item)}
                            className="w-full mt-2 text-sm text-gray-500 hover:text-primary transition-colors"
                          >
                            View Details & Contributors
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          ))}

          {/* E-transfer Info */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Choose an experience you'd like to contribute to, or make a general contribution</li>
              <li>Enter your details and the amount you'd like to give</li>
              <li>Send an Interac e-Transfer to <strong>contact@samandjonah.com</strong></li>
              <li>We'll confirm your contribution once we receive it</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Item Detail Modal */}
      {showDetailModal && selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          apiUrl={apiUrl}
          onClose={() => setShowDetailModal(false)}
          onContribute={handleContributeFromDetail}
        />
      )}

      {/* Contribution Modal */}
      {showContributionModal && (
        <ContributionModal
          item={isGeneralContribution ? null : selectedItem}
          onClose={() => setShowContributionModal(false)}
          onSubmit={handleSubmitContribution}
        />
      )}
    </Layout>
  );
}
