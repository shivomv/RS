import 'package:flutter/material.dart';
import '../models/shopkeeper.dart';

class ShopkeeperProvider with ChangeNotifier {
  final List<Shopkeeper> _shopkeepers = [
    Shopkeeper(
      id: '1',
      name: 'Suresh Kumar',
      mobile: '9876543210',
      shopName: 'Suresh Kirana Store',
      address: 'Main Market, Delhi',
      outstandingBalance: 12400.0,
      createdAt: DateTime.now().subtract(const Duration(days: 60)),
    ),
    Shopkeeper(
      id: '2',
      name: 'Manoj Singh',
      mobile: '9988776655',
      shopName: 'Manoj General Store',
      address: 'West Extension, Mumbai',
      outstandingBalance: 5200.0,
      createdAt: DateTime.now().subtract(const Duration(days: 30)),
    ),
    Shopkeeper(
      id: '3',
      name: 'Priya Sharma',
      mobile: '9122334455',
      shopName: 'Clean Mart',
      address: 'Sector 15, Gurgaon',
      outstandingBalance: 8900.0,
      createdAt: DateTime.now().subtract(const Duration(days: 15)),
    ),
  ];

  List<Shopkeeper> get shopkeepers => [..._shopkeepers];

  void recordPayment(String shopkeeperId, double amount) {
    final index = _shopkeepers.indexWhere((s) => s.id == shopkeeperId);
    if (index >= 0) {
      final s = _shopkeepers[index];
      _shopkeepers[index] = Shopkeeper(
        id: s.id,
        name: s.name,
        mobile: s.mobile,
        shopName: s.shopName,
        address: s.address,
        outstandingBalance: s.outstandingBalance - amount,
        createdAt: s.createdAt,
      );
      notifyListeners();
    }
  }

  void addShopkeeper(Shopkeeper shopkeeper) {
    _shopkeepers.add(shopkeeper);
    notifyListeners();
  }
}
