/**
 * @file CandidateCard.tsx
 * @description Card individual de candidato com foto em silhueta, dados partidários,
 * percentual em destaque, votos absolutos e destaque visual para o 1º colocado.
 */

import React from 'react';
import { Candidate } from '../types/election';
import { formatters } from '../services/electionApi';
import { Trophy, CheckCircle, ChevronRight } from 'lucide-react';
import { CandidatePhoto } from './CandidatePhoto';

interface CandidateCardProps {
  candidate: Candidate;
  rank: number;
  totalVotosValidos: number;
  urnasApuradasPct: number;
  isTotalizacaoFinal: boolean;
}

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  rank,
  totalVotosValidos,
  urnasApuradasPct,
  isTotalizacaoFinal,
}) => {
  const isLeader = rank === 1;
  const isSecond = rank === 2;

  // Determina selo de situação eleitoral
  const renderStatusBadge = () => {
    if (isTotalizacaoFinal) {
      if (candidate.status === 'eleito') {
        return (
          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">
            <CheckCircle className="h-3 w-3" />
            Eleito
          </span>
        );
      }
      if (candidate.status === 'segundo_turno') {
        return (
          <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800 border border-slate-300">
            2º Turno
          </span>
        );
      }
      return (
        <span className="text-xs font-medium text-slate-400">
          Não eleito
        </span>
      );
    }

    if (isLeader) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
          <Trophy className="h-3 w-3 text-amber-700" />
          1º Lugar · {candidate.porcentagem > 50 ? 'Mais de 50%' : 'Liderança'}
        </span>
      );
    }

    if (isSecond && urnasApuradasPct >= 70) {
      return (
        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
          2º Lugar · Zona de 2º Turno
        </span>
      );
    }

    return (
      <span className="text-xs font-medium text-slate-400">
        {rank}º colocado
      </span>
    );
  };

  return (
    <article
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        isLeader
          ? 'border-slate-300 bg-white shadow-md ring-1 ring-slate-900/10'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
      }`}
    >
      {/* Faixa decorativa sutil na borda superior com a cor oficial do próprio candidato */}
      {isLeader && (
        <div
          className="h-1.5 w-full transition-all"
          style={{ backgroundColor: candidate.corHex }}
        />
      )}

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Lado Esquerdo: Posição, Silhueta e Informações do Candidato */}
          <div className="flex items-start gap-3.5 sm:items-center">
            {/* Indicador de posição / Rank */}
            <div className="flex flex-col items-center justify-center">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold tabular-nums ${
                  isLeader
                    ? 'bg-slate-900 text-white shadow-xs'
                    : isSecond
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {rank}º
              </span>
            </div>

            {/* Foto oficial do candidato estilo TSE / Urna Eletrônica */}
            <CandidatePhoto
              fotoUrl={candidate.fotoUrl}
              nome={candidate.nomeUrna || candidate.nome}
              numero={candidate.numero}
              corHex={candidate.corHex}
              partido={candidate.siglaPartido}
              size="md"
              aspectRatio="portrait"
              showNumberBadge
              showPartyDot
              priority={isLeader || isSecond}
            />

            {/* Informações nominais e partidárias */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight truncate">
                  {candidate.nome}
                </h3>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-bold text-slate-700 border border-slate-200">
                  {candidate.siglaPartido}
                </span>
              </div>

              <p className="mt-0.5 text-xs text-slate-600 truncate">
                {candidate.partido}
              </p>

              {candidate.vice && (
                <p className="text-[11px] text-slate-500 truncate">
                  Vice: <span className="font-medium text-slate-700">{candidate.vice}</span>
                </p>
              )}

              <div className="mt-1.5 sm:hidden">
                {renderStatusBadge()}
              </div>
            </div>
          </div>

          {/* Lado Direito: Porcentagem destacada e Votos Absolutos */}
          <div className="flex flex-row sm:flex-col items-baseline sm:items-end justify-between border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
            <div className="hidden sm:block mb-1">
              {renderStatusBadge()}
            </div>

            <div className="flex items-baseline gap-1 sm:text-right">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans tabular-nums text-slate-900">
                {formatters.percent(candidate.porcentagem)}
              </span>
              <span className="text-xs font-semibold text-slate-500">dos votos</span>
            </div>

            <div className="text-xs text-slate-600 font-medium tabular-nums sm:text-right mt-0.5">
              <strong className="text-slate-800">{formatters.number(candidate.votos)}</strong> votos apurados
            </div>
          </div>
        </div>

        {/* Barra de progresso individual proporcional aos votos válidos */}
        <div className="mt-3.5 pt-2">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Participação sobre votos válidos</span>
            <span className="font-medium tabular-nums text-slate-700">
              {formatters.percent(candidate.porcentagem)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, candidate.porcentagem))}%`,
                backgroundColor: candidate.corHex,
              }}
            />
          </div>
        </div>
      </div>
    </article>
  );
};
