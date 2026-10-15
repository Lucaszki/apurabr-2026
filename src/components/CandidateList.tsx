/**
 * @file CandidateList.tsx
 * @description Lista de candidatos ordenada decrescentemente por número de votos,
 * com suporte a busca rápida e resumo da margem entre os líderes.
 */

import React, { useState, useMemo } from 'react';
import { Candidate } from '../types/election';
import { CandidateCard } from './CandidateCard';
import { Search, ArrowUpDown, TrendingUp } from 'lucide-react';
import { formatters } from '../services/electionApi';

interface CandidateListProps {
  candidates: Candidate[];
  totalVotosValidos: number;
  urnasApuradasPct: number;
  isTotalizacaoFinal: boolean;
}

export const CandidateList: React.FC<CandidateListProps> = ({
  candidates,
  totalVotosValidos,
  urnasApuradasPct,
  isTotalizacaoFinal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Garante a ordenação rigorosa decrescente por quantidade de votos
  const sortedCandidates = useMemo(() => {
    return [...candidates].sort((a, b) => b.votos - a.votos);
  }, [candidates]);

  // Filtro de busca por nome ou sigla do partido
  const filteredCandidates = useMemo(() => {
    if (!searchTerm.trim()) return sortedCandidates;
    const term = searchTerm.toLowerCase();
    return sortedCandidates.filter(
      (c) =>
        c.nome.toLowerCase().includes(term) ||
        c.siglaPartido.toLowerCase().includes(term) ||
        c.partido.toLowerCase().includes(term) ||
        String(c.numero).includes(term)
    );
  }, [sortedCandidates, searchTerm]);

  // Cálculo da diferença de votos entre 1º e 2º colocados (margem de liderança)
  const marginStats = useMemo(() => {
    if (sortedCandidates.length < 2) return null;
    const [first, second] = sortedCandidates;
    const diffVotes = Math.max(0, first.votos - second.votos);
    const diffPct = Math.max(0, first.porcentagem - second.porcentagem);
    return {
      first,
      second,
      diffVotes,
      diffPct,
    };
  }, [sortedCandidates]);

  return (
    <section aria-label="Lista de Candidatos em Disputa" className="space-y-4">
      {/* Barra de controle e busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
            Classificação dos Candidatos
          </h2>
          <p className="text-xs text-slate-500">
            Ordenados pelo total de votos válidos computados
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Campo de busca rápida */}
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar candidato ou partido..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-800"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-600"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Cartão de margem entre os líderes (recurso clássico de cobertura jornalística) */}
      {marginStats && !searchTerm && (
        <div className="rounded-xl bg-slate-100 border border-slate-200/90 p-3 sm:p-3.5 text-xs text-slate-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Diferença de liderança: </strong>
              <span className="font-semibold text-slate-900">{marginStats.first.nome}</span> tem{' '}
              <strong className="font-extrabold text-slate-900">{formatters.percent(marginStats.diffPct)}</strong> a mais que{' '}
              <span className="font-semibold text-slate-900">{marginStats.second.nome}</span>
            </span>
          </div>
          <div className="text-xs font-bold tabular-nums text-slate-700 shrink-0">
            Vantagem de {formatters.number(marginStats.diffVotes)} votos
          </div>
        </div>
      )}

      {/* Grid de Cards de Candidatos */}
      {filteredCandidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          Nenhum candidato encontrado com o termo "{searchTerm}".
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredCandidates.map((cand, index) => {
            // Encontra a posição real no ranking global original
            const originalRank = sortedCandidates.findIndex((c) => c.id === cand.id) + 1;
            return (
              <CandidateCard
                key={cand.id}
                candidate={cand}
                rank={originalRank}
                totalVotosValidos={totalVotosValidos}
                urnasApuradasPct={urnasApuradasPct}
                isTotalizacaoFinal={isTotalizacaoFinal}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};
