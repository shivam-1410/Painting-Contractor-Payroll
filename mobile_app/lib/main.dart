import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';

// Providers
import 'providers/labour_provider.dart';
import 'providers/site_provider.dart';
import 'providers/attendance_provider.dart';
import 'providers/payroll_provider.dart';
import 'providers/expense_provider.dart';

// Screens
import 'screens/dashboard_screen.dart';
import 'screens/labours_screen.dart';
import 'screens/attendance_screen.dart';
import 'screens/salary_screen.dart';
import 'screens/sites_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LabourProvider()),
        ChangeNotifierProvider(create: (_) => SiteProvider()),
        ChangeNotifierProvider(create: (_) => AttendanceProvider()),
        ChangeNotifierProvider(create: (_) => PayrollProvider()),
        ChangeNotifierProvider(create: (_) => ExpenseProvider()),
      ],
      child: MaterialApp(
        title: 'VC Dreams ERP',
        debugShowCheckedModeBanner: false,
        
        // Premium Light Theme
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
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          cardTheme: CardTheme(
            elevation: 2,
            shadowColor: const Color(0xFF0F172A).withOpacity(0.05),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          ),
        ),

        // Premium Dark Theme
        darkTheme: ThemeData(
          useMaterial3: true,
          brightness: Brightness.dark,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF6366F1), // Indigo-500
            brightness: Brightness.dark,
            primary: const Color(0xFF6366F1),
            secondary: const Color(0xFF8B5CF6), // Violet-500
            background: const Color(0xFF020617), // Slate-950
            surface: const Color(0xFF0F172A), // Slate-900
          ),
          textTheme: GoogleFonts.outfitTextTheme(ThemeData.dark().textTheme),
          appBarTheme: AppBarTheme(
            backgroundColor: const Color(0xFF0F172A),
            elevation: 0,
            iconTheme: const IconThemeData(color: Colors.white),
            titleTextStyle: GoogleFonts.outfit(
              color: Colors.white,
              fontSize: 20,
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
        themeMode: ThemeMode.system, // Respect system light/dark mode

        home: const MainNavigationShell(),
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

  final List<Widget> _screens = [
    const DashboardScreen(),
    const LaboursScreen(),
    const AttendanceScreen(),
    const SalaryScreen(),
    const SitesScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: Row(
        children: [
          // Navigation Rail for tablets/large screens
          if (MediaQuery.of(context).size.width >= 600)
            NavigationRail(
              selectedIndex: _selectedIndex,
              onDestinationSelected: (index) {
                setState(() {
                  _selectedIndex = index;
                });
              },
              labelType: NavigationRailLabelType.all,
              backgroundColor: theme.colorScheme.surface,
              selectedIconTheme: IconThemeData(color: theme.colorScheme.primary),
              unselectedIconTheme: const IconThemeData(color: Colors.grey),
              selectedLabelTextStyle: GoogleFonts.outfit(
                color: theme.colorScheme.primary,
                fontWeight: FontWeight.bold,
              ),
              destinations: const [
                NavigationRailDestination(
                  icon: Icon(Icons.dashboard_outlined),
                  selectedIcon: Icon(Icons.dashboard),
                  label: Text('Dashboard'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.people_outline),
                  selectedIcon: Icon(Icons.people),
                  label: Text('Labours'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.assignment_turned_in_outlined),
                  selectedIcon: Icon(Icons.assignment_turned_in),
                  label: Text('Attendance'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.monetization_on_outlined),
                  selectedIcon: Icon(Icons.monetization_on),
                  label: Text('Salary'),
                ),
                NavigationRailDestination(
                  icon: Icon(Icons.business_outlined),
                  selectedIcon: Icon(Icons.business),
                  label: Text('Sites'),
                ),
              ],
            ),
            
          // Main Screen Content
          Expanded(
            child: _screens[_selectedIndex],
          ),
        ],
      ),
      
      // Bottom Navigation Bar for mobile portrait screens
      bottomNavigationBar: MediaQuery.of(context).size.width < 600
          ? Container(
              decoration: BoxDecoration(
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 20,
                    offset: const Offset(0, -5),
                  ),
                ],
              ),
              child: NavigationBar(
                selectedIndex: _selectedIndex,
                onDestinationSelected: (index) {
                  setState(() {
                    _selectedIndex = index;
                  });
                },
                backgroundColor: theme.colorScheme.surface,
                indicatorColor: theme.colorScheme.primary.withOpacity(0.1),
                destinations: const [
                  NavigationDestination(
                    icon: Icon(Icons.dashboard_outlined),
                    selectedIcon: Icon(Icons.dashboard),
                    label: 'Dashboard',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.people_outline),
                    selectedIcon: Icon(Icons.people),
                    label: 'Labours',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.assignment_turned_in_outlined),
                    selectedIcon: Icon(Icons.assignment_turned_in),
                    label: 'Attendance',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.monetization_on_outlined),
                    selectedIcon: Icon(Icons.monetization_on),
                    label: 'Salary',
                  ),
                  NavigationDestination(
                    icon: Icon(Icons.business_outlined),
                    selectedIcon: Icon(Icons.business),
                    label: 'Sites',
                  ),
                ],
              ),
            )
          : null,
    );
  }
}
