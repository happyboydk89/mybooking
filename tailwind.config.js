/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      colors: {
        primary: '#4F46E5',
        'primary-focus': '#4338CA',
        secondary: '#06B6D4',
        'secondary-focus': '#0891B2',
        accent: '#FF69B4',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          'primary': '#4F46E5',
          'primary-focus': '#4338CA',
          'primary-content': '#ffffff',
          'secondary': '#06B6D4',
          'secondary-focus': '#0891B2',
          'secondary-content': '#ffffff',
          'accent': '#FF69B4',
          'accent-focus': '#EC407A',
          'base-100': '#FFFFFF',
          'base-200': '#F3F4F6',
          'base-300': '#E5E7EB',
          'base-content': '#1F2937',
        },
      },
    ],
  },
  plugins: [require('daisyui')],
}