import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/auth_controller.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/home/presentation/home_shell.dart';
import '../../features/medical_records/presentation/medical_records_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/schedule/presentation/schedule_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    redirect: (context, state) {
      final status = ref.read(authControllerProvider).status;
      final loggingIn = state.matchedLocation == '/login';

      if (status != AuthStatus.authenticated && !loggingIn) return '/login';
      if (status == AuthStatus.authenticated && loggingIn) return '/schedule';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => HomeShell(child: child),
        routes: [
          GoRoute(
            path: '/schedule',
            builder: (context, state) => const ScheduleScreen(),
          ),
          GoRoute(
            path: '/medical-records',
            builder: (context, state) => const MedicalRecordsScreen(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
    ],
  );
});
