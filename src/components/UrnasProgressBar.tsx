/**
 * @file UrnasProgressBar.tsx
 * @description Barra de Progresso Global com alta visibilidade e destaque editorial,
 * indicando o percentual de urnas/seções apuradas e contagem totalizadora.
 */

import React from 'react';
import { formatters } from '../services/electionApi';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface UrnasProgressBarProps {
  porcentagem: number;
  secoesApuradas: number;
  secoesTotal: number;
  situacao: string;
}

export const UrnasProgressBar: React.FC<UrnasProgressBarProps> = ({
  porcentagem,
  secoesApuradas,
  secoesTotal,
  situacao,
}) => {
  const percentClamp = Math.min(100, Math.max(0, porcentagem));
  const secoesRestantes = Math.max(0, secoesTotal - secoesApuradas);
  const percentRestante = Math.max(0, 100 - percentClamp);
  const isFinal = percentClamp >= 100;

  return (
    <section 
      aria-label="Progresso da apuração das urnas"
      className="border-b border-slate-200 bg-white shadow-xs"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {/* Cabeçalho do progresso global */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 font-sans tabular-nums">
              {formatters.percent(percentClamp)}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-bold uppercase tracking-wide text-slate-800">
                das urnas apuradas
              </span>
              <span className="text-xs text-slate-500 tabular-nums">
                {formatters.number(secoesApuradas)} de {formatters.number(secoesTotal)} seções
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-600">
            {isFinal ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                <CheckCircle2 className="h-3.5 w-3.5" />
                100% dos votos computados
              </span>
            ) : (
              <div className="flex items-center gap-2">
                <span className="tabular-nums">
                  Restam <strong className="font-semibold text-slate-800">{formatters.number(secoesRestantes)}</strong> seções ({formatters.percent(percentRestante)})
                </span>
                {percentClamp >= 90 && (
                  <span className="hidden lg:inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                    <AlertCircle className="h-3 w-3" />
                    Reta final
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Barra de progresso grossa e visualmente destacada */}
        <div className="mt-3 relative">
          <div 
            className="h-3.5 sm:h-4 w-full overflow-hidden rounded-full bg-slate-200 shadow-inner"
            role="progressbar"
            aria-valuenow={percentClamp}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${formatters.percent(percentClamp)} das seções apuradas`}
          >
            <div
              className={`h-full transition-all duration-700 ease-out rounded-full ${
                isFinal 
                  ? 'bg-emerald-600' 
                  : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-700'
              }`}
              style={{ width: `${percentClamp}%` }}
            />
          </div>

          {/* Marcadores de referência editorial (50% e 100%) */}
          <div className="relative mt-1.5 flex justify-between text-[10px] font-medium text-slate-400 select-none">
            <span>0%</span>
            <span className="text-slate-400">50% (Maioria simples)</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </section>
  );
};
