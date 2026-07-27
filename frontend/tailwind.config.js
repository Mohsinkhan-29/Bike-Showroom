/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        asphalt: { DEFAULT: "#17181A", 2: "#1E2023" },
        steel: { DEFAULT: "#2A2C31", line: "#3A3D43" },
        paper: { DEFAULT: "#EFE9DC", 2: "#E4DCC9" },
        ink: { DEFAULT: "#1C1B18", soft: "#4A473E" },
        amber: { DEFAULT: "#FFB020", dim: "#C98A1C" },
        chrome: { DEFAULT: "#9A9C9F", light: "#D6D7D9" },
        offwhite: "#F5F3ED",
        danger: "#C0392B",
      },
      fontFamily: {
        display: ['"Oswald"', '"Arial Narrow"', "sans-serif"],
        body: ['"Inter"', "-apple-system", "sans-serif"],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', "Consolas", "monospace"],
      },
      borderRadius: {
        DEFAULT: "3px",
      },
    },
  },
  plugins: [],
};
