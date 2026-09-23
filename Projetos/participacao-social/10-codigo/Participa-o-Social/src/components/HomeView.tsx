import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  Users,
  Building2,
  HeartPulse,
  GraduationCap,
  TreePine,
  Truck,
  Shield,
  MessageSquare,
  Award,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { Mission, ViewMode } from '../types';

interface HomeViewProps {
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
  onNavigate: (view: ViewMode) => void;
  onOpenMapSelector: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  missions,
  onSelectMission,
  onNavigate,
  onOpenMapSelector
}) => {
  const featuredMissions = missions.slice(0, 3);

  const categories = [
    { label: 'Saúde', icon: HeartPulse, query: 'Saúde' },
    { label: 'Educação', icon: GraduationCap, query: 'Educação' },
    { label: 'Segurança', icon: Shield, query: 'Segurança' },
    { label: 'Infraestrutura', icon: Truck, query: 'Infraestrutura' },
    { label: 'Meio Ambiente', icon: TreePine, query: 'Meio Ambiente' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section with Pantanal & MT Landscape */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-[#e0e3e5] bg-[#001e40] text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80"
            alt="Pantanal Mato Grosso"
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001e40] via-[#001e40]/90 to-transparent"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#ffddb5]">
            <span className="w-2 h-2 rounded-full bg-[#1b6d24] animate-pulse"></span>
            <span>Plataforma Oficial do Governo de Mato Grosso</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Sua voz ajuda a construir{' '}
            <span className="text-[#a0f399] underline decoration-[#ffddb5] underline-offset-8">
              Mato Grosso.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            Participe das consultas públicas estaduais, priorize investimentos no Plano Plurianual (PPA) e acompanhe de perto onde o orçamento do seu município é aplicado.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                const ppaMission = missions.find(m => m.id === 'ppa-2024-2027') || missions[0];
                onSelectMission(ppaMission);
              }}
              className="px-6 py-3.5 bg-[#1b6d24] hover:bg-[#15571c] text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>Participar agora do PPA</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigate('explore')}
              className="px-6 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-semibold text-sm transition-all border border-white/20 flex items-center gap-2"
            >
              <span>Explorar todas as missões</span>
            </button>
          </div>
        </div>
      </section>

      {/* Quick Topic Search & Filter Banner */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#e0e3e5]">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-[#001e40]">
            Qual área você deseja ajudar a melhorar hoje?
          </h2>
          <p className="text-xs sm:text-sm text-[#43474f]">
            Filtre as consultas públicas por área temática ou selecione seu município no mapa
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={idx}
                  onClick={() => onNavigate('explore')}
                  className="px-4 py-2.5 rounded-xl border border-[#c3c6d1] hover:border-[#001e40] bg-[#f8f9fb] hover:bg-[#eceef0] text-xs font-semibold text-[#001e40] transition-all flex items-center gap-2 shadow-2xs"
                >
                  <Icon className="w-4 h-4 text-[#1b6d24]" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
            <button
              onClick={onOpenMapSelector}
              className="px-4 py-2.5 rounded-xl bg-[#001e40] text-white text-xs font-semibold hover:bg-[#003366] transition-all flex items-center gap-2 shadow-2xs"
            >
              <span>Selecionar no Mapa</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#ffddb5]" />
            </button>
          </div>
        </div>
      </section>

      {/* Featured Missions Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d24]"></span>
              <h2 className="text-2xl font-bold text-[#001e40]">Missões em Destaque</h2>
            </div>
            <p className="text-xs text-[#43474f] mt-1">
              Consultas prioritárias com prazos abertos para envio de propostas
            </p>
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-[#003366] hover:text-[#001e40] flex items-center gap-1 hover:underline"
          >
            <span>Ver todas as 12 missões</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredMissions.map((mission) => (
            <div
              key={mission.id}
              className="bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden shadow-xs hover:shadow-md hover:border-[#3a5f94] transition-all flex flex-col group cursor-pointer"
              onClick={() => onSelectMission(mission)}
            >
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                <img
                  src={mission.imageUrl}
                  alt={mission.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#001e40]/90 text-white backdrop-blur-xs">
                    {mission.agencyInitials}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1b6d24] text-white">
                    {mission.statusLabel}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#43474f]">
                    <span className="font-medium text-[#003366]">{mission.theme}</span>
                    <span>•</span>
                    <span>{mission.region}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#001e40] line-clamp-2 group-hover:text-[#003366] transition-colors">
                    {mission.title}
                  </h3>
                  <p className="text-xs text-[#43474f] line-clamp-2 leading-relaxed">
                    {mission.summary}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-[#eceef0]">
                  <div className="flex items-center justify-between text-xs text-[#43474f]">
                    <span className="flex items-center gap-1 font-semibold text-[#191c1e]">
                      <Users className="w-3.5 h-3.5 text-[#1b6d24]" />
                      {mission.participantsCount.toLocaleString('pt-BR')} participações
                    </span>
                    <span className="text-[11px] text-[#737780]">{mission.deadline}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMission(mission);
                    }}
                    className="w-full py-2.5 bg-[#001e40] hover:bg-[#003366] text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Participar desta missão</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works - 4 Steps */}
      <section className="bg-[#f2f4f6] rounded-3xl p-8 sm:p-10 border border-[#e0e3e5] space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1b6d24]">
            Transparência & Cidadania
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#001e40]">
            Como funciona a sua participação
          </h2>
          <p className="text-xs sm:text-sm text-[#43474f]">
            Um ciclo contínuo de escuta, análise técnica e devolutiva transparente à sociedade mato-grossense.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#001e40] text-white flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="font-bold text-sm text-[#001e40]">Escolha a Missão</h3>
            <p className="text-xs text-[#43474f] leading-relaxed">
              Navegue pelas consultas ativas por área temática, secretaria de estado ou polo regional.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#1b6d24] text-white flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="font-bold text-sm text-[#001e40]">Opine e Priorize</h3>
            <p className="text-xs text-[#43474f] leading-relaxed">
              Ranqueie eixos prioritários, envie ideias e aponte os problemas mais urgentes da sua cidade.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#003366] text-white flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="font-bold text-sm text-[#001e40]">Análise Técnica</h3>
            <p className="text-xs text-[#43474f] leading-relaxed">
              As secretarias avaliam a viabilidade orçamentária e a compatibilidade com a legislação fiscal.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] space-y-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-[#d58c00] text-white flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="font-bold text-sm text-[#001e40]">Devolutiva Pública</h3>
            <p className="text-xs text-[#43474f] leading-relaxed">
              O Governo publica as decisões tomadas, com justificativas claras para o que foi ou não incorporado.
            </p>
          </div>
        </div>
      </section>

      {/* State Numbers Statistics Banner */}
      <section className="bg-[#001e40] text-white rounded-3xl p-8 sm:p-10 border border-[#003366] grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-[#ffddb5]">141</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Municípios Participantes
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-[#a0f399]">+154.000</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Contribuições Cidadãs
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-[#ffddb5]">92%</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Resoluções de Escuta Ativa
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-3xl sm:text-4xl font-extrabold text-[#a0f399]">100%</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Devolutivas Transparentes
          </div>
        </div>
      </section>
    </div>
  );
};
