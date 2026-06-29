import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';

class ReportsScreen extends StatefulWidget {
  const ReportsScreen({super.key});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  String _selectedMonth = DateFormat('MMMM').format(DateTime.now());
  int _selectedYear = DateTime.now().year;
  bool _isAttendanceReport = true; // Toggle between Attendance and Payment reports
  List<dynamic> _reportData = [];
  bool _isLoading = false;

  final List<String> _months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  final List<int> _years = List.generate(5, (index) => DateTime.now().year - index);

  @override
  void initState() {
    super.initState();
    _loadReport();
  }

  Future<void> _loadReport() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final endpoint = _isAttendanceReport 
          ? '/reports/attendance?month=$_selectedMonth&year=$_selectedYear'
          : '/reports/payments?month=$_selectedMonth&year=$_selectedYear';
          
      final response = await ApiService.get(endpoint);
      setState(() {
        _reportData = jsonDecode(response.body);
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        title: Text(
          'REPORTS',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
      ),
      body: Column(
        children: [
          // REPORT TYPE TOGGLE
          _buildReportToggle(theme),

          // FILTERS
          _buildFilterHeader(theme),

          // REPORT DATA
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _reportData.isEmpty
                    ? Center(
                        child: Text(
                          'No report data found for this month.',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      )
                    : _isAttendanceReport
                        ? _buildAttendanceTable(theme)
                        : _buildPaymentTable(theme),
          ),
        ],
      ),
    );
  }

  Widget _buildReportToggle(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: SegmentedButton<bool>(
        segments: const [
          ButtonSegment<bool>(
            value: true,
            icon: Icon(Icons.assignment_turned_in),
            label: Text('Attendance'),
          ),
          ButtonSegment<bool>(
            value: false,
            icon: Icon(Icons.monetization_on),
            label: Text('Payments'),
          ),
        ],
        selected: {_isAttendanceReport},
        onSelectionChanged: (Set<bool> selection) {
          setState(() {
            _isAttendanceReport = selection.first;
          });
          _loadReport();
        },
      ),
    );
  }

  Widget _buildFilterHeader(ThemeData theme) {
    return Container(
      color: theme.colorScheme.surface,
      padding: const EdgeInsets.all(16.0),
      child: Row(
        children: [
          Expanded(
            child: DropdownButtonFormField<String>(
              value: _selectedMonth,
              decoration: const InputDecoration(
                labelText: 'Month',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: _months.map((month) {
                return DropdownMenuItem<String>(
                  value: month,
                  child: Text(month, style: const TextStyle(fontSize: 13)),
                );
              }).toList(),
              onChanged: (month) {
                if (month != null) {
                  setState(() {
                    _selectedMonth = month;
                  });
                  _loadReport();
                }
              },
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: DropdownButtonFormField<int>(
              value: _selectedYear,
              decoration: const InputDecoration(
                labelText: 'Year',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: _years.map((year) {
                return DropdownMenuItem<int>(
                  value: year,
                  child: Text(year.toString(), style: const TextStyle(fontSize: 13)),
                );
              }).toList(),
              onChanged: (year) {
                if (year != null) {
                  setState(() {
                    _selectedYear = year;
                  });
                  _loadReport();
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceTable(ThemeData theme) {
    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: const [
            DataColumn(label: Text('Labour Name', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Present', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Half Day', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Absent', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
          rows: _reportData.map<DataRow>((row) {
            return DataRow(
              cells: [
                DataCell(Text(row['labourName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600))),
                DataCell(Text(row['presentCount'].toString())),
                DataCell(Text(row['halfDayCount'].toString())),
                DataCell(Text(row['absentCount'].toString())),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildPaymentTable(ThemeData theme) {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return SingleChildScrollView(
      scrollDirection: Axis.vertical,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: DataTable(
          columns: const [
            DataColumn(label: Text('Labour Name', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Net Salary', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Paid Amount', style: TextStyle(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Status', style: TextStyle(fontWeight: FontWeight.bold))),
          ],
          rows: _reportData.map<DataRow>((row) {
            final isPaid = row['paymentStatus'] == 'Paid';
            final netSalary = (row['netSalary'] ?? 0.0).toDouble();
            final paidAmount = isPaid ? netSalary : 0.0;

            return DataRow(
              cells: [
                DataCell(Text(row['labourName'] ?? '', style: const TextStyle(fontWeight: FontWeight.w600))),
                DataCell(Text(currencyFormat.format(netSalary))),
                DataCell(Text(currencyFormat.format(paidAmount))),
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isPaid ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      row['paymentStatus'] ?? 'Pending',
                      style: TextStyle(
                        color: isPaid ? Colors.green : Colors.orange,
                        fontWeight: FontWeight.bold,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }
}
