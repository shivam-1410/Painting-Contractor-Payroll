import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

// Providers
import 'providers/labour_provider.dart';
import 'providers/site_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/payroll_provider.dart';
import 'providers/expense_provider.dart';
import 'providers/receipt_provider.dart';
import 'providers/theme_provider.dart';

// Screens
import 'screens/dashboard_screen.dart';
import 'screens/labours_screen.dart';
import 'screens/attendance_screen.dart';
import 'screens/salary_screen.dart';
import 'screens/sites_screen.dart';
import 'screens/expenses_screen.dart';
import 'screens/receipts_screen.dart';
import 'screens/payroll_screen.dart';
import 'screens/reports_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LabourProvider()),
        ChangeNotifierProvider(create: (_) => SiteProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => PayrollProvider()),
        ChangeNotifierProvider(create: (_) => ExpenseProvider()),
        ChangeNotifierProvider(create: (_) => ReceiptProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, child) {
          return MaterialApp(
            title: 'VC Dreams ERP',
            debugShowCheckedModeBanner: false,
        
        // Premium Light Theme matching website
        theme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.light,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF4F46E5), // Indigo-600
            primary: const Color(0xFF4F46E5),
            secondary: const Color(0xFF7C3AED), // Violet-600
            background: const Color(0xFFF8FAFC), // Slate-50
            surface: Colors.white,
          ),
          textTheme: GoogleFonts.outfitTextTheme(ThemeData.light().textTheme),
          appBarTheme: AppBarTheme(
            backgroundColor: Colors.white,
            elevation: 0,
            iconTheme: const IconThemeData(color: Color(0xFF0F172A)),
            titleTextStyle: GoogleFonts.outfit(
              color: const Color(0xFF0F172A),
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          cardTheme: CardTheme(
            elevation: 2,
            shadowColor: const Color(0xFF0F172A).withOpacity(0.05),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          ),
        ),

        // Premium Dark Theme matching website
        darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6366F1), // Indigo-500
            brightness: Brightness.dark,
            primary: const Color(0xFF6366F1),
            secondary: const Color(0xFF8B5CF6), // Violet-500
            background: const Color(0xFF020617), // Slate-955
            surface: const Color(0xFF0F172A), // Slate-900
          ),
          textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
          appBarTheme: AppBarTheme(
            backgroundColor: const Color(0xFF0F172A),
            elevation: 0,
            iconTheme: const IconThemeData(color: Colors.white),
            titleTextStyle: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
          cardTheme: CardTheme(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20),
              side: BorderSide(color: const Color(0xFF1E293B).withOpacity(0.4)),
            ),
          ),
        ),
        themeMode: themeProvider.themeMode,

        home: const MainNavigationShell(),
      );
    },
  ),
);
}
}

class MainNavigationShell extends StatefulWidget {
  const MainNavigationShell({super.key});

  @override
  State<MainNavigationShell> createState() => _MainNavigationShellState();
}

class _MainNavigationShellState extends State<MainNavigationShell> {
  int _selectedIndex = 0;
  bool _isSidebarExpanded = false;

  // 10 Screens matching website navigation
  final List<Widget> _screens = [
    const DashboardScreen(),
    const LaboursScreen(),
    const AttendanceScreen(),
    const SalaryScreen(),
    const SitesScreen(),
    const ExpensesScreen(), // Site Expenses
    const ReceiptsScreen(), // Salary Receipts
    const PayrollHistoryScreen(), // Payroll
    const ReportsScreen(key: ValueKey('attendance_report'), isAttendanceReport: true), // Attendance Reports
    const ReportsScreen(key: ValueKey('payment_report'), isAttendanceReport: false), // Payment Reports
  ];

  // Sidebar navigation items with icons and labels
  final List<Map<String, dynamic>> _navItems = [
    {'icon': Icons.dashboard_outlined, 'activeIcon': Icons.dashboard, 'label': 'Dashboard'},
    {'icon': Icons.people_outline, 'activeIcon': Icons.people, 'label': 'Labours'},
    {'icon': Icons.assignment_turned_in_outlined, 'activeIcon': Icons.assignment_turned_in, 'label': 'Attendance'},
    {'icon': Icons.monetization_on_outlined, 'activeIcon': Icons.monetization_on, 'label': 'Salary'},
    {'icon': Icons.business_outlined, 'activeIcon': Icons.business, 'label': 'Sites'},
    {'icon': Icons.receipt_long_outlined, 'activeIcon': Icons.receipt_long, 'label': 'Site Expenses'},
    {'icon': Icons.file_present_outlined, 'activeIcon': Icons.file_present, 'label': 'Receipts'},
    {'icon': Icons.history_toggle_off_outlined, 'activeIcon': Icons.history, 'label': 'Payroll'},
    {'icon': Icons.analytics_outlined, 'activeIcon': Icons.analytics, 'label': 'Attendance Reports'},
    {'icon': Icons.bar_chart_outlined, 'activeIcon': Icons.bar_chart, 'label': 'Payment Reports'},
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isMobile = MediaQuery.of(context).size.width < 1024;

    return Scaffold(
      appBar: isMobile
          ? AppBar(
              title: Text(
                _navItems[_selectedIndex]['label'].toUpperCase(),
                style: GoogleFonts.outfit(fontWeight: FontWeight.w900, letterSpacing: 1),
              ),
              centerTitle: false,
              actions: [
                _buildThemeSelector(context),
                const SizedBox(width: 8),
              ],
            )
          : null,
      drawer: isMobile ? _buildDrawer(theme) : null,
      body: Row(
        children: [
          if (!isMobile) _buildWebSidebar(theme),
          Expanded(
            child: Column(
              children: [
                if (!isMobile) _buildWebHeader(theme),
                Expanded(
                  child: ClipRect(
                    child: _screens[_selectedIndex],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // Web header with title and info
  Widget _buildWebHeader(ThemeData theme) {
    return Container(
      height: 64,
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        border: Border(bottom: BorderSide(color: theme.dividerColor.withOpacity(0.08))),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            'VC Dreams Contractor ERP'.toUpperCase(),
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              color: theme.colorScheme.primary,
              letterSpacing: 1,
            ),
          ),
          Row(
            children: [
              Text(
                _navItems[_selectedIndex]['label'],
                style: GoogleFonts.outfit(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: theme.colorScheme.onBackground.withOpacity(0.8),
                ),
              ),
              const SizedBox(width: 24),
              _buildThemeSelector(context),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildThemeSelector(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);
    IconData currentIcon;
    switch (themeProvider.themeMode) {
      case ThemeMode.light:
        currentIcon = Icons.light_mode_outlined;
        break;
      case ThemeMode.dark:
        currentIcon = Icons.dark_mode_outlined;
        break;
      case ThemeMode.system:
        currentIcon = Icons.settings_suggest_outlined;
        break;
    }

    return PopupMenuButton<ThemeMode>(
      icon: Icon(currentIcon, size: 20),
      tooltip: 'Select Theme Mode',
      onSelected: (ThemeMode mode) {
        themeProvider.setThemeMode(mode);
      },
      itemBuilder: (BuildContext context) => <PopupMenuEntry<ThemeMode>>[
        PopupMenuItem<ThemeMode>(
          value: ThemeMode.light,
          child: Row(
            children: [
              const Icon(Icons.light_mode_outlined, size: 18),
              const SizedBox(width: 10),
              Text('Light Mode', style: GoogleFonts.outfit(fontSize: 13)),
            ],
          ),
        ),
        PopupMenuItem<ThemeMode>(
          value: ThemeMode.dark,
          child: Row(
            children: [
              const Icon(Icons.dark_mode_outlined, size: 18),
              const SizedBox(width: 10),
              Text('Dark Mode', style: GoogleFonts.outfit(fontSize: 13)),
            ],
          ),
        ),
        PopupMenuItem<ThemeMode>(
          value: ThemeMode.system,
          child: Row(
            children: [
              const Icon(Icons.settings_suggest_outlined, size: 18),
              const SizedBox(width: 10),
              Text('System Mode', style: GoogleFonts.outfit(fontSize: 13)),
            ],
          ),
        ),
      ],
    );
  }

  // Sliding Drawer for Mobile Screens (< 1024px)
  Widget _buildDrawer(ThemeData theme) {
    return Drawer(
      child: Container(
        color: theme.colorScheme.surface,
        child: Column(
          children: [
            _buildDrawerHeader(theme),
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
                itemCount: _navItems.length,
                itemBuilder: (context, index) {
                  final item = _navItems[index];
                  final isActive = _selectedIndex == index;
                  return _buildDrawerItem(theme, item, index, isActive, isDrawer: true);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDrawerHeader(ThemeData theme) {
    return DrawerHeader(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: theme.dividerColor.withOpacity(0.08))),
      ),
      child: Row(
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(Icons.palette, color: theme.colorScheme.primary, size: 24),
          ),
          const SizedBox(width: 12),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'VC DREAMS',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  letterSpacing: 1,
                  color: theme.colorScheme.onSurface,
                ),
              ),
              Text(
                'Contractor ERP',
                style: TextStyle(
                  fontSize: 11,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildWebSidebar(ThemeData theme) {
    final double width = _isSidebarExpanded ? 260.0 : 68.0;

    return MouseRegion(
      onEnter: (_) => setState(() => _isSidebarExpanded = true),
      onExit: (_) => setState(() => _isSidebarExpanded = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.fastOutSlowIn,
        width: width,
        height: double.infinity,
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          border: Border(right: BorderSide(color: theme.dividerColor.withOpacity(0.08))),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.02),
              blurRadius: 10,
              offset: const Offset(4, 0),
            ),
          ],
        ),
        child: ClipRect(
          child: Column(
            children: [
              // LOGO REGION
              _buildSidebarLogo(theme),
              
              // NAVIGATION LINKS
              Expanded(
                child: ListView.builder(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                  itemCount: _navItems.length,
                  itemBuilder: (context, index) {
                    final item = _navItems[index];
                    final isActive = _selectedIndex == index;
                    return _buildDrawerItem(theme, item, index, isActive, isDrawer: false);
                  },
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSidebarLogo(ThemeData theme) {
    return Container(
      height: 68,
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: theme.dividerColor.withOpacity(0.08))),
      ),
      alignment: Alignment.centerLeft,
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(Icons.palette, color: theme.colorScheme.primary, size: 20),
          ),
          if (_isSidebarExpanded) ...[
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'VC DREAMS',
                style: GoogleFonts.outfit(
                  fontWeight: FontWeight.w900,
                  fontSize: 14,
                  letterSpacing: 1,
                  color: theme.colorScheme.onSurface,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ],
      ),
    );
  }

  // Sidebar / Drawer Navigation Item
  Widget _buildDrawerItem(
    ThemeData theme,
    Map<String, dynamic> item,
    int index,
    bool isActive, {
    required bool isDrawer,
  }) {
    final showText = isDrawer || _isSidebarExpanded;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: InkWell(
        onTap: () {
          setState(() {
            _selectedIndex = index;
          });
          if (isDrawer) {
            Navigator.pop(context); // Close drawer on mobile
          }
        },
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          height: 44,
          decoration: BoxDecoration(
            color: isActive ? theme.colorScheme.primary.withOpacity(0.1) : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            border: isActive
                ? Border(left: BorderSide(color: theme.colorScheme.primary, width: 4))
                : null,
          ),
          child: Row(
            children: [
              SizedBox(
                width: 36,
                height: 44,
                child: Icon(
                  isActive ? item['activeIcon'] : item['icon'],
                  color: isActive ? theme.colorScheme.primary : Colors.grey.shade500,
                  size: 20,
                ),
              ),
              if (showText) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    item['label'].toUpperCase(),
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.5,
                      color: isActive ? theme.colorScheme.primary : theme.colorScheme.onSurface.withOpacity(0.6),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
