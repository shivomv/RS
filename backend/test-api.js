const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(type, message) {
  const timestamp = new Date().toLocaleTimeString();
  switch (type) {
    case 'success':
      console.log(`${colors.green}✓${colors.reset} [${timestamp}] ${message}`);
      break;
    case 'error':
      console.log(`${colors.red}✗${colors.reset} [${timestamp}] ${message}`);
      break;
    case 'info':
      console.log(`${colors.blue}ℹ${colors.reset} [${timestamp}] ${message}`);
      break;
    case 'warn':
      console.log(`${colors.yellow}⚠${colors.reset} [${timestamp}] ${message}`);
      break;
    case 'header':
      console.log(`\n${colors.cyan}${colors.bright}${message}${colors.reset}`);
      break;
    default:
      console.log(message);
  }
}

function prettyPrint(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

async function testHealth() {
  log('header', '--- TEST 1: Health Check ---');
  try {
    const response = await axios.get(`${API_BASE}/../health`);
    log('success', `Health check passed`);
    log('info', `DB Status: ${response.data.dbHealth.status}`);
    return true;
  } catch (err) {
    log('error', `Health check failed: ${err.message}`);
    return false;
  }
}

async function testGetCategories() {
  log('header', '--- TEST 2: Get All Categories ---');
  try {
    const response = await axios.get(`${API_BASE}/categories`);
    const categories = response.data;
    log('success', `Retrieved ${categories.length} categories`);
    
    if (categories.length > 0) {
      log('info', 'Sample categories:');
      categories.slice(0, 3).forEach((cat, idx) => {
        console.log(`  ${idx + 1}. ${colors.bright}${cat.name}${colors.reset} (slug: ${cat.slug}, id: ${cat._id})`);
      });
    }
    
    return categories;
  } catch (err) {
    log('error', `Failed to get categories: ${err.message}`);
    return [];
  }
}

async function testGetAllProducts() {
  log('header', '--- TEST 3: Get All Products (No Filter) ---');
  try {
    const response = await axios.get(`${API_BASE}/products`);
    const products = response.data;
    log('success', `Retrieved ${products.length} products`);
    
    if (products.length > 0) {
      log('info', 'Sample products:');
      products.slice(0, 3).forEach((prod, idx) => {
        console.log(`  ${idx + 1}. ${colors.bright}${prod.name}${colors.reset} - ₹${prod.price} (category: ${prod.category})`);
      });
    }
    
    return products;
  } catch (err) {
    log('error', `Failed to get products: ${err.message}`);
    return [];
  }
}

async function testProductsBySlug(slug) {
  log('header', `--- TEST 4: Get Products by Category Slug: "${slug}" ---`);
  try {
    const response = await axios.get(`${API_BASE}/products`, {
      params: { category: slug }
    });
    const products = response.data;
    log('success', `Retrieved ${products.length} products for category "${slug}"`);
    
    if (products.length > 0) {
      log('info', 'Sample products:');
      products.slice(0, 3).forEach((prod, idx) => {
        console.log(`  ${idx + 1}. ${colors.bright}${prod.name}${colors.reset} - ₹${prod.price}`);
      });
    } else {
      log('warn', `No products found for category "${slug}"`);
    }
    
    return products;
  } catch (err) {
    log('error', `Failed to get products by slug: ${err.message}`);
    return [];
  }
}

async function testProductsById(categoryId) {
  log('header', `--- TEST 5: Get Products by Category ID: "${categoryId}" ---`);
  try {
    const response = await axios.get(`${API_BASE}/products`, {
      params: { category: categoryId }
    });
    const products = response.data;
    log('success', `Retrieved ${products.length} products for category ID "${categoryId}"`);
    
    if (products.length > 0) {
      log('info', 'Sample products:');
      products.slice(0, 3).forEach((prod, idx) => {
        console.log(`  ${idx + 1}. ${colors.bright}${prod.name}${colors.reset} - ₹${prod.price}`);
      });
    }
    
    return products;
  } catch (err) {
    log('error', `Failed to get products by ID: ${err.message}`);
    return [];
  }
}

async function testProductsBySearch(searchTerm) {
  log('header', `--- TEST 6: Search Products: "${searchTerm}" ---`);
  try {
    const response = await axios.get(`${API_BASE}/products`, {
      params: { search: searchTerm }
    });
    const products = response.data;
    log('success', `Found ${products.length} products matching "${searchTerm}"`);
    
    if (products.length > 0) {
      log('info', 'Sample results:');
      products.slice(0, 3).forEach((prod, idx) => {
        console.log(`  ${idx + 1}. ${colors.bright}${prod.name}${colors.reset} - ₹${prod.price}`);
      });
    }
    
    return products;
  } catch (err) {
    log('error', `Search failed: ${err.message}`);
    return [];
  }
}

async function testCombinedFilter(categorySlug, searchTerm) {
  log('header', `--- TEST 7: Combined Filter (Category: "${categorySlug}", Search: "${searchTerm}") ---`);
  try {
    const response = await axios.get(`${API_BASE}/products`, {
      params: { 
        category: categorySlug,
        search: searchTerm 
      }
    });
    const products = response.data;
    log('success', `Found ${products.length} products`);
    
    if (products.length > 0) {
      log('info', 'Results:');
      products.slice(0, 3).forEach((prod, idx) => {
        console.log(`  ${idx + 1}. ${colors.bright}${prod.name}${colors.reset} - ₹${prod.price}`);
      });
    }
    
    return products;
  } catch (err) {
    log('error', `Combined filter failed: ${err.message}`);
    return [];
  }
}

async function runAllTests() {
  console.clear();
  log('header', '╔═══════════════════════════════════════════════════════════════╗');
  log('header', '║           RS Industries API Test Suite                        ║');
  log('header', '╚═══════════════════════════════════════════════════════════════╝');
  
  // Test health
  const isHealthy = await testHealth();
  if (!isHealthy) {
    log('error', 'Backend is not running. Start the backend with: npm start');
    process.exit(1);
  }

  // Get categories for testing
  const categories = await testGetCategories();
  
  // Test getting all products
  await testGetAllProducts();

  // Test by category slug (if categories exist)
  if (categories.length > 0) {
    const categorySlug = categories[0].slug;
    await testProductsBySlug(categorySlug);
    
    // Test by category ID
    const categoryId = categories[0]._id;
    await testProductsById(categoryId);
    
    // Test combined filter
    await testCombinedFilter(categorySlug, 'product');
  }

  // Test search
  await testProductsBySearch('detergent');

  log('header', '╔═══════════════════════════════════════════════════════════════╗');
  log('header', '║                    All Tests Completed                        ║');
  log('header', '╚═══════════════════════════════════════════════════════════════╝');
}

// Run tests
runAllTests().catch(err => {
  log('error', `Test suite failed: ${err.message}`);
  process.exit(1);
});
