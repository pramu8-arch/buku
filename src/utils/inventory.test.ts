import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateOrderTotal,
  validateStockAvailability,
  deductStock,
  restockBook,
  adjustStock,
  calculateInventoryStats,
  formatRupiah,
} from './inventory';
import { Book, CartItem } from '../types';

const mockBooks: Book[] = [
  {
    id: 'b-1',
    title: 'Clean Code',
    author: 'Uncle Bob',
    publisher: 'Tech Press',
    isbn: '978-1',
    category: 'Teknologi & Koding',
    price: 100000,
    stock: 10,
    minStockAlert: 3,
    warehouseLocation: 'Rak A-1',
    description: 'Book 1',
    coverImage: 'img1.jpg',
    pages: 400,
    weightGrams: 500,
    publishedYear: 2023,
    rating: 5,
    ratingCount: 10,
    language: 'Indonesia',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'b-2',
    title: 'Filosofi Teras',
    author: 'Henry M',
    publisher: 'Kompas',
    isbn: '978-2',
    category: 'Pengembangan Diri',
    price: 50000,
    stock: 2,
    minStockAlert: 5,
    warehouseLocation: 'Rak B-1',
    description: 'Book 2',
    coverImage: 'img2.jpg',
    pages: 300,
    weightGrams: 300,
    publishedYear: 2024,
    rating: 4.8,
    ratingCount: 20,
    language: 'Indonesia',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
  {
    id: 'b-3',
    title: 'Buku Habis',
    author: 'Penulis X',
    publisher: 'Penerbit Y',
    isbn: '978-3',
    category: 'Sains & Filsafat',
    price: 80000,
    stock: 0,
    minStockAlert: 5,
    warehouseLocation: 'Rak C-1',
    description: 'Book 3',
    coverImage: 'img3.jpg',
    pages: 200,
    weightGrams: 200,
    publishedYear: 2022,
    rating: 4,
    ratingCount: 5,
    language: 'Indonesia',
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
  },
];

test('formatRupiah formats values correctly', () => {
  assert.equal(formatRupiah(150000), 'Rp 150.000');
  assert.equal(formatRupiah(0), 'Rp 0');
});

test('calculateOrderTotal computes subtotal, discounts and grand total accurately', () => {
  const items: CartItem[] = [
    { bookId: 'b-1', book: mockBooks[0], quantity: 2 }, // 2 * 100,000 = 200,000
    { bookId: 'b-2', book: mockBooks[1], quantity: 1 }, // 1 * 50,000 = 50,000
  ];

  // Subtotal = 250,000. Apply DISKON20 (20% = 50,000, cap 75,000). Shipping = 18,000, Fee = 1,000
  const result = calculateOrderTotal(items, 'DISKON20', 18000, 1000);
  assert.equal(result.subtotal, 250000);
  assert.equal(result.discount, 50000);
  assert.equal(result.grandTotal, 250000 - 50000 + 18000 + 1000);
  assert.equal(result.appliedPromo?.code, 'DISKON20');

  // Test PRAMUJAYA promo (15% of 250,000 = 37,500)
  const pramuResult = calculateOrderTotal(items, 'PRAMUJAYA', 0, 0);
  assert.equal(pramuResult.discount, 37500);
  assert.equal(pramuResult.appliedPromo?.code, 'PRAMUJAYA');
});

test('validateStockAvailability detects out-of-stock and exceeded stock', () => {
  const validItems: CartItem[] = [
    { bookId: 'b-1', book: mockBooks[0], quantity: 5 },
  ];
  assert.equal(validateStockAvailability(validItems, mockBooks).valid, true);

  const exceededItems: CartItem[] = [
    { bookId: 'b-2', book: mockBooks[1], quantity: 5 }, // stock is only 2
  ];
  const checkExceeded = validateStockAvailability(exceededItems, mockBooks);
  assert.equal(checkExceeded.valid, false);
  assert.match(checkExceeded.errors[0], /hanya tersedia 2 buah/);

  const outOfStockItems: CartItem[] = [
    { bookId: 'b-3', book: mockBooks[2], quantity: 1 }, // stock is 0
  ];
  const checkOutOfStock = validateStockAvailability(outOfStockItems, mockBooks);
  assert.equal(checkOutOfStock.valid, false);
  assert.match(checkOutOfStock.errors[0], /telah habis/);
});

test('deductStock accurately decreases stock and creates mutation records', () => {
  const cart: CartItem[] = [
    { bookId: 'b-1', book: mockBooks[0], quantity: 3 },
  ];
  const { updatedBooks, mutations } = deductStock(mockBooks, cart, 'INV-TEST-01');

  const updatedB1 = updatedBooks.find((b) => b.id === 'b-1');
  assert.equal(updatedB1?.stock, 7);
  assert.equal(mutations.length, 1);
  assert.equal(mutations[0].changeAmount, -3);
  assert.equal(mutations[0].previousStock, 10);
  assert.equal(mutations[0].newStock, 7);
  assert.equal(mutations[0].type, 'sale');
});

test('restockBook increases stock and creates restock audit entry', () => {
  const { updatedBooks, mutation } = restockBook(mockBooks, 'b-2', 15, 'Penerimaan Pabrik');
  const updatedB2 = updatedBooks.find((b) => b.id === 'b-2');
  assert.equal(updatedB2?.stock, 17);
  assert.equal(mutation.changeAmount, 15);
  assert.equal(mutation.previousStock, 2);
  assert.equal(mutation.newStock, 17);
  assert.equal(mutation.type, 'restock');
});

test('adjustStock sets exact stock amount and logs audit adjustment', () => {
  const { updatedBooks, mutation } = adjustStock(mockBooks, 'b-1', 4, 'Stock opname fisik');
  const updatedB1 = updatedBooks.find((b) => b.id === 'b-1');
  assert.equal(updatedB1?.stock, 4);
  assert.equal(mutation.changeAmount, -6);
  assert.equal(mutation.newStock, 4);
  assert.equal(mutation.type, 'adjustment');
});

test('calculateInventoryStats computes correct totals', () => {
  const stats = calculateInventoryStats(mockBooks);
  assert.equal(stats.totalTitles, 3);
  // stock: 10 + 2 + 0 = 12
  assert.equal(stats.totalPhysicalStock, 12);
  // value: (10*100000) + (2*50000) + (0*80000) = 1,100,000
  assert.equal(stats.totalAssetValue, 1100000);
  // b-2 is 2 (min 5) -> low stock
  assert.equal(stats.lowStockCount, 1);
  // b-3 is 0 -> out of stock
  assert.equal(stats.outOfStockCount, 1);
});
