/// A level is data: the two gameplay rules live in [GameEngine].
enum Mode { boom, rescue, hybrid }

enum BugKind { cockroach, ant, mosquito, beetle, ladybug }

class LevelSpec {
  final int id;
  final String title;
  final Mode mode;
  final int seconds;
  final int enemies;
  final int required;
  final int innocents;
  final int charges;
  final String instruction;
  const LevelSpec({
    required this.id,
    required this.title,
    required this.mode,
    required this.seconds,
    required this.enemies,
    required this.required,
    this.innocents = 0,
    this.charges = 1,
    required this.instruction,
  });
}

const levels = <LevelSpec>[
  LevelSpec(id: 1, title: 'BÙM đầu tiên!', mode: Mode.boom,
      seconds: 25, enemies: 5, required: 4,
      instruction: 'Dẫn Bùm Bùm lại gần đàn kiến rồi nhấn BOOM!'),
  LevelSpec(id: 2, title: 'Đàn kiến ham ăn', mode: Mode.boom,
      seconds: 25, enemies: 12, required: 7,
      instruction: 'Dụ đàn kiến tụ tập để tạo combo lớn.'),
  LevelSpec(id: 3, title: 'Ai mang bom?', mode: Mode.rescue,
      seconds: 30, enemies: 8, required: 1,
      instruction: 'Chạm con gián có đèn cảnh báo nhấp nháy.'),
  LevelSpec(id: 4, title: 'Sau hộp sữa', mode: Mode.rescue,
      seconds: 35, enemies: 12, required: 1,
      instruction: 'Theo dõi dấu hiệu bom, bạn có 3 lượt kiểm tra.'),
  LevelSpec(id: 5, title: 'Tiệc hỗn loạn', mode: Mode.boom,
      seconds: 30, enemies: 15, required: 9, innocents: 2,
      instruction: 'Loại côn trùng gây hại, tránh bọ rùa vô tội!'),
  LevelSpec(id: 6, title: 'Trong bóng tối', mode: Mode.rescue,
      seconds: 35, enemies: 18, required: 1,
      instruction: 'Dấu hiệu bom chỉ phát sáng theo từng nhịp.'),
  LevelSpec(id: 7, title: 'Muỗi bay loạn', mode: Mode.boom,
      seconds: 30, enemies: 14, required: 8,
      instruction: 'Chờ muỗi tới gần rồi nổ để ghi điểm.'),
  LevelSpec(id: 8, title: 'Bom chuyển chủ', mode: Mode.rescue,
      seconds: 40, enemies: 20, required: 1,
      instruction: 'Bom đổi chủ sau mỗi 8 giây. Đừng để mất dấu!'),
  LevelSpec(id: 9, title: 'Bọ giáp xanh', mode: Mode.boom,
      seconds: 40, enemies: 13, required: 10, charges: 2,
      instruction: 'Bọ cánh cứng cần 2 lần tác động để bị loại.'),
  LevelSpec(id: 10, title: 'Đại náo nhà bếp', mode: Mode.hybrid,
      seconds: 35, enemies: 18, required: 10, charges: 2,
      instruction: 'Giải cứu trước, sau đó dùng 2 bom để tạo combo!'),
];
