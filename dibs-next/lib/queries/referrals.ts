// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/queries/referrals.ts)
// or its Live version (your code, lib/live/queries/referrals.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/queries/referrals';
import * as live from '@/lib/live/queries/referrals';

export const checkReferralCode = choose(demo.checkReferralCode, live.checkReferralCode);
