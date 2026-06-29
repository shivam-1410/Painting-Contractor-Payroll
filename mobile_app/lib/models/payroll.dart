import 'labour.dart';

class Payroll {
  final String id;
  final dynamic labour; // Can be String ID or Labour object
  final String labourName;
  final String month;
  final int year;
  final double presentDays;
  final double halfDays;
  final double absentDays;
  final double overtime;
  final double teaExpense;
  final double bhada;
  final double advance;
  final double baseSalary;
  final double totalSalary;
  final String paymentStatus; // 'Paid', 'Pending'
  final DateTime? paymentDate;

  Payroll({
    required this.id,
    required this.labour,
    required this.labourName,
    required this.month,
    required this.year,
    required this.presentDays,
    required this.halfDays,
    required this.absentDays,
    required this.overtime,
    required this.teaExpense,
    required this.bhada,
    required this.advance,
    required this.baseSalary,
    required this.totalSalary,
    required this.paymentStatus,
    this.paymentDate,
  });

  Labour? get labourObject => labour is Labour ? labour as Labour : null;
  String get labourId => labour is Labour ? (labour as Labour).id : (labour as String);

  factory Payroll.fromJson(Map<String, dynamic> json) {
    return Payroll(
      id: json['_id'] ?? json['id'] ?? '',
      labour: json['labour'] is Map<String, dynamic>
          ? Labour.fromJson(json['labour'])
          : json['labour'] ?? '',
      labourName: json['labourName'] ?? '',
      month: json['month'] ?? '',
      year: json['year'] ?? DateTime.now().year,
      presentDays: (json['presentDays'] ?? 0.0).toDouble(),
      halfDays: (json['halfDays'] ?? 0.0).toDouble(),
      absentDays: (json['absentDays'] ?? 0.0).toDouble(),
      overtime: (json['overtime'] ?? 0.0).toDouble(),
      teaExpense: (json['teaExpense'] ?? 0.0).toDouble(),
      bhada: (json['bhada'] ?? 0.0).toDouble(),
      advance: (json['advance'] ?? 0.0).toDouble(),
      baseSalary: (json['baseSalary'] ?? 0.0).toDouble(),
      totalSalary: (json['totalSalary'] ?? 0.0).toDouble(),
      paymentStatus: json['paymentStatus'] ?? 'Pending',
      paymentDate: json['paymentDate'] != null 
          ? DateTime.tryParse(json['paymentDate']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'labour': labourId,
      'labourName': labourName,
      'month': month,
      'year': year,
      'presentDays': presentDays,
      'halfDays': halfDays,
      'absentDays': absentDays,
      'overtime': overtime,
      'teaExpense': teaExpense,
      'bhada': bhada,
      'advance': advance,
      'baseSalary': baseSalary,
      'totalSalary': totalSalary,
      'paymentStatus': paymentStatus,
      if (paymentDate != null) 'paymentDate': paymentDate!.toIso8601String(),
    };
  }
}
