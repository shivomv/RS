import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/order_provider.dart';
import '../../core/app_theme.dart';
import '../../core/app_route_names.dart';

class AdminDashboard extends StatelessWidget {
  const AdminDashboard({super.key});

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
                  Text("Logistics Command", style: theme.textTheme.displayMedium?.copyWith(fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text("B2B Distribution Hub • v2.4.0", style: theme.textTheme.bodyMedium?.copyWith(color: AppTheme.onSurfaceVariant)),
                ],
              ),
            ),
            _buildMainSalesCard(theme),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Row(
                children: [
                  Expanded(child: _buildStatCard(theme, "PENDING ORDERS", "42", "5 Urgent", Icons.inventory_2, Colors.red)),
                  const SizedBox(width: 16),
                  Expanded(child: _buildStatCard(theme, "TOTAL BALANCE", "₹8.4L", "12 Dukandaars", Icons.account_balance_wallet, AppTheme.primaryColor)),
                ],
              ),
            ),
            const SizedBox(height: 32),
            _buildLowStockSection(theme),
            const SizedBox(height: 24),
            _buildPartnerDirectoryCard(theme),
            const SizedBox(height: 100),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: AppTheme.primaryColor,
        child: const Icon(Icons.local_shipping, color: Colors.white),
      ),
      bottomNavigationBar: _buildAdminBottomNav(context),
    );
  }

  Widget _buildMainSalesCard(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.all(24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: AppTheme.ambientShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("TOTAL SALES THIS MONTH", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 1)),
          const SizedBox(height: 8),
          Row(
            children: [
              const Text("₹4,28,500", style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
              const SizedBox(width: 16),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: const Color(0xFFA2FCE6).withOpacity(0.5), borderRadius: BorderRadius.circular(20)),
                child: const Row(
                  children: [
                    Icon(Icons.trending_up, size: 12, color: Color(0xFF006B5F)),
                    SizedBox(width: 4),
                    Text("12.5%", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF006B5F))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              _buildBar(20, AppTheme.primaryColor.withOpacity(0.1)),
              _buildBar(40, AppTheme.primaryColor.withOpacity(0.2)),
              _buildBar(25, AppTheme.primaryColor.withOpacity(0.1)),
              _buildBar(60, AppTheme.primaryColor.withOpacity(0.4)),
              _buildBar(45, AppTheme.primaryColor.withOpacity(0.3)),
              _buildBar(70, AppTheme.primaryColor.withOpacity(0.6)),
              _buildBar(90, AppTheme.primaryColor),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBar(double height, Color color) {
    return Container(
      width: 32,
      height: height,
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(4)),
    );
  }

  Widget _buildStatCard(ThemeData theme, String title, String value, String subtext, IconData icon, Color accentColor) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: AppTheme.ambientShadow),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey, letterSpacing: 0.5)),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(8)),
                child: Icon(icon, size: 20, color: AppTheme.primaryColor),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900)),
                    Row(
                      children: [
                        if (accentColor == Colors.red) Icon(Icons.priority_high, size: 8, color: accentColor),
                        Text(subtext, style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: accentColor)),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLowStockSection(ThemeData theme) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("Low Stock Alerts", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: AppTheme.surfaceContainerHigh.withOpacity(0.5), borderRadius: BorderRadius.circular(4)),
                child: const Text("4 Items", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.primaryColor)),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _buildStockAlertItem(theme, "Ultra-Clean Detergent", "RS-DET-004", "12 Units", "CRITICAL", Colors.red),
        _buildStockAlertItem(theme, "Pine-Fresh Phenyl", "RS-PHN-021", "28 Units", "REORDER", const Color(0xFF006B5F)),
        _buildStockAlertItem(theme, "Floor Gloss Wax", "RS-WAX-009", "15 Units", "REORDER", const Color(0xFF006B5F)),
      ],
    );
  }

  Widget _buildStockAlertItem(ThemeData theme, String name, String sku, String units, String status, Color statusColor) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.02), blurRadius: 10)]),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(color: AppTheme.surface, borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.opacity, color: Color(0xFF006B5F)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                Text("SKU: $sku", style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(units, style: TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: statusColor)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                child: Text(status, style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: statusColor)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPartnerDirectoryCard(ThemeData theme) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppTheme.primaryColor,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("Partner Directory", style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text("Review outstanding payments and credit limits for your 12 active Dukandaars.", style: TextStyle(color: Colors.white70, fontSize: 12)),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () {},
            style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppTheme.primaryColor, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: const Text("Manage Accounts", style: TextStyle(fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildAdminBottomNav(BuildContext context) {
    return Container(
      decoration: BoxDecoration(color: Colors.white, boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -5))]),
      child: BottomNavigationBar(
        currentIndex: 0,
        selectedItemColor: const Color(0xFF006B5F),
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        type: BottomNavigationBarType.fixed,
        backgroundColor: Colors.white,
        elevation: 0,
        selectedLabelStyle: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
        unselectedLabelStyle: const TextStyle(fontSize: 10),
        onTap: (index) {
          if (index == 2) Navigator.pushReplacementNamed(context, AppRouteNames.adminProducts);
          if (index == 3) Navigator.pushReplacementNamed(context, AppRouteNames.adminShopkeepers);
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: "DASHBOARD"),
          BottomNavigationBarItem(icon: Icon(Icons.assignment_outlined), label: "ORDERS"),
          BottomNavigationBarItem(icon: Icon(Icons.inventory_2_outlined), label: "INVENTORY"),
          BottomNavigationBarItem(icon: Icon(Icons.people_outline), label: "ACCOUNTS"),
          BottomNavigationBarItem(icon: Icon(Icons.more_horiz), label: "MORE"),
        ],
      ),
    );
  }
}
