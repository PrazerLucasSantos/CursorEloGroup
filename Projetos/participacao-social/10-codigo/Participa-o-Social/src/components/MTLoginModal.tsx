import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, Lock, Landmark, CheckCircle2, UserCog } from 'lucide-react';
import { UserRole } from '../types';

interface MTLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const MTLoginModal: React.FC<MTLoginModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole
}) => {
  const [cpf, setCpf] = useState('384.921.408-12');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<UserRole>(currentRole);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectRole(selectedRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#c3c6d1] overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#001e40] text-white relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Landmark className="w-5 h-5 text-[#ffddb5]" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#ffddb5]">
                Governo de Mato Grosso
              </span>
              <h2 className="text-xl font-bold">MT Login Cidadão</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleLogin} className="p-6 space-y-5">
          {/* Role selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
              Perfil de Acesso
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole('citizen')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  selectedRole === 'citizen'
                    ? 'border-[#001e40] bg-[#001e40]/5 text-[#001e40] ring-2 ring-[#001e40]/20'
                    : 'border-[#c3c6d1] text-[#43474f] hover:bg-[#f8f9fb]'
                }`}
              >
                <UserCheck className="w-5 h-5 text-[#1b6d24]" />
                <span>Cidadão MT</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('manager')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                  selectedRole === 'manager'
                    ? 'border-[#001e40] bg-[#001e40]/5 text-[#001e40] ring-2 ring-[#001e40]/20'
                    : 'border-[#c3c6d1] text-[#43474f] hover:bg-[#f8f9fb]'
                }`}
              >
                <UserCog className="w-5 h-5 text-[#003366]" />
                <span>Gestor Estadual</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#43474f] mb-1">
                CPF do Cidadão ou Servidor
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#c3c6d1] focus:outline-none focus:ring-2 focus:ring-[#001e40] text-sm text-[#191c1e] bg-white font-mono"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#43474f] mb-1">
                Senha Gov.br / MT Login
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c3c6d1] focus:outline-none focus:ring-2 focus:ring-[#001e40] text-sm text-[#191c1e] bg-white font-mono"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-[#737780] absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Security badge */}
          <div className="p-3 bg-[#e8f0fe] rounded-xl flex items-start gap-2.5 text-xs text-[#001e40]">
            <ShieldCheck className="w-4 h-4 text-[#1b6d24] shrink-0 mt-0.5" />
            <p>
              Ambiente seguro integrado à base do <strong>Gov.br</strong> e{' '}
              <strong>Governo de Mato Grosso</strong>. Seus dados estão protegidos pela LGPD.
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#001e40] text-white rounded-xl font-semibold hover:bg-[#003366] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <span>Entrar com MT Login</span>
            <CheckCircle2 className="w-4 h-4 text-[#a0f399]" />
          </button>
        </form>
      </div>
    </div>
  );
};
