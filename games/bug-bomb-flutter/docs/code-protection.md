# Flutter release protection

`tools/build_release.sh apk|appbundle|ios` gọi Flutter release với `--obfuscate --split-debug-info`.

- Chỉ bảo vệ/đổi tên ký hiệu trong Dart AOT release; đây **không phải mã hóa hoặc chống dịch ngược tuyệt đối**.
- Symbols được tạo ở thư mục riêng ngoài repository và không có trong ZIP/GitHub.
- Để giải mã stack trace của đúng bản build: `flutter symbolize -i PATH_TO_TRACE -d PATH_TO_SYMBOLS`.
- Cần build Android release trên máy có Flutter + Android SDK và thử trên thiết bị; build iOS cần macOS + Xcode.
- **Trạng thái hiện tại:** đã cấu hình, chưa build/test release (Flutter SDK không có trong môi trường tạo demo).
- Tài liệu gốc: https://docs.flutter.dev/deployment/obfuscate
