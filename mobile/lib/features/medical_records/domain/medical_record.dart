class MedicalRecordListItem {
  final int id;
  final String visitDate;
  final String doctorName;
  final String diagnosisSummary;
  final int treatmentCount;

  const MedicalRecordListItem({
    required this.id,
    required this.visitDate,
    required this.doctorName,
    required this.diagnosisSummary,
    required this.treatmentCount,
  });

  factory MedicalRecordListItem.fromJson(Map<String, dynamic> json) => MedicalRecordListItem(
        id: json['id'] as int,
        visitDate: json['visit_date'] as String? ?? '',
        doctorName: json['doctor_name'] as String? ?? '-',
        diagnosisSummary: json['diagnosis_summary'] as String? ?? '-',
        treatmentCount: json['treatment_count'] as int? ?? 0,
      );
}

class Diagnosis {
  final String? toothNumber;
  final String description;
  const Diagnosis({required this.toothNumber, required this.description});
  factory Diagnosis.fromJson(Map<String, dynamic> j) =>
      Diagnosis(toothNumber: j['tooth_number'] as String?, description: j['description'] as String? ?? '');
}

class Treatment {
  final String name;
  final String? toothNumber;
  final num price;
  const Treatment({required this.name, required this.toothNumber, required this.price});
  factory Treatment.fromJson(Map<String, dynamic> j) => Treatment(
        name: j['name'] as String? ?? '',
        toothNumber: j['tooth_number'] as String?,
        price: j['price'] as num? ?? 0,
      );
}

class Prescription {
  final String medicineName;
  final String frequency;
  final String quantity;
  const Prescription({required this.medicineName, required this.frequency, required this.quantity});
  factory Prescription.fromJson(Map<String, dynamic> j) => Prescription(
        medicineName: j['medicine_name'] as String? ?? '',
        frequency: j['frequency'] as String? ?? '',
        quantity: j['quantity'] as String? ?? '',
      );
}

class MedicalRecord {
  final int id;
  final String visitDate;
  final String? anamnesis;
  final String? additionalNotes;
  final String doctorName;
  final String patientName;
  final List<Diagnosis> diagnoses;
  final List<Treatment> treatments;
  final List<Prescription> prescriptions;

  const MedicalRecord({
    required this.id,
    required this.visitDate,
    required this.anamnesis,
    required this.additionalNotes,
    required this.doctorName,
    required this.patientName,
    required this.diagnoses,
    required this.treatments,
    required this.prescriptions,
  });

  factory MedicalRecord.fromJson(Map<String, dynamic> json) {
    final patient = json['patient'] as Map<String, dynamic>?;
    List<T> parse<T>(String key, T Function(Map<String, dynamic>) f) =>
        ((json[key] as List<dynamic>?) ?? const [])
            .map((e) => f(e as Map<String, dynamic>))
            .toList();
    return MedicalRecord(
      id: json['id'] as int,
      visitDate: json['visit_date'] as String? ?? '',
      anamnesis: json['anamnesis'] as String?,
      additionalNotes: json['additional_notes'] as String?,
      doctorName: json['doctor_name'] as String? ?? '-',
      patientName: patient?['name'] as String? ?? '-',
      diagnoses: parse('diagnoses', Diagnosis.fromJson),
      treatments: parse('treatments', Treatment.fromJson),
      prescriptions: parse('prescriptions', Prescription.fromJson),
    );
  }

  num get treatmentTotal => treatments.fold<num>(0, (s, t) => s + t.price);
}
