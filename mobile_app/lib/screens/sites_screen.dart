import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import '../providers/site_provider.dart';
import '../models/site.dart';
import 'expenses_screen.dart';

class SitesScreen extends StatefulWidget {
  const SitesScreen({super.key});

  @override
  State<SitesScreen> createState() => _SitesScreenState();
}

class _SitesScreenState extends State<SitesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
      Provider.of<SiteProvider>(context, listen: false).fetchSites()
    );
  }

  void _showSiteForm({Site? site}) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => SiteFormSheet(site: site),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final siteProvider = Provider.of<SiteProvider>(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.background,
      appBar: AppBar(
        title: Text(
          'SITES',
          style: GoogleFonts.outfit(fontWeight: FontWeight.w900, letterSpacing: 1),
        ),
      ),
      body: siteProvider.isLoading
          ? const Center(child: CircularProgressIndicator())
          : siteProvider.sites.isEmpty
              ? Center(
                  child: Text(
                    'No sites found.\nTap "+" to add one.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey.shade500, fontSize: 14),
                  ),
                )
              : ListView.separated(
                  padding: const EdgeInsets.all(16),
                  itemCount: siteProvider.sites.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 16),
                  itemBuilder: (context, index) {
                    final site = siteProvider.sites[index];
                    return _buildSiteCard(theme, site);
                  },
                ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => _showSiteForm(),
        backgroundColor: theme.colorScheme.primary,
        foregroundColor: Colors.white,
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildSiteCard(ThemeData theme, Site site) {
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
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      site.name,
                      style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      site.location,
                      style: TextStyle(color: Colors.grey.shade500, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: site.status == 'Active' 
                      ? Colors.green.withOpacity(0.1) 
                      : Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  site.status,
                  style: GoogleFonts.outfit(
                    color: site.status == 'Active' ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.bold,
                    fontSize: 11,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Contractor: ${site.contractorName}',
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
              ),
              Text(
                '${site.progress}% Complete',
                style: GoogleFonts.outfit(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w900,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: site.progress / 100,
              backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
              valueColor: AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => ExpensesScreen(site: site)),
                  );
                },
                icon: const Icon(Icons.receipt_long, size: 16),
                label: const Text('Expenses', style: TextStyle(fontSize: 12)),
              ),
              const SizedBox(width: 8),
              OutlinedButton.icon(
                onPressed: () => _showSiteForm(site: site),
                icon: const Icon(Icons.edit, size: 16),
                label: const Text('Edit Site', style: TextStyle(fontSize: 12)),
                style: OutlinedButton.styleFrom(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class SiteFormSheet extends StatefulWidget {
  final Site? site;
  const SiteFormSheet({super.key, this.site});

  @override
  State<SiteFormSheet> createState() => _SiteFormSheetState();
}

class _SiteFormSheetState extends State<SiteFormSheet> {
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
                widget.site != null ? 'Edit Site' : 'Add New Site',
                style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
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
                children: [
                  const Text('Status:', style: TextStyle(fontWeight: FontWeight.bold)),
                  const SizedBox(width: 16),
                  DropdownButton<String>(
                    value: _status,
                    items: ['Active', 'Completed', 'Hold'].map((status) {
                      return DropdownMenuItem<String>(
                        value: status,
                        child: Text(status),
                      );
                    }).toList(),
                    onChanged: (val) {
                      if (val != null) {
                        setState(() {
                          _status = val;
                        });
                      }
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
                label: '${_progress.toInt()}%',
                onChanged: (val) {
                  setState(() {
                    _progress = val;
                  });
                },
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
                  child: Text(widget.site != null ? 'Save Changes' : 'Add Site', style: const TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
