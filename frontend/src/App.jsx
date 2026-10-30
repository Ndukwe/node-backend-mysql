import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/dashboard/DashboardView';
import { ProductsView } from './components/products/ProductsView';
import { StockMovementsView } from './components/stock/StockMovementsView';
import { CategoriesView } from './components/categories/CategoriesView';
import { LowStockView } from './components/dashboard/LowStockView';
import { ProductModal } from './components/products/ProductModal';
import { ProductDeleteModal } from './components/products/ProductDeleteModal';
import { StockAdjustModal } from './components/products/StockAdjustModal';
import { CategoryModal } from './components/categories/CategoryModal';
import { CategoryDeleteModal } from './components/categories/CategoryDeleteModal';
import { ToastProvider, useToast } from './context/ToastContext';
import { api } from './api/client';

function MainApp() {
  const toast = useToast();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Backend connection status
  const [isApiConnected, setIsApiConnected] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Common shared data
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [lowStockItems, setLowStockItems] = useState([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [productPagination, setProductPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [productFilters, setProductFilters] = useState({
    search: '',
    category_id: '',
    low_stock: '',
    is_active: '',
    page: 1,
    limit: 10,
  });
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Stock movements state
  const [movements, setMovements] = useState([]);
  const [movementPagination, setMovementPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 1,
  });
  const [movementFilters, setMovementFilters] = useState({
    product_id: '',
    type: '',
    page: 1,
    limit: 15,
  });
  const [isLoadingMovements, setIsLoadingMovements] = useState(false);

  // Modals state
  const [productModal, setProductModal] = useState({ isOpen: false, product: null });
  const [productDeleteModal, setProductDeleteModal] = useState({ isOpen: false, product: null });
  const [stockAdjustModal, setStockAdjustModal] = useState({ isOpen: false, product: null, defaultType: 'in' });
  const [categoryModal, setCategoryModal] = useState({ isOpen: false, category: null });
  const [categoryDeleteModal, setCategoryDeleteModal] = useState({ isOpen: false, category: null });

  // 1. Health & initial check
  const checkHealth = useCallback(async () => {
    try {
      await api.checkHealth();
      setIsApiConnected(true);
    } catch {
      setIsApiConnected(false);
    }
  }, []);

  // 2. Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.getCategories();
      if (res.success && res.data) {
        setCategories(res.data);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  // 3. Fetch inventory summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await api.getInventorySummary();
      if (res.success && res.data) {
        setSummary(res.data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  }, []);

  // 4. Fetch low-stock items
  const fetchLowStock = useCallback(async () => {
    try {
      const res = await api.getLowStockProducts();
      if (res.success && res.data) {
        setLowStockItems(res.data);
      }
    } catch (err) {
      console.error('Error fetching low stock:', err);
    }
  }, []);

  // 5. Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoadingProducts(true);
      const res = await api.getProducts(productFilters);
      if (res.success && res.data) {
        setProducts(res.data);
        if (res.pagination) {
          setProductPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  }, [productFilters]);

  // 6. Fetch movements
  const fetchMovements = useCallback(async () => {
    try {
      setIsLoadingMovements(true);
      const res = await api.getStockMovements(movementFilters);
      if (res.success && res.data) {
        setMovements(res.data);
        if (res.pagination) {
          setMovementPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setIsLoadingMovements(false);
    }
  }, [movementFilters]);

  // Master refresh function
  const refreshAll = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.allSettled([
      checkHealth(),
      fetchSummary(),
      fetchLowStock(),
      fetchCategories(),
      fetchProducts(),
      fetchMovements(),
    ]);
    setIsRefreshing(false);
  }, [checkHealth, fetchSummary, fetchLowStock, fetchCategories, fetchProducts, fetchMovements]);

  // Initial load
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Periodic health check every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      checkHealth();
    }, 30000);
    return () => clearInterval(timer);
  }, [checkHealth]);

  // Handlers for modal triggers
  const handleOpenProductModal = (product = null) => {
    setProductModal({ isOpen: true, product });
  };

  const handleOpenDeleteProductModal = (product) => {
    setProductDeleteModal({ isOpen: true, product });
  };

  const handleOpenStockAdjust = (product = null, defaultType = 'in') => {
    setStockAdjustModal({ isOpen: true, product, defaultType });
  };

  const handleOpenCategoryModal = (category = null) => {
    setCategoryModal({ isOpen: true, category });
  };

  const handleOpenDeleteCategoryModal = (category) => {
    setCategoryDeleteModal({ isOpen: true, category });
  };

  // Filter products by category shortcut
  const handleFilterByCategory = (categoryId) => {
    setProductFilters((prev) => ({
      ...prev,
      category_id: String(categoryId),
      page: 1,
    }));
    setActiveTab('products');
  };

  // Determine page title & subtitle based on activeTab
  const pageMeta = {
    dashboard: {
      title: 'Inventory Dashboard',
      subtitle: 'Real-time overview of inventory valuation, quantities, and reorder triggers.',
    },
    products: {
      title: 'Product Catalog',
      subtitle: 'Manage products, units, price, cost margins, and active inventory items.',
    },
    stock: {
      title: 'Stock Movements & Logs',
      subtitle: 'Complete audit trail of stock in, stock out, and quantity adjustments.',
    },
    categories: {
      title: 'Product Categories',
      subtitle: 'Organize items into distinct categories for grouped stock control.',
    },
    'low-stock': {
      title: 'Low Stock Alerts',
      subtitle: 'Immediate action items for catalog products at or below replenishment level.',
    },
  }[activeTab] || { title: 'Inventory Hub', subtitle: '' };

  return (
    <Layout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      title={pageMeta.title}
      subtitle={pageMeta.subtitle}
      isApiConnected={isApiConnected}
      onRefresh={refreshAll}
      isRefreshing={isRefreshing}
      lowStockCount={summary?.low_stock_products || 0}
      onOpenNewProduct={() => handleOpenProductModal(null)}
      onOpenQuickStock={() => handleOpenStockAdjust(null, 'in')}
    >
      {/* View router */}
      {activeTab === 'dashboard' && (
        <DashboardView
          summary={summary}
          lowStockItems={lowStockItems}
          recentMovements={movements}
          categories={categories}
          onNavigate={setActiveTab}
          onOpenProductModal={handleOpenProductModal}
          onOpenStockAdjust={handleOpenStockAdjust}
          onOpenCategoryModal={handleOpenCategoryModal}
        />
      )}

      {activeTab === 'products' && (
        <ProductsView
          products={products}
          pagination={productPagination}
          categories={categories}
          isLoading={isLoadingProducts}
          filters={productFilters}
          onFilterChange={setProductFilters}
          onPageChange={(p) => setProductFilters((prev) => ({ ...prev, page: p }))}
          onOpenProductModal={handleOpenProductModal}
          onOpenStockAdjust={handleOpenStockAdjust}
          onOpenDeleteModal={handleOpenDeleteProductModal}
        />
      )}

      {activeTab === 'stock' && (
        <StockMovementsView
          movements={movements}
          pagination={movementPagination}
          products={products}
          filters={movementFilters}
          onFilterChange={setMovementFilters}
          onPageChange={(p) => setMovementFilters((prev) => ({ ...prev, page: p }))}
          onOpenStockAdjust={handleOpenStockAdjust}
          isLoading={isLoadingMovements}
        />
      )}

      {activeTab === 'categories' && (
        <CategoriesView
          categories={categories}
          isLoading={false}
          onOpenCategoryModal={handleOpenCategoryModal}
          onOpenDeleteModal={handleOpenDeleteCategoryModal}
          onFilterByCat={handleFilterByCategory}
        />
      )}

      {activeTab === 'low-stock' && (
        <LowStockView
          lowStockItems={lowStockItems}
          isLoading={false}
          onOpenStockAdjust={handleOpenStockAdjust}
          onRefresh={refreshAll}
        />
      )}

      {/* Global Modals */}
      <ProductModal
        isOpen={productModal.isOpen}
        onClose={() => setProductModal({ isOpen: false, product: null })}
        product={productModal.product}
        categories={categories}
        onSuccess={refreshAll}
      />

      <ProductDeleteModal
        isOpen={productDeleteModal.isOpen}
        onClose={() => setProductDeleteModal({ isOpen: false, product: null })}
        product={productDeleteModal.product}
        onSuccess={refreshAll}
      />

      <StockAdjustModal
        isOpen={stockAdjustModal.isOpen}
        onClose={() => setStockAdjustModal({ isOpen: false, product: null, defaultType: 'in' })}
        product={stockAdjustModal.product}
        allProducts={products}
        onSuccess={refreshAll}
      />

      <CategoryModal
        isOpen={categoryModal.isOpen}
        onClose={() => setCategoryModal({ isOpen: false, category: null })}
        category={categoryModal.category}
        onSuccess={refreshAll}
      />

      <CategoryDeleteModal
        isOpen={categoryDeleteModal.isOpen}
        onClose={() => setCategoryDeleteModal({ isOpen: false, category: null })}
        category={categoryDeleteModal.category}
        onSuccess={refreshAll}
      />
    </Layout>
  );
}

export function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}

export default App;

