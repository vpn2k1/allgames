# Art direction / UI

- **Tỉ lệ mục tiêu:** dọc 9:16, safe area thông qua `SafeArea`; logic tọa độ chuẩn hóa 0..1.
- **Cấu trúc:** Home full hero → Level list → Gameplay HUD top + arena flexible + joystick/action bottom → result overlay.
- **Màu:** deep `#103D43`, teal `#217F81`, cream `#FFF3D5`, orange `#FFA24A`, coral `#FF685C`, mint `#BFEADA`.
- **Nhân vật:** đầu to, thân tròn, mắt trắng nổi, line ngoài sẫm; đọc silhouette ở 38–66 dp.
- **Sprite:** PNG nhân vật 256x256 nền alpha, scene `kitchen.png` 720x1200, splash `cover.png` 720x1100.
- **Chạm:** mục tiêu 48 dp; joystick 104 dp; nút Boom 112×90 dp. Có ngữ nghĩa Semantics cho icon chính.
- **Không dùng ảnh làm nút UI**: các nút và chữ là widget Flutter; chỉ sprite và background là PNG.
- **Trạng thái:** playing, paused, won, lost; mini-game tháo bom phủ lên arena.
- **Nguồn hình:** bộ vector viết bằng code, không phải kết quả image_gen; có SVG master trong `assets/source` và công cụ `tools/generate_art.py`.
