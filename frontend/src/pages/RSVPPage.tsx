import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import Layout from '../components/Layout';

const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8081'
  : 'https://api.samandjonah.com';

const RSVP_DEADLINE = new Date('2026-04-30T23:59:59');

interface Guest {
  id: string;
  name: string;
  email: string;
  invite_type: string;
}

interface Rsvp {
  id: string;
  guest_id: string;
  attending: boolean;
  dietary_restrictions: string | null;
  song_requests: string | null;
  message: string | null;
}

interface InviteRsvpResponse {
  invite: {
    id: string;
    unique_code: string;
    invite_type: string;
    guests: Guest[];
  };
  rsvps: Rsvp[];
  already_responded: boolean;
}

interface GuestFormData {
  guest_id: string;
  name: string;
  attending: boolean | null;
  dietary_restrictions: string;
  song_requests: string;
  message: string;
}

function getCountdown() {
  const now = new Date();
  const diff = RSVP_DEADLINE.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes };
}

function isPastDeadline() {
  return new Date() > RSVP_DEADLINE;
}

export default function RSVPPage() {
  const [searchParams] = useSearchParams();
  const codeFromUrl = searchParams.get('code');
  const [code, setCode] = useState(codeFromUrl || '');
  const [submittedCode, setSubmittedCode] = useState(codeFromUrl || '');
  const [countdown, setCountdown] = useState(getCountdown());
  const [guestForms, setGuestForms] = useState<GuestFormData[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Lookup invite by code
  const { data: inviteData, isLoading, isError, refetch } = useQuery<InviteRsvpResponse>({
    queryKey: ['rsvp', submittedCode],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/api/rsvp/${submittedCode}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('not_found');
        throw new Error('Failed to look up RSVP');
      }
      return response.json();
    },
    enabled: !!submittedCode,
    retry: false,
  });

  // Initialize form data when invite loads
  useEffect(() => {
    if (inviteData) {
      const forms: GuestFormData[] = inviteData.invite.guests.map(guest => {
        const existingRsvp = inviteData.rsvps.find(r => r.guest_id === guest.id);
        return {
          guest_id: guest.id,
          name: guest.name,
          attending: existingRsvp ? existingRsvp.attending : null,
          dietary_restrictions: existingRsvp?.dietary_restrictions || '',
          song_requests: existingRsvp?.song_requests || '',
          message: existingRsvp?.message || '',
        };
      });
      setGuestForms(forms);
      setSubmitted(false);
    }
  }, [inviteData]);

  // Submit RSVP mutation
  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        guests: guestForms.map(f => ({
          guest_id: f.guest_id,
          attending: f.attending === true,
          dietary_restrictions: f.dietary_restrictions || null,
          song_requests: f.song_requests || null,
          message: f.message || null,
        })),
      };
      const response = await fetch(`${API_URL}/api/rsvp/${submittedCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Failed to submit RSVP');
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      refetch();
    },
  });

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmittedCode(code.trim());
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate all guests have responded
    const allResponded = guestForms.every(f => f.attending !== null);
    if (!allResponded) {
      setError('Please indicate whether each guest will be attending.');
      return;
    }
    setError('');
    submitMutation.mutate();
  };

  const updateGuestForm = (index: number, updates: Partial<GuestFormData>) => {
    setGuestForms(prev => prev.map((f, i) => i === index ? { ...f, ...updates } : f));
  };

  const pastDeadline = isPastDeadline();

  // Code entry screen
  if (!submittedCode || isError) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display text-cream mb-4" style={{ fontWeight: 300 }}>
              RSVP
            </h1>
            <p className="text-blush/70 mb-2 text-lg">
              August 15, 2026 • Rouge, Calgary
            </p>

            {countdown && (
              <div className="mb-8 mt-6">
                <p className="text-sm text-blush/70 mb-3 uppercase tracking-widest">Please respond by April 30, 2026</p>
                <div className="flex justify-center gap-4">
                  <div className="bg-white rounded-lg shadow-sm p-4 min-w-[80px]">
                    <span className="text-3xl font-display text-gold">{countdown.days}</span>
                    <p className="text-xs text-blush/70 uppercase tracking-wider mt-1">Days</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4 min-w-[80px]">
                    <span className="text-3xl font-display text-gold">{countdown.hours}</span>
                    <p className="text-xs text-blush/70 uppercase tracking-wider mt-1">Hours</p>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm p-4 min-w-[80px]">
                    <span className="text-3xl font-display text-gold">{countdown.minutes}</span>
                    <p className="text-xs text-blush/70 uppercase tracking-wider mt-1">Min</p>
                  </div>
                </div>
              </div>
            )}

            {pastDeadline && (
              <div className="mb-8 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 font-medium">The RSVP deadline has passed.</p>
                <p className="text-red-600 text-sm mt-1">Please contact Sam & Jonah directly if you need to update your response.</p>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-8 mt-6">
              <p className="text-blush/70 mb-6">
                Enter the unique code from your invitation to RSVP.
              </p>

              {isError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">
                    We couldn't find an invitation with that code. Please double-check and try again.
                  </p>
                </div>
              )}

              <form onSubmit={handleCodeSubmit} className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter your RSVP code"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-lg tracking-widest uppercase focus:ring-2 focus:ring-gold focus:border-transparent"
                  disabled={pastDeadline}
                />
                <button
                  type="submit"
                  disabled={!code.trim() || pastDeadline}
                  className="w-full bg-gold text-white py-3 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium tracking-wide"
                >
                  Find My Invitation
                </button>
              </form>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!inviteData) return null;

  const isCouple = inviteData.invite.guests.length > 1;
  const guestNames = inviteData.invite.guests.map(g => g.name);
  const displayName = isCouple
    ? `${guestNames[0]} & ${guestNames[1]}`
    : guestNames[0];

  // Success screen
  if (submitted) {
    const anyAttending = guestForms.some(f => f.attending);
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="text-5xl mb-4">{anyAttending ? '🎉' : '💌'}</div>
              <h2 className="text-3xl font-display text-cream mb-4" style={{ fontWeight: 300 }}>
                {inviteData.already_responded ? 'RSVP Updated!' : 'Thank You!'}
              </h2>
              {anyAttending ? (
                <>
                  <p className="text-blush/70 text-lg mb-2">
                    We can't wait to celebrate with you, {displayName}!
                  </p>
                  <p className="text-blush/70">
                    See you on August 15, 2026 at Rouge, Calgary.
                  </p>
                </>
              ) : (
                <p className="text-blush/70 text-lg">
                  We're sorry you can't make it, {displayName}. We'll miss you!
                </p>
              )}

              {!pastDeadline && (
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 text-gold hover:underline text-sm"
                >
                  Update my response
                </button>
              )}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // RSVP form
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-display text-cream mb-3" style={{ fontWeight: 300 }}>
              RSVP
            </h1>
            <p className="text-blush/70 text-lg">
              {isCouple ? (
                <>Welcome, <strong>{guestNames[0]}</strong> & <strong>{guestNames[1]}</strong>!</>
              ) : (
                <>Welcome, <strong>{guestNames[0]}</strong>!</>
              )}
            </p>
            {inviteData.already_responded && (
              <p className="text-gold text-sm mt-2">
                You've already responded — feel free to update your RSVP below.
              </p>
            )}
          </div>

          {countdown && (
            <div className="text-center mb-6">
              <p className="text-sm text-blush/70">
                Please respond by <strong>April 30, 2026</strong> — {countdown.days} days remaining
              </p>
            </div>
          )}

          {pastDeadline && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-medium">The RSVP deadline has passed.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRsvpSubmit} className="space-y-8">
            {guestForms.map((form, index) => (
              <div key={form.guest_id} className="bg-white rounded-xl shadow-md p-6 md:p-8">
                {isCouple && (
                  <h3 className="text-xl font-display text-cream mb-6 pb-3 border-b border-gray-100" style={{ fontWeight: 400 }}>
                    {form.name}
                  </h3>
                )}

                {/* Attendance */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-cream mb-3">
                    Will {isCouple ? form.name.split(' ')[0] : 'you'} be attending?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => updateGuestForm(index, { attending: true })}
                      disabled={pastDeadline}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                        form.attending === true
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-gray-200 text-blush/70 hover:border-gold/50'
                      } disabled:opacity-50`}
                    >
                      Joyfully Accepts ✨
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGuestForm(index, { attending: false })}
                      disabled={pastDeadline}
                      className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                        form.attending === false
                          ? 'border-blush/30 bg-gray-50 text-cream'
                          : 'border-gray-200 text-blush/70 hover:border-gray-400'
                      } disabled:opacity-50`}
                    >
                      Regretfully Declines
                    </button>
                  </div>
                </div>

                {/* Fields shown when attending */}
                {form.attending === true && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Dietary Restrictions */}
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Dietary Restrictions or Allergies
                      </label>
                      <input
                        type="text"
                        value={form.dietary_restrictions}
                        onChange={(e) => updateGuestForm(index, { dietary_restrictions: e.target.value })}
                        placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                        disabled={pastDeadline}
                      />
                    </div>

                    {/* Song Requests */}
                    <div>
                      <label className="block text-sm font-medium text-cream mb-2">
                        Song Requests 🎵
                      </label>
                      <input
                        type="text"
                        value={form.song_requests}
                        onChange={(e) => updateGuestForm(index, { song_requests: e.target.value })}
                        placeholder="What songs will get you on the dance floor?"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent"
                        disabled={pastDeadline}
                      />
                    </div>
                  </div>
                )}

                {/* Message (shown for all) */}
                {form.attending !== null && (
                  <div className={form.attending ? 'mt-5' : ''}>
                    <label className="block text-sm font-medium text-cream mb-2">
                      Message for Sam & Jonah (optional)
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => updateGuestForm(index, { message: e.target.value })}
                      placeholder="Leave us a note!"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gold focus:border-transparent resize-none"
                      disabled={pastDeadline}
                    />
                  </div>
                )}
              </div>
            ))}

            {/* Submit */}
            {!pastDeadline && (
              <div className="text-center">
                <button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="bg-gold text-white py-4 px-12 rounded-lg hover:bg-gold/90 transition-colors disabled:opacity-50 font-medium tracking-wide text-lg shadow-md"
                >
                  {submitMutation.isPending
                    ? 'Submitting...'
                    : inviteData.already_responded
                    ? 'Update RSVP'
                    : 'Submit RSVP'}
                </button>
              </div>
            )}
          </form>

          {/* Go back link */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setSubmittedCode('');
                setCode('');
              }}
              className="text-blush/70 hover:text-gold text-sm transition-colors"
            >
              ← Use a different code
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
