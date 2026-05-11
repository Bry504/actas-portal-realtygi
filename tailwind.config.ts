import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#1A1A1A',
        surface: '#2D2D2D',
        accent: '#E8621A',
        'accent-hover': '#D4571A',
      },
    },
  },
  plugins: [],
}

export default config
