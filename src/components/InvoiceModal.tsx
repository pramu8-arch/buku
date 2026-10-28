import React from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  Download,
  Building,
  QrCode,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { Order } from '../types';
import { formatRupiah } from '../utils/inventory';

interface InvoiceModalProps {
  order: Order | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invoice-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Action Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Pembayaran Berhasil Diverifikasi!</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak Faktur</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup faktur"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
          {/* Company & Invoice Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-5 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src="/assets/aistudio/MONTONG_-_TUBAN_f63dc21c.png"
                  alt="Logo PT Pramu Jaya Persada"
                  className="w-14 h-14 object-contain rounded-xl bg-white p-1 border border-slate-200 shadow-2xs"
                />
                <div>
                  <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                    PT Pramu Jaya Persada
                  </span>
                  <span className="text-[11px] font-semibold text-indigo-700 tracking-wider block">
                    MONTONG - TUBAN
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 max-w-sm leading-relaxed">
                Dsn. Beyan, Ds. Sumurgung RT 06 / RW 02, Kec. Montong, Kab. Tuban, Jawa Timur 62357. NPWP: 01.345.678.9-082.000
              </p>
            </div>

            <div className="sm:text-right">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs tracking-wider uppercase inline-block border border-emerald-300">
                LUNAS / PAID
              </span>
              <h2 id="invoice-modal-title" className="text-sm font-bold text-slate-900 mt-2">
                FAKTUR PENJUALAN RESMI
              </h2>
              <p className="font-mono-code font-bold text-indigo-700 text-xs">
                {order.orderNumber}
              </p>
              <p className="text-[11px] text-slate-500">{formattedDate}</p>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Ditagihkan Kepada:
              </span>
              <p className="font-bold text-slate-900 text-sm">{order.customer.name}</p>
              <p className="text-slate-600 mt-0.5">{order.customer.phone}</p>
              <p className="text-slate-600">{order.customer.email}</p>
              <p className="text-slate-600 mt-1 leading-relaxed">
                {order.customer.address}, {order.customer.city} {order.customer.postalCode}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Metode Pembayaran & Logistik:
              </span>
              <p className="font-bold text-slate-900 capitalize">
                {order.paymentChannel.replace('_', ' ').toUpperCase()} Gateway
              </p>
              <p className="text-slate-600 font-mono-code text-[11px]">
                Ref TRX: {order.paymentDetails.transactionReference}
              </p>
              <div className="mt-2 pt-2 border-t border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Ekspedisi Gudang:
                </span>
                <p className="font-semibold text-slate-800">
                  {order.shippingCourier.name} ({order.shippingCourier.service})
                </p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Judul Buku & Lokasi Rak</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map(({ book, quantity }) => (
                  <tr key={book.id}>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{book.title}</p>
                      <p className="text-[10px] text-slate-500">ISBN: {book.isbn}</p>
                      <span className="text-[10px] text-indigo-600 font-mono-code">
                        Lokasi: {book.warehouseLocation}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {quantity}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-600">
                      {formatRupiah(book.price)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                      {formatRupiah(book.price * quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Calculation */}
          <div className="flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Buku:</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Diskon Promo:</span>
                  <span>-{formatRupiah(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim:</span>
                <span>{formatRupiah(order.shippingCost)}</span>
              </div>
              {order.paymentFee > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Layanan:</span>
                  <span>{formatRupiah(order.paymentFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-900 font-extrabold text-sm pt-2 border-t border-slate-300">
                <span>Total Lunas:</span>
                <span className="text-indigo-700">{formatRupiah(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Verification Seal & Footer */}
          <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-center text-slate-400 text-[10px] gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Dokumen sah digital yang diterbitkan otomatis oleh sistem PT Pramu Jaya Persada.</span>
            </div>
            <p>Terima kasih atas pembelian Anda!</p>
          </div>
        </div>

        {/* Modal Bottom Finish Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end no-print">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Selesai & Tutup Faktur
          </button>
        </div>
      </div>
    </div>
  );
};
