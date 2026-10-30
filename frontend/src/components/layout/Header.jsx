import React from 'react';
import { Activity, RefreshCw, Plus, ArrowUpDown, Menu } from 'lucide-react';
import { Button } from '../common/Button';

export function Header({
  title,
  subtitle,
  isApiConnected,
  onRefresh,
  isRefreshing,
  onOpenNewProduct,
  onOpenQuickStock,
  onToggleMobileSidebar,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Titles */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5 hidden sm:block">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right: Actions & API Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* API Health Pill */}
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              isApiConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}
            title={
              isApiConnected
                ? 'Backend connected at http://localhost:3001'
                : 'Backend unreachable. Make sure node src/index.js is running.'
            }
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isApiConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              }`}
            />
            {isApiConnected ? 'API Online' : 'API Offline'}
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`}
              />
            </button>
          )}

          {/* Quick Stock Movement */}
          {onOpenQuickStock && (
            <Button
              variant="secondary"
              size="sm"
              icon={ArrowUpDown}
              onClick={onOpenQuickStock}
              className="hidden md:inline-flex"
            >
              Adjust Stock
            </Button>
          )}

          {/* New Product Button */}
          {onOpenNewProduct && (
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onOpenNewProduct}
            >
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

