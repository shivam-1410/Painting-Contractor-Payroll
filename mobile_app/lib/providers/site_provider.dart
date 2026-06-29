import 'dart:convert';
import 'package:flutter/material.dart';
import '../models/site.dart';
import '../services/api_service.dart';

class SiteProvider with ChangeNotifier {
  List<Site> _sites = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Site> get sites => _sites;
  List<Site> get activeSites => _sites.where((s) => s.status == 'Active').toList();
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  // Fetch all sites
  Future<void> fetchSites() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response = await ApiService.get('/sites');
      final List<dynamic> data = jsonDecode(response.body);
      _sites = data.map((json) => Site.fromJson(json)).toList();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // Add a new site
  Future<bool> addSite(String name, String location, String status, int progress, String contractorName) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.post('/sites', {
        'name': name,
        'location': location,
        'status': status,
        'progress': progress,
        'contractorName': contractorName,
      });
      final newSite = Site.fromJson(jsonDecode(response.body));
      _sites.add(newSite);
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

  // Update a site
  Future<bool> updateSite(String id, String name, String location, String status, int progress, String contractorName) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await ApiService.put('/sites/$id', {
        'name': name,
        'location': location,
        'status': status,
        'progress': progress,
        'contractorName': contractorName,
      });
      final updated = Site.fromJson(jsonDecode(response.body));
      final index = _sites.indexWhere((s) => s.id == id);
      if (index != -1) {
        _sites[index] = updated;
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

  // Delete a site
  Future<bool> deleteSite(String id) async {
    _isLoading = true;
    notifyListeners();

    try {
      await ApiService.delete('/sites/$id');
      _sites.removeWhere((s) => s.id == id);
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
