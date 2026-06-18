import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../../medical_records/domain/medical_record.dart';
import '../domain/patient_lite.dart';

final patientRepositoryProvider =
    Provider<PatientRepository>((ref) => PatientRepository(ref.watch(dioProvider)));

class PatientRepository {
  final Dio _dio;
  PatientRepository(this._dio);

  Future<List<PatientLite>> search(String query) async {
    try {
      final res = await _dio.get('/patients', queryParameters: {'search': query, 'per_page': 10});
      final list = (res.data['data'] as List).cast<Map<String, dynamic>>();
      return list.map(PatientLite.fromJson).toList();
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<List<MedicalRecordListItem>> medicalRecords(int patientId) async {
    try {
      final res = await _dio.get('/patients/$patientId/medical-records');
      final list = (res.data['data'] as List).cast<Map<String, dynamic>>();
      return list.map(MedicalRecordListItem.fromJson).toList();
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }
}
