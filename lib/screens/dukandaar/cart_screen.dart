import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/cart_provider.dart';
import '../../core/app_theme.dart';
import '../../core/app_route_names.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Your Cart", style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w900)),
            Consumer<CartProvider>(
              builder: (context, cart, child) => Text(
                "${cart.itemCount} ITEMS SELECTED",
                style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
              ),
            ),
          ],
        ),
      ),
      body: Consumer<CartProvider>(
        builder: (context, cart, child) {
          if (cart.items.isEmpty) {
            return _buildEmptyCart(theme, context);
          }
          final cartList = cart.items.values.toList();
          return SingleChildScrollView(
            child: Column(
              children: [
                ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: cartList.length,
                  padding: const EdgeInsets.all(20),
                  itemBuilder: (context, index) {
                    final item = cartList[index];
                    return _buildCartItemCard(theme, item, cart);
                  },
                ),
                _buildOrderSummary(theme, cart, context),
                const SizedBox(height: 100),
              ],
            ),
          );
        },
      ),
      bottomNavigationBar: _buildBottomNav(theme, context),
    );
  }

  Widget _buildEmptyCart(ThemeData theme, BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.grey.withOpacity(0.3)),
          const SizedBox(height: 24),
          Text("YOUR CART IS EMPTY", style: theme.textTheme.labelSmall?.copyWith(letterSpacing: 2)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryColor),
            child: const Text("CONTINUE PROCUREMENT", style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItemCard(ThemeData theme, CartItem item, CartProvider cart) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: AppTheme.ambientShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            height: 140,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerHigh.withOpacity(0.3),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.precision_manufacturing_outlined, size: 60, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(item.product.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                    const SizedBox(height: 4),
                    Text("SKU: RS-${item.product.id.padLeft(6, '0')}", style: const TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
              IconButton(
                onPressed: () => cart.removeItem(item.product.id),
                icon: const Icon(Icons.delete_outline, color: AppTheme.primaryColor),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _buildSmallBadge("SIZE: INDUSTRIAL STANDARD", Colors.grey.withOpacity(0.1)),
              const SizedBox(width: 8),
              _buildSmallBadge("IN STOCK", const Color(0xFFA2FCE6).withOpacity(0.3), textColor: const Color(0xFF006B5F)),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                decoration: BoxDecoration(
                  color: AppTheme.surfaceContainerHigh.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    IconButton(onPressed: () => cart.removeSingleItem(item.product.id), icon: const Icon(Icons.remove, size: 16)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text("${item.quantity.toString().padLeft(2, '0')}", style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    ),
                    IconButton(onPressed: () => cart.addItem(item.product), icon: const Icon(Icons.add, size: 16)),
                  ],
                ),
              ),
              Text("₹${(item.product.price * item.quantity).toStringAsFixed(2)}", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSmallBadge(String text, Color bgColor, {Color textColor = Colors.black87}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(text, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: textColor)),
    );
  }

  Widget _buildOrderSummary(ThemeData theme, CartProvider cart, BuildContext context) {
    final subtotal = cart.totalAmount;
    final gst = subtotal * 0.18;
    final total = subtotal + gst;

    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerHigh.withOpacity(0.1),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("ORDER SUMMARY", style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 13)),
          const SizedBox(height: 24),
          _buildSummaryRow("Subtotal", "₹${subtotal.toStringAsFixed(2)}"),
          _buildSummaryRow("GST (18%)", "₹${gst.toStringAsFixed(2)}"),
          _buildSummaryRow("Shipping Charges", "FREE", valueColor: const Color(0xFF006B5F)),
          const Divider(height: 1),
          const SizedBox(height: 16),
          _buildSummaryRow("Estimated Total", "₹${total.toStringAsFixed(2)}", isTotal: true),
          const SizedBox(height: 32),
          GestureDetector(
            onTap: () {
              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Enquiry Protocol Initiated! Our team will contact you for pricing.")));
              cart.clear();
              Navigator.pop(context);
            },
            child: Container(
              height: 56,
              decoration: BoxDecoration(
                color: AppTheme.primaryColor,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
              ),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.send_outlined, color: Colors.white, size: 20),
                  SizedBox(width: 12),
                  Text("Send Enquiry", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1)),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 56,
            child: OutlinedButton(
              onPressed: () => Navigator.pop(context),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: AppTheme.primaryColor),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: const Text("Continue Shopping", style: TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w900)),
            ),
          ),
          const SizedBox(height: 32),
          Row(
            children: [
              _buildTrustBadge(Icons.verified_user_outlined, "B2B VERIFIED\nSELLERS"),
              const SizedBox(width: 16),
              _buildTrustBadge(Icons.local_shipping_outlined, "EXPRESS\nLOGISTICS"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryRow(String label, String value, {bool isTotal = false, Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(
            fontSize: isTotal ? 16 : 13,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.normal,
            color: isTotal ? Colors.black87 : Colors.grey,
          )),
          Text(value, style: TextStyle(
            fontSize: isTotal ? 22 : 13,
            fontWeight: isTotal ? FontWeight.w900 : FontWeight.bold,
            color: valueColor ?? (isTotal ? AppTheme.primaryColor : Colors.black87),
          )),
        ],
      ),
    );
  }

  Widget _buildTrustBadge(IconData icon, String label) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, size: 20, color: const Color(0xFF006B5F)),
            const SizedBox(width: 12),
            Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav(ThemeData theme, BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))],
      ),
      child: BottomNavigationBar(
        currentIndex: 2,
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
          if (index == 1) Navigator.pushReplacementNamed(context, AppRouteNames.dukandaarOrders);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: "HOME"),
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: "ORDERS"),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: "CART"),
          BottomNavigationBarItem(icon: Icon(Icons.person_outline), label: "PROFILE"),
        ],
      ),
    );
  }
}
