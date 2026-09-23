import React from 'react';
import {
  User,
  Award,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileText,
  ChevronRight
} from 'lucide-react';
import { CITIZEN_MOCK_PROFILE, CITIZEN_CONTRIBUTIONS } from '../data/mockData';
import { ViewMode, Mission } from '../types';

interface CitizenProfileViewProps {
  onNavigate: (view: ViewMode) => void;
  onSelectMissionById: (id: string) => void;
}

export const CitizenProfileView: React.FC<CitizenProfileViewProps> = ({
  onNavigate,
  onSelectMissionById
}) => {
  return (
    <div className="space-y-8">
      {/* Profile Header Greeting */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#001e40] text-white flex items-center justify-center text-xl font-extrabold shadow-md border-2 border-[#ffddb5]">
            JS
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#001e40]">
                Olá, {CITIZEN_MOCK_PROFILE.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f0fe] text-[#003366] border border-[#3a5f94]/30">
                MT Cidadão Verificado
              </span>
            </div>
            <p className="text-xs text-[#43474f] flex items-center gap-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1b6d24]" />
                {CITIZEN_MOCK_PROFILE.municipality} ({CITIZEN_MOCK_PROFILE.region})
              </span>
              <span>•</span>
              <span className="font-mono text-[11px] text-[#737780]">
                CPF: {CITIZEN_MOCK_PROFILE.cpfMasked}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('explore')}
          className="px-5 py-2.5 bg-[#1b6d24] hover:bg-[#15571c] text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#a0f399]" />
          <span>Participar de Nova Missão</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
            Missões Participadas
          </span>
          <div className="text-3xl font-extrabold text-[#001e40]">
            {CITIZEN_MOCK_PROFILE.missionsCount}
          </div>
          <p className="text-xs text-[#1b6d24] font-medium">Você é um dos cidadãos mais ativos!</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
            Propostas Enviadas
          </span>
          <div className="text-3xl font-extrabold text-[#003366]">
            {CITIZEN_MOCK_PROFILE.contributionsCount}
          </div>
          <p className="text-xs text-[#43474f]">Em eixos de saúde, educação e estradas</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
            Devolutivas Recebidas
          </span>
          <div className="text-3xl font-extrabold text-[#1b6d24]">
            {CITIZEN_MOCK_PROFILE.feedbackReceivedCount}
          </div>
          <p className="text-xs text-[#43474f]">Propostas transformadas em ações públicas</p>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#001e40] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#ffddb5]" />
            <span>Seus Selos de Participação Cidadã MT</span>
          </h2>
          <span className="text-xs text-[#737780]">3 Conquistas desbloqueadas</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CITIZEN_MOCK_PROFILE.badges.map((badge) => (
            <div
              key={badge.id}
              className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2 hover:border-[#3a5f94] transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-[#001e40] text-[#a0f399] flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-[#001e40]">{badge.title}</h3>
              <p className="text-xs text-[#43474f] leading-relaxed">{badge.description}</p>
              <span className="block text-[10px] text-[#737780] font-medium pt-1">
                Conquistado em {badge.earnedDate}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* History of Contributions Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#e0e3e5] pb-4">
          <h2 className="text-lg font-bold text-[#001e40]">
            Histórico das Suas Participações
          </h2>
          <span className="text-xs text-[#737780]">Últimas consultas respondidas</span>
        </div>

        <div className="space-y-4">
          {CITIZEN_CONTRIBUTIONS.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl border border-[#e0e3e5] hover:border-[#3a5f94] transition-all bg-[#f8f9fb] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                        item.status === 'feedback_ready'
                          ? 'bg-[#1b6d24]'
                          : 'bg-[#d58c00]'
                      }`}
                    >
                      {item.statusLabel}
                    </span>
                    <span className="text-xs text-[#737780]">{item.date}</span>
                  </div>
                  <h3 className="text-base font-bold text-[#001e40]">{item.missionTitle}</h3>
                </div>

                <button
                  onClick={() => onNavigate('results')}
                  className="px-3.5 py-1.5 bg-white border border-[#c3c6d1] hover:border-[#001e40] text-xs font-semibold text-[#001e40] rounded-xl transition-colors self-start sm:self-center flex items-center gap-1"
                >
                  <span>Ver Devolutiva Oficial</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2 border-t border-[#e0e3e5] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#43474f]">
                <div>
                  <span className="font-semibold text-[#191c1e] block mb-0.5">
                    Prioridades que você ranqueou:
                  </span>
                  <span className="text-[11px] text-[#003366]">
                    {item.prioritiesRanking.join(' → ')}
                  </span>
                </div>

                {item.feedbackSummary && (
                  <div>
                    <span className="font-semibold text-[#1b6d24] block mb-0.5">
                      Impacto da sua resposta:
                    </span>
                    <span className="text-[11px] text-[#191c1e]">
                      {item.feedbackSummary}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
