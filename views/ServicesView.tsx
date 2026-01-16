
import React, { useState } from 'react';
import { ServiceTemplate, ServiceType } from '../types';
import { Search, Plus, Edit2, Trash2, Briefcase, X, DollarSign, Tag } from 'lucide-react';

interface ServicesViewProps {
  services: ServiceTemplate[];
  setServices: React.Dispatch<React.SetStateAction<ServiceTemplate[]>>;
}

const ServicesView: React.FC<ServicesViewProps> = ({ services, setServices }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceTemplate | null>(null);

  const [formData, setFormData] = useState<Partial<ServiceTemplate>>({
    name: '',
    description: '',
    defaultPrice: 0,
    type: ServiceType.PACKAGE
  });

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? { ...editingService, ...formData } as ServiceTemplate : s));
    } else {
      const newService: ServiceTemplate = {
        ...formData,
        id: Date.now().toString(),
      } as ServiceTemplate;
      setServices([...services, newService]);
    }
    setIsModalOpen(false);
    resetForm();
  };

  const handleEdit = (service: ServiceTemplate) => {
    setEditingService(service);
    setFormData(service);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este modelo de serviço?')) {
      setServices(services.filter(s => s.id !== id));
    }
  };

  const resetForm = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', defaultPrice: 0, type: ServiceType.PACKAGE });
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Buscar nos modelos..." 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg"
        >
          <Plus size={20} />
          <span>Novo Modelo de Serviço</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <div key={service.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition">
               <div className="flex space-x-1">
                <button onClick={() => handleEdit(service)} className="p-2 bg-white shadow-md text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-50">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(service.id)} className="p-2 bg-white shadow-md text-slate-400 hover:text-red-600 rounded-xl border border-slate-50">
                  <Trash2 size={16} />
                </button>
               </div>
            </div>

            <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 mb-4">
              <Briefcase size={24} />
            </div>

            <h3 className="text-xl font-bold text-slate-800 mb-2">{service.name}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed h-10">
              {service.description || 'Sem descrição definida para este modelo.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
              <div className="flex items-center space-x-2">
                <Tag size={14} className="text-indigo-400" />
                <span className="text-xs font-bold text-indigo-600 uppercase">{service.type}</span>
              </div>
              <p className="text-lg font-black text-slate-800">{formatCurrency(service.defaultPrice)}</p>
            </div>
          </div>
        ))}
        {filteredServices.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            Nenhum modelo de serviço criado ainda.
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-800">{editingService ? 'Editar Modelo' : 'Novo Modelo'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-50">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome do Pacote/Serviço</label>
                <input 
                  required
                  type="text" 
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Ensaio Gestante Standard"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descrição</label>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Descreva o que está incluso no pacote..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Preço Base (R$)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                      value={formData.defaultPrice}
                      onChange={e => setFormData({ ...formData, defaultPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Cobrança</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition appearance-none"
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value as ServiceType })}
                  >
                    <option value={ServiceType.PACKAGE}>Pacote</option>
                    <option value={ServiceType.HOURLY}>Hora</option>
                    <option value={ServiceType.DAILY}>Diária</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-600 font-bold border border-slate-200 rounded-2xl hover:bg-slate-50 transition">
                  Cancelar
                </button>
                <button type="submit" className="flex-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition">
                  Salvar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesView;
