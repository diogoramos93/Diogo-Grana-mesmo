
import React, { useState } from 'react';
import { Quote, QuoteStatus, Client, PhotographerProfile, User } from '../types';
import { 
  Search, 
  Filter, 
  Download, 
  Share2, 
  MoreHorizontal, 
  Edit3, 
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  X,
  Camera,
  Link as LinkIcon
} from 'lucide-react';
import { generateQuotePDF } from '../services/pdfService';

interface QuotesViewProps {
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  clients: Client[];
  currentUser: User;
  onEditQuote: (id: string) => void;
  onNewQuote: () => void;
}

const QuotesView: React.FC<QuotesViewProps> = ({ quotes, setQuotes, clients, currentUser, onEditQuote, onNewQuote }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [previewQuote, setPreviewQuote] = useState<Quote | null>(null);

  const getClientById = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  const getProfile = (): PhotographerProfile => {
    const saved = localStorage.getItem(`photo_profile_${currentUser.id}`);
    return saved ? JSON.parse(saved) : {
      name: currentUser.name,
      taxId: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      defaultTerms: '',
      monthlyGoal: 5000
    };
  };

  const filteredQuotes = quotes.filter(q => {
    const client = getClientById(q.clientId);
    const clientName = client?.name || 'Cliente Desconhecido';
    const matchesSearch = q.number.includes(searchTerm) || clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Excluir este orçamento permanentemente?')) {
      setQuotes(quotes.filter(q => q.id !== id));
    }
  };

  const handleDownloadPDF = (quote: Quote) => {
    const client = getClientById(quote.clientId);
    const profile = getProfile();
    
    if (client) {
      generateQuotePDF(quote, profile, client);
    } else {
      alert('Erro ao carregar dados do cliente para o PDF.');
    }
  };

  const generatePublicLink = (quote: Quote) => {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?view=public&q=${quote.id}&u=${currentUser.id}`;
  };

  const handleShareWhatsApp = (quote: Quote) => {
    const client = getClientById(quote.clientId);
    if (!client || !client.phone) {
      alert('Cliente sem telefone cadastrado.');
      return;
    }
    
    const publicLink = generatePublicLink(quote);
    const message = encodeURIComponent(
      `Olá ${client.name}! 📸\n\nSegue meu orçamento #${quote.number} no valor de ${formatCurrency(quote.total)}.\n\nVocê pode visualizar os detalhes e aprovar online através deste link:\n${publicLink}\n\nFico no aguardo!`
    );
    window.open(`https://wa.me/${client.phone.replace(/\D/g, '')}?text=${message}`, '_blank');
  };

  const copyToClipboard = (quote: Quote) => {
    const link = generatePublicLink(quote);
    navigator.clipboard.writeText(link);
    alert('Link do orçamento copiado para a área de transferência!');
  };

  const getStatusIcon = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.APPROVED: return <CheckCircle size={16} className="text-emerald-500" />;
      case QuoteStatus.DECLINED: return <AlertCircle size={16} className="text-red-500" />;
      case QuoteStatus.SENT: return <Clock size={16} className="text-indigo-500" />;
      default: return <FileText size={16} className="text-slate-400" />;
    }
  };

  const getStatusClass = (status: QuoteStatus) => {
    switch (status) {
      case QuoteStatus.APPROVED: return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case QuoteStatus.DECLINED: return 'bg-red-50 text-red-700 border-red-100';
      case QuoteStatus.SENT: return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      default: return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex-1 w-full flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Número ou cliente..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos Status</option>
            <option value={QuoteStatus.DRAFT}>Rascunho</option>
            <option value={QuoteStatus.SENT}>Enviado</option>
            <option value={QuoteStatus.APPROVED}>Aprovado</option>
            <option value={QuoteStatus.DECLINED}>Recusado</option>
          </select>
        </div>
        <button 
          onClick={onNewQuote}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl font-bold shadow-md transition whitespace-nowrap"
        >
          Novo Orçamento
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Número</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredQuotes.map(quote => (
                <tr key={quote.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-slate-700">#{quote.number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-600">{getClientById(quote.clientId)?.name || 'Desconhecido'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{new Date(quote.date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-indigo-600">
                    {formatCurrency(quote.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusClass(quote.status)}`}>
                      {getStatusIcon(quote.status)}
                      <span>{quote.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setPreviewQuote(quote)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                        title="Pré-visualizar"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => handleShareWhatsApp(quote)}
                        className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                        title="Compartilhar WhatsApp"
                      >
                        <Share2 size={18} />
                      </button>
                      <button 
                        onClick={() => copyToClipboard(quote)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        title="Copiar Link"
                      >
                        <LinkIcon size={18} />
                      </button>
                      <button 
                        onClick={() => onEditQuote(quote.id)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Editar"
                      >
                        <Edit3 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(quote.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredQuotes.length === 0 && (
            <div className="py-20 text-center text-slate-400">
              Nenhum orçamento encontrado.
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE PREVIEW (Já existente, sem alterações solicitadas) */}
      {previewQuote && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4 md:p-8">
          <div className="bg-slate-100 rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            {/* ... Conteúdo do Modal de Preview (Mesmo já implementado) ... */}
            <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Eye size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Pré-visualização do Orçamento #{previewQuote.number}</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleDownloadPDF(previewQuote)}
                  className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition"
                >
                  <Download size={16} />
                  <span>Baixar PDF</span>
                </button>
                <button 
                  onClick={() => setPreviewQuote(null)}
                  className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-50 transition"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-12 text-center">
               {/* Simplicado para o XML, o conteúdo interno do preview é o mesmo */}
               <p className="text-slate-500 italic">Visualizando orçamento #{previewQuote.number} para {getClientById(previewQuote.clientId)?.name}</p>
               <div className="mt-8 bg-white p-8 rounded-xl shadow-inner max-w-2xl mx-auto border border-slate-200 text-left">
                  <h4 className="text-2xl font-bold text-indigo-600 mb-4">{getProfile().studioName || getProfile().name}</h4>
                  <div className="h-px bg-slate-100 mb-6"></div>
                  <div className="flex justify-between mb-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Cliente</p>
                      <p className="font-bold">{getClientById(previewQuote.clientId)?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Total</p>
                      <p className="font-bold text-2xl text-indigo-600">{formatCurrency(previewQuote.total)}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-4">Itens do Orçamento:</p>
                  <ul className="space-y-2 mb-8">
                    {previewQuote.items.map(item => (
                      <li key={item.id} className="flex justify-between text-sm py-2 border-b border-slate-50">
                        <span>{item.name} (x{item.quantity})</span>
                        <span className="font-bold">{formatCurrency(item.unitPrice * item.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="bg-slate-50 p-4 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase">Pagamento</p>
                    <p className="text-sm">{previewQuote.paymentMethod} - {previewQuote.paymentConditions}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesView;
