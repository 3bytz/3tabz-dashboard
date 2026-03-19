import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#C8F135',
        'accent-dark': '#A8D015',
        'accent-bg': 'rgba(200,241,53,0.10)',
      },
      fontFamily: {
        sans: ['var(--font-syne)', 'system-ui', 'sans-serif'],
        body: ['var(--font-dm)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
