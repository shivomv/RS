import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/order_provider.dart';
import '../../models/order_request.dart';
import '../../core/app_theme.dart';
import '../../core/app_route_names.dart';
import 'package:intl/intl.dart';

class DukandaarOrdersScreen extends StatefulWidget {
  const DukandaarOrdersScreen({super.key});

  @override
  State<DukandaarOrdersScreen> createState() => _DukandaarOrdersScreenState();
}

class _DukandaarOrdersScreenState extends State<DukandaarOrdersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<OrderProvider>(context, listen: false).fetchOrders();
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Text("ORDER HISTORY", style: theme.textTheme.titleMedium?.copyWith(
          letterSpacing: 2,
          fontWeight: FontWeight.w900,
          color: AppTheme.primaryColor,
        )),
      ),
      body: Consumer<OrderProvider>(
        builder: (context, provider, child) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (provider.orders.isEmpty) {
            return _buildEmptyOrders(theme);
          }
          return ListView.builder(
            padding: const EdgeInsets.all(20),
            itemCount: provider.orders.length,
            itemBuilder: (context, index) {
              return _buildOrderCard(theme, provider.orders[index]);
            },
          );
        },
      ),
      bottomNavigationBar: _buildBottomNav(theme),
    );
  }

  Widget _buildEmptyOrders(ThemeData theme) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.assignment_outlined, size: 80, color: Colors.grey.withOpacity(0.3)),
          const SizedBox(height: 24),
          const Text("NO ENQUIRIES FOUND", style: TextStyle(letterSpacing: 2, fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildOrderCard(ThemeData theme, OrderRequest order) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: AppTheme.ambientShadow,
      ),
      child: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("ENQUIRY #${order.id.substring(order.id.length - 6).toUpperCase()}", style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(DateFormat('dd MMM yyyy, HH:mm').format(order.createdAt), style: const TextStyle(color: Colors.grey, fontSize: 10)),
                  ],
                ),
                _buildStatusBadge(order.status),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text("${order.items.length} INDUSTRIAL ITEMS", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                Text("EST. TOTAL: ₹${order.totalAmount.toStringAsFixed(2)}", style: const TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusBadge(OrderStatus status) {
    Color color;
    switch (status) {
      case OrderStatus.pending: color = Colors.orange; break;
      case OrderStatus.confirmed: color = const Color(0xFF006B5F); break;
      case OrderStatus.shipped: color = Colors.blue; break;
      case OrderStatus.delivered: color = Colors.green; break;
      case OrderStatus.cancelled: color = Colors.red; break;
      default: color = Colors.grey;
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
      child: Text(status.name.toUpperCase(), style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 9)),
    );
  }

  Widget _buildBottomNav(ThemeData theme) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: BottomNavigationBar(
        currentIndex: 1,
        selectedItemColor: AppTheme.primaryColor,
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0,
        selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
        unselectedLabelStyle: const TextStyle(fontSize: 10),
        onTap: (index) {
          if (index == 0) Navigator.popUntil(context, (route) => route.isFirst);
          if (index == 2) Navigator.pushReplacementNamed(context, AppRouteNames.cart);
          if (index == 3) Navigator.pushReplacementNamed(context, AppRouteNames.profile);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: "HOME"),
          BottomNavigationBarItem(icon: Icon(Icons.assignment), label: "ORDERS"),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart_outlined), label: "CART"),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: "PROFILE"),
        ],
      ),
    );
  }
}
