# Games Hub

Trang giới thiệu game, trang chi tiết (link tải Android/iOS/web), trang chính sách quyền riêng tư và trang admin để quản lý.

## Chạy local

```bash
npm install
ADMIN_PASSWORD=<mật-khẩu> npm start     # http://localhost:3000, admin tại /admin (user: admin)
```

Không đặt `ADMIN_PASSWORD` thì admin tắt hoàn toàn. Local lưu dữ liệu ở `data/games.json`, ảnh tải lên ở `public/uploads/`.

## Deploy lên Vercel

Trên Vercel hệ thống file chỉ đọc, nên dữ liệu và ảnh lưu ở **Vercel Blob**.

```bash
npm i -g vercel
vercel login
vercel link
vercel blob create-store games-hub   # hoặc tạo trong Dashboard → Storage → Blob, rồi Connect to project
vercel env add ADMIN_PASSWORD        # chọn Production (và Preview nếu cần)
vercel --prod
```

Kết nối Blob store với project sẽ tự thêm `BLOB_READ_WRITE_TOKEN`. Lần đầu, dữ liệu khởi tạo lấy từ `data/games.json`; sau lần lưu đầu tiên trong admin, dữ liệu nằm trên Blob.

Giới hạn trên Vercel: request tới hàm tối đa ~4.5MB, nên admin chỉ tải được ảnh (≤4MB). File APK hãy đưa lên GitHub Releases hoặc nơi lưu file khác rồi dán link vào ô "Link tải Android".

## Cấu trúc

- `app.mjs`: ứng dụng Express (trang công khai, admin API). `server.mjs`: chạy local. `api/index.mjs`: điểm vào Vercel.
- `lib/store.mjs`: lưu dữ liệu (đĩa hoặc Blob). `lib/render.mjs`: HTML các trang công khai.
- `admin-ui/`: giao diện admin (chỉ phục vụ sau đăng nhập). `public/`: tệp tĩnh công khai.
