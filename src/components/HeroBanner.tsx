import React, { useState } from 'react';
import { ShieldCheck, Truck, QrCode, Tag, Sparkles, Check, ArrowRight } from 'lucide-react';

interface HeroBannerProps {
  onSelectCategory: (category: string) => void;
  onExploreCatalog: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onSelectCategory, onExploreCatalog }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-indigo-950 via-slate-900 to-slate-900 text-white pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Background glow decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Heading and Value Proposition */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>PT Pramu Jaya Persada · Gudang Distribusi Resmi & Penerbitan</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.15]">
              Penyimpanan & Penjualan Buku Terpercaya{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-300 to-amber-300">
                PT Pramu Jaya Persada
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Pusat inventaris dan distribusi buku resmi PT Pramu Jaya Persada. Dilengkapi pelacakan rak fisik gudang langsung, keranjang belanja pintar, dan payment gateway multi-channel terverifikasi instan.
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
              <button
                type="button"
                onClick={onExploreCatalog}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer group"
              >
                <span>Jelajahi Katalog Buku</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => onSelectCategory('Teknologi & Koding')}
                className="px-4 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium text-sm transition-all cursor-pointer"
              >
                Buku Teknologi & Koding
              </button>
            </div>

            {/* Promo Code Voucher Pill */}
            <div className="pt-2">
              <div className="inline-flex flex-wrap items-center gap-2 bg-slate-800/60 border border-slate-700/80 rounded-2xl p-2.5 sm:px-4 sm:py-2 text-xs">
                <Tag className="w-4 h-4 text-amber-400" />
                <span className="text-slate-300">Voucher Pengguna Baru:</span>
                <span className="font-mono-code font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  PRAMUJAYA
                </span>
                <span className="text-slate-400 hidden sm:inline">(Diskon 15%)</span>
                <button
                  type="button"
                  onClick={() => copyCoupon('PRAMUJAYA')}
                  className="ml-auto sm:ml-2 px-2.5 py-1 rounded-lg bg-indigo-600/60 hover:bg-indigo-500 text-white font-medium text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedCode === 'PUSTAKABARU' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span className="text-emerald-300">Tersalin!</span>
                    </>
                  ) : (
                    'Salin Kode'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Key Feature Highlights / Service Guarantee */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 text-sky-400 flex items-center justify-center mb-3">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Stok Gudang Terkini</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Sinkronisasi real-time antara gudang fisik dan katalog penjualan.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center mb-3">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">QRIS & Multi-VA</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Payment gateway instan dengan verifikasi otomatis detik itu juga.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">100% Buku Asli</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Garansi uang kembali penuh jika menerima buku bajakan.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 backdrop-blur-xs flex flex-col justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/20 text-purple-400 flex items-center justify-center mb-3">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-white">Faktur Resmi LUNAS</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Unduh dan cetak invoice resmi pajak untuk perusahaan/sekolah.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
