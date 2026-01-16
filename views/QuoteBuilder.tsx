
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Quote, 
  QuoteStatus, 
  Client, 
  QuoteItem, 
  ServiceType, 
  PaymentMethod, 
  PhotographerProfile,
  ServiceTemplate
} from '../types';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Briefcase,
  Image as ImageIcon,
  X,
  User,
  CreditCard,
  FileText
} from 'lucide-react';

interface QuoteBuilderProps {
  profile: PhotographerProfile;
  clients: Client[];
  services: ServiceTemplate[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  initialQuoteId: string | null;
  onCancel: () => void;
  onSave: () => void;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ profile, clients, services, setQuotes, initialQuoteId, onCancel, onSave }) => {
  const [showCatalog, setShowCatalog] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Quote>>(() => {
    if (initialQuoteId) {
      const saved = localStorage.getItem('photo_session');
      const userId = saved ? JSON.parse(saved).id : '';
      const savedQuotes = JSON.parse(localStorage.getItem(`photo_quotes_${userId}`) || '[]');
      const found = savedQuotes.find((q: Quote) => q.id === initialQuoteId);
      if (found) return found;
    }
    
    return {
      id: Date.now().toString(),
      number: (Math.floor(Math.random() * 9000) + 1000).toString(),
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: QuoteStatus.DRAFT,
      items: [],
      discount: 0,
      extraFees: 0,
      paymentMethod: PaymentMethod.PIX,
      paymentConditions: profile.defaultTerms || '50% reserva + 50% entrega',
      notes: '',
      total: 0,
      coverImageUrl: ''
    };
  });

  const totals = useMemo(() => {
    const subtotal = (formData.items || []).reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
    const total = subtotal - (formData.discount || 0) + (formData.extraFees || 0);
    return { subtotal, total };
  }, [formData.items, formData.discount, formData.extraFees]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, total: totals.total }));
  }, [totals.total]);

  const addItem = () => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: '',
      description: '',
      unitPrice: 0,
      quantity: 1,
      type: ServiceType.PACKAGE
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  };

  const addFromCatalog = (template: ServiceTemplate) => {
    const newItem: QuoteItem = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      unitPrice: template.defaultPrice,
      quantity: 1,
      type: template.type
    };
    setFormData(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
    setShowCatalog(false);
  };

  const removeItem = (id: string) => {
    setFormData(prev => ({ ...prev, items: (prev.items || []).filter(item => item.id !== id) }));
  };

  const updateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setFormData(prev => ({
      ...prev,
      items: (prev.items || []).map(item => item.id === id ? { ...item, [field]: value } : item)
    }));
  };

  const handleFinalSave = () => {
    if (!formData.clientId) return alert('Selecione um cliente!');
    if (!formData.items || formData.items.length === 0) return alert('Adicione pelo menos um serviço!');

    setQuotes(prev => {
      const existing = prev.find(q => q.id === formData.id);
      if (existing) return prev.map(q => q.id === formData.id ? formData as Quote : q);
      return [formData as Quote, ...prev];
    });
    onSave();
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in fade-in duration-300">
      {/* Top Bar Fixo de Ação */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        <button onClick={onCancel} className="flex items-center text-slate-400 font-bold hover:text-slate-700 transition px-4 py-2">
          <ArrowLeft size={20} className="mr-2" /> Voltar
        </button>
        <div className="flex items-center space-x-4">
          <div className="text-right">
             <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">Total do Orçamento</p>
             <p className="text-xl font-black text-indigo-600">{formatCurrency(totals.total)}</p>
          </div>
          <button onClick={handleFinalSave} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg transition active:scale-95">
            <Save size={18} className="mr-2" /> Salvar Orçamento
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Bloco 1: Identificação */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 text-indigo-600 border-b border-slate-50 pb-4">
            <User size={18} />
            <h3 className="font-bold uppercase text-xs tracking-widest">Identificação do Projeto</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cliente</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Selecione o cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Data Emissão</label>
              <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Vencimento</label>
              <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm" value={formData.validUntil} onChange={e => setFormData({ ...formData, validUntil: e.target.value })} />
            </div>
          </div>
        </div>

        {/* Bloco 2: Itens / Serviços */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <div className="flex items-center space-x-2 text-indigo-600">
              <FileText size={18} />
              <h3 className="font-bold uppercase text-xs tracking-widest">Serviços e Entregáveis</h3>
            </div>
            <div className="flex space-x-2">
              <button onClick={() => setShowCatalog(true)} className="flex items-center space-x-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition">
                <Briefcase size={14} />
                <span>Puxar do Catálogo</span>
              </button>
              <button onClick={addItem} className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900 transition">
                <Plus size={14} />
                <span>Adicionar Item</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {(formData.items || []).map((item) => (
              <div key={item.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group transition-all">
                <button onClick={() => removeItem(item.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition">
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-6 space-y-2">
                    <input className="w-full font-bold text-slate-800 bg-transparent border-none focus:ring-0 p-0 text-base" placeholder="Nome do Serviço (Ex: Cobertura Fotográfica 4h)" value={item.name} onChange={e => updateItem(item.id, 'name', e.target.value)} />
                    <textarea className="w-full text-xs text-slate-500 bg-transparent border-none focus:ring-0 p-0 resize-none" rows={2} placeholder="O que está incluso?" value={item.description} onChange={e => updateItem(item.id, 'description', e.target.value)} />
                  </div>
                  <div className="md:col-span-3">
                    <div className="flex items-center justify-center space-x-2 mt-2">
                       <span className="text-[10px] font-bold text-slate-400 uppercase">Qtd:</span>
                       <input type="number" min="1" className="w-12 text-center bg-white border border-slate-200 rounded-lg py-1 font-bold text-slate-700" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} />
                       <select className="bg-transparent text-[10px] font-bold text-slate-500 uppercase outline-none" value={item.type} onChange={e => updateItem(item.id, 'type', e.target.value as ServiceType)}>
                          <option value={ServiceType.PACKAGE}>UN</option>
                          <option value={ServiceType.HOURLY}>HR</option>
                          <option value={ServiceType.DAILY}>DIA</option>
                       </select>
                    </div>
                  </div>
                  <div className="md:col-span-3 flex flex-col justify-center items-end">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Valor Unitário</p>
                    <div className="flex items-center bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 text-xs mr-1">R$</span>
                      <input type="number" className="text-right text-sm font-black text-indigo-600 bg-transparent border-none focus:ring-0 w-24 p-0" value={item.unitPrice} onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(!formData.items || formData.items.length === 0) && (
              <button onClick={addItem} className="w-full py-12 border-2 border-dashed border-slate-100 rounded-2xl text-slate-400 hover:border-indigo-300 hover:text-indigo-400 transition flex flex-col items-center justify-center">
                <Plus size={24} className="mb-2" />
                <span className="text-sm font-medium">Clique para começar a adicionar os serviços</span>
              </button>
            )}
          </div>
        </div>

        {/* Bloco 3: Pagamento e Finalização */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-2 text-indigo-600 border-b border-slate-50 pb-4">
              <CreditCard size={18} />
              <h3 className="font-bold uppercase text-xs tracking-widest">Financeiro & Pagamento</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Desconto (R$)</label>
                <input type="number" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Método</label>
                <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none" value={formData.paymentMethod} onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}>
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Condições de Pagamento</label>
              <textarea className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none" rows={3} value={formData.paymentConditions} onChange={e => setFormData({ ...formData, paymentConditions: e.target.value })} />
            </div>
          </div>

          <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl flex flex-col justify-between relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
             <div>
                <h3 className="text-lg font-bold mb-6 text-indigo-400 uppercase tracking-widest text-xs">Resumo do Orçamento</h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-slate-400"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
                  {formData.discount ? <div className="flex justify-between text-red-400"><span>Desconto</span><span>- {formatCurrency(formData.discount)}</span></div> : null}
                  <div className="h-px bg-white/10 my-4"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Valor Final</span>
                    <span className="text-3xl font-black text-indigo-400 tracking-tight">{formatCurrency(totals.total)}</span>
                  </div>
                </div>
             </div>
             <button onClick={handleFinalSave} className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-black text-lg transition shadow-lg flex items-center justify-center">
               <Save size={20} className="mr-3" /> Gerar Proposta Agora
             </button>
          </div>
        </div>
      </div>

      {/* MODAL CATÁLOGO */}
      {showCatalog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
               <h3 className="text-xl font-bold text-slate-800">Seu Catálogo</h3>
               <button onClick={() => setShowCatalog(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={24} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {services.map(s => (
                <button key={s.id} onClick={() => addFromCatalog(s)} className="w-full text-left p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition flex justify-between items-center">
                   <div>
                    <p className="font-bold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase">{s.type}</p>
                   </div>
                   <p className="text-sm font-black text-indigo-600">{formatCurrency(s.defaultPrice)}</p>
                </button>
              ))}
              {services.length === 0 && (
                <div className="py-10 text-center text-slate-400">Nenhum modelo cadastrado.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBuilder;
