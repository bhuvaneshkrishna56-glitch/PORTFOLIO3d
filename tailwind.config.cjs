import type { Config } from 'tailwindcss';

export default <Config>{
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class', // enable class‑based dark mode
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 100%, 55%)',
        secondary: 'hsl(210, 40%, 30%)',
        accent: 'hsl(45, 100%, 55%)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};
