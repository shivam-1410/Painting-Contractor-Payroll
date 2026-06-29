import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/site_provider.dart';
import '../providers/expense_provider.dart';
import '../models/site.dart';
import '../models/expense.dart';

class ExpensesScreen extends StatefulWidget {
  final Site? site; // Optional pre-selected site
  const ExpensesScreen({super.key, this.site});

  @override
  State<ExpensesScreen> createState() => _ExpensesScreenState();
}

class _ExpensesScreenState extends State<ExpensesScreen> {
  Site? _selectedSite;

  @override
  void initState() {
    super.initState();
    _selectedSite = widget.site;
    Future.microtask(() async {
      final siteProv = Provider.of<SiteProvider>(context, listen: false);
      await siteProv.fetchSites();
      
      // If no site was pre-selected, select the first active site
      if (_selectedSite == null && siteProv.activeSites.isNotEmpty) {
        _selectedSite = siteProv.activeSites.first;
      }
      _loadExpenses();
    });
  }

  void _loadExpenses() {
    if (_selectedSite == null) return;
    Provider.of<ExpenseProvider>(context, listen: false).fetchExpenses(_selectedSite!.id);
  }

  void _showExpenseForm() {
    if (_selectedSite == null) return;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => ExpenseFormSheet(siteId: _selectedSite!.id),
    ).then((_) => _loadExpenses());
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final siteProvider = Provider.of<SiteProvider>(context);
    final expenseProvider = Provider.of<ExpenseProvider>(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        title: Text(
          'SITE EXPENSES',
          style: GoogleFonts.outfit(fontWeight: FontWeight.black, letterSpacing: 1),
        ),
      ),
      body: Column(
        children: [
          // SITE FILTER
          Container(
            color: theme.colorScheme.surface,
            padding: const EdgeInsets.all(16.0),
            child: DropdownButtonFormField<Site>(
              value: _selectedSite,
              decoration: const InputDecoration(
                labelText: 'Select Site to View Expenses',
                border: OutlineInputBorder(),
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              ),
              items: siteProvider.sites.map((site) {
                return DropdownMenuItem<Site>(
                  value: site,
                  child: Text(site.name, style: const TextStyle(fontSize: 13)),
                );
              }).toList(),
              onChanged: (site) {
                if (site != null) {
                  setState(() {
                    _selectedSite = site;
                  });
                  _loadExpenses();
                }
              },
            ),
          ),

          // EXPENSE LIST
          Expanded(
            child: expenseProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : expenseProvider.expenses.isEmpty
                    ? Center(
                        child: Text(
                          'No expenses recorded for this site.\nTap "+" to add one.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
                        ),
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: expenseProvider.expenses.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (context, index) {
                          final expense = expenseProvider.expenses[index];
                          return _buildExpenseCard(theme, expense);
                        },
                      ),
          ),
        ],
      ),
      floatingActionButton: _selectedSite != null
          ? FloatingActionButton(
              onPressed: _showExpenseForm,
              backgroundColor: theme.colorScheme.primary,
              foregroundColor: Colors.white,
              child: const Icon(Icons.add),
            )
          : null,
    );
  }

  Widget _buildExpenseCard(ThemeData theme, Expense expense) {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    Color categoryColor = Colors.blue;
    if (expense.category == 'Material') categoryColor = Colors.purple;
    if (expense.category == 'Tea') categoryColor = Colors.amber;
    if (expense.category == 'Labour') categoryColor = Colors.emerald;

    return Dismissible(
      key: Key(expense.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20.0),
        decoration: BoxDecoration(
          color: Colors.red.shade600,
          borderRadius: BorderRadius.circular(20),
        ),
        child: const Icon(Icons.delete, color: Colors.white),
      ),
      confirmDismiss: (direction) async {
        return await showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('Delete Expense?'),
            content: const Text('Are you sure you want to remove this expense record?'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Cancel'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Delete', style: TextStyle(color: Colors.red)),
              ),
            ],
          ),
        );
      },
      onDismissed: (_) {
        Provider.of<ExpenseProvider>(context, listen: false).deleteExpense(expense.id);
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: theme.colorScheme.primary.withOpacity(0.05)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: categoryColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(15),
              ),
              child: Icon(
                expense.category == 'Material' 
                    ? Icons.hardware 
                    : expense.category == 'Tea' 
                        ? Icons.coffee 
                        : Icons.payments,
                color: categoryColor,
                size: 20,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    expense.description,
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Text(
                        expense.category,
                        style: TextStyle(color: categoryColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        DateFormat('yyyy-MM-dd').format(expense.date),
                        style: TextStyle(color: Colors.grey.shade450, fontSize: 10),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Text(
              currencyFormat.format(expense.amount),
              style: GoogleFonts.outfit(
                fontWeight: FontWeight.black,
                fontSize: 16,
                color: theme.colorScheme.primary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ExpenseFormSheet extends StatefulWidget {
  final String siteId;
  const ExpenseFormSheet({super.key, required this.siteId});

  @override
  State<ExpenseFormSheet> createState() => _ExpenseFormSheetState();
}

class _ExpenseFormSheetState extends State<ExpenseFormSheet> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _descriptionController;
  late TextEditingController _amountController;
  late DateTime _expenseDate;
  String _category = 'Material';

  final List<String> _categories = ['Material', 'Tea', 'Labour', 'Other'];

  @override
  void initState() {
    super.initState();
    _descriptionController = TextEditingController();
    _amountController = TextEditingController();
    _expenseDate = DateTime.now();
  }

  @override
  void dispose() {
    _descriptionController.dispose();
    _amountController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final description = _descriptionController.text.trim();
    final amount = double.parse(_amountController.text);
    final provider = Provider.of<ExpenseProvider>(context, listen: false);

    final success = await provider.addExpense(widget.siteId, description, amount, _expenseDate, _category);

    if (success && mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(30)),
      ),
      padding: EdgeInsets.only(
        top: 24,
        left: 24,
        right: 24,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Log Site Expense',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                value: _category,
                decoration: const InputDecoration(labelText: 'Category', border: OutlineInputBorder()),
                items: _categories.map((cat) {
                  return DropdownMenuItem<String>(
                    value: cat,
                    child: Text(cat),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    setState(() {
                      _category = val;
                    });
                  }
                },
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _descriptionController,
                decoration: const InputDecoration(labelText: 'Description/Items', border: OutlineInputBorder()),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _amountController,
                decoration: const InputDecoration(labelText: 'Amount (₹)', border: OutlineInputBorder(), prefixText: '₹ '),
                keyboardType: TextInputType.number,
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.between,
                children: [
                  const Text('Expense Date:', style: TextStyle(fontWeight: FontWeight.bold)),
                  TextButton.icon(
                    icon: const Icon(Icons.calendar_today),
                    label: Text(DateFormat('yyyy-MM-dd').format(_expenseDate)),
                    onPressed: () async {
                      final selected = await showDatePicker(
                        context: context,
                        initialDate: _expenseDate,
                        firstDate: DateTime(2000),
                        lastDate: DateTime(2100),
                      );
                      if (selected != null) {
                        setState(() {
                          _expenseDate = selected;
                        });
                      }
                    },
                  ),
                ],
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: const Text('Log Expense', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
