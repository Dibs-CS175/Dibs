'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Check, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CodeInput } from '@/components/verify/code-input';
import { HousingPicker } from '@/components/verify/housing-picker';
import { requestVerificationCode, setHousingType, verifyCode } from '@/lib/actions/users';
import { RESEND_SECONDS } from '@/lib/config/app';
import { useAction } from '@/lib/hooks';
import { errorMessage } from '@/lib/errorMessages';
import type { Campus, HousingType } from '@/lib/types';

/** Format check only. Whether the address is a campus (.edu) address, and which campus, is the backend's call. */
const looksLikeEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

function VerifyFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/browse';
  const [step, setStep] = useState<'email' | 'code' | 'housing'>('email');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [resendIn, setResendIn] = useState(RESEND_SECONDS);
  const [housing, setHousing] = useState<HousingType | null>(null);
  const [campus, setCampus] = useState<Campus | null>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const send = useAction(requestVerificationCode);
  const check = useAction(verifyCode);
  const saveHousing = useAction(setHousingType);

  useEffect(() => heading.current?.focus(), [step]);
  useEffect(() => {
    if (step !== 'code' || resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendIn]);

  const formatError =
    touched && email.length > 0 && !looksLikeEmail(email) ? 'Enter an email address like you@ucr.edu.' : null;
  const sendError = send.error
    ? errorMessage(send.error, {
        VALIDATION: 'Enter an email address like you@ucr.edu.',
        NOT_EDU: 'That isn’t a campus email. Use the address your school gave you; it ends in .edu.',
        RATE_LIMITED: 'Too many codes sent. Wait a few minutes, then try again.',
      })
    : null;
  const codeError = check.error
    ? errorMessage(check.error, {
        CODE_INVALID: 'That code doesn’t match. Check the email and try again.',
        RATE_LIMITED: 'Too many tries. Wait a few minutes, then request a new code.',
      })
    : null;

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!looksLikeEmail(email)) return;
    const r = await send.run(email.trim());
    if (r?.ok) {
      setStep('code');
      setResendIn(r.data.resendAfterSeconds);
    }
  };

  const submitCode = async (code: string) => {
    const r = await check.run(email.trim(), code);
    if (r?.ok) {
      setCampus(r.data.campus);
      setStep('housing');
    } else setDigits(Array(6).fill(''));
  };

  return (
    <div className="container max-w-[560px] py-10 md:py-16">
      {step === 'email' && (
        <form className="flex flex-col gap-6" noValidate onSubmit={submitEmail}>
          <div className="flex flex-col gap-2">
            <h1 ref={heading} tabIndex={-1} className="text-4xl font-extrabold md:text-5xl">
              Verify with your campus email
            </h1>
            <p className="text-muted">Dibs is students only. We send a one-time code to your campus inbox.</p>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="email">Campus email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                inputMode="email"
                placeholder="you@ucr.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(true)}
                aria-invalid={Boolean(formatError || sendError)}
                aria-describedby="email-msg"
                className="pl-9 pr-10"
              />
              {looksLikeEmail(email) ? (
                <span
                  className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-success text-white"
                  role="img"
                  aria-label="Email format looks right"
                >
                  <Check className="h-4 w-4" strokeWidth={3} aria-hidden />
                </span>
              ) : null}
            </div>
            <p
              id="email-msg"
              className={formatError || sendError ? 'text-sm text-error' : 'text-sm text-muted'}
              role={sendError ? 'alert' : undefined}
            >
              {formatError ?? sendError ?? 'Personal emails are not accepted. Use your .edu address.'}
            </p>
          </div>
          <Button type="submit" size="lg" disabled={send.pending || !email}>
            {send.pending ? 'Sending…' : 'Send code'}
          </Button>
        </form>
      )}

      {step === 'code' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 ref={heading} tabIndex={-1} className="text-4xl font-extrabold md:text-5xl">
              Check your inbox
            </h1>
            <p className="text-muted">
              Enter the 6-digit code we sent to <strong className="text-ink">{email.trim()}</strong>. You can
              paste the whole code.
            </p>
          </div>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (digits.every(Boolean)) void submitCode(digits.join(''));
            }}
          >
            <fieldset>
              <legend className="mb-2 text-sm font-semibold">6-digit code</legend>
              <CodeInput
                value={digits}
                onChange={setDigits}
                invalid={Boolean(codeError)}
                disabled={check.pending}
                describedBy="code-msg"
              />
            </fieldset>
            <p
              id="code-msg"
              role={codeError ? 'alert' : undefined}
              className={codeError ? 'text-sm text-error' : 'text-sm text-muted'}
            >
              {codeError ?? (check.pending ? 'Checking…' : ' ')}
            </p>
            <Button type="submit" size="lg" disabled={check.pending || !digits.every(Boolean)}>
              Verify
            </Button>
          </form>
          <div className="flex items-center justify-between">
            <Button variant="link" onClick={() => setStep('email')}>
              Change email
            </Button>
            <Button
              variant="link"
              disabled={resendIn > 0 || send.pending}
              onClick={async () => {
                const r = await send.run(email.trim());
                if (r?.ok) setResendIn(r.data.resendAfterSeconds);
              }}
              className="tabular"
            >
              {resendIn > 0 ? `Resend code in 0:${String(resendIn).padStart(2, '0')}` : 'Resend code'}
            </Button>
          </div>
          {sendError ? (
            <p role="alert" className="text-sm text-error">
              {sendError}
            </p>
          ) : null}
        </div>
      )}

      {step === 'housing' && (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2 font-semibold text-success" role="status">
              <Check className="h-5 w-5" aria-hidden /> You’re verified{campus ? ` at ${campus.name}` : ''}.
            </p>
            <h1 ref={heading} tabIndex={-1} className="text-4xl font-extrabold md:text-5xl">
              Where do you live?
            </h1>
            <p className="text-muted">
              We use this to show items that fit your housing first. Residence halls already include a bed,
              desk, chair, mini-fridge and microwave.
            </p>
          </div>
          <HousingPicker value={housing} onChange={setHousing} />
          {saveHousing.error ? (
            <p role="alert" className="text-sm text-error">
              {errorMessage(saveHousing.error)}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 md:flex-row">
            <Button
              size="lg"
              className="flex-1"
              disabled={!housing || saveHousing.pending}
              onClick={async () => {
                if (!housing) return;
                const r = await saveHousing.run(housing);
                if (r?.ok) router.replace(next);
              }}
            >
              {saveHousing.pending ? 'Saving…' : 'Continue'}
            </Button>
            <Button size="lg" variant="ghost" className="flex-1" onClick={() => router.replace(next)}>
              Skip for now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyFlow />
    </Suspense>
  );
}
