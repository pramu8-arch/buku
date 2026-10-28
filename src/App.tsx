/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Book, CartItem, Order, StockMutation } from './types';
import { INITIAL_BOOKS } from './data/initialBooks';
import {
  calculateInventoryStats,
  deductStock,
  restockBook,
  adjustStock,
  filterAndSortBooks,
} from './utils/inventory';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BookCatalog } from './components/BookCatalog';
import { BookDetailModal } from './components/BookDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InvoiceModal } from './components/InvoiceModal';
import { WarehouseDashboard } from './components/WarehouseDashboard';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { Footer } from './components/Footer';

export default function App() {
  // 1. Books State with LocalStorage Persistence
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const saved = localStorage.getItem('pustakanusa_books');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load books from localStorage', e);
    }
    return INITIAL_BOOKS;
  });

  // 2. Stock Mutations Audit Trail State
  const [mutations, setMutations] = useState<StockMutation[]>(() => {
    try {
      const saved = localStorage.getItem('pustakanusa_mutations');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load mutations from localStorage', e);
    }
    // Seed initial restock mutations
    return [
      {
        id: 'mut-seed-1',
        bookId: 'book-1',
        bookTitle: 'Clean Code: Panduan Praktis Menulis Kode Perangkat Lunak',
        type: 'restock',
        changeAmount: 18,
        previousStock: 0,
        newStock: 18,
        referenceId: 'PO-2026-001',
        notes: 'Penerimaan batch buku gudang pusat Montong, Tuban',
        operator: 'Admin Logistik Montong',
        timestamp: '2026-10-20T10:00:00Z',
      },
      {
        id: 'mut-seed-2',
        bookId: 'book-3',
        bookTitle: 'Atomic Habits: Perubahan Kecil Hasil Luar Biasa',
        type: 'restock',
        changeAmount: 25,
        previousStock: 0,
        newStock: 25,
        referenceId: 'PO-2026-002',
        notes: 'Penerimaan cetakan ke-14 distributor Jawa Timur',
        operator: 'Petugas Inbound Tuban',
        timestamp: '2026-10-22T09:00:00Z',
      },
    ];
  });

  // 3. Cart State
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('pustakanusa_cart');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    return [];
  });

  // 4. Orders History State
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('pustakanusa_orders');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load orders from localStorage', e);
    }
    return [];
  });

  // View state: 'store' (Storefront) vs 'warehouse' (Warehouse Management)
  const [activeView, setActiveView] = useState<'store' | 'warehouse'>('store');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [stockFilter, setStockFilter] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  // Modals & Drawers state
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
  const [detailBook, setDetailBook] = useState<Book | null>(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState<Order | null>(null);

  // Active Promo Code (Default "PRAMUJAYA")
  const [promoCode, setPromoCode] = useState('PRAMUJAYA');

  // Notification Banner
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showNotification = (message: string) => {
    setToastNotification(message);
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Sync to LocalStorage on updates
  useEffect(() => {
    localStorage.setItem('pustakanusa_books', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('pustakanusa_mutations', JSON.stringify(mutations));
  }, [mutations]);

  useEffect(() => {
    localStorage.setItem('pustakanusa_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('pustakanusa_orders', JSON.stringify(orders));
  }, [orders]);

  // Check URL params (?view=warehouse or ?autostart=1)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('view') === 'warehouse') {
      setActiveView('warehouse');
    }
  }, []);

  // Compute live inventory statistics
  const inventoryStats = calculateInventoryStats(books);

  // Filter & sort books for catalog view
  const catalogBooks = filterAndSortBooks(
    books,
    searchQuery,
    selectedCategory,
    stockFilter,
    sortBy
  );

  // Map of cart item quantities by book ID
  const cartQuantities = cart.reduce((acc, item) => {
    acc[item.bookId] = item.quantity;
    return acc;
  }, {} as Record<string, number>);

  const cartTotalItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // CART OPERATIONS
  const handleAddToCart = (book: Book, quantity: number = 1) => {
    // Check available stock in real-time
    const currentInCart = cartQuantities[book.id] || 0;
    if (currentInCart + quantity > book.stock) {
      showNotification(`Gagal: Stok "${book.title}" hanya tersedia ${book.stock} unit.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.bookId === book.id);
      if (existing) {
        return prev.map((item) =>
          item.bookId === book.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { bookId: book.id, book, quantity }];
    });

    showNotification(`Ditambahkan: ${quantity}x "${book.title}" masuk keranjang.`);
  };

  const handleBuyNow = (book: Book, quantity: number = 1) => {
    handleAddToCart(book, quantity);
    setDetailBook(null);
    setCheckoutOpen(true);
  };

  const handleUpdateQuantity = (bookId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.bookId === bookId) {
            const currentBook = books.find((b) => b.id === bookId);
            const stockLimit = currentBook ? currentBook.stock : item.book.stock;
            const newQty = item.quantity + delta;
            if (newQty > stockLimit) {
              showNotification(`Maksimal stok tercapai (${stockLimit} unit).`);
              return item;
            }
            return { ...item, quantity: Math.max(1, newQty) };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (bookId: string) => {
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
    showNotification('Item berhasil dihapus dari keranjang.');
  };

  const handleClearCart = () => {
    setCart([]);
    showNotification('Keranjang belanja telah dikosongkan.');
  };

  // CHECKOUT & PAYMENT SUCCESS: DEDUCT REAL-TIME STOCK & GENERATE AUDIT MUTATIONS
  const handleOrderSuccess = (newOrder: Order) => {
    // Deduct stock from warehouse books state
    const { updatedBooks, mutations: newMutations } = deductStock(
      books,
      newOrder.items,
      newOrder.orderNumber,
      `Checkout: ${newOrder.customer.name}`
    );

    setBooks(updatedBooks);
    setMutations((prev) => [...newMutations, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    setCart([]); // Clear cart
    setSelectedOrderForInvoice(newOrder); // Open invoice receipt

    showNotification(
      `Pembayaran Sukses! Faktur ${newOrder.orderNumber} telah diterbitkan dan stok gudang otomatis terpotong.`
    );
  };

  // WAREHOUSE OPERATIONS
  const handleAddBook = (
    newBookData: Omit<Book, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'ratingCount'>
  ) => {
    const id = `book-${Date.now()}`;
    const newBook: Book = {
      ...newBookData,
      id,
      rating: 4.8,
      ratingCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setBooks((prev) => [newBook, ...prev]);

    // Record initial inbound mutation
    if (newBook.stock > 0) {
      const initialMutation: StockMutation = {
        id: `mut-${Date.now()}`,
        bookId: id,
        bookTitle: newBook.title,
        type: 'restock',
        changeAmount: newBook.stock,
        previousStock: 0,
        newStock: newBook.stock,
        referenceId: `INIT-${newBook.isbn.slice(-4)}`,
        notes: `Registrasi buku baru di rak ${newBook.warehouseLocation}`,
        operator: 'Admin Registrasi Gudang',
        timestamp: new Date().toISOString(),
      };
      setMutations((prev) => [initialMutation, ...prev]);
    }

    showNotification(`Buku "${newBook.title}" berhasil didaftarkan ke gudang.`);
  };

  const handleRestockBook = (
    bookId: string,
    amount: number,
    notes: string,
    operator: string
  ) => {
    const { updatedBooks, mutation } = restockBook(books, bookId, amount, notes, operator);
    setBooks(updatedBooks);
    setMutations((prev) => [mutation, ...prev]);
    showNotification(`Berhasil restock +${amount} unit ke gudang.`);
  };

  const handleAdjustStock = (
    bookId: string,
    newStock: number,
    reason: string,
    operator: string
  ) => {
    const { updatedBooks, mutation } = adjustStock(books, bookId, newStock, reason, operator);
    setBooks(updatedBooks);
    setMutations((prev) => [mutation, ...prev]);
    showNotification(`Stok opname berhasil disimpan (Stok baru: ${newStock} unit).`);
  };

  const handleDeleteBook = (bookId: string) => {
    const target = books.find((b) => b.id === bookId);
    setBooks((prev) => prev.filter((b) => b.id !== bookId));
    setCart((prev) => prev.filter((item) => item.bookId !== bookId));
    showNotification(`Buku "${target?.title || ''}" telah dihapus.`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-bottom duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{toastNotification}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        cartItemCount={cartTotalItemCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenOrderHistory={() => setOrderHistoryOpen(true)}
        orderCount={orders.length}
        inventoryStats={inventoryStats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* Content based on Active View */}
      <main className="flex-1">
        {activeView === 'store' ? (
          <>
            {/* Hero Banner with values and coupon */}
            <HeroBanner
              onSelectCategory={(cat) => {
                setSelectedCategory(cat);
                const catalogEl = document.getElementById('catalog-section');
                catalogEl?.scrollIntoView({ behavior: 'smooth' });
              }}
              onExploreCatalog={() => {
                const catalogEl = document.getElementById('catalog-section');
                catalogEl?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Catalog Grid with Real-time Stock Sync */}
            <BookCatalog
              books={catalogBooks}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              stockFilter={stockFilter}
              setStockFilter={setStockFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSelectBook={(book) => setDetailBook(book)}
              onAddToCart={(book) => handleAddToCart(book, 1)}
              onBuyNow={(book) => handleBuyNow(book, 1)}
              cartQuantities={cartQuantities}
            />
          </>
        ) : (
          /* Warehouse & Stock Management Dashboard */
          <WarehouseDashboard
            books={books}
            mutations={mutations}
            onAddBook={handleAddBook}
            onRestockBook={handleRestockBook}
            onAdjustStock={handleAdjustStock}
            onDeleteBook={handleDeleteBook}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onSwitchToWarehouse={() => setActiveView('warehouse')} />

      {/* Book Detail Modal */}
      <BookDetailModal
        book={detailBook}
        onClose={() => setDetailBook(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        currentCartQuantity={detailBook ? cartQuantities[detailBook.id] || 0 : 0}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onProceedToCheckout={() => {
          setCartOpen(false);
          setCheckoutOpen(true);
        }}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
      />

      {/* Checkout Modal & Payment Gateway Integration */}
      <CheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={cart}
        allBooks={books}
        promoCode={promoCode}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Official Invoice Modal */}
      <InvoiceModal
        order={selectedOrderForInvoice}
        onClose={() => setSelectedOrderForInvoice(null)}
      />

      {/* Order History Modal */}
      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        orders={orders}
        onSelectOrderForInvoice={(ord) => {
          setOrderHistoryOpen(false);
          setSelectedOrderForInvoice(ord);
        }}
        onExploreCatalog={() => setActiveView('store')}
      />
    </div>
  );
}
