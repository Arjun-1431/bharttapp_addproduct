/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'dark-gray': '#242424',
        'orange-bright': '#ff752f',
      },
      screens: {
        mb1: "400px",
        tb: "700px",
        mac: "1024px",
        md: "1440px",
        sh: { 'raw': '(min-height: 700px)' },
      },
      boxShadow: {
        navbar: "0px 2px 20px 0px rgba(0, 0, 0, 0.36)",
        text: "3px 8px 11px rgba(0, 0, 0, 0.12)",
        summary: "-8px -8px 12px 0.5px #000000",
        s: "-8px -8px 13px 3px #21252B, 10px 10px 12px rgba(0, 0, 0, 0.23);",
        dark: "0 4px 10px rgba(0, 0, 0, 0.9), 0 2px 4px rgba(0, 0, 0, 0.8)",
      },
      textShadow: {
        sm: '1px 2px 10px var(--tw-shadow-color)',
        lg: '5px 2px 5px var(--tw-shadow-color)',
        xl: '10px 2px 6px var(--tw-shadow-color)',
        
      },
    },
  },
  plugins: [],
};
