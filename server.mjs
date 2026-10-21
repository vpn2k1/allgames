// Chạy local: node server.mjs (hoặc npm start). Trên Vercel dùng api/index.mjs.
import app from './app.mjs';
import { usingBlob } from './lib/store.mjs';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Games hub: http://localhost:${PORT}`);
  console.log(process.env.ADMIN_PASSWORD ? `Admin: http://localhost:${PORT}/admin (user: ${process.env.ADMIN_USER || 'admin'})` : 'Admin đang tắt (chưa có ADMIN_PASSWORD)');
  console.log(usingBlob ? 'Lưu trữ: Vercel Blob' : 'Lưu trữ: data/games.json trên đĩa');
});
