import 'package:flutter_test/flutter_test.dart';
import 'package:wsdc_mobile/features/auth/domain/user.dart';

void main() {
  test('User.fromJson memetakan field dengan benar', () {
    final user = User.fromJson({
      'id': 1,
      'name': 'drg. Budi',
      'email': 'budi@wsdc.id',
      'role': {'id': 2, 'name': 'doctor', 'display_name': 'Dokter'},
    });

    expect(user.id, 1);
    expect(user.name, 'drg. Budi');
    expect(user.role.name, 'doctor');
  });
}
