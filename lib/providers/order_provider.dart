import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/order_request.dart';
import '../core/app_config.dart';

class OrderProvider with ChangeNotifier {
  List<OrderRequest> _orders = [];
  bool _isLoading = false;

  List<OrderRequest> get orders => [..._orders];
  bool get isLoading => _isLoading;

  Future<void> fetchOrders() async {
    _isLoading = true;
    notifyListeners();

    try {
      // For now fetching from /orders/pending as per backend routes
      final response = await http.get(Uri.parse('${AppConfig.baseUrl}/orders/pending'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _orders = data.map<OrderRequest>((item) => OrderRequest.fromMap(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching orders: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addOrder(OrderRequest order) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/orders'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(order.toMap()),
      );
      if (response.statusCode == 201) {
        final newOrder = OrderRequest.fromMap(json.decode(response.body));
        _orders.insert(0, newOrder);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error adding order: $e');
    }
  }

  void updateOrderStatus(String orderId, OrderStatus newStatus) {
    // Implement API call for status update if needed
  }

  List<OrderRequest> getPendingOrders() => _orders.where((o) => o.status == OrderStatus.pending).toList();
}

