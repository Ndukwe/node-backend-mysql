import React, { useState } from 'react';
import {
  Package,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { SearchInput } from '../common/SearchInput';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatNumber, getStockStatus } from '../../utils/formatters';

export function ProductsView({
  products = [],
  pagination = { page: 1, limit: 20, total: 0, totalPages: 1 },
  categories = [],
  isLoading,
  filters,
  onFilterChange,
  onPageChange,
  onOpenProductModal,
  onOpenStockAdjust,
  onOpenDeleteModal,
}) {
  const [showFilters, setShowFilters] = useState(false);

  const startIdx = ((pagination.page - 1) * pagination.limit) + 1;
  const endIdx = Math.min(pagination.total, pagination.page * pagination.limit);

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="flex-1 max-w-md">
              <SearchInput
                value={filters.search}
                onChange={(val) => onFilterChange({ ...filters, search: val, page: 1 })}
                placeholder="Search by name, SKU, description..."
              />
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={showFilters ? 'primary' : 'secondary'}
                size="sm"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
                {(filters.category_id || filters.low_stock || filters.is_active !== '') && (
                  <span className="w-2 h-2 rounded-full bg-indigo-300 ml-1" />
                )}
              </Button>

              <Button
                variant="primary"
                size="sm"
                icon={Plus}
                onClick={() => onOpenProductModal(null)}
              >
                Add Product
              </Button>
            </div>
          </div>

          {/* Filter Drawer */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
              {/* Category */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Category
                </label>
                <select
                  value={filters.category_id || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, category_id: e.target.value, page: 1 })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stock Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Stock Level
                </label>
                <select
                  value={filters.low_stock || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, low_stock: e.target.value, page: 1 })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Stock Levels</option>
                  <option value="true">Low Stock Only (&le; Reorder Level)</option>
                </select>
              </div>

              {/* Active Status */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Status
                </label>
                <select
                  value={filters.is_active ?? ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, is_active: e.target.value, page: 1 })
                  }
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active Only</option>
                  <option value="false">Inactive Only</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products Table Card */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Product & SKU</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Cost / Price</th>
                <th className="py-3.5 px-6">Stock Level</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No products found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {filters.search || filters.category_id || filters.low_stock
                        ? 'Try clearing some filters or searching for something else.'
                        : 'Get started by creating your first product.'}
                    </p>
                    {!filters.search && !filters.category_id && (
                      <Button
                        size="sm"
                        variant="primary"
                        icon={Plus}
                        onClick={() => onOpenProductModal(null)}
                        className="mt-4"
                      >
                        Create Product
                      </Button>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const stockStatus = getStockStatus(p.quantity, p.reorder_level);
                  const margin = p.price > 0 ? (((p.price - p.cost) / p.price) * 100).toFixed(0) : 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      {/* Product Name & SKU */}
                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {p.name}
                          </span>
                          <span className="font-mono text-xs text-slate-400 mt-0.5">
                            {p.sku}
                          </span>
                          {p.description && (
                            <span className="text-xs text-slate-500 line-clamp-1 mt-1">
                              {p.description}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        {p.category_name ? (
                          <Badge variant="primary" size="sm">
                            {p.category_name}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Uncategorized</span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-4 px-6">
                        <div className="text-xs">
                          <span className="font-semibold text-slate-900">
                            {formatCurrency(p.price)}
                          </span>
                          <span className="text-slate-400 block text-[11px]">
                            Cost: {formatCurrency(p.cost)} ({margin}% margin)
                          </span>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold text-sm ${
                                p.quantity <= 0
                                  ? 'text-rose-600'
                                  : p.quantity <= p.reorder_level
                                  ? 'text-amber-600'
                                  : 'text-slate-900'
                              }`}
                            >
                              {formatNumber(p.quantity)} {p.unit || 'pcs'}
                            </span>
                            <Badge
                              variant={stockStatus.variant}
                              size="sm"
                              className="font-normal"
                            >
                              {stockStatus.label}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            Reorder level: {p.reorder_level} {p.unit || 'pcs'}
                          </p>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {p.is_active ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-medium">
                            <XCircle className="w-3.5 h-3.5 text-slate-400" /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenStockAdjust(p, 'in')}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            title="Adjust Stock"
                          >
                            <ArrowUpDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenProductModal(p)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onOpenDeleteModal(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{startIdx}</span> to{' '}
              <span className="font-semibold text-slate-700">{endIdx}</span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.total}</span> products
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

