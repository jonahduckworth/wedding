import { useState } from 'react';

interface HoneymoonItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  image_url: string | null;
  total_contributed: string;
  is_fully_funded: boolean;
}

interface ContributionModalProps {
  item: HoneymoonItem | null; // null for general contribution
  onClose: () => void;
  onSubmit: (data: ContributionData) => Promise<void>;
}

export interface ContributionData {
  item_id: string | null;
  contributor_name: string;
  contributor_email: string;
  amount: string;
  is_anonymous: boolean;
  message: string | null;
  purpose: string | null;
}

export default function ContributionModal({ item, onClose, onSubmit }: ContributionModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const isAnonymous = true; // All contributions are private
  const [message, setMessage] = useState('');
  const [purpose, setPurpose] = useState('');
  const [step, setStep] = useState<'form' | 'instructions' | 'confirm'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isGeneralContribution = item === null;
  const remainingAmount = item ? (parseFloat(item.price) - parseFloat(item.total_contributed)).toFixed(2) : null;

  const handleSubmit = async () => {
    if (!name || !email || !amount) {
      setError('Please fill in all required fields');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        item_id: item?.id ?? null,
        contributor_name: name,
        contributor_email: email,
        amount: amountNum.toFixed(2),
        is_anonymous: isAnonymous,
        message: message || null,
        purpose: isGeneralContribution ? (purpose || 'Wherever needed') : null,
      });
      setStep('confirm');
    } catch (err) {
      setError('Failed to submit contribution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-semibold">
              {step === 'confirm' ? 'Thank You!' : isGeneralContribution ? 'Make a Contribution' : `Contribute to ${item.name}`}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'form' && (
            <div className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {item && (
                <div className="text-sm text-gray-600 mb-4">
                  <p>Goal: ${item.price}</p>
                  <p>Remaining: ${remainingAmount}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="John & Jane Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (CAD) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="50.00"
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              {isGeneralContribution && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What would you like this to go towards?
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                    <option value="">Wherever needed</option>
                    <option value="Honeymoon experiences">Honeymoon experiences</option>
                    <option value="Romantic dinners">Romantic dinners</option>
                    <option value="Travel & accommodations">Travel & accommodations</option>
                    <option value="Adventures & activities">Adventures & activities</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leave a Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  rows={3}
                  placeholder="Congratulations on your wedding!"
                />
              </div>

              <p className="text-xs text-gray-400 italic">
                Your name will not be displayed publicly.
              </p>

              <button
                onClick={() => setStep('instructions')}
                disabled={!name || !email || !amount}
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === 'instructions' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-800 mb-2">Payment Instructions</h3>
                <p className="text-amber-700 text-sm mb-3">
                  Please send an Interac e-Transfer to:
                </p>
                <div className="bg-white rounded p-3 text-center">
                  <p className="font-mono text-lg font-semibold">contact@samandjonah.com</p>
                </div>
                <p className="text-amber-700 text-sm mt-3">
                  Amount: <strong>${parseFloat(amount).toFixed(2)} CAD</strong>
                </p>
                <p className="text-amber-600 text-xs mt-2">
                  Please include your name in the e-Transfer message so we can match your contribution.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : "I've Sent the e-Transfer"}
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-600">
                Thank you for your generous contribution! We'll confirm your gift once we receive the e-Transfer.
              </p>
              <button
                onClick={onClose}
                className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
