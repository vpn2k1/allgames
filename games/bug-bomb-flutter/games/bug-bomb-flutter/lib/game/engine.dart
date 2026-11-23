import 'dart:math' as math;
import 'levels.dart';

class Vec2 {
  final double x;
  final double y;
  const Vec2(this.x, this.y);
  static const zero = Vec2(0, 0);
  Vec2 operator +(Vec2 o) => Vec2(x + o.x, y + o.y);
  Vec2 operator -(Vec2 o) => Vec2(x - o.x, y - o.y);
  Vec2 operator *(double k) => Vec2(x * k, y * k);
  double get length => math.sqrt(x * x + y * y);
  Vec2 get unit => length < .00001 ? zero : this * (1 / length);
  double distance(Vec2 o) => (this - o).length;
  Vec2 bounded() => Vec2(x.clamp(.055, .945).toDouble(), y.clamp(.08, .91).toDouble());
}

class BugActor {
  final int id;
  final BugKind kind;
  Vec2 position;
  Vec2 direction;
  bool alive = true;
  bool hasBomb = false;
  int armor;
  double changeIn;
  BugActor({required this.id, required this.kind, required this.position,
    this.direction = Vec2.zero, this.armor = 1, this.changeIn = 0});
  bool get innocent => kind == BugKind.ladybug;
  String get sprite => switch (kind) {
    BugKind.cockroach => 'cockroach',
    BugKind.ant => 'ant',
    BugKind.mosquito => 'mosquito',
    BugKind.beetle => 'beetle',
    BugKind.ladybug => 'ladybug',
  };
}

enum PlayState { playing, paused, won, lost }

/// Deterministic, pure Dart gameplay logic; widget layer only presents its state.
class GameEngine {
  static const blastRadius = .215;
  final LevelSpec level;
  final math.Random random;
  final List<BugActor> bugs = [];
  PlayState state = PlayState.playing;
  Mode stage = Mode.boom;
  Vec2 player = const Vec2(.5, .54);
  double remaining = 0;
  int score = 0;
  int eliminated = 0;
  int checksLeft = 3;
  int charges = 1;
  int defuseProgress = -1; // -1: no panel; 0..2: matching symbols
  int wrongDefuses = 0;
  int wrongChecks = 0;
  double effectsTime = 0;
  double sinceSwap = 0;
  int carrierId = -1;
  int safeHits = 0;
  int totalBoomHits = 0;
  final List<int> code = [0, 2, 1];

  GameEngine(this.level, {int? seed}) : random = math.Random(seed ?? level.id * 193) {
    stage = level.mode == Mode.hybrid ? Mode.rescue : level.mode;
    _setup(stage);
  }

  void _setup(Mode mode) {
    stage = mode;
    remaining = level.seconds.toDouble();
    charges = level.charges;
    checksLeft = 3;
    defuseProgress = -1;
    wrongChecks = 0;
    wrongDefuses = 0;
    sinceSwap = 0;
    totalBoomHits = 0;
    bugs.clear();
    player = const Vec2(.50, .54);
    final count = level.enemies;
    for (var i = 0; i < count + (mode == Mode.boom ? level.innocents : 0); i++) {
      final isInnocent = mode == Mode.boom && i >= count;
      final kind = isInnocent ? BugKind.ladybug : switch (mode) {
        Mode.rescue => i % 3 == 0 ? BugKind.cockroach : i % 3 == 1 ? BugKind.ant : BugKind.beetle,
        _ => level.id == 7 ? BugKind.mosquito : level.id == 9 && i % 4 == 0
          ? BugKind.beetle : i % 5 == 0 ? BugKind.cockroach : BugKind.ant,
      };
      // Cluster pests near the centre early to teach combo; innocents stay on sides.
      final angle = 2 * math.pi * (i * .6180339887 % 1);
      final radius = mode == Mode.boom
          ? (isInnocent ? .32 : (level.id == 1 ? .105 : .095 + (i % 4) * .043))
          : (.12 + (i % 5) * .064);
      final p = Vec2((.50 + radius * math.cos(angle)).clamp(.08, .92).toDouble(),
          (.51 + radius * math.sin(angle)).clamp(.09, .90).toDouble());
      bugs.add(BugActor(id: i, kind: kind, position: p,
          armor: level.id == 9 && kind == BugKind.beetle ? 2 : 1,
          direction: Vec2(math.cos(angle + 1), math.sin(angle + 1))));
    }
    if (mode == Mode.rescue && bugs.isNotEmpty) {
      carrierId = level.id == 3 ? 3 : level.id == 4 ? 6 : level.id == 6 ? 11 : 4;
      carrierId %= bugs.length;
      bugs[carrierId].hasBomb = true;
    } else {
      carrierId = -1;
    }
  }

  void tick(double dt, Vec2 joystick) {
    if (state != PlayState.playing || dt <= 0) return;
    remaining = math.max(0.0, remaining - dt);
    effectsTime = math.max(0.0, effectsTime - dt);
    sinceSwap += dt;
    if (remaining <= 0) {state = PlayState.lost; return;}
    if (stage == Mode.boom) {
      final moving = joystick.length > 1 ? joystick.unit : joystick;
      final next = (player + moving * (dt * .33)).bounded();
      player = next;
    }
    for (final bug in bugs.where((b) => b.alive)) {
      bug.changeIn -= dt;
      if (bug.changeIn <= 0) {
        bug.changeIn = .85 + random.nextDouble() * 1.2;
        final angle = random.nextDouble() * 2 * math.pi;
        bug.direction = Vec2(math.cos(angle), math.sin(angle));
      }
      final speed = switch (bug.kind) {
        BugKind.mosquito => .11, BugKind.beetle => .038,
        BugKind.ant => .07, BugKind.cockroach => .09,
        BugKind.ladybug => .045,
      };
      // Ants are drawn toward the centre (crumb zone), unless player approaches.
      var dir = bug.direction;
      if (stage == Mode.boom && bug.kind == BugKind.ant &&
          bug.position.distance(const Vec2(.5, .52)) > .09) {
        dir = (const Vec2(.5, .52) - bug.position).unit * .68 + dir * .32;
      }
      var p = bug.position + dir * (speed * dt);
      if (p.x < .075 || p.x > .925) bug.direction = Vec2(-bug.direction.x, bug.direction.y);
      if (p.y < .10 || p.y > .90) bug.direction = Vec2(bug.direction.x, -bug.direction.y);
      p = Vec2(p.x.clamp(.075, .925).toDouble(), p.y.clamp(.10, .90).toDouble());
      bug.position = p;
    }
    if (level.id == 8 && stage == Mode.rescue && sinceSwap >= 8 && defuseProgress < 0) {
      sinceSwap = 0;
      _swapCarrier();
    }
  }

  void _swapCarrier() {
    if (bugs.length < 2) return;
    bugs[carrierId].hasBomb = false;
    carrierId = (carrierId + 5) % bugs.length;
    bugs[carrierId].hasBomb = true;
  }

  int boom() {
    if (state != PlayState.playing || stage != Mode.boom || charges <= 0) return 0;
    charges--;
    effectsTime = .45;
    int hits = 0;
    for (final bug in bugs.where((b) => b.alive)) {
      if (bug.position.distance(player) > blastRadius) continue;
      if (bug.innocent) {safeHits++; continue;}
      if (bug.armor > 1) {bug.armor--; continue;}
      bug.alive = false;
      hits++;
    }
    eliminated += hits;
    totalBoomHits += hits;
    score += hits * 100 + math.max(0, hits - 3) * 50 + remaining.floor() * 5;
    if (safeHits > 0) {state = PlayState.lost; return hits;}
    if (eliminated >= level.required) {state = PlayState.won; return hits;}
    if (charges == 0) state = PlayState.lost;
    return hits;
  }

  bool inspect(int bugId) {
    if (state != PlayState.playing || stage != Mode.rescue || defuseProgress >= 0) return false;
    final index = bugs.indexWhere((b) => b.id == bugId && b.alive);
    if (index < 0) return false;
    if (bugs[index].hasBomb) {defuseProgress = 0; return true;}
    wrongChecks++;
    checksLeft--;
    if (checksLeft <= 0) state = PlayState.lost;
    return false;
  }

  bool defuse(int symbol) {
    if (state != PlayState.playing || defuseProgress < 0 || symbol < 0 || symbol > 2) return false;
    if (code[defuseProgress] != symbol) {
      wrongDefuses++;
      remaining = math.max(0.0, remaining - 2);
      if (remaining == 0) state = PlayState.lost;
      defuseProgress = 0;
      return false;
    }
    defuseProgress++;
    if (defuseProgress == code.length) {
      score += 400 + remaining.floor() * 20 - wrongChecks * 50;
      if (level.mode == Mode.hybrid && stage == Mode.rescue) {
        // Level 10: rescue success carries score into the boom finale.
        _setup(Mode.boom);
      } else {
        state = PlayState.won;
      }
    }
    return true;
  }

  int get stars {
    if (state != PlayState.won) return 0;
    if (safeHits > 0 || wrongChecks >= 2) return 1;
    if (stage == Mode.rescue) return wrongChecks == 0 && remaining >= level.seconds * .3 ? 3 : 2;
    return eliminated >= level.required + 3 && safeHits == 0 ? 3 : 2;
  }

  void togglePause() {
    if (state == PlayState.playing) state = PlayState.paused;
    else if (state == PlayState.paused) state = PlayState.playing;
  }
}
