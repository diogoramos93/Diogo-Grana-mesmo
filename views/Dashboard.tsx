
import React from 'react';
import { Quote, QuoteStatus, PhotographerProfile } from '../types';
import { TrendingUp, FileText, CheckCircle, Clock, ArrowRight } from 'lucide-react';

interface DashboardProps {
  quotes: Quote[];
  profile: PhotographerProfile;
  onNewQuote: () => void;
  onViewQuotes: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ quotes, profile, onNewQuote, onViewQuotes }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Faturamento total aprovado (geral)
  const totalRevenue = quotes
    .filter(q => q.status === QuoteStatus.APPROVED)
    .reduce((sum, q) => sum + q.total, 0);

  // Faturamento aprovado APENAS no mês atual para a meta
  const currentMonthRevenue = quotes
    .filter(q => {
      const qDate = new Date(q.date);
      return q.status === QuoteStatus.APPROVED && 
             qDate.getMonth() === currentMonth && 
             qDate.getFullYear() === currentYear;
    })
    .reduce((sum, q) => sum + q.total, 0);

  const stats = {
    total: quotes.length,
    approved: quotes.filter(q => q.status === QuoteStatus.APPROVED).length,
    pending: quotes.filter(q => q.status === QuoteStatus.SENT || q.status === QuoteStatus.DRAFT).length,
    revenue: totalRevenue
  };

  const recentQuotes = [...quotes].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Cálculo da Meta
  const goalValue = profile.monthlyGoal || 5000;
  const progressPercent = Math.min(Math.round((currentMonthRevenue / goalValue) * 100), 100);

  const StatCard = ({ title, value, icon: Icon, colorClass, bgColorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
      <div className={`${bgColorClass} p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bem-vindo de volta!</h1>
          <p className="text-slate-500">Aqui está o resumo da sua produtividade fotográfica.</p>
        </div>
        <button 
          onClick={onNewQuote}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-95"
        >
          Novo Orçamento
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Faturamento Aprovado" 
          value={formatCurrency(stats.revenue)} 
          icon={TrendingUp} 
          colorClass="text-emerald-600" 
          bgColorClass="bg-emerald-50" 
        />
        <StatCard 
          title="Total de Orçamentos" 
          value={stats.total} 
          icon={FileText} 
          colorClass="text-indigo-600" 
          bgColorClass="bg-indigo-50" 
        />
        <StatCard 
          title="Aprovados" 
          value={stats.approved} 
          icon={CheckCircle} 
          colorClass="text-blue-600" 
          bgColorClass="bg-blue-50" 
        />
        <StatCard 
          title="Pendentes" 
          value={stats.pending} 
          icon={Clock} 
          colorClass="text-amber-600" 
          bgColorClass="bg-amber-50" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Quotes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800">Orçamentos Recentes</h3>
            <button 
              onClick={onViewQuotes}
              className="text-indigo-600 text-sm font-semibold flex items-center hover:underline"
            >
              Ver todos <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentQuotes.length > 0 ? (
              recentQuotes.map(quote => (
                <div key={quote.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">#{quote.number}</p>
                      <p className="text-sm text-slate-500">{new Date(quote.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{formatCurrency(quote.total)}</p>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      quote.status === QuoteStatus.APPROVED ? 'bg-emerald-100 text-emerald-700' :
                      quote.status === QuoteStatus.DECLINED ? 'bg-red-100 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {quote.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-400">
                Nenhum orçamento criado ainda.
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Goal Progress */}
        <div className="bg-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Sua Meta 📸</h3>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Você já faturou <span className="text-white font-bold">{formatCurrency(currentMonthRevenue)}</span> este mês. 
              {progressPercent >= 100 
                ? " Parabéns! Você atingiu sua meta mensal!" 
                : ` Faltam ${formatCurrency(goalValue - currentMonthRevenue)} para o seu objetivo.`}
            </p>
          </div>
          <div className="mt-8 bg-indigo-800/50 p-4 rounded-xl border border-indigo-700">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-indigo-300 uppercase font-bold">Progresso Mensal</p>
              <p className="text-xs text-white font-bold">{progressPercent}%</p>
            </div>
            <div className="w-full bg-indigo-950 h-3 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)] transition-all duration-1000 ${
                  progressPercent >= 100 ? 'bg-emerald-400' : 'bg-indigo-400'
                }`}
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <p className="text-right text-[10px] mt-2 text-indigo-200 italic">Meta: {formatCurrency(goalValue)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
