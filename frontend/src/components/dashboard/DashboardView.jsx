import React from 'react';
import {
  Package,
  AlertTriangle,
  Boxes,
  DollarSign,
  TrendingUp,
  ArrowUpDown,
  Plus,
  FolderTree,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { Card, CardHeader, CardContent } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatCurrency, formatNumber, formatDate, getStockStatus } from '../../utils/formatters';

export function DashboardView({
  summary,
  lowStockItems = [],
  recentMovements = [],
  categories = [],
  onNavigate,
  onOpenProductModal,
  onOpenStockAdjust,
  onOpenCategoryModal,
}) {
  const totalProducts = summary?.total_products || 0;
  const activeProducts = summary?.active_products || 0;
  const lowStockCount = summary?.low_stock_products || 0;
  const totalUnits = summary?.total_units || 0;
  const costValue = Number(summary?.inventory_cost_value) || 0;
  const retailValue = Number(summary?.inventory_retail_value) || 0;
  const potentialMargin = retailValue > 0 ? ((retailValue - costValue) / retailValue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Low Stock Warning Banner if any */}
      {lowStockCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500 text-white shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-950">
                {lowStockCount} product{lowStockCount > 1 ? 's' : ''} at or below reorder level!
              </p>
              <p className="text-xs text-amber-800">
                Action required to avoid stockouts. Review the low-stock watchlist to reorder units.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            className="border-amber-300 text-amber-900 hover:bg-amber-100 self-start sm:self-auto shrink-0"
            onClick={() => onNavigate('low-stock')}
          >
            View Low Stock Watchlist &rarr;
          </Button>
        </div>
      )}

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Products"
          value={formatNumber(totalProducts)}
          subtitle={`${activeProducts} active in catalog`}
          icon={Package}
          color="indigo"
        />
        <StatCard
          title="Total In-Stock Units"
          value={formatNumber(totalUnits)}
          subtitle="Sum of active inventory"
          icon={Boxes}
          color="sky"
        />
        <StatCard
          title="Inventory Cost Value"
          value={formatCurrency(costValue)}
          subtitle={`Retail Value: ${formatCurrency(retailValue)}`}
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Potential Margin"
          value={`${potentialMargin.toFixed(1)}%`}
          subtitle={`Gross profit: ${formatCurrency(retailValue - costValue)}`}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => onOpenProductModal(null)}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-indigo-400 hover:shadow-md transition-all text-left flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 block">Add Product</span>
            <span className="text-[11px] text-slate-500">New inventory item</span>
          </div>
        </button>

        <button
          onClick={() => onOpenStockAdjust(null, 'in')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-400 hover:shadow-md transition-all text-left flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 block">Stock In</span>
            <span className="text-[11px] text-slate-500">Receive purchase order</span>
          </div>
        </button>

        <button
          onClick={() => onOpenStockAdjust(null, 'out')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-rose-400 hover:shadow-md transition-all text-left flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 block">Stock Out</span>
            <span className="text-[11px] text-slate-500">Fulfill sale or write-off</span>
          </div>
        </button>

        <button
          onClick={() => onOpenCategoryModal(null)}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-400 hover:shadow-md transition-all text-left flex items-center gap-3 group"
        >
          <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-900 block">New Category</span>
            <span className="text-[11px] text-slate-500">Classification group</span>
          </div>
        </button>
      </div>

      {/* Main Grid: Low stock alerts & Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Low Stock Items */}
        <Card>
          <CardHeader
            title="Low Stock Watchlist"
            subtitle={`${lowStockItems.length} products requiring attention`}
            action={
              <button
                onClick={() => onNavigate('low-stock')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <CardContent className="p-0">
            {lowStockItems.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Package className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-900">All stocks healthy</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  No active products are currently at or below their designated reorder threshold.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {lowStockItems.slice(0, 5).map((item) => {
                  const status = getStockStatus(item.quantity, item.reorder_level);
                  return (
                    <div
                      key={item.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-slate-600">
                            {item.sku}
                          </span>
                          <span className={`w-2 h-2 rounded-full ${status.dotClass}`} />
                        </div>
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Reorder trigger: {item.reorder_level} {item.unit || 'pcs'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span
                            className={`text-sm font-bold ${
                              item.quantity <= 0 ? 'text-rose-600' : 'text-amber-600'
                            }`}
                          >
                            {item.quantity} {item.unit || 'pcs'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">Remaining</span>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onOpenStockAdjust(item, 'in')}
                          className="text-xs py-1 px-2.5"
                        >
                          + Stock In
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Stock Movements */}
        <Card>
          <CardHeader
            title="Recent Activity"
            subtitle="Latest stock entries, deductions, and reconciliations"
            action={
              <button
                onClick={() => onNavigate('stock')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                View all <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <CardContent className="p-0">
            {recentMovements.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No stock movement activity recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMovements.slice(0, 5).map((m) => {
                  const isPositive = m.movement_type === 'in' || (m.movement_type === 'adjustment' && m.quantity > 0);
                  const isOut = m.movement_type === 'out' || (m.movement_type === 'adjustment' && m.quantity < 0);

                  return (
                    <div
                      key={m.id}
                      className="px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-2 rounded-xl shrink-0 ${
                            m.movement_type === 'in'
                              ? 'bg-emerald-50 text-emerald-600'
                              : m.movement_type === 'out'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {m.movement_type === 'in' ? (
                            <ArrowDownLeft className="w-4 h-4" />
                          ) : m.movement_type === 'out' ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpDown className="w-4 h-4" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {m.product_name}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                            <span>{m.reason || 'Manual update'}</span>
                            {m.reference && (
                              <span className="font-mono bg-slate-100 px-1 rounded text-[10px]">
                                {m.reference}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-sm font-bold ${
                            isPositive
                              ? 'text-emerald-600'
                              : isOut
                              ? 'text-rose-600'
                              : 'text-slate-700'
                          }`}
                        >
                          {isPositive ? '+' : ''}
                          {m.quantity}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5 justify-end">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(m.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Category Overview */}
      {categories.length > 0 && (
        <Card>
          <CardHeader
            title="Categories Overview"
            subtitle="Products categorized across your catalog"
            action={
              <button
                onClick={() => onNavigate('categories')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Manage categories <ArrowRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-xs">
                    <span className="text-slate-500">Products</span>
                    <Badge variant="primary" size="sm">
                      {c.product_count || 0}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

