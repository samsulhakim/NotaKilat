import React, { useState } from 'react';
import { StoreProfile, Invoice, CatalogItem } from '../types';
import { X, Store, CreditCard, FileText, Download, Upload, Check } from 'lucide-react';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StoreProfile;
  onSaveProfile: (profile: StoreProfile) => void;
  invoices: Invoice[];
  catalog: CatalogItem[];
  onRestoreData?: (data: { profile: StoreProfile; invoices: Invoice[]; catalog: CatalogItem[] }) => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
  invoices,
  catalog,
  onRestoreData,
}) => {
  const [formData, setFormData] = useState<StoreProfile>({ ...profile });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const handleExportBackup = () => {
    const backupData = {
      app: 'NotaKilat',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      profile: formData,
      invoices,
      catalog,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_NotaKilat_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.profile && parsed.invoices && onRestoreData) {
          if (window.confirm('Restore data dari file cadangan ini? Data saat ini akan digantikan.')) {
            onRestoreData({
              profile: parsed.profile,
              invoices: parsed.invoices,
              catalog: parsed.catalog || catalog,
            });
            alert('Data cadangan berhasil dipulihkan!');
            onClose();
          }
        } else {
          alert('Format file cadangan tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca file cadangan.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-slate-200 text-slate-800 rounded-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">Pengaturan Toko & Bisnis</h3>
              <p className="text-xs text-slate-500">
                Informasi ini otomatis tercetak pada kop nota dan pesan WhatsApp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-5 text-xs flex-1">
          {/* Bagian Identitas Toko */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Store className="w-4 h-4 text-emerald-600" /> Profil Toko
            </h4>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Toko / Usaha *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Toko Berkah Abadi"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Slogan / Keterangan Usaha</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Contoh: Grosir & Eceran Kebutuhan Rumah Tangga"
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">No. Telp / WhatsApp Toko</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="081234567890"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Alamat Singkat</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Jl. Merdeka No. 45, Bandung"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Bagian Rekening Bank & QRIS */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <CreditCard className="w-4 h-4 text-emerald-600" /> Rekening Pembayaran (Transfer/QRIS)
            </h4>
            <p className="text-slate-500 text-[11px]">
              Tampil di nota saat pelanggan memilih metode Transfer atau Tempo/Hutang.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Bank</label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="BCA / Mandiri / BRI"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nomor Rekening</label>
                <input
                  type="text"
                  value={formData.bankAccount}
                  onChange={(e) => setFormData({ ...formData, bankAccount: e.target.value })}
                  placeholder="1234-5678-90"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none font-mono text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Atas Nama (Pemilik)</label>
                <input
                  type="text"
                  value={formData.bankHolder}
                  onChange={(e) => setFormData({ ...formData, bankHolder: e.target.value })}
                  placeholder="Ahmad Fauzan"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
                />
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* Catatan Kaki Nota */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <FileText className="w-4 h-4 text-emerald-600" /> Catatan Bawah Nota (Footer)
            </h4>
            <textarea
              rows={2}
              value={formData.footerNote}
              onChange={(e) => setFormData({ ...formData, footerNote: e.target.value })}
              placeholder="Contoh: Barang yang sudah dibeli tidak dapat ditukar. Terima kasih!"
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none text-xs"
            />
          </div>

          <hr className="border-slate-200" />

          {/* Backup & Restore Data */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
            <p className="font-semibold text-slate-800">Cadangkan / Pulihkan Data:</p>
            <p className="text-[11px] text-slate-500">
              Simpan semua data nota dan katalog produk Anda ke file JSON agar aman jika ganti perangkat.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={handleExportBackup}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" /> Unduh Backup JSON
              </button>
              <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-600" /> Pulihkan dari JSON
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" /> Tersimpan!
                </>
              ) : (
                'Simpan Pengaturan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
