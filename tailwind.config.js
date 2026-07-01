module.exports = {
  /** @type {import('tailwindcss').Config} */
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#114D8F',
          dark: '#0E3F75',
        },
        primary: {
          light: '#6fb3e0',
          DEFAULT: '#4D9FD6',
          dark: '#3480b3',
        },
        secondary: {
          light: '#f8f9fa',
          DEFAULT: '#e9ecef',
          dark: '#dee2e6',
        },
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(16, 24, 40, 0.04)',
        DEFAULT: '0 1px 2px 0 rgba(16, 24, 40, 0.05), 0 1px 3px 0 rgba(16, 24, 40, 0.04)',
        md: '0 4px 12px -2px rgba(16, 24, 40, 0.08), 0 2px 6px -2px rgba(16, 24, 40, 0.05)',
        lg: '0 12px 24px -6px rgba(16, 24, 40, 0.10), 0 4px 8px -4px rgba(16, 24, 40, 0.05)',
        xl: '0 20px 40px -12px rgba(16, 24, 40, 0.12), 0 8px 16px -8px rgba(16, 24, 40, 0.06)',
      },
    },
  },
  plugins: [],
};
