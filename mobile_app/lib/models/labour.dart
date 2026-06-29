class Labour {
  final String id;
  final String name;
  final String phone;
  final double dailyWage;
  final DateTime? joiningDate;

  Labour({
    required this.id,
    required this.name,
    required this.phone,
    required this.dailyWage,
    this.joiningDate,
  });

  factory Labour.fromJson(Map<String, dynamic> json) {
    return Labour(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      phone: json['phone'] ?? '',
      dailyWage: (json['dailyWage'] ?? 0.0).toDouble(),
      joiningDate: json['joiningDate'] != null 
          ? DateTime.tryParse(json['joiningDate']) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'phone': phone,
      'dailyWage': dailyWage,
      if (joiningDate != null) 'joiningDate': joiningDate!.toIso8601String(),
    };
  }
}
