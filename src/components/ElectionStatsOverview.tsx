/**
 * @file ElectionStatsOverview.tsx
 * @description Painel lateral/inferior de estatísticas eleitorais:
 * Votos válidos, brancos, nulos, comparecimento e abstenções com visualização proporcional.
 */

import React from 'react';
import { ElectionSummary } from '../types/election';
import { formatters } from '../services/electionApi';
import { Vote, Users, PieChart, ShieldAlert } from 'lucide-react';

interface ElectionStatsOverviewProps {
  data: ElectionSummary;
}

export const ElectionStatsOverview: React.FC<ElectionStatsOverviewProps> = ({ data }) => {
  return (
    <aside aria-label="Estatísticas da Totalização" className="space-y-4">
      {/* Bloco 1: Decomposição dos Votos */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Distribuição dos Votos
            </h3>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">
            Total: {formatters.number(data.votos_total)}
          </span>
        </div>

        {/* Barra proporcional visual dos tipos de votos */}
        <div className="mt-4">
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 flex">
            <div
              title={`Votos Válidos: ${formatters.percent(data.votos_validos_pct)}`}
              style={{ width: `${data.votos_validos_pct}%` }}
              className="bg-emerald-600 transition-all duration-500"
            />
            <div
              title={`Votos Brancos: ${formatters.percent(data.votos_brancos_pct)}`}
              style={{ width: `${data.votos_brancos_pct}%` }}
              className="bg-amber-400 transition-all duration-500"
            />
            <div
              title={`Votos Nulos: ${formatters.percent(data.votos_nulos_pct)}`}
              style={{ width: `${data.votos_nulos_pct}%` }}
              className="bg-slate-400 transition-all duration-500"
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
              Válidos ({formatters.percent(data.votos_validos_pct)})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400"></span>
              Brancos ({formatters.percent(data.votos_brancos_pct)})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>
              Nulos ({formatters.percent(data.votos_nulos_pct)})
            </span>
          </div>
        </div>

        {/* Detalhamento numérico */}
        <div className="mt-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-600 font-medium">Votos Válidos</span>
            <div className="text-right tabular-nums">
              <span className="font-bold text-slate-900">{formatters.number(data.votos_validos)}</span>
              <span className="ml-1.5 text-slate-500">({formatters.percent(data.votos_validos_pct)})</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-600">Votos Brancos</span>
            <div className="text-right tabular-nums">
              <span className="font-semibold text-slate-800">{formatters.number(data.votos_brancos)}</span>
              <span className="ml-1.5 text-slate-500">({formatters.percent(data.votos_brancos_pct)})</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 text-xs">
            <span className="text-slate-600">Votos Nulos</span>
            <div className="text-right tabular-nums">
              <span className="font-semibold text-slate-800">{formatters.number(data.votos_nulos)}</span>
              <span className="ml-1.5 text-slate-500">({formatters.percent(data.votos_nulos_pct)})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bloco 2: Comparecimento e Abstenção */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Eleitorado & Frequência
            </h3>
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Comparecimento</span>
              <span className="font-bold text-emerald-700 tabular-nums">
                {formatters.percent(data.comparecimento_pct)}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${data.comparecimento_pct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
              {formatters.number(data.comparecimento)} eleitores votaram
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Abstenção</span>
              <span className="font-semibold text-slate-700 tabular-nums">
                {formatters.percent(data.abstencoes_pct)}
              </span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full bg-slate-400 rounded-full transition-all duration-500"
                style={{ width: `${data.abstencoes_pct}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
              {formatters.number(data.abstencoes)} eleitores ausentes
            </p>
          </div>
        </div>
      </div>

      {/* Bloco 3: Nota Institucional de Confiabilidade da Apuração */}
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600">
        <div className="flex items-start gap-2">
          <Vote className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Dados totalizados diretamente das seções eleitorais. A proclamação oficial
            dos resultados ocorre após 100% de urnas processadas ou definição matemática.
          </p>
        </div>
      </div>
    </aside>
  );
};
