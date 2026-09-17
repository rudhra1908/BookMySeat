/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './*.jsx'],
  theme: {
    extend: {
      colors: {
        ink: '#0A0E1A',        // page background — near-black navy
        surface: '#131A2E',     // card background
        surface2: '#1C2440',    // raised/hover surface
        line: '#2A3358',        // hairlines, dashed borders
        parchment: '#F3EFE3',   // primary text — warm off-white
        dim: '#8B92B4',         // secondary text
        lime: '#D6FF3F',        // available / success / "go"
        magenta: '#FF3E7F',     // booked / expired / alert
        violet: '#9C7CFF',      // selected / interactive accent
        amber: '#FFB238',       // check-in countdown / warning
      },
      fontFamily: {
        display: ['"Archivo Black"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        body: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(214,255,63,0.4), 0 0 24px rgba(214,255,63,0.35)',
        'glow-violet': '0 0 0 1px rgba(156,124,255,0.5), 0 0 24px rgba(156,124,255,0.4)',
        'glow-magenta': '0 0 0 1px rgba(255,62,127,0.4), 0 0 20px rgba(255,62,127,0.3)',
      },
      keyframes: {
        flicker: {
          '0%, 100%': { opacity: 1 },
          '92%': { opacity: 1 },
          '93%': { opacity: 0.4 },
          '94%': { opacity: 1 },
        },
        scan: {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '0 40px' },
        },
        stamp: {
          '0%': { transform: 'scale(2.2) rotate(-12deg)', opacity: 0 },
          '60%': { transform: 'scale(0.9) rotate(-12deg)', opacity: 1 },
          '100%': { transform: 'scale(1) rotate(-12deg)', opacity: 1 },
        },
        rise: {
          '0%': { transform: 'translateY(8px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        flicker: 'flicker 4s infinite',
        stamp: 'stamp 0.4s cubic-bezier(.2,1.4,.4,1)',
        rise: 'rise 0.3s ease-out',
      },
      backgroundImage: {
        noise:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
