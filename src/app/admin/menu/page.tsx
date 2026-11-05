'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getMenuCategories, getMenuItems, saveMenuCategory, saveMenuItem, deleteMenuItem, deleteMenuCategory, subscribeToAdminData } from '@/lib/adminStore';
import { MenuCategory, MenuItem } from '@/types/admin';
import { formatCurrency } from '@/lib/utils';

const ALLERGENS = ['gluten', 'lactosa', 'huevo', 'pescados', 'crustáceos', 'moluscos', 'frutos_secos', 'cacahuetes', 'soja', 'sésamo', 'mostaza', 'apio', 'sulfitos', 'altramuces'];
const DIETARY_TAGS = ['vegetarian', 'vegan', 'gluten-free', 'nut-free', 'dairy-free'];

interface ItemFormData {
  name: string;
  description: string;
  price: number;
  cost: number;
  categoryId: string;
  allergens: string[];
  dietaryTags: string[];
  spicyLevel: 0 | 1 | 2 | 3;
  preparationTime: number;
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  lowStockThreshold: number;
  tags: string[];
}

export default function AdminMenuPage() {
  const { hasPermission } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = () => {
      const cats = getMenuCategories();
      setCategories(cats);
      setItems(getMenuItems());
      if (!activeCategoryId && cats.length > 0) {
        setActiveCategoryId(cats[0].id);
      }
      setIsLoading(false);
    };
    loadData();
    return subscribeToAdminData(loadData);
  }, [activeCategoryId]);

  const filteredItems = items.filter(item => 
    item.categoryId === activeCategoryId &&
    (searchQuery === '' || 
     item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaveCategory = (data: Omit<MenuCategory, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    saveMenuCategory(data);
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const handleSaveItem = (data: Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    saveMenuItem(data);
    setShowItemModal(false);
    setEditingItem(null);
  };

  const handleDeleteCategory = (id: string) => {
    if (confirm('¿Eliminar esta categoría y todos sus platos?')) {
      deleteMenuCategory(id);
      if (activeCategoryId === id) {
        const remaining = categories.filter(c => c.id !== id);
        setActiveCategoryId(remaining[0]?.id || null);
      }
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('¿Eliminar este plato?')) {
      deleteMenuItem(id);
    }
  };

  const handleToggleActive = (item: MenuItem) => {
    saveMenuItem({ ...item, isActive: !item.isActive });
  };

  const handleDuplicateItem = (item: MenuItem) => {
    saveMenuItem({ 
      ...item, 
      id: undefined, 
      name: `${item.name} (copia)`,
      isFeatured: false,
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const canWrite = hasPermission('menu:write');
  const canDelete = hasPermission('menu:delete');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Gestión del Menú</h1>
          <p className="text-amber-600">Categorías, platos, precios y disponibilidad</p>
        </div>
        <div className="flex gap-2">
          {canWrite && (
            <button
              onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Categoría
            </button>
          )}
          {canWrite && activeCategoryId && (
            <button
              onClick={() => { setEditingItem(null); setShowItemModal(true); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nuevo Plato
            </button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
        <div className="border-b border-amber-100 overflow-x-auto">
          <nav className="flex gap-1 p-1 min-w-max" role="tablist">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                role="tab"
                aria-selected={activeCategoryId === cat.id}
                className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeCategoryId === cat.id
                    ? 'bg-amber-100 text-amber-800 shadow-sm'
                    : 'text-amber-600 hover:bg-amber-50 hover:text-amber-800'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                    activeCategoryId === cat.id ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-700'
                  }`}>
                    {items.filter(i => i.categoryId === cat.id).length}
                  </span>
                </span>
              </button>
            ))}
            {canWrite && (
              <button
                onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
                className="px-4 py-2.5 rounded-lg text-sm font-medium text-amber-500 hover:bg-amber-50 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            )}
          </nav>
        </div>

        {/* Search & Items */}
        <div className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar platos..."
                className="w-full pl-10 pr-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-amber-900 placeholder-amber-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <AdminItemCard
                key={item.id}
                item={item}
                category={categories.find(c => c.id === item.categoryId)}
                onEdit={() => { setEditingItem(item); setShowItemModal(true); }}
                onDelete={() => handleDeleteItem(item.id)}
                onDuplicate={() => handleDuplicateItem(item)}
                onToggleActive={() => handleToggleActive(item)}
                canEdit={canWrite}
                canDelete={canDelete}
              />
            ))}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-12 text-amber-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p>{searchQuery ? 'No se encontraron platos' : 'Esta categoría está vacía'}</p>
                {canWrite && activeCategoryId && (
                  <button
                    onClick={() => { setEditingItem(null); setShowItemModal(true); }}
                    className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm hover:bg-amber-700"
                  >
                    Añadir primer plato
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Item Modal */}
      {showItemModal && (
        <ItemModal
          item={editingItem}
          categories={categories}
          defaultCategoryId={activeCategoryId}
          onClose={() => { setShowItemModal(false); setEditingItem(null); }}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function AdminItemCard({ 
  item, 
  category,
  onEdit, 
  onDelete, 
  onDuplicate,
  onToggleActive,
  canEdit,
  canDelete,
}: { 
  item: MenuItem; 
  category: MenuCategory | undefined;
  onEdit: () => void; 
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleActive: () => void;
  canEdit: boolean;
  canDelete: boolean;
}) {
  const margin = item.cost ? (((item.price - item.cost) / item.price) * 100).toFixed(0) : '?';
  
  return (
    <div className={`bg-white rounded-xl border overflow-hidden transition-all ${item.isActive ? 'border-amber-100' : 'border-red-100 bg-red-50'}`}>
      {!item.isActive && (
        <div className="bg-red-50 border-b border-red-100 px-3 py-1.5 flex items-center justify-between">
          <span className="text-xs text-red-700 font-medium">INACTIVO</span>
          <button onClick={onToggleActive} className="text-red-600 hover:text-red-800 text-sm font-medium">Activar</button>
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-amber-900 truncate">{item.name}</h3>
              {item.isFeatured && (
                <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full">⭐ Destacado</span>
              )}
            </div>
            <p className="text-sm text-amber-600/80 line-clamp-2">{item.description}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-amber-900 text-lg">{formatCurrency(item.price)}</p>
            <p className="text-xs text-amber-500">Margen: ~{margin}%</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.dietaryTags.map(tag => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-green-50 text-green-700 rounded-full">
              {tag === 'vegetarian' && '🌱 Vegetariano'}
              {tag === 'vegan' && '🌿 Vegano'}
              {tag === 'gluten-free' && '🚫 Sin gluten'}
              {tag === 'nut-free' && '🥜 Sin frutos secos'}
              {tag === 'dairy-free' && '🥛 Sin lácteos'}
            </span>
          ))}
          {item.spicyLevel > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-50 text-red-700 rounded-full">
              {'🌶️'.repeat(item.spicyLevel)} Picante {item.spicyLevel}/3
            </span>
          )}
          <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
            ⏱️ {item.preparationTime} min
          </span>
          {item.stock !== undefined && item.stock > -1 && item.stock <= (item.lowStockThreshold || 5) && (
            <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
              ⚠️ Stock bajo: {item.stock}
            </span>
          )}
        </div>

        {item.allergens.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 text-xs text-amber-600/70">
            {item.allergens.map(a => (
              <span key={a} className="px-2 py-0.5 bg-amber-50 rounded">{a}</span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-amber-100">
          <div className="flex gap-1">
            {canEdit && (
              <button onClick={onEdit} className="px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
            )}
            {canEdit && (
              <button onClick={onDuplicate} className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Duplicar
              </button>
            )}
            {canEdit && (
              <button onClick={onToggleActive} className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1 ${item.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}>
                {item.isActive ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    Desactivar
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Activar
                  </>
                )}
              </button>
            )}
          </div>
          {canDelete && (
            <button onClick={onDelete} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ category, onClose, onSave }: { category: MenuCategory | null; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🍽️',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '🍽️',
        order: category.order,
        isActive: category.isActive,
      });
    } else {
      setFormData({ name: '', description: '', icon: '🍽️', order: 0, isActive: true });
    }
  }, [category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: category?.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-900">{category ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button onClick={onClose} className="p-2 text-amber-500 hover:text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Nombre *</label>
            <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Ej: Entrantes" />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Icono</label>
            <input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-2xl" placeholder="🍽️" />
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Descripción</label>
            <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Orden</label>
              <input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-amber-600 rounded border-amber-300" />
              <label htmlFor="isActive" className="ml-2 text-sm text-amber-700">Activa</label>
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 font-medium">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700">{category ? 'Guardar cambios' : 'Crear categoría'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ItemModal({ item, categories, defaultCategoryId, onClose, onSave }: { item: MenuItem | null; categories: MenuCategory[]; defaultCategoryId: string | null; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState<ItemFormData>({
    name: '',
    description: '',
    price: 0,
    cost: 0,
    categoryId: defaultCategoryId || categories[0]?.id || '',
    allergens: [],
    dietaryTags: [],
    spicyLevel: 0,
    preparationTime: 10,
    isActive: true,
    isFeatured: false,
    stock: -1,
    lowStockThreshold: 5,
    tags: [],
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        cost: item.cost || 0,
        categoryId: item.categoryId,
        allergens: item.allergens,
        dietaryTags: item.dietaryTags,
        spicyLevel: item.spicyLevel,
        preparationTime: item.preparationTime,
        isActive: item.isActive,
        isFeatured: item.isFeatured,
        stock: item.stock ?? -1,
        lowStockThreshold: item.lowStockThreshold || 5,
        tags: item.tags,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        cost: 0,
        categoryId: defaultCategoryId || categories[0]?.id || '',
        allergens: [],
        dietaryTags: [],
        spicyLevel: 0,
        preparationTime: 10,
        isActive: true,
        isFeatured: false,
        stock: -1,
        lowStockThreshold: 5,
        tags: [],
      });
    }
  }, [item, defaultCategoryId, categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: item?.id });
  };

  const toggleAllergen = (a: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens.includes(a) 
        ? prev.allergens.filter(x => x !== a) 
        : [...prev.allergens, a]
    }));
  };

  const toggleDietary = (d: string) => {
    setFormData(prev => ({
      ...prev,
      dietaryTags: prev.dietaryTags.includes(d) 
        ? prev.dietaryTags.filter(x => x !== d) 
        : [...prev.dietaryTags, d]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6 sticky top-0 bg-white py-4 z-10 border-b border-amber-100">
          <h2 className="text-xl font-bold text-amber-900">{item ? 'Editar Plato' : 'Nuevo Plato'}</h2>
          <button onClick={onClose} className="p-2 text-amber-500 hover:text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-amber-800 mb-1">Nombre *</label>
              <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Ej: Croquetas de Jamón Ibérico" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-amber-800 mb-1">Descripción</label>
              <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Precio (CLP) *</label>
              <input type="number" step="0.01" min="0" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Coste (CLP)</label>
              <input type="number" step="0.01" min="0" value={formData.cost} onChange={e => setFormData({...formData, cost: parseFloat(e.target.value)})} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Categoría *</label>
              <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Tiempo prep. (min)</label>
              <input type="number" min="1" value={formData.preparationTime} onChange={e => setFormData({...formData, preparationTime: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-2">Alergenos</label>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map(a => (
                <label key={a} className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${formData.allergens.includes(a) ? 'bg-red-100 text-red-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                  <input type="checkbox" checked={formData.allergens.includes(a)} onChange={() => toggleAllergen(a)} className="sr-only" />
                  {a.charAt(0).toUpperCase() + a.slice(1).replace('_', ' ')}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-amber-800 mb-2">Etietas dietéticas</label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_TAGS.map(d => (
                <label key={d} className={`px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors ${formData.dietaryTags.includes(d) ? 'bg-green-100 text-green-700' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>
                  <input type="checkbox" checked={formData.dietaryTags.includes(d)} onChange={() => toggleDietary(d)} className="sr-only" />
                  {d === 'vegetarian' && '🌱 Vegetariano'}
                  {d === 'vegan' && '🌿 Vegano'}
                  {d === 'gluten-free' && '🚫 Sin gluten'}
                  {d === 'nut-free' && '🥜 Sin frutos secos'}
                  {d === 'dairy-free' && '🥛 Sin lácteos'}
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Nivel picante</label>
              <select value={formData.spicyLevel} onChange={e => setFormData({...formData, spicyLevel: parseInt(e.target.value) as 0 | 1 | 2 | 3})} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                <option value={0}>🚫 Ninguno</option>
                <option value={1}>🌶️ Leve</option>
                <option value={2}>🌶️🌶️ Medio</option>
                <option value={3}>🌶️🌶️🌶️ Fuerte</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Stock (-1 = ilimitado)</label>
              <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Alerta stock bajo</label>
              <input type="number" min="1" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: parseInt(e.target.value)})} className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 text-amber-600 rounded border-amber-300" />
              <span className="text-sm text-amber-700">Activo en carta</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={formData.isFeatured} onChange={e => setFormData({...formData, isFeatured: e.target.checked})} className="w-4 h-4 text-amber-600 rounded border-amber-300" />
              <span className="text-sm text-amber-700">⭐ Plato destacado</span>
            </label>
          </div>

          <div className="flex gap-2 pt-4 border-t border-amber-100 sticky bottom-0 bg-white py-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 font-medium">Cancelar</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700">{item ? 'Guardar cambios' : 'Crear plato'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}