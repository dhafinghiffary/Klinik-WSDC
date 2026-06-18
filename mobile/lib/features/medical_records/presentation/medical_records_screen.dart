import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../patients/data/patient_repository.dart';
import '../../patients/domain/patient_lite.dart';

class MedicalRecordsScreen extends ConsumerStatefulWidget {
  const MedicalRecordsScreen({super.key});

  @override
  ConsumerState<MedicalRecordsScreen> createState() => _MedicalRecordsScreenState();
}

class _MedicalRecordsScreenState extends ConsumerState<MedicalRecordsScreen> {
  final _ctrl = TextEditingController();
  List<PatientLite>? _results;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final q = _ctrl.text.trim();
    if (q.length < 2) {
      setState(() => _error = 'Ketik minimal 2 huruf.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final r = await ref.read(patientRepositoryProvider).search(q);
      if (mounted) setState(() => _results = r);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rekam Medis')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    textInputAction: TextInputAction.search,
                    onSubmitted: (_) => _search(),
                    decoration: const InputDecoration(
                      hintText: 'Cari nama / no. RM pasien',
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                FilledButton(onPressed: _loading ? null : _search, child: const Text('Cari')),
              ],
            ),
          ),
          if (_error != null)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: Text(_error!, style: TextStyle(color: Theme.of(context).colorScheme.error)),
            ),
          if (_loading) const LinearProgressIndicator(),
          Expanded(
            child: _results == null
                ? const Center(child: Text('Cari pasien untuk melihat rekam medisnya.'))
                : _results!.isEmpty
                    ? const Center(child: Text('Pasien tidak ditemukan.'))
                    : ListView.separated(
                        itemCount: _results!.length,
                        separatorBuilder: (_, _) => const Divider(height: 1),
                        itemBuilder: (context, i) {
                          final p = _results![i];
                          return ListTile(
                            title: Text(p.name),
                            subtitle: Text(p.medicalRecordNumber),
                            trailing: const Icon(Icons.chevron_right),
                            onTap: () => context.push('/patient-records/${p.id}', extra: p.name),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
