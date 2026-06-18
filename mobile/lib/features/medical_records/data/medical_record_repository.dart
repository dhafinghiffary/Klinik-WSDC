import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../domain/medical_record.dart';

final medicalRecordRepositoryProvider =
    Provider<MedicalRecordRepository>((ref) => MedicalRecordRepository(ref.watch(dioProvider)));

class MedicalRecordRepository {
  final Dio _dio;
  MedicalRecordRepository(this._dio);

  Future<MedicalRecord> get(int id) async {
    try {
      final res = await _dio.get('/medical-records/$id');
      return MedicalRecord.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }
}
