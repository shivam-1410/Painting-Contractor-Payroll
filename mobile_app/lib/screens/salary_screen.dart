import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/payroll_provider.dart';

class SalaryScreen extends StatefulWidget {
  const SalaryScreen({super.key});

  @override
  State<SalaryScreen> createState() => _SalaryScreenState();
}

class _SalaryScreenState extends State<SalaryScreen> {
  String _searchQuery = "";
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadSalaries();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _loadSalaries() {
    Future.microtask(() {
      Provider.of<PayrollProvider>(context, listen: false).fetchSalaryCalculations();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final payrollProvider = Provider.of<PayrollProvider>(context);
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    // Filter calculations based on search query
    final filteredSalary = payrollProvider.salaryCalculations.where((item) {
      final name = (item['labourName'] ?? '').toString().toLowerCase();
      return name.contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: RefreshIndicator(
        onRefresh: () async => _loadSalaries(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER
              Text(
                'Salary Management',
                style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 6),
              Text(
                'Monthly payroll calculation, overtime, tea allowance, and advance summaries.',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w500),
              ),
              const SizedBox(height: 32),

              // SEARCH BAR
              Container(
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
                    hintText: 'Search by labourer name...',
                    border: InputBorder.none,
                    hintStyle: TextStyle(color: Colors.grey.shade400, fontSize: 14),
                  ),
                  onChanged: (v) {
                    setState(() {
                      _searchQuery = v;
                    });
                  },
                ),
              ),
              const SizedBox(height: 32),

              // SUMMARY TABLE
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
                        'Salary Summary',
                        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (payrollProvider.isLoading)
                      const Padding(
                        padding: EdgeInsets.all(48.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (filteredSalary.isEmpty)
                      Padding(
                        padding: const EdgeInsets.all(48.0),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.assignment_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text('No salary records found', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Text('Try searching for a different labourer name.', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                            ],
                          ),
                        ),
                      )
                    else
                      SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: ConstrainedBox(
                          constraints: BoxConstraints(minWidth: MediaQuery.of(context).size.width - 48),
                          child: DataTable(
                            horizontalMargin: 24,
                            columnSpacing: 24,
                            columns: [
                              DataColumn(label: Text('Labour', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text('Present Days', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Half Days', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Overtime (Hrs)', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Tea', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Bhada', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Advance', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Total Salary', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                            ],
                            rows: filteredSalary.map((item) {
                              final double tea = (item['teaExpense'] ?? 0.0).toDouble();
                              final double bhada = (item['bhada'] ?? 0.0).toDouble();
                              final double advance = (item['advance'] ?? 0.0).toDouble();
                              final double totalSalary = (item['totalSalary'] ?? item['netSalary'] ?? 0.0).toDouble();
                              
                              return DataRow(
                                cells: [
                                  DataCell(Text(item['labourName'] ?? '', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                                  DataCell(Text(item['presentDays']?.toString() ?? '0')),
                                  DataCell(Text(item['halfDays']?.toString() ?? '0')),
                                  DataCell(Text((item['overtime'] ?? item['nightShift'] ?? 0).toString())),
                                  DataCell(Text(currencyFormat.format(tea), style: GoogleFonts.outfit(color: Colors.amber.shade600, fontWeight: FontWeight.w600))),
                                  DataCell(Text(currencyFormat.format(bhada), style: GoogleFonts.outfit(color: Colors.amber.shade600, fontWeight: FontWeight.w600))),
                                  DataCell(Text(currencyFormat.format(advance), style: GoogleFonts.outfit(color: Colors.red.shade600, fontWeight: FontWeight.w600))),
                                  DataCell(Text(currencyFormat.format(totalSalary), style: GoogleFonts.outfit(color: Colors.green.shade600, fontWeight: FontWeight.bold))),
                                ],
                              );
                            }).toList(),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
