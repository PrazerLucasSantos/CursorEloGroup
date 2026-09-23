import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
  Download,
  CheckCircle2,
  AlertCircle,
  FileText,
  Search,
  Building2,
  Compass,
  Zap,
  PieChart
} from 'lucide-react';
import { ViewMode } from '../types';

interface AIIntelligenceViewProps {
  onNavigate: (view: ViewMode) => void;
}

export const AIIntelligenceView: React.FC<AIIntelligenceViewProps> = ({ onNavigate }) => {
  const [selectedTopic, setSelectedTopic] = useState('conectividade');

  const topics = [
    {
      id: 'conectividade',
      title: 'Conectividade e Inclusão Escolar',
      volume: '14.280 menções',
      sentiment: '88% Positivo / Urgente',
      summary: 'Forte apelo no Norte Araguaia e Noroeste para fornecimento de sinal de internet via satélite para escolas rurais e aldeias indígenas.'
    },
    {
      id: 'hemodialise',
      title: 'Polo Regional de Saúde e Hemodiálise',
      volume: '12.450 menções',
      sentiment: '94% Demanda Crítica',
      summary: 'População de Alta Floresta e Alto Teles Pires solicita descentralização urgente dos leitos de nefrologia para reduzir deslocamento a Cuiabá.'
    },
    {
      id: 'estradas',
      title: 'Pavimentação MT-130 e Pontes de Concreto',
      volume: '9.800 menções',
      sentiment: '76% Foco Econômico',
      summary: 'Produtores de Primavera do Leste e Médio Norte destacam a necessidade de escoamento seguro de grãos e passagens ecológicas de fauna.'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d24]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
              Inteligência Artificial de Governo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#001e40] flex items-center gap-2.5">
            <Brain className="w-8 h-8 text-[#1b6d24]" />
            <span>Inteligência de Participação Coletiva MT</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#43474f] mt-0.5">
            Processamento de linguagem natural e agrupamento semântico de milhares de vozes em diretrizes executivas.
          </p>
        </div>

        <button
          onClick={() => alert('Relatório Executivo para o Governador baixado com sucesso em PDF.')}
          className="px-5 py-2.5 bg-[#001e40] hover:bg-[#003366] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 self-start sm:self-center"
        >
          <Download className="w-4 h-4 text-[#ffddb5]" />
          <span>Exportar Relatório Executivo (PDF)</span>
        </button>
      </div>

      {/* Top Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#737780]">
            <span className="font-bold uppercase tracking-wider">Confiança Algorítmica</span>
            <Zap className="w-4 h-4 text-[#1b6d24]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1b6d24]">94.8%</div>
          <p className="text-xs text-[#43474f]">Triagem semântica validada pela SEPLAG</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#737780]">
            <span className="font-bold uppercase tracking-wider">Interações Analisadas</span>
            <Sparkles className="w-4 h-4 text-[#003366]" />
          </div>
          <div className="text-3xl font-extrabold text-[#001e40]">45.280</div>
          <p className="text-xs text-[#43474f]">Texto aberto, ranqueamentos e formulários</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#737780]">
            <span className="font-bold uppercase tracking-wider">Clusters Semânticos</span>
            <Layers className="w-4 h-4 text-[#d58c00]" />
          </div>
          <div className="text-3xl font-extrabold text-[#003366]">1.284</div>
          <p className="text-xs text-[#43474f]">Pontos de convergência entre os 141 municípios</p>
        </div>
      </div>

      {/* Deep AI Synthesis Card */}
      <div className="bg-gradient-to-br from-[#001e40] to-[#003366] text-white rounded-3xl p-6 sm:p-8 shadow-md border border-[#001e40] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#a0f399]">
            <Sparkles className="w-4 h-4" />
            <span>Síntese Geral Gerada por IA</span>
          </div>
          <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
            Atualizado Hoje
          </span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold leading-snug">
          "A sociedade mato-grossense prioriza a descentralização dos serviços essenciais — levando conectividade às escolas rurais e especialistas médicos aos polos do interior."
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-white/10 text-xs text-slate-200">
          <div>
            <strong className="block text-[#ffddb5] mb-1">Eixo 1: Saúde Regional</strong>
            73% dos entrevistados no interior colocam o atendimento especializado próximo de suas casas como a decisão orçamentária mais importante.
          </div>
          <div>
            <strong className="block text-[#ffddb5] mb-1">Eixo 2: Conectividade</strong>
            O acesso digital é visto como o principal equalizador de oportunidades educacionais e fomento ao agronegócio jovem.
          </div>
          <div>
            <strong className="block text-[#ffddb5] mb-1">Eixo 3: Estradas e Segurança</strong>
            Forte correlação entre pavimentação de trechos estaduais e sensação de segurança com patrulhamento rural.
          </div>
        </div>
      </div>

      {/* Interactive Semantic Clusters & Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cluster List */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-4">
          <h2 className="text-base font-bold text-[#001e40] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#1b6d24]" />
            <span>Clusters Temáticos em Destaque</span>
          </h2>

          <div className="space-y-3">
            {topics.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTopic(t.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedTopic === t.id
                    ? 'border-[#001e40] bg-[#001e40]/5 ring-2 ring-[#001e40]/20'
                    : 'border-[#e0e3e5] bg-[#f8f9fb] hover:border-[#3a5f94]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-[#001e40]">{t.title}</h4>
                  <span className="text-xs font-semibold text-[#1b6d24]">{t.volume}</span>
                </div>
                <p className="text-xs text-[#43474f] leading-relaxed">{t.summary}</p>
                <div className="text-[11px] font-semibold text-[#003366]">
                  Sentimento: {t.sentiment}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Alignment Comparison */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-[#001e40] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#003366]" />
              <span>Alinhamento Governamental x Demanda Popular</span>
            </h2>
            <p className="text-xs text-[#43474f]">
              Comparação entre o projeto preliminar do governo e os anseios do cidadão
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#001e40]">Saúde no Interior (Telemedicina)</span>
                <span className="text-[#1b6d24]">+28% demanda da sociedade</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#737780]">
                  <span>Vontade Cidadã: 82%</span>
                  <span>Proposta Inicial: 54%</span>
                </div>
                <div className="w-full h-2 bg-[#eceef0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#1b6d24] w-[82%] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#001e40]">Inclusão Digital nas Escolas</span>
                <span className="text-[#1b6d24]">+22% demanda da sociedade</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#737780]">
                  <span>Vontade Cidadã: 78%</span>
                  <span>Proposta Inicial: 56%</span>
                </div>
                <div className="w-full h-2 bg-[#eceef0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#001e40] w-[78%] rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#e0e3e5] space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-[#001e40]">Obras Rodoviárias MT-130</span>
                <span className="text-[#003366]">Alinhamento Perfeito (100%)</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-[#737780]">
                  <span>Vontade Cidadã: 70%</span>
                  <span>Proposta Inicial: 70%</span>
                </div>
                <div className="w-full h-2 bg-[#eceef0] rounded-full overflow-hidden">
                  <div className="h-full bg-[#003366] w-[70%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
