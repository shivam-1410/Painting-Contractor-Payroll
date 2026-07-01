import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/site_provider.dart';
import '../providers/expense_provider.dart';
import '../models/site.dart';
import '../models/challan.dart';

class ExpensesScreen extends StatefulWidget {
  final Site? site; // Optional pre-selected site
  const ExpensesScreen({super.key, this.site});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  String? _selectedSiteId;

  @override
  void initState() {
    super.initState();
    _selectedSiteId = widget.site?.id;
    Future.microtask(() async {
      final siteProv = Provider.of<SiteProvider>(context, listen: false);
      await siteProv.fetchSites();
      _loadData();
    });
  }

  void _loadData() {
    final expenseProv = Provider.of<ExpenseProvider>(context, listen: false);
    if (_selectedSiteId != null) {
      expenseProv.fetchExpenses(_selectedSiteId!);
    } else {
      expenseProv.fetchAllChallans();
    }
  }

  void _showAddChallanForm() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AddChallanDialog(
        preSelectedSiteId: _selectedSiteId,
        onSave: () => _loadData(),
      ),
    );
  }

  void _viewChallanDetails(Challan challan) {
    showDialog(
      context: context,
      builder: (_) => ViewChallanDialog(challan: challan),
    );
  }

  void _confirmDeleteChallan(Challan challan) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete Challan', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: Text(
          'Are you sure you want to delete challan #${challan.challanNo} from ${challan.vendor}? This action is permanent.',
          style: const TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await Provider.of<ExpenseProvider>(context, listen: false)
                  .deleteExpense(challan.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Challan deleted successfully!' : 'Failed to delete challan'),
                    backgroundColor: success ? Colors.green : Colors.red,
                  ),
                );
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final siteProvider = Provider.of<SiteProvider>(context);
    final expenseProvider = Provider.of<ExpenseProvider>(context);
    final isDesktop = MediaQuery.of(context).size.width >= 1024;

    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    // KPI Calculations
    final double grandTotalExpenses = expenseProvider.challans.fold(0.0, (sum, c) => sum + c.totalAmount);
    final currentMonth = DateTime.now().month;
    final currentYear = DateTime.now().year;
    final double monthlyExpenses = expenseProvider.challans
        .where((c) => c.billDate.month == currentMonth && c.billDate.year == currentYear)
        .fold(0.0, (sum, c) => sum + c.totalAmount);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: RefreshIndicator(
        onRefresh: () async => _loadData(),
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
                          'Site Expenses',
                          style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Manage material purchases, paint deliveries, and vendor invoices per site.',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton.icon(
                    onPressed: _showAddChallanForm,
                    icon: const Icon(Icons.add, size: 16, color: Colors.white),
                    label: Text(
                      'Add Challan Expense',
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: theme.colorScheme.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // SITE FILTER
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: theme.colorScheme.surface,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.filter_list, size: 20, color: Colors.grey),
                    const SizedBox(width: 12),
                    Expanded(
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String?>(
                          value: _selectedSiteId,
                          hint: const Text('All Sites', style: TextStyle(fontSize: 13)),
                          isExpanded: true,
                          items: [
                            const DropdownMenuItem<String?>(
                              value: null,
                              child: Text('All Sites', style: TextStyle(fontSize: 13)),
                            ),
                            ...siteProvider.sites.map((site) {
                              return DropdownMenuItem<String?>(
                                value: site.id,
                                child: Text(site.name, style: const TextStyle(fontSize: 13)),
                              );
                            }),
                          ],
                          onChanged: (id) {
                            setState(() {
                              _selectedSiteId = id;
                            });
                            _loadData();
                          },
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // KPI CARDS
              _buildKpisRow(grandTotalExpenses, monthlyExpenses, expenseProvider.challans.length, currencyFormat, isDesktop),
              const SizedBox(height: 32),

              // CHALLAN LIST TABLE
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
                        'All Challan Receipts',
                        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                    ),
                    if (expenseProvider.isLoading)
                      const Padding(
                        padding: EdgeInsets.all(48.0),
                        child: Center(child: CircularProgressIndicator()),
                      )
                    else if (expenseProvider.challans.isEmpty)
                      Padding(
                        padding: const EdgeInsets.all(48.0),
                        child: Center(
                          child: Column(
                            children: [
                              Icon(Icons.receipt_long_outlined, size: 48, color: Colors.grey.shade400),
                              const SizedBox(height: 16),
                              Text('No challan records found', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                              const SizedBox(height: 8),
                              Text('Click "Add Challan Expense" to log your first site expense.', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
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
                              DataColumn(label: Text('Bill Date', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text('Challan No.', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text('Site Name', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text('Vendor Name', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                              DataColumn(label: Text('Items Count', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Grand Total', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)), numeric: true),
                              DataColumn(label: Text('Actions', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                            ],
                            rows: expenseProvider.challans.map((challan) {
                              return DataRow(
                                cells: [
                                  DataCell(Text(DateFormat('dd/MM/yyyy').format(challan.billDate))),
                                  DataCell(Text('#${challan.challanNo}', style: GoogleFonts.outfit(color: theme.colorScheme.primary, fontWeight: FontWeight.bold))),
                                  DataCell(Text(challan.siteName ?? 'N/A', style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                                  DataCell(Text(challan.vendor)),
                                  DataCell(Text(challan.items.length.toString())),
                                  DataCell(Text(currencyFormat.format(challan.totalAmount), style: GoogleFonts.outfit(fontWeight: FontWeight.bold))),
                                  DataCell(
                                    Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.remove_red_eye_outlined, color: Colors.blue, size: 18),
                                          onPressed: () => _viewChallanDetails(challan),
                                          tooltip: 'View Slip Details',
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
                                          onPressed: () => _confirmDeleteChallan(challan),
                                          tooltip: 'Delete Challan',
                                        ),
                                      ],
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

  Widget _buildKpisRow(
    double total,
    double monthly,
    int count,
    NumberFormat currencyFormat,
    bool isDesktop,
  ) {
    final List<Widget> children = [
      Expanded(
        child: _buildKpiCard(
          title: 'Grand Total Expenses',
          value: currencyFormat.format(total),
          icon: Icons.monetization_on_outlined,
          color: Colors.red,
        ),
      ),
      if (!isDesktop) const SizedBox(height: 16),
      Expanded(
        child: _buildKpiCard(
          title: "This Month's Expenses",
          value: currencyFormat.format(monthly),
          icon: Icons.calendar_today_outlined,
          color: Colors.amber,
        ),
      ),
      if (!isDesktop) const SizedBox(height: 16),
      Expanded(
        child: _buildKpiCard(
          title: 'Total Challan Records',
          value: count.toString(),
          icon: Icons.description_outlined,
          color: Colors.indigo,
        ),
      ),
    ];

    return isDesktop
        ? Row(children: children)
        : Column(children: children.map((w) => w is Expanded ? w.child! : w).toList());
  }

  Widget _buildKpiCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
  }) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Theme.of(context).dividerColor.withOpacity(0.08)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: Stack(
          children: [
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              child: Container(color: color),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 8),
                    Text(
                      title.toUpperCase(),
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.5),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      value,
                      style: GoogleFonts.outfit(fontSize: 24, fontWeight: FontWeight.w900),
                    ),
                  ],
                ),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: color.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Icon(icon, color: color, size: 24),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// VIEW CHALLAN DETAIL DIALOG (INVOICE SLIP)
class ViewChallanDialog extends StatelessWidget {
  final Challan challan;
  const ViewChallanDialog({super.key, required this.challan});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      child: Container(
        width: 600,
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(30),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(Icons.receipt_long, color: Colors.indigo, size: 24),
                      const SizedBox(width: 12),
                      Text(
                        'CHALLAN SUMMARY',
                        style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w900, letterSpacing: 0.5),
                      ),
                    ],
                  ),
                  IconButton(
                    icon: const Icon(Icons.close),
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              const Divider(height: 1),
              const SizedBox(height: 20),

              // RETAILER AND CHALLAN GENERAL META
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          challan.vendor,
                          style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text('Supplier / Vendor', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('CHALLAN NO.', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(
                        '#${challan.challanNo}',
                        style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w900, color: theme.colorScheme.primary),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 24),

              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('ASSOCIATED SITE', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 4),
                        Text(challan.siteName ?? 'N/A', style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold)),
                        if (challan.siteLocation != null)
                          Text(challan.siteLocation!, style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text('CHALLAN DATE', style: TextStyle(color: Colors.grey.shade400, fontSize: 10, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text(
                        DateFormat('dd MMMM yyyy').format(challan.billDate),
                        style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // ITEMS TABLE
              Text(
                'ITEMS',
                style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 0.5),
              ),
              const SizedBox(height: 8),
              const Divider(height: 1),
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: challan.items.length,
                itemBuilder: (context, idx) {
                  final item = challan.items[idx];
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 12.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          flex: 3,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(item.itemName, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              if (item.liter != null && item.liter!.isNotEmpty)
                                Text('${item.liter} Litre', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                            ],
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: Text(
                            '${item.qty.toInt()}x',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: Text(
                            currencyFormat.format(item.rate),
                            style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                            textAlign: TextAlign.right,
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Text(
                            currencyFormat.format(item.amount),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            textAlign: TextAlign.right,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
              const Divider(height: 1),
              const SizedBox(height: 16),

              // TOTAL
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('TOTAL AMOUNT:', style: TextStyle(color: Colors.grey.shade500, fontWeight: FontWeight.bold, fontSize: 12)),
                  Text(
                    currencyFormat.format(challan.totalAmount),
                    style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.green),
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // FOOTER
              Center(
                child: Column(
                  children: [
                    Text('Computer made shade cannot be returned.', style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontStyle: FontStyle.italic)),
                    const SizedBox(height: 4),
                    Text('Thank You', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: Colors.grey.shade500, fontSize: 12)),
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

// ADD CHALLAN DIALOG
class AddChallanDialog extends StatefulWidget {
  final String? preSelectedSiteId;
  final VoidCallback onSave;
  const AddChallanDialog({super.key, this.preSelectedSiteId, required this.onSave});

  @override
  State<AddChallanDialog> createState() => _AddChallanDialogState();
}

class _AddChallanDialogState extends State<AddChallanDialog> {
  final _formKey = GlobalKey<FormState>();
  String? _selectedSiteId;
  final _challanNoController = TextEditingController();
  final _vendorController = TextEditingController();
  DateTime _billDate = DateTime.now();

  final List<Map<String, dynamic>> _items = [
    {'itemName': '', 'liter': '', 'qty': 1, 'rate': 0.0, 'amount': 0.0}
  ];

  @override
  void initState() {
    super.initState();
    final siteProv = Provider.of<SiteProvider>(context, listen: false);
    if (widget.preSelectedSiteId != null) {
      _selectedSiteId = widget.preSelectedSiteId;
    } else if (siteProv.sites.isNotEmpty) {
      _selectedSiteId = siteProv.sites.first.id;
    }
  }

  @override
  void dispose() {
    _challanNoController.dispose();
    _vendorController.dispose();
    super.dispose();
  }

  void _addItemRow() {
    setState(() {
      _items.add({'itemName': '', 'liter': '', 'qty': 1, 'rate': 0.0, 'amount': 0.0});
    });
  }

  void _removeItemRow(int index) {
    if (_items.length == 1) return;
    setState(() {
      _items.removeAt(index);
    });
  }

  void _updateItemAmount(int index) {
    final qty = _items[index]['qty'] as num;
    final rate = _items[index]['rate'] as num;
    setState(() {
      _items[index]['amount'] = (qty * rate).toDouble();
    });
  }

  double get _grandTotal {
    return _items.fold(0.0, (sum, item) => sum + (item['amount'] as double));
  }

  void _submit() async {
    if (!_formKey.currentState!.validate() || _selectedSiteId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill in all required fields')),
      );
      return;
    }

    final challanData = {
      'site': _selectedSiteId,
      'challanNo': _challanNoController.text.trim(),
      'vendor': _vendorController.text.trim(),
      'billDate': DateFormat('yyyy-MM-dd').format(_billDate),
      'items': _items.map((item) {
        return {
          'itemName': item['itemName'],
          'liter': item['liter'],
          'qty': item['qty'],
          'rate': item['rate'],
          'amount': item['amount'],
        };
      }).toList(),
    };

    final success = await Provider.of<ExpenseProvider>(context, listen: false)
        .addChallan(challanData);

    if (mounted) {
      if (success) {
        widget.onSave();
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Challan saved successfully!'), backgroundColor: Colors.green),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save challan'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final siteProvider = Provider.of<SiteProvider>(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      child: Container(
        width: 800,
        padding: const EdgeInsets.all(28),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // HEADER
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Add Site Expense Challan',
                          style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 4),
                        Text('Enter invoice headers and item details', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // HEADERS ROW
                Wrap(
                  spacing: 16,
                  runSpacing: 16,
                  children: [
                    SizedBox(
                      width: 230,
                      child: DropdownButtonFormField<String>(
                        value: _selectedSiteId,
                        decoration: const InputDecoration(labelText: 'Select Site *', border: OutlineInputBorder()),
                        items: siteProvider.sites.map((site) {
                          return DropdownMenuItem<String>(
                            value: site.id,
                            child: Text(site.name, style: const TextStyle(fontSize: 13)),
                          );
                        }).toList(),
                        onChanged: (val) => setState(() => _selectedSiteId = val),
                      ),
                    ),
                    SizedBox(
                      width: 150,
                      child: TextFormField(
                        controller: _challanNoController,
                        decoration: const InputDecoration(labelText: 'Challan No. *', border: OutlineInputBorder()),
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                    ),
                    SizedBox(
                      width: 200,
                      child: TextFormField(
                        controller: _vendorController,
                        decoration: const InputDecoration(labelText: 'Vendor Name *', border: OutlineInputBorder()),
                        validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                      ),
                    ),
                    SizedBox(
                      width: 130,
                      child: OutlinedButton.icon(
                        onPressed: () async {
                          final selected = await showDatePicker(
                            context: context,
                            initialDate: _billDate,
                            firstDate: DateTime(2000),
                            lastDate: DateTime(2100),
                          );
                          if (selected != null) {
                            setState(() => _billDate = selected);
                          }
                        },
                        icon: const Icon(Icons.calendar_today, size: 14),
                        label: Text(DateFormat('yyyy-MM-dd').format(_billDate), style: const TextStyle(fontSize: 12)),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 20),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // ITEMS TABLE HEADER
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'CHALLAN ITEMS',
                      style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    ElevatedButton.icon(
                      onPressed: _addItemRow,
                      icon: const Icon(Icons.add, size: 14),
                      label: const Text('Add Item Row', style: TextStyle(fontSize: 11)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.primary.withOpacity(0.08),
                        foregroundColor: theme.colorScheme.primary,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // ITEMS LIST
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: _items.length,
                  itemBuilder: (context, index) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Row(
                        children: [
                          Expanded(
                            flex: 3,
                            child: TextFormField(
                              decoration: const InputDecoration(labelText: 'Item Name *', border: OutlineInputBorder()),
                              onChanged: (v) => _items[index]['itemName'] = v,
                              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 1,
                            child: TextFormField(
                              decoration: const InputDecoration(labelText: 'Litre', border: OutlineInputBorder()),
                              onChanged: (v) => _items[index]['liter'] = v,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 1,
                            child: TextFormField(
                              decoration: const InputDecoration(labelText: 'Qty *', border: OutlineInputBorder()),
                              initialValue: '1',
                              keyboardType: TextInputType.number,
                              onChanged: (v) {
                                _items[index]['qty'] = double.tryParse(v) ?? 1.0;
                                _updateItemAmount(index);
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 1,
                            child: TextFormField(
                              decoration: const InputDecoration(labelText: 'Rate', border: OutlineInputBorder()),
                              initialValue: '0',
                              keyboardType: TextInputType.number,
                              onChanged: (v) {
                                _items[index]['rate'] = double.tryParse(v) ?? 0.0;
                                _updateItemAmount(index);
                              },
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            flex: 1,
                            child: Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                border: Border.all(color: Colors.grey.shade300),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              alignment: Alignment.centerRight,
                              child: Text(
                                _items[index]['amount'].toStringAsFixed(0),
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.delete, color: Colors.red),
                            onPressed: () => _removeItemRow(index),
                          ),
                        ],
                      ),
                    );
                  },
                ),
                const SizedBox(height: 24),
                const Divider(height: 1),
                const SizedBox(height: 16),

                // GRAND TOTAL
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Grand Total Amount', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                    Text(
                      '₹${_grandTotal.toStringAsFixed(0)}',
                      style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: theme.colorScheme.primary),
                    ),
                  ],
                ),
                const SizedBox(height: 32),

                // BUTTONS
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      ),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                      ),
                      child: const Text('Save Challan'),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
