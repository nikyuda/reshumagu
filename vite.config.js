import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// publicDir: false — папка public/ (если осталась в репозитории) не копируется в сборку
export default defineConfig({
  plugins: [react()],
  publicDir: false,
});
