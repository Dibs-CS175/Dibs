import type { ImpactStats } from '@/lib/types';

/** Pounds are estimates: items x the average weight for the item's category, computed by the backend. */
export const impactStats: ImpactStats = {
  itemsKeptInUse: 6312,
  estimatedPounds: 18420,
  byCategory: [
    { category: 'furniture', items: 410, pounds: 7240 },
    { category: 'electronics', items: 980, pounds: 3480 },
    { category: 'dorm_essentials', items: 2410, pounds: 3110 },
    { category: 'bikes_boards', items: 160, pounds: 2350 },
    { category: 'kitchen', items: 620, pounds: 1120 },
    { category: 'textbooks', items: 1490, pounds: 900 },
    { category: 'clothing', items: 242, pounds: 220 },
  ],
};
