import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';
import ContributionModal, {
  ContributionData,
} from '../components/ContributionModal';
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
  const apiUrl =
    window.location.hostname === 'localhost'
      ? 'http://localhost:8081'
      : 'https://api.samandjonah.com';

  // Fetch categories with items
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery<CategoryWithItems[]>({
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

  const hasItems = categories && categories.some((cat) => cat.items.length > 0);

  return (
    <Layout>
      {/* ─── Page Header ─── */}
      <section className="pt-32 md:pt-40 pb-16 md:pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium"
          >
            Our Honeymoon Fund
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl text-heading mb-6"
            style={{ fontWeight: 300 }}
          >
            Honeymoon Registry
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="w-16 h-px bg-gold/30" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/40" />
            <div className="w-16 h-px bg-gold/30" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-body text-lg leading-relaxed max-w-2xl mx-auto"
          >
            Your presence at our wedding is the greatest gift of all. However, if
            you wish to contribute to our honeymoon in Italy, we would be
            incredibly grateful.
          </motion.p>
        </div>
      </section>

      {/* ─── Registry Content ─── */}
      <div className="py-8 md:py-16 px-6">
        <div className="max-w-5xl mx-auto">
          {/* General Contribution Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 md:p-10 mb-16 text-center border border-card-border"
          >
            <h2
              className="font-display text-3xl text-heading mb-3"
              style={{ fontWeight: 300 }}
            >
              Contribute Any Amount
            </h2>
            <p className="text-body mb-6 max-w-lg mx-auto">
              Not sure what to pick? Make a general contribution and we'll put it
              towards our honeymoon adventures!
            </p>
            <button
              onClick={handleGeneralContribution}
              className="inline-block bg-berry text-white px-8 py-3 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] hover:bg-berry-light transition-colors"
            >
              Make a Contribution
            </button>
          </motion.div>

          {/* Loading */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto" />
              <p className="mt-4 text-subtle">Loading registry...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-500">
                Failed to load registry. Please try again later.
              </p>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !hasItems && (
            <div className="text-center py-12 text-subtle">
              <p>Registry items coming soon!</p>
            </div>
          )}

          {/* Categories & Items */}
          {categories?.map(
            (category) =>
              category.items.length > 0 && (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-16"
                >
                  <h2
                    className="font-display text-3xl md:text-4xl mb-8 text-heading"
                    style={{ fontWeight: 300 }}
                  >
                    {category.name}
                  </h2>

                  <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                    {category.items.map((item) => {
                      const price = parseFloat(item.price);
                      const contributed = parseFloat(item.total_contributed);
                      const percentage =
                        price > 0 ? (contributed / price) * 100 : 0;

                      return (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl overflow-hidden border border-card-border hover:shadow-lg transition-shadow duration-500"
                        >
                          {/* Clickable image/info area */}
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-inset rounded-t-2xl"
                          >
                            {item.image_url ? (
                              <img
                                src={`${apiUrl}${item.image_url}`}
                                alt={item.name}
                                className="w-full h-52 object-cover hover:opacity-95 transition-opacity"
                              />
                            ) : (
                              <div className="bg-blush h-52 flex items-center justify-center hover:bg-blush/80 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-12 w-12 text-subtle/50"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                  />
                                </svg>
                              </div>
                            )}

                            <div className="p-6 pb-0">
                              <h3
                                className="font-display text-2xl text-heading hover:text-gold transition-colors mb-2"
                                style={{ fontWeight: 400 }}
                              >
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-body text-sm line-clamp-2 mb-4">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </button>

                          <div className="p-6 pt-0">
                            {/* Progress */}
                            <div className="mb-5">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-subtle">
                                  ${contributed.toFixed(0)} of $
                                  {price.toFixed(0)}
                                </span>
                                <span className="text-gold">
                                  {Math.round(percentage)}%
                                </span>
                              </div>
                              <div className="w-full bg-blush rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    item.is_fully_funded
                                      ? 'bg-green-500'
                                      : 'bg-gold'
                                  }`}
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {item.is_fully_funded ? (
                              <div className="text-center py-2.5 bg-green-50 text-green-600 rounded-full font-medium border border-green-200 text-sm">
                                ✓ Fully Funded — Thank You!
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContribute(item);
                                }}
                                className="w-full bg-berry text-white py-2.5 rounded-full text-[13px] font-medium uppercase tracking-[0.1em] hover:bg-berry-light transition-colors"
                              >
                                Contribute
                              </button>
                            )}

                            <button
                              onClick={() => handleViewDetails(item)}
                              className="w-full mt-3 text-sm text-subtle hover:text-gold transition-colors"
                            >
                              View Details &amp; Contributors
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )
          )}

          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-white rounded-2xl p-8 md:p-10 border border-card-border"
          >
            <h3
              className="font-display text-2xl text-heading mb-5"
              style={{ fontWeight: 400 }}
            >
              How It Works
            </h3>
            <ol className="list-decimal list-inside space-y-3 text-body">
              <li>
                Choose an experience you'd like to contribute to, or make a
                general contribution
              </li>
              <li>Enter your details and the amount you'd like to give</li>
              <li>
                Send an Interac e-Transfer to{' '}
                <strong className="text-heading">contact@samandjonah.com</strong>
              </li>
              <li>
                We'll send you a picture of us doing this activity, to say thank
                you :)
              </li>
            </ol>
          </motion.div>
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
