import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  proxy: {
    '/api': {
      // target: 'https://comorbidity.top', // 生产环境
      target: 'http://127.0.0.1:8300',
      changeOrigin: true,
      // rewrite: (path) => path.replace(/^\/api/, '')  // 如果后端API已经包含/api前缀，则不需要重写
    }
  }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
