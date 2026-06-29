import 'labour.dart';
import 'site.dart';

class Attendance {
  final String id;
  final dynamic labour; // Can be String ID or Labour object
  final dynamic site;   // Can be String ID or Site object
  final String status;  // 'Present', 'Absent', 'Half Day'
  final DateTime date;
  final double overtime;
  final double teaExpense;
  final double bhada;
  final double advance;

  Attendance({
    required this.id,
    required this.labour,
    required this.site,
    required this.status,
    required this.date,
    required this.overtime,
    required this.teaExpense,
    required this.bhada,
    required this.advance,
  });

  Labour? get labourObject => labour is Labour ? labour as Labour : null;
  String get labourId => labour is Labour ? (labour as Labour).id : (labour as String);

  Site? get siteObject => site is Site ? site as Site : null;
  String get siteId => site is Site ? (site as Site).id : (site as String);

  factory Attendance.fromJson(Map<String, dynamic> json) {
    return Attendance(
      id: json['_id'] ?? json['id'] ?? '',
      labour: json['labour'] is Map<String, dynamic>
          ? Labour.fromJson(json['labour'])
          : json['labour'] ?? '',
      site: json['site'] is Map<String, dynamic>
          ? Site.fromJson(json['site'])
          : json['site'] ?? '',
      status: json['status'] ?? 'Present',
      date: DateTime.parse(json['date']),
      overtime: (json['overtime'] ?? 0.0).toDouble(),
      teaExpense: (json['teaExpense'] ?? 0.0).toDouble(),
      bhada: (json['bhada'] ?? 0.0).toDouble(),
      advance: (json['advance'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'labour': labourId,
      'site': siteId,
      'status': status,
      'date': date.toIso8601String(),
      'overtime': overtime,
      'teaExpense': teaExpense,
      'bhada': bhada,
      'advance': advance,
    };
  }
}
