import type { Config } from 'tailwindcss';
import animate from 'tailwindcss-animate';

const v = (n: string) => `var(--${n})`;

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: '1rem', screens: { '2xl': '1200px' } },
    extend: {
      colors: {
        peel: v('peel'),
        surface: v('surface'),
        ink: v('ink'),
        muted: v('muted'),
        grove: v('grove'),
        navel: v('navel'),
        rind: v('rind'),
        zest: v('zest'),
        success: v('success'),
        error: v('error'),
        line: v('line'),
        sunk: v('sunk'),
        'on-accent': v('on-accent'),
        'on-grove': v('on-grove'),
        'success-bg': v('success-bg'),
        'error-bg': v('error-bg'),
        'warning-bg': v('warning-bg'),
        // shadcn/ui token names, mapped onto the Dibs palette
        background: v('peel'),
        foreground: v('ink'),
        border: v('line'),
        input: v('line'),
        ring: v('navel'),
        primary: { DEFAULT: v('grove'), foreground: v('on-grove') },
        secondary: { DEFAULT: v('sunk'), foreground: v('ink') },
        destructive: { DEFAULT: v('error'), foreground: '#ffffff' },
        accent: { DEFAULT: v('sunk'), foreground: v('ink') },
        popover: { DEFAULT: v('surface'), foreground: v('ink') },
        card: { DEFAULT: v('surface'), foreground: v('ink') },
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: { input: '10px', card: '12px', sheet: '16px', lg: '12px', md: '10px', sm: '8px' },
      transitionDuration: { 120: '120ms', 200: '200ms', 320: '320ms' },
      transitionTimingFunction: { dibs: 'cubic-bezier(.2,.8,.2,1)' },
      maxWidth: { content: '1200px' },
      boxShadow: { 1: '0 1px 2px rgba(20,32,26,.08)', 2: '0 8px 24px rgba(20,32,26,.14)' },
    },
  },
  plugins: [animate],
};

export default config;
