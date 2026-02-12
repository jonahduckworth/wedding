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

  // ─── Code Entry Screen ───
  if (!submittedCode || isError) {
    return (
      <Layout>
        <div className="pt-32 md:pt-40 pb-24 px-6">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-gold text-[13px] tracking-[0.3em] uppercase mb-4 font-medium">
              Join us
            </p>
            <h1
              className="text-4xl md:text-5xl font-display text-heading mb-4"
              style={{ fontWeight: 300 }}
            >
              RSVP
            </h1>
            <p className="text-body mb-2 text-lg">
              August 15, 2026 · Rouge, Calgary
            </p>

            {countdown && (
              <div className="mb-8 mt-8">
                <p className="text-sm text-subtle mb-4 uppercase tracking-widest">
                  Please respond by April 30, 2026
                </p>
                <div className="flex justify-center gap-4">
                  {[
                    { value: countdown.days, label: 'Days' },
                    { value: countdown.hours, label: 'Hours' },
                    { value: countdown.minutes, label: 'Min' },
                  ].map((unit) => (
                    <div
                      key={unit.label}
                      className="bg-white rounded-xl border border-card-border p-4 min-w-[80px]"
                    >
                      <span className="text-3xl font-display text-gold" style={{ fontWeight: 300 }}>
                        {unit.value}
                      </span>
                      <p className="text-[10px] text-subtle uppercase tracking-wider mt-1">
                        {unit.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastDeadline && (
              <div className="mb-8 mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700 font-medium">The RSVP deadline has passed.</p>
                <p className="text-red-600 text-sm mt-1">
                  Please contact Sam &amp; Jonah directly if you need to update your response.
                </p>
              </div>
            )}

            <div className="bg-white rounded-2xl border border-card-border p-8 mt-6">
              <p className="text-body mb-6">
                Enter the unique code from your invitation to RSVP.
              </p>

              {isError && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3">
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
                  className="w-full px-4 py-3 border border-card-border rounded-xl text-center text-lg tracking-widest uppercase focus:ring-2 focus:ring-gold/40 focus:border-gold text-heading bg-cream"
                  disabled={pastDeadline}
                />
                <button
                  type="submit"
                  disabled={!code.trim() || pastDeadline}
                  className="w-full bg-berry text-white py-3 rounded-xl hover:bg-berry-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium tracking-wide text-[13px] uppercase"
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

  // ─── Loading ───
  if (isLoading) {
    return (
      <Layout>
        <div className="pt-40 pb-24 px-6 text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-blush rounded w-48 mx-auto mb-4" />
            <div className="h-4 bg-blush rounded w-64 mx-auto" />
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

  // ─── Success Screen ───
  if (submitted) {
    const anyAttending = guestForms.some(f => f.attending);
    return (
      <Layout>
        <div className="pt-32 md:pt-40 pb-24 px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-white rounded-2xl border border-card-border p-10">
              <div className="text-5xl mb-4">{anyAttending ? '🎉' : '💌'}</div>
              <h2
                className="text-3xl font-display text-heading mb-4"
                style={{ fontWeight: 300 }}
              >
                {inviteData.already_responded ? 'RSVP Updated!' : 'Thank You!'}
              </h2>
              {anyAttending ? (
                <>
                  <p className="text-body text-lg mb-2">
                    We can't wait to celebrate with you, {displayName}!
                  </p>
                  <p className="text-subtle">
                    See you on August 15, 2026 at Rouge, Calgary.
                  </p>
                </>
              ) : (
                <p className="text-body text-lg">
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

  // ─── RSVP Form ───
  return (
    <Layout>
      <div className="pt-28 md:pt-36 pb-24 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1
              className="text-4xl md:text-5xl font-display text-heading mb-3"
              style={{ fontWeight: 300 }}
            >
              RSVP
            </h1>
            <p className="text-body text-lg">
              {isCouple ? (
                <>Welcome, <strong className="text-heading">{guestNames[0]}</strong> &amp; <strong className="text-heading">{guestNames[1]}</strong>!</>
              ) : (
                <>Welcome, <strong className="text-heading">{guestNames[0]}</strong>!</>
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
              <p className="text-sm text-subtle">
                Please respond by <strong className="text-heading">April 30, 2026</strong> — {countdown.days} days remaining
              </p>
            </div>
          )}

          {pastDeadline && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <p className="text-red-700 font-medium">The RSVP deadline has passed.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleRsvpSubmit} className="space-y-8">
            {guestForms.map((form, index) => (
              <div key={form.guest_id} className="bg-white rounded-2xl border border-card-border p-6 md:p-8">
                {isCouple && (
                  <h3
                    className="text-xl font-display text-heading mb-6 pb-3 border-b border-card-border"
                    style={{ fontWeight: 400 }}
                  >
                    {form.name}
                  </h3>
                )}

                {/* Attendance */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-heading mb-3">
                    Will {isCouple ? form.name.split(' ')[0] : 'you'} be attending?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => updateGuestForm(index, { attending: true })}
                      disabled={pastDeadline}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm ${
                        form.attending === true
                          ? 'border-gold bg-gold/10 text-gold'
                          : 'border-card-border text-body hover:border-gold/40'
                      } disabled:opacity-50`}
                    >
                      Joyfully Accepts ✨
                    </button>
                    <button
                      type="button"
                      onClick={() => updateGuestForm(index, { attending: false })}
                      disabled={pastDeadline}
                      className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all font-medium text-sm ${
                        form.attending === false
                          ? 'border-subtle/40 bg-blush text-heading'
                          : 'border-card-border text-body hover:border-subtle/40'
                      } disabled:opacity-50`}
                    >
                      Regretfully Declines
                    </button>
                  </div>
                </div>

                {/* Fields for attending guests */}
                {form.attending === true && (
                  <div className="space-y-5 animate-fade-in-up">
                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        Dietary Restrictions or Allergies
                      </label>
                      <input
                        type="text"
                        value={form.dietary_restrictions}
                        onChange={(e) => updateGuestForm(index, { dietary_restrictions: e.target.value })}
                        placeholder="e.g., Vegetarian, Gluten-free, Nut allergy"
                        className="w-full px-4 py-3 border border-card-border rounded-xl focus:ring-2 focus:ring-gold/40 focus:border-gold bg-cream text-heading"
                        disabled={pastDeadline}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-heading mb-2">
                        Song Requests 🎵
                      </label>
                      <input
                        type="text"
                        value={form.song_requests}
                        onChange={(e) => updateGuestForm(index, { song_requests: e.target.value })}
                        placeholder="What songs will get you on the dance floor?"
                        className="w-full px-4 py-3 border border-card-border rounded-xl focus:ring-2 focus:ring-gold/40 focus:border-gold bg-cream text-heading"
                        disabled={pastDeadline}
                      />
                    </div>
                  </div>
                )}

                {/* Message (shown for all) */}
                {form.attending !== null && (
                  <div className={form.attending ? 'mt-5' : ''}>
                    <label className="block text-sm font-medium text-heading mb-2">
                      Message for Sam &amp; Jonah (optional)
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => updateGuestForm(index, { message: e.target.value })}
                      placeholder="Leave us a note!"
                      rows={3}
                      className="w-full px-4 py-3 border border-card-border rounded-xl focus:ring-2 focus:ring-gold/40 focus:border-gold bg-cream text-heading resize-none"
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
                  className="bg-berry text-white py-4 px-12 rounded-xl hover:bg-berry-light transition-colors disabled:opacity-50 font-medium tracking-wide text-[14px] uppercase shadow-sm"
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

          {/* Go back */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setSubmittedCode('');
                setCode('');
              }}
              className="text-subtle hover:text-gold text-sm transition-colors"
            >
              ← Use a different code
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
