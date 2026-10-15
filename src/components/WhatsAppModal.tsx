import React, { useState } from 'react';
import { Invoice, StoreProfile } from '../types';
import { buildWhatsAppMessage, getWhatsAppUrl } from '../utils/whatsapp';
import { cleanIndonesianPhone } from '../utils/formatters';
import { X, Send, Copy, Check, ImageDown, Phone, MessageSquare } from 'lucide-react';
import html2canvas from 'html2canvas';

interface WhatsAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  store: StoreProfile;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  isOpen,
  onClose,
  invoice,
  store,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(invoice.customer.phone || '');
  const [isCopied, setIsCopied] = useState(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState(false);

  if (!isOpen) return null;

  const rawMessage = buildWhatsAppMessage(invoice, store);
  const cleanPhone = cleanIndonesianPhone(phoneNumber);

  const handleOpenWhatsApp = () => {
    const url = getWhatsAppUrl(cleanPhone, rawMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(rawMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handleDownloadReceiptImage = async () => {
    const targetElement = document.getElementById('printable-receipt-target');
    if (!targetElement) return;

    try {
      setIsDownloadingImage(true);
      const canvas = await html2canvas(targetElement, {
        scale: 2.5, // Crisp high-DPI resolution
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Nota_${invoice.invoiceNumber}.png`;
      link.href = imageUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate receipt image', err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-emerald-700 px-5 py-4 text-white flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-lg">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Kirim Nota via WhatsApp</h3>
              <p className="text-xs text-emerald-100">Kirim teks rincian & lampiran gambar struk</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Nomor HP Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nomor WhatsApp Tujuan:
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Contoh: 08123456789 atau 628123456789"
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            {cleanPhone ? (
              <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1 font-mono">
                <Check className="w-3.5 h-3.5" /> Format terdeteksi: +{cleanPhone}
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Bisa dibuka langsung ke aplikasi WhatsApp di HP atau WhatsApp Web.
              </p>
            )}
          </div>

          {/* Chat Preview */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-slate-700">Preview Pesan WhatsApp:</label>
              <button
                onClick={handleCopyText}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1 hover:underline"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Teks
                  </>
                )}
              </button>
            </div>
            <div className="bg-[#EFEAE2] p-3 rounded-lg border border-[#D1D7DB] max-h-56 overflow-y-auto font-sans text-xs">
              <div className="bg-white p-3 rounded-lg rounded-tl-none shadow-xs text-slate-800 whitespace-pre-line leading-relaxed max-w-sm">
                {rawMessage}
              </div>
            </div>
          </div>

          {/* Opsi Lampirkan Gambar */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-800">Kirim Gambar Struk (PNG)?</p>
              <p className="text-[11px] text-slate-500">
                Unduh struk dalam format gambar untuk dilampirkan langsung di chat WA.
              </p>
            </div>
            <button
              onClick={handleDownloadReceiptImage}
              disabled={isDownloadingImage}
              className="px-3 py-2 text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ImageDown className="w-4 h-4 text-emerald-600" />
              {isDownloadingImage ? 'Membuat PNG...' : 'Unduh Gambar'}
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex flex-col sm:flex-row justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors order-2 sm:order-1"
          >
            Tutup
          </button>
          <button
            onClick={handleOpenWhatsApp}
            className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Send className="w-4 h-4" />
            Buka WhatsApp Sekarang
          </button>
        </div>
      </div>
    </div>
  );
};
