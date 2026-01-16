
import React, { useEffect, useState } from 'react';
import { Quote, PhotographerProfile, Client, QuoteStatus } from '../types';
import { Camera, CheckCircle, Download, ExternalLink, ShieldCheck, MapPin, Mail, Phone } from 'lucide-react';

interface PublicQuoteViewProps {
  quoteId: string;
  userId: string;
}

const PublicQuoteView: React.FC<PublicQuoteViewProps> = ({ quoteId, userId }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    // Simulate loading data from user-specific bucket
    const quotesData = localStorage.getItem(`photo_quotes_${userId}`);
    const profileData = localStorage.getItem(`photo_profile_${userId}`);
    const clientsData = localStorage.getItem(`photo_clients_${userId}`);

    if (quotesData && profileData && clientsData) {
      const quotes: Quote[] = JSON.parse(quotesData);
      const foundQuote = quotes.find(q => q.id === quoteId);
      
      if (foundQuote) {
        setQuote(foundQuote);
        setProfile(JSON.parse(profileData));
        const clients: Client[] = JSON.parse(clientsData);
        setClient(clients.find(c => c.id === foundQuote.clientId) || null);
        
        if (foundQuote.status === QuoteStatus.APPROVED) {
          setApproved(true);
        }
      }
    }
    setLoading(false);
  }, [quoteId, userId]);

  const handleApprove = () => {
    if (!quote) return;
    
    // In a real app, this would update the database
    // Here we update the localStorage of the user
    const quotesData = localStorage.getItem(`photo_quotes_${userId}`);
    if (quotesData) {
      const quotes: Quote[] = JSON.parse(quotesData);
      const updated = quotes.map(q => 
        q.id === quoteId ? { ...q, status: QuoteStatus.APPROVED } : q
      );
      localStorage.setItem(`photo_quotes_${userId}`, JSON.stringify(updated));
    }
    
    setApproved(true);
    alert('Orçamento aprovado com sucesso! O fotógrafo será notificado.');
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!quote || !profile) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl shadow-lg">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Orçamento não encontrado</h1>
        <p className="text-slate-500">Este link pode ter expirado ou o orçamento foi removido.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 md:px-8">
      <div className="max-w-4xl w-full">
        {/* Header Publico */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
              <Camera size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">FocusQuote</h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visualização do Cliente</p>
            </div>
          </div>
          {approved && (
            <div className="bg-emerald-50 text-emerald-700 px-6 py-2 rounded-full border border-emerald-100 flex items-center space-x-2 font-bold animate-bounce">
              <CheckCircle size={20} />
              <span>Orçamento Aprovado</span>
            </div>
          )}
        </div>

        {/* Card Principal do Orçamento */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col">
          {/* Top Banner */}
          <div className="bg-indigo-900 p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-black">{profile.studioName || profile.name}</h2>
              <div className="flex flex-wrap gap-4 text-indigo-200 text-sm">
                <span className="flex items-center space-x-1"><Phone size={14} /> <span>{profile.phone}</span></span>
                <span className="flex items-center space-x-1"><Mail size={14} /> <span>{profile.email}</span></span>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-right min-w-[200px]">
              <p className="text-indigo-300 text-xs font-bold uppercase mb-1">Total do Orçamento</p>
              <p className="text-3xl font-black">{formatCurrency(quote.total)}</p>
              <p className="text-[10px] text-indigo-300 mt-2">Válido até {new Date(quote.validUntil).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>

          <div className="p-8 md:p-12 space-y-12">
            {/* Infos Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-indigo-600 uppercase mb-4 tracking-widest">Para</h3>
                <p className="text-2xl font-bold text-slate-800">{client?.name}</p>
                <p className="text-slate-500 mt-1">{client?.address}</p>
              </div>
              <div className="md:text-right">
                <h3 className="text-xs font-bold text-indigo-600 uppercase mb-4 tracking-widest">Identificação</h3>
                <p className="text-lg font-bold text-slate-700">Orçamento #{quote.number}</p>
                <p className="text-slate-500 mt-1">Data: {new Date(quote.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            {/* Tabela de Itens */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">Serviços Propostos</h3>
              <div className="divide-y divide-slate-50">
                {quote.items.map(item => (
                  <div key={item.id} className="py-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex-1">
                      <p className="text-lg font-bold text-slate-800">{item.name}</p>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">{item.description}</p>
                    </div>
                    <div className="flex items-center space-x-8">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Qtd</p>
                        <p className="text-slate-700 font-medium">{item.quantity} {item.type}</p>
                      </div>
                      <div className="text-right min-w-[120px]">
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Subtotal</p>
                        <p className="text-lg font-bold text-slate-800">{formatCurrency(item.unitPrice * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo Financeiro */}
            <div className="bg-slate-50 rounded-3xl p-8 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="space-y-4 flex-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Forma de Pagamento</h4>
                  <p className="font-bold text-slate-700">{quote.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase mb-1">Condições</h4>
                  <p className="text-sm text-slate-600">{quote.paymentConditions}</p>
                </div>
              </div>
              <div className="w-full md:w-64 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(quote.total + quote.discount - quote.extraFees)}</span>
                </div>
                {quote.discount > 0 && (
                  <div className="flex justify-between text-sm text-red-500 font-medium">
                    <span>Desconto Aplicado</span>
                    <span>- {formatCurrency(quote.discount)}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-800">Total Final</span>
                  <span className="text-2xl font-black text-indigo-600">{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>

            {/* Observações do Fotografo */}
            {(quote.notes || profile.defaultTerms) && (
              <div className="border-l-4 border-indigo-100 pl-6 py-2">
                <h3 className="text-xs font-bold text-indigo-600 uppercase mb-2 tracking-widest">Informações Importantes</h3>
                <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line italic">
                  {quote.notes || profile.defaultTerms}
                </p>
              </div>
            )}
          </div>

          {/* Footer / Ações */}
          <div className="bg-slate-50 p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100">
             <div className="flex items-center space-x-4 text-slate-400">
                <ShieldCheck size={40} className="text-indigo-200" />
                <div className="text-xs">
                  <p className="font-bold text-slate-600">Ambiente Seguro</p>
                  <p>Sua proposta está protegida digitalmente.</p>
                </div>
             </div>
             <div className="flex flex-wrap justify-center gap-3">
               {!approved ? (
                 <>
                   <button 
                     onClick={() => alert('Entre em contato com o fotógrafo para solicitar alterações.')}
                     className="px-8 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition"
                   >
                     Solicitar Alteração
                   </button>
                   <button 
                     onClick={handleApprove}
                     className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 transition active:scale-95 flex items-center space-x-2"
                   >
                     <CheckCircle size={20} />
                     <span>Aprovar Orçamento Agora</span>
                   </button>
                 </>
               ) : (
                 <div className="text-center">
                    <p className="text-emerald-600 font-bold mb-1">Orçamento Aprovado com Sucesso!</p>
                    <p className="text-slate-400 text-xs italic">O fotógrafo entrará em contato em breve para os próximos passos.</p>
                 </div>
               )}
             </div>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-400 text-sm flex items-center justify-center space-x-2">
          <span>Powered by FocusQuote</span>
          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
          <span>{new Date().getFullYear()}</span>
        </div>
      </div>
    </div>
  );
};

export default PublicQuoteView;
