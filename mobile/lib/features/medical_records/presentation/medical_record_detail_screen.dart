import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/utils/format.dart';
import '../data/medical_record_repository.dart';
import '../domain/medical_record.dart';

final medicalRecordProvider = FutureProvider.autoDispose.family<MedicalRecord, int>(
  (ref, id) => ref.watch(medicalRecordRepositoryProvider).get(id),
);

class MedicalRecordDetailScreen extends ConsumerWidget {
  final int recordId;
  const MedicalRecordDetailScreen({super.key, required this.recordId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(medicalRecordProvider(recordId));
    return Scaffold(
      appBar: AppBar(title: const Text('Detail Rekam Medis')),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (e, _) => Center(child: Text(e.toString(), textAlign: TextAlign.center)),
        data: (r) => ListView(
          padding: const EdgeInsets.all(16),
          children: [
            Text(formatDate(r.visitDate), style: Theme.of(context).textTheme.titleLarge),
            Text('${r.patientName} · ${r.doctorName}',
                style: TextStyle(color: Theme.of(context).colorScheme.outline)),
            const SizedBox(height: 16),
            _Section(
              title: 'Anamnesa',
              child: Text(r.anamnesis?.isNotEmpty == true ? r.anamnesis! : '-'),
            ),
            _Section(
              title: 'Diagnosa',
              child: r.diagnoses.isEmpty
                  ? const Text('-')
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: r.diagnoses
                          .map((d) => Text(
                              '• ${d.toothNumber != null ? "Gigi ${d.toothNumber}: " : ""}${d.description}'))
                          .toList(),
                    ),
            ),
            _Section(
              title: 'Tindakan',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  ...r.treatments.map(
                    (t) => Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(child: Text(t.name)),
                        Text(formatIDR(t.price)),
                      ],
                    ),
                  ),
                  const Divider(),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Total', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(formatIDR(r.treatmentTotal),
                          style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            _Section(
              title: 'Resep',
              child: r.prescriptions.isEmpty
                  ? const Text('-')
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: r.prescriptions
                          .map((p) => Text('• ${p.medicineName} — ${p.frequency}, ${p.quantity}'))
                          .toList(),
                    ),
            ),
            if (r.additionalNotes?.isNotEmpty == true)
              _Section(title: 'Catatan Tambahan', child: Text(r.additionalNotes!)),
          ],
        ),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  final String title;
  final Widget child;
  const _Section({required this.title, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
          const SizedBox(height: 6),
          child,
        ],
      ),
    );
  }
}
