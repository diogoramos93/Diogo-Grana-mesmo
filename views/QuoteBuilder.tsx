
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Quote, 
  QuoteStatus, 
  Client, 
  QuoteItem, 
  ServiceType, 
  PaymentMethod, 
  PhotographerProfile 
} from '../types';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Calculator, 
  Save, 
  Calendar, 
  Info,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface QuoteBuilderProps {
  profile: PhotographerProfile;
  clients: Client[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  initialQuoteId: string | null;
  onCancel: () => void;
  onSave: () => void;
}

const QuoteBuilder: React.FC<QuoteBuilderProps> = ({ profile, clients, setQuotes, initialQuoteId, onCancel, onSave }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Quote>>(() => {
    if (initialQuoteId) {
      const savedQuotes = JSON.parse(localStorage.getItem('photo_quotes') || '[]');
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
      paymentConditions: '50% reserva + 50% entrega',
      notes: '',
      total: 0
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
    if (!formData.clientId) {
      alert('Selecione um cliente!');
      setStep(1);
      return;
    }
    if (!formData.items || formData.items.length === 0) {
      alert('Adicione pelo menos um serviço!');
      setStep(2);
      return;
    }

    setQuotes(prev => {
      const existing = prev.find(q => q.id === formData.id);
      if (existing) {
        return prev.map(q => q.id === formData.id ? formData as Quote : q);
      }
      return [formData as Quote, ...prev];
    });
    onSave();
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((s) => (
        <React.Fragment key={s}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${
            step === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' :
            step > s ? 'bg-indigo-50 border-indigo-200 text-indigo-600' :
            'bg-white border-slate-200 text-slate-400'
          }`}>
            {step > s ? '✓' : s}
          </div>
          {s < 3 && <div className={`w-16 h-0.5 ${step > s ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>}
        </React.Fragment>
      ))}
    </div>
  );

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onCancel} className="flex items-center text-slate-500 hover:text-slate-800 transition">
          <ArrowLeft size={20} className="mr-2" />
          Voltar
        </button>
        <div className="text-right">
          <span className="text-xs font-bold text-slate-400 uppercase">Orçamento #{formData.number}</span>
          <h2 className="text-xl font-bold text-slate-800">Criação Detalhada</h2>
        </div>
      </div>

      <StepIndicator />

      {/* STEP 1: CLIENT & DATES */}
      {step === 1 && (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 animate-in slide-in-from-right-4 duration-300">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
            <Info size={20} className="mr-2 text-indigo-600" /> Informações do Cliente e Prazos
          </h3>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Selecionar Cliente</label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition"
                value={formData.clientId}
                onChange={e => setFormData({ ...formData, clientId: e.target.value })}
              >
                <option value="">Selecione um cliente...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {clients.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">⚠️ Você ainda não tem clientes cadastrados.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Data de Emissão</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Válido Até</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  value={formData.validUntil}
                  onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Status do Orçamento</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.values(QuoteStatus).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`py-2 text-xs font-bold rounded-lg border transition ${
                      formData.status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-10 flex justify-end">
            <button 
              onClick={() => setStep(2)}
              className="flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
            >
              Continuar <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SERVICES */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
          <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 flex items-center">Serviços Fotográficos</h3>
            <button 
              onClick={addItem}
              className="flex items-center text-indigo-600 font-bold text-sm bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
            >
              <Plus size={18} className="mr-1" /> Adicionar Item
            </button>
          </div>

          <div className="space-y-4">
            {(formData.items || []).map((item, index) => (
              <div key={item.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative group">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-2 transition"
                >
                  <Trash2 size={20} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Nome do Serviço</label>
                      <input 
                        placeholder="Ex: Ensaio Gestante"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        value={item.name}
                        onChange={e => updateItem(item.id, 'name', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Descrição Opcional</label>
                      <textarea 
                        rows={2}
                        placeholder="Ex: Inclui 20 fotos editadas..."
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Tipo</label>
                      <select 
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        value={item.type}
                        onChange={e => updateItem(item.id, 'type', e.target.value as ServiceType)}
                      >
                        <option value={ServiceType.PACKAGE}>Pacote</option>
                        <option value={ServiceType.HOURLY}>Hora</option>
                        <option value={ServiceType.DAILY}>Diária</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Qtd</label>
                      <input 
                        type="number" 
                        min="1"
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                        value={item.quantity}
                        onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Vlr Unitário</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-slate-400 text-sm">R$</span>
                        <input 
                          type="number" 
                          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                          value={item.unitPrice}
                          onChange={e => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Total Item</label>
                      <p className="py-2 font-bold text-slate-700">{formatCurrency(item.unitPrice * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(formData.items || []).length === 0 && (
              <div className="py-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 text-slate-400">
                Adicione serviços para este orçamento.
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-between">
            <button onClick={() => setStep(1)} className="flex items-center text-slate-600 font-bold px-6 py-3">
              <ChevronLeft size={20} className="mr-2" /> Voltar
            </button>
            <button 
              onClick={() => setStep(3)}
              className="flex items-center bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition"
            >
              Financeiro <ChevronRight size={20} className="ml-2" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: FINANCIAL & SUMMARY */}
      {step === 3 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Calculator size={20} className="mr-2 text-indigo-600" /> Detalhes Financeiros
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Desconto (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={formData.discount}
                    onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase">Taxas Extras (R$)</label>
                  <input 
                    type="number" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                    value={formData.extraFees}
                    onChange={e => setFormData({ ...formData, extraFees: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Forma de Pagamento Preferencial</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                >
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Condições de Pagamento</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  value={formData.paymentConditions}
                  onChange={e => setFormData({ ...formData, paymentConditions: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase">Notas Internas / Observações</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500"
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Aparece no rodapé do orçamento..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-indigo-900 p-8 rounded-3xl text-white shadow-xl">
              <h3 className="text-xl font-bold mb-6">Resumo do Orçamento</h3>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-indigo-300">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                {formData.discount ? (
                  <div className="flex justify-between text-red-300">
                    <span>Desconto</span>
                    <span>- {formatCurrency(formData.discount)}</span>
                  </div>
                ) : null}
                {formData.extraFees ? (
                  <div className="flex justify-between text-indigo-300">
                    <span>Taxas Extras</span>
                    <span>+ {formatCurrency(formData.extraFees)}</span>
                  </div>
                ) : null}
                <div className="h-px bg-indigo-800 my-4"></div>
                <div className="flex justify-between text-2xl font-bold">
                  <span>Total Final</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider">Cliente Selecionado</p>
                <p className="text-sm font-medium">{clients.find(c => c.id === formData.clientId)?.name || 'Nenhum cliente selecionado'}</p>
                <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-4">Vencimento</p>
                <p className="text-sm font-medium">{new Date(formData.validUntil || '').toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <button 
                onClick={handleFinalSave}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center transition active:scale-95"
              >
                <Save size={20} className="mr-2" /> Salvar Orçamento
              </button>
              <button onClick={() => setStep(2)} className="w-full text-slate-500 font-bold py-3">
                Voltar aos Serviços
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteBuilder;
