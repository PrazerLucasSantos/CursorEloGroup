import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Users,
  Building2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  MapPin,
  FileText,
  GraduationCap,
  HeartPulse,
  TreePine,
  Truck,
  Layers
} from 'lucide-react';
import { Mission, ViewMode } from '../types';

interface MissionDetailViewProps {
  mission: Mission;
  onBack: () => void;
  onStartParticipation: (mission: Mission) => void;
  onOpenImageLinksModal: () => void;
}

export const MissionDetailView: React.FC<MissionDetailViewProps> = ({
  mission,
  onBack,
  onStartParticipation,
  onOpenImageLinksModal
}) => {
  const [expandedSection, setExpandedSection] = useState<'why' | 'how' | 'both'>('both');
  const [copiedLink, setCopiedLink] = useState(false);

  const getAxisIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return GraduationCap;
      case 'HeartPulse':
        return HeartPulse;
      case 'TreePine':
        return TreePine;
      case 'Truck':
        return Truck;
      default:
        return Layers;
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Back Button & Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#003366] hover:text-[#001e40] px-3 py-2 rounded-xl bg-white border border-[#e0e3e5] hover:bg-[#f2f4f6] transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Missões</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenImageLinksModal}
            className="px-3 py-1.5 rounded-xl border border-[#c3c6d1] bg-white text-xs font-semibold text-[#001e40] hover:bg-[#eceef0] transition-colors"
          >
            Tags HTML da Imagem
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl border border-[#c3c6d1] bg-white text-xs font-semibold text-[#43474f] hover:text-[#001e40] hover:bg-[#eceef0] transition-colors flex items-center gap-1.5"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copiedLink ? 'Link Copiado!' : 'Compartilhar'}</span>
          </button>
        </div>
      </div>

      {/* Hero Banner with Official Details */}
      <div className="relative rounded-3xl overflow-hidden shadow-md border border-[#e0e3e5] bg-[#001e40]">
        <div className="h-64 sm:h-80 w-full relative">
          <img
            src={mission.imageUrl}
            alt={mission.title}
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001e40] via-[#001e40]/70 to-transparent"></div>

          <div className="absolute top-6 left-6 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#001e40] shadow">
              {mission.agencyInitials} • {mission.agency}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                mission.status === 'open' ? 'bg-[#1b6d24]' : 'bg-[#d58c00]'
              }`}
            >
              {mission.statusLabel}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-slate-200">
              <span>{mission.theme}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#a0f399]" />
                {mission.region}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
              {mission.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Grid: Content + Sticky Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Mission Content & Eixos */}
        <div className="lg:col-span-8 space-y-8">
          {/* Mission Journey Stepper */}
          <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#001e40] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#1b6d24]" />
              <span>Jornada da Consulta Pública</span>
            </h2>

            <div className="grid grid-cols-4 gap-2 text-center pt-2">
              <div className="space-y-1.5">
                <div className="w-8 h-8 rounded-full bg-[#1b6d24] text-white flex items-center justify-center text-xs font-bold mx-auto ring-4 ring-[#a0f399]/40">
                  ✓
                </div>
                <span className="block text-xs font-bold text-[#001e40]">1. Participação</span>
                <span className="block text-[10px] text-[#1b6d24] font-semibold">Aberta Agora</span>
              </div>

              <div className="space-y-1.5 opacity-70">
                <div className="w-8 h-8 rounded-full bg-[#e0e3e5] text-[#43474f] flex items-center justify-center text-xs font-bold mx-auto">
                  2
                </div>
                <span className="block text-xs font-medium text-[#43474f]">2. Análise Técnica</span>
                <span className="block text-[10px] text-[#737780]">SEPLAG / Setoriais</span>
              </div>

              <div className="space-y-1.5 opacity-70">
                <div className="w-8 h-8 rounded-full bg-[#e0e3e5] text-[#43474f] flex items-center justify-center text-xs font-bold mx-auto">
                  3
                </div>
                <span className="block text-xs font-medium text-[#43474f]">3. Decisão</span>
                <span className="block text-[10px] text-[#737780]">Envio à ALMT</span>
              </div>

              <div className="space-y-1.5 opacity-70">
                <div className="w-8 h-8 rounded-full bg-[#e0e3e5] text-[#43474f] flex items-center justify-center text-xs font-bold mx-auto">
                  4
                </div>
                <span className="block text-xs font-medium text-[#43474f]">4. Devolutiva</span>
                <span className="block text-[10px] text-[#737780]">Publicação Oficial</span>
              </div>
            </div>
          </div>

          {/* Context & Description */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-6">
            <div className="space-y-3">
              <h2 className="text-xl font-bold text-[#001e40]">Sobre esta Missão</h2>
              <p className="text-sm text-[#191c1e] leading-relaxed">
                {mission.contextDescription}
              </p>
            </div>

            {/* Accordion / Expandable Highlights */}
            <div className="space-y-3 pt-4 border-t border-[#eceef0]">
              {/* Question 1 */}
              <div className="border border-[#e0e3e5] rounded-xl overflow-hidden">
                <div
                  className="p-4 bg-[#f8f9fb] flex items-center justify-between cursor-pointer hover:bg-[#f2f4f6]"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'why' ? 'how' : 'why')
                  }
                >
                  <h3 className="text-xs sm:text-sm font-bold text-[#001e40] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-[#003366]" />
                    Por que o Governo está perguntando isso?
                  </h3>
                  <ChevronDown className="w-4 h-4 text-[#43474f]" />
                </div>
                <div className="p-4 bg-white text-xs sm:text-sm text-[#43474f] leading-relaxed border-t border-[#e0e3e5]">
                  {mission.whyAsking}
                </div>
              </div>

              {/* Question 2 */}
              <div className="border border-[#e0e3e5] rounded-xl overflow-hidden">
                <div
                  className="p-4 bg-[#f8f9fb] flex items-center justify-between cursor-pointer hover:bg-[#f2f4f6]"
                  onClick={() =>
                    setExpandedSection(expandedSection === 'how' ? 'why' : 'how')
                  }
                >
                  <h3 className="text-xs sm:text-sm font-bold text-[#001e40] flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#1b6d24]" />
                    Como sua contribuição será utilizada?
                  </h3>
                  <ChevronDown className="w-4 h-4 text-[#43474f]" />
                </div>
                <div className="p-4 bg-white text-xs sm:text-sm text-[#43474f] leading-relaxed border-t border-[#e0e3e5]">
                  {mission.howUsed}
                </div>
              </div>
            </div>
          </div>

          {/* Bento Grid: Axes / Eixos Prioritários */}
          {mission.axes && mission.axes.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#001e40]">
                  O que será priorizado? (Eixos Estruturantes)
                </h2>
                <span className="text-xs text-[#737780]">4 Eixos em votação</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mission.axes.map((axis) => {
                  const Icon = getAxisIcon(axis.iconName);
                  return (
                    <div
                      key={axis.id}
                      className="bg-white rounded-2xl p-5 border border-[#e0e3e5] hover:border-[#3a5f94] transition-all space-y-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#001e40]/5 text-[#001e40] flex items-center justify-center">
                          <Icon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-sm text-[#001e40]">{axis.title}</h3>
                      </div>
                      <p className="text-xs text-[#43474f] leading-relaxed">{axis.description}</p>
                      <div className="pt-2 border-t border-[#eceef0] text-[11px] font-semibold text-[#1b6d24] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>{axis.highlightStat}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Sidebar: Stats & CTA */}
        <aside className="lg:col-span-4 space-y-6 sticky top-28">
          {/* Main Action Box */}
          <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-sm space-y-5">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1b6d24]">
                Status da Consulta
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-[#001e40]">
                  {mission.participantsCount.toLocaleString('pt-BR')}
                </span>
                <span className="text-xs text-[#43474f] font-medium">cidadãos já opinaram</span>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-[#eceef0] text-xs text-[#43474f]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#d58c00]" />
                  Prazo de Encerramento:
                </span>
                <span className="font-bold text-[#191c1e]">{mission.deadline}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#003366]" />
                  Secretaria Gestora:
                </span>
                <span className="font-bold text-[#191c1e]">{mission.agencyInitials}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#1b6d24]" />
                  Autenticação:
                </span>
                <span className="font-bold text-[#1b6d24]">MT Login Ativo</span>
              </div>
            </div>

            {/* Big Action Button */}
            <button
              onClick={() => onStartParticipation(mission)}
              className="w-full py-4 bg-[#1b6d24] hover:bg-[#15571c] text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Participar desta missão</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-[#737780]">
              Leva em média <strong>3 minutos</strong> para preencher. Sua contribuição é confidencial e protegida por lei.
            </p>
          </div>

          {/* Citizen identification box */}
          <div className="p-4 bg-[#e8f0fe] rounded-2xl border border-[#3a5f94]/20 space-y-2 text-xs text-[#001e40]">
            <div className="flex items-center gap-2 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#1b6d24]" />
              <span>Identificado com MT Login</span>
            </div>
            <p className="text-[11px] text-[#43474f]">
              Você está participando como <strong>João Silva</strong> (Cuiabá, Baixada Cuiabana).
            </p>
          </div>

          {/* Support / Help Box */}
          <div className="bg-[#f8f9fb] p-4 rounded-2xl border border-[#e0e3e5] space-y-2 text-xs">
            <h4 className="font-bold text-[#001e40] flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#003366]" />
              Dúvidas sobre o PPA?
            </h4>
            <p className="text-[#43474f] text-[11px]">
              Consulte os relatórios fiscais anteriores da SEPLAG ou entre em contato com a equipe de participação.
            </p>
            <a
              href="#ouvidoria"
              className="text-[11px] font-bold text-[#003366] hover:underline block pt-1"
            >
              Falar com o Suporte Governamental →
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
};
