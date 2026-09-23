import React, { useState } from 'react';
import { X, Check, Copy, ExternalLink, Image as ImageIcon, Code2 } from 'lucide-react';
import { INITIAL_MISSIONS } from '../data/mockData';

interface ImageLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageLinksModal: React.FC<ImageLinksModalProps> = ({ isOpen, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const imageAssets = [
    {
      id: 'pantanal-hero',
      title: 'Pantanal & Biodiversidade MT (Hero Banner)',
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80',
      htmlTag: `<img src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1600&q=80" alt="Pantanal Mato Grosso" />`,
      description: 'Imagem para cabeçalhos e seções de sustentabilidade e meio ambiente'
    },
    {
      id: 'ppa-banner',
      title: 'Chapada dos Guimarães & Território (PPA 2024-2027)',
      url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      htmlTag: `<img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80" alt="Plano Plurianual MT" />`,
      description: 'Imagem representativa das missões de planejamento estadual'
    },
    {
      id: 'education-school',
      title: 'Escola Estadual & Inclusão Digital (SEDUC)',
      url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80',
      htmlTag: `<img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80" alt="Educação Mato Grosso" />`,
      description: 'Card e detalhe do Novo Currículo das Escolas Estaduais'
    },
    {
      id: 'health-hospital',
      title: 'Saúde & Hospitais Regionais (SES)',
      url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80',
      htmlTag: `<img src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1000&q=80" alt="Saúde Regional MT" />`,
      description: 'Card e missão de ampliação do atendimento especializado'
    },
    {
      id: 'results-gathering',
      title: 'Audiência Pública & Cidadania (Resultados / Devolutivas)',
      url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80',
      htmlTag: `<img src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80" alt="Audiência Pública MT" />`,
      description: 'Imagem da seção de Devolutiva pública e transparência'
    },
    {
      id: 'rural-security',
      title: 'Segurança no Campo & Patrulhamento Rural (SESP)',
      url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80',
      htmlTag: `<img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1000&q=80" alt="Segurança Rural MT" />`,
      description: 'Card da missão de patrulhamento rural e videomonitoramento'
    }
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#c3c6d1]">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#e0e3e5] flex items-center justify-between bg-[#f8f9fb] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#001e40] text-white flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#001e40]">
                Links Diretos das Imagens do HTML
              </h2>
              <p className="text-sm text-[#43474f]">
                Como vincular e usar as imagens de forma direta em tags HTML e no aplicativo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#43474f] hover:bg-[#e0e3e5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Explanation Banner */}
          <div className="p-4 bg-[#e8f0fe] border border-[#3a5f94]/30 rounded-xl text-sm text-[#001e40]">
            <p className="font-semibold mb-1">
              Sim! É totalmente possível e recomendado adicionar links diretos para as imagens no HTML.
            </p>
            <p className="text-[#43474f]">
              Você pode usar o atributo <code className="bg-white px-2 py-0.5 rounded font-mono text-xs text-[#001e40] border">src="URL_DIRETA"</code> em tags <code className="bg-white px-2 py-0.5 rounded font-mono text-xs text-[#001e40] border">&lt;img&gt;</code> padrão ou tags de fundo CSS <code className="bg-white px-2 py-0.5 rounded font-mono text-xs text-[#001e40] border">background-image: url(...)</code>.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-[#191c1e] text-sm uppercase tracking-wider">
              Galeria de Links Prontos para Copiar
            </h3>

            {imageAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-4 border border-[#e0e3e5] rounded-xl hover:border-[#3a5f94] transition-all bg-[#f8f9fb] flex flex-col md:flex-row gap-4 items-start md:items-center"
              >
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="w-24 h-16 object-cover rounded-lg border border-[#c3c6d1] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm text-[#001e40]">{asset.title}</h4>
                  <p className="text-xs text-[#43474f] mb-2">{asset.description}</p>
                  <code className="block text-xs font-mono bg-white p-2 rounded border border-[#c3c6d1] text-[#191c1e] truncate select-all">
                    {asset.htmlTag}
                  </code>
                </div>
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleCopy(asset.htmlTag, `tag-${asset.id}`)}
                    className="px-3 py-1.5 text-xs font-semibold bg-[#001e40] text-white rounded-lg hover:bg-[#003366] transition-colors flex items-center gap-1.5"
                  >
                    {copiedId === `tag-${asset.id}` ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#a0f399]" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copiar Tag HTML
                      </>
                    )}
                  </button>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 border border-[#c3c6d1] bg-white rounded-lg text-[#43474f] hover:text-[#001e40] hover:bg-[#eceef0] transition-colors"
                    title="Abrir imagem original"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Code Sample */}
          <div className="bg-[#191c1e] text-slate-100 p-4 rounded-xl text-xs font-mono space-y-2">
            <p className="text-[#a0f399] font-bold">// Exemplo de uso em HTML puro ou React JSX:</p>
            <p>&lt;div class="card-missao"&gt;</p>
            <p className="pl-4">&lt;img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="PPA Mato Grosso" class="rounded-xl shadow" /&gt;</p>
            <p className="pl-4">&lt;h3&gt;Plano Plurianual (PPA) 2024-2027&lt;/h3&gt;</p>
            <p>&lt;/div&gt;</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#e0e3e5] bg-[#f8f9fb] rounded-b-2xl flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#001e40] text-white rounded-xl font-medium hover:bg-[#003366] transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
