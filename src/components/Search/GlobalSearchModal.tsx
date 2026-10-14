/**
 * @file GlobalSearchModal.tsx
 * @description Modal de busca global instantânea por municípios, estados e candidatos das Eleições 2026.
 * Acessível via clique no cabeçalho ou atalho de teclado `Ctrl+K`.
 */

import React, { useState, useEffect, useRef } from 'react';
import { buscarGeral, NOMES_UFS } from '../../services/electionDatasetService';
import { MunicipioData } from '../../types/dataset';
import { formatters } from '../../services/electionApi';
import {
  Search,
  MapPin,
  Building2,
  X,
  ChevronRight,
  Sparkles,
  Command,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectUf: (uf: string) => void;
  onSelectMunicipioByIbge: (ibge: number, uf: string, nome: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectUf,
  onSelectMunicipioByIbge,
}) => {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState<{
    estados: Array<{ sigla: string; nome: string }>;
    municipios: Array<{
      ibge: number;
      nome: string;
      uf: string;
      nomeUf: string;
      capital: boolean;
      eleitores: number;
    }>;
  }>({ estados: [], municipios: [] });
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Foco no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResultados({ estados: [], municipios: [] });
    }
  }, [isOpen]);

  // Listener para atalho Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Executa a busca
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResultados({ estados: [], municipios: [] });
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      buscarGeral(query, 25)
        .then((res) => {
          setResultados(res as any);
        })
        .finally(() => setIsSearching(false));
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra de Busca Superior */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3">
          <Search className="h-5 w-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar qualquer cidade (ex: Campinas, Manaus) ou estado (SP, RJ, BA)..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500">
            ESC
          </kbd>
        </div>

        {/* Lista de Resultados */}
        <div className="overflow-y-auto flex-1 p-3 space-y-4">
          {/* Estados Encontrados */}
          {resultados.estados.length > 0 && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                Estados
              </span>
              <div className="space-y-1">
                {resultados.estados.map((est) => (
                  <button
                    key={est.sigla}
                    type="button"
                    onClick={() => {
                      onSelectUf(est.sigla);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50 text-left transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold text-xs uppercase">
                        {est.sigla}
                      </span>
                      <div>
                        <strong className="text-sm font-bold text-slate-900 group-hover:text-blue-700 block">
                          {est.nome}
                        </strong>
                        <span className="text-xs text-slate-500">
                          Ver mapa estadual e todas as cidades
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Municípios Encontrados */}
          {resultados.municipios.length > 0 && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-2 block mb-1">
                Cidades / Municípios ({resultados.municipios.length})
              </span>
              <div className="space-y-1">
                {resultados.municipios.map((mun) => (
                  <button
                    key={mun.ibge}
                    type="button"
                    onClick={() => {
                      onSelectMunicipioByIbge(mun.ibge, mun.uf.toLowerCase(), mun.nome);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-left transition-colors group border border-transparent hover:border-slate-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 shrink-0">
                        <MapPin className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-slate-900 truncate">
                            {mun.nome}
                          </strong>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
                            {mun.uf}
                          </span>
                          {mun.capital && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase">
                              Capital
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatters.number(mun.eleitores)} eleitores aptos
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Vazio ou sugestões iniciais */}
          {!query && (
            <div className="py-10 text-center text-slate-400 space-y-2">
              <Building2 className="h-10 w-10 mx-auto text-slate-300" />
              <p className="text-sm font-medium">
                Digite o nome de qualquer cidade ou estado do Brasil
              </p>
              <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
                {['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília', 'Curitiba'].map(
                  (cidade) => (
                    <button
                      key={cidade}
                      type="button"
                      onClick={() => setQuery(cidade)}
                      className="rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-xs text-slate-700 font-medium transition-colors"
                    >
                      {cidade}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Nenhum resultado */}
          {query && !isSearching && resultados.estados.length === 0 && resultados.municipios.length === 0 && (
            <div className="py-10 text-center text-slate-500">
              <p className="text-sm font-semibold">Nenhuma localidade encontrada para &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-slate-400 mt-1">Verifique a ortografia ou tente buscar pela sigla do estado.</p>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Mais de 5.570 municípios cadastrados</span>
          <span className="hidden sm:inline">Use as setas para navegar e Enter para selecionar</span>
        </div>
      </div>
    </div>
  );
};
