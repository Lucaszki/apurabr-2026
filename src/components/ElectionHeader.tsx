/**
 * @file ElectionHeader.tsx
 * @description Cabeçalho editorial refinado do painel de apuração das Eleições 2026.
 * Inclui campo de busca rápida (`Ctrl+K`), alternador de turnos, status oficial e ações.
 */

import React from 'react';
import {
  RefreshCw,
  Radio,
  SlidersHorizontal,
  CheckCircle2,
  Search,
  MapPin,
  Calendar,
} from 'lucide-react';
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
  onOpenSearch: () => void;
  isFinalizada?: boolean;
  turnoAtivo: number;
  onSelectTurno: (t: number) => void;
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
  onOpenSearch,
  isFinalizada,
  turnoAtivo,
  onSelectTurno,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      {/* Faixa superior principal */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8 gap-4">
        {/* Zona 1: Marca editorial e Seletor de Turno */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-tight text-slate-900 font-sans">
              APURAÇÃO <span className="text-blue-600">2026</span>
            </span>
            <span className="hidden text-slate-300 sm:inline" aria-hidden="true">|</span>
            <span className="hidden text-[11px] font-extrabold uppercase tracking-wider text-slate-500 sm:inline">
              TSE OFICIAL
            </span>
          </div>

          {/* Seletor de Turno */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => onSelectTurno(1)}
              className={`px-3 py-1 rounded-lg transition-all ${
                turnoAtivo === 1
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1º Turno (Oficial)
            </button>
            <button
              type="button"
              onClick={() => onSelectTurno(2)}
              className={`px-3 py-1 rounded-lg transition-all ${
                turnoAtivo === 2
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2º Turno (25/10)
            </button>
          </div>
        </div>

        {/* Zona 2: Barra de Busca Rápida de Cidades e Estados */}
        <div className="flex-1 max-w-md hidden md:block">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors text-xs font-medium cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-slate-400" />
              <span>Buscar qualquer cidade ou estado...</span>
            </div>
            <kbd className="inline-flex items-center gap-1 rounded bg-white border border-slate-200 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-slate-500">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Zona 3: Controles e Ações */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Botão de busca mobile */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="md:hidden inline-flex items-center justify-center p-2 text-slate-600 rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            aria-label="Buscar cidades e estados"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Indicador de Transmissão Ao Vivo em Tempo Real */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600"></span>
            </span>
            <span className="hidden sm:inline">TRANSMISSÃO AO VIVO</span>
            <span className="sm:hidden">AO VIVO</span>
          </div>

          {/* Botão de configurações de API */}
          <button
            type="button"
            onClick={onOpenApiSettings}
            title="Configurar Endpoint da API REST"
            className="inline-flex items-center justify-center p-2 text-slate-500 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
            aria-label="Configurações da API"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Faixa inferior de status da totalização */}
      <div className="border-t border-slate-100 bg-slate-50 px-4 py-1.5 sm:px-6 lg:px-8 text-[11px] text-slate-600 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          {turnoAtivo === 1 ? (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <CheckCircle2 className="h-3 w-3" />
              1º Turno Consolidado (100% apurado em 04/10/2026)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-semibold text-blue-700">
              <Calendar className="h-3 w-3" />
              2º Turno Agendado para 25 de Outubro de 2026 (Pesquisas em Andamento)
            </span>
          )}
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span>{abrangencia}</span>
          <span aria-hidden="true" className="text-slate-300">·</span>
          <span className="font-semibold text-slate-800">{cargo}</span>
        </div>

        <div className="text-slate-500 tabular-nums hidden sm:block">
          Última transmissão oficial TSE: <strong>{formatters.dateTime(dataHoraAtualizacao)}</strong>
        </div>
      </div>
    </header>
  );
};
