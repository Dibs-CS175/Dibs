// Pages import from this file. Each function runs its Demo version (lib/demo/actions/photos.ts)
// or its Live version (your code, lib/live/actions/photos.ts), depending on the data source picked in
// the preview panel (/dev). Nothing else belongs here.

import { choose } from '@/lib/dev/choose';
import * as demo from '@/lib/demo/actions/photos';
import * as live from '@/lib/live/actions/photos';

export const uploadPhoto = choose(demo.uploadPhoto, live.uploadPhoto);
