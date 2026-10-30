import React from 'react';
import {
  AlertTriangle,
  ArrowDownLeft,
  PackageCheck,
  PackageX,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { formatCurrency, formatNumber, getStockStatus } from '../../utils/formatters';

export function LowStockView({
  lowStockItems = [],
  isLoading,
  onOpenStockAdjust,
  onRefresh,
}) {
  return (
    <div className="space-y-6">
      {/* Alert Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Low Stock & Reorder Watchlist
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                Active catalog products currently at or below their designated reorder threshold. Restock these items to maintain fulfillment operations and avoid missed sales.
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={onRefresh}
            className="self-start sm:self-auto"
          >
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Low Stock Items Table Card */}
      <Card>
        <CardHeader
          title={`Critical Inventory Alerts (${lowStockItems.length})`}
          subtitle="Ordered by lowest stock level"
        />
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/60 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Product & SKU</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Stock Level</th>
                <th className="py-3.5 px-6">Deficit to Reorder Target</th>
                <th className="py-3.5 px-6">Unit Cost / Price</th>
                <th className="py-3.5 px-6 text-right">Quick Restock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      <span>Checking stock levels...</span>
                    </div>
                  </td>
                </tr>
              ) : lowStockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                      <PackageCheck className="w-7 h-7" />
                    </div>
                    <p className="text-base font-bold text-slate-900">All inventory levels healthy!</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      None of your active products are currently at or below their reorder levels. Everything is adequately stocked.
                    </p>
                  </td>
                </tr>
              ) : (
                lowStockItems.map((p) => {
                  const status = getStockStatus(p.quantity, p.reorder_level);
                  const deficit = Math.max(0, p.reorder_level - p.quantity);
                  const percentage = Math.min(100, Math.round((p.quantity / (p.reorder_level || 1)) * 100));

                  return (
                    <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                      {/* Product */}
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 block">
                          {p.name}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {p.sku}
                        </span>
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

                      {/* Stock Level with Gauge */}
                      <td className="py-4 px-6 min-w-[160px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`font-bold ${
                              p.quantity <= 0 ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {formatNumber(p.quantity)} / {p.reorder_level} {p.unit || 'pcs'}
                          </span>
                          <Badge variant={status.variant} size="sm">
                            {status.label}
                          </Badge>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.quantity <= 0 ? 'bg-rose-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </td>

                      {/* Deficit to Reorder Target */}
                      <td className="py-4 px-6">
                        <span className="text-xs font-semibold text-slate-700">
                          Need +{deficit} {p.unit || 'pcs'}
                        </span>
                        <span className="text-[11px] text-slate-400 block">
                          to reach threshold
                        </span>
                      </td>

                      {/* Cost / Price */}
                      <td className="py-4 px-6 text-xs">
                        <span className="text-slate-800 font-medium">
                          {formatCurrency(p.price)}
                        </span>
                        <span className="text-slate-400 block text-[11px]">
                          Cost: {formatCurrency(p.cost)}
                        </span>
                      </td>

                      {/* Restock Action */}
                      <td className="py-4 px-6 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          icon={ArrowDownLeft}
                          onClick={() => onOpenStockAdjust(p, 'in')}
                        >
                          Restock
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

