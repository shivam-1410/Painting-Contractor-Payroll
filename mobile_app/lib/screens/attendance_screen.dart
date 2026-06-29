import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/site_provider.dart';
import '../providers/labour_provider.dart';
import '../providers/attendance_provider.dart';
import '../models/site.dart';
import '../models/labour.dart';
import '../models/attendance.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  DateTime _selectedDate = DateTime.now();
  Site? _selectedSite;
  final Map<String, Map<String, dynamic>> _tempRecords = {};

  @override
  void initState() {
    super.initState();
    Future.microtask(() async {
      final siteProv = Provider.of<SiteProvider>(context, listen: false);
      final labourProv = Provider.of<LabourProvider>(context, listen: false);
      await Future.wait([siteProv.fetchSites(), labourProv.fetchLabours()]);
      if (siteProv.activeSites.isNotEmpty) {
        setState(() {
          _selectedSite = siteProv.activeSites.first;
        });
        _loadAttendance();
      }
    });
  }

  void _loadAttendance() {
    if (_selectedSite == null) return;
    Provider.of<AttendanceProvider>(context, listen: false)
        .fetchAttendance(_selectedDate, _selectedSite!.id)
        .then((_) {
      _initTempRecords();
    });
  }

  void _initTempRecords() {
    final attendanceProv = Provider.of<AttendanceProvider>(context, listen: false);
    final labourProv = Provider.of<LabourProvider>(context, listen: false);
    
    _tempRecords.clear();

    // Loop through all labourers and initialize their temp records
    for (var labour in labourProv.labours) {
      // Find existing attendance for this labourer
      final existing = attendanceProv.attendanceList.firstWhere(
        (a) => a.labourId == labour.id,
        orElse: () => Attendance(
          id: '',
          labour: labour.id,
          site: _selectedSite!.id,
          status: 'Present',
          date: _selectedDate,
          overtime: 0,
          teaExpense: 0,
          bhada: 0,
          advance: 0,
        ),
      );

      _tempRecords[labour.id] = {
        'status': existing.status,
        'overtime': existing.overtime,
        'teaExpense': existing.teaExpense,
        'bhada': existing.bhada,
        'advance': existing.advance,
      };
    }
    setState(() {});
  }

  void _saveAll() async {
    if (_selectedSite == null) return;

    final recordsToSave = <Map<String, dynamic>>[];
    _tempRecords.forEach((labourId, data) {
      recordsToSave.add({
        'labour': labourId,
        'site': _selectedSite!.id,
        'date': DateFormat('yyyy-MM-dd').format(_selectedDate),
        'status': data['status'],
        'overtime': data['overtime'],
        'teaExpense': data['teaExpense'],
        'bhada': data['bhada'],
        'advance': data['advance'],
      });
    });

    final success = await Provider.of<AttendanceProvider>(context, listen: false)
        .saveAttendance(recordsToSave);

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success ? 'Attendance saved successfully!' : 'Failed to save attendance'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final siteProvider = Provider.of<SiteProvider>(context);
    final labourProvider = Provider.of<LabourProvider>(context);
    final attendanceProvider = Provider.of<AttendanceProvider>(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        title: Text(
          'ATTENDANCE',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
      ),
      body: Column(
        children: [
          // FILTERS HEADER
          _buildFilterHeader(theme, siteProvider),

          // LABOUR ATTENDANCE LIST
          Expanded(
            child: attendanceProvider.isLoading || labourProvider.isLoading
                ? const Center(child: CircularProgressIndicator())
                : _selectedSite == null
                    ? const Center(child: Text('Please select a site'))
                    : ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: labourProvider.labours.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 16),
                        itemBuilder: (context, index) {
                          final labour = labourProvider.labours[index];
                          return _buildAttendanceCard(theme, labour);
                        },
                      ),
          ),
        ],
      ),
      bottomNavigationBar: _selectedSite != null
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
                  onPressed: _saveAll,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: theme.colorScheme.primary,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                  ),
                  child: Text(
                    'Save Daily Attendance',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 15),
                  ),
                ),
              ),
            )
          : null,
    );
  }

  Widget _buildFilterHeader(ThemeData theme, SiteProvider siteProvider) {
    return Container(
      color: theme.colorScheme.surface,
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: DropdownButtonFormField<Site>(
                  value: _selectedSite,
                  decoration: const InputDecoration(
                    labelText: 'Site',
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                  items: siteProvider.activeSites.map((site) {
                    return DropdownMenuItem<Site>(
                      value: site,
                      child: Text(site.name, style: const TextStyle(fontSize: 13)),
                    );
                  }).toList(),
                  onChanged: (site) {
                    setState(() {
                      _selectedSite = site;
                    });
                    _loadAttendance();
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () async {
                    final selected = await showDatePicker(
                      context: context,
                      initialDate: _selectedDate,
                      firstDate: DateTime(2000),
                      lastDate: DateTime(2100),
                    );
                    if (selected != null) {
                      setState(() {
                        _selectedDate = selected;
                      });
                      _loadAttendance();
                    }
                  },
                  icon: const Icon(Icons.calendar_today, size: 16),
                  label: Text(
                    DateFormat('yyyy-MM-dd').format(_selectedDate),
                    style: const TextStyle(fontSize: 12),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAttendanceCard(ThemeData theme, Labour labour) {
    final data = _tempRecords[labour.id] ?? {
      'status': 'Present',
      'overtime': 0.0,
      'teaExpense': 0.0,
      'bhada': 0.0,
      'advance': 0.0,
    };

    final status = data['status'] as String;

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
                labour.name,
                style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14),
              ),
              _buildStatusSelector(theme, labour.id, status),
            ],
          ),
          const SizedBox(height: 16),
          // OVERTIME & TEA & ADVANCE INPUTS
          Row(
            children: [
              Expanded(
                child: _buildInlineInput(
                  label: 'Overtime (Hrs)',
                  initialValue: data['overtime'].toString(),
                  onChanged: (val) {
                    _tempRecords[labour.id]!['overtime'] = double.tryParse(val) ?? 0.0;
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInlineInput(
                  label: 'Tea (₹)',
                  initialValue: data['teaExpense'].toString(),
                  onChanged: (val) {
                    _tempRecords[labour.id]!['teaExpense'] = double.tryParse(val) ?? 0.0;
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInlineInput(
                  label: 'Bhada (₹)',
                  initialValue: data['bhada'].toString(),
                  onChanged: (val) {
                    _tempRecords[labour.id]!['bhada'] = double.tryParse(val) ?? 0.0;
                  },
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: _buildInlineInput(
                  label: 'Advance (₹)',
                  initialValue: data['advance'].toString(),
                  onChanged: (val) {
                    _tempRecords[labour.id]!['advance'] = double.tryParse(val) ?? 0.0;
                  },
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatusSelector(ThemeData theme, String labourId, String currentStatus) {
    return Row(
      children: ['Present', 'Absent', 'Half Day'].map((status) {
        final isSelected = currentStatus == status;
        Color color = Colors.green;
        if (status == 'Absent') color = Colors.red;
        if (status == 'Half Day') color = Colors.orange;

        return GestureDetector(
          onTap: () {
            setState(() {
              _tempRecords[labourId]!['status'] = status;
            });
          },
          child: Container(
            margin: const EdgeInsets.only(left: 4),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            decoration: BoxDecoration(
              color: isSelected ? color.withOpacity(0.15) : Colors.transparent,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: isSelected ? color : Colors.grey.shade300,
                width: 1,
              ),
            ),
            child: Text(
              status,
              style: GoogleFonts.outfit(
                color: isSelected ? color : Colors.grey.shade500,
                fontWeight: FontWeight.bold,
                fontSize: 11,
              ),
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _buildInlineInput({
    required String label,
    required String initialValue,
    required ValueChanged<String> onChanged,
  }) {
    return TextFormField(
      initialValue: initialValue == '0.0' || initialValue == '0' ? '' : initialValue,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: const TextStyle(fontSize: 10),
        border: const OutlineInputBorder(),
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
      ),
      keyboardType: const TextInputType.numberWithOptions(decimal: true),
      style: const TextStyle(fontSize: 12),
      onChanged: onChanged,
    );
  }
}
