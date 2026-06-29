class Site {
  final String id;
  final String name;
  final String location;
  final String status;
  final int progress;
  final String contractorName;

  Site({
    required this.id,
    required this.name,
    required this.location,
    required this.status,
    required this.progress,
    required this.contractorName,
  });

  factory Site.fromJson(Map<String, dynamic> json) {
    return Site(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      location: json['location'] ?? '',
      status: json['status'] ?? 'Active',
      progress: json['progress'] ?? 0,
      contractorName: json['contractorName'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'location': location,
      'status': status,
      'progress': progress,
      'contractorName': contractorName,
    };
  }
}
