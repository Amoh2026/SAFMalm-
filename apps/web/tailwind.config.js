/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 👇 ADD THIS BLOCK
      fontVariantNumeric: {
        western: 'lining-nums tabular-nums',
      },
      height: {
        '75': '18.75rem',
        '100': '25rem',
        '125': '31.25rem',
        '137.5': '34.375rem',
      },
      minHeight: {
        '125': '31.25rem',
        '137.5': '34.375rem',
        '175': '43.75rem',
        '200': '50rem',
        '225': '56.25rem',
      },
    },
  },
  plugins: [],
};