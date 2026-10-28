export type BookCategory =
  | 'Semua'
  | 'Teknologi & Koding'
  | 'Bisnis & Finansial'
  | 'Fiksi & Sastra'
  | 'Sains & Filsafat'
  | 'Pengembangan Diri'
  | 'Edukasi & Anak';

export interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string;
  isbn: string;
  category: BookCategory;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  stock: number;
  minStockAlert: number;
  warehouseLocation: string; // e.g. "Gudang Pusat - Rak A-02"
  description: string;
  coverImage: string;
  pages: number;
  weightGrams: number;
  publishedYear: number;
  rating: number;
  ratingCount: number;
  language: string;
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MutationType = 'sale' | 'restock' | 'adjustment' | 'return';

export interface StockMutation {
  id: string;
  bookId: string;
  bookTitle: string;
  type: MutationType;
  changeAmount: number; // e.g. -2 for sale, +50 for restock
  previousStock: number;
  newStock: number;
  referenceId: string; // orderId or PO number
  notes: string;
  operator: string;
  timestamp: string;
}

export interface CartItem {
  bookId: string;
  book: Book;
  quantity: number;
}

export type PaymentChannel =
  | 'qris'
  | 'va_bca'
  | 'va_mandiri'
  | 'va_bni'
  | 'va_bri'
  | 'gopay'
  | 'ovo'
  | 'dana'
  | 'shopeepay'
  | 'credit_card';

export interface PaymentMethodInfo {
  id: PaymentChannel;
  name: string;
  category: 'QRIS Instant' | 'Virtual Account' | 'E-Wallet' | 'Kartu Kredit';
  iconName: string;
  description: string;
  fee: number;
  instructions: string[];
}

export interface CourierOption {
  id: string;
  name: string;
  service: string;
  estimatedDays: string;
  cost: number;
}

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
}

export type OrderStatus = 'processing' | 'ready_to_ship' | 'shipped' | 'delivered';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'expired';

export interface Order {
  id: string;
  orderNumber: string; // e.g. "INV/2026/10/PN-8392"
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  promoCode?: string;
  shippingCourier: CourierOption;
  shippingCost: number;
  paymentFee: number;
  grandTotal: number;
  paymentChannel: PaymentChannel;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentDetails: {
    qrisString?: string;
    vaNumber?: string;
    vaBank?: string;
    eWalletPhone?: string;
    cardLast4?: string;
    paidAt?: string;
    transactionReference: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  totalTitles: number;
  totalPhysicalStock: number;
  totalAssetValue: number;
  lowStockCount: number;
  outOfStockCount: number;
}
