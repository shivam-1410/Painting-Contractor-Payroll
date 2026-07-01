import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../providers/site_provider.dart';
import '../providers/expense_provider.dart';
import '../providers/labour_provider.dart';
import '../models/site.dart';
import '../models/challan.dart';
import '../models/labour.dart';
import '../services/api_service.dart';
import 'expenses_screen.dart';

class SitesScreen extends StatefulWidget {
  const SitesScreen({super.key});

  @override
  State<SitesScreen> createState() => _SitesScreenState();
}

class _SitesScreenState extends State<SitesScreen> {
  List<Challan> _allChallans = [];
  bool _isLoadingChallans = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      Provider.of<SiteProvider>(context, listen: false).fetchSites();
      _fetchChallans();
    });
  }

  Future<void> _fetchChallans() async {
    setState(() => _isLoadingChallans = true);
    try {
      final res = await ApiService.get('/challans');
      final List<dynamic> data = jsonDecode(res.body);
      if (mounted) {
        setState(() {
          _allChallans = data.map((json) => Challan.fromJson(json)).toList();
        });
      }
    } catch (e) {
      debugPrint('Error fetching challans: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoadingChallans = false);
      }
    }
  }

  void _showSiteForm({Site? site}) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => SiteFormDialog(
        site: site,
        onSave: () {
          Provider.of<SiteProvider>(context, listen: false).fetchSites();
        },
      ),
    );
  }

  double _getSiteTotalExpenses(Site site) {
    final targetName = site.name.toLowerCase().trim();
    final targetId = site.id.toLowerCase();
    
    double total = 0.0;
    for (var c in _allChallans) {
      final siteMatch = c.siteId?.toLowerCase() == targetId || c.siteName?.toLowerCase().trim() == targetName;
      if (siteMatch) {
        total += c.totalAmount;
      }
    }
    return total;
  }

  void _viewSiteDetails(Site site) {
    showDialog(
      context: context,
      builder: (_) => SiteDetailsDialog(site: site, allChallans: _allChallans),
    );
  }

  void _confirmDeleteSite(Site site) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete Site?', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
        content: Text('Are you sure you want to remove the site "${site.name}"? This action cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);
              final success = await Provider.of<SiteProvider>(context, listen: false).deleteSite(site.id);
              if (mounted) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(success ? 'Site deleted successfully!' : 'Failed to delete site'),
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
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      body: RefreshIndicator(
        onRefresh: () async {
          await Provider.of<SiteProvider>(context, listen: false).fetchSites();
          await _fetchChallans();
        },
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
                          'Site Management',
                          style: GoogleFonts.outfit(fontSize: 28, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          'Manage, monitor, and audit construction and painting project sites.',
                          style: TextStyle(color: Colors.grey.shade500, fontSize: 13, fontWeight: FontWeight.w500),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 16),
                  ElevatedButton.icon(
                    onPressed: () => _showSiteForm(),
                    icon: const Icon(Icons.add, size: 16, color: Colors.white),
                    label: Text(
                      'Add New Site',
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

              // SITES GRID / LIST
              if (siteProvider.isLoading || _isLoadingChallans)
                const Padding(
                  padding: EdgeInsets.all(48.0),
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (siteProvider.sites.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(48.0),
                  child: Center(
                    child: Column(
                      children: [
                        Icon(Icons.business_outlined, size: 48, color: Colors.grey.shade400),
                        const SizedBox(height: 16),
                        Text('No sites found', style: GoogleFonts.outfit(fontWeight: FontWeight.bold)),
                        const SizedBox(height: 8),
                        Text('Add a new site to get started.', style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                      ],
                    ),
                  ),
                )
              else
                LayoutBuilder(
                  builder: (context, constraints) {
                    final double width = constraints.maxWidth;
                    final int crossAxisCount = width > 1100 ? 3 : (width > 700 ? 2 : 1);
                    return GridView.builder(
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: crossAxisCount,
                        crossAxisSpacing: 24,
                        mainAxisSpacing: 24,
                        mainAxisExtent: 260,
                      ),
                      itemCount: siteProvider.sites.length,
                      itemBuilder: (context, index) {
                        final site = siteProvider.sites[index];
                        final double siteExpenses = _getSiteTotalExpenses(site);
                        return _buildSiteCard(theme, site, siteExpenses, currencyFormat);
                      },
                    );
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSiteCard(ThemeData theme, Site site, double totalExpenses, NumberFormat currencyFormat) {
    return Container(
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(30),
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
        borderRadius: BorderRadius.circular(30),
        child: Stack(
          children: [
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              child: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(colors: [Colors.indigo, Colors.blue]),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              site.name,
                              style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '📍 ${site.location}',
                              style: TextStyle(color: Colors.grey.shade400, fontSize: 11, fontWeight: FontWeight.w500),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: site.status == 'Active' ? Colors.green.withOpacity(0.1) : Colors.grey.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          site.status,
                          style: GoogleFonts.outfit(
                            color: site.status == 'Active' ? Colors.green : Colors.grey,
                            fontWeight: FontWeight.bold,
                            fontSize: 10,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Spacer(),
                  Text(
                    'Contractor: ${site.contractorName.isEmpty ? 'N/A' : site.contractorName}',
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 11, fontWeight: FontWeight.w500),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Progress', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                      Text('${site.progress}%', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 11)),
                    ],
                  ),
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: LinearProgressIndicator(
                      value: site.progress / 100,
                      backgroundColor: theme.colorScheme.primary.withOpacity(0.08),
                      valueColor: AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.background,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Total Expenses:', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                        Text(
                          currencyFormat.format(totalExpenses),
                          style: GoogleFonts.outfit(color: Colors.red.shade400, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: () => _viewSiteDetails(site),
                          style: OutlinedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: const Text('Details', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.edit_outlined, color: Colors.indigo, size: 18),
                        onPressed: () => _showSiteForm(site: site),
                        tooltip: 'Edit Site',
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.red, size: 18),
                        onPressed: () => _confirmDeleteSite(site),
                        tooltip: 'Delete Site',
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ADD / EDIT SITE DIALOG
class SiteFormDialog extends StatefulWidget {
  final Site? site;
  final VoidCallback onSave;
  const SiteFormDialog({super.key, this.site, required this.onSave});

  @override
  State<SiteFormDialog> createState() => _SiteFormDialogState();
}

class _SiteFormDialogState extends State<SiteFormDialog> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _locationController;
  late TextEditingController _contractorController;
  late double _progress;
  late String _status;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.site?.name ?? '');
    _locationController = TextEditingController(text: widget.site?.location ?? '');
    _contractorController = TextEditingController(text: widget.site?.contractorName ?? '');
    _progress = (widget.site?.progress ?? 0).toDouble();
    _status = widget.site?.status ?? 'Active';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _locationController.dispose();
    _contractorController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    final name = _nameController.text.trim();
    final location = _locationController.text.trim();
    final contractor = _contractorController.text.trim();
    final provider = Provider.of<SiteProvider>(context, listen: false);

    bool success;
    if (widget.site != null) {
      success = await provider.updateSite(widget.site!.id, name, location, _status, _progress.toInt(), contractor);
    } else {
      success = await provider.addSite(name, location, _status, _progress.toInt(), contractor);
    }

    if (success && mounted) {
      widget.onSave();
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      child: Container(
        width: 450,
        padding: const EdgeInsets.all(28),
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      widget.site != null ? 'Edit Site' : 'Add New Site',
                      style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ],
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Site Name', border: OutlineInputBorder()),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _locationController,
                  decoration: const InputDecoration(labelText: 'Location', border: OutlineInputBorder()),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  controller: _contractorController,
                  decoration: const InputDecoration(labelText: 'Contractor Name', border: OutlineInputBorder()),
                  validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Status:', style: TextStyle(fontWeight: FontWeight.bold)),
                    DropdownButton<String>(
                      value: _status,
                      items: ['Active', 'Completed', 'Hold'].map((status) {
                        return DropdownMenuItem<String>(
                          value: status,
                          child: Text(status),
                        );
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _status = val);
                      },
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text('Progress:', style: TextStyle(fontWeight: FontWeight.bold)),
                    Text('${_progress.toInt()}%', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, color: theme.colorScheme.primary)),
                  ],
                ),
                Slider(
                  value: _progress,
                  min: 0,
                  max: 100,
                  divisions: 20,
                  onChanged: (val) => setState(() => _progress = val),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    OutlinedButton(
                      onPressed: () => Navigator.pop(context),
                      style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                      child: const Text('Cancel'),
                    ),
                    const SizedBox(width: 12),
                    ElevatedButton(
                      onPressed: _submit,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: theme.colorScheme.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: const Text('Save Site'),
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

// SITE DETAILS DIALOG
class SiteDetailsDialog extends StatefulWidget {
  final Site site;
  final List<Challan> allChallans;
  const SiteDetailsDialog({super.key, required this.site, required this.allChallans});

  @override
  State<SiteDetailsDialog> createState() => _SiteDetailsDialogState();
}

class _SiteDetailsDialogState extends State<SiteDetailsDialog> {
  List<Labour> _siteLabours = [];
  List<Challan> _siteChallans = [];
  int _todayPresent = 0;
  bool _isLoadingDetails = true;

  @override
  void initState() {
    super.initState();
    _loadSiteDetails();
  }

  Future<void> _loadSiteDetails() async {
    setState(() => _isLoadingDetails = true);
    try {
      // 1. Fetch all labours and attendance
      final responses = await Future.wait([
        ApiService.get('/labours'),
        ApiService.get('/attendance'),
      ]);

      final List<dynamic> allLaboursData = jsonDecode(responses[0].body);
      final List<dynamic> allAttendanceData = jsonDecode(responses[1].body);

      // 2. Filter attendance for this site
      final siteAttendance = allAttendanceData.where((att) {
        final attSiteId = att['site'] is Map ? att['site']['_id'] : att['site'];
        return attSiteId == widget.site.id;
      }).toList();

      // 3. Find unique labour IDs who have worked at this site
      final uniqueLabourIds = siteAttendance.map((att) {
        return att['labour'] is Map ? att['labour']['_id'] : att['labour'];
      }).where((id) => id != null).toSet();

      // 4. Filter labours
      final List<Labour> filteredLabours = [];
      for (var json in allLaboursData) {
        if (uniqueLabourIds.contains(json['_id'])) {
          // Find earliest attendance date at this site
          final workerAtts = siteAttendance.where((att) {
            final attLabourId = att['labour'] is Map ? att['labour']['_id'] : att['labour'];
            return attLabourId == json['_id'];
          }).toList();
          
          DateTime? earliestDate;
          if (workerAtts.isNotEmpty) {
            workerAtts.sort((a, b) => DateTime.parse(a['date']).compareTo(DateTime.parse(b['date'])));
            earliestDate = DateTime.parse(workerAtts.first['date']);
          }

          // Build site assignment history
          final List<Map<String, dynamic>> history = [];
          final workerAllAtts = allAttendanceData.where((att) {
            final attLabourId = att['labour'] is Map ? att['labour']['_id'] : att['labour'];
            return attLabourId == json['_id'];
          }).toList();
          
          workerAllAtts.sort((a, b) => DateTime.parse(a['date']).compareTo(DateTime.parse(b['date'])));

          String? currentSiteId;
          Map<String, dynamic>? currentPeriod;

          for (var att in workerAllAtts) {
            final attSiteId = att['site'] is Map ? att['site']['_id'] : att['site'];
            final attSiteName = att['site'] is Map ? (att['site']['name'] ?? 'N/A') : 'N/A';
            if (attSiteId == null) continue;

            if (currentSiteId != attSiteId) {
              if (currentPeriod != null) {
                history.add(currentPeriod);
              }
              currentSiteId = attSiteId;
              currentPeriod = {
                'siteName': attSiteName,
                'fromDate': DateTime.parse(att['date']),
                'toDate': DateTime.parse(att['date']),
                'active': false,
              };
            } else {
              currentPeriod!['toDate'] = DateTime.parse(att['date']);
            }
          }
          if (currentPeriod != null) {
            currentPeriod['active'] = true;
            history.add(currentPeriod);
          }

          final labour = Labour.fromJson(json);
          // Store custom assignments
          labour.siteAssignedDate = earliestDate;
          labour.siteHistoryList = history.reversed.toList();
          filteredLabours.add(labour);
        }
      }

      // 5. Calculate today's attendance
      final todayString = DateFormat('yyyy-MM-dd').format(DateTime.now());
      final todayPresentCount = siteAttendance.where((att) {
        final attDate = att['date']?.toString().split('T')[0];
        return att['status'] == 'Present' && attDate == todayString;
      }).length;

      // 6. Filter site challans
      final targetName = widget.site.name.toLowerCase().trim();
      final targetId = widget.site.id.toLowerCase();
      final siteChallans = widget.allChallans.where((c) {
        return c.siteId?.toLowerCase() == targetId || c.siteName?.toLowerCase().trim() == targetName;
      }).toList();

      if (mounted) {
        setState(() {
          _siteLabours = filteredLabours;
          _siteChallans = siteChallans;
          _todayPresent = todayPresentCount;
          _isLoadingDetails = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading site details: $e');
      if (mounted) {
        setState(() => _isLoadingDetails = false);
      }
    }
  }

  void _showLabourHistory(Labour labour) {
    showDialog(
      context: context,
      builder: (_) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Container(
          width: 400,
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '${labour.name} - Site History',
                style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 12),
              if (labour.siteHistoryList == null || labour.siteHistoryList!.isEmpty)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24.0),
                  child: Center(child: Text('No history found.', style: TextStyle(fontSize: 13))),
                )
              else
                Flexible(
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: labour.siteHistoryList!.length,
                    itemBuilder: (context, idx) {
                      final h = labour.siteHistoryList![idx];
                      final fromDate = DateFormat('dd/MM/yyyy').format(h['fromDate']);
                      final toDate = DateFormat('dd/MM/yyyy').format(h['toDate']);
                      final isActive = h['active'] == true;

                      return Padding(
                        padding: const EdgeInsets.symmetric(vertical: 8.0),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(h['siteName'] ?? 'N/A', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 2),
                                Text('$fromDate to $toDate', style: TextStyle(color: Colors.grey.shade400, fontSize: 11)),
                              ],
                            ),
                            if (isActive)
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: Colors.green.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Text(
                                  'Active',
                                  style: TextStyle(color: Colors.green, fontSize: 9, fontWeight: FontWeight.bold),
                                ),
                              ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  ElevatedButton(
                    onPressed: () => Navigator.pop(context),
                    child: const Text('Close'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    final double totalExpenses = _siteChallans.fold(0.0, (sum, c) => sum + c.totalAmount);

    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
      child: Container(
        width: 900,
        height: MediaQuery.of(context).size.height * 0.8,
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(30),
        ),
        child: _isLoadingDetails
            ? const Center(child: CircularProgressIndicator())
            : Column(
                children: [
                  // HEADER
                  Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                widget.site.name,
                                style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.bold),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                '📍 ${widget.site.location}  |  👷 Contractor: ${widget.site.contractorName.isEmpty ? 'N/A' : widget.site.contractorName}',
                                style: TextStyle(color: Colors.grey.shade400, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.close),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                  ),
                  const Divider(height: 1),

                  // SCROLLABLE CONTENT
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // STATS GRID
                          Row(
                            children: [
                              Expanded(child: _buildDetailStatCard('Total Labourers', _siteLabours.length.toString(), Colors.blue)),
                              const SizedBox(width: 16),
                              Expanded(child: _buildDetailStatCard('Present Today', _todayPresent.toString(), Colors.green)),
                              const SizedBox(width: 16),
                              Expanded(child: _buildDetailStatCard('Progress', '${widget.site.progress}%', Colors.indigo)),
                              const SizedBox(width: 16),
                              Expanded(child: _buildDetailStatCard('Site Expenses', currencyFormat.format(totalExpenses), Colors.purple)),
                            ],
                          ),
                          const SizedBox(height: 32),

                          // WORKING LABOURERS
                          Text('WORKING LABOURERS', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey.shade500, letterSpacing: 1)),
                          const SizedBox(height: 12),
                          Container(
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.background.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: theme.dividerColor.withOpacity(0.04)),
                            ),
                            child: _siteLabours.isEmpty
                                ? const Padding(
                                    padding: EdgeInsets.all(24.0),
                                    child: Center(child: Text('No labourers logged at this site.', style: TextStyle(fontSize: 12))),
                                  )
                                : DataTable(
                                    columns: [
                                      DataColumn(label: Text('Name', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                      DataColumn(label: Text('Phone', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                      DataColumn(label: Text('Daily Wage', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                      DataColumn(label: Text('Site Joined Date', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                      DataColumn(label: Text('History', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                    ],
                                    rows: _siteLabours.map((labour) {
                                      final joinedDate = labour.siteAssignedDate != null
                                          ? DateFormat('dd/MM/yyyy').format(labour.siteAssignedDate!)
                                          : 'N/A';
                                      return DataRow(
                                        cells: [
                                          DataCell(Text(labour.name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12))),
                                          DataCell(Text(labour.phone, style: const TextStyle(fontSize: 12))),
                                          DataCell(Text(currencyFormat.format(labour.dailyWage), style: const TextStyle(fontSize: 12))),
                                          DataCell(Text(joinedDate, style: const TextStyle(fontSize: 12))),
                                          DataCell(
                                            ElevatedButton(
                                              onPressed: () => _showLabourHistory(labour),
                                              style: ElevatedButton.styleFrom(
                                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                                                minimumSize: Size.zero,
                                                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                                              ),
                                              child: const Text('History', style: TextStyle(fontSize: 10)),
                                            ),
                                          ),
                                        ],
                                      );
                                    }).toList(),
                                  ),
                          ),
                          const SizedBox(height: 32),

                          // SITE EXPENSES / CHALLANS
                          Text('SITE EXPENSES / CHALLANS', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.grey.shade500, letterSpacing: 1)),
                          const SizedBox(height: 12),
                          Container(
                            width: double.infinity,
                            decoration: BoxDecoration(
                              color: theme.colorScheme.background.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(color: theme.dividerColor.withOpacity(0.04)),
                            ),
                            child: _siteChallans.isEmpty
                                ? const Padding(
                                    padding: EdgeInsets.all(24.0),
                                    child: Center(child: Text('No expenses or challans logged for this site.', style: TextStyle(fontSize: 12))),
                                  )
                                : DataTable(
                                    columns: [
                                      DataColumn(label: Text('Date', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                      DataColumn(label: Text('Challan No.', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                      DataColumn(label: Text('Vendor Name', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                      DataColumn(label: Text('Items Count', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12)), numeric: true),
                                      DataColumn(label: Text('Grand Total', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12)), numeric: true),
                                      DataColumn(label: Text('View', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 12))),
                                    ],
                                    rows: _siteChallans.map((challan) {
                                      return DataRow(
                                        cells: [
                                          DataCell(Text(DateFormat('dd/MM/yyyy').format(challan.billDate), style: const TextStyle(fontSize: 12))),
                                          DataCell(Text('#${challan.challanNo}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                                          DataCell(Text(challan.vendor, style: const TextStyle(fontSize: 12))),
                                          DataCell(Text(challan.items.length.toString(), style: const TextStyle(fontSize: 12))),
                                          DataCell(Text(currencyFormat.format(challan.totalAmount), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold))),
                                          DataCell(
                                            IconButton(
                                              icon: const Icon(Icons.remove_red_eye_outlined, color: Colors.blue, size: 16),
                                              onPressed: () {
                                                showDialog(
                                                  context: context,
                                                  builder: (_) => ViewChallanDialog(challan: challan),
                                                );
                                              },
                                              constraints: const BoxConstraints(),
                                              padding: EdgeInsets.zero,
                                            ),
                                          ),
                                        ],
                                      );
                                    }).toList(),
                                  ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildDetailStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label.toUpperCase(), style: TextStyle(color: Colors.grey.shade400, fontSize: 9, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(value, style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w900, color: color)),
        ],
      ),
    );
  }
}
