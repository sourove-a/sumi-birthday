import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' -> the built site works from any folder or sub-path
// (Netlify, Vercel, GitHub Pages, cPanel ...).
export default defineConfig({
  base: './',
  plugins: [react()],
});
