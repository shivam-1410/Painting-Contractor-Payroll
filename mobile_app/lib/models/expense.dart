import 'site.dart';

class Expense {
  final String id;
  final dynamic site; // Can be String ID or Site object
  final String description;
  final double amount;
  final DateTime date;
  final String category; // 'Material', 'Labour', 'Tea', 'Other', etc.

  Expense({
    required this.id,
    required this.site,
    required this.description,
    required this.amount,
    required this.date,
    required this.category,
  });

  Site? get siteObject => site is Site ? site as Site : null;
  String get siteId => site is Site ? (site as Site).id : (site as String);

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['_id'] ?? json['id'] ?? '',
      site: json['site'] is Map<String, dynamic>
          ? Site.fromJson(json['site'])
          : json['site'] ?? '',
      description: json['description'] ?? '',
      amount: (json['amount'] ?? 0.0).toDouble(),
      date: DateTime.parse(json['date']),
      category: json['category'] ?? 'Other',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'site': siteId,
      'description': description,
      'amount': amount,
      'date': date.toIso8601String(),
      'category': category,
    };
  }
}
