import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/challan.dart';
import '../services/api_service.dart';

class ExpenseProvider with ChangeNotifier {
  List<Challan> _challans = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Challan> get challans => _challans;
  List<Challan> get expenses => _challans; // alias for compatibility
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch all challans
  Future<void> fetchAllChallans() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.get('/challans');
      final List<dynamic> data = jsonDecode(response.body);
      _challans = data.map((json) => Challan.fromJson(json)).toList();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Fetch challans for a specific site
  Future<void> fetchExpenses(String siteId) async {
    _isLoading = true;
    _errorMessage = null;
    _challans = [];
    notifyListeners();

    try {
      final response = await ApiService.get('/challans/site/$siteId');
      final List<dynamic> data = jsonDecode(response.body);
      _challans = data.map((json) => Challan.fromJson(json)).toList();
    } catch (e) {
      // Fallback: fetch all and filter locally if site-specific endpoint fails
      try {
        final response = await ApiService.get('/challans');
        final List<dynamic> data = jsonDecode(response.body);
        final all = data.map((json) => Challan.fromJson(json)).toList();
        _challans = all.where((c) => c.siteId == siteId).toList();
      } catch (innerErr) {
        _errorMessage = innerErr.toString();
      }
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add a new challan
  Future<bool> addChallan(Map<String, dynamic> challanData) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/challans', challanData);
      final newChallan = Challan.fromJson(jsonDecode(response.body));
      _challans.add(newChallan);
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

  // Delete a challan
  Future<bool> deleteExpense(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.delete('/challans/$id');
      _challans.removeWhere((c) => c.id == id);
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
