import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // No hardcoded port or proxy — use VITE_API_BASE_URL env variable for API URL
});
