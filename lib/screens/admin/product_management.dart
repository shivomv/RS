import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/product_provider.dart';
import '../../models/product.dart';
import '../../core/app_theme.dart';
import '../../core/app_route_names.dart';

class AdminProductManagement extends StatelessWidget {
  const AdminProductManagement({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0.5,
        leading: const Padding(
          padding: EdgeInsets.all(8.0),
          child: CircleAvatar(
            backgroundColor: Color(0xFFE0E0E0),
            child: Icon(Icons.person, color: AppTheme.primaryColor),
          ),
        ),
        title: const Text("RS Industries", style: TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none, color: AppTheme.primaryColor)),
          const SizedBox(width: 8),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Inventory Management", style: theme.textTheme.displayMedium?.copyWith(fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Consumer<ProductProvider>(
                    builder: (context, provider, child) => Text(
                      "B2B Distribution Hub • ${provider.products.length} Active SKUs",
                      style: theme.textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant),
                    ),
                  ),
                ],
              ),
            ),
            _buildFilters(theme),
            const SizedBox(height: 16),
            Consumer<ProductProvider>(
              builder: (context, provider, child) {
                return ListView.builder(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: provider.products.length,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  itemBuilder: (ctx, i) => _buildInventoryCard(theme, provider.products[i]),
                );
              },
            ),
            const SizedBox(height: 100),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      bottomNavigationBar: _buildAdminBottomNav(context),
    );
  }

  Widget _buildFilters(ThemeData theme) {
    final filters = ["ALL PRODUCTS", "LOW STOCK", "CHEMICALS"];
    return SizedBox(
      height: 40,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: filters.length,
        itemBuilder: (context, i) {
          final isFirst = i == 0;
          return Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 20),
            decoration: BoxDecoration(
              color: isFirst ? AppTheme.primaryColor : AppTheme.surfaceContainerHigh.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                filters[i],
                style: theme.textTheme.labelSmall?.copyWith(
                  color: isFirst ? Colors.white : AppTheme.onSurfaceVariant,
                  fontWeight: isFirst ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInventoryCard(ThemeData theme, Product product) {
    final isCritical = product.stockQuantity < 15;
    final statusColor = isCritical ? Colors.red : const Color(0xFF006B5F);
    final statusLabel = isCritical ? "CRITICAL" : "IN STOCK";

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: AppTheme.ambientShadow,
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            Container(
              width: 5,
              decoration: BoxDecoration(
                color: statusColor,
                borderRadius: const BorderRadius.only(topLeft: Radius.circular(12), bottomLeft: Radius.circular(12)),
              ),
            ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceContainerHigh.withOpacity(0.3),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.inventory_2_outlined, color: Colors.grey),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Expanded(
                                    child: Text(product.name, style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold)),
                                  ),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                                    child: Text(statusLabel, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: statusColor)),
                                  ),
                                ],
                              ),
                              Text("SKU: RS-CHM-${product.id.substring(0, 3).toUpperCase()}", style: const TextStyle(fontSize: 10, color: Colors.grey)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Text("${product.stockQuantity} cases", style: TextStyle(fontWeight: FontWeight.w900, color: statusColor)),
                                  const SizedBox(width: 8),
                                  Text("/ ₹${product.price} per unit", style: const TextStyle(color: Colors.grey, fontSize: 12)),
                                ],
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () {},
                            child: Container(
                              height: 48,
                              decoration: BoxDecoration(
                                color: AppTheme.primaryColor,
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: const Center(child: Text("EDIT STOCK", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1))),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: AppTheme.surfaceContainerHigh.withOpacity(0.5),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Icon(Icons.visibility_outlined, size: 20),
                        ),
                      ],
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

  Widget _buildAdminBottomNav(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]),
      child: BottomNavigationBar(
        currentIndex: 2,
        selectedItemColor: const Color(0xFF006B5F),
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0,
        selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
        unselectedLabelStyle: const TextStyle(fontSize: 10),
        onTap: (index) {
          if (index == 0) Navigator.pushReplacementNamed(context, AppRouteNames.admin);
          if (index == 3) Navigator.pushReplacementNamed(context, AppRouteNames.adminShopkeepers);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: "DASHBOARD"),
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: "ORDERS"),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2), label: "INVENTORY"),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), label: "ACCOUNTS"),
          BottomNavigationBarItem(icon: Icon(Icons.more_horiz), label: "MORE"),
        ],
      ),
    );
  }
}
