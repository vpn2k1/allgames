# Spec → Plan → Code → Review → Test

| ID | Spec / tiêu chí chấp nhận | Plan / triển khai | Review | Test |
|---|---|---|---|---|
| F-01-AC-01 | Di chuyển gián theo joystick, thời gian giảm khi chơi | `engine.tick`, `Joystick`, `PlayScreen` | Giới hạn tọa độ và vector unit | Thủ công: xoay joystick, thả dừng |
| F-01-AC-02 | Vụ nổ trừ giáp, tính combo, giới hạn số bom, bảo vệ bọ rùa | `engine.boom` | Một bug chỉ bị tính điểm một lần | `test/game_engine_test.dart`: combo, giáp, safe hits |
| F-02-AC-01 | Tìm đúng bug mang bom, sai mất lượt | `engine.inspect` + sprite blink | Không nhận bug ID không tồn tại | `game_engine_test`: selection |
| F-02-AC-02 | Ghép ba ký hiệu đúng để tháo bom, sai trừ thời gian | `engine.defuse` + panel | Khóa UI sau thắng/thua | `game_engine_test`: đúng/sai |
| F-02-AC-03 | Level 8 bom chuyển chủ sau 8 giây | `_swapCarrier` | Không tạo 2 bom cùng lúc | `game_engine_test`: carrier |
| F-03-AC-01 | Level 10 cứu rồi boom trong cùng màn | `_setup(Mode.boom)` | Giữ điểm giữa 2 pha | `game_engine_test`: hybrid |
| F-04-AC-01 | Hiển thị 10 màn và chỉ mở màn đã thắng | `LevelSelectPage`, prefs | Giới hạn 1..10 | Thủ công, SDK chưa có |
| F-04-AC-02 | Lưu sao và màn mở mới qua lần chạy lại | `_saveWin`, `SharedPreferencesAsync` | Lưu best score stars | Thủ công, SDK chưa có |
| F-05-AC-01 | Pause dừng thời gian và resume | `engine.togglePause` | Không tick khi pause | `game_engine_test`: pause |
| F-05-AC-02 | Hết thời gian thua, có thể chơi lại | `engine.tick` + overlay | Không ghi điểm sau hết lượt | `game_engine_test`: timer |
| SEC-BUILD-AC-01 | Release Dart có obfuscation, symbols không commit | `tools/build_release.sh`, `.gitignore` | Đường dẫn symbols ở ngoài project | Chưa chạy do thiếu Flutter SDK |

## Quy tắc khi sửa
Mỗi thay đổi phải cập nhật mã tiêu chí, code, ca test, review diff và chạy lại `flutter test` + `flutter analyze` ở môi trường Flutter tương thích. Các test Dart nằm trong dự án nhưng **chưa thực thi** trong phiên tạo.
