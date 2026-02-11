import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Layout from "../components/Layout";
import ContributionModal, {
  ContributionData,
} from "../components/ContributionModal";
import ItemDetailModal from "../components/ItemDetailModal";

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
    window.location.hostname === "localhost"
      ? "http://localhost:8081"
      : "https://api.samandjonah.com";

  // Fetch categories with items
  const {
    data: categories,
    isLoading,
    error,
  } = useQuery<CategoryWithItems[]>({
    queryKey: ["registry-categories"],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/registry/categories`);
      if (!response.ok) throw new Error("Failed to fetch registry");
      return response.json();
    },
  });

  // Submit contribution mutation
  const contributionMutation = useMutation({
    mutationFn: async (data: ContributionData) => {
      const response = await fetch(`${apiUrl}/api/registry/contributions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to submit contribution");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registry-categories"] });
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
      {/* Hero Section */}
      <div className="relative py-24 px-4 bg-berry">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-gold/80 text-sm tracking-[0.3em] uppercase mb-4 font-body font-medium">
              Our Honeymoon Fund
            </p>
            <h1 className="font-display text-5xl md:text-7xl mb-6 text-cream" style={{ fontWeight: 300 }}>
              Honeymoon Registry
            </h1>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-px bg-gold/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
              <div className="w-16 h-px bg-gold/40" />
            </div>
            <p className="text-lg text-blush/70 leading-relaxed max-w-2xl mx-auto">
              Your presence at our wedding is the greatest gift of all. However,
              if you wish to contribute to our honeymoon in Italy, we would be
              incredibly grateful.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="py-16 px-4 bg-berry">
        <div className="container mx-auto max-w-5xl">
          {/* General Contribution Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-glass rounded-2xl p-8 md:p-10 mb-16 text-center border border-gold/20 hover:border-gold/40 transition-[border-color] duration-300"
          >
            <h2 className="font-display text-3xl mb-3 text-cream">
              Contribute Any Amount
            </h2>
            <p className="text-blush/60 mb-6 max-w-lg mx-auto">
              Not sure what to pick? Make a general contribution and we'll put
              it towards our honeymoon adventures!
            </p>
            <button
              onClick={handleGeneralContribution}
              className="inline-block bg-gold text-berry-dark px-8 py-3 rounded-full font-medium hover:bg-gold-light transition-colors"
            >
              Make a Contribution
            </button>
          </motion.div>

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
              <p className="mt-4 text-blush/60">Loading registry...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-red-400">
                Failed to load registry. Please try again later.
              </p>
            </div>
          )}

          {!isLoading && !hasItems && (
            <div className="text-center py-12 text-blush/50">
              <p>Registry items coming soon!</p>
            </div>
          )}

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
                  <h2 className="font-display text-3xl md:text-4xl mb-8 text-cream">
                    {category.name}
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {category.items.map((item) => {
                      const price = parseFloat(item.price);
                      const contributed = parseFloat(item.total_contributed);
                      const percentage =
                        price > 0 ? (contributed / price) * 100 : 0;

                      return (
                        <div
                          key={item.id}
                          className="bg-glass rounded-2xl overflow-hidden border border-glass-border hover:border-gold/30 transition-[border-color] duration-300 shadow-lg"
                        >
                          {/* Clickable area for details */}
                          <button
                            onClick={() => handleViewDetails(item)}
                            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-gold/50 focus:ring-inset rounded-t-2xl"
                          >
                            {/* Image */}
                            {item.image_url ? (
                              <img
                                src={`${apiUrl}${item.image_url}`}
                                alt={item.name}
                                className="w-full h-52 object-cover hover:opacity-90 transition-opacity"
                              />
                            ) : (
                              <div className="bg-berry-dark/40 h-52 flex items-center justify-center hover:bg-berry-dark/50 transition-colors">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-12 w-12 text-blush/30"
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
                              <h3 className="font-display text-2xl mb-2 text-cream hover:text-gold transition-colors">
                                {item.name}
                              </h3>
                              {item.description && (
                                <p className="text-blush/60 mb-4 text-sm line-clamp-2">
                                  {item.description}
                                </p>
                              )}
                            </div>
                          </button>

                          <div className="p-6 pt-0">
                            {/* Progress Bar */}
                            <div className="mb-5">
                              <div className="flex justify-between text-sm mb-2">
                                <span className="text-blush/60">
                                  ${contributed.toFixed(0)} of $
                                  {price.toFixed(0)}
                                </span>
                                <span className="text-gold/80">
                                  {Math.round(percentage)}%
                                </span>
                              </div>
                              <div className="w-full bg-berry-dark/40 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${
                                    item.is_fully_funded
                                      ? "bg-green-400"
                                      : "bg-gold"
                                  }`}
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {item.is_fully_funded ? (
                              <div className="text-center py-2.5 bg-green-500/10 text-green-400 rounded-full font-medium border border-green-500/20">
                                ✓ Fully Funded — Thank You!
                              </div>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleContribute(item);
                                }}
                                className="w-full bg-gold text-berry-dark py-2.5 rounded-full font-medium hover:bg-gold-light transition-colors"
                              >
                                Contribute
                              </button>
                            )}

                            <button
                              onClick={() => handleViewDetails(item)}
                              className="w-full mt-3 text-sm text-blush/50 hover:text-gold transition-colors"
                            >
                              View Details & Contributors
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )
          )}

          {/* E-transfer Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 bg-glass rounded-2xl p-8 md:p-10 border border-glass-border"
          >
            <h3 className="font-display text-2xl mb-4 text-cream">How It Works</h3>
            <ol className="list-decimal list-inside space-y-3 text-blush/70">
              <li>
                Choose an experience you'd like to contribute to, or make a
                general contribution
              </li>
              <li>Enter your details and the amount you'd like to give</li>
              <li>
                Send an Interac e-Transfer to{" "}
                <strong className="text-gold">contact@samandjonah.com</strong>
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
