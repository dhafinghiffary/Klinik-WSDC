/// Konfigurasi environment.
///
/// Override saat run/build:
///   flutter run --dart-define=API_BASE_URL=https://api.wsdc.id/api/v1
///
/// Catatan: Android emulator mengakses localhost host lewat 10.0.2.2.
class Env {
  Env._();

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:8000/api/v1',
  );
}
