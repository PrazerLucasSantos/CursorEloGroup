import React from 'react';
import {
  Search,
  User,
  SlidersHorizontal,
  Eye,
  Type,
  Code2,
  Shield,
  Layers,
  Sparkles,
  ChevronDown,
  LogOut,
  Landmark,
  Compass,
  CheckCircle2,
  BarChart3,
  Brain
} from 'lucide-react';
import { ViewMode, UserRole } from '../types';

interface HeaderProps {
  currentView: ViewMode;
  onNavigate: (view: ViewMode) => void;
  userRole: UserRole;
  onToggleRole: () => void;
  isHighContrast: boolean;
  onToggleHighContrast: () => void;
  onOpenLoginModal: () => void;
  onOpenImageLinksModal: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  userRole,
  onToggleRole,
  isHighContrast,
  onToggleHighContrast,
  onOpenLoginModal,
  onOpenImageLinksModal,
  searchQuery,
  onSearchChange
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e0e3e5] shadow-xs">
      {/* Top Accessibility & Institutional Bar */}
      <div className="bg-[#001e40] text-white text-xs px-4 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-[#003366]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-[11px] tracking-wide">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d24] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#d58c00] inline-block"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#003366] inline-block"></span>
            </div>
            <span>GOVERNO DO ESTADO DE MATO GROSSO</span>
          </div>
          <span className="hidden sm:inline text-white/40">|</span>
          <span className="hidden sm:inline text-[11px] text-slate-300">
            SEPLAG • Secretaria de Estado de Planejamento e Gestão
          </span>
        </div>

        {/* Accessibility & Utilities Tools */}
        <div className="flex items-center gap-3 text-[11px]">
          <button
            onClick={onOpenImageLinksModal}
            className="hover:text-[#a0f399] transition-colors flex items-center gap-1 font-medium bg-white/10 px-2 py-0.5 rounded"
            title="Ver e copiar links diretos para imagens do HTML"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Links Imagens HTML</span>
          </button>

          <button
            onClick={onToggleHighContrast}
            className={`hover:text-[#a0f399] transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded ${
              isHighContrast ? 'bg-[#ffddb5] text-black font-bold' : ''
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{isHighContrast ? 'Contraste Ativo' : 'Alto Contraste'}</span>
          </button>

          <button
            onClick={onToggleRole}
            className="hover:text-[#ffddb5] transition-colors flex items-center gap-1 bg-[#003366] px-2 py-0.5 rounded border border-white/20 font-medium"
            title="Alternar entre visão Cidadão e Gestor Estadual"
          >
            <Shield className="w-3 h-3 text-[#ffddb5]" />
            <span>Modo: {userRole === 'citizen' ? 'Cidadão' : 'Gestor Estadual'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3.5 cursor-pointer group shrink-0"
          >
            <div className="w-11 h-11 rounded-xl bg-[#001e40] flex items-center justify-center text-white shadow-md group-hover:bg-[#003366] transition-colors relative overflow-hidden">
              {/* Stylized flag emblem */}
              <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-[#1b6d24] via-[#d58c00] to-[#001e40]"></div>
              <Landmark className="w-6 h-6 text-[#ffddb5] relative z-10" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#1b6d24] tracking-wider uppercase">
                  Mato Grosso
                </span>
                <span className="text-[10px] px-1.5 py-0.2 bg-[#e8f0fe] text-[#001e40] font-semibold rounded">
                  Oficial
                </span>
              </div>
              <h1 className="text-lg font-extrabold text-[#001e40] leading-none tracking-tight">
                Participação Social MT
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'home'
                  ? 'text-[#001e40] bg-[#eceef0]'
                  : 'text-[#43474f] hover:text-[#001e40] hover:bg-[#f2f4f6]'
              }`}
            >
              Início
            </button>

            <button
              onClick={() => onNavigate('explore')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'explore' || currentView === 'detail' || currentView === 'participate'
                  ? 'text-[#001e40] bg-[#eceef0]'
                  : 'text-[#43474f] hover:text-[#001e40] hover:bg-[#f2f4f6]'
              }`}
            >
              Explorar Missões
            </button>

            <button
              onClick={() => onNavigate('results')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'results'
                  ? 'text-[#001e40] bg-[#eceef0]'
                  : 'text-[#43474f] hover:text-[#001e40] hover:bg-[#f2f4f6]'
              }`}
            >
              Resultados & Devolutiva
            </button>

            <button
              onClick={() => onNavigate('profile')}
              className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentView === 'profile'
                  ? 'text-[#001e40] bg-[#eceef0]'
                  : 'text-[#43474f] hover:text-[#001e40] hover:bg-[#f2f4f6]'
              }`}
            >
              Minha Participação
            </button>

            {userRole === 'manager' && (
              <>
                <button
                  onClick={() => onNavigate('manager')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    currentView === 'manager'
                      ? 'text-[#001e40] bg-[#ffddb5]'
                      : 'text-[#001e40] bg-[#ffddb5]/60 hover:bg-[#ffddb5]'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Painel do Gestor</span>
                </button>

                <button
                  onClick={() => onNavigate('ai-intelligence')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    currentView === 'ai-intelligence'
                      ? 'text-white bg-[#001e40]'
                      : 'text-[#001e40] hover:bg-[#eceef0]'
                  }`}
                >
                  <Brain className="w-4 h-4 text-[#1b6d24]" />
                  <span>IA Coletiva</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Quick Search */}
            <div className="hidden xl:flex items-center relative">
              <input
                type="text"
                placeholder="Buscar missões ou eixos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-48 focus:w-64 transition-all pl-8 pr-3 py-1.5 rounded-lg border border-[#c3c6d1] bg-[#f8f9fb] text-xs text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#001e40]"
              />
              <Search className="w-3.5 h-3.5 text-[#737780] absolute left-2.5" />
            </div>

            {/* Login / Profile Trigger */}
            <button
              onClick={onOpenLoginModal}
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-[#c3c6d1] hover:border-[#001e40] bg-white transition-all shadow-2xs"
            >
              <div className="w-7 h-7 rounded-full bg-[#001e40] text-white flex items-center justify-center text-xs font-bold">
                JS
              </div>
              <div className="text-left hidden sm:block">
                <span className="block text-xs font-bold text-[#001e40] leading-none">
                  João Silva
                </span>
                <span className="text-[10px] text-[#1b6d24] font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 inline" /> MT Cidadão
                </span>
              </div>
            </button>

            {/* CTA Button */}
            <button
              onClick={() => onNavigate('explore')}
              className="px-4 py-2.5 bg-[#1b6d24] hover:bg-[#15571c] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#a0f399]" />
              <span>Participar</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
