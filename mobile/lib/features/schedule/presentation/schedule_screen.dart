import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/format.dart';
import '../data/schedule_repository.dart';
import '../domain/appointment.dart';

final todayAppointmentsProvider = FutureProvider.autoDispose<List<Appointment>>(
  (ref) => ref.watch(scheduleRepositoryProvider).today(),
);

Color _statusColor(String status, ColorScheme scheme) => switch (status) {
      'completed' => Colors.green,
      'in_progress' => Colors.blue,
      'checked_in' => Colors.amber.shade700,
      'cancelled' => scheme.error,
      'no_show' => Colors.orange,
      _ => scheme.outline,
    };

class ScheduleScreen extends ConsumerWidget {
  const ScheduleScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(todayAppointmentsProvider);
    final scheme = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(title: const Text('Jadwal Hari Ini')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(todayAppointmentsProvider),
        child: async.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (e, _) => ListView(
            children: [
              Padding(
                padding: const EdgeInsets.all(32),
                child: Center(child: Text(e.toString(), textAlign: TextAlign.center)),
              ),
            ],
          ),
          data: (items) {
            if (items.isEmpty) {
              return ListView(
                children: const [
                  Padding(
                    padding: EdgeInsets.all(48),
                    child: Center(child: Text('Belum ada kunjungan hari ini.')),
                  ),
                ],
              );
            }
            return ListView.separated(
              padding: const EdgeInsets.all(12),
              itemCount: items.length,
              separatorBuilder: (_, _) => const SizedBox(height: 8),
              itemBuilder: (context, i) {
                final a = items[i];
                return Card(
                  margin: EdgeInsets.zero,
                  child: ListTile(
                    leading: CircleAvatar(child: Text(formatTime(a.scheduledAt))),
                    title: Text(a.patientName),
                    subtitle: Text('${a.doctorName} · ${a.patientMrn}'),
                    trailing: Chip(
                      label: Text(a.statusLabel, style: const TextStyle(fontSize: 11)),
                      backgroundColor: _statusColor(a.status, scheme).withValues(alpha: 0.15),
                      side: BorderSide.none,
                      padding: EdgeInsets.zero,
                      visualDensity: VisualDensity.compact,
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}
