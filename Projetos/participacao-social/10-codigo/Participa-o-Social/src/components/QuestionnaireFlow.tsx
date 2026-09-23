import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Award,
  Download,
  Share2,
  FileCheck,
  Send,
  Landmark,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Mission, ViewMode } from '../types';
import { MUNICIPALITIES_LIST, REGIONS_LIST } from '../data/mockData';

interface QuestionnaireFlowProps {
  mission: Mission;
  onBack: () => void;
  onFinish: () => void;
}

export const QuestionnaireFlow: React.FC<QuestionnaireFlowProps> = ({
  mission,
  onBack,
  onFinish
}) => {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 State: Demographics
  const [municipality, setMunicipality] = useState('Cuiabá');
  const [region, setRegion] = useState('Baixada Cuiabana');
  const [ageGroup, setAgeGroup] = useState('25 a 39 anos');
  const [occupation, setOccupation] = useState('Serviços e Comércio');

  // Step 2 State: Perception & Ranking
  const [rankedItems, setRankedItems] = useState([
    { id: '1', title: 'Conectividade Escolar e Laboratórios Digitais', category: 'Educação' },
    { id: '2', title: 'Expansão de UPAs e Telemedicina Especializada', category: 'Saúde' },
    { id: '3', title: 'Saneamento Básico e Recuperação de Nascentes', category: 'Meio Ambiente' },
    { id: '4', title: 'Pavimentação de Rodovias e Pontes de Concreto', category: 'Infraestrutura' }
  ]);
  const [frequency, setFrequency] = useState('Diariamente');
  const [urgencyDetail, setUrgencyDetail] = useState(
    'Necessidade urgente de melhorar a velocidade de sinal de internet nas escolas dos distritos afastados e ampliar vagas em creches.'
  );

  // Step 3 State: Contribution & Proposal
  const [proposalTitle, setProposalTitle] = useState('Polo Regional de Formação Tecnológica Jovem');
  const [proposalBody, setProposalBody] = useState(
    'Sugiro a criação de cursos de programação e robótica nos fins de semana utilizando as salas informatizadas das escolas estaduais, em parceria com cooperativas e empresas locais.'
  );

  // Step 4 State: Submission Finished
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [protocolNumber, setProtocolNumber] = useState('');

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...rankedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;
    setRankedItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === rankedItems.length - 1) return;
    const newItems = [...rankedItems];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;
    setRankedItems(newItems);
  };

  const handleSubmitParticipation = () => {
    const proto = `MT-${Math.floor(100000 + Math.random() * 900000)}/2025`;
    setProtocolNumber(proto);
    setIsSubmitted(true);
    setCurrentStep(4);

    // Fire celebratory confetti!
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#001e40', '#1b6d24', '#ffddb5', '#a0f399']
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e0e3e5] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#001e40] text-white flex items-center justify-center font-bold">
            <Landmark className="w-5 h-5 text-[#ffddb5]" />
          </div>
          <div>
            <span className="text-xs font-semibold text-[#1b6d24] uppercase tracking-wider block">
              Consulta Pública Oficial
            </span>
            <h2 className="text-base sm:text-lg font-bold text-[#001e40] leading-snug">
              {mission.title}
            </h2>
          </div>
        </div>

        <button
          onClick={onBack}
          className="p-2 text-[#737780] hover:text-[#001e40] hover:bg-[#eceef0] rounded-xl transition-colors text-xs font-semibold flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#e0e3e5] shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-[#001e40]">
            Etapa {currentStep} de 4:{' '}
            {currentStep === 1
              ? 'Sobre você'
              : currentStep === 2
              ? 'Sua Percepção'
              : currentStep === 3
              ? 'Sua Proposta'
              : 'Confirmação'}
          </span>
          <span className="text-[#1b6d24] font-bold">
            {currentStep === 1 ? '25%' : currentStep === 2 ? '50%' : currentStep === 3 ? '75%' : '100%'}
          </span>
        </div>

        {/* Progress line */}
        <div className="w-full h-2.5 bg-[#eceef0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1b6d24] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* STEP 1: SOBRE VOCÊ */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-sm space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#001e40]">1. Identificação Territorial e Perfil</h3>
            <p className="text-xs text-[#43474f]">
              Essas informações garantem que sua proposta seja computada com precisão no plano regional do seu município.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
                Município onde reside
              </label>
              <select
                value={municipality}
                onChange={(e) => setMunicipality(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-sm text-[#191c1e] focus:ring-2 focus:ring-[#001e40]"
              >
                {MUNICIPALITIES_LIST.filter((m) => m !== 'Todos os Municípios').map((m, i) => (
                  <option key={i} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
                Macrorregião de MT
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-sm text-[#191c1e] focus:ring-2 focus:ring-[#001e40]"
              >
                {REGIONS_LIST.filter((r) => r !== 'Todas as Regiões').map((r, i) => (
                  <option key={i} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
                Faixa Etária
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-sm text-[#191c1e] focus:ring-2 focus:ring-[#001e40]"
              >
                <option value="16 a 24 anos">16 a 24 anos (Jovem)</option>
                <option value="25 a 39 anos">25 a 39 anos (Adulto)</option>
                <option value="40 a 59 anos">40 a 59 anos (Meia-idade)</option>
                <option value="60+ anos">60 anos ou mais (Idoso)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
                Área de Atuação / Ocupação
              </label>
              <select
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-sm text-[#191c1e] focus:ring-2 focus:ring-[#001e40]"
              >
                <option value="Serviços e Comércio">Serviços e Comércio</option>
                <option value="Agropecuária & Produtor Rural">Agropecuária & Produtor Rural</option>
                <option value="Educação e Pesquisa">Educação e Pesquisa</option>
                <option value="Saúde e Bem-estar">Saúde e Bem-estar</option>
                <option value="Estudante">Estudante</option>
                <option value="Servidor Público">Servidor Público</option>
                <option value="Autônomo / Empreendedor">Autônomo / Empreendedor</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-[#e8f0fe] rounded-2xl border border-[#3a5f94]/20 flex items-center gap-3 text-xs text-[#001e40]">
            <ShieldCheck className="w-5 h-5 text-[#1b6d24] shrink-0" />
            <span>
              Seus dados demográficos são protegidos e utilizados de forma agregada para compor os relatórios estatísticos da SEPLAG MT.
            </span>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-6 py-3.5 bg-[#001e40] hover:bg-[#003366] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <span>Avançar para Priorização</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SUA PERCEPÇÃO & RANKING */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-sm space-y-8 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#001e40]">2. Ranqueie suas Prioridades</h3>
            <p className="text-xs text-[#43474f]">
              Reordene os temas abaixo colocando no topo (1º lugar) aquilo que você considera mais urgente para o orçamento estadual.
            </p>
          </div>

          {/* Interactive Drag/Move Ranking Items */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b6d24]">
              Ordem de Prioridade (Use as setas para reordenar)
            </span>

            {rankedItems.map((item, index) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-[#e0e3e5] bg-[#f8f9fb] flex items-center justify-between gap-3 hover:border-[#3a5f94] transition-all shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#001e40] text-white flex items-center justify-center font-bold text-xs shrink-0">
                    {index + 1}º
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-[#003366] bg-white px-2 py-0.5 rounded border border-[#e0e3e5] inline-block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-[#191c1e]">{item.title}</h4>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    disabled={index === 0}
                    onClick={() => handleMoveUp(index)}
                    className="p-1.5 rounded-lg border border-[#c3c6d1] bg-white text-[#43474f] hover:text-[#001e40] hover:bg-[#eceef0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover para cima"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    disabled={index === rankedItems.length - 1}
                    onClick={() => handleMoveDown(index)}
                    className="p-1.5 rounded-lg border border-[#c3c6d1] bg-white text-[#43474f] hover:text-[#001e40] hover:bg-[#eceef0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover para baixo"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Frequency Question */}
          <div className="space-y-3 pt-4 border-t border-[#eceef0]">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f] block">
              Com que frequência você ou sua família utilizam esses serviços públicos estaduais?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {['Diariamente', 'Semanalmente', 'Raramente / Em Emergências'].map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={`p-3 rounded-xl border text-xs font-semibold transition-all ${
                    frequency === freq
                      ? 'border-[#001e40] bg-[#001e40] text-white shadow-xs'
                      : 'border-[#c3c6d1] bg-[#f8f9fb] text-[#43474f] hover:bg-[#eceef0]'
                  }`}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency Details */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f] block">
              Descreva brevemente a principal urgência na sua localidade
            </label>
            <textarea
              rows={3}
              value={urgencyDetail}
              onChange={(e) => setUrgencyDetail(e.target.value)}
              className="w-full p-3 text-xs rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-[#191c1e] focus:ring-2 focus:ring-[#001e40] focus:outline-none"
              placeholder="Ex: Falta de sinal de internet na escola municipal ou necessidade de asfalto na rodovia estadual..."
            ></textarea>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-3 border border-[#c3c6d1] text-xs font-semibold text-[#43474f] rounded-xl hover:bg-[#f2f4f6]"
            >
              Voltar
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-6 py-3.5 bg-[#001e40] hover:bg-[#003366] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            >
              <span>Avançar para Proposta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SUA PROPOSTA */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e0e3e5] shadow-sm space-y-6 animate-in fade-in">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-[#001e40]">3. Envie sua Proposta Cidadã</h3>
            <p className="text-xs text-[#43474f]">
              Tem uma ideia inovadora para Mato Grosso? Escreva uma recomendação direta para as secretarias de estado.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
                Título Resumido da Proposta
              </label>
              <input
                type="text"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-sm text-[#191c1e] focus:ring-2 focus:ring-[#001e40]"
                placeholder="Ex: Implantação de laboratório Maker na Escola Estadual..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
                Detalhamento da Proposta e Benefícios Esperados
              </label>
              <textarea
                rows={5}
                value={proposalBody}
                onChange={(e) => setProposalBody(e.target.value)}
                className="w-full p-4 rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-xs sm:text-sm text-[#191c1e] focus:ring-2 focus:ring-[#001e40] leading-relaxed"
                placeholder="Explique como a iniciativa pode ser implementada, quem será beneficiado e qual o impacto positivo no município..."
              ></textarea>
            </div>
          </div>

          {/* AI Assistance helper */}
          <div className="p-4 bg-[#f2f4f6] rounded-2xl border border-[#e0e3e5] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#001e40]">
              <Sparkles className="w-4 h-4 text-[#1b6d24]" />
              <span>Sua proposta será sintetizada automaticamente para o comitê técnico do PPA.</span>
            </div>
            <span className="text-[10px] font-bold text-[#1b6d24] uppercase">Pronta para envio</span>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-3 border border-[#c3c6d1] text-xs font-semibold text-[#43474f] rounded-xl hover:bg-[#f2f4f6]"
            >
              Voltar
            </button>
            <button
              onClick={handleSubmitParticipation}
              className="px-6 py-3.5 bg-[#1b6d24] hover:bg-[#15571c] text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>Concluir e Enviar Contribuição</span>
              <Send className="w-4 h-4 text-[#a0f399]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRMAÇÃO & COMPROVANTE */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e0e3e5] shadow-lg text-center space-y-8 animate-in zoom-in-95">
          {/* Badge icon */}
          <div className="w-20 h-20 rounded-full bg-[#a0f399]/30 text-[#1b6d24] flex items-center justify-center mx-auto ring-8 ring-[#a0f399]/20">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1b6d24]">
              Participação Registrada com Sucesso!
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#001e40]">
              Obrigado por ajudar a construir Mato Grosso
            </h3>
            <p className="text-xs sm:text-sm text-[#43474f]">
              Sua contribuição foi anexada aos autos da consulta pública do <strong>PPA 2024-2027</strong> e enviada para o comitê da SEPLAG MT.
            </p>
          </div>

          {/* Official Digital Certificate / Voucher */}
          <div className="bg-[#001e40] text-white rounded-2xl p-6 max-w-lg mx-auto text-left space-y-4 shadow-md relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#ffddb5]" />
                <span className="text-xs font-bold text-[#ffddb5]">
                  Comprovante Oficial de Participação
                </span>
              </div>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                {protocolNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-300 uppercase block">Cidadão</span>
                <span className="font-semibold text-white">João Silva</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 uppercase block">Município / Polo</span>
                <span className="font-semibold text-white">{municipality} ({region})</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 uppercase block">Prioridade Nº 1</span>
                <span className="font-semibold text-[#a0f399]">{rankedItems[0].title}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-300 uppercase block">Data e Hora</span>
                <span className="font-semibold text-white">{new Date().toLocaleDateString('pt-BR')}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#a0f399]">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Selo "Cidadão Participativo MT" desbloqueado</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onFinish}
              className="px-6 py-3.5 bg-[#001e40] hover:bg-[#003366] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-sm"
            >
              <span>Ver Minhas Participações</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                alert(`Comprovante ${protocolNumber} baixado em PDF.`);
              }}
              className="px-5 py-3.5 border border-[#c3c6d1] hover:bg-[#f8f9fb] text-[#191c1e] text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Comprovante (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
