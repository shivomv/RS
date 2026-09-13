import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../models/product.dart';
import '../core/app_config.dart';

class ProductProvider with ChangeNotifier {
  List<Product> _products = [];
  bool _isLoading = false;

  List<Product> get products => [..._products];
  bool get isLoading => _isLoading;

  Future<void> fetchProducts() async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await http.get(Uri.parse('${AppConfig.baseUrl}/products'));
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        _products = data.map((item) => Product.fromMap(item)).toList();
      }
    } catch (e) {
      debugPrint('Error fetching products: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> addProduct(Product product) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/products'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(product.toMap()),
      );
      if (response.statusCode == 201) {
        final newProduct = Product.fromMap(json.decode(response.body));
        _products.add(newProduct);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error adding product: $e');
    }
  }

  Future<void> updateProduct(Product product) async {
    try {
      final response = await http.put(
        Uri.parse('${AppConfig.baseUrl}/products/${product.id}'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode(product.toMap()),
      );
      if (response.statusCode == 200) {
        final index = _products.indexWhere((p) => p.id == product.id);
        if (index >= 0) {
          _products[index] = product;
          notifyListeners();
        }
      }
    } catch (e) {
      debugPrint('Error updating product: $e');
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      final response = await http.delete(Uri.parse('${AppConfig.baseUrl}/products/$id'));
      if (response.statusCode == 200) {
        _products.removeWhere((p) => p.id == id);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error deleting product: $e');
    }
  }

  void toggleStatus(String id) {
    // This could also be an API call, but for now keeping it local or implementing it if needed
  }
}

