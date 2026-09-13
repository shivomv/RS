class Shopkeeper {
  final String id;
  final String name;
  final String mobile;
  final String shopName;
  final String address;
  final double outstandingBalance;
  final DateTime createdAt;

  Shopkeeper({
    required this.id,
    required this.name,
    required this.mobile,
    required this.shopName,
    required this.address,
    this.outstandingBalance = 0.0,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'name': name,
      'mobile': mobile,
      'shopName': shopName,
      'address': address,
      'outstandingBalance': outstandingBalance,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory Shopkeeper.fromMap(Map<String, dynamic> map) {
    return Shopkeeper(
      id: map['_id'] ?? map['id'] ?? '',
      name: map['name'] ?? '',
      mobile: map['mobile'] ?? '',
      shopName: map['shopName'] ?? '',
      address: map['address'] ?? '',
      outstandingBalance: (map['outstandingBalance'] ?? 0.0).toDouble(),
      createdAt: map['createdAt'] != null ? DateTime.parse(map['createdAt']) : DateTime.now(),
    );
  }
}
