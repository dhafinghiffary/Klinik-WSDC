import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());

/// Penyimpanan token Sanctum yang aman (Keychain / Keystore).
class TokenStorage {
  static const _tokenKey = 'wsdc_token';
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  Future<String?> read() => _storage.read(key: _tokenKey);
  Future<void> save(String token) => _storage.write(key: _tokenKey, value: token);
  Future<void> clear() => _storage.delete(key: _tokenKey);
}
