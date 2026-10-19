/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#FBFBFC',
        sidebar: {
          DEFAULT: '#FFFFFF',
          foreground: '#0F172A',
          border: '#E2E8F0',
          accent: '#F1F5F9',
          'accent-foreground': '#0F172A',
          muted: '#64748B',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        slate: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        emerald: {
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
        },
        amber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          500: '#F59E0B',
          700: '#B45309',
        },
        rose: {
          50: '#FFF1F2',
          100: '#FFE4E6',
          200: '#FECDD3',
          500: '#F43F5E',
          600: '#E11D48',
          700: '#BE123C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Space Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "linear-gradient(to right, rgba(226, 232, 240, 0.65) 1px, transparent 1px), linear-gradient(to bottom, rgba(226, 232, 240, 0.65) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-32': '32px 32px',
      },
      boxShadow: {
        'tactile': '0 4px 0 #1E3A8A',
        'tactile-sm': '0 2px 0 #1E3A8A',
        'subtle': '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
