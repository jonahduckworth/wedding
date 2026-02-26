import { useQuery } from '@tanstack/react-query';

interface HoneymoonItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  total_contributed: string;
  is_fully_funded: boolean;
}

interface PublicContribution {
  display_name: string;
  amount: string;
  message: string | null;
  created_at: string;
}

interface ItemWithContributions {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  total_contributed: string;
  is_fully_funded: boolean;
  contributions: PublicContribution[];
}

interface ItemDetailModalProps {
  item: HoneymoonItem;
  apiUrl: string;
  onClose: () => void;
  onContribute: () => void;
}

export default function ItemDetailModal({ item, apiUrl, onClose, onContribute }: ItemDetailModalProps) {
  // Fetch item with contributions
  // Pre-fetch item details with contributions (data used for future contribution display)
  useQuery<ItemWithContributions>({
    queryKey: ['registry-item', item.id],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/registry/items/${item.id}`);
      if (!response.ok) throw new Error('Failed to fetch item');
      return response.json();
    },
  });

  const price = parseFloat(item.price);
  const contributed = parseFloat(item.total_contributed);
  const percentage = price > 0 ? (contributed / price) * 100 : 0;
  const remaining = Math.max(0, price - contributed);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">{item.name}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        {item.image_url ? (
          <img
            src={`${apiUrl}${item.image_url}`}
            alt={item.name}
            className="w-full h-64 object-cover"
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          {item.description && (
            <p className="text-gray-600 mb-6">{item.description}</p>
          )}

          {/* Progress Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Goal: ${price.toFixed(0)}</span>
              <span className="text-gray-600">{Math.round(percentage)}% funded</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <div
                className={`h-3 rounded-full transition-all ${
                  item.is_fully_funded ? 'bg-green-500' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>${contributed.toFixed(0)} raised</span>
              {!item.is_fully_funded && <span>${remaining.toFixed(0)} remaining</span>}
            </div>
          </div>

          {/* Contribute Button */}
          {item.is_fully_funded ? (
            <div className="text-center py-3 bg-green-50 text-green-700 rounded-md font-semibold mb-6">
              Fully Funded - Thank You!
            </div>
          ) : (
            <button
              onClick={onContribute}
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-primary/90 transition-colors font-semibold mb-6"
            >
              Contribute to This Experience
            </button>
          )}

          {/* Contributions Summary */}
          {contributed > 0 && (
            <div className="text-center py-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 text-sm">
                <span className="font-semibold text-green-600">${contributed.toFixed(0)}</span> contributed so far
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
