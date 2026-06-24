/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#0c0c0c',
        accent: '#1bf3cb',
        muted: '#666666',
        label: '#999999',
        placeholder: '#555555',
        'input-bg': 'rgba(255,255,255,0.03)',
        'input-border': 'rgba(255,255,255,0.08)',
        'social-bg': 'rgba(255,255,255,0.06)',
      },
      fontFamily: {
        outfit: ['Outfit_400Regular'],
        'outfit-medium': ['Outfit_500Medium'],
        'outfit-semibold': ['Outfit_600SemiBold'],
        'outfit-bold': ['Outfit_700Bold'],
      },
    },
  },
  plugins: [],
};
