import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Mukta',
          'Noto Sans Devanagari',
          'Tiro Devanagari Hindi',
          'Hind',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ],
      },
      colors: {
        // Primary
        deepCharcoal: '#1a1a1a', // Main headlines, body text
        newsRed: '#c41e3a', // Breaking news, accents, highlights
        cleanWhite: '#ffffff', // Main background, cards

        // Secondary
        slateBody: '#4a4a4a', // Body text, captions
        editorialBlue: '#1e5a8e', // Links, interactive elements
        subtleGray: '#f5f5f5', // Page background, dividers

        // Accent
        premiumGold: '#d4af37', // Premium content badges
        successGreen: '#2d5016', // Success states
        metaGray: '#8b8b8b', // Timestamps, metadata
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
export default config;

