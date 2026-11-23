import 'package:flutter_test/flutter_test.dart';
import 'package:bug_bomb_flutter/game/engine.dart';
import 'package:bug_bomb_flutter/game/levels.dart';

void main() {
  group('F-01 Boom Mode', () {
    test('level one wins with a clustered combo and awards score', () {
      final game = GameEngine(levels[0], seed: 1);
      for (final b in game.bugs) {b.position = const Vec2(.50, .54);}
      expect(game.boom(), 5);
      expect(game.state, PlayState.won);
      expect(game.score, greaterThan(500));
      expect(game.stars, greaterThanOrEqualTo(2));
    });

    test('innocent ladybug in blast triggers loss', () {
      final game = GameEngine(levels[4], seed: 1);
      final innocent = game.bugs.firstWhere((b) => b.innocent);
      innocent.position = game.player;
      game.boom();
      expect(game.safeHits, 1);
      expect(game.state, PlayState.lost);
    });

    test('beetle armor absorbs first explosion', () {
      final game = GameEngine(levels[8], seed: 1);
      final armored = game.bugs.firstWhere((b) => b.armor == 2);
      for (final b in game.bugs) {b.position = const Vec2(.09, .15);}
      armored.position = game.player;
      game.boom();
      expect(armored.alive, true);
      expect(armored.armor, 1);
      game.boom();
      expect(armored.alive, false);
    });
  });

  group('F-02 Rescue Mode', () {
    test('wrong selection decreases checks; third mistake loses', () {
      final game = GameEngine(levels[2]);
      final wrong = game.bugs.firstWhere((b) => !b.hasBomb);
      expect(game.inspect(wrong.id), false);
      expect(game.checksLeft, 2);
      game.inspect(wrong.id);
      game.inspect(wrong.id);
      expect(game.state, PlayState.lost);
    });

    test('correct selection and sequence rescue the carrier', () {
      final game = GameEngine(levels[2]);
      expect(game.inspect(game.carrierId), true);
      expect(game.defuse(0), true);
      expect(game.defuse(2), true);
      expect(game.defuse(1), true);
      expect(game.state, PlayState.won);
    });

    test('wrong symbol resets the sequence and loses 2 seconds', () {
      final game = GameEngine(levels[2]);
      game.inspect(game.carrierId);
      final before = game.remaining;
      expect(game.defuse(1), false);
      expect(game.defuseProgress, 0);
      expect(game.remaining, before - 2);
    });

    test('carrier changes on level eight', () {
      final game = GameEngine(levels[7]);
      final first = game.carrierId;
      game.tick(8.1, Vec2.zero);
      expect(game.carrierId, isNot(first));
      expect(game.bugs.where((b) => b.hasBomb).length, 1);
    });
  });

  group('F-03 Hybrid / timer / pause', () {
    test('level ten rescue progresses to boom, then completes', () {
      final game = GameEngine(levels[9]);
      expect(game.stage, Mode.rescue);
      game.inspect(game.carrierId);
      for (final symbol in [0, 2, 1]) {game.defuse(symbol);}
      expect(game.stage, Mode.boom);
      expect(game.state, PlayState.playing);
      for (final b in game.bugs) {b.position = game.player;}
      game.boom();
      expect(game.state, PlayState.won);
    });
    test('pause keeps remaining time unchanged', () {
      final game = GameEngine(levels[0]);
      game.togglePause();
      game.tick(4.0, const Vec2(1, 0));
      expect(game.remaining, 25);
      game.togglePause();
      game.tick(1.0, Vec2.zero);
      expect(game.remaining, 24);
    });
    test('timer expiry loses the game', () {
      final game = GameEngine(levels[0]);
      game.tick(30, Vec2.zero);
      expect(game.state, PlayState.lost);
    });
  });
}
