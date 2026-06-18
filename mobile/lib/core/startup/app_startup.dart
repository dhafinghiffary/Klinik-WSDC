import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../features/auth/data/auth_repository.dart';
import '../../features/auth/presentation/auth_controller.dart';
import '../storage/token_storage.dart';

/// Dijalankan sekali saat app start: pulihkan sesi dari token tersimpan.
final appStartupProvider = FutureProvider<void>((ref) async {
  final storage = ref.read(tokenStorageProvider);
  final token = await storage.read();
  if (token == null) return;
  try {
    final user = await ref.read(authRepositoryProvider).me();
    ref.read(authControllerProvider.notifier).setRestored(user);
  } catch (_) {
    // Token tidak valid / server tidak tersedia: bersihkan & lanjut ke login.
    await storage.clear();
  }
});
