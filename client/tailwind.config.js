/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cyber-bg': '#0a0e1a',
        'cyber-surface': '#0d1117',
        'cyber-card': '#161b2e',
        'cyber-border': '#1e2a45',
        'cyber-blue': '#00d4ff',
        'cyber-green': '#00ff88',
        'cyber-red': '#ff3366',
        'cyber-orange': '#ff8c00',
        'cyber-yellow': '#ffd700',
        'cyber-purple': '#7c3aed',
        'cyber-text': '#e2e8f0',
        'cyber-muted': '#64748b',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00d4ff, 0 0 10px #00d4ff' },
          '100%': { boxShadow: '0 0 10px #00d4ff, 0 0 20px #00d4ff, 0 0 40px #00d4ff' },
        },
      },
    },
  },
  plugins: [],
}
