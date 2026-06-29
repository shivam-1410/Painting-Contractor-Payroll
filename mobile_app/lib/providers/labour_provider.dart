import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/labour.dart';
import '../services/api_service.dart';

class LabourProvider with ChangeNotifier {
  List<Labour> _labours = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Labour> get labours => _labours;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch all labours
  Future<void> fetchLabours() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.get('/labours');
      final List<dynamic> data = jsonDecode(response.body);
      _labours = data.map((json) => Labour.fromJson(json)).toList();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add new labourer
  Future<bool> addLabour(String name, String phone, double dailyWage, DateTime joiningDate) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/labours', {
        'name': name,
        'phone': phone,
        'dailyWage': dailyWage,
        'joiningDate': joiningDate.toIso8601String(),
      });
      final newLabour = Labour.fromJson(jsonDecode(response.body));
      _labours.add(newLabour);
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

  // Update labourer
  Future<bool> updateLabour(String id, String name, String phone, double dailyWage, DateTime joiningDate) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.put('/labours/$id', {
        'name': name,
        'phone': phone,
        'dailyWage': dailyWage,
        'joiningDate': joiningDate.toIso8601String(),
      });
      final updated = Labour.fromJson(jsonDecode(response.body));
      final index = _labours.indexWhere((l) => l.id == id);
      if (index != -1) {
        _labours[index] = updated;
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

  // Delete labourer
  Future<bool> deleteLabour(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.delete('/labours/$id');
      _labours.removeWhere((l) => l.id == id);
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
