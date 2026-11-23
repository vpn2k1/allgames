import 'package:flutter/material.dart';
import 'ui/home.dart';
import 'ui/theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const BugBombApp());
}

class BugBombApp extends StatelessWidget {
  const BugBombApp({super.key});
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'BUG BOMB – Gián Siêu Quậy',
    debugShowCheckedModeBanner: false,
    theme: ThemeData(useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(seedColor: BugColors.teal),
      scaffoldBackgroundColor: BugColors.deep),
    home: const HomePage(),
  );
}
