import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  Users,
  MapPin,
  Building2,
  FileCheck,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { DECISIONS_DATA } from '../data/mockData';
import { DecisionRecord, ViewMode } from '../types';

interface ResultsViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  onNavigate
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'incorporated' | 'in_analysis' | 'not_incorporated'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>('dec-1');

  const filteredDecisions = DECISIONS_DATA.filter((dec) => {
    if (filterStatus !== 'all' && dec.status !== filterStatus) return false;
    if (
      searchTerm &&
      !dec.topic.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !dec.citizenProposal.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !dec.officialJustification.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-12">
      {/* Hero Section with Community & Devolutiva Theme */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-[#e0e3e5] bg-[#001e40] text-white">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80"
            alt="Devolutiva Cidadã MT"
            className="w-full h-full object-cover opacity-35 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#001e40] via-[#001e40]/90 to-transparent"></div>
        </div>

        <div className="relative z-10 p-8 sm:p-12 lg:p-16 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-[#a0f399]">
            <CheckCircle2 className="w-4 h-4" />
            <span>Devolutivas Públicas & Transparência</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            O Governo ouviu.{' '}
            <span className="text-[#ffddb5]">Veja o resultado.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-normal">
            Confira como cada contribuição foi analisada tecnicamente pela SEPLAG e pelas secretarias setoriais, quais propostas viraram metas oficiais no orçamento e a justificativa para cada decisão.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('explore')}
              className="px-6 py-3.5 bg-[#1b6d24] hover:bg-[#15571c] text-white rounded-xl font-bold text-sm transition-all shadow-md flex items-center gap-2"
            >
              <span>Explorar outras consultas públicas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Bento Grid: Summary Highlights */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: What We Heard (Word Cloud/Themes) */}
        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b6d24]">
              Temas Mais Votados
            </span>
            <h3 className="text-lg font-bold text-[#001e40]">O que a população pediu</h3>
          </div>

          <div className="flex flex-wrap gap-2 py-2">
            <span className="px-3 py-1.5 rounded-xl bg-[#001e40] text-white text-xs font-bold">
              Telemedicina Especializada (68%)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#1b6d24] text-white text-xs font-bold">
              Conectividade Satelital (64%)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#eceef0] text-[#001e40] text-xs font-semibold">
              Patrulhamento Rural (58%)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#eceef0] text-[#001e40] text-xs font-semibold">
              Asfaltamento Rodovias (52%)
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-[#eceef0] text-[#001e40] text-xs font-semibold">
              Recuperação de Nascentes (47%)
            </span>
          </div>

          <div className="pt-2 border-t border-[#eceef0] text-xs text-[#43474f] flex items-center justify-between">
            <span>Classificação via IA Coletiva MT</span>
            <Sparkles className="w-3.5 h-3.5 text-[#1b6d24]" />
          </div>
        </div>

        {/* Card 2: Record Participation */}
        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
              Engajamento Histórico
            </span>
            <h3 className="text-lg font-bold text-[#001e40]">Participação Recorde</h3>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-extrabold text-[#001e40]">45.280</div>
            <p className="text-xs text-[#43474f] leading-relaxed">
              Cidadãos enviaram propostas individuais ou votaram em plenárias digitais para o PPA 2024-2027.
            </p>
          </div>

          <div className="pt-2 border-t border-[#eceef0] text-xs text-[#1b6d24] font-semibold flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4" />
            <span>+310% de participação em relação ao ciclo anterior</span>
          </div>
        </div>

        {/* Card 3: Territorial Reach */}
        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d58c00]">
              Alcance Territorial
            </span>
            <h3 className="text-lg font-bold text-[#001e40]">141 de 141 Municípios</h3>
          </div>

          <div className="space-y-2">
            <div className="text-4xl font-extrabold text-[#1b6d24]">100%</div>
            <p className="text-xs text-[#43474f] leading-relaxed">
              Todas as 8 macrorregiões de Mato Grosso tiveram demandas incorporadas aos programas estaduais.
            </p>
          </div>

          <div className="pt-2 border-t border-[#eceef0] text-xs text-[#003366] font-semibold flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            <span>Auditoria georreferenciada pela SEPLAG</span>
          </div>
        </div>
      </section>

      {/* Decisions Table / Accordion Section */}
      <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e0e3e5] pb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#001e40]">
              Decisões Tomadas pelo Governo
            </h2>
            <p className="text-xs text-[#43474f] mt-1">
              Consulte a deliberação técnica para cada uma das propostas submetidas pela sociedade.
            </p>
          </div>

          {/* Search in decisions */}
          <div className="relative">
            <input
              type="text"
              placeholder="Filtrar por palavra ou proposta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl border border-[#c3c6d1] text-xs text-[#191c1e] bg-[#f8f9fb] focus:ring-2 focus:ring-[#001e40] w-64"
            />
            <Search className="w-4 h-4 text-[#737780] absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-[#001e40] text-white shadow-xs'
                : 'bg-[#f2f4f6] text-[#43474f] hover:bg-[#e6e8ea]'
            }`}
          >
            Todas as Deliberações ({DECISIONS_DATA.length})
          </button>

          <button
            onClick={() => setFilterStatus('incorporated')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === 'incorporated'
                ? 'bg-[#1b6d24] text-white shadow-xs'
                : 'bg-[#f2f4f6] text-[#1b6d24] hover:bg-[#e6e8ea]'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Incorporadas ao Orçamento</span>
          </button>

          <button
            onClick={() => setFilterStatus('in_analysis')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === 'in_analysis'
                ? 'bg-[#d58c00] text-white shadow-xs'
                : 'bg-[#f2f4f6] text-[#d58c00] hover:bg-[#e6e8ea]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Em Análise de Viabilidade</span>
          </button>

          <button
            onClick={() => setFilterStatus('not_incorporated')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterStatus === 'not_incorporated'
                ? 'bg-[#ba1a1a] text-white shadow-xs'
                : 'bg-[#f2f4f6] text-[#ba1a1a] hover:bg-[#e6e8ea]'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Não Incorporadas</span>
          </button>
        </div>

        {/* Decisions List */}
        <div className="space-y-4">
          {filteredDecisions.map((dec) => {
            const isExpanded = expandedId === dec.id;
            return (
              <div
                key={dec.id}
                className="border border-[#e0e3e5] rounded-2xl overflow-hidden bg-white shadow-2xs hover:border-[#3a5f94] transition-all"
              >
                <div
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer bg-[#f8f9fb] hover:bg-[#f2f4f6] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : dec.id)}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold text-white flex items-center gap-1 ${
                          dec.status === 'incorporated'
                            ? 'bg-[#1b6d24]'
                            : dec.status === 'in_analysis'
                            ? 'bg-[#d58c00]'
                            : 'bg-[#ba1a1a]'
                        }`}
                      >
                        {dec.status === 'incorporated' && <CheckCircle2 className="w-3 h-3" />}
                        {dec.status === 'in_analysis' && <Clock className="w-3 h-3" />}
                        {dec.status === 'not_incorporated' && <XCircle className="w-3 h-3" />}
                        <span>{dec.statusLabel}</span>
                      </span>

                      <span className="text-xs text-[#737780]">
                        {dec.region} • {dec.votesCount.toLocaleString('pt-BR')} votos
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#001e40]">{dec.topic}</h3>
                    <p className="text-xs text-[#43474f] line-clamp-1">{dec.citizenProposal}</p>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <span className="text-xs font-semibold text-[#003366] bg-white px-3 py-1.5 rounded-xl border border-[#c3c6d1]">
                      {dec.impactAgency}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#737780] transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-6 border-t border-[#e0e3e5] bg-white space-y-4 animate-in fade-in">
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
                        Proposta dos Cidadãos:
                      </span>
                      <p className="text-xs sm:text-sm text-[#191c1e] bg-[#f8f9fb] p-3.5 rounded-xl border border-[#e0e3e5] leading-relaxed">
                        "{dec.citizenProposal}"
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#001e40] flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-[#1b6d24]" />
                        Justificativa Técnica do Governo de MT:
                      </span>
                      <p className="text-xs sm:text-sm text-[#191c1e] bg-[#e8f0fe]/60 p-4 rounded-xl border border-[#3a5f94]/30 leading-relaxed font-medium">
                        {dec.officialJustification}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between text-xs text-[#43474f] pt-2 border-t border-[#eceef0]">
                      <span>
                        Cronograma de Implementação: <strong>{dec.plannedDate}</strong>
                      </span>
                      <span>
                        Órgão Executor Responsável: <strong>{dec.impactAgency}</strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Next Steps Timeline */}
      <section className="bg-[#f2f4f6] rounded-3xl p-8 border border-[#e0e3e5] space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1b6d24]">
            Cronograma Institucional
          </span>
          <h2 className="text-2xl font-bold text-[#001e40]">Próximos Passos do PPA</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] space-y-2">
            <span className="text-xs font-bold text-[#1b6d24]">Fase 1 (Concluída)</span>
            <h4 className="font-bold text-sm text-[#001e40]">Escuta & Consulta Pública</h4>
            <p className="text-xs text-[#43474f]">
              Mais de 45 mil votos coletados e processados nos 141 municípios do estado.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] space-y-2">
            <span className="text-xs font-bold text-[#003366]">Fase 2 (Em Andamento)</span>
            <h4 className="font-bold text-sm text-[#001e40]">Redação do Projeto de Lei</h4>
            <p className="text-xs text-[#43474f]">
              SEPLAG formata a Lei Orçamentária e o PPA 2024-2027 com as diretrizes votadas.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] space-y-2">
            <span className="text-xs font-bold text-[#d58c00]">Fase 3 (Próxima)</span>
            <h4 className="font-bold text-sm text-[#001e40]">Aprovação na ALMT</h4>
            <p className="text-xs text-[#43474f]">
              Votação em plenário pelos deputados estaduais e sanção pelo Governador.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
