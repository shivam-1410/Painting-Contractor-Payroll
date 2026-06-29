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
  String _selectedMonth = DateFormat('MMMM').format(DateTime.now());
  int _selectedYear = DateTime.now().year;

  final List<String> _months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  final List<int> _years = List.generate(5, (index) => DateTime.now().year - index);

  @override
  void initState() {
    super.initState();
    _loadSalaries();
  }

  void _loadSalaries() {
    Future.microtask(() {
      Provider.of<PayrollProvider>(context, listen: false)
          .fetchSalaryCalculations(_selectedMonth, _selectedYear);
    });
  }

  void _generatePayroll() async {
    final payrollProv = Provider.of<PayrollProvider>(context, listen: false);
    final calculations = payrollProv.salaryCalculations;
    
    if (calculations.isEmpty) return;

    final records = calculations.map<Map<String, dynamic>>((calc) {
      return {
        'labour': calc['labourId'],
        'labourName': calc['labourName'],
        'month': _selectedMonth,
        'year': _selectedYear,
        'presentDays': calc['presentDays'],
        'halfDays': calc['halfDays'],
        'absentDays': calc['absentDays'],
        'overtime': calc['overtimeWage'],
        'teaExpense': calc['teaExpense'],
        'bhada': calc['bhada'],
        'advance': calc['advance'],
        'baseSalary': calc['baseSalary'],
        'totalSalary': calc['netSalary'],
        'paymentStatus': 'Pending',
      };
    }).toList();

    final success = await payrollProv.generatePayroll(_selectedMonth, _selectedYear, records);
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Payroll generated successfully!' : 'Failed to generate payroll'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final payrollProvider = Provider.of<PayrollProvider>(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        title: Text(
          'SALARY',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
      ),
      body: Column(
        children: [
          // FILTERS
          _buildFilterHeader(theme),

          // CALCULATION LIST
          Expanded(
            child: payrollProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : payrollProvider.salaryCalculations.isEmpty
                    ? Center(
                        child: Text(
                          'No attendance records found for this month.',
                          style: TextStyle(color: Colors.grey.shade500),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: payrollProvider.salaryCalculations.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final salary = payrollProvider.salaryCalculations[index];
                          return _buildSalaryCard(theme, salary);
                        },
                      ),
          ),
        ],
      ),
      bottomNavigationBar: payrollProvider.salaryCalculations.isNotEmpty
          ? Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                boxShadow: [
                  BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2)),
                ],
              ),
              child: SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _generatePayroll,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: Text(
                    'Generate & Freeze Monthly Payroll',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
            )
          : null,
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
                  _loadSalaries();
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
                  _loadSalaries();
                }
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSalaryCard(ThemeData theme, Map<String, dynamic> salary) {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    final netSalary = (salary['netSalary'] ?? 0.0).toDouble();
    final baseSalary = (salary['baseSalary'] ?? 0.0).toDouble();
    final overtime = (salary['overtimeWage'] ?? 0.0).toDouble();
    final tea = (salary['teaExpense'] ?? 0.0).toDouble();
    final bhada = (salary['bhada'] ?? 0.0).toDouble();
    final advance = (salary['advance'] ?? 0.0).toDouble();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.colorScheme.primary.withOpacity(0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                salary['labourName'] ?? '',
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
              ),
              Text(
                currencyFormat.format(netSalary),
                style: GoogleFonts.outfit(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w900,
                  fontSize: 18,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          const Divider(height: 1),
          const SizedBox(height: 12),
          
          // DAYS & SHIFTS
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildMetricText('Present', '${salary['presentDays']} Days'),
              _buildMetricText('Half Days', '${salary['halfDays']} Days'),
              _buildMetricText('Absent', '${salary['absentDays']} Days'),
            ],
          ),
          const SizedBox(height: 16),

          // FINANCIAL BREAKDOWN
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildBreakdownItem('Base Salary', currencyFormat.format(baseSalary)),
              _buildBreakdownItem('Overtime', '+ ${currencyFormat.format(overtime)}'),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              _buildBreakdownItem('Tea Expense', '- ${currencyFormat.format(tea)}'),
              _buildBreakdownItem('Bhada', '- ${currencyFormat.format(bhada)}'),
              _buildBreakdownItem('Advance', '- ${currencyFormat.format(advance)}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildMetricText(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.bold)),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
      ],
    );
  }

  Widget _buildBreakdownItem(String label, String amount) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(color: Colors.grey.shade500, fontSize: 10)),
        const SizedBox(height: 2),
        Text(amount, style: GoogleFonts.outfit(fontWeight: FontWeight.w600, fontSize: 12)),
      ],
    );
  }
}
