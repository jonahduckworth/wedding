import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const apiUrl = window.location.hostname === 'localhost'
  ? 'http://localhost:8081'
  : 'https://api.samandjonah.com';

interface Guest {
  id: string;
  name: string;
  email: string;
}

interface InviteWithGuests {
  id: string;
  unique_code: string;
  invite_type: string;
  guests: Guest[];
}

interface ReminderRecipient {
  invite: InviteWithGuests;
  sent_at: string | null;
}

interface ReminderStatus {
  subject: string;
  recipients: ReminderRecipient[];
}

interface SendResult {
  success: boolean;
  sent_count: number;
  errors: string[];
}

type FilterType = 'all' | 'unsent' | 'sent';

const hasValidEmail = (recipient: ReminderRecipient) =>
  recipient.invite.guests.some((guest) => {
    const [, domain] = guest.email.split('@');
    return Boolean(domain?.includes('.'));
  });

export default function OneMonthReminder() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastResult, setLastResult] = useState<SendResult | null>(null);
  const previewDialogRef = useRef<HTMLDivElement>(null);
  const previewCloseRef = useRef<HTMLButtonElement>(null);
  const confirmationDialogRef = useRef<HTMLDivElement>(null);
  const confirmationCancelRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  const statusQuery = useQuery<ReminderStatus>({
    queryKey: ['one-month-reminder-status'],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/api/admin/reminders/one-month/status`);
      if (!response.ok) throw new Error('Failed to load one-month reminder recipients');
      return response.json();
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (inviteIds: string[]) => {
      const response = await fetch(`${apiUrl}/api/admin/reminders/one-month/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invite_ids: inviteIds }),
      });
      if (!response.ok) throw new Error('Failed to send one-month reminders');
      return response.json() as Promise<SendResult>;
    },
    onSuccess: (result) => {
      setLastResult(result);
      setSelectedIds(new Set());
      setShowConfirmation(false);
      queryClient.invalidateQueries({ queryKey: ['one-month-reminder-status'] });
    },
  });

  useEffect(() => {
    if (!showPreview && !showConfirmation) return;

    const dialog = showPreview ? previewDialogRef.current : confirmationDialogRef.current;
    const initialFocus = showPreview ? previewCloseRef.current : confirmationCancelRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const focusableSelector = [
      'button:not([disabled])',
      'a[href]',
      'iframe',
      'input:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    initialFocus?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showPreview) setShowPreview(false);
        else setShowConfirmation(false);
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [showConfirmation, showPreview]);

  const recipients = statusQuery.data?.recipients ?? [];
  const sentRecipients = recipients.filter((recipient) => recipient.sent_at);
  const unsentRecipients = recipients.filter((recipient) => !recipient.sent_at);
  const readyRecipients = unsentRecipients.filter(hasValidEmail);
  const attendingGuestCount = recipients.reduce(
    (total, recipient) => total + recipient.invite.guests.length,
    0,
  );

  const filteredRecipients = useMemo(() => recipients.filter((recipient) => {
    if (filter === 'sent') return Boolean(recipient.sent_at);
    if (filter === 'unsent') return !recipient.sent_at;
    return true;
  }), [filter, recipients]);

  const selectedRecipients = recipients.filter((recipient) => selectedIds.has(recipient.invite.id));
  const selectedGuestCount = selectedRecipients.reduce(
    (total, recipient) => total + recipient.invite.guests.length,
    0,
  );

  const toggleSelection = (recipient: ReminderRecipient) => {
    if (recipient.sent_at || !hasValidEmail(recipient)) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(recipient.invite.id)) next.delete(recipient.invite.id);
      else next.add(recipient.invite.id);
      return next;
    });
  };

  const selectAllReady = () => {
    setSelectedIds(new Set(readyRecipients.map((recipient) => recipient.invite.id)));
  };

  const confirmSend = () => {
    if (selectedIds.size === 0) return;
    sendMutation.mutate(Array.from(selectedIds));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-mauve mb-2">
          Attending guests only
        </p>
        <h2 className="text-3xl font-display font-bold text-primary mb-2">1 Month Reminder</h2>
        <p className="text-gray-600 max-w-3xl">
          Send a friendly countdown email with links to wedding-day details, travel information,
          things to do in Calgary, and the honeymoon registry.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Reminder recipient summary">
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-primary">
          <p className="text-sm text-gray-600 uppercase tracking-wider">Attending Guests</p>
          <p className="text-3xl font-bold text-primary mt-1">{attendingGuestCount}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-blue-400">
          <p className="text-sm text-gray-600 uppercase tracking-wider">Email Groups</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{recipients.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-green-400">
          <p className="text-sm text-gray-600 uppercase tracking-wider">Sent</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{sentRecipients.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-5 border-t-4 border-yellow-400">
          <p className="text-sm text-gray-600 uppercase tracking-wider">Ready to Send</p>
          <p className="text-3xl font-bold text-yellow-700 mt-1">{readyRecipients.length}</p>
        </div>
      </div>

      <section className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <h3 className="text-xl font-display font-bold text-primary">Email content</h3>
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold text-gray-800">Subject:</span>{' '}
                {statusQuery.data?.subject ?? "One month to go! Sam & Jonah's wedding"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="min-h-11 px-4 py-2 border border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              Preview Email
            </button>
          </div>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm text-gray-700">
          {['Wedding day details', 'Travel information', 'Things to do in Calgary', 'Honeymoon registry'].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-mauve" aria-hidden="true" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      {lastResult && (
        <div
          role="status"
          className={`rounded-xl p-4 border ${
            lastResult.success
              ? 'bg-green-50 border-green-200 text-green-900'
              : 'bg-yellow-50 border-yellow-200 text-yellow-900'
          }`}
        >
          <p className="font-semibold">
            Sent {lastResult.sent_count} reminder{lastResult.sent_count === 1 ? '' : 's'}.
          </p>
          {lastResult.errors.length > 0 && (
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              {lastResult.errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          )}
        </div>
      )}

      {sendMutation.isError && (
        <div role="alert" className="rounded-xl p-4 bg-red-50 border border-red-200 text-red-800">
          The send request did not complete cleanly. Refresh the recipient status before trying again
          so nobody receives a duplicate reminder.
        </div>
      )}

      <section className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex flex-col xl:flex-row gap-4 justify-between xl:items-center">
            <div className="flex gap-2 flex-wrap" aria-label="Filter reminder recipients">
              {(['all', 'unsent', 'sent'] as FilterType[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFilter(option)}
                  aria-pressed={filter === option}
                  className={`min-h-11 px-4 py-2 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors ${
                    filter === option
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex gap-3 items-center flex-wrap">
              {selectedIds.size > 0 && (
                <span className="text-sm text-gray-700" aria-live="polite">
                  {selectedIds.size} email group{selectedIds.size === 1 ? '' : 's'} selected
                </span>
              )}
              <button
                type="button"
                onClick={selectAllReady}
                disabled={readyRecipients.length === 0}
                className="min-h-11 px-4 py-2 text-sm font-semibold text-primary rounded-lg hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                Select All Ready
              </button>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="min-h-11 px-4 py-2 text-sm font-semibold text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowConfirmation(true)}
                disabled={selectedIds.size === 0 || sendMutation.isPending}
                className="min-h-11 px-6 py-2 bg-primary text-white rounded-lg hover:bg-mauve focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 font-semibold transition-colors"
              >
                Send {selectedIds.size || ''} Reminder{selectedIds.size === 1 ? '' : 's'}
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Each email group contains only guests with an attending RSVP. Already-sent groups cannot be selected again.
          </p>
        </div>

        {statusQuery.isLoading ? (
          <div className="p-10 text-center text-gray-600">Loading attending guests...</div>
        ) : statusQuery.isError ? (
          <div role="alert" className="p-10 text-center text-red-700">
            Could not load the reminder list. Please refresh and try again.
          </div>
        ) : filteredRecipients.length === 0 ? (
          <div className="p-10 text-center text-gray-600">No matching attending guests found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left"><span className="sr-only">Select</span></th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Attending Guest(s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email(s)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Invite</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecipients.map((recipient) => {
                  const canSelect = !recipient.sent_at && hasValidEmail(recipient);
                  return (
                    <tr key={recipient.invite.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.has(recipient.invite.id)}
                          onChange={() => toggleSelection(recipient)}
                          disabled={!canSelect}
                          aria-label={`Select reminder for ${recipient.invite.guests.map((guest) => guest.name).join(', ')}`}
                          className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-40"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {recipient.invite.guests.map((guest) => (
                          <div key={guest.id} className="text-sm font-medium text-gray-900">{guest.name}</div>
                        ))}
                      </td>
                      <td className="px-6 py-4">
                        {recipient.invite.guests.map((guest) => (
                          <div key={guest.id} className="text-sm text-gray-700">
                            {guest.email.includes('@')
                              ? guest.email
                              : <span className="text-red-600 italic">No valid email</span>}
                          </div>
                        ))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-sage/20 text-olive">
                          {recipient.invite.invite_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {recipient.sent_at ? (
                          <div>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Sent</span>
                            <p className="text-xs text-gray-500 mt-2">
                              {new Date(recipient.sent_at).toLocaleString()}
                            </p>
                          </div>
                        ) : hasValidEmail(recipient) ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Ready</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Needs email</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showPreview && (
        <div ref={previewDialogRef} className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="reminder-preview-title">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between gap-4">
              <h3 id="reminder-preview-title" className="text-2xl font-display font-bold text-primary">Email Preview</h3>
              <button
                ref={previewCloseRef}
                type="button"
                onClick={() => setShowPreview(false)}
                aria-label="Close email preview"
                className="min-w-11 min-h-11 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary text-2xl"
              >
                &times;
              </button>
            </div>
            <div className="p-4 md:p-6">
              <iframe
                src={`${apiUrl}/api/admin/reminders/one-month/preview`}
                className="w-full h-[650px] border border-gray-200 rounded-lg"
                title="One-month reminder email preview"
              />
            </div>
          </div>
        </div>
      )}

      {showConfirmation && (
        <div ref={confirmationDialogRef} className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="reminder-confirm-title">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <h3 id="reminder-confirm-title" className="text-2xl font-display font-bold text-primary">Send reminder emails?</h3>
            <p className="text-gray-700 mt-3 leading-relaxed">
              This will send {selectedIds.size} email group{selectedIds.size === 1 ? '' : 's'} to{' '}
              {selectedGuestCount} attending guest{selectedGuestCount === 1 ? '' : 's'}. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                ref={confirmationCancelRef}
                type="button"
                onClick={() => setShowConfirmation(false)}
                disabled={sendMutation.isPending}
                className="min-h-11 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmSend}
                disabled={sendMutation.isPending}
                className="min-h-11 px-5 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-mauve focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
              >
                {sendMutation.isPending ? 'Sending...' : 'Confirm Send'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
