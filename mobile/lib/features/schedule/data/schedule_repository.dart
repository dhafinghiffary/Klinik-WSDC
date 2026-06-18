import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../domain/appointment.dart';

final scheduleRepositoryProvider =
    Provider<ScheduleRepository>((ref) => ScheduleRepository(ref.watch(dioProvider)));

class ScheduleRepository {
  final Dio _dio;
  ScheduleRepository(this._dio);

  Future<List<Appointment>> today() async {
    try {
      final res = await _dio.get('/appointments/today');
      final list = (res.data['data'] as List).cast<Map<String, dynamic>>();
      return list.map(Appointment.fromJson).toList();
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }
}
