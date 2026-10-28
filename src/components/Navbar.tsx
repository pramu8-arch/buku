import React from 'react';
import { BookOpen, ShoppingBag, Boxes, Clock, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { InventoryStats } from '../types';

interface NavbarProps {
  activeView: 'store' | 'warehouse';
  setActiveView: (view: 'store' | 'warehouse') => void;
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenOrderHistory: () => void;
  orderCount: number;
  inventoryStats: InventoryStats;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  cartItemCount,
  onOpenCart,
  onOpenOrderHistory,
  orderCount,
  inventoryStats,
  searchQuery,
  setSearchQuery,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top micro bar for corporate reliability & warehouse indicator */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex justify-between items-center transition-colors">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
            Server Gudang: Online & Real-time Sync
          </span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300">
            PT Pramu Jaya Persada - Hub Distribusi & Gudang Pusat Montong, Tuban 62357
          </span>
        </div>
        <div className="flex items-center space-x-4">
          {inventoryStats.lowStockCount > 0 && (
            <button
              onClick={() => setActiveView('warehouse')}
              className="flex items-center text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
              title="Lihat buku stok menipis di gudang"
            >
              <AlertCircle className="w-3.5 h-3.5 mr-1" />
              <span>{inventoryStats.lowStockCount} Judul Stok Menipis</span>
            </button>
          )}
          <span className="text-slate-400 text-[11px] hidden md:inline">
            Hotline Tuban: (0356) 8812-345
          </span>
        </div>
      </div>

      {/* Main navigation bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('store')}
              className="flex items-center gap-3 text-left group cursor-pointer"
            >
              <img
                src="/assets/aistudio/MONTONG_-_TUBAN_f63dc21c.png"
                alt="Logo PT Pramu Jaya Persada Montong Tuban"
                className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-xs group-hover:scale-105 transition-transform"
              />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-slate-900 block leading-tight">
                  PT Pramu Jaya <span className="text-indigo-600">Persada</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 block uppercase">
                  Montong - Tuban · Warehouse & Bookstore
                </span>
              </div>
            </button>

            {/* View Switcher Pills */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl ml-4 border border-slate-200">
              <button
                type="button"
                onClick={() => setActiveView('store')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'store'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/60 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Katalog & Belanja</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveView('warehouse')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeView === 'warehouse'
                    ? 'bg-indigo-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Manajemen Gudang & Stok</span>
                <span className="ml-1 px-1.5 py-0.2 bg-indigo-500 text-white text-[10px] rounded-full">
                  Admin
                </span>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={
                  activeView === 'store'
                    ? 'Cari judul buku, penulis, atau ISBN...'
                    : 'Cari inventaris gudang atau kode rak...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  Batal
                </button>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switcher for Mobile */}
            <button
              onClick={() => setActiveView(activeView === 'store' ? 'warehouse' : 'store')}
              className="lg:hidden flex items-center gap-1 px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {activeView === 'store' ? (
                <>
                  <Boxes className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Ke Gudang</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <span className="hidden sm:inline">Ke Toko</span>
                </>
              )}
            </button>

            {/* Riwayat Pesanan */}
            <button
              type="button"
              onClick={onOpenOrderHistory}
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              title="Riwayat Pesanan & Faktur"
              aria-label="Lihat riwayat pesanan"
            >
              <Clock className="w-5 h-5 text-slate-600" />
              <span className="text-xs font-medium hidden sm:inline">Pesanan</span>
              {orderCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                  {orderCount}
                </span>
              )}
            </button>

            {/* Keranjang Belanja */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all cursor-pointer group"
              aria-label="Buka keranjang belanja"
            >
              <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Keranjang</span>
              <span
                data-testid="cart-badge-count"
                className={`min-w-5 h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center ${
                  cartItemCount > 0 ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-indigo-500 text-white'
                }`}
              >
                {cartItemCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                activeView === 'store'
                  ? 'Cari judul, penulis, ISBN...'
                  : 'Cari inventaris gudang...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>
    </header>
  );
};
