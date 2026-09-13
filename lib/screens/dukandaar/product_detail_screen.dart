import 'package:flutter/material.dart';
import '../../core/app_theme.dart';
import '../../models/product.dart';

class ProductDetailScreen extends StatefulWidget {
  final Product product;
  const ProductDetailScreen({super.key, required this.product});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int quantity = 1;
  String selectedVolume = '5L';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final product = widget.product;

    return Scaffold(
      backgroundColor: AppTheme.surface,
      appBar: AppBar(
        title: const Text("RS Industries", style: TextStyle(fontWeight: FontWeight.w900)),
        actions: [
          IconButton(onPressed: () {}, icon: const Icon(Icons.notifications_none)),
          const SizedBox(width: 16),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildHeroImage(),
            const SizedBox(height: 24),
            _buildBreadcrumbs(),
            const SizedBox(height: 12),
            Text(product.name, style: theme.textTheme.displayMedium?.copyWith(fontSize: 26, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            _buildSkuAndRating(product),
            const SizedBox(height: 24),
            _buildPricingSection(product),
            const SizedBox(height: 32),
            _buildVolumeSelector(),
            const SizedBox(height: 32),
            _buildQuantitySection(),
            const SizedBox(height: 40),
            _buildDescription(),
            const SizedBox(height: 40),
            _buildFrequentlyPurchased(),
            const SizedBox(height: 60),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroImage() {
    return Column(
      children: [
        Container(
          height: 300,
          width: double.infinity,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: AppTheme.ambientShadow,
          ),
          child: Stack(
            children: [
              Center(
                child: Hero(
                  tag: 'product_${widget.product.id}',
                  child: const Icon(Icons.inventory_2_outlined, size: 100, color: Colors.grey),
                ),
              ),
              Positioned(
                top: 16,
                left: 16,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: const Row(
                    children: [
                      CircleAvatar(radius: 4, backgroundColor: Color(0xFF006B5F)),
                      SizedBox(width: 6),
                      Text("IN STOCK", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF006B5F))),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            _buildThumbnail(true),
            const SizedBox(width: 12),
            _buildThumbnail(false),
          ],
        ),
      ],
    );
  }

  Widget _buildThumbnail(bool selected) {
    return Container(
      width: 60,
      height: 60,
      decoration: BoxDecoration(
        color: selected ? Colors.black87 : AppTheme.surfaceContainerHigh.withOpacity(0.5),
        borderRadius: BorderRadius.circular(8),
        border: selected ? Border.all(color: AppTheme.primaryColor, width: 2) : null,
      ),
      child: Icon(Icons.image_outlined, color: selected ? Colors.white : Colors.grey, size: 24),
    );
  }

  Widget _buildBreadcrumbs() {
    return Text(
      "CLEANING SUPPLIES  >  ${widget.product.category.toUpperCase()}",
      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1),
    );
  }

  Widget _buildSkuAndRating(Product product) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          decoration: BoxDecoration(
            color: AppTheme.surfaceContainerHigh.withOpacity(0.5),
            borderRadius: BorderRadius.circular(4),
          ),
          child: Text("SKU: RS-${product.id.substring(0, 4).toUpperCase()}", style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
        ),
        const SizedBox(width: 16),
        const Icon(Icons.star, color: Colors.amber, size: 16),
        const SizedBox(width: 4),
        const Text("4.8 (120 Reviews)", style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF006B5F))),
      ],
    );
  }

  Widget _buildPricingSection(Product product) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Text("₹${product.price.toStringAsFixed(2)}", style: const TextStyle(fontSize: 32, fontWeight: FontWeight.w900, color: AppTheme.primaryColor)),
        const SizedBox(width: 12),
        Text("₹${(product.price * 1.15).toStringAsFixed(2)}", style: const TextStyle(fontSize: 14, color: Colors.grey, decoration: TextDecoration.lineThrough)),
        const Spacer(),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFFA2FCE6).withOpacity(0.2),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: const Color(0xFF006B5F).withOpacity(0.3)),
          ),
          child: const Text("BULK PRICING TIER 1", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF006B5F))),
        ),
      ],
    );
  }

  Widget _buildVolumeSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("SELECT VOLUME", style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.grey)),
        const SizedBox(height: 12),
        Row(
          children: ['1L', '5L', '20L Drum'].map((vol) {
            final isSelected = selectedVolume == vol;
            return Padding(
              padding: const EdgeInsets.only(right: 12),
              child: GestureDetector(
                onTap: () => setState(() => selectedVolume = vol),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFFA2FCE6) : Colors.white,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: isSelected ? const Color(0xFF006B5F) : AppTheme.outlineVariant),
                  ),
                  child: Text(vol, style: TextStyle(fontWeight: FontWeight.bold, color: isSelected ? const Color(0xFF006B5F) : Colors.black87)),
                ),
              ),
            );
          }).toList(),
        ),
      ],
    );
  }

  Widget _buildQuantitySection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.surfaceContainerHigh.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("ORDER QUANTITY (CARTONS)", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
              Text("1 Carton = 4 Units", style: TextStyle(fontSize: 10, color: Colors.grey.withOpacity(0.8), fontStyle: FontStyle.italic)),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppTheme.outlineVariant),
                ),
                child: Row(
                  children: [
                    IconButton(onPressed: () => setState(() => quantity > 1 ? quantity-- : null), icon: const Icon(Icons.remove, size: 18)),
                    const SizedBox(width: 8),
                    Text("$quantity", style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 8),
                    IconButton(onPressed: () => setState(() => quantity++), icon: const Icon(Icons.add, size: 18)),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: GestureDetector(
                  onTap: () {},
                  child: Container(
                    height: 54,
                    decoration: BoxDecoration(
                      color: AppTheme.primaryColor,
                      borderRadius: BorderRadius.circular(8),
                      boxShadow: [BoxShadow(color: AppTheme.primaryColor.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4))],
                    ),
                    child: const Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.shopping_cart, color: Colors.white, size: 20),
                        SizedBox(width: 12),
                        Text("ADD TO CART", style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 1)),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          const Text("Estimated delivery: 24-48 Business Hours", style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildDescription() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("DESCRIPTION", style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
        const SizedBox(height: 12),
        Text(
          "A highly concentrated industrial-grade detergent designed for high-volume commercial kitchens. Eco-Solv features advanced surfactant technology that penetrates heavy grease and dried protein deposits while remaining pH neutral and gentle on staff skin. Biodegradable and phosphate-free.",
          style: TextStyle(height: 1.6, fontSize: 13, color: Colors.black87.withOpacity(0.7)),
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            _buildSpecCard("CONCENTRATION", "1:200 Dilution Ratio"),
            const SizedBox(width: 16),
            _buildSpecCard("ECO-RATING", "ISO 14001 Certified"),
          ],
        ),
      ],
    );
  }

  Widget _buildSpecCard(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppTheme.surfaceContainerHigh.withOpacity(0.3),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.grey)),
            const SizedBox(height: 4),
            Text(value, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ],
        ),
      ),
    );
  }

  Widget _buildFrequentlyPurchased() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text("Frequently Purchased Together", style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900)),
        const SizedBox(height: 20),
        _buildRelatedItem("HDPE Spray Bottle 1L", "₹350"),
        _buildRelatedItem("Microfiber Towel Pack (10)", "₹1,200"),
      ],
    );
  }

  Widget _buildRelatedItem(String name, String price) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: AppTheme.ambientShadow,
      ),
      child: Row(
        children: [
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: AppTheme.surfaceContainerHigh.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Icon(Icons.inventory_2_outlined, color: Colors.grey, size: 24),
          ),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
              Text(price, style: const TextStyle(color: Colors.grey, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }
}
