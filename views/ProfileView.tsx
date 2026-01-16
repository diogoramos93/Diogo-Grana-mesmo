
import React from 'react';
import { PhotographerProfile } from '../types';
import { Save, Camera, Mail, Phone, MapPin, Globe, Instagram, CreditCard, Target } from 'lucide-react';

interface InputFieldProps {
  label: string;
  icon: any;
  value: string | number;
  field: keyof PhotographerProfile;
  placeholder?: string;
  type?: string;
  onChange: (field: keyof PhotographerProfile, value: any) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, icon: Icon, value, field, placeholder, type = 'text', onChange }) => (
  <div className="space-y-1">
    <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
    <div className="relative">
      <div className="absolute left-3 top-3 text-slate-400">
        <Icon size={18} />
      </div>
      <input 
        type={type}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
        value={value || ''}
        onChange={e => {
          const val = type === 'number' ? Number(e.target.value) : e.target.value;
          onChange(field, val);
        }}
      />
    </div>
  </div>
);

interface ProfileViewProps {
  profile: PhotographerProfile;
  setProfile: React.Dispatch<React.SetStateAction<PhotographerProfile>>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, setProfile }) => {
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Perfil salvo com sucesso!');
  };

  const updateProfile = (field: keyof PhotographerProfile, value: any) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Sidebar Info */}
          <div className="w-full md:w-1/3 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center">
              <div className="relative inline-block mb-4">
                <div className="h-24 w-24 bg-indigo-50 rounded-full border-2 border-dashed border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Camera size={32} />
                </div>
                <button type="button" className="absolute bottom-0 right-0 bg-white shadow-md p-1.5 rounded-full text-slate-600 border border-slate-100 hover:text-indigo-600">
                  <Save size={14} />
                </button>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">{profile.studioName || profile.name}</h3>
              <p className="text-slate-500 text-sm">Fotógrafo Profissional</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-sm flex items-center uppercase tracking-wider">
                <Target size={16} className="mr-2 text-indigo-600" /> Meta do Mês
              </h4>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Valor Alvo (R$)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold text-indigo-600"
                  value={profile.monthlyGoal}
                  onChange={e => updateProfile('monthlyGoal', Number(e.target.value))}
                />
                <p className="text-[10px] text-slate-400 mt-1 italic">Este valor será usado para calcular seu progresso no Dashboard.</p>
              </div>
            </div>

            <div className="bg-indigo-900 p-6 rounded-3xl text-white shadow-lg">
              <h4 className="font-bold mb-4 flex items-center"><Globe size={18} className="mr-2" /> Presença Online</h4>
              <div className="space-y-4">
                <InputField 
                  label="Website" 
                  icon={Globe} 
                  value={profile.website || ''} 
                  field="website" 
                  placeholder="Seu site oficial" 
                  onChange={updateProfile} 
                />
                <InputField 
                  label="Instagram" 
                  icon={Instagram} 
                  value={profile.instagram || ''} 
                  field="instagram" 
                  placeholder="@seufotografo" 
                  onChange={updateProfile} 
                />
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <h3 className="text-xl font-bold text-slate-800 pb-4 border-b border-slate-50">Dados Profissionais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nome Completo" icon={Camera} value={profile.name} field="name" onChange={updateProfile} />
                <InputField label="Nome do Estúdio" icon={Camera} value={profile.studioName || ''} field="studioName" onChange={updateProfile} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="CPF / CNPJ" icon={CreditCard} value={profile.taxId} field="taxId" onChange={updateProfile} />
                <InputField label="Telefone" icon={Phone} value={profile.phone} field="phone" onChange={updateProfile} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="WhatsApp" icon={Phone} value={profile.whatsapp} field="whatsapp" onChange={updateProfile} />
                <InputField label="E-mail" icon={Mail} value={profile.email} field="email" type="email" onChange={updateProfile} />
              </div>

              <InputField label="Endereço Comercial" icon={MapPin} value={profile.address} field="address" onChange={updateProfile} />

              <div className="space-y-1 pt-4">
                <label className="text-xs font-bold text-slate-500 uppercase">Termos Padrão do Orçamento</label>
                <textarea 
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={profile.defaultTerms}
                  onChange={e => updateProfile('defaultTerms', e.target.value)}
                  placeholder="Ex: Política de cancelamento, prazos de entrega..."
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button 
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center transition active:scale-95"
              >
                <Save size={20} className="mr-2" /> Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileView;
