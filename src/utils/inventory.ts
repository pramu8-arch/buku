import { Book, CartItem, StockMutation, InventoryStats } from '../types';
import { PROMO_CODES } from '../data/initialBooks';

/**
 * Formats a number to Indonesian Rupiah currency string.
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return 'Rp ' + Math.round(amount).toLocaleString('id-ID');
}

/**
 * Calculates subtotal, promo discount, shipping, payment fee, and grand total.
 */
export function calculateOrderTotal(
  items: CartItem[],
  promoCode: string | null,
  shippingCost: number = 0,
  paymentFee: number = 0
): {
  subtotal: number;
  discount: number;
  shippingCost: number;
  paymentFee: number;
  grandTotal: number;
  appliedPromo?: { code: string; description: string };
  error?: string;
} {
  const subtotal = items.reduce((acc, item) => acc + item.book.price * item.quantity, 0);

  let discount = 0;
  let appliedPromo: { code: string; description: string } | undefined = undefined;
  let error: string | undefined = undefined;

  if (promoCode) {
    const normalizedCode = promoCode.trim().toUpperCase();
    const promo = PROMO_CODES[normalizedCode];

    if (promo) {
      if (subtotal >= promo.minPurchase) {
        const calculatedDiscount = (subtotal * promo.discountPercent) / 100;
        discount = Math.min(calculatedDiscount, promo.maxDiscount);
        appliedPromo = { code: normalizedCode, description: promo.description };
      } else {
        error = `Minimal belanja untuk kode ${normalizedCode} adalah ${formatRupiah(promo.minPurchase)}`;
      }
    } else {
      error = `Kode promo "${promoCode}" tidak valid`;
    }
  }

  const grandTotal = Math.max(0, subtotal - discount + shippingCost + paymentFee);

  return {
    subtotal,
    discount,
    shippingCost,
    paymentFee,
    grandTotal,
    appliedPromo,
    error,
  };
}

/**
 * Validates that all cart items do not exceed current warehouse stock.
 */
export function validateStockAvailability(
  items: CartItem[],
  books: Book[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const item of items) {
    const book = books.find((b) => b.id === item.bookId);
    if (!book) {
      errors.push(`Buku "${item.book.title}" tidak ditemukan di inventaris.`);
      continue;
    }
    if (book.stock <= 0) {
      errors.push(`Stok buku "${book.title}" telah habis.`);
    } else if (item.quantity > book.stock) {
      errors.push(
        `Buku "${book.title}" hanya tersedia ${book.stock} buah (diminta: ${item.quantity}).`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Deducts stock for each purchased book and returns updated books plus audit mutations.
 */
export function deductStock(
  books: Book[],
  items: CartItem[],
  orderId: string,
  operator: string = 'Sistem E-Commerce Checkout'
): { updatedBooks: Book[]; mutations: StockMutation[] } {
  const mutations: StockMutation[] = [];
  const updatedBooks = books.map((book) => {
    const cartItem = items.find((item) => item.bookId === book.id);
    if (!cartItem) return book;

    const previousStock = book.stock;
    const newStock = Math.max(0, previousStock - cartItem.quantity);
    const changeAmount = -(previousStock - newStock);

    mutations.push({
      id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      bookId: book.id,
      bookTitle: book.title,
      type: 'sale',
      changeAmount,
      previousStock,
      newStock,
      referenceId: orderId,
      notes: `Penjualan online Pesanan ${orderId} (${cartItem.quantity} eks)`,
      operator,
      timestamp: new Date().toISOString(),
    });

    return {
      ...book,
      stock: newStock,
      updatedAt: new Date().toISOString(),
    };
  });

  return { updatedBooks, mutations };
}

/**
 * Restocks a book by adding incoming inventory.
 */
export function restockBook(
  books: Book[],
  bookId: string,
  quantity: number,
  notes: string = 'Inbound Restock Penerbit',
  operator: string = 'Petugas Gudang'
): { updatedBooks: Book[]; mutation: StockMutation } {
  const target = books.find((b) => b.id === bookId);
  if (!target) {
    throw new Error(`Buku dengan ID ${bookId} tidak ditemukan.`);
  }

  const previousStock = target.stock;
  const newStock = previousStock + Math.max(0, quantity);

  const mutation: StockMutation = {
    id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookId,
    bookTitle: target.title,
    type: 'restock',
    changeAmount: quantity,
    previousStock,
    newStock,
    referenceId: `PO-${Date.now().toString().slice(-6)}`,
    notes: notes || 'Penerimaan stok buku baru dari percetakan/distributor',
    operator,
    timestamp: new Date().toISOString(),
  };

  const updatedBooks = books.map((b) =>
    b.id === bookId
      ? {
          ...b,
          stock: newStock,
          updatedAt: new Date().toISOString(),
        }
      : b
  );

  return { updatedBooks, mutation };
}

/**
 * Adjusts stock manually (e.g. audit opname, rusak, hilang).
 */
export function adjustStock(
  books: Book[],
  bookId: string,
  newQuantity: number,
  reason: string,
  operator: string = 'Admin Gudang'
): { updatedBooks: Book[]; mutation: StockMutation } {
  const target = books.find((b) => b.id === bookId);
  if (!target) {
    throw new Error(`Buku dengan ID ${bookId} tidak ditemukan.`);
  }

  const previousStock = target.stock;
  const safeNewStock = Math.max(0, newQuantity);
  const changeAmount = safeNewStock - previousStock;

  const mutation: StockMutation = {
    id: `mut-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    bookId,
    bookTitle: target.title,
    type: 'adjustment',
    changeAmount,
    previousStock,
    newStock: safeNewStock,
    referenceId: `ADJ-${Date.now().toString().slice(-6)}`,
    notes: reason || 'Koreksi stok / Stock opname fisik gudang',
    operator,
    timestamp: new Date().toISOString(),
  };

  const updatedBooks = books.map((b) =>
    b.id === bookId
      ? {
          ...b,
          stock: safeNewStock,
          updatedAt: new Date().toISOString(),
        }
      : b
  );

  return { updatedBooks, mutation };
}

/**
 * Computes high-level inventory statistics.
 */
export function calculateInventoryStats(books: Book[]): InventoryStats {
  let totalPhysicalStock = 0;
  let totalAssetValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  for (const book of books) {
    totalPhysicalStock += book.stock;
    totalAssetValue += book.stock * book.price;
    if (book.stock === 0) {
      outOfStockCount++;
    } else if (book.stock <= book.minStockAlert) {
      lowStockCount++;
    }
  }

  return {
    totalTitles: books.length,
    totalPhysicalStock,
    totalAssetValue,
    lowStockCount,
    outOfStockCount,
  };
}

/**
 * Generates an official invoice number.
 */
export function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `INV/${year}/${month}/PJP-${randomSuffix}`;
}

/**
 * Generates realistic Virtual Account numbers based on channel.
 */
export function generateVirtualAccountNumber(channel: string): string {
  const bankPrefix: Record<string, string> = {
    va_bca: '88001',
    va_mandiri: '89508',
    va_bri: '10294',
    va_bni: '98812',
  };
  const prefix = bankPrefix[channel] || '88000';
  const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
  return `${prefix}${randomSuffix}`;
}

/**
 * Filters and sorts books based on search, category, stock availability, and sorting criteria.
 */
export function filterAndSortBooks(
  books: Book[],
  query: string = '',
  category: string = 'Semua',
  stockFilter: string = 'all', // 'all' | 'in_stock' | 'low_stock' | 'out_of_stock'
  sortBy: string = 'featured' // 'featured' | 'price_low' | 'price_high' | 'stock_high' | 'stock_low' | 'title_asc'
): Book[] {
  let result = [...books];

  // Search filter
  if (query.trim()) {
    const q = query.toLowerCase().trim();
    result = result.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.warehouseLocation.toLowerCase().includes(q)
    );
  }

  // Category filter
  if (category && category !== 'Semua') {
    result = result.filter((b) => b.category === category);
  }

  // Stock filter
  if (stockFilter === 'in_stock') {
    result = result.filter((b) => b.stock > 0);
  } else if (stockFilter === 'low_stock') {
    result = result.filter((b) => b.stock > 0 && b.stock <= b.minStockAlert);
  } else if (stockFilter === 'out_of_stock') {
    result = result.filter((b) => b.stock === 0);
  }

  // Sorting
  result.sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'stock_high':
        return b.stock - a.stock;
      case 'stock_low':
        return a.stock - b.stock;
      case 'title_asc':
        return a.title.localeCompare(b.title);
      case 'featured':
      default:
        if (a.featured === b.featured) {
          return b.rating - a.rating;
        }
        return a.featured ? -1 : 1;
    }
  });

  return result;
}
