
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  UserCircle, 
  PlusCircle, 
  Camera,
  LogOut,
  Menu,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { PhotographerProfile, Client, Quote, QuoteStatus, User, ServiceTemplate, ServiceType, PaymentMethod } from './types';
import Dashboard from './views/Dashboard';
import ClientsView from './views/ClientsView';
import QuotesView from './views/QuotesView';
import ProfileView from './views/ProfileView';
import QuoteBuilder from './views/QuoteBuilder';
import AdminView from './views/AdminView';
import LoginView from './views/LoginView';
import PublicQuoteView from './views/PublicQuoteView';
import ServicesView from './views/ServicesView';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('photo_session');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState<string | null>(null);

  const [profile, setProfile] = useState<PhotographerProfile>({
    name: '', taxId: '', phone: '', whatsapp: '', email: '', address: '', defaultTerms: '', monthlyGoal: 5000
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [services, setServices] = useState<ServiceTemplate[]>([]);

  const urlParams = new URLSearchParams(window.location.search);
  const isPublicView = urlParams.get('view') === 'public';
  const publicQuoteId = urlParams.get('q');
  const publicUserId = urlParams.get('u');

  useEffect(() => {
    if (currentUser) {
      const p = localStorage.getItem(`photo_profile_${currentUser.id}`);
      const c = localStorage.getItem(`photo_clients_${currentUser.id}`);
      const q = localStorage.getItem(`photo_quotes_${currentUser.id}`);
      const s = localStorage.getItem(`photo_services_${currentUser.id}`);
      
      const loadedProfile = p ? JSON.parse(p) : {
        name: currentUser.name, studioName: currentUser.name, taxId: '32.411.918/0001-10', phone: '48 9982-5069', whatsapp: '48 9982-5069', email: 'contato@exemplo.com', address: 'Rua José Bitencurt Neto, 232 – Guarita – Sombrio',
        defaultTerms: 'Pagamento: 50% na reserva, 50% na entrega das fotos.',
        monthlyGoal: 5000
      };

      const loadedClients: Client[] = c ? JSON.parse(c) : [];
      const loadedQuotes: Quote[] = q ? JSON.parse(q) : [];
      const loadedServices: ServiceTemplate[] = s ? JSON.parse(s) : [];

      // SEED DATA: Se estiver vazio, popula para teste
      if (loadedClients.length === 0 && loadedQuotes.length === 0) {
        const testClient: Client = {
          id: 'client_test_1',
          name: 'Sicoob Credija',
          taxId: '85.291.086/0001-01',
          phone: '48 3535-0000',
          email: 'marketing3070@credija.com.br',
          address: 'R. Dona Helena Cechinel, 317 – Centro – Jacinto Machado – SC',
          type: 'PJ'
        };
        
        const testService: ServiceTemplate = {
          id: 'service_test_1',
          name: 'Fotografia Corporativa',
          description: 'Sessão de fotos para posicionamento de marca e perfil profissional.',
          defaultPrice: 850,
          type: ServiceType.PACKAGE
        };

        const testQuote: Quote = {
          id: 'quote_test_1',
          number: '4269',
          clientId: testClient.id,
          date: '2026-01-15',
          validUntil: '2026-03-03',
          status: QuoteStatus.SENT,
          items: [{
            id: 'item_1',
            name: testService.name,
            description: testService.description,
            unitPrice: 850,
            quantity: 1,
            type: ServiceType.PACKAGE
          }],
          discount: 0,
          extraFees: 0,
          paymentMethod: PaymentMethod.TRANSFER,
          paymentConditions: 'Após entrega.',
          total: 850
        };

        setClients([testClient]);
        setServices([testService]);
        setQuotes([testQuote]);
        setProfile(loadedProfile);
      } else {
        setProfile(loadedProfile);
        setClients(loadedClients);
        setQuotes(loadedQuotes);
        setServices(loadedServices);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`photo_profile_${currentUser.id}`, JSON.stringify(profile));
      localStorage.setItem(`photo_clients_${currentUser.id}`, JSON.stringify(clients));
      localStorage.setItem(`photo_quotes_${currentUser.id}`, JSON.stringify(quotes));
      localStorage.setItem(`photo_services_${currentUser.id}`, JSON.stringify(services));
    }
  }, [profile, clients, quotes, services, currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('photo_session');
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  if (isPublicView && publicQuoteId && publicUserId) {
    return <PublicQuoteView quoteId={publicQuoteId} userId={publicUserId} />;
  }

  if (!currentUser) {
    return <LoginView onLogin={(user) => {
      localStorage.setItem('photo_session', JSON.stringify(user));
      setCurrentUser(user);
    }} />;
  }

  const handleCreateQuote = () => {
    setEditingQuoteId(null);
    setActiveTab('quote-builder');
  };

  const handleEditQuote = (id: string) => {
    setEditingQuoteId(id);
    setActiveTab('quote-builder');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard quotes={quotes} profile={profile} onNewQuote={handleCreateQuote} onViewQuotes={() => setActiveTab('quotes')} />;
      case 'clients':
        return <ClientsView clients={clients} setClients={setClients} />;
      case 'services':
        return <ServicesView services={services} setServices={setServices} />;
      case 'quotes':
        return <QuotesView quotes={quotes} setQuotes={setQuotes} clients={clients} currentUser={currentUser} onEditQuote={handleEditQuote} onNewQuote={handleCreateQuote} />;
      case 'profile':
        return <ProfileView profile={profile} setProfile={setProfile} />;
      case 'quote-builder':
        return <QuoteBuilder profile={profile} clients={clients} services={services} setQuotes={setQuotes} initialQuoteId={editingQuoteId} onCancel={() => setActiveTab('quotes')} onSave={() => setActiveTab('quotes')} />;
      case 'admin':
        return currentUser.role === 'admin' ? <AdminView /> : <Dashboard quotes={quotes} profile={profile} onNewQuote={handleCreateQuote} onViewQuotes={() => setActiveTab('quotes')} />;
      default:
        return <Dashboard quotes={quotes} profile={profile} onNewQuote={handleCreateQuote} onViewQuotes={() => setActiveTab('quotes')} />;
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-indigo-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex bg-slate-50 overflow-hidden">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center space-x-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white"><Camera size={24} /></div>
            <h1 className="text-xl font-bold text-slate-800">FocusQuote</h1>
          </div>
          <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="quotes" label="Orçamentos" icon={FileText} />
            <NavItem id="clients" label="Clientes" icon={Users} />
            <NavItem id="services" label="Meus Serviços" icon={Briefcase} />
            <NavItem id="profile" label="Meu Perfil" icon={UserCircle} />
            {currentUser.role === 'admin' && (
              <div className="pt-4 mt-4 border-t border-slate-100">
                <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Administrador</p>
                <NavItem id="admin" label="Gerenciar Usuários" icon={ShieldCheck} />
              </div>
            )}
          </nav>
          <div className="p-4 border-t border-slate-100 space-y-2">
            <button onClick={handleCreateQuote} className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition shadow-lg">
              <PlusCircle size={20} /><span>Novo Orçamento</span>
            </button>
            <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-slate-400 hover:text-red-500 py-2 text-sm transition font-medium">
              <LogOut size={18} /><span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-md"><Menu size={24} /></button>
          </div>
          <div className="flex-1 px-4">
            <h2 className="text-lg font-semibold text-slate-800 capitalize">
              {activeTab === 'quote-builder' ? 'Novo Orçamento' : activeTab === 'services' ? 'Catálogo de Serviços' : activeTab}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">{currentUser.name}</p>
              <p className="text-[10px] text-slate-400 uppercase">{currentUser.role === 'admin' ? 'Super Admin' : 'Fotógrafo'}</p>
            </div>
            <div className="h-10 w-10 bg-indigo-100 rounded-full border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">{currentUser.name.charAt(0)}</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">{renderContent()}</div>
      </main>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
    </div>
  );
};

export default App;
