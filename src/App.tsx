/**
 * @file App.tsx
 * @description Aplicação Principal: Painel de Apuração de Resultados de Eleições em Tempo Real.
 * Estilo editorial de grandes portais jornalísticos, consumo desacoplado de API REST e responsivo.
 */

import React, { useState } from 'react';
import { useElectionData } from './hooks/useElectionData';
import { ElectionHeader } from './components/ElectionHeader';
import { UrnasProgressBar } from './components/UrnasProgressBar';
import { CandidateList } from './components/CandidateList';
import { ElectionStatsOverview } from './components/ElectionStatsOverview';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { AlertCircle, RefreshCw, Info, Code2, ExternalLink } from 'lucide-react';
import { formatters } from './services/electionApi';

export default function App() {
  const {
    data,
    loading,
    isRefreshing,
    error,
    isAutoRefreshActive,
    setIsAutoRefreshActive,
    refresh,
    setSimulatedUrnasPercent,
    reset,
    url,
    changeApiUrl,
    isRealApiMode,
  } = useElectionData({
    autoRefresh: false,
    refreshIntervalMs: 12000,
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Estado de carregamento inicial (esqueleto editorial)
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white py-4 px-6">
          <div className="mx-auto max-w-7xl flex items-center justify-between">
            <div className="h-6 w-48 animate-pulse rounded bg-slate-200" />
            <div className="h-8 w-32 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
        <div className="border-b border-slate-200 bg-white py-6 px-6">
          <div className="mx-auto max-w-7xl space-y-3">
            <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />
            <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-32 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-32 w-full animate-pulse rounded-xl bg-slate-200" />
              <div className="h-32 w-full animate-pulse rounded-xl bg-slate-200" />
            </div>
            <div className="h-80 w-full animate-pulse rounded-xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  // Estado de erro crítico na conexão
  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 shadow-xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Falha ao Conectar à API</h2>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">{error}</p>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <button
              onClick={() => refresh()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Tentar Novamente
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Configurar URL
            </button>
          </div>
        </div>
        <ApiSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          currentUrl={url}
          isRealApiMode={isRealApiMode}
          onSaveUrl={changeApiUrl}
          onSimulatePercent={setSimulatedUrnasPercent}
          onResetSimulation={reset}
        />
      </div>
    );
  }

  const isFinalizada = data ? data.total_urnas_apuradas >= 100 : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased">
      {/* 1. Header do Painel */}
      <ElectionHeader
        titulo={data?.eleicao || 'Apuração das Eleições'}
        cargo={data?.cargo || 'Presidente da República'}
        abrangencia={data?.abrangencia || 'Brasil'}
        dataHoraAtualizacao={data?.data_hora_atualizacao || new Date().toISOString()}
        isRefreshing={isRefreshing}
        onRefresh={refresh}
        isAutoRefreshActive={isAutoRefreshActive}
        onToggleAutoRefresh={() => setIsAutoRefreshActive(!isAutoRefreshActive)}
        onOpenApiSettings={() => setIsSettingsOpen(true)}
        isFinalizada={isFinalizada}
      />

      {/* 2. Barra de Progresso Global Grossa */}
      {data && (
        <UrnasProgressBar
          porcentagem={data.total_urnas_apuradas}
          secoesApuradas={data.secoes_apuradas}
          secoesTotal={data.secoes_total}
          situacao={data.situacao_totalizacao}
        />
      )}

      {/* 3. Conteúdo Principal (Mobile-First / Grid responsivo) */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        
        {/* Banner editorial de alerta de situação matemática */}
        {data && data.situacao_totalizacao === 'matematicamente_definido' && !isFinalizada && (
          <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-sm block">Definição Matemática da Disputa</strong>
              <p className="mt-0.5 leading-relaxed">
                Com {formatters.percent(data.total_urnas_apuradas)} das seções totalizadas, o cenário eleitoral
                indica a consolidação dos candidatos que avançam para a fase decisiva.
              </p>
            </div>
          </div>
        )}

        {/* Notificação sutil caso ocorra erro em segundo plano mantendo dados anteriores */}
        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-center justify-between">
            <span>{error} (Exibindo os dados da última totalização válida)</span>
            <button
              onClick={() => refresh()}
              className="text-xs font-semibold text-rose-900 underline hover:no-underline ml-2"
            >
              Reconectar
            </button>
          </div>
        )}

        {/* Grid de 2 Colunas no Desktop / Flex-col no Mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Coluna Principal (Cards de Candidatos) - 8 colunas no lg */}
          <div className="lg:col-span-8">
            {data && (
              <CandidateList
                candidates={data.candidatos}
                totalVotosValidos={data.votos_validos}
                urnasApuradasPct={data.total_urnas_apuradas}
                isTotalizacaoFinal={isFinalizada}
              />
            )}
          </div>

          {/* Coluna Lateral (Estatísticas e Visão Geral) - 4 colunas no lg */}
          <div className="lg:col-span-4">
            {data && (
              <ElectionStatsOverview data={data} />
            )}

            {/* Dica para o desenvolvedor: Como integrar com API Real */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-xs">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
                <Code2 className="h-4 w-4 text-blue-600" />
                <span>Integração de Produção</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Para plugar sua API REST real, edite <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800">src/services/electionApi.ts</code> ou clique no botão de engrenagem no cabeçalho para inserir sua URL ao vivo.
              </p>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800"
              >
                <span>Abrir painel de configuração e simulação</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </div>

        </div>
      </main>

      {/* 4. Rodapé Editorial Institucional */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-slate-800 font-sans">
              APURAÇÃO <span className="text-blue-600">ELEIÇÕES</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Sistema Editorial de Resultados</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Padrão REST API</span>
            <span aria-hidden="true">·</span>
            <span>Atualização contínua com ordenação em tempo real</span>
          </div>
        </div>
      </footer>

      {/* 5. Modal de Configuração e Simulação de Cenários da API */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUrl={url}
        isRealApiMode={isRealApiMode}
        onSaveUrl={changeApiUrl}
        onSimulatePercent={setSimulatedUrnasPercent}
        onResetSimulation={reset}
      />
    </div>
  );
}
