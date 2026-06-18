import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/dio_client.dart';
import '../../../core/storage/token_storage.dart';
import '../domain/user.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    ref.watch(dioProvider),
    ref.watch(tokenStorageProvider),
  );
});

class AuthRepository {
  final Dio _dio;
  final TokenStorage _storage;

  AuthRepository(this._dio, this._storage);

  Future<User> login(String email, String password) async {
    try {
      final res = await _dio.post(
        '/login',
        data: {'email': email, 'password': password},
      );
      final data = res.data['data'] as Map<String, dynamic>;
      await _storage.save(data['token'] as String);
      return User.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<User> me() async {
    try {
      final res = await _dio.get('/me');
      return User.fromJson(res.data['data'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw mapDioError(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/logout');
    } catch (_) {
      // Abaikan kegagalan request logout; sesi lokal tetap dibersihkan.
    } finally {
      await _storage.clear();
    }
  }
}
