import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/shopkeeper_provider.dart';
import '../../core/app_theme.dart';

class AdminShopkeeperManagement extends StatelessWidget {
  const AdminShopkeeperManagement({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Shopkeeper Registry"),
      ),
      body: Row(
        children: [
          // Sidebar Placeholder
          Container(
            width: 240,
            color: Colors.white,
            child: Column(
              children: [
                _buildSidebarItem(context, Icons.dashboard_rounded, "Dashboard", false, '/admin'),
                _buildSidebarItem(context, Icons.shopping_bag, "Orders", false, '/admin'),
                _buildSidebarItem(context, Icons.inventory_2, "Products", false, '/admin_products'),
                _buildSidebarItem(context, Icons.people, "Shopkeepers", true, '/admin_shopkeepers'),
                _buildSidebarItem(context, Icons.payment, "Payments", false, '/admin'),
              ],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Consumer<ShopkeeperProvider>(
                builder: (context, provider, child) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildOverviewStats(provider),
                      const SizedBox(height: 32),
                      const Text(
                        "Registered Dukandaars",
                        style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 16),
                      Expanded(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: SingleChildScrollView(
                            child: DataTable(
                              columns: const [
                                DataColumn(label: Text("Shop & Owner")),
                                DataColumn(label: Text("Mobile")),
                                DataColumn(label: Text("Location")),
                                DataColumn(label: Text("Outstanding")),
                                DataColumn(label: Text("Actions")),
                              ],
                              rows: provider.shopkeepers.map((shopkeeper) {
                                return DataRow(cells: [
                                  DataCell(
                                    Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        Text(shopkeeper.shopName, style: const TextStyle(fontWeight: FontWeight.bold)),
                                        Text(shopkeeper.name, style: TextStyle(color: Colors.grey[600], fontSize: 12)),
                                      ],
                                    ),
                                  ),
                                  DataCell(Text(shopkeeper.mobile)),
                                  DataCell(Text(shopkeeper.address)),
                                  DataCell(
                                    Text(
                                      "₹${shopkeeper.outstandingBalance.toStringAsFixed(0)}",
                                      style: TextStyle(
                                        color: shopkeeper.outstandingBalance > 10000 ? Colors.red : Colors.black,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  DataCell(
                                    ElevatedButton(
                                      onPressed: () => _showPaymentDialog(context, shopkeeper.id, provider),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: Colors.green,
                                        minimumSize: const Size(120, 36),
                                      ),
                                      child: const Text("Record Payment", style: TextStyle(fontSize: 12)),
                                    ),
                                  ),
                                ]);
                              }).toList(),
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSidebarItem(BuildContext context, IconData icon, String title, bool isSelected, String route) {
    return ListTile(
      leading: Icon(icon, color: isSelected ? AppTheme.primaryColor : Colors.grey),
      title: Text(
        title,
        style: TextStyle(
          color: isSelected ? AppTheme.primaryColor : Colors.grey[800],
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
      ),
      selected: isSelected,
      selectedTileColor: AppTheme.primaryColor.withOpacity(0.05),
      onTap: () => Navigator.pushReplacementNamed(context, route),
    );
  }

  Widget _buildOverviewStats(ShopkeeperProvider provider) {
    double totalOutstanding = provider.shopkeepers.fold(0, (sum, s) => sum + s.outstandingBalance);
    return Row(
      children: [
        _buildStatCard("Total Market Credit", "₹${totalOutstanding.toStringAsFixed(0)}", Icons.account_balance_wallet, Colors.red),
        const SizedBox(width: 16),
        _buildStatCard("Active Shops", provider.shopkeepers.length.toString(), Icons.storefront, Colors.blue),
        const SizedBox(width: 16),
        _buildStatCard("Collection Rate", "84%", Icons.trending_up_rounded, Colors.green),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(title, style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                Icon(icon, color: color, size: 20),
              ],
            ),
            const SizedBox(height: 8),
            Text(value, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  void _showPaymentDialog(BuildContext context, String shopkeeperId, ShopkeeperProvider provider) {
    final amountController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text("Record Settlement"),
        content: TextField(
          controller: amountController,
          decoration: const InputDecoration(labelText: "Amount Received (₹)", hintText: "e.g. 5000"),
          keyboardType: TextInputType.number,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text("Cancel")),
          ElevatedButton(
            onPressed: () {
              final amount = double.tryParse(amountController.text) ?? 0.0;
              provider.recordPayment(shopkeeperId, amount);
              Navigator.pop(context);
            },
            child: const Text("Update Balance"),
          ),
        ],
      ),
    );
  }
}
