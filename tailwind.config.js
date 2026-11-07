/** Конфігурація Tailwind CSS (токени дизайн-системи ЛР4). Збірка: npx tailwindcss -i tailwind.input.css -o css/tailwind.min.css --minify */
module.exports = {
  content: ['./index.html'],
  theme: {
    extend: {
      fontFamily: { sans: ['Inter', 'Segoe UI', 'Arial', 'sans-serif'] },
      colors: {
        brand: { 400: '#ff6b6b', 500: '#e31e24', 600: '#d71920', 700: '#b3141a' },
        kent: { bg: '#111111', alt: '#161616', card: '#1a1a1a', border: '#2e2e2e' },
      },
    },
  },
};
