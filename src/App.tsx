import { useState, useEffect } from 'react';
import { CatalogItem, Invoice, ReceiptStyle, StoreProfile } from './types';
import {
  DEFAULT_STORE_PROFILE,
  getSavedCatalog,
  getSavedInvoices,
  getSavedReceiptStyle,
  getSavedStoreProfile,
  saveCatalog,
  saveInvoices,
  saveReceiptStyle,
  saveStoreProfile,
} from './utils/storage';
import { getCurrentTimeString, getTodayDateString, generateInvoiceNumber } from './utils/formatters';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';
import { WhatsAppModal } from './components/WhatsAppModal';
import { CatalogModal } from './components/CatalogModal';
import { StoreSettingsModal } from './components/StoreSettingsModal';
import { ReceiptView } from './components/ReceiptView';
import { Plus, Receipt, History, BookOpen, Settings, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  // Global State
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [storeProfile, setStoreProfile] = useState<StoreProfile>(getSavedStoreProfile);
  const [invoices, setInvoices] = useState<Invoice[]>(getSavedInvoices);
  const [catalog, setCatalog] = useState<CatalogItem[]>(getSavedCatalog);
  const [receiptStyle, setReceiptStyle] = useState<ReceiptStyle>(getSavedReceiptStyle);

  // Active working invoice
  const createFreshInvoice = (): Invoice => {
    const today = getTodayDateString();
    const time = getCurrentTimeString();
    const seq = invoices.length + 1;
    return {
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(seq),
      date: today,
      time,
      customer: {
        name: '',
        phone: '',
        address: '',
        notes: '',
      },
      items: [
        {
          id: `item-${Date.now()}`,
          name: '',
          price: 0,
          qty: 1,
          unit: 'pcs',
          discount: 0,
          subtotal: 0,
        },
      ],
      subtotal: 0,
      discountType: 'fixed',
      discountValue: 0,
      discountTotal: 0,
      taxPercent: 0,
      taxTotal: 0,
      shippingFee: 0,
      grandTotal: 0,
      amountPaid: 0,
      change: 0,
      paymentMethod: 'tunai',
      paymentStatus: 'lunas',
      notes: '',
      createdAt: Date.now(),
    };
  };

  const [currentInvoice, setCurrentInvoice] = useState<Invoice>(createFreshInvoice);

  // Modals state
  const [isWhatsAppOpen, setIsWhatsAppOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isCatalogSelectMode, setIsCatalogSelectMode] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // For print targeted invoice
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice>(currentInvoice);

  // Synchronize storage
  useEffect(() => {
    saveStoreProfile(storeProfile);
  }, [storeProfile]);

  useEffect(() => {
    saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    saveCatalog(catalog);
  }, [catalog]);

  useEffect(() => {
    saveReceiptStyle(receiptStyle);
  }, [receiptStyle]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleSaveInvoice = () => {
    // Check if invoice has at least 1 named item or customer
    const hasValidItem = currentInvoice.items.some((i) => i.name.trim() !== '' && i.subtotal > 0);
    if (!hasValidItem && currentInvoice.grandTotal === 0) {
      alert('Harap isi minimal 1 item produk atau jasa sebelum menyimpan.');
      return;
    }

    // Upsert into invoices list
    const existingIndex = invoices.findIndex((inv) => inv.id === currentInvoice.id);
    let updatedList: Invoice[] = [];
    if (existingIndex >= 0) {
      updatedList = [...invoices];
      updatedList[existingIndex] = currentInvoice;
    } else {
      updatedList = [currentInvoice, ...invoices];
    }

    setInvoices(updatedList);
    showToast('Nota berhasil disimpan ke Riwayat!');

    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch {}
  };

  const handleNewInvoice = () => {
    // If current invoice has content, ask or save
    const hasContent = currentInvoice.items.some((i) => i.name.trim() !== '');
    if (hasContent) {
      // Auto save previous if not empty
      handleSaveInvoice();
    }
    const fresh = createFreshInvoice();
    setCurrentInvoice(fresh);
    setActiveTab('create');
    showToast('Siap membuat nota baru!');
  };

  const handleSelectInvoiceFromHistory = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
    setActiveTab('create');
    showToast(`Nota ${invoice.invoiceNumber} dibuka di editor.`);
  };

  const handleDuplicateInvoice = (invoice: Invoice) => {
    const duplicated: Invoice = {
      ...invoice,
      id: `inv-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(invoices.length + 1),
      date: getTodayDateString(),
      time: getCurrentTimeString(),
      createdAt: Date.now(),
    };
    setCurrentInvoice(duplicated);
    setActiveTab('create');
    showToast(`Nota ${invoice.invoiceNumber} berhasil diduplikasi sebagai nota baru.`);
  };

  const handleDeleteInvoice = (id: string) => {
    if (window.confirm('Yakin ingin menghapus nota ini dari riwayat?')) {
      const updated = invoices.filter((i) => i.id !== id);
      setInvoices(updated);
      showToast('Nota telah dihapus dari riwayat.');
    }
  };

  const handlePrint = (invoice?: Invoice) => {
    const target = invoice || currentInvoice;
    setInvoiceToPrint(target);
    // Auto save if current
    if (!invoice || invoice.id === currentInvoice.id) {
      handleSaveInvoice();
    }
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handleOpenWhatsAppModal = (invoice?: Invoice) => {
    if (invoice) {
      setInvoiceToPrint(invoice);
    } else {
      setInvoiceToPrint(currentInvoice);
      handleSaveInvoice();
    }
    setIsWhatsAppOpen(true);
  };

  const handleSelectCatalogItem = (catItem: CatalogItem) => {
    // Add item to currentInvoice
    const currentItems = [...currentInvoice.items];
    // If the last item is empty, replace it
    const lastItem = currentItems[currentItems.length - 1];
    const isLastEmpty = lastItem && !lastItem.name.trim() && lastItem.price === 0;

    const newItem = {
      id: `item-${Date.now()}`,
      name: catItem.name,
      price: catItem.price,
      qty: 1,
      unit: catItem.unit || 'pcs',
      discount: 0,
      subtotal: catItem.price,
    };

    if (isLastEmpty) {
      currentItems[currentItems.length - 1] = newItem;
    } else {
      currentItems.push(newItem);
    }

    const subtotal = currentItems.reduce((acc, it) => acc + it.subtotal, 0);
    const grandTotal = Math.max(0, subtotal - currentInvoice.discountTotal + currentInvoice.taxTotal + currentInvoice.shippingFee);

    setCurrentInvoice({
      ...currentInvoice,
      items: currentItems,
      subtotal,
      grandTotal,
    });
    showToast(`"${catItem.name}" ditambahkan ke nota.`);
  };

  const handleRestoreData = (data: { profile: StoreProfile; invoices: Invoice[]; catalog: CatalogItem[] }) => {
    setStoreProfile(data.profile);
    setInvoices(data.invoices);
    setCatalog(data.catalog);
    if (data.invoices.length > 0) {
      setCurrentInvoice(data.invoices[0]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-top-4 duration-200 no-print">
          <Check className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* TOP BAR CONTRACT: 3 Zones (Brand, Nav Links, 1 Primary Action) */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8 sticky top-0 z-40 no-print">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-2xs">
            N
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            NotaKilat
          </span>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="flex items-center gap-6 text-xs font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'create'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Buat Nota
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-0.5 ${
              activeTab === 'history'
                ? 'text-emerald-700 border-b-2 border-emerald-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat Nota
          </button>
          <button
            onClick={() => {
              setIsCatalogSelectMode(false);
              setIsCatalogOpen(true);
            }}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <BookOpen className="w-4 h-4" />
            Katalog Produk
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
          >
            <Settings className="w-4 h-4" />
            Pengaturan Toko
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleNewInvoice}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            Nota Baru
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 no-print">
        {/* Business Header Sub-Bar */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {activeTab === 'create' ? 'Pembuat Nota & Struk Kasir' : 'Daftar Riwayat Nota Transaksi'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Usaha:{' '}
              <span className="font-semibold text-slate-800">{storeProfile.name}</span>
              {storeProfile.phone && ` · Telp: ${storeProfile.phone}`}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">
              {invoices.length} nota tersimpan di perangkat ini
            </span>
          </div>
        </div>

        {/* View Switch */}
        {activeTab === 'create' ? (
          <InvoiceForm
            invoice={currentInvoice}
            onChangeInvoice={setCurrentInvoice}
            onSaveInvoice={handleSaveInvoice}
            onNewInvoice={handleNewInvoice}
            onOpenWhatsApp={() => handleOpenWhatsAppModal(currentInvoice)}
            onPrint={() => handlePrint(currentInvoice)}
            store={storeProfile}
            catalog={catalog}
            onOpenCatalog={() => {
              setIsCatalogSelectMode(true);
              setIsCatalogOpen(true);
            }}
            receiptStyle={receiptStyle}
            onChangeReceiptStyle={setReceiptStyle}
          />
        ) : (
          <InvoiceHistory
            invoices={invoices}
            store={storeProfile}
            onSelectInvoice={handleSelectInvoiceFromHistory}
            onDuplicateInvoice={handleDuplicateInvoice}
            onDeleteInvoice={handleDeleteInvoice}
            onPrintInvoice={handlePrint}
            onOpenWhatsApp={handleOpenWhatsAppModal}
            onNewInvoice={handleNewInvoice}
          />
        )}
      </main>

      {/* Hidden container exclusively rendered during window.print() */}
      <div className="print-only hidden">
        <ReceiptView
          invoice={invoiceToPrint}
          store={storeProfile}
          style={receiptStyle}
        />
      </div>

      {/* Modals */}
      <WhatsAppModal
        isOpen={isWhatsAppOpen}
        onClose={() => setIsWhatsAppOpen(false)}
        invoice={invoiceToPrint}
        store={storeProfile}
      />

      <CatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        catalog={catalog}
        onSaveCatalog={setCatalog}
        onSelectItem={handleSelectCatalogItem}
        isSelectionMode={isCatalogSelectMode}
      />

      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={storeProfile}
        onSaveProfile={setStoreProfile}
        invoices={invoices}
        catalog={catalog}
        onRestoreData={handleRestoreData}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-400 no-print mt-auto">
        <p>
          NotaKilat · Aplikasi Kasir & Pembuat Nota Digital · Cetak Struk Bluetooth / A4 & Kirim WhatsApp
        </p>
      </footer>
    </div>
  );
}
