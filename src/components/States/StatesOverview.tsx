/**
 * @file StatesOverview.tsx
 * @description Visão consolidada das disputas estaduais: Governadores, Senadores e Bancadas Parlamentares.
 */

import React, { useState } from 'react';
import { ResumoNacionalBrasil } from '../../types/dataset';
import { NOMES_UFS, CORES_PARTIDOS } from '../../services/electionDatasetService';
import { formatters } from '../../services/electionApi';
import {
  Building2,
  Trophy,
  Users,
  Search,
  Filter,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface StatesOverviewProps {
  resumoNacional: ResumoNacionalBrasil | null;
  onSelectUf: (uf: string) => void;
}

export const StatesOverview: React.FC<StatesOverviewProps> = ({
  resumoNacional,
  onSelectUf,
}) => {
  const [filtroSituacao, setFiltroSituacao] = useState<'todos' | 'segundo_turno' | 'eleito_1t'>('todos');
  const [busca, setBusca] = useState('');

  if (!resumoNacional) return null;

  const ufs2Turno = new Set(['am', 'rn', 'df', 'es', 'ac']);

  const listaEstados = Object.entries(resumoNacional.gov || {})
    .map(([uf, govData]) => {
      const is2T = ufs2Turno.has(uf.toLowerCase());
      const cands = govData.cands;
      const lider = cands[0];
      const segundo = cands[1];

      return {
        uf: uf.toLowerCase(),
        nome: NOMES_UFS[uf.toLowerCase()] || uf.toUpperCase(),
        is2T,
        lider,
        segundo,
        totais: govData.tot,
        cands,
      };
    })
    .filter((est) => {
      if (filtroSituacao === 'segundo_turno' && !est.is2T) return false;
      if (filtroSituacao === 'eleito_1t' && est.is2T) return false;
      if (busca) {
        const b = busca.toLowerCase();
        return est.nome.toLowerCase().includes(b) || est.uf.includes(b);
      }
      return true;
    });

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Eleições Estaduais · Governos & Senados
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resultados consolidados em 22 estados no 1º turno e 5 estados com 2º turno decisivo em 25/10.
          </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFiltroSituacao('todos')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filtroSituacao === 'todos'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos (27)
            </button>
            <button
              type="button"
              onClick={() => setFiltroSituacao('segundo_turno')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filtroSituacao === 'segundo_turno'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2º Turno (5 UFs)
            </button>
            <button
              type="button"
              onClick={() => setFiltroSituacao('eleito_1t')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filtroSituacao === 'eleito_1t'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eleitos em 1º Turno (22 UFs)
            </button>
          </div>
        </div>
      </div>

      {/* Grid de Cards por Estado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listaEstados.map((est) => (
          <div
            key={est.uf}
            className={`rounded-2xl border bg-white p-5 shadow-xs flex flex-col justify-between transition-all hover:border-slate-300 ${
              est.is2T ? 'border-amber-300 ring-2 ring-amber-400/10' : 'border-slate-200'
            }`}
          >
            <div>
              {/* Cabeçalho do Estado */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-xs shadow-xs">
                    {est.uf.toUpperCase()}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
                      {est.nome}
                    </h3>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {formatters.number(est.totais.te)} eleitores
                    </span>
                  </div>
                </div>

                {est.is2T ? (
                  <span className="rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-[11px] font-extrabold text-amber-800">
                    2º Turno
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Eleito 1º T
                  </span>
                )}
              </div>

              {/* Detalhe do Governador Líder / Eleito */}
              {est.lider && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{est.lider.nmu}</span>
                      <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                        {est.lider.sg}
                      </span>
                    </div>
                    <span className="font-extrabold text-blue-700 tabular-nums">
                      {formatters.percent(est.lider.p)}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${est.lider.p}%` }}
                    />
                  </div>

                  {/* Segundo Colocado se for 2T */}
                  {est.is2T && est.segundo && (
                    <div className="pt-2 border-t border-slate-200/80">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{est.segundo.nmu}</span>
                          <span className="rounded bg-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700">
                            {est.segundo.sg}
                          </span>
                        </div>
                        <span className="font-extrabold text-indigo-700 tabular-nums">
                          {formatters.percent(est.segundo.p)}
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${est.segundo.p}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Ação: Ver mapa do Estado */}
            <button
              type="button"
              onClick={() => onSelectUf(est.uf)}
              className="mt-4 w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 py-2 text-xs font-bold transition-colors"
            >
              <span>Abrir no mapa detalhado</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
