import React, { useState } from 'react';
import {
  Search,
  Filter,
  MapPin,
  Compass,
  Calendar,
  Users,
  ChevronRight,
  X,
  Sparkles,
  ArrowRight,
  Layers,
  Building2,
  CheckCircle2,
  Clock,
  RotateCcw
} from 'lucide-react';
import { Mission, MissionStatus } from '../types';
import { REGIONS_LIST, MUNICIPALITIES_LIST, AGENCIES_LIST, THEMES_LIST } from '../data/mockData';

interface ExploreMissionsViewProps {
  missions: Mission[];
  onSelectMission: (mission: Mission) => void;
  onOpenMapSelector: () => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const ExploreMissionsView: React.FC<ExploreMissionsViewProps> = ({
  missions,
  onSelectMission,
  onOpenMapSelector,
  selectedRegion,
  onSelectRegion
}) => {
  const [keyword, setKeyword] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('todos');
  const [selectedAgency, setSelectedAgency] = useState('TODOS');
  const [selectedMunicipality, setSelectedMunicipality] = useState('Todos os Municípios');
  const [activeTab, setActiveTab] = useState<'all' | 'open' | 'analysis' | 'feedback'>('open');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  const filteredMissions = missions.filter((m) => {
    // Tab filter
    if (activeTab === 'open' && m.status !== 'open') return false;
    if (activeTab === 'analysis' && m.status !== 'analysis') return false;
    if (activeTab === 'feedback' && m.status !== 'feedback_published') return false;

    // Keyword
    if (
      keyword &&
      !m.title.toLowerCase().includes(keyword.toLowerCase()) &&
      !m.summary.toLowerCase().includes(keyword.toLowerCase()) &&
      !m.agency.toLowerCase().includes(keyword.toLowerCase())
    ) {
      return false;
    }

    // Theme
    if (selectedTheme !== 'todos') {
      const themeObj = THEMES_LIST.find((t) => t.id === selectedTheme);
      if (themeObj && !m.theme.toLowerCase().includes(themeObj.name.toLowerCase().split(' ')[0])) {
        return false;
      }
    }

    // Region
    if (
      selectedRegion !== 'Todas as Regiões' &&
      !m.region.toLowerCase().includes(selectedRegion.toLowerCase().split(' ')[0]) &&
      !m.region.includes('Todas as Regiões')
    ) {
      return false;
    }

    // Agency
    if (selectedAgency !== 'TODOS' && m.agencyInitials !== selectedAgency) {
      return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setKeyword('');
    setSelectedTheme('todos');
    setSelectedAgency('TODOS');
    setSelectedMunicipality('Todos os Municípios');
    onSelectRegion('Todas as Regiões');
    setActiveTab('all');
  };

  const countOpen = missions.filter((m) => m.status === 'open').length;
  const countAnalysis = missions.filter((m) => m.status === 'analysis').length;
  const countFeedback = missions.filter((m) => m.status === 'feedback_published').length;

  return (
    <div className="space-y-8">
      {/* Page Title & Intro */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#1b6d24]"></span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#003366]">
            Consultas Públicas MT
          </span>
        </div>
        <h1 className="text-3xl font-extrabold text-[#001e40]">
          Explore as Missões Públicas
        </h1>
        <p className="text-sm text-[#43474f] max-w-3xl">
          Encontre oportunidades de participação cidadã abertas no seu município ou acompanhe as análises técnicas das secretarias de estado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sidebar Filter Panel */}
        <aside className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#e0e3e5] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#e0e3e5] pb-4">
            <h2 className="text-base font-bold text-[#001e40] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#1b6d24]" />
              <span>Filtros Avançados</span>
            </h2>
            <button
              onClick={handleClearFilters}
              className="text-xs text-[#737780] hover:text-[#001e40] flex items-center gap-1 font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Limpar</span>
            </button>
          </div>

          {/* Map Preview Card */}
          <div className="bg-[#001e40] text-white rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#ffddb5]">Filtro Territorial</span>
              <MapPin className="w-3.5 h-3.5 text-[#a0f399]" />
            </div>
            <p className="text-xs text-slate-200">
              Região ativa: <strong>{selectedRegion}</strong>
            </p>
            <button
              onClick={onOpenMapSelector}
              className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Compass className="w-3.5 h-3.5 text-[#ffddb5]" />
              <span>Selecionar no Mapa</span>
            </button>
          </div>

          {/* Search by Keyword */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
              Palavra-chave
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ex: PPA, estradas, saúde..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#c3c6d1] focus:ring-2 focus:ring-[#001e40] focus:outline-none bg-[#f8f9fb]"
              />
              <Search className="w-4 h-4 text-[#737780] absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Theme Chips */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
              Tema
            </label>
            <div className="flex flex-wrap gap-1.5">
              {THEMES_LIST.map((th) => (
                <button
                  key={th.id}
                  onClick={() => setSelectedTheme(th.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedTheme === th.id
                      ? 'bg-[#001e40] text-white shadow-xs'
                      : 'bg-[#f2f4f6] text-[#43474f] hover:bg-[#e6e8ea]'
                  }`}
                >
                  {th.name}
                </button>
              ))}
            </div>
          </div>

          {/* Region Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
              Macrorregião
            </label>
            <select
              value={selectedRegion}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#001e40]"
            >
              {REGIONS_LIST.map((r, i) => (
                <option key={i} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Municipality Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
              Município
            </label>
            <select
              value={selectedMunicipality}
              onChange={(e) => setSelectedMunicipality(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#001e40]"
            >
              {MUNICIPALITIES_LIST.map((m, i) => (
                <option key={i} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Agency Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#43474f]">
              Órgão Responsável
            </label>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#c3c6d1] bg-[#f8f9fb] text-[#191c1e] focus:outline-none focus:ring-2 focus:ring-[#001e40]"
            >
              {AGENCIES_LIST.map((ag, i) => (
                <option key={i} value={ag.initials}>
                  {ag.initials === 'TODOS' ? ag.name : `${ag.initials} - ${ag.name}`}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-8 space-y-6">
          {/* Status Filter Tabs */}
          <div className="bg-white rounded-2xl p-2 border border-[#e0e3e5] flex flex-wrap gap-2 shadow-2xs">
            <button
              onClick={() => setActiveTab('open')}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'open'
                  ? 'bg-[#001e40] text-white shadow-xs'
                  : 'text-[#43474f] hover:bg-[#f2f4f6]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#1b6d24]"></span>
              <span>Abertas para participação ({countOpen})</span>
            </button>

            <button
              onClick={() => setActiveTab('analysis')}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'analysis'
                  ? 'bg-[#001e40] text-white shadow-xs'
                  : 'text-[#43474f] hover:bg-[#f2f4f6]'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-[#d58c00]" />
              <span>Em análise ({countAnalysis})</span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'feedback'
                  ? 'bg-[#001e40] text-white shadow-xs'
                  : 'text-[#43474f] hover:bg-[#f2f4f6]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#1b6d24]" />
              <span>Com devolutiva ({countFeedback})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-[#001e40] text-white shadow-xs'
                  : 'text-[#43474f] hover:bg-[#f2f4f6]'
              }`}
            >
              Todas ({missions.length})
            </button>
          </div>

          {/* Active Filter Chips */}
          {(keyword || selectedTheme !== 'todos' || selectedRegion !== 'Todas as Regiões' || selectedAgency !== 'TODOS') && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#43474f]">
              <span className="font-semibold">Filtros ativos:</span>
              {keyword && (
                <span className="px-2.5 py-1 bg-[#eceef0] rounded-full flex items-center gap-1">
                  Busca: "{keyword}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setKeyword('')} />
                </span>
              )}
              {selectedTheme !== 'todos' && (
                <span className="px-2.5 py-1 bg-[#eceef0] rounded-full flex items-center gap-1">
                  Tema: {THEMES_LIST.find((t) => t.id === selectedTheme)?.name}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedTheme('todos')} />
                </span>
              )}
              {selectedRegion !== 'Todas as Regiões' && (
                <span className="px-2.5 py-1 bg-[#eceef0] rounded-full flex items-center gap-1">
                  Região: {selectedRegion}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => onSelectRegion('Todas as Regiões')} />
                </span>
              )}
              {selectedAgency !== 'TODOS' && (
                <span className="px-2.5 py-1 bg-[#eceef0] rounded-full flex items-center gap-1">
                  Órgão: {selectedAgency}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedAgency('TODOS')} />
                </span>
              )}
            </div>
          )}

          {/* Missions List / Grid */}
          {filteredMissions.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-[#e0e3e5] space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#eceef0] mx-auto flex items-center justify-center text-[#737780]">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-[#001e40]">Nenhuma missão encontrada</h3>
              <p className="text-xs text-[#43474f] max-w-sm mx-auto">
                Tente ajustar os filtros territoriais, de órgãos ou a palavra-chave para visualizar outras consultas públicas.
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-[#001e40] text-white text-xs font-semibold rounded-xl hover:bg-[#003366]"
              >
                Restaurar todos os filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredMissions.map((mission) => (
                <div
                  key={mission.id}
                  onClick={() => onSelectMission(mission)}
                  className={`bg-white rounded-2xl border border-[#e0e3e5] overflow-hidden shadow-xs hover:shadow-md hover:border-[#3a5f94] transition-all flex flex-col justify-between group cursor-pointer ${
                    mission.featured ? 'md:col-span-2' : ''
                  }`}
                >
                  <div className={`${mission.featured ? 'flex flex-col md:flex-row' : ''}`}>
                    {/* Image */}
                    <div
                      className={`relative overflow-hidden bg-slate-100 ${
                        mission.featured ? 'md:w-5/12 h-64 md:h-auto' : 'h-48'
                      }`}
                    >
                      <img
                        src={mission.imageUrl}
                        alt={mission.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#001e40]/90 text-white backdrop-blur-xs">
                          {mission.agencyInitials}
                        </span>
                        <span
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${
                            mission.status === 'open'
                              ? 'bg-[#1b6d24]'
                              : mission.status === 'analysis'
                              ? 'bg-[#d58c00]'
                              : 'bg-[#003366]'
                          }`}
                        >
                          {mission.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className={`p-6 flex-1 flex flex-col justify-between space-y-4`}>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-[#43474f]">
                          <span className="font-medium text-[#003366]">{mission.theme}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-[#1b6d24]" />
                            {mission.region}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold text-[#001e40] group-hover:text-[#003366] transition-colors leading-snug">
                          {mission.title}
                        </h3>

                        <p className="text-xs text-[#43474f] leading-relaxed line-clamp-3">
                          {mission.summary}
                        </p>
                      </div>

                      <div className="space-y-3 pt-4 border-t border-[#eceef0]">
                        <div className="flex items-center justify-between text-xs text-[#43474f]">
                          <span className="flex items-center gap-1 font-semibold text-[#191c1e]">
                            <Users className="w-3.5 h-3.5 text-[#1b6d24]" />
                            {mission.participantsCount.toLocaleString('pt-BR')} cidadãos participaram
                          </span>
                          <span className="text-[11px] text-[#737780] font-medium">
                            {mission.deadline}
                          </span>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMission(mission);
                          }}
                          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                            mission.status === 'open'
                              ? 'bg-[#001e40] hover:bg-[#003366] text-white shadow-xs'
                              : 'bg-[#eceef0] hover:bg-[#e0e3e5] text-[#001e40]'
                          }`}
                        >
                          <span>{mission.status === 'open' ? 'Acessar Missão' : 'Ver Detalhes e Status'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="p-4 bg-white rounded-2xl border border-[#e0e3e5] flex items-center justify-between text-xs text-[#43474f]">
            <span>Exibindo <strong>{filteredMissions.length}</strong> de {missions.length} missões</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, '...', 8].map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg font-semibold flex items-center justify-center transition-colors ${
                    page === currentPage
                      ? 'bg-[#001e40] text-white'
                      : 'hover:bg-[#f2f4f6] text-[#191c1e]'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
