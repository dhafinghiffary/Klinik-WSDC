import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../config/env.dart';
import '../storage/token_storage.dart';
import 'api_exception.dart';

/// Instance Dio tunggal dengan interceptor token & penanganan 401.
final dioProvider = Provider<Dio>((ref) {
  final storage = ref.watch(tokenStorageProvider);

  final dio = Dio(
    BaseOptions(
      baseUrl: Env.apiBaseUrl,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Accept': 'application/json'},
    ),
  );

  dio.interceptors.add(
    InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        handler.next(options);
      },
      onError: (e, handler) async {
        // Token kedaluwarsa/invalid: bersihkan sesi lokal.
        if (e.response?.statusCode == 401) {
          await storage.clear();
        }
        handler.next(e);
      },
    ),
  );

  return dio;
});

/// Ubah [DioException] menjadi [ApiException] dengan pesan dari server.
ApiException mapDioError(DioException e) {
  final data = e.response?.data;
  final message = (data is Map && data['message'] is String)
      ? data['message'] as String
      : 'Terjadi kesalahan jaringan.';
  return ApiException(message, statusCode: e.response?.statusCode);
}
