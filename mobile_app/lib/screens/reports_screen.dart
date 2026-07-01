import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../models/site.dart';

class ReportsScreen extends StatefulWidget {
  final bool? isAttendanceReport;
  const ReportsScreen({super.key, this.isAttendanceReport});

  @override
  State<ReportsScreen> createState() => _ReportsScreenState();
}

class _ReportsScreenState extends State<ReportsScreen> {
  late bool _isAttendanceReport; // Toggle between Attendance and Payment reports
  String _searchQuery = "";
  String _selectedMonth = ""; // Empty means "All Months"
  List<dynamic> _reports = [];
  List<dynamic> _sites = [];
  bool _isLoading = false;

  final _searchController = TextEditingController();

  final List<String> _months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @override
  void initState() {
    super.initState();
    _isAttendanceReport = widget.isAttendanceReport ?? true;
    _loadReportData();
    _loadSites();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _loadSites() async {
    try {
      final res = await ApiService.get('/sites');
      if (mounted) {
        setState(() {
          _sites = jsonDecode(res.body);
        });
      }
    } catch (e) {
      debugPrint('Error loading sites: $e');
    }
  }

  Future<void> _loadReportData() async {
    setState(() {
      _isLoading = true;
    });

    try {
      final endpoint = _isAttendanceReport ? '/reports/attendance' : '/reports/payment';
      final response = await ApiService.get(endpoint);
      if (mounted) {
        setState(() {
          _reports = jsonDecode(response.body) ?? [];
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading report: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  String _getContractorNames(String? siteNameStr) {
    if (siteNameStr == null || siteNameStr.isEmpty || siteNameStr == "N/A") return "N/A";
    final names = siteNameStr.split(", ").map((name) => name.trim());
    final contractors = names.map((name) {
      final siteObj = _sites.firstWhere(
        (s) => s['name']?.toString().toLowerCase().trim() == name.toLowerCase(),
        orElse: () => null,
      );
      return siteObj?['contractorName']?.toString();
    }).where((c) => c != null && c.isNotEmpty).cast<String>().toList();
    
    return contractors.isEmpty ? "N/A" : contractors.join(", ");
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    // Apply client-side filters
    final filteredData = _reports.where((report) {
      // 1. Search filter
      final labourName = (report['labour']?['name'] ?? report['labourName'] ?? 'Deleted Labour').toString().toLowerCase();
      
      String contractorName = "N/A";
      if (_isAttendanceReport) {
        contractorName = (report['site']?['contractorName'] ?? 'N/A').toString().toLowerCase();
      } else {
        contractorName = _getContractorNames(report['siteName']?.toString()).toLowerCase();
      }

      final matchesSearch = labourName.contains(_searchQuery.toLowerCase()) || 
                            contractorName.contains(_searchQuery.toLowerCase());

      // 2. Month filter (Attendance Report only)
      if (_isAttendanceReport && _selectedMonth.isNotEmpty) {
        final dateStr = report['date']?.toString();
        if (dateStr == null) return false;
        final reportMonth = DateTime.parse(dateStr).month;
        final selectedMonthIndex = _months.indexOf(_selectedMonth) + 1;
        return matchesSearch && (reportMonth == selectedMonthIndex);
      }

      return matchesSearch;
    }).toList();

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadReportData();
          await _loadSites();
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _isAttendanceReport ? 'Attendance Reports' : 'Payment Reports',
                          style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          _isAttendanceReport 
                              ? 'View, filter, and export detailed monthly labour attendance histories.'
                              : 'Track labour payments, processed payouts, monthly histories, and balances.',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  
                  // REPORT TOGGLE
                  Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _buildToggleButton('Attendance', true),
                        _buildToggleButton('Payments', false),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // FILTERS ROW
              Row(
                children: [
                  Expanded(
                    flex: 2,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
                      ),
                      child: TextField(
                        controller: _searchController,
                        decoration: InputDecoration(
                          icon: Icon(Icons.search, color: Colors.grey.shade400),
                          hintText: 'Search by labour name or contractor...',
                          border: InputBorder.none,
                          hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                        ),
                        onChanged: (v) => setState(() => _searchQuery = v),
                      ),
                    ),
                  ),
                  if (_isAttendanceReport) ...[
                    const SizedBox(width: 16),
                    Expanded(
                      flex: 1,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.surface,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            value: _selectedMonth.isEmpty ? null : _selectedMonth,
                            hint: const Text('All Months', style: TextStyle(fontSize: 14)),
                            isExpanded: true,
                            items: [
                              const DropdownMenuItem<String>(
                                value: null,
                                child: Text('All Months', style: TextStyle(fontSize: 14)),
                              ),
                              ..._months.map((m) {
                                return DropdownMenuItem<String>(
                                  value: m,
                                  child: Text(m, style: const TextStyle(fontSize: 14)),
                                );
                              }),
                            ],
                            onChanged: (v) => setState(() => _selectedMonth = v ?? ""),
                          ),
                        ),
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 32),

              // TABLE CARD
              Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(30),
                  border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(24.0),
                      child: Text(
                        _isAttendanceReport ? 'Attendance Log' : 'Payment Log',
                        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (_isLoading)
                      const Padding(
                        padding: EdgeInsets.all(48.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (filteredData.isEmpty)
                      Padding(
                        padding: const EdgeInsets.all(48.0),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.description_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text('No records found', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Text('Try selecting a different filter or search query.', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                            ],
                          ),
                        ),
                      )
                    else
                      _isAttendanceReport
                          ? _buildAttendanceTable(filteredData, currencyFormat)
                          : _buildPaymentTable(filteredData, currencyFormat),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildToggleButton(String label, bool isAttendance) {
    final theme = Theme.of(context);
    final isSelected = _isAttendanceReport == isAttendance;

    return GestureDetector(
      onTap: () {
        if (_isAttendanceReport != isAttendance) {
          setState(() {
            _isAttendanceReport = isAttendance;
            _searchQuery = "";
            _searchController.clear();
            _selectedMonth = "";
          });
          _loadReportData();
        }
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? theme.colorScheme.primary : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: GoogleFonts.outfit(
            color: isSelected ? Colors.white : Colors.grey.shade500,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }

  Widget _buildAttendanceTable(List<dynamic> data, NumberFormat currencyFormat) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: ConstrainedBox(
        constraints: BoxConstraints(minWidth: MediaQuery.of(context).size.width - 48),
        child: DataTable(
          horizontalMargin: 24,
          columnSpacing: 24,
          columns: [
            DataColumn(label: Text('Labour', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Site', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Status', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Contractor', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Date', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Overtime (Hrs)', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
            DataColumn(label: Text('Tea', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
            DataColumn(label: Text('Bhada', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
            DataColumn(label: Text('Advance', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
          ],
          rows: data.map((report) {
            final labourName = report['labour']?['name'] ?? report['labourName'] ?? 'Deleted Labour';
            final siteName = report['site']?['name'] ?? 'N/A';
            final contractorName = report['site']?['contractorName'] ?? 'N/A';
            final date = report['date'] != null ? DateFormat('dd/MM/yyyy').format(DateTime.parse(report['date'])) : 'N/A';
            final overtime = report['overtime'] ?? report['nightShift'] ?? 0;
            final tea = (report['teaExpense'] ?? 0.0).toDouble();
            final bhada = (report['bhada'] ?? 0.0).toDouble();
            final advance = (report['advance'] ?? 0.0).toDouble();

            final status = report['status'] ?? 'Absent';
            Color statusColor = Colors.grey;
            Color statusBg = Colors.grey.withOpacity(0.1);
            if (status == 'Present') {
              statusColor = Colors.green;
              statusBg = Colors.green.withOpacity(0.1);
            } else if (status == 'Halfday' || status == 'Half Day') {
              statusColor = Colors.orange;
              statusBg = Colors.orange.withOpacity(0.1);
            } else if (status == 'Absent') {
              statusColor = Colors.red;
              statusBg = Colors.red.withOpacity(0.1);
            }

            return DataRow(
              cells: [
                DataCell(Text(labourName, style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                DataCell(Text(siteName)),
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: statusBg, borderRadius: BorderRadius.circular(8)),
                    child: Text(
                      status,
                      style: GoogleFonts.outfit(color: statusColor, fontWeight: FontWeight.bold, fontSize: 10),
                    ),
                  ),
                ),
                DataCell(Text(contractorName)),
                DataCell(Text(date)),
                DataCell(Text(overtime.toString())),
                DataCell(Text(currencyFormat.format(tea), style: GoogleFonts.outfit(color: Colors.amber.shade600, fontWeight: FontWeight.w600))),
                DataCell(Text(currencyFormat.format(bhada), style: GoogleFonts.outfit(color: Colors.amber.shade600, fontWeight: FontWeight.w600))),
                DataCell(Text(currencyFormat.format(advance), style: GoogleFonts.outfit(color: Colors.red.shade600, fontWeight: FontWeight.bold))),
              ],
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildPaymentTable(List<dynamic> data, NumberFormat currencyFormat) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: ConstrainedBox(
        constraints: BoxConstraints(minWidth: MediaQuery.of(context).size.width - 48),
        child: DataTable(
          horizontalMargin: 24,
          columnSpacing: 24,
          columns: [
            DataColumn(label: Text('Labour', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Month', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Contractor', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
            DataColumn(label: Text('Salary', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
            DataColumn(label: Text('Status', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
          ],
          rows: data.map((report) {
            final labourName = report['labour']?['name'] ?? report['labourName'] ?? 'Deleted Labour';
            final month = '${report['month']} ${report['year']}';
            final contractorName = _getContractorNames(report['siteName']?.toString());
            final totalSalary = (report['totalSalary'] ?? 0.0).toDouble();
            final status = report['paymentStatus'] ?? 'Pending';
            final isPaid = status == 'Paid';

            return DataRow(
              cells: [
                DataCell(Text(labourName, style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                DataCell(Text(month)),
                DataCell(Text(contractorName)),
                DataCell(Text(currencyFormat.format(totalSalary), style: GoogleFonts.outfit(color: Colors.green.shade600, fontWeight: FontWeight.bold))),
                DataCell(
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: isPaid ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      status,
                      style: GoogleFonts.outfit(
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

extension FilteredList<T> on List<T> {
  List<T> filter(bool Function(T) test) {
    final List<T> result = [];
    for (var element in this) {
      if (test(element)) {
        result.add(element);
      }
    }
    return result;
  }
}
