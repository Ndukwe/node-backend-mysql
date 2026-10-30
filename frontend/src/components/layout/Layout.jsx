import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout({
  children,
  activeTab,
  onSelectTab,
  title,
  subtitle,
  isApiConnected,
  onRefresh,
  isRefreshing,
  lowStockCount,
  onOpenNewProduct,
  onOpenQuickStock,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={onSelectTab}
        lowStockCount={lowStockCount}
        isOpenMobile={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main content wrapper */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header
          title={title}
          subtitle={subtitle}
          isApiConnected={isApiConnected}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          onOpenNewProduct={onOpenNewProduct}
          onOpenQuickStock={onOpenQuickStock}
          onToggleMobileSidebar={() => setMobileSidebarOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

