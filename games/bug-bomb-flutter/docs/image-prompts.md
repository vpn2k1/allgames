# Prompt để nâng cấp sprite bằng công cụ tạo ảnh GPT

**Lưu ý:** Trong phiên phát triển này không có image_gen để gọi trực tiếp. Asset hiện có là vector gốc được tạo bằng Python SVG/CairoSVG, không được mô tả là ảnh AI.

## Style lock chung
"Production-ready 2D casual mobile game sprite, top-down three-quarter view, super cute chibi insect mascot, rounded plump shape, large expressive white eyes, thick clean dark warm outlines, soft cel shading, restrained palette teal orange honey yellow mint, consistent lighting from upper left, subject fully inside canvas, single character, no text, no lettering, no watermark, no props outside silhouette, genuine transparent alpha background, square 1024x1024."

### Gián Bùm Bùm
"Cute warm-brown cockroach carrying a chunky red magical countdown backpack on its lower body, friendly mischievous grin, two antennas, six short rounded legs, readable clock icon, [STYLE LOCK]"

### Bé Đốm
"Cute red ladybug detective with a cream detective hat, three dark shell spots on each side, friendly large eyes, hand-held tiny magnifying glass, [STYLE LOCK]"

### Kiến
"Cute caramel-colored ant with three distinctly rounded body segments, tiny smiling expression, six legs, [STYLE LOCK]"

### Muỗi
"Cute sky-blue mosquito with translucent symmetrical wings and no sharp threatening stinger, huge friendly eyes, [STYLE LOCK]"

### Bọ cánh cứng
"Cute emerald green beetle with heavy domed shiny shell, pale mint highlights, sturdy short legs, [STYLE LOCK]"

### Bản đồ bếp
"Vertical seamless 2D mobile casual top-down kitchen floor map, soft beige alternating floor tiles, toy-like turquoise sink in top-left, small tan pantry in top-right, cabinet in bottom-left, a plant in bottom-right, center open clear for 30 small moving insect characters, no written labels, 9:16, 1080x1920."

## Import
Xuất mỗi sprite vào `assets/images/<name>.png` với kích thước 256x256 RGBA, giữ tên file. Chạy QA alpha trong `assets/asset-manifest.json` và xem sprite trên background tại kích thước thật. Nếu ảnh GPT không có nền alpha thì cắt nền trước khi thay.
