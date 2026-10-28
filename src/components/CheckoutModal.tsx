import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  QrCode,
  Wallet,
  CheckCircle2,
  Copy,
  Check,
  ShieldCheck,
  Lock,
  Clock,
  ArrowRight,
  AlertTriangle,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import {
  CartItem,
  CourierOption,
  CustomerDetails,
  PaymentChannel,
  Order,
  Book,
} from '../types';
import { PAYMENT_METHODS, COURIER_OPTIONS } from '../data/initialBooks';
import { QRCodeSvg } from './QRCodeSvg';
import {
  calculateOrderTotal,
  formatRupiah,
  generateInvoiceNumber,
  generateVirtualAccountNumber,
  validateStockAvailability,
} from '../utils/inventory';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  allBooks: Book[];
  promoCode: string;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  allBooks,
  promoCode,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  // Form states
  const [customer, setCustomer] = useState<CustomerDetails>({
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    phone: '081234567890',
    address: 'Dsn. Beyan, Ds. Sumurgung RT 06 / RW 02, Kec. Montong',
    city: 'Kab. Tuban',
    postalCode: '62357',
    notes: 'Mohon kemas dengan bubble wrap tebal',
  });

  const [selectedCourier, setSelectedCourier] = useState<CourierOption>(COURIER_OPTIONS[0]);
  const [selectedPaymentChannel, setSelectedPaymentChannel] = useState<PaymentChannel>('qris');
  const [activeStep, setActiveStep] = useState<'details' | 'payment_process'>('details');

  // Payment process simulation state
  const [vaNumber, setVaNumber] = useState<string>('');
  const [copiedVA, setCopiedVA] = useState(false);
  const [timeLeft, setTimeLeft] = useState(899); // 14:59
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Credit card form state
  const [cardDetails, setCardDetails] = useState({
    number: '4111 2222 3333 4444',
    name: 'BUDI SANTOSO',
    expiry: '12/28',
    cvv: '889',
  });

  const selectedPaymentInfo =
    PAYMENT_METHODS.find((p) => p.id === selectedPaymentChannel) || PAYMENT_METHODS[0];

  const calculations = calculateOrderTotal(
    items,
    promoCode,
    selectedCourier.cost,
    selectedPaymentInfo?.fee || 0
  );

  // Generate VA on payment method change
  useEffect(() => {
    if (selectedPaymentChannel.startsWith('va_')) {
      setVaNumber(generateVirtualAccountNumber(selectedPaymentChannel));
    }
  }, [selectedPaymentChannel]);

  // Countdown timer for QRIS & VA
  useEffect(() => {
    if (activeStep === 'payment_process') {
      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeStep]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopyVA = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopiedVA(true);
    setTimeout(() => setCopiedVA(false), 2000);
  };

  // Validates stock and advances to payment simulation step
  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!customer.name.trim() || !customer.email.trim() || !customer.address.trim()) {
      setValidationErrors(['Mohon lengkapi seluruh formulir data pengiriman wajib.']);
      return;
    }

    const stockCheck = validateStockAvailability(items, allBooks);
    if (!stockCheck.valid) {
      setValidationErrors(stockCheck.errors);
      return;
    }

    setValidationErrors([]);
    setActiveStep('payment_process');
  };

  // Triggers instant simulated payment callback
  const handleSimulatePayment = () => {
    const stockCheck = validateStockAvailability(items, allBooks);
    if (!stockCheck.valid) {
      setValidationErrors(stockCheck.errors);
      setActiveStep('details');
      return;
    }

    setIsProcessingPayment(true);

    setTimeout(() => {
      setIsProcessingPayment(false);

      const orderNumber = generateInvoiceNumber();
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber,
        customer,
        items,
        subtotal: calculations.subtotal,
        discount: calculations.discount,
        promoCode: promoCode || undefined,
        shippingCourier: selectedCourier,
        shippingCost: calculations.shippingCost,
        paymentFee: calculations.paymentFee,
        grandTotal: calculations.grandTotal,
        paymentChannel: selectedPaymentChannel,
        paymentStatus: 'paid',
        orderStatus: 'processing',
        paymentDetails: {
          qrisString:
            selectedPaymentChannel === 'qris'
              ? `00020101021226680016ID.CO.QRIS.WWW01189360091800000000005204581253033605802ID5922PT PRAMU JAYA PERSADA6007JAKARTA62070703A016304${orderNumber.slice(-4)}`
              : undefined,
          vaNumber: selectedPaymentChannel.startsWith('va_') ? vaNumber : undefined,
          vaBank: selectedPaymentChannel.toUpperCase().replace('VA_', ''),
          cardLast4: selectedPaymentChannel === 'credit_card' ? cardDetails.number.slice(-4) : undefined,
          eWalletPhone: customer.phone,
          paidAt: new Date().toISOString(),
          transactionReference: `TRX-${Date.now().toString().slice(-8)}`,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onOrderSuccess(newOrder);
      onClose();
    }, 1000);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
    >
      <div className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 id="checkout-modal-title" className="text-base font-bold text-white leading-tight">
                Checkout & Pembayaran Aman
              </h2>
              <p className="text-[11px] text-slate-300">
                Integrasi Payment Gateway Terakreditasi BI & OJK
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir checkout"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Errors Alert */}
        {validationErrors.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 text-xs text-rose-800 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Periksa Ketersediaan Stok & Data Anda:</span>
            </div>
            <ul className="list-disc pl-5 space-y-0.5">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[80vh] overflow-y-auto">
          {/* Left Column: Form & Payment Channel (7 cols) */}
          <div className="lg:col-span-7 p-6 space-y-6">
            {activeStep === 'details' ? (
              <form onSubmit={handleProceedToPayment} className="space-y-6">
                {/* Step 1: Customer Data */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                      1
                    </span>
                    <span>Informasi Penerima & Alamat Pengiriman</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Nama Lengkap *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.name}
                        onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Email Konfirmasi *
                      </label>
                      <input
                        type="email"
                        required
                        value={customer.email}
                        onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Nomor WhatsApp / HP *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customer.phone}
                        onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Kota / Kabupaten *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.city}
                        onChange={(e) => setCustomer({ ...customer, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">
                        Alamat Lengkap (Jalan, No. Rumah, RT/RW, Kelurahan) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Step 2: Shipping Method */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                      2
                    </span>
                    <span>Pilihan Ekspedisi & Logistik</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {COURIER_OPTIONS.map((courier) => (
                      <label
                        key={courier.id}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                          selectedCourier.id === courier.id
                            ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/10'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="courier"
                          checked={selectedCourier.id === courier.id}
                          onChange={() => setSelectedCourier(courier)}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-slate-900">{courier.name}</span>
                            <span className="font-extrabold text-indigo-700">
                              {courier.cost === 0 ? 'GRATIS' : formatRupiah(courier.cost)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{courier.service}</p>
                          <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">
                            Estimasi: {courier.estimatedDays}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Step 3: Payment Gateway Selector */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center font-bold">
                      3
                    </span>
                    <span>Pilih Metode Pembayaran (Payment Gateway)</span>
                  </h3>

                  <div className="space-y-2">
                    {PAYMENT_METHODS.map((method) => (
                      <label
                        key={method.id}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          selectedPaymentChannel === method.id
                            ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-600/10'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="payment"
                            checked={selectedPaymentChannel === method.id}
                            onChange={() => setSelectedPaymentChannel(method.id)}
                            className="text-indigo-600"
                          />
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
                            {method.id === 'qris' ? (
                              <QrCode className="w-4 h-4 text-emerald-600" />
                            ) : method.id === 'gopay' ? (
                              <Wallet className="w-4 h-4 text-sky-600" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-indigo-600" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{method.name}</span>
                            <span className="text-[11px] text-slate-500">{method.description}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[11px] font-semibold text-slate-600">
                            {method.fee === 0 ? 'Bebas Biaya' : `+ ${formatRupiah(method.fee)}`}
                          </span>
                          <span className="block text-[10px] text-emerald-600 font-medium">Instan</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer group"
                >
                  <span>Lanjut ke Konfirmasi Pembayaran</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            ) : (
              /* Step 4: Active Payment Simulation View */
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep('details')}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Kembali Ubah Data</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>Batas Bayar: {formatTimer(timeLeft)}</span>
                  </div>
                </div>

                {/* QRIS Interactive Payment Terminal */}
                {selectedPaymentChannel === 'qris' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>QRIS Standar Bank Indonesia</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900">
                      Scan QR Code menggunakan Mobile Banking atau E-Wallet
                    </h4>

                    {/* QR Code graphic */}
                    <div className="w-52 h-52 mx-auto bg-white p-3 rounded-2xl border-2 border-dashed border-slate-300 shadow-md flex flex-col items-center justify-center relative">
                      <QRCodeSvg
                        value={`00020101021226680016ID.CO.QRIS.WWW011893600918000000000052045812530336054${calculations.grandTotal}5802ID5922PT PRAMU JAYA PERSADA6007JAKARTA`}
                        size={170}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-9 h-9 rounded-lg bg-white/95 shadow-md flex items-center justify-center border border-slate-200">
                          <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600">
                      <p className="font-semibold text-slate-900">
                        Total Tagihan: {formatRupiah(calculations.grandTotal)}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Merchant: PT Pramu Jaya Persada
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isProcessingPayment}
                      className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Memverifikasi Notifikasi Webhook QRIS...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simulasikan Scan & Pembayaran QRIS Sukses</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Virtual Account Simulator */}
                {selectedPaymentChannel.startsWith('va_') && (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                    <div className="text-center">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                        {selectedPaymentInfo.name}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">
                        Nomor Virtual Account Pembayaran
                      </h4>
                    </div>

                    <div className="bg-white p-4 rounded-2xl border border-slate-300 flex items-center justify-between shadow-2xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">
                          No. Virtual Account
                        </span>
                        <span className="font-mono-code font-extrabold text-slate-900 text-lg sm:text-xl tracking-wider">
                          {vaNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyVA}
                        className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedVA ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. VA</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-1">
                      <p className="font-semibold text-indigo-900">Petunjuk Transfer:</p>
                      <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                        {selectedPaymentInfo.instructions.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isProcessingPayment}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Menghubungi Server Bank VA...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Simulasikan Pembayaran VA Berhasil</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* E-Wallet Simulator */}
                {selectedPaymentChannel === 'gopay' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto">
                      <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Pembayaran Langsung via GoPay
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Notifikasi persetujuan pembayaran dikirimkan ke nomor WhatsApp / GoPay Anda ({customer.phone}).
                      </p>
                    </div>

                    <div className="p-3 bg-sky-50 rounded-xl border border-sky-200 text-xs text-sky-900">
                      Total Tagihan: <span className="font-bold">{formatRupiah(calculations.grandTotal)}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isProcessingPayment}
                      className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Memproses Otorisasi Saldo GoPay...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Setujui & Konfirmasi Pembayaran GoPay</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Credit Card Simulator */}
                {selectedPaymentChannel === 'credit_card' && (
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-xl space-y-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold tracking-widest text-indigo-400">PRAMU JAYA PERSADA VIP</span>
                        <Lock className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="font-mono-code text-lg sm:text-xl tracking-widest text-slate-100">
                        {cardDetails.number}
                      </div>
                      <div className="flex justify-between items-end text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Pemegang Kartu</span>
                          <span className="font-bold tracking-wider">{cardDetails.name}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Exp</span>
                          <span className="font-bold">{cardDetails.expiry}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="col-span-2">
                        <label className="block text-slate-700 font-semibold mb-1">Nomor Kartu (16 Digit)</label>
                        <input
                          type="text"
                          value={cardDetails.number}
                          onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono-code"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Berlaku Hingga</label>
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono-code text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">CVV / CVC (3 Digit)</label>
                        <input
                          type="password"
                          maxLength={3}
                          value={cardDetails.cvv}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono-code text-center"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSimulatePayment}
                      disabled={isProcessingPayment}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Otorisasi 3D Secure Bank...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          <span>Bayar Aman {formatRupiah(calculations.grandTotal)}</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Order Summary & Real-Time Stock Validation (5 cols) */}
          <div className="lg:col-span-5 bg-slate-50 p-6 border-t lg:border-t-0 lg:border-l border-slate-200 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <span>Ringkasan Buku & Tagihan</span>
              </h3>

              {/* Items preview */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1 mb-4">
                {items.map(({ book, quantity }) => (
                  <div key={book.id} className="flex items-center gap-3 bg-white p-2.5 rounded-xl border border-slate-200">
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-10 h-14 object-cover rounded-lg bg-slate-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{book.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {quantity}x @ {formatRupiah(book.price)}
                      </p>
                      <span className="text-[10px] text-indigo-600 font-mono-code truncate block">
                        {book.warehouseLocation}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 shrink-0">
                      {formatRupiah(book.price * quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Calculation rows */}
              <div className="space-y-2 text-xs border-t border-slate-200 pt-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal Pesanan</span>
                  <span className="font-semibold text-slate-800">{formatRupiah(calculations.subtotal)}</span>
                </div>

                {calculations.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Diskon Voucher ({promoCode})</span>
                    <span>-{formatRupiah(calculations.discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600">
                  <span>Ongkos Kirim ({selectedCourier.name})</span>
                  <span className="font-semibold text-slate-800">
                    {selectedCourier.cost === 0 ? 'GRATIS' : formatRupiah(selectedCourier.cost)}
                  </span>
                </div>

                {calculations.paymentFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Biaya Layanan Gateway</span>
                    <span className="font-semibold text-slate-800">{formatRupiah(calculations.paymentFee)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-300 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Total Tagihan Akhir</span>
                    <span className="text-[10px] text-emerald-600 font-medium">Sudah Termasuk PPN 11%</span>
                  </div>
                  <span className="text-xl font-extrabold text-indigo-700">
                    {formatRupiah(calculations.grandTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Security Guarantee */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                <span>Transaksi Terenkripsi SSL 256-Bit</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Stok fisik buku akan otomatis terpotong dari gudang tepat setelah pembayaran terverifikasi sukses. Faktur resmi LUNAS akan diterbitkan secara otomatis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
