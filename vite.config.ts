import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3300, // 修改为你想用的端口
    open: true, // 启动后自动打开浏览器
    host: '0.0.0.0', // 允许局域网访问
    strictPort: false, // 若端口被占用，自动尝试下一个可用端口
    proxy: {
      // 当请求以 /api 开头时，代理到后端服务
      '/api': {
        target: 'http://localhost:5300', // 填入你后端的实际运行端口
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
