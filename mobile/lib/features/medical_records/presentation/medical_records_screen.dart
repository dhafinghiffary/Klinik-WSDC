import 'package:flutter/material.dart';

class MedicalRecordsScreen extends StatelessWidget {
  const MedicalRecordsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Rekam Medis')),
      body: const Center(
        child: Text('Akses rekam medis pasien (TODO).'),
      ),
    );
  }
}
