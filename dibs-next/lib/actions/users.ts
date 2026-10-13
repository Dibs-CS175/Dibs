// Pages import from this file. Each function runs its Demo version (fixtures, lib/demo/actions/users.ts)
// or its Live version (your code, lib/live/actions/users.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/users';
import * as live from '@/lib/live/actions/users';

export const requestVerificationCode = choose(demo.requestVerificationCode, live.requestVerificationCode);
export const verifyCode = choose(demo.verifyCode, live.verifyCode);
export const setHousingType = choose(demo.setHousingType, live.setHousingType);
export const updateSettings = choose(demo.updateSettings, live.updateSettings);
export const signOut = choose(demo.signOut, live.signOut);
