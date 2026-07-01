import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/payroll.dart';
import '../services/api_service.dart';

class PayrollProvider with ChangeNotifier {
  List<dynamic> _salaryCalculations = []; // Temporary calculated salaries
  List<Payroll> _payrolls = [];           // Official payroll records
  bool _isLoading = false;
  String? _errorMessage;

  List<dynamic> get salaryCalculations => _salaryCalculations;
  List<Payroll> get payrolls => _payrolls;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch salary calculations
  Future<void> fetchSalaryCalculations([String? month, int? year]) async {
    _isLoading = true;
    _errorMessage = null;
    _salaryCalculations = [];
    notifyListeners();

    try {
      String endpoint = '/salary';
      if (month != null && year != null) {
        endpoint += '?month=$month&year=$year';
      }
      final response = await ApiService.get(endpoint);
      _salaryCalculations = jsonDecode(response.body);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch official payroll list
  Future<void> fetchPayrolls([String? month, int? year]) async {
    _isLoading = true;
    _errorMessage = null;
    _payrolls = [];
    notifyListeners();

    try {
      String endpoint = '/payroll';
      if (month != null && year != null) {
        endpoint += '?month=$month&year=$year';
      }
      final response = await ApiService.get(endpoint);
      final List<dynamic> data = jsonDecode(response.body);
      _payrolls = data.map((json) => Payroll.fromJson(json)).toList();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Save/Generate payroll for a month
  Future<bool> generatePayroll(String month, int year) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.post('/payroll/generate', {
        'month': month,
        'year': year,
      });
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Pay/Update payroll payment status
  Future<bool> markAsPaid(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.put('/payroll/pay/$id', {});
      final updated = Payroll.fromJson(jsonDecode(response.body));
      final index = _payrolls.indexWhere((p) => p.id == id);
      if (index != -1) {
        _payrolls[index] = updated;
      }
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
