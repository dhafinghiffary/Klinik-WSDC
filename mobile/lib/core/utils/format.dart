const _months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
];

/// 150000 -> "Rp 150.000"
String formatIDR(num value) {
  final s = value.round().abs().toString();
  final buf = StringBuffer();
  for (var i = 0; i < s.length; i++) {
    if (i > 0 && (s.length - i) % 3 == 0) buf.write('.');
    buf.write(s[i]);
  }
  return 'Rp $buf';
}

/// "2026-05-12" -> "12 Mei 2026"
String formatDate(String iso) {
  try {
    final d = DateTime.parse(iso);
    return '${d.day} ${_months[d.month - 1]} ${d.year}';
  } catch (_) {
    return iso;
  }
}

/// ISO datetime -> "14:30"
String formatTime(String iso) {
  try {
    final d = DateTime.parse(iso).toLocal();
    return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
  } catch (_) {
    return '';
  }
}
