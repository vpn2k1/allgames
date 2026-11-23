import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../game/levels.dart';
import 'play_screen.dart';
import 'theme.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});
  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  int unlocked = 1;
  @override
  void initState() {super.initState(); _load();}
  Future<void> _load() async {
    final n = await SharedPreferencesAsync().getInt('unlocked') ?? 1;
    if (mounted) setState(() => unlocked = n.clamp(1, levels.length));
  }
  Future<void> _play() async {
    await Navigator.push<void>(context, MaterialPageRoute(
      builder: (_) => LevelSelectPage(unlocked: unlocked)));
    await _load();
  }
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BugColors.deep,
      body: SafeArea(
        child: LayoutBuilder(builder: (context, c) {
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: c.maxHeight),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(20, 18, 20, 28),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    const SizedBox(height: 12),
                    Column(children: [
                      const Text('BUG BOMB', textAlign: TextAlign.center,
                        style: TextStyle(fontSize: 45, fontWeight: FontWeight.w900,
                          letterSpacing: -2, color: BugColors.yellow, height: 1.0)),
                      const SizedBox(height: 5),
                      const Text('GIÁN SIÊU QUẬY', textAlign: TextAlign.center,
                        style: TextStyle(fontWeight: FontWeight.w800,
                          letterSpacing: 4, color: BugColors.cream, fontSize: 15)),
                      const SizedBox(height: 16),
                      ClipRRect(borderRadius: BorderRadius.circular(35),
                        child: Image.asset('assets/images/cover.png',
                          height: math.min(c.maxHeight * .46, 380).toDouble(),
                          fit: BoxFit.contain)),
                    ]),
                    const SizedBox(height: 14),
                    Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                      BugButton(label: 'CHƠI NGAY', icon: Icons.play_arrow_rounded, onTap: _play),
                      const SizedBox(height: 12),
                      Container(padding: const EdgeInsets.all(13),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: .12),
                          borderRadius: BorderRadius.circular(18)),
                        child: const Text('💥 KÍCH NỔ COMBO    •    🔍 TÌM & GIẢI CỨU',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800,
                            color: BugColors.cream), textAlign: TextAlign.center)),
                    ]),
                    const SizedBox(height: 10),
                    const Text('Bản demo 0.1 · Chơi ngoại tuyến',
                      style: TextStyle(color: BugColors.mint, fontSize: 12)),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

class LevelSelectPage extends StatefulWidget {
  final int unlocked;
  const LevelSelectPage({super.key, required this.unlocked});
  @override
  State<LevelSelectPage> createState() => _LevelSelectPageState();
}

class _LevelSelectPageState extends State<LevelSelectPage> {
  late int unlocked = widget.unlocked;
  Map<int, int> stars = {};
  @override
  void initState() {super.initState(); _load();}
  Future<void> _load() async {
    final prefs = SharedPreferencesAsync();
    final next = await prefs.getInt('unlocked') ?? widget.unlocked;
    final saved = <int, int>{};
    for (final l in levels) {saved[l.id] = await prefs.getInt('stars_${l.id}') ?? 0;}
    if (mounted) setState(() {unlocked = next; stars = saved;});
  }
  Future<void> _open(LevelSpec level) async {
    await Navigator.of(context).push<void>(MaterialPageRoute(
      builder: (_) => PlayScreen(level: level)));
    await _load();
  }
  @override
  Widget build(BuildContext context) => Scaffold(
    backgroundColor: BugColors.deep,
    appBar: AppBar(title: const Text('CHỌN MÀN CHƠI',
        style: TextStyle(fontWeight: FontWeight.w900)),
      backgroundColor: BugColors.deep, foregroundColor: BugColors.cream, centerTitle: true),
    body: SafeArea(child: ListView.builder(
      padding: const EdgeInsets.fromLTRB(18, 12, 18, 30),
      itemCount: levels.length,
      itemBuilder: (context, i) {
        final l = levels[i], locked = l.id > unlocked;
        final mode = l.mode == Mode.boom ? '💥 BOOM' : l.mode == Mode.rescue
            ? '🔍 CỨU HỘ' : '🎯 KẾT HỢP';
        return Padding(padding: const EdgeInsets.only(bottom: 12), child:
          Opacity(opacity: locked ? .55 : 1,
            child: RoundedCard(child: InkWell(
              onTap: locked ? null : () => _open(l),
              borderRadius: BorderRadius.circular(20),
              child: Row(children: [
                Container(width: 54, height: 60,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(color: locked ? const Color(0xFFBBC2B9)
                    : BugColors.orange, borderRadius: BorderRadius.circular(18)),
                  child: locked ? const Icon(Icons.lock, color: BugColors.deep)
                    : Text('${l.id.toString().padLeft(2, '0')}',
                      style: const TextStyle(fontSize: 23, fontWeight: FontWeight.w900,
                        color: BugColors.deep))),
                const SizedBox(width: 14),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(l.title, style: const TextStyle(color: BugColors.ink,
                    fontSize: 16, fontWeight: FontWeight.w900)),
                  const SizedBox(height: 4),
                  Text(mode, style: const TextStyle(color: BugColors.teal,
                    fontSize: 11, fontWeight: FontWeight.w900)),
                  Text(stars[l.id] == null || stars[l.id] == 0 ? '☆ ☆ ☆' :
                    '${List.filled(stars[l.id]!, '★').join(' ')} ${List.filled(3 - stars[l.id]!, '☆').join(' ')}',
                    style: const TextStyle(color: Color(0xFFC58A21), fontSize: 17)),
                ])),
                Icon(locked ? Icons.lock_outline : Icons.arrow_forward_ios_rounded,
                  color: BugColors.teal, size: 17),
              ]),
            ))));
      },
    )),
  );
}
