import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  XCircle,
  CheckCircle,
  TrendingUp,
  Download,
  History,
  MapPin,
  Edit3,
  Trash2,
  PackagePlus,
  RotateCcw,
  BookOpen,
  Filter,
  DollarSign,
  Layers,
  Sparkles,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Book, BookCategory, StockMutation, InventoryStats } from '../types';
import { formatRupiah, calculateInventoryStats } from '../utils/inventory';

interface WarehouseDashboardProps {
  books: Book[];
  mutations: StockMutation[];
  onAddBook: (newBook: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount'>) => void;
  onRestockBook: (bookId: string, amount: number, notes: string, operator: string) => void;
  onAdjustStock: (bookId: string, newStock: number, reason: string, operator: string) => void;
  onDeleteBook: (bookId: string) => void;
}

export const WarehouseDashboard: React.FC<WarehouseDashboardProps> = ({
  books,
  mutations,
  onAddBook,
  onRestockBook,
  onAdjustStock,
  onDeleteBook,
}) => {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'low' | 'out'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMutationsModalOpen, setIsMutationsModalOpen] = useState(false);
  const [activeRestockBook, setActiveRestockBook] = useState<Book | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);
  const [restockNotes, setRestockNotes] = useState('Penerimaan batch distributor penerbit');
  const [restockOperator, setRestockOperator] = useState('Admin Gudang Utama');

  // Stock Opname modal state
  const [activeAdjustBook, setActiveAdjustBook] = useState<Book | null>(null);
  const [adjustNewStock, setAdjustNewStock] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Koreksi hasil stock opname fisik mingguan');

  // New Book form state
  const [newBookForm, setNewBookForm] = useState({
    title: '',
    author: '',
    publisher: 'PT Pramu Jaya Persada',
    isbn: '',
    category: 'Teknologi & Koding' as BookCategory,
    price: 125000,
    stock: 20,
    minStockAlert: 5,
    warehouseLocation: 'Gudang Montong Tuban - Rak M-01 (Lt. 1)',
    description: '',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    pages: 320,
    weightGrams: 350,
    publishedYear: 2026,
    language: 'Bahasa Indonesia',
    featured: false,
  });

  const stats: InventoryStats = calculateInventoryStats(books);

  // Generate random ISBN
  const handleAutoISBN = () => {
    const p1 = Math.floor(100 + Math.random() * 900);
    const p2 = Math.floor(10 + Math.random() * 90);
    const p3 = Math.floor(1000 + Math.random() * 9000);
    const p4 = Math.floor(1 + Math.random() * 9);
    setNewBookForm({ ...newBookForm, isbn: `978-${p1}-${p2}-${p3}-${p4}` });
  };

  const handleCreateBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookForm.title.trim() || !newBookForm.author.trim()) return;

    onAddBook({
      ...newBookForm,
      isbn: newBookForm.isbn || `978-602-${Math.floor(100000 + Math.random() * 900000)}-0`,
      price: Number(newBookForm.price),
      stock: Number(newBookForm.stock),
      minStockAlert: Number(newBookForm.minStockAlert),
      pages: Number(newBookForm.pages),
      weightGrams: Number(newBookForm.weightGrams),
      publishedYear: Number(newBookForm.publishedYear),
    });

    setIsAddModalOpen(false);
    // Reset form
    setNewBookForm({
      title: '',
      author: '',
      publisher: 'PT Pramu Jaya Persada',
      isbn: '',
      category: 'Teknologi & Koding',
      price: 125000,
      stock: 20,
      minStockAlert: 5,
      warehouseLocation: 'Gudang Montong Tuban - Rak M-01 (Lt. 1)',
      description: '',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      pages: 320,
      weightGrams: 350,
      publishedYear: 2026,
      language: 'Bahasa Indonesia',
      featured: false,
    });
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRestockBook) return;
    onRestockBook(activeRestockBook.id, Number(restockAmount), restockNotes, restockOperator);
    setActiveRestockBook(null);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAdjustBook) return;
    onAdjustStock(activeAdjustBook.id, Number(adjustNewStock), adjustReason, restockOperator);
    setActiveAdjustBook(null);
  };

  // Export inventory to JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(books, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `laporan-inventaris-pramu-jaya-persada-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filter books list
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.warehouseLocation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesWarehouse =
      selectedWarehouse === 'all' ||
      (selectedWarehouse === 'montong' &&
        (book.warehouseLocation.toLowerCase().includes('montong') ||
          book.warehouseLocation.toLowerCase().includes('tuban'))) ||
      (selectedWarehouse === 'pusat' && book.warehouseLocation.toLowerCase().includes('pusat'));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'safe'
        ? book.stock > book.minStockAlert
        : statusFilter === 'low'
        ? book.stock > 0 && book.stock <= book.minStockAlert
        : book.stock === 0;

    return matchesSearch && matchesWarehouse && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4 relative z-10">
          <img
            src="/assets/aistudio/MONTONG_-_TUBAN_f63dc21c.png"
            alt="Logo PT Pramu Jaya Persada Montong Tuban"
            className="w-16 h-16 object-contain rounded-2xl bg-white p-1.5 border border-slate-700 shadow-md shrink-0 hidden sm:block"
          />
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
              <Boxes className="w-3.5 h-3.5" />
              <span>PT Pramu Jaya Persada · Montong, Tuban 62357</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Manajemen Stok & Rak Gudang Real-Time
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              Hub Pergudangan: Dsn. Beyan, Ds. Sumurgung RT 06 / RW 02, Kec. Montong, Kab. Tuban 62357. Penjualan toko langsung memotong stok di rak, dan setiap penambahan restock dicatat otomatis.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={() => setIsMutationsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>Audit Mutasi ({mutations.length})</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Data</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Buku Baru</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Titles */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Total Judul Buku</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalTitles}</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Judul terdaftar</span>
        </div>

        {/* Total Physical Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Unit Fisik di Gudang</span>
            <Boxes className="w-4 h-4 text-sky-600" />
          </div>
          <span className="text-2xl font-extrabold text-slate-900">{stats.totalPhysicalStock}</span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Eksemplar fisik</span>
        </div>

        {/* Total Asset Value */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Nilai Aset Stok</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-700">
            {formatRupiah(stats.totalAssetValue)}
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">Valuasi inventaris</span>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Stok Kritis (≤ Min)</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-2xl font-extrabold text-amber-600">{stats.lowStockCount}</span>
          <span className="block text-[11px] text-amber-700/80 mt-0.5 font-medium">Perlu restock segera</span>
        </div>

        {/* Out of Stock */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Stok Kosong</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-extrabold text-rose-600">{stats.outOfStockCount}</span>
          <span className="block text-[11px] text-rose-700/80 mt-0.5 font-medium">0 Unit di rak</span>
        </div>
      </div>

      {/* Mutation Ticker Highlight (Real-time Audit Preview) */}
      {mutations.length > 0 && (
        <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3 sm:px-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-bold text-[10px] shrink-0">
              Mutasi Terakhir
            </span>
            <span className="font-semibold text-slate-900 truncate">
              {mutations[0].notes}
            </span>
            <span
              className={`font-mono-code font-bold text-[11px] px-1.5 py-0.5 rounded ${
                mutations[0].changeAmount > 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {mutations[0].changeAmount > 0 ? `+${mutations[0].changeAmount}` : mutations[0].changeAmount} Unit
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsMutationsModalOpen(true)}
            className="text-indigo-700 font-bold hover:underline shrink-0 ml-3 cursor-pointer text-[11px]"
          >
            Lihat Semua
          </button>
        </div>
      )}

      {/* Filter and Search Bar for Table */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari judul, ISBN, kode rak..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
            >
              <option value="all">Semua Lokasi Gudang</option>
              <option value="montong">Gudang Montong (Tuban)</option>
              <option value="pusat">Gudang Distribusi Jawa Timur</option>
            </select>

            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('safe')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === 'safe' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Aman
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('low')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === 'low' ? 'bg-amber-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Kritis
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('out')}
                className={`px-2.5 py-1.5 rounded-lg font-medium cursor-pointer transition-colors ${
                  statusFilter === 'out' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-slate-600'
                }`}
              >
                Kosong
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Real-Time Inventory Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Buku & ISBN</th>
                <th className="py-3.5 px-3">Kategori</th>
                <th className="py-3.5 px-3">Lokasi Rak Gudang</th>
                <th className="py-3.5 px-3 text-right">Harga Satuan</th>
                <th className="py-3.5 px-4 text-center">Stok Real-Time</th>
                <th className="py-3.5 px-4 text-right">Aksi Gudang</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data buku di gudang sesuai kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const isOut = book.stock === 0;
                  const isLow = book.stock > 0 && book.stock <= book.minStockAlert;

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Book title, author, cover, ISBN */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-10 h-14 object-cover rounded-lg bg-slate-100 shrink-0 border border-slate-200"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 block truncate max-w-xs sm:max-w-md">
                              {book.title}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {book.author} · {book.publisher}
                            </span>
                            <span className="font-mono-code text-[10px] text-slate-400 block mt-0.5">
                              ISBN: {book.isbn}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold">
                          {book.category}
                        </span>
                      </td>

                      {/* Warehouse Shelf */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span className="font-mono-code text-[11px] font-medium">
                            {book.warehouseLocation}
                          </span>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-slate-900 block">
                          {formatRupiah(book.price)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Nilai: {formatRupiah(book.price * book.stock)}
                        </span>
                      </td>

                      {/* Real-time stock status */}
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              isOut
                                ? 'bg-rose-100 text-rose-800'
                                : isLow
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {book.stock} Unit
                          </span>
                          <span className="text-[10px] text-slate-400 mt-0.5">
                            Min: {book.minStockAlert}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Restock Dialog */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveRestockBook(book);
                              setRestockAmount(20);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                            title="Tambah stok buku dari supplier/penerbit"
                          >
                            <PackagePlus className="w-3.5 h-3.5" />
                            <span>Restock</span>
                          </button>

                          {/* Stock Opname / Adjust */}
                          <button
                            type="button"
                            onClick={() => {
                              setActiveAdjustBook(book);
                              setAdjustNewStock(book.stock);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Koreksi Stock Opname"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Book */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus buku "${book.title}" dari inventaris gudang?`)) {
                                onDeleteBook(book.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Hapus buku"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: Tambah Buku Baru ke Gudang */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-6">
            <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Tambah Judul Buku Baru ke Gudang
                </h3>
                <p className="text-xs text-slate-500">
                  Registrasi buku ke sistem inventaris dan tetapkan lokasi penyimpanan rak.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBook} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Judul Buku *</label>
                <input
                  type="text"
                  required
                  placeholder="cth: Pengantar Algoritma & Struktur Data"
                  value={newBookForm.title}
                  onChange={(e) => setNewBookForm({ ...newBookForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Penulis *</label>
                  <input
                    type="text"
                    required
                    placeholder="cth: Dr. Rian Pratama"
                    value={newBookForm.author}
                    onChange={(e) => setNewBookForm({ ...newBookForm, author: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Penerbit</label>
                  <input
                    type="text"
                    value={newBookForm.publisher}
                    onChange={(e) => setNewBookForm({ ...newBookForm, publisher: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Kategori</label>
                  <select
                    value={newBookForm.category}
                    onChange={(e) => setNewBookForm({ ...newBookForm, category: e.target.value as BookCategory })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  >
                    <option value="Teknologi & Koding">Teknologi & Koding</option>
                    <option value="Bisnis & Finansial">Bisnis & Finansial</option>
                    <option value="Fiksi & Sastra">Fiksi & Sastra</option>
                    <option value="Sains & Filsafat">Sains & Filsafat</option>
                    <option value="Pengembangan Diri">Pengembangan Diri</option>
                    <option value="Edukasi & Anak">Edukasi & Anak</option>
                  </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-700 font-semibold">ISBN</label>
                    <button
                      type="button"
                      onClick={handleAutoISBN}
                      className="text-[10px] text-indigo-600 font-bold hover:underline"
                    >
                      Buat Otomatis
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="978-602-..."
                    value={newBookForm.isbn}
                    onChange={(e) => setNewBookForm({ ...newBookForm, isbn: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono-code focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={newBookForm.price}
                    onChange={(e) => setNewBookForm({ ...newBookForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stok Awal *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newBookForm.stock}
                    onChange={(e) => setNewBookForm({ ...newBookForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Min. Alert</label>
                  <input
                    type="number"
                    min={1}
                    value={newBookForm.minStockAlert}
                    onChange={(e) => setNewBookForm({ ...newBookForm, minStockAlert: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Lokasi Rak Gudang Fisik *
                </label>
                <input
                  type="text"
                  required
                  placeholder="cth: Gudang Pusat Jakarta - Rak T-05 (Lt. 2)"
                  value={newBookForm.warehouseLocation}
                  onChange={(e) => setNewBookForm({ ...newBookForm, warehouseLocation: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Deskripsi / Sinopsis Singkat
                </label>
                <textarea
                  rows={2}
                  placeholder="Ringkasan isi buku dan pembahasan utama..."
                  value={newBookForm.description}
                  onChange={(e) => setNewBookForm({ ...newBookForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 cursor-pointer shadow-sm"
                >
                  Simpan Buku ke Gudang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Restock Buku */}
      {activeRestockBook && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Restock Masuk ke Gudang</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveRestockBook(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{activeRestockBook.title}</p>
              <p className="text-slate-500 text-[11px]">
                Stok saat ini:{' '}
                <span className="font-bold text-indigo-700">{activeRestockBook.stock} unit</span> · Rak:{' '}
                {activeRestockBook.warehouseLocation}
              </p>
            </div>

            <form onSubmit={handleConfirmRestock} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Jumlah Penambahan Unit *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-base text-indigo-700 focus:bg-white"
                />
                <div className="flex gap-2 mt-2">
                  {[10, 25, 50, 100].map((qty) => (
                    <button
                      key={qty}
                      type="button"
                      onClick={() => setRestockAmount(qty)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold"
                    >
                      +{qty}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Catatan / Nomor PO / Sumber Distributor
                </label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Petugas Penerima</label>
                <input
                  type="text"
                  value={restockOperator}
                  onChange={(e) => setRestockOperator(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveRestockBook(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 shadow-sm"
                >
                  Konfirmasi Restock (+{restockAmount} Unit)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Stock Opname Adjustment */}
      {activeAdjustBook && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Koreksi Stok Fisik (Stock Opname)</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveAdjustBook(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl mb-4 border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">{activeAdjustBook.title}</p>
              <p className="text-slate-500 text-[11px]">
                Stok tercatat di sistem: <span className="font-bold">{activeAdjustBook.stock} unit</span>
              </p>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Stok Fisik Aktual Hasil Hitung Rak *
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={adjustNewStock}
                  onChange={(e) => setAdjustNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-base text-slate-900 focus:bg-white"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Perubahan selisih: {adjustNewStock - activeAdjustBook.stock} unit
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Alasan Penyesuaian *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveAdjustBook(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 shadow-sm"
                >
                  Simpan Penyesuaian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER / MODAL: Riwayat Mutasi Stok Real-Time */}
      {isMutationsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        >
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <div>
                  <h3 className="font-bold text-sm">Audit Trail Mutasi Stok Gudang</h3>
                  <p className="text-[11px] text-slate-400">
                    Log pergerakan inventaris real-time (Penjualan, Restock, Opname)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMutationsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto space-y-3">
              {mutations.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  Belum ada log mutasi stok yang tercatat pada sesi ini.
                </div>
              ) : (
                mutations.map((mut) => (
                  <div
                    key={mut.id}
                    className="p-3 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                            mut.type === 'sale'
                              ? 'bg-rose-100 text-rose-800'
                              : mut.type === 'restock'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {mut.type === 'sale'
                            ? 'Penjualan'
                            : mut.type === 'restock'
                            ? 'Restock Masuk'
                            : 'Koreksi Opname'}
                        </span>
                        <span className="font-mono-code text-[11px] text-slate-400">
                          {mut.referenceId}
                        </span>
                      </div>
                      <p className="font-bold text-slate-900">{mut.bookTitle}</p>
                      <p className="text-slate-600 text-[11px]">{mut.notes}</p>
                      <p className="text-[10px] text-slate-400">
                        Oleh: {mut.operator} · {new Date(mut.timestamp).toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-base font-extrabold block ${
                          mut.changeAmount > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {mut.changeAmount > 0 ? `+${mut.changeAmount}` : mut.changeAmount}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {mut.previousStock} → {mut.newStock} unit
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsMutationsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold text-xs cursor-pointer"
              >
                Tutup Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
