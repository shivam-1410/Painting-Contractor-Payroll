import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import 'attendance_screen.dart';
import 'expenses_screen.dart';
import 'labours_screen.dart';
import 'payroll_screen.dart';
import 'reports_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> with SingleTickerProviderStateMixin {
  Map<String, dynamic> _dashboardData = {
    'totalLabours': 0,
    'totalAttendance': 0,
    'pendingPayments': 0,
    'totalSites': 0,
    'monthlyPayroll': 0,
    'recentAttendance': [],
    'recentPayments': [],
  };

  List<dynamic> _sites = [];
  List<dynamic> _challans = [];
  bool _isLoading = true;
  String? _error;
  late AnimationController _animateController;

  @override
  void initState() {
    super.initState();
    _animateController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _fetchData();
  }

  @override
  void dispose() {
    _animateController.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    if (!mounted) return;
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final responses = await Future.wait([
        ApiService.get('/dashboard'),
        ApiService.get('/sites'),
        ApiService.get('/challans'),
      ]);

      if (mounted) {
        setState(() {
          _dashboardData = jsonDecode(responses[0].body);
          _sites = jsonDecode(responses[1].body);
          _challans = jsonDecode(responses[2].body);
          _isLoading = false;
        });
        _animateController.forward(from: 0.0);
      }
    } catch (e) {
      debugPrint('Error fetching dashboard data: $e');
      if (mounted) {
        setState(() {
          _error = 'Failed to load dashboard data. Make sure the backend server is running.';
          _isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> _getSiteExpenses() {
    final Map<String, double> expensesMap = {};
    
    for (var c in _challans) {
      final items = c['items'] as List<dynamic>?;
      final totalAmount = (c['totalAmount'] ?? 0.0).toDouble();
      
      if (items != null && items.isNotEmpty) {
        for (var item in items) {
          final siteNode = item['site'];
          String? siteName;
          String? siteId;
          
          if (siteNode is Map) {
            siteName = siteNode['name']?.toString().toLowerCase().trim();
            siteId = siteNode['_id']?.toString().toLowerCase();
          } else if (siteNode != null) {
            siteId = siteNode.toString().toLowerCase();
          }
          
          if (siteId == null) {
            final cSite = c['site'];
            if (cSite is Map) {
              siteName = cSite['name']?.toString().toLowerCase().trim();
              siteId = cSite['_id']?.toString().toLowerCase();
            } else if (cSite != null) {
              siteId = cSite.toString().toLowerCase();
            }
          }

          final double itemAmount = (item['amount'] ?? 0.0).toDouble();
          final double calculatedAmount = itemAmount > 0 
              ? itemAmount 
              : ((item['qty'] ?? 0.0).toDouble() * (item['rate'] ?? 0.0).toDouble());

          if (siteName != null && siteName.isNotEmpty) {
            expensesMap[siteName] = (expensesMap[siteName] ?? 0.0) + calculatedAmount;
          } else if (siteId != null) {
            expensesMap[siteId] = (expensesMap[siteId] ?? 0.0) + calculatedAmount;
          }
        }
      } else {
        final cSite = c['site'];
        String? siteName;
        String? siteId;
        
        if (cSite is Map) {
          siteName = cSite['name']?.toString().toLowerCase().trim();
          siteId = cSite['_id']?.toString().toLowerCase();
        } else if (cSite != null) {
          siteId = cSite.toString().toLowerCase();
        }

        if (siteName != null && siteName.isNotEmpty) {
          expensesMap[siteName] = (expensesMap[siteName] ?? 0.0) + totalAmount;
        } else if (siteId != null) {
          expensesMap[siteId] = (expensesMap[siteId] ?? 0.0) + totalAmount;
        }
      }
    }

    final List<Map<String, dynamic>> siteExpenses = [];
    for (var site in _sites) {
      final nameKey = site['name']?.toString().toLowerCase().trim() ?? '';
      final idKey = site['_id']?.toString().toLowerCase() ?? '';
      
      final double expense = expensesMap[nameKey] ?? expensesMap[idKey] ?? 0.0;
      siteExpenses.add({
        'id': site['_id'],
        'name': site['name'] ?? 'Unknown Site',
        'expense': expense,
      });
    }

    siteExpenses.sort((a, b) => (b['expense'] as double).compareTo(a['expense'] as double));
    return siteExpenses.take(5).toList();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    if (_isLoading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 48, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  _error!,
                  style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                ElevatedButton(
                  onPressed: _fetchData,
                  child: const Text('Retry'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final activeSitesCount = _sites.where((s) => s['status'] == null || s['status'].toString().toLowerCase() == 'active').length;
    final double totalAllExpenses = _challans.fold(0.0, (sum, c) => sum + (c['totalAmount'] ?? 0.0).toDouble());
    final topExpenses = _getSiteExpenses();
    final double monthlyPayroll = (_dashboardData['monthlyPayroll'] ?? 0.0).toDouble();

    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: RefreshIndicator(
        onRefresh: _fetchData,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // HEADER SECTION
              _buildHeaderSection(theme),
              const SizedBox(height: 32),

              // QUICK ACTIONS PANEL
              _buildQuickActionsPanel(context, theme),
              const SizedBox(height: 32),

              // KPI GRID
              _buildKpiGrid(theme, activeSitesCount, currencyFormat),
              const SizedBox(height: 32),

              // ANALYTICS & FINANCIALS ROW
              _buildAnalyticsSection(theme, topExpenses, totalAllExpenses, monthlyPayroll, currencyFormat, isDark),
              const SizedBox(height: 32),

              // DYNAMIC LISTS GRID (RECENT ATTENDANCE & PAYMENTS)
              _buildDynamicListsGrid(theme, currencyFormat),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeaderSection(ThemeData theme) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final bool isMobile = screenWidth < 750;

    final headerChildren = [
      Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'ERP Control Center',
            style: GoogleFonts.outfit(
              fontSize: 28,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.onBackground,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            'Welcome back to VC Dreams Contractor ERP portal. Here is your operational overview.',
            style: TextStyle(
              color: Colors.grey.shade500,
              fontSize: 13,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: theme.colorScheme.primary.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: theme.colorScheme.primary.withOpacity(0.1)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: Colors.green,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Text(
              'Live Database Connected',
              style: GoogleFonts.outfit(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(30),
        border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.02),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: isMobile
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                headerChildren[0],
                const SizedBox(height: 16),
                headerChildren[1],
              ],
            )
          : Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: headerChildren[0]),
                const SizedBox(width: 16),
                headerChildren[1],
              ],
            ),
    );
  }

  Widget _buildQuickActionsPanel(BuildContext context, ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'QUICK ACTIONS',
          style: GoogleFonts.outfit(
            fontSize: 11,
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade500,
            letterSpacing: 1.5,
          ),
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            final double width = constraints.maxWidth;
            final int crossAxisCount = width > 1100 ? 4 : (width > 600 ? 2 : 1);
            return GridView.count(
              crossAxisCount: crossAxisCount,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              childAspectRatio: 3.2,
              children: [
                _buildQuickActionCard(
                  theme,
                  title: 'Record Attendance',
                  subtitle: "Log today's hours",
                  icon: Icons.assignment_outlined,
                  color: Colors.green,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const AttendanceScreen())),
                ),
                _buildQuickActionCard(
                  theme,
                  title: 'Log Site Expense',
                  subtitle: 'Record supply challans',
                  icon: Icons.receipt_outlined,
                  color: Colors.blue,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ExpensesScreen())),
                ),
                _buildQuickActionCard(
                  theme,
                  title: 'Manage Payroll',
                  subtitle: 'Wages & payouts',
                  icon: Icons.payments_outlined,
                  color: Colors.purple,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const PayrollHistoryScreen())),
                ),
                _buildQuickActionCard(
                  theme,
                  title: 'Add Labourer',
                  subtitle: 'Register new worker',
                  icon: Icons.person_add_alt_1_outlined,
                  color: theme.colorScheme.primary,
                  onTap: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LaboursScreen())),
                ),
              ],
            );
          },
        ),
      ],
    );
  }

  Widget _buildQuickActionCard(
    ThemeData theme, {
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: color.withOpacity(0.08),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    title,
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontWeight: FontWeight.w500),
                  ),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, size: 12, color: Colors.grey.shade400),
          ],
        ),
      ),
    );
  }

  Widget _buildKpiGrid(ThemeData theme, int activeSitesCount, NumberFormat currencyFormat) {
    final totalLabours = _dashboardData['totalLabours'] ?? 0;
    final totalAttendance = _dashboardData['totalAttendance'] ?? 0;
    final pendingPayments = _dashboardData['pendingPayments'] ?? 0.0;
    final monthlyPayroll = _dashboardData['monthlyPayroll'] ?? 0.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final double width = constraints.maxWidth;
        final int crossAxisCount = width > 1200 ? 5 : (width > 800 ? 3 : (width > 500 ? 2 : 1));
        return GridView.count(
          crossAxisCount: crossAxisCount,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
          childAspectRatio: 1.5,
          children: [
            _buildKpiCard(
              theme,
              title: 'Total Labours',
              value: totalLabours.toString(),
              subtitle: 'Registered workforce',
              icon: Icons.people_outline,
              gradientColors: [Colors.blue, Colors.indigo],
            ),
            _buildKpiCard(
              theme,
              title: 'Present Today',
              value: totalAttendance.toString(),
              subtitle: 'Active attendance today',
              icon: Icons.assignment_turned_in_outlined,
              gradientColors: [Colors.green, Colors.teal],
            ),
            _buildKpiCard(
              theme,
              title: 'Pending Payments',
              value: currencyFormat.format(pendingPayments),
              subtitle: 'Awaiting transaction',
              icon: Icons.pending_actions_outlined,
              gradientColors: [Colors.red, Colors.orange],
            ),
            _buildKpiCard(
              theme,
              title: 'Active Sites',
              value: activeSitesCount.toString(),
              subtitle: 'Ongoing projects',
              icon: Icons.business_outlined,
              gradientColors: [Colors.purple, Colors.deepPurple],
            ),
            _buildKpiCard(
              theme,
              title: 'Monthly Payroll',
              value: currencyFormat.format(monthlyPayroll),
              subtitle: 'Current month outlay',
              icon: Icons.payments_outlined,
              gradientColors: [Colors.amber, Colors.orange],
            ),
          ],
        );
      },
    );
  }

  Widget _buildKpiCard(
    ThemeData theme, {
    required String title,
    required String value,
    required String subtitle,
    required IconData icon,
    required List<Color> gradientColors,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.01),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
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
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(colors: gradientColors),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title.toUpperCase(),
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: gradientColors[0].withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(icon, color: gradientColors[0], size: 16),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Text(
                    value,
                    style: GoogleFonts.outfit(
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      color: theme.colorScheme.onSurface,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      color: Colors.grey.shade400,
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnalyticsSection(
    ThemeData theme,
    List<Map<String, dynamic>> topExpenses,
    double totalAllExpenses,
    double monthlyPayroll,
    NumberFormat currencyFormat,
    bool isDark,
  ) {
    final isDesktop = MediaQuery.of(context).size.width >= 1024;

    final List<Widget> children = [
      // EXPENSES DISTRIBUTION
      Expanded(
        flex: isDesktop ? 2 : 1,
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'EXPENSES DISTRIBUTION',
                    style: GoogleFonts.outfit(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.background,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'TOP 5 BUDGETS',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              if (topExpenses.isEmpty)
                const SizedBox(
                  height: 200,
                  child: Center(child: Text('No expense challans found.')),
                )
              else
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: topExpenses.length,
                  itemBuilder: (context, index) {
                    final se = topExpenses[index];
                    final double expenseAmount = se['expense'];
                    final double percentage = totalAllExpenses > 0 ? (expenseAmount / totalAllExpenses * 100) : 0.0;
                    
                    final List<List<Color>> gradients = [
                      [Colors.teal, Colors.green],
                      [Colors.blue, Colors.indigo],
                      [Colors.purple, Colors.deepPurple],
                      [Colors.orange, Colors.amber],
                      [Colors.pink, Colors.red],
                    ];
                    final activeGradient = gradients[index % gradients.length];

                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: 8.0),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                se['name'],
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              Row(
                                children: [
                                  Text(
                                    '${percentage.toStringAsFixed(1)}% of total',
                                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    currencyFormat.format(expenseAmount),
                                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          AnimatedBuilder(
                            animation: _animateController,
                            builder: (context, child) {
                              final progress = _animateController.value * (percentage / 100);
                              return ClipRRect(
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  width: double.infinity,
                                  height: 8,
                                  color: theme.colorScheme.background,
                                  child: Align(
                                    alignment: Alignment.centerLeft,
                                    child: FractionallySizedBox(
                                      widthFactor: progress.clamp(0.0, 1.0),
                                      child: Container(
                                        decoration: BoxDecoration(
                                          gradient: LinearGradient(colors: activeGradient),
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            },
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
      if (!isDesktop) const SizedBox(height: 24),
      // FINANCIAL BREAKDOWN CARD
      Expanded(
        flex: 1,
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF0F172A), Color(0xFF1E1B4B)], // Slate-900 to Indigo-950
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(30),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF4F46E5).withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'ERP ANALYTICS SUITE',
                style: GoogleFonts.outfit(
                  fontSize: 10,
                  fontWeight: FontWeight.w900,
                  color: Colors.indigoAccent.shade100,
                  letterSpacing: 1.5,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Operational Capital',
                style: GoogleFonts.outfit(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Summing active payroll payouts & supply delivery expenses.',
                style: TextStyle(
                  color: Colors.grey.shade400,
                  fontSize: 11,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 28),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Material/Paint Deliveries:', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                  Text(currencyFormat.format(totalAllExpenses), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 12),
              const Divider(color: Colors.white10),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Employee Wages:', style: TextStyle(color: Colors.grey.shade400, fontSize: 12)),
                  Text(currencyFormat.format(monthlyPayroll), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                ],
              ),
              const SizedBox(height: 28),
              const Divider(color: Colors.white10),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'COMBINED OUTLAY',
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 9,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        currencyFormat.format(totalAllExpenses + monthlyPayroll),
                        style: GoogleFonts.outfit(
                          color: Colors.amber.shade300,
                          fontWeight: FontWeight.w900,
                          fontSize: 24,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.white.withOpacity(0.1)),
                    ),
                    child: const Text(
                      'AUDIT READY',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    ];

    return isDesktop 
        ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: children) 
        : Column(children: children);
  }

  Widget _buildDynamicListsGrid(ThemeData theme, NumberFormat currencyFormat) {
    final isDesktop = MediaQuery.of(context).size.width >= 1024;
    final List<dynamic> recentAttendance = _dashboardData['recentAttendance'] ?? [];
    final List<dynamic> recentPayments = _dashboardData['recentPayments'] ?? [];

    final List<Widget> children = [
      // RECENT ATTENDANCE LIST
      Expanded(
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.green.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.history, color: Colors.green, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'RECENT ATTENDANCE',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.background,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'LATEST ENTRIES',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              if (recentAttendance.isEmpty)
                const SizedBox(
                  height: 200,
                  child: Center(child: Text('No attendance records found.')),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: recentAttendance.length > 5 ? 5 : recentAttendance.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final attendance = recentAttendance[index];
                    final status = attendance['status'] ?? 'Present';
                    final String labourName = attendance['labour'] != null 
                        ? (attendance['labour']['name'] ?? '') 
                        : (attendance['labourName'] ?? 'Deleted Labour');
                        
                    Color statusColor = Colors.green;
                    if (status == 'Absent') statusColor = Colors.red;
                    if (status == 'Half Day') statusColor = Colors.orange;

                    String formattedDate = '';
                    if (attendance['date'] != null) {
                      final parsedDate = DateTime.tryParse(attendance['date']);
                      if (parsedDate != null) {
                        formattedDate = DateFormat('d MMM yyyy').format(parsedDate);
                      }
                    }

                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.background.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: theme.dividerColor.withOpacity(0.04)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: statusColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    labourName,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    formattedDate,
                                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: statusColor.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              status,
                              style: GoogleFonts.outfit(
                                color: statusColor,
                                fontWeight: FontWeight.bold,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
      if (!isDesktop) const SizedBox(height: 24),
      // RECENT PAYMENTS LIST
      Expanded(
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: theme.dividerColor.withOpacity(0.08)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: Colors.amber.withOpacity(0.08),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: const Icon(Icons.payments_outlined, color: Colors.amber, size: 18),
                      ),
                      const SizedBox(width: 12),
                      Text(
                        'RECENT PAYMENTS',
                        style: GoogleFonts.outfit(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 0.5,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.background,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      'SALARY RECORDS',
                      style: GoogleFonts.outfit(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              if (recentPayments.isEmpty)
                const SizedBox(
                  height: 200,
                  child: Center(child: Text('No payment records found.')),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: recentPayments.length > 5 ? 5 : recentPayments.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final payment = recentPayments[index];
                    final status = payment['paymentStatus'] ?? 'Paid';
                    final double totalSalary = (payment['totalSalary'] ?? 0.0).toDouble();
                    final String labourName = payment['labour'] != null 
                        ? (payment['labour']['name'] ?? '') 
                        : (payment['labourName'] ?? 'Deleted Labour');

                    Color statusColor = Colors.green;
                    if (status != 'Paid') statusColor = Colors.orange;

                    return Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: theme.colorScheme.background.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: theme.dividerColor.withOpacity(0.04)),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 8,
                                height: 8,
                                decoration: BoxDecoration(
                                  color: statusColor,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 14),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    labourName,
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Salary for ${payment['month'] ?? ''} ${payment['year'] ?? ''}',
                                    style: TextStyle(color: Colors.grey.shade400, fontSize: 11),
                                  ),
                                ],
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text(
                                currencyFormat.format(totalSalary),
                                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: statusColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  status,
                                  style: GoogleFonts.outfit(
                                    color: statusColor,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 9,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    ];

    return isDesktop 
        ? Row(crossAxisAlignment: CrossAxisAlignment.start, children: children) 
        : Column(children: children);
  }
}
