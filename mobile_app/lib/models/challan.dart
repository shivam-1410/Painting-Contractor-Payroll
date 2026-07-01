class ChallanItem {
  final String itemName;
  final String? liter;
  final double qty;
  final double rate;
  final double amount;

  ChallanItem({
    required this.itemName,
    this.liter,
    required this.qty,
    required this.rate,
    required this.amount,
  });

  factory ChallanItem.fromJson(Map<String, dynamic> json) {
    return ChallanItem(
      itemName: json['itemName'] ?? '',
      liter: json['liter']?.toString(),
      qty: (json['qty'] ?? 0.0).toDouble(),
      rate: (json['rate'] ?? 0.0).toDouble(),
      amount: (json['amount'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'itemName': itemName,
      'liter': liter,
      'qty': qty,
      'rate': rate,
      'amount': amount,
    };
  }
}

class Challan {
  final String id;
  final String challanNo;
  final String vendor;
  final DateTime billDate;
  final String? siteId;
  final String? siteName;
  final String? siteLocation;
  final List<ChallanItem> items;
  final double totalAmount;

  Challan({
    required this.id,
    required this.challanNo,
    required this.vendor,
    required this.billDate,
    this.siteId,
    this.siteName,
    this.siteLocation,
    required this.items,
    required this.totalAmount,
  });

  factory Challan.fromJson(Map<String, dynamic> json) {
    // Handle site which could be a String or an Object
    String? sId;
    String? sName;
    String? sLocation;
    final siteNode = json['site'];
    if (siteNode is Map) {
      sId = siteNode['_id']?.toString();
      sName = siteNode['name']?.toString();
      sLocation = siteNode['location']?.toString();
    } else if (siteNode != null) {
      sId = siteNode.toString();
    }

    // Also handle sites array if present
    final sitesList = json['sites'] as List<dynamic>?;
    if (sitesList != null && sitesList.isNotEmpty) {
      final firstSite = sitesList.first;
      if (firstSite is Map) {
        sId ??= firstSite['_id']?.toString();
        sName ??= firstSite['name']?.toString();
        sLocation ??= firstSite['location']?.toString();
      }
    }

    final itemsList = json['items'] as List<dynamic>? ?? [];

    return Challan(
      id: json['_id'] ?? '',
      challanNo: json['challanNo']?.toString() ?? '',
      vendor: json['vendor'] ?? '',
      billDate: json['billDate'] != null 
          ? DateTime.parse(json['billDate']) 
          : DateTime.now(),
      siteId: sId,
      siteName: sName,
      siteLocation: sLocation,
      items: itemsList.map((i) => ChallanItem.fromJson(i)).toList(),
      totalAmount: (json['totalAmount'] ?? 0.0).toDouble(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'challanNo': challanNo,
      'vendor': vendor,
      'billDate': billDate.toIso8601String(),
      'site': siteId,
      'items': items.map((i) => i.toJson()).toList(),
      'totalAmount': totalAmount,
    };
  }
}
