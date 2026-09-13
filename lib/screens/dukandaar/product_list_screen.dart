import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/app_theme.dart';
import '../../providers/product_provider.dart';
import '../../models/product.dart';
import '../../core/app_route_names.dart';

class ProductListScreen extends StatefulWidget {
  const ProductListScreen({super.key});

  @override
  State<ProductListScreen> createState() => _ProductListScreenState();
}

class _ProductListScreenState extends State<ProductListScreen> {
  String selectedCategory = 'All';
  final List<String> categories = ['All', 'Detergents', 'Floor Cleaners', 'Phenyl', 'Sanitizers'];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: Text("ALL CATALOGUES", style: theme.textTheme.titleMedium?.copyWith(
          letterSpacing: 2,
          fontWeight: FontWeight.w900,
          color: AppTheme.primaryColor,
        )),
        actions: [
          IconButton(
            onPressed: () {},
            icon: const Icon(Icons.search_outlined),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          _buildCategoryFilter(theme),
          Expanded(
            child: Consumer<ProductProvider>(
              builder: (context, provider, child) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }

                final filteredProducts = provider.products.where((p) {
                  return selectedCategory == 'All' || p.category.toLowerCase().contains(selectedCategory.toLowerCase().replaceAll('s', ''));
                }).toList();

                if (filteredProducts.isEmpty) {
                  return const Center(child: Text("NO PRODUCTS IN THIS CATEGORY"));
                }

                return GridView.builder(
                  padding: const EdgeInsets.all(20),
                  itemCount: filteredProducts.length,
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    childAspectRatio: 0.65,
                    crossAxisSpacing: 16,
                    mainAxisSpacing: 16,
                  ),
                  itemBuilder: (context, index) {
                    return _buildIndustrialProductCard(theme, filteredProducts[index]);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryFilter(ThemeData theme) {
    return Container(
      height: 60,
      padding: const EdgeInsets.symmetric(vertical: 10),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: categories.length,
        itemBuilder: (context, index) {
          final category = categories[index];
          final isSelected = selectedCategory == category;
          return Padding(
            padding: const EdgeInsets.only(right: 12),
            child: GestureDetector(
              onTap: () => setState(() => selectedCategory = category),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                decoration: BoxDecoration(
                  color: isSelected ? AppTheme.primaryColor : AppTheme.surfaceContainerHigh.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Center(
                  child: Text(
                    category.toUpperCase(),
                    style: theme.textTheme.labelSmall?.copyWith(
                      color: isSelected ? Colors.white : AppTheme.onSurfaceVariant,
                      fontWeight: isSelected ? FontWeight.w900 : FontWeight.normal,
                    ),
                  ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildIndustrialProductCard(ThemeData theme, Product product) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(context, AppRouteNames.productDetail, arguments: product),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: AppTheme.ambientShadow,
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Stack(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: AppTheme.surfaceContainerHigh.withOpacity(0.3),
                      borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                    ),
                    width: double.infinity,
                    child: Center(
                      child: Hero(
                        tag: 'product_${product.id}',
                        child: const Icon(Icons.shopping_bag_outlined, size: 40, color: Colors.grey),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          CircleAvatar(radius: 3, backgroundColor: product.stockQuantity > 5 ? const Color(0xFF006B5F) : Colors.orange),
                          const SizedBox(width: 4),
                          Text(
                            product.stockQuantity > 5 ? "IN STOCK" : "LOW STOCK",
                            style: TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: product.stockQuantity > 5 ? const Color(0xFF006B5F) : Colors.orange),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.category.toUpperCase(), style: const TextStyle(color: Colors.grey, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 1)),
                  const SizedBox(height: 4),
                  Text(product.name, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      Text("₹${product.price.toStringAsFixed(0)}", style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16, color: AppTheme.primaryColor)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 36,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: const Color(0xFF006B5F),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Center(child: Text("Add to Cart", style: TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold))),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
