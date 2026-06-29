import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../models/attendance.dart';
import '../services/api_service.dart';

class AttendanceProvider with ChangeNotifier {
  List<Attendance> _attendanceList = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Attendance> get attendanceList => _attendanceList;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch attendance for a specific date and site
  Future<void> fetchAttendance(DateTime date, String siteId) async {
    _isLoading = true;
    _errorMessage = null;
    _attendanceList = [];
    notifyListeners();

    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(date);
      final response = await ApiService.get('/attendance?date=$formattedDate&site=$siteId');
      final List<dynamic> data = jsonDecode(response.body);
      _attendanceList = data.map((json) => Attendance.fromJson(json)).toList();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Save or update attendance records in batch
  Future<bool> saveAttendance(List<Map<String, dynamic>> records) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.post('/attendance/batch', {'records': records});
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
