'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { getTables, saveTable, deleteTable, updateTableStatus, subscribeToAdminData } from '@/lib/adminStore';
import { Table } from '@/types/admin';
import { formatCurrency } from '@/lib/utils';

export default function AdminTablesPage() {
  const { hasPermission } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState<Table | null>(null);

  useEffect(() => {
    const loadData = () => {
      setTables(getTables().sort((a, b) => a.number - b.number));
      setIsLoading(false);
    };
    loadData();
    return subscribeToAdminData(loadData);
  }, []);

  const handleSaveTable = (data: Omit<Table, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    saveTable(data);
    setShowModal(false);
    setEditingTable(null);
  };

  const handleDeleteTable = (id: string) => {
    if (confirm('¿Eliminar esta mesa?')) {
      deleteTable(id);
    }
  };

  const handleStatusChange = (table: Table, status: Table['status']) => {
    updateTableStatus(table.id, status);
  };

  const canWrite = hasPermission('tables:write');

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  const statusCounts = {
    free: tables.filter(t => t.status === 'free').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    cleaning: tables.filter(t => t.status === 'cleaning').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-amber-900">Gestión de Mesas</h1>
          <p className="text-amber-600">Plano de sala, estados y capacidad</p>
        </div>
        <div className="flex gap-2">
          {canWrite && (
            <button
              onClick={() => { setEditingTable(null); setShowModal(true); }}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Mesa
            </button>
          )}
          <div className="flex items-center gap-2 border border-amber-200 rounded-lg p-1">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-amber-100 text-amber-800' : 'text-amber-600 hover:text-amber-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-amber-100 text-amber-800' : 'text-amber-600 hover:text-amber-800'}`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatusCard label="Libres" count={statusCounts.free} color="bg-green-500" icon="✅" />
        <StatusCard label="Ocupadas" count={statusCounts.occupied} color="bg-amber-500" icon="👥" />
        <StatusCard label="Reservadas" count={statusCounts.reserved} color="bg-blue-500" icon="📅" />
        <StatusCard label="Limpieza" count={statusCounts.cleaning} color="bg-gray-500" icon="🧹" />
        <StatusCard label="Mantenim." count={statusCounts.maintenance} color="bg-red-500" icon="🔧" />
      </div>

      {/* Tables View */}
      {viewMode === 'grid' ? (
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="p-4 border-b border-amber-100">
            <div className="relative aspect-square max-w-4xl mx-auto" style={{ background: '#fefce8' }}>
              {/* Room background grid */}
              <div className="absolute inset-0" style={{ 
                backgroundImage: 'linear-gradient(rgba(212, 165, 116, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(212, 165, 116, 0.1) 1px, transparent 1px)',
                backgroundSize: '60px 60px'
              }} />
              
              {tables.map((table) => (
                <TableNode
                  key={table.id}
                  table={table}
                  onStatusChange={handleStatusChange}
                  onEdit={() => { setEditingTable(table); setShowModal(true); }}
                  onDelete={() => handleDeleteTable(table.id)}
                  canEdit={canWrite}
                  containerSize={{ width: 800, height: 600 }}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-amber-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-amber-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-amber-700">Nº</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-amber-700">Nombre</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-amber-700">Capacidad</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-amber-700">Estado</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-amber-700">Posición</th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-amber-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {tables.map((table) => (
                  <tr key={table.id} className="hover:bg-amber-50 transition-colors">
                    <td className="px-4 py-3 font-bold text-amber-900">#{table.number}</td>
                    <td className="px-4 py-3 text-amber-700">{table.name || '-'}</td>
                    <td className="px-4 py-3 text-amber-600">{table.capacity} personas</td>
                    <td className="px-4 py-3">
                      <TableStatusSelect 
                        value={table.status} 
                        onChange={(status) => handleStatusChange(table, status)}
                        disabled={!canWrite}
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-amber-500">
                      {table.position ? `(${table.position.x}, ${table.position.y})` : 'Sin asignar'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canWrite && (
                          <button onClick={() => { setEditingTable(table); setShowModal(true); }} className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors" title="Editar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        )}
                        {canWrite && (
                          <button onClick={() => handleDeleteTable(table.id)} className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors" title="Eliminar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tables.length === 0 && canWrite && (
        <div className="bg-white rounded-xl border border-amber-100 p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="text-lg font-semibold text-amber-900 mb-1">No hay mesas configuradas</h3>
          <p className="text-amber-500 mb-4">Crea tu primera mesa para empezar</p>
          <button onClick={() => { setEditingTable(null); setShowModal(true); }} className="px-6 py-3 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700">
            Crear mesa
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TableModal
          table={editingTable}
          existingNumbers={tables.filter(t => t.id !== editingTable?.id).map(t => t.number)}
          onClose={() => { setShowModal(false); setEditingTable(null); }}
          onSave={handleSaveTable}
        />
      )}
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================

function StatusCard({ label, count, color, icon }: { label: string; count: number; color: string; icon: string }) {
  return (
    <div className="bg-white rounded-xl border border-amber-100 p-4 flex items-center gap-3">
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white text-xl`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-amber-900">{count}</p>
        <p className="text-sm text-amber-500">{label}</p>
      </div>
    </div>
  );
}

function TableNode({ 
  table, 
  onStatusChange, 
  onEdit, 
  onDelete, 
  canEdit,
  containerSize,
}: { 
  table: Table; 
  onStatusChange: (table: Table, status: Table['status']) => void;
  onEdit: () => void; 
  onDelete: () => void;
  canEdit: boolean;
  containerSize: { width: number; height: number };
}) {
  const position = table.position || { x: 100, y: 100 };
  const size = 80;
  
  // Normalize position to container
  const x = Math.max(size/2, Math.min(containerSize.width - size/2, position.x));
  const y = Math.max(size/2, Math.min(containerSize.height - size/2, position.y));

  const statusColors: Record<Table['status'], { bg: string; border: string; text: string }> = {
    free: { bg: 'bg-green-100', border: 'border-green-400', text: 'text-green-800' },
    occupied: { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-800' },
    reserved: { bg: 'bg-blue-100', border: 'border-blue-400', text: 'text-blue-800' },
    cleaning: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-700' },
    maintenance: { bg: 'bg-red-100', border: 'border-red-400', text: 'text-red-800' },
  };

  const colors = statusColors[table.status];

  return (
    <div
      className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200"
      style={{ left: x, top: y }}
    >
      <div className="relative">
        <button
          onClick={onEdit}
          className={`w-${size}px h-${size}px rounded-xl border-3 ${colors.border} ${colors.bg} flex flex-col items-center justify-center shadow-lg hover:shadow-xl transition-all ${canEdit ? 'cursor-pointer' : ''}`}
          onContextMenu={(e) => { e.preventDefault(); onEdit(); }}
        >
          <span className="font-bold text-xl text-amber-900">{table.number}</span>
          <span className="text-xs font-medium text-amber-700">{table.capacity} pax</span>
          {table.name && <span className="text-xs text-amber-600 truncate w-20 text-center">{table.name}</span>}
          
          {/* Status indicator */}
          <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${colors.bg.replace('bg-', 'bg-')} flex items-center justify-center`}>
            {table.status === 'free' && <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>}
            {table.status === 'occupied' && <svg className="w-3 h-3 text-amber-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.006A5.973 5.973 0 014 15v3H1v-3a3 3 0 013.75-2.994z" /></svg>}
            {table.status === 'reserved' && <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
            {table.status === 'cleaning' && <svg className="w-3 h-3 text-gray-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>}
            {table.status === 'maintenance' && <svg className="w-3 h-3 text-red-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>}
          </div>
        </button>

        {/* Context Menu on right-click */}
        {canEdit && (
          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10" role="menu">
            <div className="bg-white rounded-lg shadow-lg border border-amber-100 py-1 min-w-[160px]">
              <button onClick={onEdit} className="w-full px-4 py-2 text-left text-sm text-amber-700 hover:bg-amber-50 flex items-center gap-2" role="menuitem">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Editar mesa
              </button>
              <button onClick={onDelete} className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" role="menuitem">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Eliminar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TableStatusSelect({ value, onChange, disabled }: { value: Table['status']; onChange: (status: Table['status']) => void; disabled: boolean }) {
  const options: { value: Table['status']; label: string; color: string }[] = [
    { value: 'free', label: '✅ Libre', color: 'text-green-700 bg-green-50' },
    { value: 'occupied', label: '👥 Ocupada', color: 'text-amber-700 bg-amber-50' },
    { value: 'reserved', label: '📅 Reservada', color: 'text-blue-700 bg-blue-50' },
    { value: 'cleaning', label: '🧹 Limpieza', color: 'text-gray-700 bg-gray-50' },
    { value: 'maintenance', label: '🔧 Mantenim.', color: 'text-red-700 bg-red-50' },
  ];

  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as Table['status'])}
      disabled={disabled}
      className={`px-2 py-1 rounded-lg text-xs font-medium border ${options.find(o => o.value === value)?.color} cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
  );
}

function TableModal({ table, existingNumbers, onClose, onSave }: { table: Table | null; existingNumbers: number[]; onClose: () => void; onSave: (data: any) => void }) {
  const [formData, setFormData] = useState({
    number: table?.number || Math.max(0, ...existingNumbers) + 1,
    name: table?.name || '',
    capacity: table?.capacity || 4,
    status: table?.status || 'free',
    position: table?.position || { x: 100, y: 100 },
  });

  useEffect(() => {
    if (table) {
      setFormData({
        number: table.number,
        name: table.name || '',
        capacity: table.capacity,
        status: table.status,
        position: table.position || { x: 100, y: 100 },
      });
    } else {
      setFormData({
        number: Math.max(0, ...existingNumbers) + 1,
        name: '',
        capacity: 4,
        status: 'free',
        position: { x: 100, y: 100 },
      });
    }
  }, [table, existingNumbers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: table?.id });
  };

  const isNumberTaken = existingNumbers.includes(formData.number);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-amber-900">{table ? 'Editar Mesa' : 'Nueva Mesa'}</h2>
          <button onClick={onClose} className="p-2 text-amber-500 hover:text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Número *</label>
            <input
              type="number"
              min="1"
              max="999"
              value={formData.number}
              onChange={e => setFormData({...formData, number: parseInt(e.target.value) || 0})}
              required
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent ${isNumberTaken ? 'border-red-300' : 'border-amber-200'}`}
            />
            {isNumberTaken && <p className="text-red-500 text-xs mt-1">Este número ya está en uso</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Nombre</label>
            <input
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder="Ej: Terraza 1, Salón VIP..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Capacidad</label>
              <select
                value={formData.capacity}
                onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
                className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                {[2,4,6,8,10,12].map(n => <option key={n} value={n}>{n} personas</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as Table['status']})}
                className="w-full px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="free">✅ Libre</option>
                <option value="occupied">👥 Ocupada</option>
                <option value="reserved">📅 Reservada</option>
                <option value="cleaning">🧹 Limpieza</option>
                <option value="maintenance">🔧 Mantenimiento</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-amber-800 mb-1">Posición en plano (X, Y)</label>
            <div className="flex gap-2">
              <input type="number" placeholder="X" value={formData.position.x} onChange={e => setFormData({...formData, position: {...formData.position, x: parseInt(e.target.value) || 0}})} className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              <input type="number" placeholder="Y" value={formData.position.y} onChange={e => setFormData({...formData, position: {...formData.position, y: parseInt(e.target.value) || 0}})} className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
            </div>
            <p className="text-xs text-amber-500 mt-1">Coordenadas en el plano de sala (px)</p>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-amber-200 rounded-xl text-amber-700 hover:bg-amber-50 font-medium">Cancelar</button>
            <button type="submit" disabled={isNumberTaken} className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-xl font-medium hover:bg-amber-700 disabled:opacity-50">{table ? 'Guardar cambios' : 'Crear mesa'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}