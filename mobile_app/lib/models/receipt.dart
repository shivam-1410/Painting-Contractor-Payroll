class Receipt {
  final String id;
  final String labourName;
  final String? phone;
  final String siteName;
  final String month;
  final double dailyWage;
  final double totalSalary;
  final String paymentStatus;
  final DateTime? paymentDate;

  Receipt({
    required this.id,
    required this.labourName,
    this.phone,
    required this.siteName,
    required this.month,
    required this.dailyWage,
    required this.totalSalary,
    required this.paymentStatus,
    this.paymentDate,
  });

  factory Receipt.fromJson(Map<String, dynamic> json) {
    return Receipt(
      id: json['_id'] ?? json['id'] ?? '',
      labourName: json['labourName'] ?? '',
      phone: json['phone'],
      siteName: json['siteName'] ?? '',
      month: json['month'] ?? '',
      dailyWage: (json['dailyWage'] ?? 0.0).toDouble(),
      totalSalary: (json['totalSalary'] ?? 0.0).toDouble(),
      paymentStatus: json['paymentStatus'] ?? 'Paid',
      paymentDate: json['paymentDate'] != null 
          ? DateTime.tryParse(json['paymentDate']) 
          : null,
    );
  }
}
