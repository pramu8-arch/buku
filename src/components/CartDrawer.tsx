import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Tag,
  ArrowRight,
  AlertCircle,
  Check,
  Package,
} from 'lucide-react';
import { CartItem } from '../types';
import { formatRupiah, calculateOrderTotal } from '../utils/inventory';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (bookId: string, delta: number) => void;
  onRemoveItem: (bookId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  promoCode,
  setPromoCode,
}) => {
  if (!isOpen) return null;

  const [inputCode, setInputCode] = useState(promoCode);
  const [promoFeedback, setPromoFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const totalCalculations = calculateOrderTotal(items, promoCode, 0, 0);
  const totalWeight = items.reduce((acc, item) => acc + item.book.weightGrams * item.quantity, 0);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) {
      setPromoCode('');
      setPromoFeedback(null);
      return;
    }

    const testCalc = calculateOrderTotal(items, inputCode.trim(), 0, 0);
    if (testCalc.error) {
      setPromoFeedback({ type: 'error', message: testCalc.error });
    } else {
      setPromoCode(inputCode.trim());
      setPromoFeedback({
        type: 'success',
        message: `Voucher aktif! Hemat ${formatRupiah(testCalc.discount)}`,
      });
    }
  };

  const handleRemovePromo = () => {
    setPromoCode('');
    setInputCode('');
    setPromoFeedback(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-drawer-heading"
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200"
    >
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between border-l border-slate-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 id="cart-drawer-heading" className="text-base font-bold text-slate-900">
                Keranjang Belanja
              </h2>
              <p className="text-[11px] text-slate-500">
                {items.length} jenis buku dipilih
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={onClearCart}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
              >
                Kosongkan
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup keranjang"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Keranjang masih kosong</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Pilih buku menarik dari katalog dan tambahkan ke keranjang untuk melakukan pemesanan.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm"
              >
                Mulai Belanja Buku
              </button>
            </div>
          ) : (
            items.map(({ book, quantity }) => {
              const maxReached = quantity >= book.stock;
              return (
                <div
                  key={book.id}
                  className="p-3 bg-white rounded-2xl border border-slate-200/90 shadow-2xs flex gap-3 hover:border-slate-300 transition-all"
                >
                  <img
                    src={book.coverImage}
                    alt={book.title}
                    className="w-16 h-22 object-cover rounded-xl bg-slate-100 shrink-0 border border-slate-200"
                  />

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">
                          {book.title}
                        </h4>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(book.id)}
                          aria-label={`Hapus ${book.title} dari keranjang`}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md transition-colors cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{book.author}</p>
                      <p className="text-xs font-bold text-indigo-700 mt-1">
                        {formatRupiah(book.price)}
                      </p>
                    </div>

                    {/* Quantity controls & stock notice */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(book.id, -1)}
                          disabled={quantity <= 1}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                          aria-label="Kurangi"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(book.id, 1)}
                          disabled={maxReached}
                          className="w-6 h-6 rounded bg-white text-slate-700 flex items-center justify-center text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
                          aria-label="Tambah"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="text-[10px] font-medium text-slate-500">
                        Total: <span className="font-bold text-slate-900">{formatRupiah(book.price * quantity)}</span>
                      </span>
                    </div>

                    {maxReached && (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">
                        *Maksimal stok tercapai ({book.stock} unit)
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer: Voucher, Summary & Checkout Button */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
            {/* Voucher input */}
            <form onSubmit={handleApplyPromo} className="space-y-1">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Kode promo (cth: PUSTAKABARU)"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-xl uppercase font-mono-code focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Terapkan
                </button>
              </div>

              {promoFeedback && (
                <div
                  className={`text-[11px] flex items-center justify-between px-2.5 py-1 rounded-lg ${
                    promoFeedback.type === 'success'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  <span className="flex items-center gap-1 font-medium">
                    {promoFeedback.type === 'success' ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-3 h-3 text-rose-600" />
                    )}
                    {promoFeedback.message}
                  </span>
                  {promoCode && (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="text-[10px] font-bold underline cursor-pointer"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs pt-1 border-t border-slate-200/80">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({items.reduce((sum, i) => sum + i.quantity, 0)} buku)</span>
                <span className="font-semibold text-slate-800">{formatRupiah(totalCalculations.subtotal)}</span>
              </div>

              {totalCalculations.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Diskon Voucher ({promoCode})</span>
                  <span>-{formatRupiah(totalCalculations.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-500 text-[11px]">
                <span className="flex items-center gap-1">
                  <Package className="w-3 h-3" /> Estimasi Berat Fisik
                </span>
                <span>{(totalWeight / 1000).toFixed(2)} kg</span>
              </div>

              <div className="pt-2 border-t border-slate-300 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Total Pembayaran</span>
                  <span className="text-[10px] text-slate-500">Belum termasuk ongkir & fee</span>
                </div>
                <span className="text-lg font-extrabold text-indigo-700">
                  {formatRupiah(totalCalculations.grandTotal)}
                </span>
              </div>
            </div>

            {/* Proceed to Checkout Button */}
            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
            >
              <span>Lanjut ke Pembayaran</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
