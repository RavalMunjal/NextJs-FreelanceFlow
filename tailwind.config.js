/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Forest Green Palette
        forest: {
          DEFAULT: "#173D32",
          dark: "#0F2821",
          light: "#215344",
          hover: "#1E4B3E",
        },
        // Sage Green
        sage: {
          DEFAULT: "#477960",
          light: "#E6EEE1",
          dark: "#356451",
          border: "#C7D8C0",
        },
        // Accent Copper Gold
        copper: {
          DEFAULT: "#C58B55",
          light: "#DFAB7B",
          dark: "#A56E3C",
          hover: "#B87F4C",
        },
        // Warm Cream Backgrounds
        cream: {
          DEFAULT: "#F7F5EF",
          card: "#FFFFFF",
          sidebar: "#173D32",
          dark: "#EFECE2",
          border: "#E4E1D9",
        },
        // Text Colors
        textColor: {
          primary: "#24332D",
          secondary: "#737B72",
          muted: "#969E95",
        },
        // Status & Alerts
        warning: {
          DEFAULT: "#B77932",
          light: "#FDF5EA",
          dark: "#8F5C22",
        },
        terracotta: {
          DEFAULT: "#B95449",
          light: "#FCEEED",
          dark: "#963F36",
        },
      },
    },
  },
  plugins: [],
};
