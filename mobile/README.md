# Mobile — Flutter

**Stack:** Flutter 3.41 · Dart 3.11 · Riverpod · go_router · Dio
**Target:** Android & iOS
**Status:** Fitur inti selesai — siap dijalankan saat backend tersedia.

Aplikasi untuk **dokter**: akses jadwal praktik & rekam medis pasien dari smartphone.
Menggunakan API yang sama dengan frontend (`/api/v1`) dengan Sanctum Bearer Token.

### Fitur yang sudah jalan
- Login + pemulihan sesi otomatis dari token tersimpan (secure storage)
- Tab **Jadwal**: daftar kunjungan hari ini (pull-to-refresh)
- Tab **Rekam Medis**: cari pasien → daftar rekam medis → detail (read-only)
- Tab **Profil**: info akun + logout
- Interceptor Dio: inject Bearer token + auto-clear saat 401

---

## Stack & Alasan

| Kebutuhan | Pilihan | Alasan |
|---|---|---|
| State management | `flutter_riverpod` | Modern, testable, boilerplate minim |
| Routing | `go_router` | Deklaratif + redirect guard untuk auth |
| HTTP client | `dio` | Interceptor (token, error) bawaan |
| Secure storage | `flutter_secure_storage` | Simpan token di Keychain/Keystore |

> Stack ini bisa diganti — masih Phase 4, struktur folder cukup fleksibel. Bila perlu model
> dengan codegen, tambahkan `freezed` + `json_serializable` (lihat catatan di bawah).

---

## Struktur Folder (Feature-First Clean Architecture)

```
mobile/
├── lib/
│   ├── main.dart                 # entry — ProviderScope
│   ├── app.dart                  # MaterialApp.router + tema
│   ├── core/                     # lintas-fitur
│   │   ├── config/
│   │   │   └── env.dart          # base URL (dart-define)
│   │   ├── network/
│   │   │   ├── dio_client.dart   # Dio + interceptor token & 401
│   │   │   └── api_exception.dart
│   │   ├── router/
│   │   │   └── app_router.dart   # go_router + redirect auth
│   │   ├── storage/
│   │   │   └── token_storage.dart
│   │   └── theme/
│   │       └── app_theme.dart
│   └── features/                 # satu folder per fitur
│       ├── auth/
│       │   ├── data/             # repository (panggil API)
│       │   ├── domain/           # model (User)
│       │   └── presentation/     # screen + controller (Riverpod)
│       ├── home/                 # shell + bottom navigation
│       ├── schedule/             # tab Jadwal (placeholder)
│       ├── medical_records/      # tab Rekam Medis (placeholder)
│       └── profile/              # tab Profil + logout
├── test/
└── pubspec.yaml
```

**Pola tiap fitur:**
- `domain/` — model murni (`fromJson`/`toJson`), tanpa dependensi Flutter
- `data/` — repository: panggil `dio`, map response ke model, lempar `ApiException`
- `presentation/` — `screen` (UI) + `controller` (Riverpod `Notifier` untuk state)

Contoh lengkap end-to-end ada di `features/auth/` (login → simpan token → redirect).
Fitur lain (`schedule`, `medical_records`) masih placeholder, ikuti pola yang sama.

---

## Setup & Run

```bash
flutter pub get

# Jalankan (Android emulator memetakan localhost host ke 10.0.2.2)
flutter run

# Override base URL saat run
flutter run --dart-define=API_BASE_URL=https://api.wsdc.id/api/v1
```

| Lingkungan | Base URL default |
|---|---|
| Android emulator | `http://10.0.2.2:8000/api/v1` |
| iOS simulator | `http://localhost:8000/api/v1` |
| Device fisik | IP host di jaringan lokal |

Cek kualitas kode:
```bash
flutter analyze
flutter test
```

---

## Alur Auth

1. `LoginScreen` → `AuthController.login()` → `AuthRepository.login()`
2. Token disimpan via `TokenStorage` (secure storage)
3. `dio` interceptor menyuntik `Authorization: Bearer {token}` ke tiap request
4. `go_router` `redirect` menjaga route: belum login → `/login`
5. Response 401 → token dibersihkan otomatis oleh interceptor

---

## Catatan: Model dengan Codegen (opsional)

Untuk model yang lebih banyak, pertimbangkan `freezed` + `json_serializable`:

```bash
flutter pub add freezed_annotation json_annotation
flutter pub add -d build_runner freezed json_serializable
dart run build_runner watch -d
```

File `*.g.dart` & `*.freezed.dart` sudah di-ignore di `.gitignore` root.
