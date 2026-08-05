/**
 * AIAA-Zewail City — Aerospace Terminal Design Tokens
 * ----------------------------------------------------------
 * Per the "anti-slop" framework:
 *   • Sharp 90° corners everywhere. No pill / rounded-sheet variants.
 *   • No drop shadows. Planar surfaces only.
 *   • No gradient text or bg gradients on cards.
 *   • Geist (geometric sans) for headings.
 *   • JetBrains Mono for all metadata, tags, dates, statuses.
 *
 * Reference colors:
 *   Navy Blue      #1A3D6D  - Structural elements, headers, footers
 *   AIAA Blue      #3179A7  - Interactive hover states
 *   AIAA Purple    #742A88  - Form focus accents
 *   AIAA Yellow    #F1B82D  - Primary CTAs (sparingly)
 *   AIAA Orange    #CC4100  - High-energy accent (sparingly)
 *   AIAA Green     #65A602  - Success / growth
 *   Neutral Black  #231F20  - Off-black body text (no #000)
 */

const aiaaNavy   = '#1A3D6D';
const aiaaBlue   = '#3179A7';
const aiaaPurple = '#742A88';
const aiaaYellow = '#F1B82D';
const aiaaOrange = '#CC4100';
const aiaaGreen  = '#65A602';

const palette = {
  ink: {
    50:  '#F7F6F2',
    100: '#EDEBE2',
    200: '#D3CFC0',
    300: '#A8A498',
    400: '#736E63',
    500: '#4A463E',
    600: '#36322C',
    700: '#231F20',
    800: '#1A1718',
    900: '#100E0F',
  },
  navy: {
    50:  '#EEF2F7',
    100: '#D4DEEA',
    200: '#A9BCD5',
    300: '#7C9AC0',
    400: '#4F7AAB',
    500: aiaaBlue,
    600: '#265F86',
    700: aiaaNavy,
    800: '#152F55',
    900: '#0F223D',
  },
  accent: {
    50:  '#FBF6EE',
    100: '#F6EAD3',
    200: '#EBD49F',
    300: '#DFBC6C',
    400: aiaaYellow,
    500: '#E0A41C',
    600: aiaaOrange,
    700: '#A83400',
  },
  signal: {
    50:  '#EFF6E0',
    100: '#D7E9A6',
    200: '#B6D86E',
    300: '#95C738',
    400: aiaaGreen,
    500: '#558A01',
    600: '#456F01',
  },
  iris: {
    50:  '#F3EBF4',
    100: '#E1CEE3',
    200: '#C49FCC',
    300: '#A670B5',
    400: '#88509D',
    500: aiaaPurple,
    600: '#5E2270',
    700: '#481B57',
  },
};

module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'featured-blue':  palette.navy[700],
        'featured-green': palette.signal[400],
        'zewail-cyan':    palette.navy[500],
        'hover-blue':     palette.navy[500],
        aiaa:             palette.navy[700],
        'aiaa-blue':      palette.navy[700],

        paper:           palette.ink[50],
        canvas:          palette.ink[100],
        line:            '#E2DED2',
        'line-strong':   palette.ink[700],

        ink:             palette.ink[700],
        'ink-soft':      palette.ink[500],
        'ink-muted':     palette.ink[400],

        navy:            palette.navy,
        deep:            palette.navy[700],
        sea:             palette.navy[500],

        spark:           palette.accent[400],
        ember:           palette.accent[600],
        glow:            palette.accent[300],

        growth:          palette.signal[400],
        harvest:         palette.signal[200],

        iris:            palette.iris[500],
        focus:           palette.iris[500],

        'accent-yellow-soft': palette.accent[100],
        'accent-orange-soft': '#FBE4D5',
        'signal-soft':        palette.signal[100],
        'iris-soft':          palette.iris[100],
      },
      fontFamily: {
        sans:     ['var(--font-body)', 'system-ui', 'sans-serif'],
        display:  ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono:     ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        eyebrow: ['0.7rem', { lineHeight: '1.25', letterSpacing: '0.18em' }],
      },
      // Sharp 90° corners. No custom large radii.
      borderRadius: {
        none: '0',
      },
      transitionTimingFunction: {
        human: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '200ms',
        slow: '320ms',
      },
      gridTemplateColumns: {
        frame: 'repeat(12, minmax(0, 1fr))',
        dense: 'repeat(12, 80px minmax(0, 1fr) 80px)',
      },
      keyframes: {
        'rise-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'mark': {
          '0%':   { opacity: '0', transform: 'scaleX(0)' },
          '100%': { opacity: '1', transform: 'scaleX(1)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.35' },
        },
      },
      animation: {
        'rise-in': 'rise-in 320ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'mark':    'mark 220ms cubic-bezier(0.4, 0, 0.2, 1) both',
        'orbit':   'orbit 6s linear infinite',
        'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
      },
      backgroundImage: {
        // Subtle blueprint grid for terminal backgrounds. No fancy gradients.
        'paper-grid':
          "linear-gradient(rgba(26,61,109,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(26,61,109,0.07) 1px, transparent 1px)",
        // Very subtle topographic wash (used sparingly on hero band only).
        'topo':
          "radial-gradient(circle at 18% 12%, rgba(26, 61, 109, 0.10) 0%, transparent 38%), radial-gradient(circle at 78% 32%, rgba(204, 65, 0, 0.07) 0%, transparent 42%)",
      },
      // No drop shadows. Plane surfaces only.
      boxShadow: {
        none: 'none',
      },
    },
  },
  plugins: [],
};
