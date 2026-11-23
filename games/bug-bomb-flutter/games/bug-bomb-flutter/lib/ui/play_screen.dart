import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../game/engine.dart';
import '../game/levels.dart';
import 'theme.dart';

class PlayScreen extends StatefulWidget {
  final LevelSpec level;
  const PlayScreen({super.key, required this.level});
  @override
  State<PlayScreen> createState() => _PlayScreenState();
}

class _PlayScreenState extends State<PlayScreen> {
  late GameEngine engine;
  late Timer loop;
  DateTime lastFrame = DateTime.now();
  Vec2 joystick = Vec2.zero;
  bool stored = false;
  String message = '';
  double messageFor = 0;

  @override
  void initState() {
    super.initState();
    engine = GameEngine(widget.level);
    lastFrame = DateTime.now();
    loop = Timer.periodic(const Duration(milliseconds: 33), (_) => _frame());
  }

  void _frame() {
    if (!mounted) return;
    final now = DateTime.now();
    final dt = math.min(.075, now.difference(lastFrame).inMicroseconds / 1000000);
    lastFrame = now;
    setState(() {
      engine.tick(dt, joystick);
      messageFor = math.max(0.0, messageFor - dt);
      if (messageFor <= 0) message = '';
    });
    if (engine.state == PlayState.won && !stored) {
      stored = true;
      unawaited(_saveWin());
    }
  }

  Future<void> _saveWin() async {
    final prefs = SharedPreferencesAsync();
    try {
      final old = await prefs.getInt('unlocked') ?? 1;
      final next = math.max(old, math.min(levels.length, widget.level.id + 1));
      await prefs.setInt('unlocked', next);
      final previousStars = await prefs.getInt('stars_${widget.level.id}') ?? 0;
      await prefs.setInt('stars_${widget.level.id}', math.max(previousStars, engine.stars));
    } catch (_) {
      // Keep the win screen usable if device persistence fails.
      if (mounted) setState(() {_flash('Không lưu được tiến trình trên thiết bị');});
    }
  }

  void _flash(String text) {message = text; messageFor = 2.2;}

  void _boom() {
    setState(() {
      final count = engine.boom();
      _flash(count > 0 ? 'COMBO +$count 🎉' : 'Chưa trúng mục tiêu!');
    });
    if (engine.state == PlayState.won && !stored) {stored = true; unawaited(_saveWin());}
  }

  void _inspect(BugActor bug) {
    if (engine.stage != Mode.rescue || engine.state != PlayState.playing) return;
    setState(() {
      final correct = engine.inspect(bug.id);
      if (!correct) _flash('Chưa đúng! Còn ${engine.checksLeft} lượt kiểm tra');
    });
  }

  void _defuse(int symbol) {
    setState(() {
      final previous = engine.stage;
      final ok = engine.defuse(symbol);
      if (!ok) _flash('Sai ký hiệu! Bị trừ 2 giây');
      else if (engine.stage != previous) _flash('Đã giải cứu! Đến phần KÍCH NỔ 💥');
      else if (engine.state == PlayState.won) _flash('Giải cứu thành công!');
    });
    if (engine.state == PlayState.won && !stored) {stored = true; unawaited(_saveWin());}
  }

  void _restart() {
    setState(() {
      engine = GameEngine(widget.level);
      joystick = Vec2.zero; stored = false;
      message = ''; messageFor = 0;
      lastFrame = DateTime.now();
    });
  }

  @override
  void dispose() {loop.cancel(); super.dispose();}

  @override
  Widget build(BuildContext context) {
    final rescue = engine.stage == Mode.rescue;
    return Scaffold(
      backgroundColor: BugColors.deep,
      body: SafeArea(child: Padding(padding: const EdgeInsets.fromLTRB(12, 8, 12, 8),
        child: Column(children: [
          _hud(rescue),
          const SizedBox(height: 8),
          Container(width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
            decoration: BoxDecoration(color: BugColors.teal,
              borderRadius: BorderRadius.circular(14)),
            child: Text(widget.level.instruction,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.white,
                fontSize: 12, fontWeight: FontWeight.w700))),
          const SizedBox(height: 8),
          Expanded(child: LayoutBuilder(builder: (context, constraints) =>
            ClipRRect(borderRadius: BorderRadius.circular(24),
              child: Stack(clipBehavior: Clip.hardEdge, children: [
                Positioned.fill(child: Image.asset('assets/images/kitchen.png',fit: BoxFit.cover)),
                if (!rescue) _blastCircle(constraints.maxWidth, constraints.maxHeight),
                ...engine.bugs.where((b) => b.alive).map((b) =>
                  _bugWidget(b, constraints.maxWidth, constraints.maxHeight, rescue)),
                if (!rescue) _playerWidget(constraints.maxWidth, constraints.maxHeight),
                if (engine.effectsTime > 0 && !rescue)
                  Positioned.fill(child: IgnorePointer(child: Container(
                    decoration: BoxDecoration(color: BugColors.yellow.withValues(
                      alpha: engine.effectsTime / .45 * .24))))),
                if (message.isNotEmpty) Positioned(top: 60, left: 10, right: 10,
                  child: IgnorePointer(child: Center(child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    decoration: BoxDecoration(color: BugColors.ink.withValues(alpha: .92),
                      borderRadius: BorderRadius.circular(20)),
                    child: Text(message, textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900)))))),
                if (engine.defuseProgress >= 0 && rescue && engine.state == PlayState.playing)
                  Positioned.fill(child: _defusePanel()),
                if (engine.state == PlayState.paused) Positioned.fill(child: _pausePanel()),
                if (engine.state == PlayState.won || engine.state == PlayState.lost)
                  Positioned.fill(child: _resultPanel()),
              ]))),
          ),
          const SizedBox(height: 10),
          _controls(rescue),
        ]),
      )),
    );
  }

  Widget _hud(bool rescue) {
    final time = engine.remaining.ceil();
    return Row(children: [
      IconButton(tooltip: 'Quay về chọn màn', onPressed: () => Navigator.pop(context),
        icon: const Icon(Icons.arrow_back_ios_new_rounded, color: BugColors.cream)),
      Expanded(child: Column(children: [
        Text('MÀN ${widget.level.id.toString().padLeft(2, '0')} · ${rescue ? 'GIẢI CỨU' : 'KÍCH NỔ'}',
          style: const TextStyle(color: BugColors.mint, fontSize: 11,
            fontWeight: FontWeight.w900, letterSpacing: 1)),
        Text('00:${time.toString().padLeft(2, '0')}',
          style: TextStyle(fontSize: 30, fontWeight: FontWeight.w900,
            color: time <= 5 ? BugColors.coral : BugColors.cream)),
      ])),
      Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
        Text('${engine.score} ⭐', style: const TextStyle(color: BugColors.yellow,
          fontSize: 15, fontWeight: FontWeight.w900)),
        Text(rescue ? '🔍 ${engine.checksLeft} lượt' :
          '💣 ${engine.charges} bom · ${engine.eliminated}/${widget.level.required}',
          style: const TextStyle(color: BugColors.mint, fontSize: 11)),
      ]),
      IconButton(tooltip: 'Tạm dừng hoặc tiếp tục',
        onPressed: () => setState(engine.togglePause),
        icon: Icon(engine.state == PlayState.paused ? Icons.play_arrow_rounded
          : Icons.pause_circle_outline_rounded, color: BugColors.cream)),
    ]);
  }

  Widget _blastCircle(double width, double height) {
    final r = GameEngine.blastRadius * width;
    return Positioned(left: engine.player.x * width - r,
      top: engine.player.y * height - r,
      child: IgnorePointer(child: Container(width: 2*r, height: 2*r,
        decoration: BoxDecoration(shape: BoxShape.circle,
          color: BugColors.orange.withValues(alpha: .11),
          border: Border.all(color: BugColors.coral.withValues(alpha: .7), width: 2)),
      )));
  }

  Widget _bugWidget(BugActor bug, double width, double height, bool rescue) {
    final size = math.min(45.0, math.max(31.0, width / 9));
    final showBlink = bug.hasBomb &&
        (widget.level.id == 3 || (engine.remaining * (widget.level.id == 6 ? 1 : 2)).floor().isEven);
    return Positioned(left: bug.position.x * width - size / 2,
      top: bug.position.y * height - size / 2,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: rescue ? () => _inspect(bug) : null,
        child: Semantics(label: rescue ? 'Kiểm tra côn trùng ${bug.id + 1}' : 'Côn trùng ${bug.id + 1}',
          button: rescue,
          child: SizedBox(width: math.max(size, 48),height: math.max(size, 48),
            child: Stack(alignment: Alignment.center, children: [
              Image.asset('assets/images/${bug.sprite}.png',
                width:size,height:size,filterQuality:FilterQuality.medium),
              if (bug.armor > 1) const Positioned(right: 0,bottom: 0,
                child: Text('🛡',style:TextStyle(fontSize:16))),
              if (rescue && showBlink) Positioned(right: 0, top: 0,
                child: Container(width: 14,height:14,
                  decoration: BoxDecoration(shape: BoxShape.circle,
                    color: BugColors.coral,border:Border.all(color:Colors.white,width:2)))),
            ]))),
      ),
    );
  }

  Widget _playerWidget(double width, double height) {
    const size = 66.0;
    return Positioned(left: engine.player.x * width - size / 2,
      top: engine.player.y * height - size / 2,
      child: IgnorePointer(child: Image.asset('assets/images/cockroach_bomb.png',
        width: size,height:size,filterQuality: FilterQuality.high)));
  }

  Widget _controls(bool rescue) => SizedBox(height: 108,
    child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
      if (!rescue) Joystick(onMove: (value) => joystick = value)
      else Row(children: [
        Image.asset('assets/images/ladybug.png',width:80,height:80),
        const SizedBox(width: 5),
        const Text('CHẠM VÀO\nCON NGHI VẤN',
          style: TextStyle(color: BugColors.mint,fontSize:12,fontWeight:FontWeight.w900)),
      ]),
      if (!rescue) ElevatedButton(
        onPressed: engine.state == PlayState.playing ? _boom : null,
        style: ElevatedButton.styleFrom(backgroundColor: BugColors.coral,
          foregroundColor: Colors.white, elevation: 9,
          minimumSize: const Size(112, 90),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))),
        child: const Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text('💥',style:TextStyle(fontSize:27)),
          Text('BOOM!',style:TextStyle(fontSize:18,fontWeight:FontWeight.w900)),
        ]))
      else const Icon(Icons.search_rounded,size:56,color:BugColors.yellow),
    ]),
  );

  Widget _defusePanel() => Container(
    color: BugColors.deep.withValues(alpha: .81),
    alignment: Alignment.center,
    child: SingleChildScrollView(child: Padding(
      padding: const EdgeInsets.all(20),
      child: RoundedCard(child: Column(mainAxisSize: MainAxisSize.min,children: [
        Image.asset('assets/images/bomb.png',width:105,height:105),
        const Text('THÁO BOM!',style:TextStyle(fontSize:27,
          color:BugColors.ink,fontWeight:FontWeight.w900)),
        const SizedBox(height:8),
        const Text('Nhấn lần lượt: Mặt trời → Ngôi sao → Mặt trăng',
          textAlign:TextAlign.center,
          style:TextStyle(color:BugColors.ink,fontWeight:FontWeight.w600)),
        const SizedBox(height:10),
        Text('${engine.defuseProgress}/3 ký hiệu đúng',
          style:const TextStyle(color:BugColors.teal,fontWeight:FontWeight.w800)),
        const SizedBox(height:12),
        Row(mainAxisAlignment:MainAxisAlignment.spaceEvenly,children: [
          for (final pair in [(0,'☀️'),(1,'🌙'),(2,'⭐')])
            FilledButton(onPressed:()=>_defuse(pair.$1 as int),
              style:FilledButton.styleFrom(backgroundColor:BugColors.teal,
                minimumSize:const Size(70,68),padding:EdgeInsets.zero),
              child:Text(pair.$2 as String,style:const TextStyle(fontSize:29))),
        ]),
      ]))),
    )),
  );

  Widget _pausePanel() => Container(
    color:BugColors.ink.withValues(alpha:.84),
    alignment:Alignment.center,
    child:Padding(padding:const EdgeInsets.symmetric(horizontal:25),
      child:Column(mainAxisSize:MainAxisSize.min,children:[
        const Text('TẠM DỪNG',style:TextStyle(color:BugColors.cream,
          fontSize:30,fontWeight:FontWeight.w900)),
        const SizedBox(height:20),
        BugButton(label:'TIẾP TỤC',icon:Icons.play_arrow_rounded,
          onTap:()=>setState(engine.togglePause)),
        const SizedBox(height:15),
        BugButton(label:'CHƠI LẠI',fill:BugColors.mint,onTap:_restart),
        const SizedBox(height:15),
        TextButton(onPressed:()=>Navigator.pop(context),
          child:const Text('VỀ CHỌN MÀN',style:TextStyle(color:Colors.white))),
      ])));

  Widget _resultPanel() {
    final won = engine.state == PlayState.won;
    return Container(color:BugColors.ink.withValues(alpha:.86),
      alignment:Alignment.center,
      child:SingleChildScrollView(child:Padding(
        padding:const EdgeInsets.all(18),
        child:RoundedCard(child:Column(mainAxisSize:MainAxisSize.min,children:[
          Image.asset(won?'assets/images/ladybug.png':'assets/images/bomb.png',
            width:112,height:112),
          Text(won?'XUẤT SẮC!':'HẾT LƯỢT!',
            style:TextStyle(color:won?BugColors.teal:BugColors.coral,
              fontSize:29,fontWeight:FontWeight.w900)),
          const SizedBox(height:9),
          Text(won?List.filled(engine.stars,'⭐').join('  '):'Đừng bỏ cuộc!',
            style:const TextStyle(fontSize:22)),
          const SizedBox(height:10),
          Text('Điểm: ${engine.score}   •   Mục tiêu: ${engine.eliminated}',
            style:const TextStyle(color:BugColors.ink,fontWeight:FontWeight.w800)),
          const SizedBox(height:20),
          BugButton(label:'CHƠI LẠI',onTap:_restart,
            icon:Icons.replay_rounded),
          const SizedBox(height:12),
          if (won && widget.level.id < levels.length) ...[
            BugButton(label:'MÀN TIẾP THEO',fill:BugColors.mint,
              onTap:()=>Navigator.pushReplacement(context,
                MaterialPageRoute(builder:(_)=>PlayScreen(level:levels[widget.level.id])))),
            const SizedBox(height:12),
          ],
          TextButton(onPressed:()=>Navigator.pop(context),
            child:const Text('VỀ DANH SÁCH MÀN')),
        ]))),
      )));
  }
}

class Joystick extends StatefulWidget {
  final ValueChanged<Vec2> onMove;
  const Joystick({super.key,required this.onMove});
  @override
  State<Joystick> createState()=>_JoystickState();
}

class _JoystickState extends State<Joystick> {
  Vec2 v = Vec2.zero;
  void _update(Offset local) {
    final delta = Vec2((local.dx - 52)/37,(local.dy - 52)/37);
    final next = delta.length > 1 ? delta.unit : delta;
    widget.onMove(next);
    setState(()=>v=next);
  }
  void _end() {widget.onMove(Vec2.zero);setState(()=>v=Vec2.zero);}
  @override
  Widget build(BuildContext context) => GestureDetector(
    behavior:HitTestBehavior.opaque,
    onPanStart:(d)=>_update(d.localPosition),
    onPanUpdate:(d)=>_update(d.localPosition),
    onPanEnd:(_)=>_end(),
    onPanCancel:_end,
    child:Container(width:104,height:104,
      decoration:BoxDecoration(shape:BoxShape.circle,
        color:BugColors.teal.withValues(alpha:.6),
        border:Border.all(color:BugColors.mint.withValues(alpha:.8),width:3)),
      child:Center(child:Transform.translate(
        offset:Offset(v.x*27,v.y*27),
        child:Container(width:54,height:54,
          decoration:BoxDecoration(shape:BoxShape.circle,color:BugColors.mint,
            border:Border.all(color:BugColors.cream,width:4),
            boxShadow:const [BoxShadow(color:Colors.black26,blurRadius:5,offset:Offset(0,3))]),
          child:const Icon(Icons.control_camera_rounded,color:BugColors.teal,size:29)),
      )),
    ),
  );
}
