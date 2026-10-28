import React from 'react';
import { BookOpen, ShieldCheck, Truck, Headphones, Mail, Phone, MapPin } from 'lucide-react';

interface FooterProps {
  onSwitchToWarehouse: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onSwitchToWarehouse }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/MONTONG_-_TUBAN_f63dc21c.png"
                alt="Logo PT Pramu Jaya Persada Montong Tuban"
                className="w-12 h-12 object-contain rounded-xl bg-white p-1 border border-slate-700 shadow-xs"
              />
              <div>
                <span className="text-base font-extrabold text-white tracking-tight block">
                  PT Pramu Jaya Persada
                </span>
                <span className="text-[10px] text-indigo-400 font-semibold tracking-wider block">
                  MONTONG - TUBAN
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pusat penyimpanan, distribusi, dan penjualan buku resmi PT Pramu Jaya Persada terintegrasi sistem gudang modern. Melayani pengadaan sekolah, perpustakaan, institusi pendidikan, dan pembaca di seluruh nusantara.
            </p>
            <div className="pt-1 text-[11px] text-slate-500">
              © {new Date().getFullYear()} PT Pramu Jaya Persada. Hak Cipta Dilindungi Undang-Undang.
            </div>
          </div>

          {/* Contact & Warehouse Address */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Hub Gudang & Kantor Pusat
            </h4>
            <div className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Dsn. Beyan, Ds. Sumurgung RT 06 / RW 02, Kec. Montong, Kab. Tuban, Jawa Timur 62357
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>(0356) 8812-345 / WA: 0812-9876-5432</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>pengadaan@pramujayapersada.co.id</span>
            </div>
          </div>

          {/* Payment & Logistics Badges */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Integrasi Payment Gateway
            </h4>
            <p className="text-[11px] text-slate-400">
              Mendukung transaksi real-time terenkripsi:
            </p>
            <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-300 font-semibold">
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">QRIS Instan</span>
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">BCA VA</span>
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Mandiri Livin</span>
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">BRI BRIVA</span>
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">GoPay</span>
              <span className="px-2 py-1 bg-slate-800 rounded border border-slate-700">Visa / Mastercard</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-400" />
              <span>Ekspedisi: JNE, SiCepat, GoSend, Ambil Gudang</span>
            </div>
          </div>

          {/* Fast Portal Switcher */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Akses Portal Gudang & Admin
            </h4>
            <p className="text-slate-400 text-xs">
              Petugas logistik dan admin stok dapat langsung masuk ke dashboard inventaris fisik.
            </p>
            <button
              type="button"
              onClick={onSwitchToWarehouse}
              className="mt-2 w-full py-2.5 px-3 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer text-center block"
            >
              Masuk ke Manajemen Gudang
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
