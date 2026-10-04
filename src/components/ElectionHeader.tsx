/**
 * @file ElectionHeader.tsx
 * @description Cabeçalho editorial do painel de apuração seguindo o Top Bar Contract:
 * [Marca editorial] — [Status ao vivo & Escopo] — [Ação de Atualizar & Configuração]
 */

import React from 'react';
import { RefreshCw, Radio, SlidersHorizontal, CheckCircle2 } from 'lucide-react';
import { formatters } from '../services/electionApi';

interface ElectionHeaderProps {
  titulo: string;
  cargo: string;
  abrangencia: string;
  dataHoraAtualizacao: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  isAutoRefreshActive: boolean;
  onToggleAutoRefresh: () => void;
  onOpenApiSettings: () => void;
  isFinalizada?: boolean;
}

export const ElectionHeader: React.FC<ElectionHeaderProps> = ({
  cargo,
  abrangencia,
  dataHoraAtualizacao,
  isRefreshing,
  onRefresh,
  isAutoRefreshActive,
  onToggleAutoRefresh,
  onOpenApiSettings,
  isFinalizada,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white">
      {/* Faixa superior institucional editorial */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Zona 1: Marca editorial */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xl font-extrabold tracking-tight text-slate-900 font-sans">
              APURAÇÃO <span className="text-blue-600">ELEIÇÕES</span>
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">|</span>
            <span className="hidden text-xs font-semibold uppercase tracking-wider text-slate-500 sm:inline">
              Tempo Real
            </span>
          </div>
        </div>

        {/* Zona 2: Status do pleito e última atualização */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            {isFinalizada ? (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Totalização Concluída
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-rose-600">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600"></span>
                </span>
                AO VIVO
              </span>
            )}
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>{abrangencia}</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="font-medium text-slate-700">{cargo}</span>
          </div>

          <span aria-hidden="true" className="text-slate-300">·</span>

          <span className="text-slate-500 tabular-nums">
            Última atualização: <strong className="font-semibold text-slate-800">{formatters.dateTime(dataHoraAtualizacao)}</strong>
          </span>
        </div>

        {/* Zona 3: Controles primários de atualização e configuração */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão de auto-atualização */}
          <button
            type="button"
            onClick={onToggleAutoRefresh}
            title={isAutoRefreshActive ? 'Pausar atualização automática' : 'Ativar atualização automática (12s)'}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap ${
              isAutoRefreshActive
                ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Radio className={`h-3.5 w-3.5 ${isAutoRefreshActive ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
            <span>{isAutoRefreshActive ? 'Auto: 12s' : 'Auto: Desligado'}</span>
          </button>

          {/* Botão de configurações de API */}
          <button
            type="button"
            onClick={onOpenApiSettings}
            title="Configurar Endpoint da API REST"
            className="inline-flex items-center justify-center p-2 text-slate-600 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            aria-label="Configurações da API"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* Botão principal de Atualizar Resultados */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 whitespace-nowrap cursor-pointer"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-white ${isRefreshing ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Resultados'}</span>
          </button>
        </div>
      </div>

      {/* Sub-barra mobile de data/hora */}
      <div className="flex md:hidden items-center justify-between border-t border-slate-100 bg-slate-50 px-4 py-1.5 text-[11px] text-slate-600">
        <div className="flex items-center gap-1.5 font-medium">
          {isFinalizada ? (
            <span className="text-emerald-700 font-semibold">Totalização Final</span>
          ) : (
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span>
              AO VIVO
            </span>
          )}
          <span>· {cargo}</span>
        </div>
        <span className="tabular-nums text-slate-500">
          Atualizado às {formatters.dateTime(dataHoraAtualizacao).split(' às ')[1] || 'agora'}
        </span>
      </div>
    </header>
  );
};
