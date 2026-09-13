import 'product.dart';

enum OrderStatus { pending, confirmed, shipped, delivered, cancelled }

class OrderItem {
  final Product product;
  final int quantity;
  final double priceAtOrder;

  OrderItem({
    required this.product,
    required this.quantity,
    required this.priceAtOrder,
  });

  Map<String, dynamic> toMap() {
    return {
      'productId': product.id,
      'productName': product.name,
      'quantity': quantity,
      'priceAtOrder': priceAtOrder,
    };
  }

  factory OrderItem.fromMap(Map<String, dynamic> map) {
    return OrderItem(
      product: Product(
        id: map['productId'],
        name: map['productName'],
        description: '',
        category: '',
        price: (map['priceAtOrder'] as num).toDouble(),
        imageUrl: '',
        stockQuantity: 0,
      ),
      quantity: map['quantity'],
      priceAtOrder: (map['priceAtOrder'] as num).toDouble(),
    );
  }
}

class OrderRequest {
  final String id;
  final String shopkeeperId;
  final String shopkeeperName;
  final String shopkeeperMobile;
  final List<OrderItem> items;
  final double totalAmount;
  final OrderStatus status;
  final DateTime createdAt;

  OrderRequest({
    required this.id,
    required this.shopkeeperId,
    required this.shopkeeperName,
    required this.shopkeeperMobile,
    required this.items,
    required this.totalAmount,
    this.status = OrderStatus.pending,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'shopkeeperId': shopkeeperId,
      'shopkeeperName': shopkeeperName,
      'shopkeeperMobile': shopkeeperMobile,
      'items': items.map((i) => i.toMap()).toList(),
      'totalAmount': totalAmount,
      'status': status.name,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  factory OrderRequest.fromMap(Map<String, dynamic> map) {
    return OrderRequest(
      id: map['id'],
      shopkeeperId: map['shopkeeperId'],
      shopkeeperName: map['shopkeeperName'],
      shopkeeperMobile: map['shopkeeperMobile'],
      items: (map['items'] as List).map((i) => OrderItem.fromMap(i)).toList(),
      totalAmount: (map['totalAmount'] as num).toDouble(),
      status: OrderStatus.values.firstWhere(
        (e) => e.name == map['status'],
        orElse: () => OrderStatus.pending,
      ),
      createdAt: DateTime.parse(map['createdAt']),
    );
  }
}
