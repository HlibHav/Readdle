/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // === COLORS ===
      // shadcn/ui CSS variable-based colors
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // iOS blue variants for backward compatibility
          dark: '#0051D5',
          light: '#5AC8FA',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: '#C7C7CC',
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          // Additional accent colors (use sparingly for emphasis)
          green: '#34C759',
          orange: '#FF9500',
          red: '#FF3B30',
          purple: '#AF52DE',
          pink: '#FF2D55',
          yellow: '#FFCC00',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Neutral colors (backgrounds, borders, text)
        neutral: {
          50: '#FAFAFA',
          100: '#F2F2F7',
          200: '#E5E5EA',
          300: '#D1D1D6',
          400: '#C7C7CC',
          500: '#AEAEB2',
          600: '#8E8E93',
          700: '#636366',
          800: '#48484A',
          900: '#1C1C1E',
        },
        
        // Semantic colors (for status and feedback)
        success: '#34C759',
        warning: '#FFCC00',
        error: '#FF3B30',
        info: '#007AFF',
        
        // Chart colors
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      
      // === SPACING ===
      // Use these for consistent margins and padding
      // Example: p-xs, m-md, gap-lg
      spacing: {
        'xs': '0.25rem',   // 4px
        'sm': '0.5rem',    // 8px
        'md': '1rem',      // 16px
        'lg': '1.5rem',    // 24px
        'xl': '2rem',      // 32px
        '2xl': '3rem',     // 48px
        '3xl': '4rem',     // 64px
      },
      
      // === FONT SIZES ===
      // Use these for consistent typography
      // Example: text-body, text-heading, text-caption
      fontSize: {
        'caption': ['0.75rem', { lineHeight: '1rem' }],      // 12px
        'body-sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px
        'body': ['1rem', { lineHeight: '1.5rem' }],          // 16px
        'body-lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
        'heading-sm': ['1.25rem', { lineHeight: '1.75rem' }], // 20px
        'heading': ['1.5rem', { lineHeight: '2rem' }],       // 24px
        'heading-lg': ['2rem', { lineHeight: '2.5rem' }],    // 32px
        'display': ['2.5rem', { lineHeight: '3rem' }],       // 40px
      },
      
      // === BORDER RADIUS ===
      // Use these for consistent rounded corners
      // Example: rounded-card, rounded-button
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // Custom radius values for backward compatibility
        'button': '0.5rem',    // 8px - for buttons
        'card': '0.75rem',     // 12px - for cards
        'modal': '1rem',       // 16px - for modals
        'pill': '9999px',      // full round - for pills/badges
      },
      
      // === SHADOWS ===
      // Use these for consistent elevation
      // Example: shadow-card, shadow-modal
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.12)',
        'modal': '0 8px 24px rgba(0, 0, 0, 0.15)',
        'dropdown': '0 4px 16px rgba(0, 0, 0, 0.1)',
      },
      
      // === ANIMATIONS ===
      // Predefined animations for common UI patterns
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
