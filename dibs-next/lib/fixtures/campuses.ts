import type { Campus, MeetupSpot } from '@/lib/types';

// Fictional campus records for the prototype. Names are city names only.
export const campuses: Campus[] = [
  { id: 'riverside', name: 'Riverside', emailDomain: 'ucr.edu', timezone: 'America/Los_Angeles' },
  { id: 'san-bernardino', name: 'San Bernardino', emailDomain: 'csusb.edu', timezone: 'America/Los_Angeles' },
];

const spot = (id: string, campusId: string, name: string, description: string): MeetupSpot => ({
  id,
  campusId,
  name,
  description,
});

export const meetupSpots: MeetupSpot[] = [
  spot('ms_r1', 'riverside', 'Transit center', 'Covered benches by the bus bays. Busy all day.'),
  spot('ms_r2', 'riverside', 'Library front steps', 'Daytime only. Lots of foot traffic.'),
  spot('ms_r3', 'riverside', 'Student union lobby', 'Indoors, staffed front desk.'),
  spot('ms_r4', 'riverside', 'Rec center entrance', 'Well lit, open late.'),
  spot('ms_r5', 'riverside', 'North parking structure, level 1', 'Good for large items you need a car for.'),
  spot('ms_s1', 'san-bernardino', 'Library plaza', 'Open seating, busy between classes.'),
  spot('ms_s2', 'san-bernardino', 'Student union patio', 'Daytime only.'),
  spot('ms_s3', 'san-bernardino', 'Rec center lobby', 'Indoors, staffed front desk.'),
  spot('ms_s4', 'san-bernardino', 'Main bus stop', 'Covered and well lit.'),
  spot('ms_s5', 'san-bernardino', 'Lot D loading area', 'Good for large items you need a car for.'),
];
