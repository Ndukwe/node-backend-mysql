import React from 'react';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ArrowUpDown,
  AlertTriangle,
  FolderTree,
  Server,
  Layers,
  X,
} from 'lucide-react';

export function Sidebar({
  activeTab,
  onSelectTab,
  lowStockCount = 0,
  isOpenMobile = false,
  onCloseMobile,
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'products',
      label: 'Products',
      icon: Package,
      badge: null,
    },
    {
      id: 'stock',
      label: 'Stock Movements',
      icon: ArrowUpDown,
      badge: null,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: FolderTree,
      badge: null,
    },
    {
      id: 'low-stock',
      label: 'Low Stock Alerts',
      icon: AlertTriangle,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-100 text-amber-700 font-bold',
    },
  ];

  const content = (
    <div className="h-full flex flex-col bg-slate-900 text-slate-300">
      {/* Brand Logo */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-white text-base tracking-tight leading-tight block">
              Inventory<span className="text-indigo-400">Hub</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
              MySQL & Node.js
            </span>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${
                    item.badgeColor || 'bg-slate-800 text-slate-200'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 m-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Server className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-medium text-slate-300">Backend Server</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono truncate">
          http://localhost:3001
        </div>
        <div className="mt-2 pt-2 border-t border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400">
          <span>Database</span>
          <span className="font-semibold text-slate-300">inventory_db</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 shrink-0 fixed inset-y-0 z-30">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 z-50">
            {content}
          </div>
        </div>
      )}
    </>
  );
}

