import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/expense.dart';
import '../services/api_service.dart';

class ExpenseProvider with ChangeNotifier {
  List<Expense> _expenses = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Expense> get expenses => _expenses;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch expenses for a site
  Future<void> fetchExpenses(String siteId) async {
    _isLoading = true;
    _errorMessage = null;
    _expenses = [];
    notifyListeners();

    try {
      final response = await ApiService.get('/site-expenses?site=$siteId');
      final List<dynamic> data = jsonDecode(response.body);
      _expenses = data.map((json) => Expense.fromJson(json)).toList();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add new expense
  Future<bool> addExpense(String siteId, String description, double amount, DateTime date, String category) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/site-expenses', {
        'site': siteId,
        'description': description,
        'amount': amount,
        'date': date.toIso8601String(),
        'category': category,
      });
      final newExpense = Expense.fromJson(jsonDecode(response.body));
      _expenses.add(newExpense);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Delete expense
  Future<bool> deleteExpense(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.delete('/site-expenses/$id');
      _expenses.removeWhere((e) => e.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
