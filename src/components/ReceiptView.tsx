import React from 'react';
import { Invoice, ReceiptStyle, StoreProfile } from '../types';
import { formatDateIndo, formatRupiah } from '../utils/formatters';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface ReceiptViewProps {
  invoice: Invoice;
  store: StoreProfile;
  style: ReceiptStyle;
}

export const ReceiptView: React.FC<ReceiptViewProps> = ({ invoice, store, style }) => {
  const isA4 = style === 'faktur_a4';
  const isThermal80 = style === 'thermal80';
  const isThermal58 = style === 'thermal58';

  const statusBadge = () => {
    if (invoice.paymentStatus === 'lunas') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded">
          <CheckCircle2 className="w-3.5 h-3.5" /> LUNAS
        </span>
      );
    }
    if (invoice.paymentStatus === 'dp') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-300 px-2.5 py-0.5 rounded">
          <Clock className="w-3.5 h-3.5" /> DP / UANG MUKA
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-800 bg-red-50 border border-red-300 px-2.5 py-0.5 rounded">
        <AlertTriangle className="w-3.5 h-3.5" /> BELUM LUNAS
      </span>
    );
  };

  // 1. FAKTUR A4 / FORMAL INVOICE
  if (isA4) {
    return (
      <div
        id="printable-receipt-target"
        className="w-full max-w-[760px] mx-auto bg-white p-8 border border-slate-200 shadow-sm text-slate-800 font-sans print:p-0 print:border-none print:shadow-none"
      >
        {/* Kop Surat / Header */}
        <div className="flex justify-between items-start border-b-2 border-slate-900 pb-5 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{store.name}</h1>
            {store.tagline && <p className="text-sm text-slate-600 mt-0.5">{store.tagline}</p>}
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">{store.address}</p>
            {store.phone && <p className="text-xs text-slate-500">Telp/WA: {store.phone}</p>}
          </div>
          <div className="text-right">
            <div className="inline-block text-xl font-black tracking-wider text-slate-900 border-2 border-slate-900 px-3 py-1 mb-2">
              NOTA PENJUALAN
            </div>
            <p className="text-xs text-slate-500">
              No. Nota: <span className="font-mono font-bold text-slate-900">{invoice.invoiceNumber}</span>
            </p>
            <p className="text-xs text-slate-500">
              Tanggal: <span className="text-slate-900">{formatDateIndo(invoice.date)}</span>
            </p>
            {invoice.time && <p className="text-xs text-slate-500">Pukul: {invoice.time} WIB</p>}
          </div>
        </div>

        {/* Info Pelanggan & Transaksi */}
        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-sm mb-6 text-xs">
          <div>
            <span className="font-semibold text-slate-500 block mb-1">DITUJUKAN KEPADA:</span>
            <p className="text-sm font-bold text-slate-900">{invoice.customer.name || 'Pelanggan Umum'}</p>
            {invoice.customer.phone && <p className="text-slate-600 mt-0.5">No. HP: {invoice.customer.phone}</p>}
            {invoice.customer.address && <p className="text-slate-600 mt-0.5">Alamat: {invoice.customer.address}</p>}
          </div>
          <div className="text-right flex flex-col justify-between items-end">
            <div>
              <span className="font-semibold text-slate-500 block mb-1">STATUS PEMBAYARAN:</span>
              <div>{statusBadge()}</div>
              <p className="text-slate-600 mt-1 capitalize">Metode: {invoice.paymentMethod}</p>
              {invoice.dueDate && invoice.paymentStatus !== 'lunas' && (
                <p className="text-red-600 font-semibold mt-0.5">Jatuh Tempo: {formatDateIndo(invoice.dueDate)}</p>
              )}
            </div>
          </div>
        </div>

        {/* Tabel Barang */}
        <table className="w-full text-xs text-left mb-6 border-collapse">
          <thead>
            <tr className="border-y-2 border-slate-900 bg-slate-100 font-semibold text-slate-800">
              <th className="py-2.5 px-3 w-10 text-center">No</th>
              <th className="py-2.5 px-3">Nama Produk / Jasa</th>
              <th className="py-2.5 px-3 text-right">Harga</th>
              <th className="py-2.5 px-3 text-center w-24">Qty</th>
              <th className="py-2.5 px-3 text-right">Potongan</th>
              <th className="py-2.5 px-3 text-right">Jumlah</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {invoice.items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td className="py-2.5 px-3 text-center text-slate-500">{idx + 1}</td>
                <td className="py-2.5 px-3 font-medium text-slate-900">{item.name || '-'}</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatRupiah(item.price)}</td>
                <td className="py-2.5 px-3 text-center font-mono tabular-nums">
                  {item.qty} {item.unit}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-500">
                  {item.discount > 0 ? `-${formatRupiah(item.discount)}` : '-'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                  {formatRupiah(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Rincian Total */}
        <div className="flex justify-between items-start gap-8 border-t border-slate-200 pt-4 mb-8">
          <div className="max-w-xs text-xs space-y-2">
            {store.bankAccount && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="font-semibold text-slate-700 block mb-0.5">Informasi Pembayaran:</span>
                <p className="text-slate-600 font-mono">
                  {store.bankName} : <span className="font-bold text-slate-900">{store.bankAccount}</span>
                </p>
                <p className="text-slate-600">a.n {store.bankHolder}</p>
              </div>
            )}
            {invoice.notes && (
              <p className="text-slate-600 italic">
                <span className="font-semibold not-italic">Catatan:</span> {invoice.notes}
              </p>
            )}
          </div>

          <div className="w-64 text-xs space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="tabular-nums">{formatRupiah(invoice.subtotal)}</span>
            </div>
            {invoice.discountTotal > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Diskon:</span>
                <span className="tabular-nums">-{formatRupiah(invoice.discountTotal)}</span>
              </div>
            )}
            {invoice.taxTotal > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>PPN ({invoice.taxPercent}%):</span>
                <span className="tabular-nums">+{formatRupiah(invoice.taxTotal)}</span>
              </div>
            )}
            {invoice.shippingFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Ongkir / Biaya:</span>
                <span className="tabular-nums">+{formatRupiah(invoice.shippingFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-bold text-slate-900 border-t-2 border-slate-900 pt-2 font-sans">
              <span>TOTAL:</span>
              <span className="font-mono tabular-nums">{formatRupiah(invoice.grandTotal)}</span>
            </div>
            {invoice.paymentMethod === 'tunai' && invoice.paymentStatus === 'lunas' && (
              <>
                <div className="flex justify-between text-slate-600 pt-1 border-t border-slate-200">
                  <span>Dibayar:</span>
                  <span className="tabular-nums">{formatRupiah(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Kembalian:</span>
                  <span className="tabular-nums">{formatRupiah(invoice.change)}</span>
                </div>
              </>
            )}
            {invoice.paymentStatus === 'dp' && (
              <>
                <div className="flex justify-between text-amber-700 pt-1 border-t border-slate-200 font-semibold">
                  <span>DP Terbayar:</span>
                  <span className="tabular-nums">{formatRupiah(invoice.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-red-600 font-bold">
                  <span>Sisa Tagihan:</span>
                  <span className="tabular-nums">
                    {formatRupiah(Math.max(0, invoice.grandTotal - invoice.amountPaid))}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tanda Tangan */}
        <div className="grid grid-cols-2 gap-8 text-center text-xs text-slate-700 pt-4 border-t border-slate-200">
          <div>
            <p className="mb-14">Tanda Terima Pelanggan,</p>
            <p className="font-bold border-t border-slate-300 pt-1 inline-block min-w-[140px]">
              ( {invoice.customer.name || 'Pelanggan'} )
            </p>
          </div>
          <div>
            <p className="mb-14">Hormat Kami / Kasir,</p>
            <p className="font-bold border-t border-slate-300 pt-1 inline-block min-w-[140px]">
              ( {store.name} )
            </p>
          </div>
        </div>

        {store.footerNote && (
          <p className="text-[11px] text-center text-slate-500 italic mt-6 border-t border-slate-100 pt-3">
            {store.footerNote}
          </p>
        )}
      </div>
    );
  }

  // 2. THERMAL FORMAT (58mm or 80mm)
  const thermalWidthClass = isThermal80 ? 'max-w-[380px]' : 'max-w-[310px]';

  return (
    <div
      id="printable-receipt-target"
      className={`w-full ${thermalWidthClass} mx-auto bg-white p-5 border border-dashed border-slate-300 shadow-sm font-mono text-slate-900 text-xs print:p-2 print:border-none print:shadow-none print:max-w-full`}
    >
      {/* Header Struk */}
      <div className="text-center pb-3">
        <h2 className="text-base font-bold tracking-tight uppercase leading-snug">{store.name}</h2>
        {store.tagline && <p className="text-[11px] text-slate-600">{store.tagline}</p>}
        {store.address && <p className="text-[10px] text-slate-500 leading-tight mt-0.5">{store.address}</p>}
        {store.phone && <p className="text-[10px] text-slate-500">Telp: {store.phone}</p>}
      </div>

      <div className="text-center text-[11px] py-1 border-y border-dashed border-slate-400">
        ================================
      </div>

      {/* Meta Nota */}
      <div className="py-2 text-[11px] space-y-0.5">
        <div className="flex justify-between">
          <span>No. Nota:</span>
          <span className="font-bold">{invoice.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Waktu:</span>
          <span>{invoice.date} {invoice.time}</span>
        </div>
        <div className="flex justify-between">
          <span>Pelanggan:</span>
          <span className="font-semibold truncate max-w-[150px]">{invoice.customer.name || 'Umum'}</span>
        </div>
        {invoice.customer.phone && (
          <div className="flex justify-between">
            <span>No. HP:</span>
            <span>{invoice.customer.phone}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="font-bold uppercase">
            {invoice.paymentStatus === 'lunas' ? '[LUNAS]' : invoice.paymentStatus === 'dp' ? '[DP]' : '[TEMPO]'}
          </span>
        </div>
      </div>

      <div className="text-center text-[11px] py-1 border-t border-dashed border-slate-400">
        --------------------------------
      </div>

      {/* Item List */}
      <div className="py-1 space-y-2 text-[11px]">
        {invoice.items.map((item, idx) => (
          <div key={item.id || idx}>
            <div className="font-bold text-slate-900 leading-tight">{item.name || '-'}</div>
            <div className="flex justify-between text-slate-700">
              <span>
                {item.qty} {item.unit} x {formatRupiah(item.price)}
                {item.discount > 0 && <span className="text-slate-500"> (-{formatRupiah(item.discount)})</span>}
              </span>
              <span className="font-semibold text-slate-900 tabular-nums">{formatRupiah(item.subtotal)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center text-[11px] py-1 border-t border-dashed border-slate-400">
        --------------------------------
      </div>

      {/* Rincian Bayar */}
      <div className="py-1 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="tabular-nums">{formatRupiah(invoice.subtotal)}</span>
        </div>
        {invoice.discountTotal > 0 && (
          <div className="flex justify-between">
            <span>Diskon:</span>
            <span className="tabular-nums">-{formatRupiah(invoice.discountTotal)}</span>
          </div>
        )}
        {invoice.taxTotal > 0 && (
          <div className="flex justify-between">
            <span>PPN ({invoice.taxPercent}%):</span>
            <span className="tabular-nums">+{formatRupiah(invoice.taxTotal)}</span>
          </div>
        )}
        {invoice.shippingFee > 0 && (
          <div className="flex justify-between">
            <span>Ongkir:</span>
            <span className="tabular-nums">+{formatRupiah(invoice.shippingFee)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm font-bold border-t border-dashed border-slate-400 pt-1.5 mt-1">
          <span>TOTAL:</span>
          <span className="tabular-nums">{formatRupiah(invoice.grandTotal)}</span>
        </div>

        <div className="flex justify-between pt-1">
          <span>Metode:</span>
          <span className="capitalize font-medium">{invoice.paymentMethod}</span>
        </div>

        {invoice.paymentMethod === 'tunai' && invoice.paymentStatus === 'lunas' && (
          <>
            <div className="flex justify-between">
              <span>Tunai:</span>
              <span className="tabular-nums">{formatRupiah(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Kembali:</span>
              <span className="tabular-nums">{formatRupiah(invoice.change)}</span>
            </div>
          </>
        )}

        {invoice.paymentStatus === 'dp' && (
          <>
            <div className="flex justify-between">
              <span>DP:</span>
              <span className="tabular-nums">{formatRupiah(invoice.amountPaid)}</span>
            </div>
            <div className="flex justify-between font-bold text-red-700">
              <span>Sisa:</span>
              <span className="tabular-nums">
                {formatRupiah(Math.max(0, invoice.grandTotal - invoice.amountPaid))}
              </span>
            </div>
          </>
        )}

        {invoice.paymentStatus === 'tempo' && (
          <div className="flex justify-between font-bold text-red-700">
            <span>Sisa Tagihan:</span>
            <span className="tabular-nums">{formatRupiah(invoice.grandTotal)}</span>
          </div>
        )}
      </div>

      {/* Info Rekening */}
      {store.bankAccount && (invoice.paymentMethod === 'transfer' || invoice.paymentStatus !== 'lunas') && (
        <div className="mt-2 p-2 bg-slate-50 border border-slate-200 text-[10px] text-center">
          <p className="font-bold">{store.bankName}: {store.bankAccount}</p>
          <p>a.n {store.bankHolder}</p>
        </div>
      )}

      {invoice.notes && (
        <div className="mt-2 text-[10px] text-slate-600 border-t border-dotted border-slate-300 pt-1">
          Ket: {invoice.notes}
        </div>
      )}

      {/* Footer Struk */}
      <div className="text-center pt-3 mt-2 border-t border-dashed border-slate-400 space-y-1">
        <p className="text-[10px] text-slate-600 leading-tight">
          {store.footerNote || 'Terima kasih atas kunjungan Anda!'}
        </p>
        <p className="text-[9px] text-slate-400 pt-1">*** SIMPAN STRUK INI ***</p>
      </div>
    </div>
  );
};
