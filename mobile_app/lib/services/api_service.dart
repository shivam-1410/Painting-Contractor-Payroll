import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;

class ApiService {
  // Toggle this to switch between local development and production
  static const bool useProduction = false;
  
  static const String productionUrl = "https://painting-contractor-payroll.onrender.com/api";

  // Android emulator uses 10.0.2.2 for localhost, iOS and Web use localhost
  static String get localUrl {
    if (kIsWeb) {
      return "http://localhost:8000/api";
    } else if (defaultTargetPlatform == TargetPlatform.android) {
      return "http://10.0.2.2:8000/api";
    } else {
      return "http://localhost:8000/api";
    }
  }

  static String get baseUrl => useProduction ? productionUrl : localUrl;

  // GET request
  static Future<http.Response> get(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.get(
      url,
      headers: {'Content-Type': 'application/json'},
    );
    return _handleResponse(response);
  }

  // POST request
  static Future<http.Response> post(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.post(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  // PUT request
  static Future<http.Response> put(String endpoint, Map<String, dynamic> body) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.put(
      url,
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(body),
    );
    return _handleResponse(response);
  }

  // DELETE request
  static Future<http.Response> delete(String endpoint) async {
    final url = Uri.parse('$baseUrl$endpoint');
    final response = await http.delete(
      url,
      headers: {'Content-Type': 'application/json'},
    );
    return _handleResponse(response);
  }

  // Helper to process response codes
  static http.Response _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response;
    } else {
      final body = jsonDecode(response.body);
      throw ApiException(body['message'] ?? 'An error occurred: ${response.statusCode}');
    }
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);

  @override
  String toString() => message;
}
