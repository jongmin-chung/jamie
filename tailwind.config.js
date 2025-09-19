import plugin from 'tailwindcss/plugin'

const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1200px',
      },
    },
    extend: {
      fontFamily: {
        sans: [
          'Noto Sans KR"',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI"',
          'Roboto',
          'Helvetica Neue"',
          'Arial',
          'Noto Sans"',
          'sans-serif',
          'Apple Color Emoji"',
          'Segoe UI Emoji"',
          'Segoe UI Symbol"',
          'Noto Color Emoji"',
          'Malgun Gothic"',
          '맑은 고딕"',
          'Dotum',
          '돋움',
          'Gulim',
          '굴림',
        ],
        'noto-sans-kr': ['Noto Sans KR"', 'sans-serif'],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        kakao: {
          yellow: '#FFEB00',
          'dark-text': '#060B11',
          white: '#FFFFFF',
          'light-gray': '#EFF2F4',
          'medium-gray': '#E3E8EC',
          'text-white-48': 'rgba(255, 255, 255, 0.48)',
          'text-dark-48': 'rgba(6, 11, 17, 0.48)',
        },
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        'card-themes': {
          purple: {
            light: '#F3F0FF',
            medium: '#E0D4FF',
            dark: '#7C3AED',
            accent: '#A855F7',
          },
          teal: {
            light: '#F0FDFA',
            medium: '#CCFBF1',
            dark: '#0F766E',
            accent: '#14B8A6',
          },
          lavender: {
            light: '#FAF5FF',
            medium: '#E9D5FF',
            dark: '#7E22CE',
            accent: '#A855F7',
          },
          orange: {
            light: '#FFF7ED',
            medium: '#FFEDD5',
            dark: '#C2410C',
            accent: '#EA580C',
          },
          blue: {
            light: '#EFF6FF',
            medium: '#DBEAFE',
            dark: '#1D4ED8',
            accent: '#2563EB',
          },
          green: {
            light: '#F0FDF4',
            medium: '#DCFCE7',
            dark: '#166534',
            accent: '#16A34A',
          },
          pink: {
            light: '#FDF2F8',
            medium: '#FCE7F3',
            dark: '#BE185D',
            accent: '#EC4899',
          },
          cyan: {
            light: '#ECFEFF',
            medium: '#CFFAFE',
            dark: '#0E7490',
            accent: '#0891B2',
          },
        },
      },
      spacing: {
        6: '24px',
        21: '84px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'float-slow': {
          '0%, 100%': {
            transform: 'translateY(0px) rotate(45deg)',
          },
          '50%': {
            transform: 'translateY(-10px) rotate(45deg)',
          },
        },
        'float-fast': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-15px)',
          },
        },
        'spin-slow': {
          from: {
            transform: 'rotate(0deg)',
          },
          to: {
            transform: 'rotate(360deg)',
          },
        },
        'bounce-horizontal': {
          '0%, 100%': {
            transform: 'translateX(0px)',
          },
          '50%': {
            transform: 'translateX(10px)',
          },
        },
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'float-slow': 'float-slow 6s ease-in-out infinite',
        'float-fast': 'float-fast 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'bounce-horizontal': 'bounce-horizontal 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 1s ease-out forwards',
        'fade-in-up-delay': 'fade-in-up 1s ease-out 0.3s forwards',
        'fade-in-up-delay-2': 'fade-in-up 1s ease-out 0.6s forwards',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        '.prose': {
          maxWidth: 'none',
          color: 'inherit',
        },
        '.prose a': {
          color: 'inherit',
          textDecoration: 'underline',
          fontWeight: '500',
        },
        '.prose strong': {
          color: 'inherit',
          fontWeight: '600',
        },
        '.border-l-3': {
          borderLeftWidth: '3px',
        },
      })
    }),
    require('tailwindcss-animate'),
  ],
}

export default config
