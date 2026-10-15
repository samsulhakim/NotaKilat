import React, { useState } from 'react';
import { Invoice, StoreProfile } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import { Search, Printer, Share2, Trash2, Copy, FileText, ArrowUpRight, TrendingUp, AlertCircle, ShoppingCart } from 'lucide-react';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  store: StoreProfile;
  onSelectInvoice: (invoice: Invoice) => void;
  onDuplicateInvoice: (invoice: Invoice) => void;
  onDeleteInvoice: (id: string) => void;
  onPrintInvoice: (invoice: Invoice) => void;
  onOpenWhatsApp: (invoice: Invoice) => void;
  onNewInvoice: () => void;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({
  invoices,
  onSelectInvoice,
  onDuplicateInvoice,
  onDeleteInvoice,
  onPrintInvoice,
  onOpenWhatsApp,
  onNewInvoice,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'lunas' | 'tempo' | 'dp'>('all');

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.customer.phone.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalOmzet = invoices.reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalLunas = invoices
    .filter((inv) => inv.paymentStatus === 'lunas')
    .reduce((acc, curr) => acc + curr.grandTotal, 0);
  const totalPiutang = invoices
    .filter((inv) => inv.paymentStatus !== 'lunas')
    .reduce((acc, curr) => acc + Math.max(0, curr.grandTotal - (curr.amountPaid || 0)), 0);

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Omzet Penjualan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRupiah(totalOmzet)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Dari {invoices.length} transaksi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Total Pembayaran Lunas</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <p className="text-xl font-bold text-emerald-600 font-mono tabular-nums">
            {formatRupiah(totalLunas)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Kas & Transfer diterima</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Sisa Piutang (Tempo/DP)</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-bold text-amber-600 font-mono tabular-nums">
            {formatRupiah(totalPiutang)}
          </p>
          <span className="text-[11px] text-slate-400 mt-1 block">Belum dibayarkan pelanggan</span>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari no nota, nama pelanggan, atau no telepon..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('lunas')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'lunas'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lunas
            </button>
            <button
              onClick={() => setStatusFilter('tempo')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'tempo'
                  ? 'bg-red-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tempo / Hutang
            </button>
            <button
              onClick={() => setStatusFilter('dp')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                statusFilter === 'dp'
                  ? 'bg-amber-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              DP
            </button>
          </div>
        </div>
      </div>

      {/* Table of Invoices */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredInvoices.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3 stroke-1" />
            <h4 className="text-sm font-semibold text-slate-800">Tidak ada nota yang ditemukan</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Belum ada riwayat nota yang cocok dengan pencarian Anda. Buat nota baru untuk mulai mencatat.
            </p>
            <button
              onClick={onNewInvoice}
              className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
            >
              <ShoppingCart className="w-4 h-4" /> Buat Nota Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                  <th className="py-3 px-4">No. Nota</th>
                  <th className="py-3 px-4">Tanggal & Waktu</th>
                  <th className="py-3 px-4">Pelanggan</th>
                  <th className="py-3 px-4">Item</th>
                  <th className="py-3 px-4 text-right">Total Tagihan</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{formatDateIndo(inv.date)}</div>
                      <div className="text-[11px] text-slate-400">{inv.time} WIB</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{inv.customer.name || 'Umum'}</div>
                      {inv.customer.phone && (
                        <div className="text-[11px] text-slate-500 font-mono">{inv.customer.phone}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {inv.items.length} macam ({inv.items.reduce((sum, it) => sum + it.qty, 0)} pcs)
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums text-slate-900">
                      {formatRupiah(inv.grandTotal)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold uppercase ${
                          inv.paymentStatus === 'lunas'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.paymentStatus === 'dp'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onSelectInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="Buka / Edit Nota"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenWhatsApp(inv)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                          title="Kirim ke WhatsApp"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onPrintInvoice(inv)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                          title="Cetak Nota"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDuplicateInvoice(inv)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                          title="Duplikat Nota"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteInvoice(inv.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Nota"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
