import React, { useState } from 'react';
import { X, MapPin, Check, Filter, Compass, Building2, Users } from 'lucide-react';
import { REGIONS_DATA } from '../data/mockData';

interface MapSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
}

export const MapSelectorModal: React.FC<MapSelectorModalProps> = ({
  isOpen,
  onClose,
  selectedRegion,
  onSelectRegion
}) => {
  const [activeHover, setActiveHover] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelect = (regionName: string) => {
    onSelectRegion(regionName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-[#c3c6d1] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-[#001e40] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#a0f399]" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Mapa Estratégico de Mato Grosso</h2>
              <p className="text-xs text-slate-300">
                Selecione uma macrorregião territorial para filtrar as consultas públicas
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#f8f9fb]">
          {/* Visual Interactive Map Vector representation of MT regions */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#e0e3e5] flex flex-col items-center justify-center relative min-h-[340px]">
            <div className="w-full text-center mb-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#43474f]">
                Divisão Territorial de MT (8 Polos)
              </span>
            </div>

            {/* SVG stylized map layout */}
            <svg
              viewBox="0 0 500 400"
              className="w-full max-w-md h-auto drop-shadow-sm select-none"
            >
              {/* Noroeste */}
              <path
                d="M 50,40 L 190,40 L 160,160 L 60,150 Z"
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRegion.includes('Noroeste') || activeHover === 'noroeste'
                    ? 'fill-[#003366] stroke-[#ffddb5] stroke-2'
                    : 'fill-[#eceef0] hover:fill-[#d8dde2] stroke-white stroke-2'
                }`}
                onClick={() => handleSelect('Noroeste (Juína)')}
                onMouseEnter={() => setActiveHover('noroeste')}
                onMouseLeave={() => setActiveHover(null)}
              />
              <text x="100" y="95" className="text-[11px] font-bold fill-[#191c1e] pointer-events-none">
                Noroeste
              </text>

              {/* Norte Araguaia */}
              <path
                d="M 190,40 L 440,30 L 450,150 L 300,160 L 200,100 Z"
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRegion.includes('Araguaia') || activeHover === 'araguaia'
                    ? 'fill-[#003366] stroke-[#ffddb5] stroke-2'
                    : 'fill-[#dce2e8] hover:fill-[#cbd3dc] stroke-white stroke-2'
                }`}
                onClick={() => handleSelect('Norte Araguaia')}
                onMouseEnter={() => setActiveHover('araguaia')}
                onMouseLeave={() => setActiveHover(null)}
              />
              <text x="310" y="95" className="text-[11px] font-bold fill-[#191c1e] pointer-events-none">
                Norte Araguaia
              </text>

              {/* Médio Norte / Alto Teles Pires */}
              <path
                d="M 160,160 L 300,160 L 310,250 L 170,240 Z"
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRegion.includes('Médio Norte') || activeHover === 'medio-norte'
                    ? 'fill-[#003366] stroke-[#ffddb5] stroke-2'
                    : 'fill-[#c3c6d1] hover:fill-[#a8adb8] stroke-white stroke-2'
                }`}
                onClick={() => handleSelect('Médio Norte (Sinop/Sorriso)')}
                onMouseEnter={() => setActiveHover('medio-norte')}
                onMouseLeave={() => setActiveHover(null)}
              />
              <text x="210" y="205" className="text-[11px] font-bold fill-[#191c1e] pointer-events-none">
                Médio Norte
              </text>

              {/* Região Oeste */}
              <path
                d="M 60,150 L 160,160 L 170,240 L 130,350 L 40,280 Z"
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRegion.includes('Oeste') || activeHover === 'oeste'
                    ? 'fill-[#003366] stroke-[#ffddb5] stroke-2'
                    : 'fill-[#e0e3e5] hover:fill-[#cbd0d4] stroke-white stroke-2'
                }`}
                onClick={() => handleSelect('Região Oeste (Cáceres)')}
                onMouseEnter={() => setActiveHover('oeste')}
                onMouseLeave={() => setActiveHover(null)}
              />
              <text x="80" y="250" className="text-[11px] font-bold fill-[#191c1e] pointer-events-none">
                Oeste (Cáceres)
              </text>

              {/* Baixada Cuiabana */}
              <path
                d="M 170,240 L 290,240 L 280,330 L 170,320 Z"
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRegion.includes('Baixada') || activeHover === 'baixada'
                    ? 'fill-[#001e40] stroke-[#a0f399] stroke-3'
                    : 'fill-[#003366]/70 hover:fill-[#003366] stroke-white stroke-2'
                }`}
                onClick={() => handleSelect('Baixada Cuiabana')}
                onMouseEnter={() => setActiveHover('baixada')}
                onMouseLeave={() => setActiveHover(null)}
              />
              <text x="185" y="285" className="text-[11px] font-bold fill-white pointer-events-none">
                Baixada Cuiabana ★
              </text>

              {/* Região Sul */}
              <path
                d="M 280,250 L 450,220 L 430,370 L 270,350 Z"
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRegion.includes('Sul') || activeHover === 'sul'
                    ? 'fill-[#003366] stroke-[#ffddb5] stroke-2'
                    : 'fill-[#d0d6dd] hover:fill-[#b8c1cb] stroke-white stroke-2'
                }`}
                onClick={() => handleSelect('Região Sul (Rondonópolis)')}
                onMouseEnter={() => setActiveHover('sul')}
                onMouseLeave={() => setActiveHover(null)}
              />
              <text x="320" y="300" className="text-[11px] font-bold fill-[#191c1e] pointer-events-none">
                Sul (Rondonópolis)
              </text>
            </svg>

            <div className="mt-4 flex items-center justify-between w-full text-xs text-[#43474f] px-2">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#001e40] inline-block"></span>
                Capital & Baixada
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-[#c3c6d1] inline-block"></span>
                Polos Regionais
              </span>
              <span>141 Municípios Conectados</span>
            </div>
          </div>

          {/* Region details list */}
          <div className="lg:col-span-5 space-y-3">
            <button
              onClick={() => handleSelect('Todas as Regiões')}
              className={`w-full p-3 rounded-xl border text-left font-semibold text-xs transition-all flex items-center justify-between ${
                selectedRegion === 'Todas as Regiões'
                  ? 'border-[#001e40] bg-[#001e40] text-white shadow'
                  : 'border-[#c3c6d1] bg-white text-[#191c1e] hover:bg-[#f2f4f6]'
              }`}
            >
              <span>Ver Todo o Estado de MT</span>
              {selectedRegion === 'Todas as Regiões' && <Check className="w-4 h-4 text-[#a0f399]" />}
            </button>

            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {REGIONS_DATA.map((region) => {
                const isSelected = selectedRegion.includes(region.name.split(' ')[0]);
                return (
                  <div
                    key={region.id}
                    onClick={() => handleSelect(region.name)}
                    onMouseEnter={() => setActiveHover(region.id)}
                    onMouseLeave={() => setActiveHover(null)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#001e40] bg-[#001e40]/5 ring-2 ring-[#001e40]/20'
                        : 'border-[#e0e3e5] bg-white hover:border-[#3a5f94]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-[#001e40] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#1b6d24]" />
                        {region.name}
                      </h4>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#1b6d24]" />}
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#43474f]">
                      <div>
                        <span className="block text-[10px] uppercase text-[#737780]">Participações</span>
                        <span className="font-semibold text-[#191c1e]">{region.contributions.toLocaleString('pt-BR')}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase text-[#737780]">Tema em Alta</span>
                        <span className="font-medium text-[#003366] truncate block">{region.topTheme}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e0e3e5] bg-white flex justify-between items-center">
          <span className="text-xs text-[#43474f]">
            Filtro atual: <strong>{selectedRegion}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#001e40] text-white rounded-xl text-xs font-semibold hover:bg-[#003366] transition-colors"
          >
            Aplicar Filtro
          </button>
        </div>
      </div>
    </div>
  );
};
