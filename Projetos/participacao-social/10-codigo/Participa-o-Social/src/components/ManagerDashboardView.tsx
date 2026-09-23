import React, { useState } from 'react';
import {
  BarChart3,
  Users,
  Building2,
  AlertTriangle,
  Compass,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Filter,
  Eye,
  Brain,
  Shield,
  Layers,
  Sparkles,
  Download
} from 'lucide-react';
import { Mission, ViewMode } from '../types';
import { REGIONS_DATA } from '../data/mockData';

interface ManagerDashboardViewProps {
  missions: Mission[];
  onNavigate: (view: ViewMode) => void;
  onSelectMission: (mission: Mission) => void;
}

export const ManagerDashboardView: React.FC<ManagerDashboardViewProps> = ({
  missions,
  onNavigate,
  onSelectMission
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'territories'>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newMissionTitle, setNewMissionTitle] = useState('');
  const [newMissionAgency, setNewMissionAgency] = useState('SEPLAG');

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#001e40]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b6d24]">
              Painel do Gestor Estadual
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001e40]">
            Gestão Estratégica da Participação Social MT
          </h1>
          <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
            Monitoramento em tempo real das consultas públicas, triagem de dados e emissão de devolutivas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('ai-intelligence')}
            className="px-4 py-2.5 bg-[#001e40] text-white rounded-xl text-xs font-bold hover:bg-[#003366] transition-colors flex items-center gap-2 shadow-xs"
          >
            <Brain className="w-4 h-4 text-[#a0f399]" />
            <span>Inteligência IA</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2.5 bg-[#1b6d24] text-white rounded-xl text-xs font-bold hover:bg-[#15571c] transition-colors flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Nova Missão</span>
          </button>
        </div>
      </div>

      {/* Attention / Alert Banner */}
      <div className="bg-[#ffddb5]/50 border border-[#d58c00]/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#d58c00] text-white flex items-center justify-center shrink-0 font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#2d1a00]">
              Atenção: 5 missões aguardando publicação de devolutiva oficial
            </h3>
            <p className="text-xs text-[#492d00]">
              O prazo regimental de 30 dias para resposta aos cidadãos expira nos próximos 7 dias.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('results')}
          className="px-4 py-2 bg-[#2d1a00] hover:bg-[#492d00] text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
        >
          Revisar Agora
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#737780]">
            <span className="font-bold uppercase tracking-wider">Missões Ativas</span>
            <Building2 className="w-4 h-4 text-[#001e40]" />
          </div>
          <div className="text-3xl font-extrabold text-[#001e40]">12</div>
          <span className="text-xs text-[#1b6d24] font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> 4 em prazo crítico
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#737780]">
            <span className="font-bold uppercase tracking-wider">Participações Totais</span>
            <Users className="w-4 h-4 text-[#1b6d24]" />
          </div>
          <div className="text-3xl font-extrabold text-[#001e40]">154.240</div>
          <span className="text-xs text-[#1b6d24] font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +18.4% esta semana
          </span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#737780]">
            <span className="font-bold uppercase tracking-wider">Cobertura Municipal</span>
            <Compass className="w-4 h-4 text-[#003366]" />
          </div>
          <div className="text-3xl font-extrabold text-[#001e40]">141 / 141</div>
          <span className="text-xs text-[#003366] font-medium">100% dos municípios de MT</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#e0e3e5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#737780]">
            <span className="font-bold uppercase tracking-wider">Por Analisar</span>
            <Clock className="w-4 h-4 text-[#d58c00]" />
          </div>
          <div className="text-3xl font-extrabold text-[#d58c00]">2.410</div>
          <span className="text-xs text-[#43474f] font-medium">Triadas por algoritmo IA</span>
        </div>
      </div>

      {/* Main Section: Map Distribution + Axis Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Strategic Regional Coverage */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#001e40]">
                Adesão Territorial por Macrorregião
              </h2>
              <p className="text-xs text-[#43474f]">
                Distribuição de votos e propostas coletadas em MT
              </p>
            </div>
            <span className="text-xs font-semibold text-[#1b6d24] bg-[#e8f0fe] px-2.5 py-1 rounded-full">
              Tempo Real
            </span>
          </div>

          <div className="space-y-4">
            {REGIONS_DATA.map((reg) => (
              <div key={reg.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#001e40]">{reg.name}</span>
                  <span className="font-semibold text-[#43474f]">
                    {reg.contributions.toLocaleString('pt-BR')} votos ({reg.coveragePercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#eceef0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#001e40] rounded-full"
                    style={{ width: `${reg.coveragePercent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Distribution by Eixo */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-6 flex flex-col justify-between">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#001e40]">
              Distribuição por Eixo Estratégico
            </h2>
            <p className="text-xs text-[#43474f]">
              Interesse e urgência manifestada pelos cidadãos
            </p>
          </div>

          {/* Graphical Bars representation */}
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#001e40]">Infraestrutura & Estradas</span>
                <span className="font-bold text-[#1b6d24]">40%</span>
              </div>
              <div className="w-full h-2 bg-[#e0e3e5] rounded-full overflow-hidden">
                <div className="h-full bg-[#001e40] w-2/5 rounded-full"></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#001e40]">Saúde Descentralizada</span>
                <span className="font-bold text-[#1b6d24]">25%</span>
              </div>
              <div className="w-full h-2 bg-[#e0e3e5] rounded-full overflow-hidden">
                <div className="h-full bg-[#1b6d24] w-1/4 rounded-full"></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#001e40]">Educação & Tecnologia</span>
                <span className="font-bold text-[#1b6d24]">20%</span>
              </div>
              <div className="w-full h-2 bg-[#e0e3e5] rounded-full overflow-hidden">
                <div className="h-full bg-[#003366] w-1/5 rounded-full"></div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#001e40]">Meio Ambiente & Clima</span>
                <span className="font-bold text-[#1b6d24]">15%</span>
              </div>
              <div className="w-full h-2 bg-[#e0e3e5] rounded-full overflow-hidden">
                <div className="h-full bg-[#d58c00] w-[15%] rounded-full"></div>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('ai-intelligence')}
            className="w-full py-3 bg-[#e8f0fe] hover:bg-[#d0e2fe] text-[#001e40] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4 text-[#001e40]" />
            <span>Ver Relatório Completo de IA</span>
          </button>
        </div>
      </div>

      {/* Missões Próximas a Encerrar Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#e0e3e5] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#001e40]">
              Consultas Públicas em Andamento
            </h2>
            <p className="text-xs text-[#43474f]">
              Gerenciamento das missões cadastradas no sistema
            </p>
          </div>
          <button
            onClick={() => onNavigate('explore')}
            className="text-xs font-bold text-[#003366] hover:underline"
          >
            Ver todas
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#e0e3e5] text-[#737780] uppercase tracking-wider font-semibold">
                <th className="pb-3">Missão Pública</th>
                <th className="pb-3">Órgão</th>
                <th className="pb-3">Participações</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0]">
              {missions.map((mission) => (
                <tr key={mission.id} className="hover:bg-[#f8f9fb] transition-colors">
                  <td className="py-4 pr-4">
                    <span className="font-bold text-[#001e40] block">{mission.title}</span>
                    <span className="text-[11px] text-[#737780]">{mission.region}</span>
                  </td>
                  <td className="py-4 pr-4 font-semibold text-[#003366]">
                    {mission.agencyInitials}
                  </td>
                  <td className="py-4 pr-4 font-bold text-[#191c1e]">
                    {mission.participantsCount.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-4 pr-4">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white ${
                        mission.status === 'open'
                          ? 'bg-[#1b6d24]'
                          : mission.status === 'analysis'
                          ? 'bg-[#d58c00]'
                          : 'bg-[#003366]'
                      }`}
                    >
                      {mission.statusLabel}
                    </span>
                  </td>
                  <td className="py-4 text-right">
                    <button
                      onClick={() => onSelectMission(mission)}
                      className="px-3 py-1.5 bg-[#001e40] text-white rounded-lg text-xs font-semibold hover:bg-[#003366]"
                    >
                      Gerenciar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Mission */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 border border-[#c3c6d1] shadow-2xl">
            <h3 className="text-lg font-bold text-[#001e40]">Cadastrar Nova Missão Pública</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#43474f] block mb-1">
                  Título da Consulta Pública
                </label>
                <input
                  type="text"
                  placeholder="Ex: Novo Programa de Apoio à Agricultura Familiar..."
                  value={newMissionTitle}
                  onChange={(e) => setNewMissionTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c3c6d1] text-xs text-[#191c1e] bg-[#f8f9fb]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#43474f] block mb-1">
                  Secretaria Responsável
                </label>
                <select
                  value={newMissionAgency}
                  onChange={(e) => setNewMissionAgency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#c3c6d1] text-xs text-[#191c1e] bg-[#f8f9fb]"
                >
                  <option value="SEPLAG">SEPLAG - Planejamento e Gestão</option>
                  <option value="SEDUC">SEDUC - Educação</option>
                  <option value="SES">SES - Saúde</option>
                  <option value="SINFRA">SINFRA - Infraestrutura</option>
                  <option value="SEMA">SEMA - Meio Ambiente</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border border-[#c3c6d1] text-xs font-semibold text-[#43474f] rounded-xl hover:bg-[#f2f4f6]"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('Nova missão cadastrada com sucesso!');
                  setShowCreateModal(false);
                }}
                className="px-4 py-2 bg-[#1b6d24] text-white text-xs font-bold rounded-xl hover:bg-[#15571c]"
              >
                Publicar Consulta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
