class PatientLite {
  final int id;
  final String name;
  final String medicalRecordNumber;
  final String phoneNumber;

  const PatientLite({
    required this.id,
    required this.name,
    required this.medicalRecordNumber,
    required this.phoneNumber,
  });

  factory PatientLite.fromJson(Map<String, dynamic> json) => PatientLite(
        id: json['id'] as int,
        name: json['name'] as String? ?? '-',
        medicalRecordNumber: json['medical_record_number'] as String? ?? '',
        phoneNumber: json['phone_number'] as String? ?? '',
      );
}
