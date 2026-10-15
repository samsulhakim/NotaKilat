import React, { useState } from 'react';
import { CatalogItem } from '../types';
import { formatRupiah } from '../utils/formatters';
import { X, Plus, Search, Trash2, Edit2, Check, PackagePlus } from 'lucide-react';

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: CatalogItem[];
  onSaveCatalog: (items: CatalogItem[]) => void;
  onSelectItem?: (item: CatalogItem) => void;
  isSelectionMode?: boolean;
}

export const CatalogModal: React.FC<CatalogModalProps> = ({
  isOpen,
  onClose,
  catalog,
  onSaveCatalog,
  onSelectItem,
  isSelectionMode = false,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new/edit item
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState<number>(0);
  const [itemUnit, setItemUnit] = useState('pcs');
  const [itemCategory, setItemCategory] = useState('Umum');

  if (!isOpen) return null;

  const categories = ['Semua', ...Array.from(new Set(catalog.map((i) => i.category || 'Umum')))];

  const filteredItems = catalog.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleStartAdd = () => {
    setIsAddingNew(true);
    setEditingId(null);
    setItemName('');
    setItemPrice(0);
    setItemUnit('pcs');
    setItemCategory(selectedCategory === 'Semua' ? 'Umum' : selectedCategory);
  };

  const handleStartEdit = (item: CatalogItem) => {
    setEditingId(item.id);
    setIsAddingNew(false);
    setItemName(item.name);
    setItemPrice(item.price);
    setItemUnit(item.unit);
    setItemCategory(item.category || 'Umum');
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    if (editingId) {
      const updated = catalog.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: itemName.trim(),
              price: Number(itemPrice) || 0,
              unit: itemUnit.trim() || 'pcs',
              category: itemCategory.trim() || 'Umum',
            }
          : item
      );
      onSaveCatalog(updated);
      setEditingId(null);
    } else {
      const newItem: CatalogItem = {
        id: `cat-${Date.now()}`,
        name: itemName.trim(),
        price: Number(itemPrice) || 0,
        unit: itemUnit.trim() || 'pcs',
        category: itemCategory.trim() || 'Umum',
      };
      onSaveCatalog([...catalog, newItem]);
      setIsAddingNew(false);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (window.confirm('Hapus item ini dari katalog produk tersimpan?')) {
      const updated = catalog.filter((item) => item.id !== id);
      onSaveCatalog(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              {isSelectionMode ? 'Pilih Produk / Jasa' : 'Katalog Produk & Jasa'}
            </h3>
            <p className="text-xs text-slate-500">
              {isSelectionMode
                ? 'Klik salah satu item untuk langsung dimasukkan ke nota'
                : 'Kelola daftar item yang sering dijual agar pembuatan nota semakin cepat'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar: Search, Filter, & Add */}
        <div className="p-4 border-b border-slate-200 bg-white space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 justify-between">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama produk atau kategori..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>
            {!isAddingNew && !editingId && (
              <button
                onClick={handleStartAdd}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Tambah Item Baru
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 text-white font-medium'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Inline Form for Add or Edit */}
        {(isAddingNew || editingId) && (
          <form onSubmit={handleSaveItem} className="p-4 bg-emerald-50/50 border-b border-emerald-200">
            <h4 className="text-xs font-bold text-slate-800 mb-2">
              {editingId ? 'Edit Item Produk/Jasa' : 'Tambah Item Baru ke Katalog'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-600 mb-1">Nama Produk / Jasa:</label>
                <input
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="Contoh: Beras Ramos 5kg"
                  className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 mb-1">Harga (Rp):</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={itemPrice || ''}
                  onChange={(e) => setItemPrice(Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2 bg-white border border-slate-300 rounded font-mono focus:ring-1 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-1/2">
                  <label className="block text-slate-600 mb-1">Satuan:</label>
                  <input
                    type="text"
                    value={itemUnit}
                    onChange={(e) => setItemUnit(e.target.value)}
                    placeholder="pcs/kg/box"
                    className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block text-slate-600 mb-1">Kategori:</label>
                  <input
                    type="text"
                    value={itemCategory}
                    onChange={(e) => setItemCategory(e.target.value)}
                    placeholder="Sembako"
                    className="w-full p-2 bg-white border border-slate-300 rounded focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setEditingId(null);
                }}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
              >
                Simpan Item
              </button>
            </div>
          </form>
        )}

        {/* Items List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100">
          {filteredItems.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <PackagePlus className="w-8 h-8 mx-auto mb-2 text-slate-400 stroke-1" />
              <p className="text-xs">Belum ada item yang sesuai dengan pencarian.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-lg transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-xs truncate">{item.name}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.category || 'Umum'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 font-mono font-medium mt-0.5">
                    {formatRupiah(item.price)}{' '}
                    <span className="text-slate-500 font-sans font-normal">/ {item.unit}</span>
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {isSelectionMode && onSelectItem ? (
                    <button
                      onClick={() => {
                        onSelectItem(item);
                        onClose();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" /> Pilih
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Hapus Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex justify-between items-center text-xs text-slate-500">
          <span>Total {catalog.length} item tersimpan</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
