'use server';

// LIVE versions: the code your team writes. The app runs these when the data source is Live.
// They run on the server (Next.js Server Actions), so they can use a database and secrets.
// Keep every signature as it is; lib/actions/users.ts checks it against the demo version.
// Replace a stub's body with real code and delete its STUB line; `npm run stubs` counts what is left.

import { notImplemented } from '@/lib/live/not-implemented';
import { fail, ok, type Result } from '@/lib/result';
import type { HousingType, Session, Settings } from '@/lib/types';
import { RESEND_SECONDS } from '@/lib/config/app';
import { campuses } from '@/lib/fixtures/campuses';
import { createSupabaseServerClient } from '@/lib/supabase/server';

async function sendOtpCode(email: string): Promise<Result<null>> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });

  if (error) {
    if (error.status === 429 || /rate limit|too many requests/i.test(error.message)) {
      return fail('RATE_LIMITED', 'Too many codes sent. Wait a few minutes, then try again.');
    }
    return fail('UNKNOWN', `Failed to send verification code: ${error.message}`);
  }

  return ok(null);
}


/** Sends a 6-digit code. Errors: VALIDATION, NOT_EDU, RATE_LIMITED. */
export async function requestVerificationCode(email: string,): Promise<Result<{ sentTo: string; resendAfterSeconds: number }>> {
  const normalizedEmail = email.trim().toLowerCase();
  const [localPart, domain, ...extraParts] = normalizedEmail.split('@');
  const hasWhitespace = [...normalizedEmail].some((character) => character.trim() === '');
  const hasEmptyDomainLabel = domain?.split('.').some((label) => label.length === 0) ?? true;

  // sanitizes email input and ensures its in a valid format.
  if (!localPart ||  !domain ||
    extraParts.length > 0 || hasWhitespace ||
    !domain.includes('.') || hasEmptyDomainLabel ) {
    return fail('VALIDATION', 'Enter a valid email address.');
  }

  // checks if edu is in valid campuses
  if (!campuses.some((campus) => campus.emailDomain === domain)) {
    return fail('NOT_EDU', 'Use an email address from a supported campus.');
  }

  //calls sendOtpCod function to send verification code via supabase.
  const result = await sendOtpCode(normalizedEmail);
  if (!result.ok) return result;
  return ok({ sentTo: normalizedEmail, resendAfterSeconds: RESEND_SECONDS });
}







/**
 * Checks the code and starts a session. The backend decides the campus from the email.
 * Errors: CODE_INVALID, RATE_LIMITED.
 */
export async function verifyCode(email: string, code: string): Promise<Result<Session>> {


  const normalizedEmail = email.trim().toLowerCase();

  const [localPart, domain, ...extraParts] = normalizedEmail.split('@');
  const hasWhitespace = [...normalizedEmail].some((character) => character.trim() === '');
  const hasEmptyDomainLabel = domain?.split('.').some((label) => label.length === 0) ?? true;
  if (
    !localPart ||
    !domain ||
    extraParts.length > 0 ||
    hasWhitespace ||
    !domain.includes('.') ||
    hasEmptyDomainLabel ||
    !campuses.some((campus) => campus.emailDomain === domain) ||
    !/^\d{6}$/.test(code)
  ) {
    return fail('VALIDATION', 'Enter a valid campus email and 6-digit code.');
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: code,
    type: 'email',
  });

  if (authError) {
    if (authError.status === 429 || /rate limit|too many requests/i.test(authError.message)) {
      return fail('RATE_LIMITED', 'Too many tries. Wait a few minutes, then request a new code.');
    }
    if (authError.status === 400) {
      return fail('CODE_INVALID', 'That code is invalid or expired. Request a new code and try again.');
    }
    return fail('UNKNOWN', `Failed to verify code: ${authError.message}`);
  }

  if (!authData.user) {
    return fail('UNKNOWN', 'Supabase verified the code but returned no user.');
  }

  // updates supabase table
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .update({ verified: true })
    .eq('id', authData.user.id)
    .select(
      'id, campus_id, first_name, last_initial, email, housing_type, role, verified, trades_count, member_since, referral_code',
    )
    .single();

  // Table updating checks incase some part of updating the data goes wrong somehow.
  if (profileError) {
    return fail('UNKNOWN', `Code verified, but the user profile could not be loaded: ${profileError.message}`);
  }
  const campus = campuses.find((candidate) => candidate.id === profile.campus_id);
  if (!campus) {
    return fail('NOT_FOUND', 'The verified account is not associated with a supported campus.');
  }
  if (profile.role !== 'student' && profile.role !== 'admin') {
    return fail('UNKNOWN', 'The user profile has an unsupported role.');
  }
  if (
    profile.housing_type !== null &&
    profile.housing_type !== 'hall' &&
    profile.housing_type !== 'campus_apartment' &&
    profile.housing_type !== 'off_campus' &&
    profile.housing_type !== 'commuter'
  ) {
    return fail('UNKNOWN', 'The user profile has an unsupported housing type.');
  }
  ///////////////////////////////////////////////////////////////////////////////
  // Returns session of the updated user data.  
  return ok({
    user: {
      id: profile.id,
      campusId: profile.campus_id,
      firstName: profile.first_name,
      lastInitial: profile.last_initial,
      email: profile.email,
      housingType: profile.housing_type,
      role: profile.role,
      verified: profile.verified,
      tradesCount: profile.trades_count,
      memberSince: profile.member_since,
      referralCode: profile.referral_code,
    },
    campus,
  });
}

export async function setHousingType(housingType: HousingType): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return notImplemented('setHousingType', 'lib/live/actions/users.ts');
}

export async function updateSettings(settings: Settings): Promise<Result<Settings>> {
  // STUB(users): replace with real implementation
  return notImplemented('updateSettings', 'lib/live/actions/users.ts');
}

export async function signOut(): Promise<Result<null>> {
  // STUB(users): replace with real implementation
  return notImplemented('signOut', 'lib/live/actions/users.ts');
}
