/**
 * @file PollsOverview.tsx
 * @description Painel completo de pesquisas eleitorais registradas para o 2º Turno de 2026.
 * Inclui agregador de médias ponderadas, comparativo entre institutos, recortes regionais e pesquisas estaduais.
 */

import React, { useState } from 'react';
import {
  PESQUISAS_PRESIDENTE_2T,
  PESQUISAS_GOVERNADOR_2T,
  calcularMediaAgregada,
} from '../../data/pesquisas2026';
import { formatters } from '../../services/electionApi';
import {
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Percent,
  Layers,
  MapPin,
  Building2,
  AlertCircle,
  Info,
} from 'lucide-react';

export const PollsOverview: React.FC = () => {
  const [modoExibicao, setModoExibicao] = useState<'validos' | 'totais' | 'rejeicao'>('validos');
  const mediaAgregada = calcularMediaAgregada();

  return (
    <div className="space-y-8">
      {/* 1. Tracker Nacional: Média Ponderada Agregada */}
      {mediaAgregada && (
        <section className="rounded-2xl border border-blue-200 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200/80">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-600 text-white">
                  <TrendingUp className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Agregador Oficial · 2º Turno 2026
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                Média Agregada das Pesquisas Nacionais
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Consolidação ponderada de {mediaAgregada.quantidadePesquisas} levantamentos
                (Datafolha, AtlasIntel, BTG/Nexus, PoderData, Futura, Gerp) divulgados até {mediaAgregada.atualizadoEm}.
              </p>
            </div>

            {/* Alternador de Métrica */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start md:self-auto">
              <button
                type="button"
                onClick={() => setModoExibicao('validos')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  modoExibicao === 'validos'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Votos Válidos
              </button>
              <button
                type="button"
                onClick={() => setModoExibicao('totais')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  modoExibicao === 'totais'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Votos Totais (Estimulada)
              </button>
              <button
                type="button"
                onClick={() => setModoExibicao('rejeicao')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  modoExibicao === 'rejeicao'
                    ? 'bg-white text-slate-900 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejeição
              </button>
            </div>
          </div>

          {/* Placar Principal e Termômetro da Disputa */}
          <div className="pt-6 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Flávio Bolsonaro */}
              <div className="rounded-xl border border-blue-200 bg-white p-5 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white font-extrabold text-lg shadow-sm">
                    22
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Flávio Bolsonaro
                    </h3>
                    <span className="text-xs font-semibold text-blue-700">
                      Partido Liberal (PL)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 tabular-nums">
                    {modoExibicao === 'validos'
                      ? formatters.percent(mediaAgregada.validos.flavio)
                      : modoExibicao === 'totais'
                      ? formatters.percent(mediaAgregada.totais.flavio)
                      : '46,5%'}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {modoExibicao === 'validos'
                      ? 'dos votos válidos'
                      : modoExibicao === 'totais'
                      ? 'intenção de voto'
                      : 'não votariam'}
                  </span>
                </div>
              </div>

              {/* Lula */}
              <div className="rounded-xl border border-red-200 bg-white p-5 shadow-xs flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 text-white font-extrabold text-lg shadow-sm">
                    13
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      Luiz Inácio Lula da Silva
                    </h3>
                    <span className="text-xs font-semibold text-red-700">
                      Partido dos Trabalhadores (PT)
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-3xl sm:text-4xl font-extrabold text-red-600 tabular-nums">
                    {modoExibicao === 'validos'
                      ? formatters.percent(mediaAgregada.validos.lula)
                      : modoExibicao === 'totais'
                      ? formatters.percent(mediaAgregada.totais.lula)
                      : '48,1%'}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-medium">
                    {modoExibicao === 'validos'
                      ? 'dos votos válidos'
                      : modoExibicao === 'totais'
                      ? 'intenção de voto'
                      : 'não votariam'}
                  </span>
                </div>
              </div>
            </div>

            {/* Barra Termômetro Comparativa Proporcional */}
            {modoExibicao === 'validos' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span className="text-blue-700 font-bold">
                    Flávio: {formatters.percent(mediaAgregada.validos.flavio)}
                  </span>
                  <span className="text-slate-400">Meta: 50% + 1 voto para vencer</span>
                  <span className="text-red-700 font-bold">
                    Lula: {formatters.percent(mediaAgregada.validos.lula)}
                  </span>
                </div>

                <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                  {/* Barra Flávio */}
                  <div
                    className="h-full bg-gradient-to-r from-blue-700 to-blue-600 transition-all duration-500"
                    style={{ width: `${mediaAgregada.validos.flavio}%` }}
                  />
                  {/* Linha de 50% central */}
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white z-10 shadow-sm" />
                  {/* Barra Lula */}
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-500"
                    style={{ width: `${mediaAgregada.validos.lula}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Comparativo Detalhado por Instituto de Pesquisa */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Pesquisas Registradas no TSE
            </h3>
            <p className="text-xs text-slate-500">
              Levantamentos individuais com data de divulgação, amostra, margem e votos válidos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PESQUISAS_PRESIDENTE_2T.map((pesquisa) => {
            const lideraFlavio = pesquisa.validos.flavio > pesquisa.validos.lula;
            const diff = Math.abs(pesquisa.validos.flavio - pesquisa.validos.lula);

            return (
              <div
                key={pesquisa.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div>
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {pesquisa.instituto}
                      </h4>
                      {pesquisa.contratante && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[200px]">
                          {pesquisa.contratante}
                        </p>
                      )}
                    </div>

                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 tabular-nums">
                      {pesquisa.divulgacao.split('-').reverse().join('/')}
                    </span>
                  </div>

                  {/* Metodologia / Registro */}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 pb-3 border-b border-slate-100">
                    <span title="Amostra">
                      <strong>{formatters.number(pesquisa.amostra)}</strong> entrevistados
                    </span>
                    <span>·</span>
                    <span title="Margem de erro">±{pesquisa.margem}%</span>
                    {pesquisa.registroTse && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded">
                          {pesquisa.registroTse}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Placar de Votos Válidos */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3">
                      <span className="text-[11px] font-bold uppercase text-blue-700 block">
                        Flávio (PL)
                      </span>
                      <span className="text-2xl font-extrabold text-blue-700 tabular-nums">
                        {modoExibicao === 'validos'
                          ? formatters.percent(pesquisa.validos.flavio)
                          : formatters.percent(pesquisa.totais.flavio)}
                      </span>
                    </div>

                    <div className="rounded-xl bg-red-50/70 border border-red-100 p-3">
                      <span className="text-[11px] font-bold uppercase text-red-700 block">
                        Lula (PT)
                      </span>
                      <span className="text-2xl font-extrabold text-red-600 tabular-nums">
                        {modoExibicao === 'validos'
                          ? formatters.percent(pesquisa.validos.lula)
                          : formatters.percent(pesquisa.totais.lula)}
                      </span>
                    </div>
                  </div>

                  {/* Votos Totais / Indecisos */}
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-500 px-1">
                    <span>Brancos/Nulos: {formatters.percent(pesquisa.totais.brancosNulos)}</span>
                    <span>Indecisos: {formatters.percent(pesquisa.totais.indecisos)}</span>
                  </div>

                  {/* Destaques editoriais */}
                  {pesquisa.destaques && pesquisa.destaques.length > 0 && (
                    <ul className="mt-3.5 pt-3 border-t border-slate-100 space-y-1 text-[11px] text-slate-600">
                      {pesquisa.destaques.slice(0, 2).map((destaque, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                          <span className="text-blue-600 font-bold">•</span>
                          <span>{destaque}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Rodapé do Card */}
                {pesquisa.fonteUrl && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <a
                      href={pesquisa.fonteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <span>Ver matéria oficial da pesquisa</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. Recortes Regionais Comparativos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Intenção de Voto por Grande Região Geográfica
          </h3>
          <p className="text-xs text-slate-500">
            Médias consolidadas nos recortes regionais dos principais institutos de pesquisa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            { nome: 'Sudeste', peso: '~43% eleitores', flavio: 54.0, lula: 46.0 },
            { nome: 'Nordeste', peso: '~27% eleitores', flavio: 34.0, lula: 66.0 },
            { nome: 'Sul', peso: '~15% eleitores', flavio: 61.5, lula: 38.5 },
            { nome: 'Centro-Oeste', peso: '~8% eleitores', flavio: 60.0, lula: 40.0 },
            { nome: 'Norte', peso: '~7% eleitores', flavio: 52.5, lula: 47.5 },
          ].map((reg) => (
            <div key={reg.nome} className="rounded-xl bg-slate-50 border border-slate-200/80 p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <strong className="text-xs font-bold text-slate-800">{reg.nome}</strong>
                <span className="text-[10px] text-slate-400 font-medium">{reg.peso}</span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-blue-700">Flávio (PL)</span>
                  <span className="text-blue-700 font-bold tabular-nums">
                    {formatters.percent(reg.flavio)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-red-700">Lula (PT)</span>
                  <span className="text-red-700 font-bold tabular-nums">
                    {formatters.percent(reg.lula)}
                  </span>
                </div>
              </div>

              {/* Barra */}
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div className="h-full bg-blue-700" style={{ width: `${reg.flavio}%` }} />
                <div className="h-full bg-red-600" style={{ width: `${reg.lula}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Pesquisas de 2º Turno para Governos Estaduais */}
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Pesquisas Estaduais · Governos com 2º Turno
          </h3>
          <p className="text-xs text-slate-500">
            Disputas estaduais em Amazonas (AM), Distrito Federal (DF), Rio Grande do Norte (RN), Espírito Santo (ES) e Acre (AC).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PESQUISAS_GOVERNADOR_2T.map((pgov) => (
            <div
              key={pgov.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-900 text-white font-extrabold text-xs px-2 py-0.5">
                    {pgov.uf.toUpperCase()}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">Governo do Estado</span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  {pgov.divulgacao.split('-').reverse().join('/')}
                </span>
              </div>

              <div className="text-xs text-slate-500">
                <span>{pgov.instituto}</span> · Margem: ±{pgov.margem}%
              </div>

              {/* Candidatos da disputa estadual */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {pgov.candidato1.nome} ({pgov.candidato1.partido})
                  </span>
                  <span className="font-extrabold text-blue-700 tabular-nums">
                    {formatters.percent(pgov.candidato1.validos)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{ width: `${pgov.candidato1.validos}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-slate-800">
                    {pgov.candidato2.nome} ({pgov.candidato2.partido})
                  </span>
                  <span className="font-extrabold text-indigo-700 tabular-nums">
                    {formatters.percent(pgov.candidato2.validos)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-600 rounded-full"
                    style={{ width: `${pgov.candidato2.validos}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
