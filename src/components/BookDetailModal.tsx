import React, { useState } from 'react';
import {
  X,
  Star,
  MapPin,
  ShoppingBag,
  Check,
  AlertTriangle,
  XCircle,
  Book,
  Calendar,
  Layers,
  Scale,
  Building,
  Hash,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import { Book as BookType } from '../types';
import { formatRupiah } from '../utils/inventory';

interface BookDetailModalProps {
  book: BookType | null;
  onClose: () => void;
  onAddToCart: (book: BookType, quantity: number) => void;
  onBuyNow: (book: BookType, quantity: number) => void;
  currentCartQuantity: number;
}

export const BookDetailModal: React.FC<BookDetailModalProps> = ({
  book,
  onClose,
  onAddToCart,
  onBuyNow,
  currentCartQuantity,
}) => {
  if (!book) return null;

  const [quantity, setQuantity] = useState(1);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const availableStock = Math.max(0, book.stock - currentCartQuantity);
  const isOutOfStock = book.stock === 0;
  const isCartFull = availableStock === 0 && !isOutOfStock;

  const handleIncrement = () => {
    if (quantity < availableStock) {
      setQuantity((q) => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleAdd = () => {
    onAddToCart(book, quantity);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleDirectBuy = () => {
    onBuyNow(book, quantity);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="book-detail-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup jendela detail buku"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center cursor-pointer transition-colors shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[85vh] overflow-y-auto">
          {/* Left Column: Image & Warehouse Shelf */}
          <div className="md:col-span-5 bg-slate-50 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div className="space-y-4">
              <div className="relative aspect-3/4 rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                {book.discountPercent && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-rose-600 text-white font-extrabold text-xs shadow-md">
                    Hemat {book.discountPercent}%
                  </span>
                )}
              </div>

              {/* Warehouse Storage Coordinates */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <MapPin className="w-4 h-4 text-indigo-600" />
                  <span>Lokasi Penyimpanan Gudang</span>
                </div>
                <p className="font-mono-code text-indigo-950 font-semibold text-[11px] bg-white px-2 py-1 rounded border border-indigo-200">
                  {book.warehouseLocation}
                </p>
                <p className="text-[10px] text-indigo-700">
                  Unit buku terverifikasi fisik di rak penyimpanan gudang pusat.
                </p>
              </div>
            </div>

            {/* Quick Rating badge */}
            <div className="mt-4 flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="font-extrabold text-slate-900 text-sm">{book.rating}</span>
                <span className="text-slate-400">/ 5.0</span>
              </div>
              <span className="text-slate-500 font-medium">{book.ratingCount} Ulasan Pembaca</span>
            </div>
          </div>

          {/* Right Column: Information, Specs, Real-Time Stock & Actions */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Category & Badge */}
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                  {book.category}
                </span>
                {book.featured && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-600" /> Pilihan Editor
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 id="book-detail-title" className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-snug">
                {book.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Karya <span className="font-semibold text-slate-800">{book.author}</span>
              </p>

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-extrabold text-indigo-700">
                  {formatRupiah(book.price)}
                </span>
                {book.originalPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatRupiah(book.originalPrice)}
                  </span>
                )}
              </div>

              {/* Real-time Stock Status Indicator */}
              <div className="mt-4 p-3.5 rounded-2xl border bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between mb-1.5 text-xs">
                  <span className="font-semibold text-slate-700">Status Stok Real-Time:</span>
                  {isOutOfStock ? (
                    <span className="font-bold text-rose-600 flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Stok Kosong
                    </span>
                  ) : book.stock <= book.minStockAlert ? (
                    <span className="font-bold text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Stok Menipis ({book.stock} Unit)
                    </span>
                  ) : (
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Tersedia ({book.stock} Unit)
                    </span>
                  )}
                </div>

                {/* Stock bar progress */}
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isOutOfStock
                        ? 'bg-rose-500 w-0'
                        : book.stock <= book.minStockAlert
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, (book.stock / 30) * 100)}%` }}
                  ></div>
                </div>

                {currentCartQuantity > 0 && (
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {currentCartQuantity} unit sudah ada di keranjang Anda. Sisa yang dapat ditambah: {availableStock} unit.
                  </p>
                )}
              </div>

              {/* Synopsis */}
              <div className="mt-5">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Sinopsis & Deskripsi
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-h-36 overflow-y-auto pr-1">
                  {book.description}
                </p>
              </div>

              {/* Book Metadata Grid */}
              <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-400 font-medium">ISBN</span>
                    <span className="font-mono-code font-bold text-slate-800 text-[11px] truncate block">
                      {book.isbn}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Building className="w-4 h-4 text-slate-400 shrink-0" />
                  <div className="truncate">
                    <span className="block text-[10px] text-slate-400 font-medium">Penerbit</span>
                    <span className="font-semibold text-slate-800 truncate block">{book.publisher}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Halaman</span>
                    <span className="font-semibold text-slate-800">{book.pages} Hal</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-400 font-medium">Berat Fisik</span>
                    <span className="font-semibold text-slate-800">{book.weightGrams} gram</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity + Cart + Buy Now */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {!isOutOfStock && !isCartFull ? (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Jumlah Pembelian:</span>
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-900 text-xs">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= availableStock}
                      className="w-7 h-7 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                      aria-label="Tambah jumlah"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isOutOfStock || isCartFull}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : isCartFull
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 cursor-not-allowed'
                      : addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border-2 border-indigo-600 text-indigo-700 hover:bg-indigo-50'
                  }`}
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Berhasil Ditambahkan!</span>
                    </>
                  ) : isOutOfStock ? (
                    <span>Stok Habis</span>
                  ) : isCartFull ? (
                    <span>Keranjang Penuh</span>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>+ Keranjang</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDirectBuy}
                  disabled={isOutOfStock || isCartFull}
                  className={`py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isOutOfStock || isCartFull
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-indigo-600/20'
                  }`}
                >
                  <span>Beli Sekarang</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
