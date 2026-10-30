import React from 'react';
import {
  ArrowUpDown,
  ArrowDownLeft,
  ArrowUpRight,
  Sliders,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatDate, formatNumber } from '../../utils/formatters';

export function StockMovementsView({
  movements = [],
  pagination = { page: 1, limit: 20, total: 0, totalPages: 1 },
  products = [],
  filters,
  onFilterChange,
  onPageChange,
  onOpenStockAdjust,
  isLoading,
}) {
  const startIdx = ((pagination.page - 1) * pagination.limit) + 1;
  const endIdx = Math.min(pagination.total, pagination.page * pagination.limit);

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions Bar */}
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Product selector */}
              <div className="w-full sm:w-64">
                <select
                  value={filters.product_id || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, product_id: e.target.value, page: 1 })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Products</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku})
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Type */}
              <div className="w-full sm:w-48">
                <select
                  value={filters.type || ''}
                  onChange={(e) =>
                    onFilterChange({ ...filters, type: e.target.value, page: 1 })
                  }
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="">All Movement Types</option>
                  <option value="in">Stock In (+)</option>
                  <option value="out">Stock Out (-)</option>
                  <option value="adjustment">Adjustment (=)</option>
                </select>
              </div>
            </div>

            {/* Quick Action */}
            <Button
              variant="primary"
              size="sm"
              icon={ArrowUpDown}
              onClick={() => onOpenStockAdjust(null, 'in')}
              className="shrink-0"
            >
              Record Movement
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements History Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Type</th>
                <th className="py-3.5 px-6">Product</th>
                <th className="py-3.5 px-6">Quantity Change</th>
                <th className="py-3.5 px-6">Stock Level</th>
                <th className="py-3.5 px-6">Reason & Reference</th>
                <th className="py-3.5 px-6">Date & Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading movements...</span>
                    </div>
                  </td>
                </tr>
              ) : movements.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">No stock movements found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {filters.product_id || filters.type
                        ? 'Try clearing the filters above.'
                        : 'Movements are recorded when products are created or stock is adjusted.'}
                    </p>
                  </td>
                </tr>
              ) : (
                movements.map((m) => {
                  const isPositive =
                    m.movement_type === 'in' || (m.movement_type === 'adjustment' && m.quantity > 0);
                  const isNegative =
                    m.movement_type === 'out' || (m.movement_type === 'adjustment' && m.quantity < 0);

                  return (
                    <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Movement Type Badge */}
                      <td className="py-4 px-6">
                        {m.movement_type === 'in' && (
                          <Badge variant="success" size="sm">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Stock In
                          </Badge>
                        )}
                        {m.movement_type === 'out' && (
                          <Badge variant="danger" size="sm">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Stock Out
                          </Badge>
                        )}
                        {m.movement_type === 'adjustment' && (
                          <Badge variant="purple" size="sm">
                            <Sliders className="w-3.5 h-3.5" /> Adjustment
                          </Badge>
                        )}
                      </td>

                      {/* Product */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 block">
                          {m.product_name}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {m.sku}
                        </span>
                      </td>

                      {/* Quantity Delta */}
                      <td className="py-4 px-6">
                        <span
                          className={`font-bold font-mono text-sm ${
                            isPositive
                              ? 'text-emerald-600'
                              : isNegative
                              ? 'text-rose-600'
                              : 'text-slate-800'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {m.quantity}
                        </span>
                      </td>

                      {/* Stock Change (Previous -> New) */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-slate-400">{m.previous_quantity}</span>
                          <span className="text-slate-300">&rarr;</span>
                          <span className="font-semibold text-slate-800 font-mono">
                            {m.new_quantity}
                          </span>
                        </div>
                      </td>

                      {/* Reason & Reference */}
                      <td className="py-4 px-6">
                        <p className="text-xs text-slate-700 font-medium">
                          {m.reason || 'General adjustment'}
                        </p>
                        {m.reference && (
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[11px]">
                            Ref: {m.reference}
                          </span>
                        )}
                      </td>

                      {/* Timestamp */}
                      <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{formatDate(m.created_at)}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.total > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-700">{startIdx}</span> to{' '}
              <span className="font-semibold text-slate-700">{endIdx}</span> of{' '}
              <span className="font-semibold text-slate-700">{pagination.total}</span> movements
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
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
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40"
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

