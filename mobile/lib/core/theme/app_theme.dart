import 'package:flutter/material.dart';

/// Tema aplikasi (Material 3). Seed color mengikuti aksen klinik.
class AppTheme {
  AppTheme._();

  static const Color _seed = Color(0xFF0D9488); // teal

  static ThemeData get light => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: _seed),
      );

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: _seed,
          brightness: Brightness.dark,
        ),
      );
}
