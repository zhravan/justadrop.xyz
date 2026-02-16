'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/common';

interface ApplyModalProps {
  opportunityId: string;
  opportunityTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplyModal({
  opportunityId,
  opportunityTitle,
  onClose,
  onSuccess,
}: ApplyModalProps) {
  const [motivation, setMotivation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/opportunities/${opportunityId}/apply`, {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ motivationDescription: motivation || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message || data?.error || 'Failed to apply');
      toast.success('Application submitted');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to apply');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-foreground/10 bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-jad-foreground">
            Apply to {opportunityTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-foreground/70 hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="motivation" className="block text-sm font-medium text-foreground mb-2">
              Why do you want to volunteer here?
            </label>
            <textarea
              id="motivation"
              value={motivation}
              onChange={(e) => setMotivation(e.target.value)}
              placeholder="Share your motivation..."
              rows={4}
              className="w-full rounded-xl border border-foreground/20 px-4 py-3 text-sm focus:border-jad-primary focus:outline-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-foreground/20 px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={cn(
                'rounded-xl bg-jad-primary px-4 py-2 text-sm font-semibold text-white transition-colors',
                submitting ? 'opacity-70' : 'hover:bg-jad-dark'
              )}
            >
              {submitting ? 'Submitting...' : 'Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
