import 'package:flutter/material.dart';

class BugColors {
  static const ink = Color(0xFF173B42);
  static const deep = Color(0xFF103D43);
  static const teal = Color(0xFF217F81);
  static const mint = Color(0xFFBFEADA);
  static const cream = Color(0xFFFFF3D5);
  static const orange = Color(0xFFFFA24A);
  static const coral = Color(0xFFFF685C);
  static const yellow = Color(0xFFFFD66E);
}

class BugButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  final Color fill;
  final IconData? icon;
  final bool compact;
  const BugButton({super.key, required this.label, required this.onTap,
    this.fill = BugColors.orange, this.icon, this.compact = false});
  @override
  Widget build(BuildContext context) => Semantics(
    button: true, label: label,
    child: Material(
      color: fill, elevation: 6, shadowColor: BugColors.deep.withValues(alpha: .3),
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Padding(
          padding: EdgeInsets.symmetric(horizontal: compact ? 17 : 26,
              vertical: compact ? 12 : 17),
          child: Row(mainAxisSize: MainAxisSize.min, mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[Icon(icon, color: BugColors.ink, size: 21), const SizedBox(width: 8)],
              Flexible(child: Text(label, textAlign: TextAlign.center,
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16,
                  color: BugColors.ink))),
            ]),
        ),
      ),
    ),
  );
}

class RoundedCard extends StatelessWidget {
  final Widget child;
  final EdgeInsets padding;
  const RoundedCard({super.key, required this.child,
    this.padding = const EdgeInsets.all(16)});
  @override
  Widget build(BuildContext context) => Container(
    padding: padding,
    decoration: BoxDecoration(color: BugColors.cream,
      borderRadius: BorderRadius.circular(24),
      boxShadow: const [BoxShadow(color: Color(0x320E3738), offset: Offset(0, 7), blurRadius: 12)]),
    child: child,
  );
}
