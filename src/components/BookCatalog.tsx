import React from 'react';
import {
  Star,
  MapPin,
  ShoppingBag,
  Info,
  Check,
  AlertTriangle,
  XCircle,
  Sparkles,
  ArrowUpDown,
  BookOpen,
} from 'lucide-react';
import { Book, BookCategory } from '../types';
import { formatRupiah } from '../utils/inventory';

interface BookCatalogProps {
  books: Book[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  stockFilter: string;
  setStockFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  onSelectBook: (book: Book) => void;
  onAddToCart: (book: Book) => void;
  onBuyNow: (book: Book) => void;
  cartQuantities: Record<string, number>;
}

const CATEGORIES: { label: BookCategory; countFilter?: string }[] = [
  { label: 'Semua' },
  { label: 'Teknologi & Koding' },
  { label: 'Bisnis & Finansial' },
  { label: 'Fiksi & Sastra' },
  { label: 'Sains & Filsafat' },
  { label: 'Pengembangan Diri' },
  { label: 'Edukasi & Anak' },
];

export const BookCatalog: React.FC<BookCatalogProps> = ({
  books,
  selectedCategory,
  setSelectedCategory,
  stockFilter,
  setStockFilter,
  sortBy,
  setSortBy,
  onSelectBook,
  onAddToCart,
  onBuyNow,
  cartQuantities,
}) => {
  return (
    <section id="catalog-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Catalog Title & Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Koleksi Lengkap & Penyimpanan Gudang</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Katalog Buku & Inventaris Real-Time
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Menampilkan <span className="font-semibold text-slate-900">{books.length}</span> judul buku terdaftar di sistem.
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label htmlFor="sort-select" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Urutkan:</span>
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-2xs"
          >
            <option value="featured">Rekomendasi Utama</option>
            <option value="price_low">Harga: Rendah ke Tinggi</option>
            <option value="price_high">Harga: Tinggi ke Rendah</option>
            <option value="stock_high">Stok: Terbanyak</option>
            <option value="stock_low">Stok: Paling Sedikit</option>
            <option value="title_asc">Judul: A - Z</option>
          </select>
        </div>
      </div>

      {/* Filter Row: Categories + Stock Status */}
      <div className="space-y-4 mb-8">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              type="button"
              onClick={() => setSelectedCategory(cat.label)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.label
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Stock Filter Quick Chips */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium hidden sm:inline">Ketersediaan Stok:</span>
          <button
            type="button"
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
              stockFilter === 'all'
                ? 'bg-slate-900 text-white font-semibold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Status
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('in_stock')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
              stockFilter === 'in_stock'
                ? 'bg-emerald-600 text-white font-semibold'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <Check className="w-3 h-3" />
            <span>Tersedia</span>
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('low_stock')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
              stockFilter === 'low_stock'
                ? 'bg-amber-600 text-white font-semibold'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Stok Kritis (≤ 5)</span>
          </button>
          <button
            type="button"
            onClick={() => setStockFilter('out_of_stock')}
            className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1 ${
              stockFilter === 'out_of_stock'
                ? 'bg-rose-600 text-white font-semibold'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Habis di Gudang</span>
          </button>
        </div>
      </div>

      {/* Book Grid */}
      {books.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Tidak ada buku yang cocok</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian, ubah kategori, atau pilih filter ketersediaan stok yang berbeda.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Semua');
              setStockFilter('all');
            }}
            className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => {
            const inCart = cartQuantities[book.id] || 0;
            const isOutOfStock = book.stock === 0;
            const isLowStock = book.stock > 0 && book.stock <= book.minStockAlert;
            const isMaxInCart = inCart >= book.stock;

            return (
              <div
                key={book.id}
                className="group bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden"
              >
                {/* Book Cover Image & Badges */}
                <div className="relative aspect-4/5 overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onSelectBook(book)}>
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Gradient Overlay for badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start pointer-events-none">
                    <span className="px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] font-semibold text-white uppercase tracking-wider">
                      {book.category}
                    </span>
                    {book.discountPercent ? (
                      <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white font-bold text-[10px] shadow-xs">
                        -{book.discountPercent}%
                      </span>
                    ) : book.featured ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-bold text-[10px] flex items-center gap-0.5 shadow-xs">
                        <Sparkles className="w-2.5 h-2.5" /> Bestseller
                      </span>
                    ) : null}
                  </div>

                  {/* Bottom Stock Indicator inside Cover */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-white">
                    <div className="flex items-center gap-1 drop-shadow-sm">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      <span className="font-bold">{book.rating}</span>
                      <span className="text-slate-300 text-[10px]">({book.ratingCount})</span>
                    </div>

                    {/* Stock pill */}
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-700/95 font-bold text-[10px] text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-300"></span>
                        Habis di Gudang
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-600/95 font-bold text-[10px] text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping"></span>
                        Sisa {book.stock} unit
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-700/90 font-bold text-[10px] text-emerald-100 backdrop-blur-xs flex items-center gap-1 shadow-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                        Stok {book.stock} unit
                      </span>
                    )}
                  </div>
                </div>

                {/* Content details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Warehouse Rack Location */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mb-1.5">
                      <MapPin className="w-3 h-3 text-indigo-500 shrink-0" />
                      <span className="truncate font-mono-code text-[10px]">{book.warehouseLocation}</span>
                    </div>

                    {/* Book Title */}
                    <h3
                      onClick={() => onSelectBook(book)}
                      className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors cursor-pointer"
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    {/* Author & Publisher */}
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                      oleh <span className="font-medium text-slate-700">{book.author}</span>
                    </p>
                  </div>

                  {/* Pricing and Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-base font-extrabold text-indigo-700">
                        {formatRupiah(book.price)}
                      </span>
                      {book.originalPrice && (
                        <span className="text-xs text-slate-400 line-through">
                          {formatRupiah(book.originalPrice)}
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectBook(book)}
                        className="w-full py-2 px-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Detail</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart(book)}
                        disabled={isOutOfStock || isMaxInCart}
                        className={`w-full py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                          isOutOfStock
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                            : isMaxInCart
                            ? 'bg-amber-100 text-amber-800 cursor-not-allowed border border-amber-200'
                            : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white'
                        }`}
                        title={
                          isOutOfStock
                            ? 'Stok buku ini sedang habis di gudang'
                            : isMaxInCart
                            ? 'Jumlah di keranjang telah mencapai stok maksimal'
                            : 'Tambahkan ke keranjang belanja'
                        }
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>
                          {isOutOfStock
                            ? 'Habis'
                            : isMaxInCart
                            ? `Max (${inCart})`
                            : inCart > 0
                            ? `+ Keranjang (${inCart})`
                            : '+ Keranjang'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
