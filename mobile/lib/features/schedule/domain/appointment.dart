class Appointment {
  final int id;
  final String scheduledAt;
  final String status;
  final String? notes;
  final String patientName;
  final String patientMrn;
  final String doctorName;

  const Appointment({
    required this.id,
    required this.scheduledAt,
    required this.status,
    required this.notes,
    required this.patientName,
    required this.patientMrn,
    required this.doctorName,
  });

  factory Appointment.fromJson(Map<String, dynamic> json) {
    final patient = json['patient'] as Map<String, dynamic>? ?? const {};
    final doctor = json['doctor'] as Map<String, dynamic>? ?? const {};
    return Appointment(
      id: json['id'] as int,
      scheduledAt: json['scheduled_at'] as String? ?? '',
      status: json['status'] as String? ?? 'scheduled',
      notes: json['notes'] as String?,
      patientName: patient['name'] as String? ?? '-',
      patientMrn: patient['medical_record_number'] as String? ?? '',
      doctorName: doctor['name'] as String? ?? '-',
    );
  }

  String get statusLabel => switch (status) {
        'scheduled' => 'Terjadwal',
        'checked_in' => 'Check-in',
        'in_progress' => 'Diperiksa',
        'completed' => 'Selesai',
        'cancelled' => 'Dibatalkan',
        'no_show' => 'Tidak Hadir',
        _ => status,
      };
}
