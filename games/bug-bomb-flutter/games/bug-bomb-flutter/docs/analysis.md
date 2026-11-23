# Phân tích MVP

## Hành trình
Home → Chọn màn → (Kích nổ hoặc Giải cứu) → Thắng/Thua → Chơi lại / Màn tiếp theo.

## Phạm vi có thật
- Gameplay 2D AI di chuyển đơn giản; cả hai chế độ cùng dùng danh sách `BugActor`.
- Level 1–10 là cấu hình khác nhau, chưa có câu chuyện/hiệu ứng kỹ xảo riêng từng màn.
- Bom chủ động kích nổ, vòng ảnh hưởng, giáp bọ cánh cứng, côn trùng vô hại cần tránh.
- Tìm dấu hiệu nhấp nháy (màn 8 đổi chủ); tháo bom bằng chuỗi ký hiệu cố định.
- Tiến trình lưu cục bộ bằng `shared_preferences`; không máy chủ, không đăng nhập.

## Mô hình dữ liệu
- `LevelSpec`: id/title/mode/seconds/enemies/required/innocents/charges/instruction.
- `BugActor`: id, kind, position normalized, direction, alive, armor, hasBomb.
- `GameEngine`: timer, score, eliminated, checksLeft, charges, carrierId, defuseProgress, state.
- Local key-value: `unlocked` và `stars_1`..`stars_10`.

## Rủi ro và giới hạn
- AI dựa trên bước thời gian + random, không có navmesh/chướng ngại vật gây va chạm trong MVP.
- Level 6 dùng dấu hiệu bom nhấp nháy thay cho chiếu sáng thật; map 4 là art nền, chưa chặn tầm nhìn.
- Thiếu bộ SDK Flutter trong phiên tạo source; chưa build hoặc chạy Flutter trên điện thoại.
- Chưa có ảnh từ model ảnh GPT, bộ vector PNG là tài sản gốc thay thế, xem `assets/asset-manifest.json`.
