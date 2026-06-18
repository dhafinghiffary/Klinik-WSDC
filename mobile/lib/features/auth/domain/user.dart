class UserRole {
  final int id;
  final String name;
  final String displayName;

  const UserRole({
    required this.id,
    required this.name,
    required this.displayName,
  });

  factory UserRole.fromJson(Map<String, dynamic> json) => UserRole(
        id: json['id'] as int,
        name: json['name'] as String,
        displayName: json['display_name'] as String? ?? '',
      );
}

class User {
  final int id;
  final String name;
  final String email;
  final UserRole role;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id: json['id'] as int,
        name: json['name'] as String,
        email: json['email'] as String,
        role: UserRole.fromJson(json['role'] as Map<String, dynamic>),
      );
}
