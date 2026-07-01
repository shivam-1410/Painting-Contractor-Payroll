import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/payroll_provider.dart';
import '../models/payroll.dart';

class PayrollHistoryScreen extends StatefulWidget {
  const PayrollHistoryScreen({super.key});

  @override
  State<PayrollHistoryScreen> createState() => _PayrollHistoryScreenState();
}

class _PayrollHistoryScreenState extends State<PayrollHistoryScreen> {
  String _selectedMonth = "";
  late TextEditingController _yearController;

  final List<String> _months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  @override
  void initState() {
    super.initState();
    _yearController = TextEditingController(text: DateTime.now().year.toString());
    _loadPayrolls();
  }

  @override
  void dispose() {
    _yearController.dispose();
    super.dispose();
  }

  void _loadPayrolls() {
    Future.microtask(() {
      Provider.of<PayrollProvider>(context, listen: false).fetchPayrolls();
    });
  }

  void _generatePayroll() async {
    if (_selectedMonth.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a month to generate payroll')),
      );
      return;
    }

    final year = int.tryParse(_yearController.text) ?? DateTime.now().year;
    final payrollProv = Provider.of<PayrollProvider>(context, listen: false);
    final success = await payrollProv.generatePayroll(_selectedMonth, year);

    if (mounted) {
      if (success) {
        _loadPayrolls();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payroll Generated Successfully'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(payrollProv.errorMessage ?? 'Failed to generate payroll'), backgroundColor: Colors.red),
        );
      }
    }
  }

  void _markAsPaid(Payroll payroll) async {
    final success = await Provider.of<PayrollProvider>(context, listen: false)
        .markAsPaid(payroll.id);
    
    if (mounted) {
      if (success) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment Marked As Paid'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to record payment'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final payrollProvider = Provider.of<PayrollProvider>(context);
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: RefreshIndicator(
        onRefresh: () async => _loadPayrolls(),
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER SECTION
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Payroll Management',
                          style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Generate and manage monthly payouts, calculate labor balances, and track payment status.',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  
                  // CONTROLS CARD
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        SizedBox(
                          width: 130,
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: _selectedMonth.isEmpty ? null : _selectedMonth,
                              hint: const Text('Select Month', style: TextStyle(fontSize: 12)),
                              items: _months.map((m) {
                                return DropdownMenuItem<String>(
                                  value: m,
                                  child: Text(m, style: const TextStyle(fontSize: 12)),
                                );
                              }).toList(),
                              onChanged: (v) => setState(() => _selectedMonth = v ?? ""),
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        SizedBox(
                          width: 60,
                          child: TextField(
                            controller: _yearController,
                            keyboardType: TextInputType.number,
                            textAlign: TextAlign.center,
                            style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.bold),
                            decoration: const InputDecoration(
                              isDense: true,
                              contentPadding: EdgeInsets.symmetric(vertical: 8),
                              border: InputBorder.none,
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        ElevatedButton(
                          onPressed: _generatePayroll,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: const Text('Generate Payroll', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // PAYROLL TABLE
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
                        'Payroll Records',
                        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (payrollProvider.isLoading)
                      const Padding(
                        padding: EdgeInsets.all(48.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (payrollProvider.payrolls.isEmpty)
                      Padding(
                        padding: const EdgeInsets.all(48.0),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.payment_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text('No payroll records found', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Text('Select a month and year to generate payroll.', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
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
                              DataColumn(label: Text('Month', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text('Salary', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Status', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text('Action', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                            ],
                            rows: payrollProvider.payrolls.map((payroll) {
                              final isPaid = payroll.paymentStatus == 'Paid';
                              return DataRow(
                                cells: [
                                  DataCell(Text(payroll.labourName, style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                                  DataCell(Text('${payroll.month} ${payroll.year}')),
                                  DataCell(Text(currencyFormat.format(payroll.totalSalary), style: GoogleFonts.outfit(color: Colors.green.shade600, fontWeight: FontWeight.bold))),
                                  DataCell(
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: isPaid ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(
                                            isPaid ? Icons.check_circle : Icons.access_time_filled,
                                            color: isPaid ? Colors.green : Colors.orange,
                                            size: 12,
                                          ),
                                          const SizedBox(width: 4),
                                          Text(
                                            payroll.paymentStatus,
                                            style: GoogleFonts.outfit(
                                              color: isPaid ? Colors.green : Colors.orange,
                                              fontWeight: FontWeight.bold,
                                              fontSize: 10,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    isPaid
                                        ? const SizedBox()
                                        : ElevatedButton.icon(
                                            onPressed: () => _markAsPaid(payroll),
                                            icon: const Icon(Icons.money, size: 12, color: Colors.white),
                                            label: const Text('Mark Paid', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.green.shade600,
                                              foregroundColor: Colors.white,
                                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                              minimumSize: Size.zero,
                                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                                            ),
                                          ),
                                  ),
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
