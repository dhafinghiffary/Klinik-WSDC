import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/utils/format.dart';
import '../../patients/data/patient_repository.dart';
import '../domain/medical_record.dart';

final patientRecordsProvider =
    FutureProvider.autoDispose.family<List<MedicalRecordListItem>, int>(
  (ref, id) => ref.watch(patientRepositoryProvider).medicalRecords(id),
);

class PatientRecordsScreen extends ConsumerWidget {
  final int patientId;
  final String patientName;

  const PatientRecordsScreen({super.key, required this.patientId, required this.patientName});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(patientRecordsProvider(patientId));
    return Scaffold(
      appBar: AppBar(title: Text(patientName)),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString(), textAlign: TextAlign.center)),
        data: (items) => items.isEmpty
            ? const Center(child: Text('Belum ada rekam medis.'))
            : ListView.separated(
                itemCount: items.length,
                separatorBuilder: (_, _) => const Divider(height: 1),
                itemBuilder: (context, i) {
                  final r = items[i];
                  return ListTile(
                    title: Text(formatDate(r.visitDate)),
                    subtitle: Text('${r.doctorName} · ${r.diagnosisSummary}'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => context.push('/medical-records/${r.id}'),
                  );
                },
              ),
      ),
    );
  }
}
