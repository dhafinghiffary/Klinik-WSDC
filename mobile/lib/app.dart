import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/router/app_router.dart';
import 'core/startup/app_startup.dart';
import 'core/theme/app_theme.dart';

class WsdcApp extends ConsumerWidget {
  const WsdcApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final startup = ref.watch(appStartupProvider);

    return startup.when(
      loading: () => MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        home: const Scaffold(body: Center(child: CircularProgressIndicator())),
      ),
      error: (e, _) => MaterialApp(
        debugShowCheckedModeBanner: false,
        theme: AppTheme.light,
        home: Scaffold(body: Center(child: Text('Gagal memuat aplikasi: $e'))),
      ),
      data: (_) {
        final router = ref.watch(appRouterProvider);
        return MaterialApp.router(
          title: 'WSDC Klinik',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.light,
          darkTheme: AppTheme.dark,
          routerConfig: router,
        );
      },
    );
  }
}
