import type { Category, Condition, HousingFit, HousingType } from '@/lib/types';

/** Residence hall move-out day. Drives the Summer Hold countdown on the landing page. */
export const MOVE_OUT_DATE = '2027-06-11T17:00:00Z';

/** Time zone used to display every date and time. Stored values are UTC. */
export const DISPLAY_TIME_ZONE = 'America/Los_Angeles';

/** Seconds before the verification code can be sent again. */
export const RESEND_SECONDS = 30;

/** How long Hold to Dibs must be pressed, in milliseconds. */
export const HOLD_TO_DIBS_MS = 600;

/** Categories that trigger the prohibited-item warning in the Sell flow. */
export const PROHIBITED_CATEGORIES: { id: string; label: string; reason: string }[] = [
  { id: 'mattress', label: 'Mattresses', reason: 'Health and pest rules.' },
  { id: 'food', label: 'Food and drinks', reason: 'Food safety.' },
  { id: 'weapons', label: 'Weapons and replicas', reason: 'Campus safety policy.' },
  { id: 'halogen', label: 'Halogen lamps', reason: 'Fire risk; banned in campus housing.' },
  { id: 'space_heater', label: 'Space heaters', reason: 'Fire risk; banned in campus housing.' },
];

export const CATEGORIES: { id: Category; label: string; icon: string }[] = [
  { id: 'dorm_essentials', label: 'Dorm Essentials', icon: 'Lamp' },
  { id: 'furniture', label: 'Furniture', icon: 'Sofa' },
  { id: 'kitchen', label: 'Kitchen', icon: 'CookingPot' },
  { id: 'textbooks', label: 'Textbooks', icon: 'BookOpen' },
  { id: 'electronics', label: 'Electronics', icon: 'Laptop' },
  { id: 'bikes_boards', label: 'Bikes & Boards', icon: 'Bike' },
  { id: 'clothing', label: 'Clothing', icon: 'Shirt' },
  { id: 'other', label: 'Other', icon: 'Package' },
];

export const CONDITIONS: { id: Condition; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'like_new', label: 'Like new' },
  { id: 'good', label: 'Good' },
  { id: 'fair', label: 'Fair' },
];

export const HOUSING_FITS: { id: HousingFit; label: string; explain: string }[] = [
  {
    id: 'dorm',
    label: 'Dorm-friendly',
    explain: 'Fine in a residence hall. Halls already include a bed, desk, chair, mini-fridge and microwave.',
  },
  {
    id: 'apartment',
    label: 'Apartment / off-campus',
    explain:
      'Residence halls do not allow outside furniture or large appliances. This fits apartments and off-campus homes.',
  },
  {
    id: 'not_allowed',
    label: 'Not allowed in campus housing',
    explain: 'Campus housing does not allow this item. Fine for off-campus homes.',
  },
];

export const HOUSING_TYPES: { id: HousingType; label: string }[] = [
  { id: 'hall', label: 'Residence hall' },
  { id: 'campus_apartment', label: 'Campus apartment' },
  { id: 'off_campus', label: 'Off-campus' },
  { id: 'commuter', label: 'Commute from home' },
];

export const MEETUP_SPOTS = ['Campus transit center', 'Library front steps (daytime)', 'Student union lobby'];

export const RATING_TAGS = ['On time', 'As described', 'Friendly', 'Easy pickup'];

export const REPORT_REASONS = [
  'Item is not as described',
  'Item is damaged',
  'The other person did not show up',
  'Prohibited item',
  'Something else',
];

export const FEATURE_FLAGS = {
  summerHold: true,
  admin: true,
};

export const QUICK_REPLIES = ['Still available?', 'Can we meet at 3?', 'Sending the meetup spot.'];
