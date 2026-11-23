# Kiểm chứng 2026-11-23

| Bước | Bằng chứng | Trạng thái |
|---|---|---|
| Spec | `docs/features.md`, các mã F-01..F-05/SEC-BUILD | Done |
| Plan | `docs/analysis.md`, `docs/design.md` | Done |
| Code | `lib/game/`, `lib/ui/`, `assets/images`, `tools/` | Done |
| Review | Đối chiếu chức năng với code và rà logic biên | Source review; còn cần Flutter analyzer |
| Test Dart | `flutter test` và `flutter analyze` | **CHƯA CHẠY: không có Flutter/Dart SDK trong container** |
| Build Android/iOS | `tools/build_release.sh` | **CHƯA CHẠY: không có Flutter SDK/Xcode** |
| Sprite PNG QA | `tools/generate_art.py` kiểm tra kích thước và alpha | Passed |
| Gameplay trên thiết bị | Thử điều khiển, HUD, lưu tiến trình 10 level | Chưa chạy |

Cần chạy các bước còn thiếu trên máy có Flutter SDK trước khi gọi đây là bản build hoàn thiện.
