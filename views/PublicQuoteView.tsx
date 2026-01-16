
import React, { useEffect, useState } from 'react';
import { Quote, PhotographerProfile, Client, QuoteStatus } from '../types';
import { Download, CheckCircle, ShieldCheck } from 'lucide-react';
import { generateQuotePDF } from '../services/pdfService';

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
    const quotesData = localStorage.getItem(`photo_quotes_${userId}`);
    const profileData = localStorage.getItem(`photo_profile_${userId}`);
    const clientsData = localStorage.getItem(`photo_clients_${userId}`);

    if (quotesData && profileData && clientsData) {
      const quotes: Quote[] = JSON.parse(quotesData);
      const foundIndex = quotes.findIndex(q => q.id === quoteId);
      
      if (foundIndex !== -1) {
        const foundQuote = quotes[foundIndex];
        setQuote(foundQuote);
        setProfile(JSON.parse(profileData));
        const clients: Client[] = JSON.parse(clientsData);
        setClient(clients.find(c => c.id === foundQuote.clientId) || null);
        
        if (foundQuote.status === QuoteStatus.APPROVED) {
          setApproved(true);
        }

        if (foundQuote.status === QuoteStatus.SENT || foundQuote.status === QuoteStatus.DRAFT) {
           const updatedQuotes = [...quotes];
           updatedQuotes[foundIndex] = { ...foundQuote, status: QuoteStatus.VIEWED };
           localStorage.setItem(`photo_quotes_${userId}`, JSON.stringify(updatedQuotes));
        }
      }
    }
    setLoading(false);
  }, [quoteId, userId]);

  const handleApprove = () => {
    if (!quote) return;
    const quotesData = localStorage.getItem(`photo_quotes_${userId}`);
    if (quotesData) {
      const quotes: Quote[] = JSON.parse(quotesData);
      const updated = quotes.map(q => 
        q.id === quoteId ? { ...q, status: QuoteStatus.APPROVED } : q
      );
      localStorage.setItem(`photo_quotes_${userId}`, JSON.stringify(updated));
    }
    setApproved(true);
  };

  const handleDownloadPDF = () => {
    if (quote && profile && client) {
      generateQuotePDF(quote, profile, client);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (loading) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!quote || !profile || !client) return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">Orçamento não encontrado</h1>
        <p className="text-slate-500">Este link pode ter expirado ou o orçamento foi removido.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 md:py-16 flex flex-col items-center selection:bg-indigo-100">
      
      <div className="w-full max-w-[210mm] space-y-6">
        
        {/* Barra de Ações (Escondida no Print) */}
        <div className="flex justify-between items-center no-print px-4">
          <button 
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-indigo-200 transition active:scale-95"
          >
            <Download size={18} />
            <span>⬇️ Baixar PDF</span>
          </button>
          
          {approved && (
            <div className="flex items-center space-x-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
              <CheckCircle size={20} />
              <span>Aprovado</span>
            </div>
          )}
        </div>

        {/* Card do Orçamento (A4 Digital) */}
        <div id="pdf-content" className="bg-white rounded-xl border border-slate-200 shadow-xl p-12 md:p-20 overflow-hidden text-[#1e293b]">
          
          {/* Header Section */}
          <div className="flex justify-between items-start gap-10">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#4f46e5] mb-2 leading-tight">
                {profile.studioName || profile.name}
              </h1>
              <div className="text-[14px] text-[#475569] space-y-0.5">
                <p>{profile.name}</p>
                <p>CNPJ/CPF: {profile.taxId}</p>
                <p>{profile.address}</p>
                <p>{profile.phone}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-[#1e293b] leading-none mb-1">ORÇAMENTO</h2>
              <p className="font-bold text-[#1e293b]"><strong>#{quote.number}</strong></p>
              <div className="text-[12px] text-[#475569] mt-4 leading-tight">
                <p>Emissão: {new Date(quote.date).toLocaleDateString('pt-BR')}</p>
                <p>Vencimento: {new Date(quote.validUntil).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[#e2e8f0] w-full my-8"></div>

          {/* Client & Status Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 justify-between gap-10 mb-10">
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-[1px] text-[#4f46e5] mb-3">Cliente</h3>
              <div>
                <p className="text-[16px] font-bold text-[#1e293b] leading-tight mb-1">{client.name}</p>
                <p className="text-[14px] text-[#475569]">CPF/CNPJ: {client.taxId || '---'}</p>
                <p className="text-[14px] text-[#475569]">E-mail: {client.email}</p>
                <p className="text-[14px] text-[#475569] max-w-sm leading-snug">{client.address}</p>
              </div>
            </div>
            <div className="md:text-right">
              <h3 className="text-[12px] font-bold uppercase tracking-[1px] text-[#4f46e5] mb-3">Status</h3>
              <span className="inline-block px-4 py-1.5 rounded-full bg-[#eef2ff] text-[#4338ca] text-[13px] font-bold border border-[#e0e7ff]">
                {quote.status}
              </span>
            </div>
          </div>

          {/* Table Section */}
          <div className="mb-10">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-[#f8fafc]">
                  <th className="py-3 px-4 text-left text-[13px] font-bold text-[#475569]">Serviço</th>
                  <th className="py-3 px-4 text-center text-[13px] font-bold text-[#475569]">Qtd</th>
                  <th className="py-3 px-4 text-right text-[13px] font-bold text-[#475569]">Unitário</th>
                  <th className="py-3 px-4 text-right text-[13px] font-bold text-[#475569]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {quote.items.map(item => (
                  <tr key={item.id} className="text-[#1e293b]">
                    <td className="py-4 px-4 align-top">
                      <p className="font-bold">{item.name}</p>
                      {item.description && <p className="text-[12px] text-[#94a3b8] mt-0.5">{item.description}</p>}
                    </td>
                    <td className="py-4 px-4 text-center text-[14px] align-top">{item.quantity} {item.type}</td>
                    <td className="py-4 px-4 text-right text-[14px] align-top">{formatCurrency(item.unitPrice)}</td>
                    <td className="py-4 px-4 text-right font-bold text-[14px] align-top">{formatCurrency(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex flex-col items-end space-y-3 mb-12">
            <div className="w-full max-w-[260px] flex justify-between text-[14px] text-[#475569]">
              <span>Subtotal</span>
              <span>{formatCurrency(quote.total + (quote.discount || 0))}</span>
            </div>
            
            <div className="h-px bg-[#e2e8f0] w-full max-w-[260px] my-1"></div>
            
            <div className="w-full max-w-[260px] flex justify-between text-[20px] font-bold text-[#4f46e5]">
              <span>Total Final</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>

          {/* Bottom Grid: Payment & Signature */}
          <div className="space-y-12">
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-[1px] text-[#4f46e5] mb-3">Pagamento</h3>
              <div className="bg-[#f8fafc] border border-[#e2e8f0] p-4 rounded-xl text-[14px] text-[#475569] leading-relaxed">
                <p><strong className="text-[#1e293b]">Método:</strong> {quote.paymentMethod}</p>
                <p>{quote.paymentConditions}</p>
              </div>
            </div>

            <div className="pt-10">
              <div className="w-64 border-t border-[#e2e8f0] pt-3">
                <p className="text-[16px] font-bold text-[#1e293b] leading-tight">{profile.name}</p>
                <p className="text-[11px] font-bold text-[#94a3b8] uppercase tracking-[1px] mt-1">Assinatura do Fotógrafo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de Aprovação Flutuante (Opcional) */}
        {!approved && (
          <button 
            onClick={handleApprove}
            className="w-full bg-[#10b981] hover:bg-[#059669] text-white py-5 rounded-xl font-bold text-xl shadow-xl shadow-emerald-100 transition active:scale-[0.98] flex items-center justify-center space-x-3 no-print"
          >
            <ShieldCheck size={28} />
            <span>APROVAR ORÇAMENTO ONLINE</span>
          </button>
        )}

        <footer className="text-center py-10 no-print">
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
            Gerado com FocusQuote Professional
          </p>
        </footer>
      </div>
    </div>
  );
};

export default PublicQuoteView;
