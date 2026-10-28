import React from 'react';
import {
  X,
  Clock,
  CheckCircle2,
  Receipt,
  Package,
  MapPin,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../utils/inventory';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onSelectOrderForInvoice: (order: Order) => void;
  onExploreCatalog: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({
  isOpen,
  onClose,
  orders,
  onSelectOrderForInvoice,
  onExploreCatalog,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-history-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 id="order-history-title" className="text-base font-bold text-white">
                Riwayat Pesanan & Transaksi
              </h2>
              <p className="text-[11px] text-slate-400">
                Total {orders.length} transaksi tercatat di sistem
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup riwayat pesanan"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-4 sm:p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {orders.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Belum Ada Pesanan</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Anda belum melakukan pembelian buku. Silakan pilih buku dari katalog dan selesaikan checkout.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreCatalog();
                }}
                className="mt-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm"
              >
                Jelajahi Toko Buku
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs hover:border-slate-300 transition-all space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono-code font-extrabold text-xs text-indigo-700">
                          {order.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          LUNAS
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[10px] uppercase">
                          {order.paymentChannel.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formattedDate}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectOrderForInvoice(order)}
                      className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Buka Faktur Resmi</span>
                    </button>
                  </div>

                  {/* Order items */}
                  <div className="space-y-2">
                    {order.items.map(({ book, quantity }) => (
                      <div key={book.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-8 h-11 object-cover rounded bg-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate max-w-xs sm:max-w-md">
                              {book.title}
                            </p>
                            <span className="text-[11px] text-slate-500">
                              {quantity}x @ {formatRupiah(book.price)}
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-800 shrink-0">
                          {formatRupiah(book.price * quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Customer, Shipping and Grand Total */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Kirim ke: <strong className="text-slate-800">{order.customer.name}</strong> ({order.customer.city}) via {order.shippingCourier.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500">Total Transaksi: </span>
                      <span className="font-extrabold text-sm text-indigo-700">
                        {formatRupiah(order.grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
