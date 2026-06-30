import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// campaign.json and whys.json live at the project root (the design deliverables)
// and are the single source of truth. They are imported from src/ via ../*.json,
// which Vite permits because they are inside the project root.
export default defineConfig({
  plugins: [react()],
  server: { host: true },
});
