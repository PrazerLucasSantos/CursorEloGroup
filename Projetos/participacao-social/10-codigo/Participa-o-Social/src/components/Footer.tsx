import React from 'react';
import { Landmark, Shield, Mail, Phone, ExternalLink, Heart } from 'lucide-react';
import { ViewMode } from '../types';

interface FooterProps {
  onNavigate: (view: ViewMode) => void;
  onOpenImageLinksModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenImageLinksModal }) => {
  return (
    <footer className="bg-[#001e40] text-white border-t border-[#003366] mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Institutional */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Landmark className="w-5 h-5 text-[#ffddb5]" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[#a0f399] tracking-wider uppercase block">
                  Governo de Mato Grosso
                </span>
                <span className="text-base font-bold text-white leading-tight">
                  Participação Social MT
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Plataforma oficial da Secretaria de Estado de Planejamento e Gestão (SEPLAG) para democratizar o orçamento, o PPA e a formulação de políticas públicas.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#a0f399]">
              <Shield className="w-4 h-4" />
              <span>Conformidade com a LGPD e Transparência MT</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffddb5]">
              Navegação
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-white transition-colors"
                >
                  Página Inicial
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('explore')}
                  className="hover:text-white transition-colors"
                >
                  Explorar Todas as Missões Públicas
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('results')}
                  className="hover:text-white transition-colors"
                >
                  Resultados & Devolutivas Governamentais
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('profile')}
                  className="hover:text-white transition-colors"
                >
                  Minha Participação e Selos
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenImageLinksModal}
                  className="text-[#a0f399] font-medium hover:underline flex items-center gap-1"
                >
                  <span>Links Diretos das Imagens (HTML)</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Secretarias Integradas */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffddb5]">
              Secretarias do Estado
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              <li>SEPLAG - Planejamento e Gestão</li>
              <li>SEDUC - Secretaria de Educação</li>
              <li>SES - Secretaria de Saúde</li>
              <li>SINFRA - Infraestrutura e Logística</li>
              <li>SEMA - Meio Ambiente</li>
              <li>SESP - Segurança Pública</li>
              <li>MTI - Tecnologia da Informação</li>
            </ul>
          </div>

          {/* Column 4: Contact & Ouvidoria */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffddb5]">
              Canais Oficiais & Ouvidoria
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#ffddb5]" />
                <span>Ouvidoria Geral: 162 ou 0800 647 8888</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#ffddb5]" />
                <span>participacao@seplag.mt.gov.br</span>
              </div>
              <p className="text-[11px] text-slate-400 pt-2 leading-relaxed">
                Centro Político Administrativo (CPA) - Palácio Paiaguás, Cuiabá - MT, CEP 78049-902
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#003366] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} Governo do Estado de Mato Grosso. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer">Termos de Uso</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Política de Privacidade</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Portal da Transparência</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
