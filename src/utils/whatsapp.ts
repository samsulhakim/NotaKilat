import { Invoice, StoreProfile } from '../types';
import { cleanIndonesianPhone, formatDateIndo, formatRupiah } from './formatters';

/**
 * Builds a clean, professional, readable WhatsApp text receipt
 */
export function buildWhatsAppMessage(invoice: Invoice, store: StoreProfile): string {
  const statusLabel =
    invoice.paymentStatus === 'lunas'
      ? '✅ LUNAS'
      : invoice.paymentStatus === 'dp'
      ? '⏳ UANG MUKA (DP)'
      : '⚠️ BELUM LUNAS (TEMPO)';

  const methodLabel =
    invoice.paymentMethod === 'tunai'
      ? 'Tunai (Cash)'
      : invoice.paymentMethod === 'transfer'
      ? `Transfer Bank (${store.bankName || 'Bank'})`
      : invoice.paymentMethod === 'qris'
      ? 'QRIS'
      : invoice.paymentMethod === 'edc'
      ? 'Kartu Debit/Kredit'
      : 'Tempo / Kredit';

  const lines: string[] = [];

  // Header Toko
  lines.push(`🧾 *NOTA TRANSAKSI*`);
  lines.push(`*${store.name.toUpperCase()}*`);
  if (store.tagline) {
    lines.push(`_${store.tagline}_`);
  }
  if (store.address) {
    lines.push(`📍 ${store.address}`);
  }
  if (store.phone) {
    lines.push(`📞 Telp/WA: ${store.phone}`);
  }
  lines.push('──────────────────────────────');

  // Info Nota & Pelanggan
  lines.push(`*No. Nota :* ${invoice.invoiceNumber}`);
  lines.push(`*Tanggal  :* ${formatDateIndo(invoice.date)} ${invoice.time || ''} WIB`);
  if (invoice.customer.name) {
    lines.push(`*Pelanggan:* ${invoice.customer.name}`);
  }
  if (invoice.customer.phone) {
    lines.push(`*No. HP   :* ${invoice.customer.phone}`);
  }
  lines.push(`*Status   :* ${statusLabel}`);
  lines.push(`*Metode   :* ${methodLabel}`);
  if (invoice.dueDate && invoice.paymentStatus !== 'lunas') {
    lines.push(`*Jatuh Tempo:* ${formatDateIndo(invoice.dueDate)}`);
  }
  lines.push('──────────────────────────────');

  // Daftar Item
  lines.push(`*RINCIAN BELANJA:*`);
  invoice.items.forEach((item, index) => {
    const itemNum = `${index + 1}.`;
    const discountNote = item.discount > 0 ? ` (disc. -${formatRupiah(item.discount)})` : '';
    lines.push(`${itemNum} *${item.name}*`);
    lines.push(`   ${item.qty} ${item.unit} x ${formatRupiah(item.price)}${discountNote} = *${formatRupiah(item.subtotal)}*`);
  });
  lines.push('──────────────────────────────');

  // Ringkasan Pembayaran
  lines.push(`Subtotal   : ${formatRupiah(invoice.subtotal)}`);
  if (invoice.discountTotal > 0) {
    lines.push(`Diskon     : -${formatRupiah(invoice.discountTotal)}`);
  }
  if (invoice.taxTotal > 0) {
    lines.push(`Pajak (${invoice.taxPercent}%) : +${formatRupiah(invoice.taxTotal)}`);
  }
  if (invoice.shippingFee > 0) {
    lines.push(`Ongkir/Layanan : +${formatRupiah(invoice.shippingFee)}`);
  }
  lines.push(`*TOTAL BAYAR: ${formatRupiah(invoice.grandTotal)}*`);

  if (invoice.paymentStatus === 'lunas' && invoice.paymentMethod === 'tunai') {
    lines.push(`Tunai Diterima : ${formatRupiah(invoice.amountPaid)}`);
    if (invoice.change > 0) {
      lines.push(`Kembalian      : ${formatRupiah(invoice.change)}`);
    }
  } else if (invoice.paymentStatus === 'dp') {
    lines.push(`DP Dibayarkan  : ${formatRupiah(invoice.amountPaid)}`);
    const sisa = Math.max(0, invoice.grandTotal - invoice.amountPaid);
    lines.push(`*Sisa Tagihan  : ${formatRupiah(sisa)}*`);
  } else if (invoice.paymentStatus === 'tempo') {
    lines.push(`*Sisa Tagihan  : ${formatRupiah(invoice.grandTotal)}*`);
  }

  // Info Rekening Transfer (jika tempo atau transfer)
  if (
    (invoice.paymentMethod === 'transfer' || invoice.paymentStatus !== 'lunas') &&
    store.bankAccount
  ) {
    lines.push('──────────────────────────────');
    lines.push(`💳 *Pembayaran Transfer dapat dilakukan ke:*`);
    lines.push(`Bank : *${store.bankName}*`);
    lines.push(`No. Rekening : *${store.bankAccount}*`);
    lines.push(`Atas Nama : *${store.bankHolder}*`);
  }

  // Catatan Khusus
  if (invoice.notes) {
    lines.push('──────────────────────────────');
    lines.push(`📝 *Catatan:* ${invoice.notes}`);
  }

  // Footer
  lines.push('──────────────────────────────');
  if (store.footerNote) {
    lines.push(`${store.footerNote}`);
  } else {
    lines.push(`Terima kasih telah berbelanja di *${store.name}*! 🙏`);
  }

  return lines.join('\n');
}

/**
 * Creates direct WhatsApp link
 */
export function getWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = cleanIndonesianPhone(phone);
  const encodedText = encodeURIComponent(message);
  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  // If no phone provided, open WhatsApp with prefilled message
  return `https://wa.me/?text=${encodedText}`;
}
