import React, { useState } from 'react';
import { CatalogItem, Invoice, InvoiceItem, PaymentMethod, PaymentStatus, ReceiptStyle, StoreProfile } from '../types';
import { ReceiptView } from './ReceiptView';
import { formatNumber, formatRupiah, getTodayDateString, getCurrentTimeString } from '../utils/formatters';
import { Plus, Trash2, Printer, Share2, ImageDown, Save, Sparkles, BookOpen, Layers } from 'lucide-react';
import html2canvas from 'html2canvas';

interface InvoiceFormProps {
  invoice: Invoice;
  onChangeInvoice: (invoice: Invoice) => void;
  onSaveInvoice: () => void;
  onNewInvoice: () => void;
  onOpenWhatsApp: () => void;
  onPrint: () => void;
  store: StoreProfile;
  catalog: CatalogItem[];
  onOpenCatalog: () => void;
  receiptStyle: ReceiptStyle;
  onChangeReceiptStyle: (style: ReceiptStyle) => void;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  invoice,
  onChangeInvoice,
  onSaveInvoice,
  onNewInvoice,
  onOpenWhatsApp,
  onPrint,
  store,
  onOpenCatalog,
  receiptStyle,
  onChangeReceiptStyle,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  // Recalculates subtotal, discounts, taxes, and grand total
  const updateInvoiceCalculations = (updated: Invoice) => {
    const subtotal = updated.items.reduce((acc, item) => acc + item.subtotal, 0);

    let discountTotal = 0;
    if (updated.discountType === 'percent') {
      discountTotal = Math.round((subtotal * (updated.discountValue || 0)) / 100);
    } else {
      discountTotal = updated.discountValue || 0;
    }

    const afterDiscount = Math.max(0, subtotal - discountTotal);
    const taxTotal = Math.round((afterDiscount * (updated.taxPercent || 0)) / 100);
    const grandTotal = Math.max(0, afterDiscount + taxTotal + (updated.shippingFee || 0));

    let change = 0;
    if (updated.paymentMethod === 'tunai' && updated.amountPaid > grandTotal) {
      change = updated.amountPaid - grandTotal;
    }

    return {
      ...updated,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      change,
    };
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...invoice.items];
    const current = { ...newItems[index], [field]: value };

    // Update item subtotal
    const price = field === 'price' ? Number(value) : current.price;
    const qty = field === 'qty' ? Number(value) : current.qty;
    const discount = field === 'discount' ? Number(value) : current.discount;
    current.subtotal = Math.max(0, price * qty - discount);

    newItems[index] = current;
    const updated = updateInvoiceCalculations({ ...invoice, items: newItems });
    onChangeInvoice(updated);
  };

  const handleAddItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      name: '',
      price: 0,
      qty: 1,
      unit: 'pcs',
      discount: 0,
      subtotal: 0,
    };
    const updated = updateInvoiceCalculations({
      ...invoice,
      items: [...invoice.items, newItem],
    });
    onChangeInvoice(updated);
  };

  const handleRemoveItem = (index: number) => {
    if (invoice.items.length <= 1) {
      alert('Minimal harus ada 1 item dalam nota.');
      return;
    }
    const newItems = invoice.items.filter((_, idx) => idx !== index);
    const updated = updateInvoiceCalculations({ ...invoice, items: newItems });
    onChangeInvoice(updated);
  };

  const handleFieldChange = (field: keyof Invoice, value: any) => {
    const updated = updateInvoiceCalculations({ ...invoice, [field]: value });
    onChangeInvoice(updated);
  };

  const handleCustomerChange = (field: string, value: string) => {
    const updated = {
      ...invoice,
      customer: { ...invoice.customer, [field]: value },
    };
    onChangeInvoice(updated);
  };

  const handleQuickCash = (amount: number) => {
    const change = Math.max(0, amount - invoice.grandTotal);
    const updated = {
      ...invoice,
      amountPaid: amount,
      change,
      paymentMethod: 'tunai' as PaymentMethod,
      paymentStatus: (amount >= invoice.grandTotal ? 'lunas' : 'dp') as PaymentStatus,
    };
    onChangeInvoice(updated);
  };

  const handleDownloadImage = async () => {
    const target = document.getElementById('printable-receipt-target');
    if (!target) return;
    try {
      setIsDownloading(true);
      const canvas = await html2canvas(target, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `Nota_${invoice.invoiceNumber}.png`;
      a.href = dataUrl;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Error generating canvas', e);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: FORM CONTROLS (col-span 7) */}
      <div className="lg:col-span-7 space-y-6">
        {/* Card 1: Info Transaksi & Pelanggan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Informasi Pelanggan & Nota</h3>
            <span className="text-xs text-slate-400 font-mono">
              ID: {invoice.invoiceNumber}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Pelanggan:</label>
              <input
                type="text"
                value={invoice.customer.name}
                onChange={(e) => handleCustomerChange('name', e.target.value)}
                placeholder="Contoh: Ibu Rina / Bpk. Rudi"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                No. WhatsApp / HP:
              </label>
              <input
                type="text"
                value={invoice.customer.phone}
                onChange={(e) => handleCustomerChange('phone', e.target.value)}
                placeholder="08123456789 (untuk kirim WA)"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nomor Nota:</label>
              <input
                type="text"
                value={invoice.invoiceNumber}
                onChange={(e) => handleFieldChange('invoiceNumber', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tanggal Transaksi:</label>
              <input
                type="date"
                value={invoice.date || getTodayDateString()}
                onChange={(e) => handleFieldChange('date', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Waktu (Jam):</label>
              <input
                type="time"
                value={invoice.time || getCurrentTimeString()}
                onChange={(e) => handleFieldChange('time', e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Alamat Pelanggan / Catatan Pengiriman (Opsional):</label>
            <input
              type="text"
              value={invoice.customer.address || ''}
              onChange={(e) => handleCustomerChange('address', e.target.value)}
              placeholder="Contoh: Jl. Diponegoro No. 12 (antar sore)"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
            />
          </div>
        </div>

        {/* Card 2: Daftar Item / Produk */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Daftar Produk / Layanan</h3>
              <p className="text-[11px] text-slate-500">
                Ketik langsung atau klik &apos;Pilih dari Katalog&apos; untuk input otomatis
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenCatalog}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" /> Pilih dari Katalog
              </button>
              <button
                type="button"
                onClick={handleAddItem}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Baris
              </button>
            </div>
          </div>

          {/* Items Row Form */}
          <div className="space-y-3">
            {invoice.items.map((item, index) => (
              <div
                key={item.id || index}
                className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-xs space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-slate-700 w-5">#{index + 1}</span>
                  <input
                    type="text"
                    required
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    placeholder="Nama produk / jasa..."
                    className="flex-1 p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Hapus baris"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Harga Satuan (Rp):</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={item.price || ''}
                      onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="flex gap-1">
                    <div className="w-3/5">
                      <label className="text-[10px] text-slate-500 block">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty || ''}
                        onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-center"
                      />
                    </div>
                    <div className="w-2/5">
                      <label className="text-[10px] text-slate-500 block">Satuan:</label>
                      <input
                        type="text"
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        placeholder="pcs"
                        className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 outline-none text-center"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-slate-500 block">Potongan/Disc (Rp):</label>
                    <input
                      type="number"
                      min="0"
                      value={item.discount || ''}
                      onChange={(e) => handleItemChange(index, 'discount', Number(e.target.value))}
                      placeholder="0"
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                  <div className="text-right">
                    <label className="text-[10px] text-slate-500 block">Subtotal Item:</label>
                    <div className="p-1.5 font-mono font-bold text-slate-900 tabular-nums">
                      {formatRupiah(item.subtotal)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Rincian Diskon, Pajak, Ongkir & Pembayaran */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3">
            Penyesuaian Biaya & Pembayaran
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {/* Diskon Global */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">Diskon Nota:</label>
                <div className="flex text-[10px] bg-slate-100 rounded p-0.5">
                  <button
                    type="button"
                    onClick={() => handleFieldChange('discountType', 'fixed')}
                    className={`px-1.5 py-0.5 rounded ${
                      invoice.discountType === 'fixed' ? 'bg-white shadow-2xs font-bold' : ''
                    }`}
                  >
                    Rp
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('discountType', 'percent')}
                    className={`px-1.5 py-0.5 rounded ${
                      invoice.discountType === 'percent' ? 'bg-white shadow-2xs font-bold' : ''
                    }`}
                  >
                    %
                  </button>
                </div>
              </div>
              <input
                type="number"
                min="0"
                value={invoice.discountValue || ''}
                onChange={(e) => handleFieldChange('discountValue', Number(e.target.value))}
                placeholder="0"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Pajak PPN */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pajak / PPN (%):</label>
              <input
                type="number"
                min="0"
                max="100"
                value={invoice.taxPercent || ''}
                onChange={(e) => handleFieldChange('taxPercent', Number(e.target.value))}
                placeholder="Contoh: 11"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Ongkir / Biaya Layanan */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Ongkir / Biaya Tambahan:</label>
              <input
                type="number"
                min="0"
                value={invoice.shippingFee || ''}
                onChange={(e) => handleFieldChange('shippingFee', Number(e.target.value))}
                placeholder="0"
                className="w-full p-2 border border-slate-300 rounded-lg font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2">
            {/* Metode Pembayaran */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Metode Pembayaran:</label>
              <select
                value={invoice.paymentMethod}
                onChange={(e) => handleFieldChange('paymentMethod', e.target.value as PaymentMethod)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
              >
                <option value="tunai">Tunai (Cash)</option>
                <option value="transfer">Transfer Bank (BCA, Mandiri, dll)</option>
                <option value="qris">QRIS</option>
                <option value="edc">Mesin EDC / Debit</option>
                <option value="tempo">Tempo / Kredit</option>
              </select>
            </div>

            {/* Status Pembayaran */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Status Pembayaran:</label>
              <select
                value={invoice.paymentStatus}
                onChange={(e) => handleFieldChange('paymentStatus', e.target.value as PaymentStatus)}
                className="w-full p-2 border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-emerald-500 outline-none text-xs font-semibold"
              >
                <option value="lunas">LUNAS</option>
                <option value="tempo">BELUM LUNAS (TEMPO)</option>
                <option value="dp">UANG MUKA (DP)</option>
              </select>
            </div>
          </div>

          {/* Pembayaran Tunai & Uang Pas */}
          {invoice.paymentMethod === 'tunai' && (
            <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 text-xs space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="font-semibold text-slate-800">
                  Uang Tunai Diterima (Rp):
                </label>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickCash(invoice.grandTotal)}
                    className="px-2 py-0.5 bg-white border border-emerald-300 text-emerald-800 text-[11px] font-semibold rounded hover:bg-emerald-100 transition-colors"
                  >
                    Uang Pas
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(50000)}
                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[11px] rounded hover:bg-slate-100 transition-colors"
                  >
                    50.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(100000)}
                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[11px] rounded hover:bg-slate-100 transition-colors"
                  >
                    100.000
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickCash(200000)}
                    className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 text-[11px] rounded hover:bg-slate-100 transition-colors"
                  >
                    200.000
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={invoice.amountPaid || ''}
                  onChange={(e) => {
                    const paid = Number(e.target.value);
                    const change = Math.max(0, paid - invoice.grandTotal);
                    const updated = {
                      ...invoice,
                      amountPaid: paid,
                      change,
                      paymentStatus: (paid >= invoice.grandTotal ? 'lunas' : 'dp') as PaymentStatus,
                    };
                    onChangeInvoice(updated);
                  }}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-emerald-300 rounded font-mono text-xs focus:ring-1 focus:ring-emerald-500 outline-none"
                />

                <div className="p-2 bg-white rounded border border-emerald-300 flex justify-between items-center font-mono">
                  <span className="text-slate-500 text-[11px]">Kembalian:</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {formatRupiah(invoice.change)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Catatan Nota */}
          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Catatan Tambahan untuk Nota (Opsional):</label>
            <input
              type="text"
              value={invoice.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Contoh: Titip di pos satpam / Barang bergaransi 3 hari"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
            />
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: LIVE RECEIPT PREVIEW & ACTIONS (col-span 5) */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-4">
        {/* Style Selector & Action Buttons Top */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <Layers className="w-4 h-4 text-emerald-600" /> Format Tampilan:
            </div>
            {/* Style switch */}
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs">
              <button
                onClick={() => onChangeReceiptStyle('thermal58')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  receiptStyle === 'thermal58'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                58mm
              </button>
              <button
                onClick={() => onChangeReceiptStyle('thermal80')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  receiptStyle === 'thermal80'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                80mm
              </button>
              <button
                onClick={() => onChangeReceiptStyle('faktur_a4')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  receiptStyle === 'faktur_a4'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 / Faktur
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onOpenWhatsApp}
              className="px-3 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Share2 className="w-4 h-4" />
              Kirim WhatsApp
            </button>
            <button
              onClick={onPrint}
              className="px-3 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Printer className="w-4 h-4" />
              Cetak Nota
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleDownloadImage}
              disabled={isDownloading}
              className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <ImageDown className="w-3.5 h-3.5 text-slate-600" />
              {isDownloading ? 'Menyimpan...' : 'Unduh Gambar (PNG)'}
            </button>
            <button
              onClick={onSaveInvoice}
              className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5 text-slate-600" />
              Simpan ke Riwayat
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Nota selesai?</span>
            <button
              onClick={onNewInvoice}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline"
            >
              <Sparkles className="w-3.5 h-3.5" /> Buat Nota Baru
            </button>
          </div>
        </div>

        {/* Live Preview Paper Canvas */}
        <div className="bg-slate-200/70 p-4 rounded-xl border border-slate-300 max-h-[640px] overflow-y-auto">
          <p className="text-[11px] font-semibold text-slate-600 text-center mb-3">
            -- PREVIEW LIVE STRUK / NOTA --
          </p>
          <ReceiptView invoice={invoice} store={store} style={receiptStyle} />
        </div>
      </div>
    </div>
  );
};
