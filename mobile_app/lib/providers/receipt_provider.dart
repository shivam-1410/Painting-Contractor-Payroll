import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/receipt.dart';
import '../services/api_service.dart';

class ReceiptProvider with ChangeNotifier {
  List<Receipt> _receipts = [];
  bool _isLoading = false;

  List<Receipt> get receipts => _receipts;
  bool get isLoading => _isLoading;

  Future<void> fetchReceipts() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.get('/receipt');
      final List<dynamic> data = jsonDecode(response.body);
      _receipts = data.map((json) => Receipt.fromJson(json)).toList();
    } catch (e) {
      debugPrint('Error fetching receipts: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
