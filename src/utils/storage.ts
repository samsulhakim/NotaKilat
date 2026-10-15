import { CatalogItem, Invoice, ReceiptStyle, StoreProfile } from '../types';

const STORE_PROFILE_KEY = 'notakilat_store_profile_v1';
const INVOICES_KEY = 'notakilat_invoices_v1';
const CATALOG_KEY = 'notakilat_catalog_v1';
const RECEIPT_STYLE_KEY = 'notakilat_receipt_style_v1';

export const DEFAULT_STORE_PROFILE: StoreProfile = {
  name: 'Toko Berkah Abadi',
  tagline: 'Grosir & Eceran Kebutuhan Harian',
  address: 'Jl. Ahmad Yani No. 128, Bandung',
  phone: '081234567890',
  bankName: 'BCA',
  bankAccount: '1234-5678-90',
  bankHolder: 'Ahmad Fauzan',
  qrisText: 'NMID: ID1020030040506',
  footerNote: 'Barang yang sudah dibeli tidak dapat ditukar/dikembalikan. Terima kasih atas kunjungan Anda!',
};

export const DEFAULT_CATALOG: CatalogItem[] = [
  { id: 'cat-1', name: 'Beras Ramos Super 5kg', price: 74000, unit: 'sak', category: 'Sembako' },
  { id: 'cat-2', name: 'Minyak Goreng Bimoli 2L', price: 38500, unit: 'pouch', category: 'Sembako' },
  { id: 'cat-3', name: 'Telur Ayam Broiler 1kg', price: 28000, unit: 'kg', category: 'Sembako' },
  { id: 'cat-4', name: 'Gula Pasir Gulaku 1kg', price: 17500, unit: 'kg', category: 'Sembako' },
  { id: 'cat-5', name: 'Kopi Kapal Api Special 165g', price: 14000, unit: 'bks', category: 'Minuman' },
  { id: 'cat-6', name: 'Teh Celup Sariwangi 30s', price: 8500, unit: 'kotak', category: 'Minuman' },
  { id: 'cat-7', name: 'Sabun Cuci Sunlight 650ml', price: 13000, unit: 'pouch', category: 'Kebersihan' },
  { id: 'cat-8', name: 'Jasa Antar / Kurir Kilat', price: 10000, unit: 'trip', category: 'Jasa' },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-init-1',
    invoiceNumber: 'NK-20261015-001',
    date: '2026-10-15',
    time: '09:45',
    customer: {
      name: 'Ibu Ratna Sari',
      phone: '081289012345',
      address: 'Komplek Permata Hijau B3/12',
      notes: 'Titip di satpam jika tidak ada orang',
    },
    items: [
      {
        id: 'item-1',
        name: 'Beras Ramos Super 5kg',
        price: 74000,
        qty: 2,
        unit: 'sak',
        discount: 0,
        subtotal: 148000,
      },
      {
        id: 'item-2',
        name: 'Minyak Goreng Bimoli 2L',
        price: 38500,
        qty: 1,
        unit: 'pouch',
        discount: 2500,
        subtotal: 36000,
      },
      {
        id: 'item-3',
        name: 'Telur Ayam Broiler 1kg',
        price: 28000,
        qty: 2,
        unit: 'kg',
        discount: 0,
        subtotal: 56000,
      },
    ],
    subtotal: 240000,
    discountType: 'fixed',
    discountValue: 5000,
    discountTotal: 5000,
    taxPercent: 0,
    taxTotal: 0,
    shippingFee: 10000,
    grandTotal: 245000,
    amountPaid: 250000,
    change: 5000,
    paymentMethod: 'tunai',
    paymentStatus: 'lunas',
    notes: 'Pelanggan setia - beri bonus kalender toko',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'inv-init-2',
    invoiceNumber: 'NK-20261015-002',
    date: '2026-10-15',
    time: '11:15',
    customer: {
      name: 'Bpk. Budi Pratama (Catering)',
      phone: '085712345678',
      address: 'Jl. Riau No. 88, Bandung',
      notes: 'Pengiriman sore jam 16:00',
    },
    items: [
      {
        id: 'item-4',
        name: 'Beras Ramos Super 5kg',
        price: 74000,
        qty: 5,
        unit: 'sak',
        discount: 10000,
        subtotal: 360000,
      },
      {
        id: 'item-5',
        name: 'Telur Ayam Broiler 1kg',
        price: 28000,
        qty: 10,
        unit: 'kg',
        discount: 0,
        subtotal: 280000,
      },
    ],
    subtotal: 640000,
    discountType: 'fixed',
    discountValue: 20000,
    discountTotal: 20000,
    taxPercent: 0,
    taxTotal: 0,
    shippingFee: 0,
    grandTotal: 620000,
    amountPaid: 620000,
    change: 0,
    paymentMethod: 'transfer',
    paymentStatus: 'lunas',
    notes: 'Transfer via BCA sudah dicek masuk',
    createdAt: Date.now() - 1800000,
  },
];

export function getSavedStoreProfile(): StoreProfile {
  try {
    const data = localStorage.getItem(STORE_PROFILE_KEY);
    if (!data) return DEFAULT_STORE_PROFILE;
    return { ...DEFAULT_STORE_PROFILE, ...JSON.parse(data) };
  } catch {
    return DEFAULT_STORE_PROFILE;
  }
}

export function saveStoreProfile(profile: StoreProfile): void {
  try {
    localStorage.setItem(STORE_PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save store profile', e);
  }
}

export function getSavedInvoices(): Invoice[] {
  try {
    const data = localStorage.getItem(INVOICES_KEY);
    if (!data) return INITIAL_INVOICES;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_INVOICES;
  } catch {
    return INITIAL_INVOICES;
  }
}

export function saveInvoices(invoices: Invoice[]): void {
  try {
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
  } catch (e) {
    console.error('Failed to save invoices', e);
  }
}

export function getSavedCatalog(): CatalogItem[] {
  try {
    const data = localStorage.getItem(CATALOG_KEY);
    if (!data) return DEFAULT_CATALOG;
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATALOG;
  } catch {
    return DEFAULT_CATALOG;
  }
}

export function saveCatalog(catalog: CatalogItem[]): void {
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify(catalog));
  } catch (e) {
    console.error('Failed to save catalog', e);
  }
}

export function getSavedReceiptStyle(): ReceiptStyle {
  try {
    const data = localStorage.getItem(RECEIPT_STYLE_KEY);
    return (data as ReceiptStyle) || 'thermal58';
  } catch {
    return 'thermal58';
  }
}

export function saveReceiptStyle(style: ReceiptStyle): void {
  try {
    localStorage.setItem(RECEIPT_STYLE_KEY, style);
  } catch (e) {
    console.error('Failed to save receipt style', e);
  }
}
