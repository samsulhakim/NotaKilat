export type PaymentStatus = 'lunas' | 'tempo' | 'dp';

export type PaymentMethod = 'tunai' | 'transfer' | 'qris' | 'edc' | 'tempo';

export type ReceiptStyle = 'thermal58' | 'thermal80' | 'faktur_a4' | 'modern_card';

export interface StoreProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  qrisText?: string;
  footerNote: string;
}

export interface InvoiceItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  unit: string;
  discount: number; // nominal diskon per baris
  subtotal: number;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  dueDate?: string; // for tempo
  customer: CustomerInfo;
  items: InvoiceItem[];
  subtotal: number;
  discountType: 'fixed' | 'percent';
  discountValue: number;
  discountTotal: number;
  taxPercent: number;
  taxTotal: number;
  shippingFee: number;
  grandTotal: number;
  amountPaid: number;
  change: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes: string;
  createdAt: number;
}

export interface CatalogItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  category: string;
}
