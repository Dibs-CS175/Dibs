'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** The user's own referral code with a copy button. */
export function ReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-card border border-line bg-surface px-3 py-2">
      <span className="text-sm text-muted">Your referral code</span>
      <span className="font-mono text-base font-semibold">{code}</span>
      <Button
        variant="ghost"
        size="sm"
        aria-label={copied ? 'Copied' : 'Copy referral code'}
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            setCopied(false);
          }
        }}
      >
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
      </Button>
    </div>
  );
}
