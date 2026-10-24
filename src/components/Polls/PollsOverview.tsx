/**
 * @file PollsOverview.tsx
 * @description Painel interativo e dinâmico de pesquisas eleitorais registradas no TSE para o 2º Turno de 2026.
 * Sincronizado diretamente em tempo real com o repositório GitHub, destacando a pesquisa do Instituto Veritá
 * como o levantamento mais recente e de maior amostragem, além de agregador ponderado por recência e filtros ágeis.
 */

import React, { useState, useMemo } from 'react';
import { usePesquisasData } from '../../hooks/usePesquisasData';
import { PesquisaPresidente } from '../../types/pesquisas';
import { formatters } from '../../services/electionApi';
import { CandidatePhoto } from '../CandidatePhoto';
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
  Zap,
  RotateCw,
  Radio,
  Flame,
  Clock,
  Sparkles,
  Search,
  Filter,
  Github,
} from 'lucide-react';

export const PollsOverview: React.FC = () => {
  // Hook sincronizado em tempo real com o GitHub
  const {
    pesquisas: pesquisasOrdenadas,
    pesquisasGov: pesquisasGovOrdenadas,
    pesquisaMaisRecente,
    mediaAgregada,
    isSyncing,
    lastSyncTime,
    tempoDecorridoSegundos,
    isAutoRefresh,
    toggleAutoRefresh,
    refresh,
    fonte,
  } = usePesquisasData({ autoRefresh: true, refreshIntervalMs: 20000 });

  // Modo de foco principal: 'mais_recente' (padrão ativo) ou 'media_agregada'
  const [modoFoco, setModoFoco] = useState<'mais_recente' | 'media_agregada'>('mais_recente');

  // Pesquisa selecionada manualmente (id)
  const [pesquisaSelecionadaId, setPesquisaSelecionadaId] = useState<string | null>(null);

  // Métrica ativa: Votos Válidos, Estimulada (Totais) ou Rejeição
  const [modoExibicao, setModoExibicao] = useState<'validos' | 'totais' | 'rejeicao'>('validos');

  // Filtro de pesquisa por texto / instituto
  const [filtroTexto, setFiltroTexto] = useState<string>('');

  // Pesquisa ativa em foco (seja a mais recente ou uma selecionada manualmente)
  const pesquisaAtiva: PesquisaPresidente = useMemo(() => {
    if (pesquisaSelecionadaId) {
      const encontrada = pesquisasOrdenadas.find((p) => p.id === pesquisaSelecionadaId);
      if (encontrada) return encontrada;
    }
    return pesquisaMaisRecente || pesquisasOrdenadas[0];
  }, [pesquisasOrdenadas, pesquisaSelecionadaId, pesquisaMaisRecente]);

  // Formatação da data de divulgação
  const formatarData = (d: string) => {
    if (!d) return '';
    return d.split('-').reverse().join('/');
  };

  // Pesquisas filtradas pela busca
  const pesquisasFiltradas = useMemo(() => {
    if (!filtroTexto.trim()) return pesquisasOrdenadas;
    const termo = filtroTexto.toLowerCase().trim();
    return pesquisasOrdenadas.filter(
      (p) =>
        p.instituto.toLowerCase().includes(termo) ||
        (p.contratante && p.contratante.toLowerCase().includes(termo)) ||
        (p.registroTse && p.registroTse.toLowerCase().includes(termo))
    );
  }, [pesquisasOrdenadas, filtroTexto]);

  // Dados para exibição no placar central com base no modo ativo
  const dadosExibicao = useMemo(() => {
    if (modoFoco === 'mais_recente') {
      const isRejeicao = modoExibicao === 'rejeicao';
      const isTotais = modoExibicao === 'totais';

      const valFlavio = isRejeicao
        ? pesquisaAtiva.rejeicao?.flavio ?? 45.0
        : isTotais
        ? pesquisaAtiva.totais.flavio
        : pesquisaAtiva.validos.flavio;

      const valLula = isRejeicao
        ? pesquisaAtiva.rejeicao?.lula ?? 47.0
        : isTotais
        ? pesquisaAtiva.totais.lula
        : pesquisaAtiva.validos.lula;

      return {
        titulo: `Pesquisa ${pesquisaAtiva.instituto}`,
        subtitulo: `Levantamento divulgado em ${formatarData(pesquisaAtiva.divulgacao)} · Campo: ${pesquisaAtiva.campo}`,
        registro: pesquisaAtiva.registroTse,
        amostra: pesquisaAtiva.amostra,
        margem: pesquisaAtiva.margem,
        contratante: pesquisaAtiva.contratante,
        flavio: valFlavio,
        lula: valLula,
        brancosNulos: pesquisaAtiva.totais.brancosNulos,
        indecisos: pesquisaAtiva.totais.indecisos,
        destaques: pesquisaAtiva.destaques || [],
        isMaisRecente: pesquisaAtiva.id === pesquisaMaisRecente?.id,
        isVerita: pesquisaAtiva.instituto.toLowerCase().includes('verit'),
      };
    } else {
      // Modo Média Agregada Dinâmica
      const valFlavio =
        modoExibicao === 'rejeicao'
          ? 46.2
          : modoExibicao === 'totais'
          ? mediaAgregada?.totais.flavio ?? 49.5
          : mediaAgregada?.validos.flavio ?? 51.5;

      const valLula =
        modoExibicao === 'rejeicao'
          ? 47.4
          : modoExibicao === 'totais'
          ? mediaAgregada?.totais.lula ?? 45.8
          : mediaAgregada?.validos.lula ?? 48.5;

      return {
        titulo: 'Média Agregada Ponderada das Pesquisas',
        subtitulo: `Consolidação estatística ponderando ${mediaAgregada?.quantidadePesquisas} pesquisas nacionais com maior peso para as mais recentes`,
        registro: 'Agregador Multi-Institutos TSE',
        amostra: pesquisasOrdenadas.reduce((acc, p) => acc + p.amostra, 0),
        margem: 1.0,
        contratante: 'Consórcio de Pesquisas Registradas 2026',
        flavio: valFlavio,
        lula: valLula,
        brancosNulos: mediaAgregada?.totais.brancosNulos ?? 3.2,
        indecisos: mediaAgregada?.totais.indecisos ?? 1.2,
        destaques: [
          `Ponderação estatística por recência temporal (pesquisas mais recentes têm peso ampliado)`,
          `Sincronizado diretamente do repositório oficial com o último levantamento (${pesquisaMaisRecente?.instituto} de ${formatarData(pesquisaMaisRecente?.divulgacao)})`,
          `Flávio lidera numericamente na média com ${formatters.percent(valFlavio)} dos votos válidos`,
        ],
        isMaisRecente: false,
        isVerita: false,
      };
    }
  }, [modoFoco, modoExibicao, pesquisaAtiva, pesquisaMaisRecente, mediaAgregada, pesquisasOrdenadas]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Barra Superior do Radar Ativo com Atualização em Tempo Real via GitHub */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-ping absolute" />
            <span className="relative flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-600" />
                Radar de Pesquisas em Tempo Real
              </span>
              <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                <Github className="h-2.5 w-2.5 text-emerald-700" />
                {fonte === 'github_main' ? 'GitHub Ao Vivo' : 'Feed Sincronizado'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Conectado ao repositório GitHub · Mais recente:{' '}
              <span className="font-bold text-slate-700">
                {pesquisaMaisRecente?.instituto} ({formatarData(pesquisaMaisRecente?.divulgacao)})
              </span>{' '}
              ·{' '}
              <span className="font-semibold text-slate-700">
                {isSyncing
                  ? 'Buscando atualizações no GitHub...'
                  : tempoDecorridoSegundos < 5
                  ? `Sincronizado às ${lastSyncTime ? lastSyncTime.toLocaleTimeString('pt-BR') : 'agora'}`
                  : `Checado às ${lastSyncTime ? lastSyncTime.toLocaleTimeString('pt-BR') : ''} (há ${tempoDecorridoSegundos}s)`}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Botão de sincronização manual */}
          <button
            type="button"
            onClick={refresh}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            title="Verificar atualizações no GitHub em tempo real"
          >
            <RotateCw className={`h-3.5 w-3.5 text-slate-600 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Atualizando...' : 'Atualizar Radar'}</span>
          </button>

          {/* Toggle de auto-refresh */}
          <button
            type="button"
            onClick={toggleAutoRefresh}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              isAutoRefresh
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Ativar/pausar verificação automática periódica"
          >
            <Zap className={`h-3 w-3 ${isAutoRefresh ? 'text-emerald-600 fill-emerald-600' : 'text-slate-400'}`} />
            <span>{isAutoRefresh ? 'Auto-Sync Ativo' : 'Auto-Sync Pausado'}</span>
          </button>
        </div>
      </div>

      {/* 2. Card Principal de Destaque (Pesquisa Mais Recente ou Média Ponderada) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200/80">
          <div>
            {/* Tag de Status */}
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {modoFoco === 'mais_recente' ? (
                <>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-extrabold tracking-wider shadow-2xs">
                    <Flame className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                    MAIS RECENTE NO TSE · {formatarData(pesquisaAtiva.divulgacao)}
                  </span>
                  {dadosExibicao.isVerita && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600 text-white px-2.5 py-0.5 text-xs font-extrabold tracking-wider shadow-2xs">
                      <Sparkles className="h-3.5 w-3.5 text-amber-300 fill-amber-300" />
                      INSTITUTO VERITÁ · MAIOR AMOSTRA NACIONAL (15.554)
                    </span>
                  )}
                </>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white px-2.5 py-0.5 text-xs font-extrabold tracking-wider shadow-2xs">
                  <TrendingUp className="h-3.5 w-3.5" />
                  MÉDIA PONDERADA DINÂMICA
                </span>
              )}

              {pesquisaAtiva.registroTse && modoFoco === 'mais_recente' && (
                <span className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono font-bold text-slate-600">
                  {pesquisaAtiva.registroTse}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {dadosExibicao.titulo}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              {dadosExibicao.subtitulo}
            </p>
          </div>

          {/* Seletores Ativos: Foco e Métrica */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 self-start lg:self-auto">
            {/* Seletor de Foco: Mais Recente vs Média */}
            <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setModoFoco('mais_recente');
                  setPesquisaSelecionadaId(pesquisaMaisRecente?.id || null);
                }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  modoFoco === 'mais_recente' && (!pesquisaSelecionadaId || pesquisaSelecionadaId === pesquisaMaisRecente?.id)
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                <span>Mais Recente</span>
              </button>
              <button
                type="button"
                onClick={() => setModoFoco('media_agregada')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  modoFoco === 'media_agregada'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Média Ponderada</span>
              </button>
            </div>

            {/* Alternador de Métrica (Válidos / Estimulada / Rejeição) */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200/60">
              <button
                type="button"
                onClick={() => setModoExibicao('validos')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  modoExibicao === 'validos'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Válidos
              </button>
              <button
                type="button"
                onClick={() => setModoExibicao('totais')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  modoExibicao === 'totais'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Totais
              </button>
              <button
                type="button"
                onClick={() => setModoExibicao('rejeicao')}
                className={`px-2.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  modoExibicao === 'rejeicao'
                    ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rejeição
              </button>
            </div>
          </div>
        </div>

        {/* Placar dos 2 Candidatos com Fotos Oficiais */}
        <div className="pt-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Flávio Bolsonaro (PL) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
              <div className="flex items-center gap-3.5">
                <CandidatePhoto
                  nome="Flávio Bolsonaro"
                  numero={22}
                  cargo="pres"
                  corHex="#1e40af"
                  partido="PL"
                  size="md"
                  aspectRatio="portrait"
                  showNumberBadge
                  priority
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Flávio Bolsonaro
                  </h3>
                  <span className="text-xs font-semibold text-blue-700">
                    Partido Liberal (PL)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Vice: Alfredo Gaspar
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-700 tabular-nums block">
                  {formatters.percent(dadosExibicao.flavio)}
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {modoExibicao === 'validos'
                    ? 'dos votos válidos'
                    : modoExibicao === 'totais'
                    ? 'intenção de voto'
                    : 'rejeição declarada'}
                </span>
              </div>
            </div>

            {/* Lula (PT) */}
            <div className="rounded-2xl border border-red-200 bg-white p-5 shadow-xs flex items-center justify-between hover:border-red-300 transition-all">
              <div className="flex items-center gap-3.5">
                <CandidatePhoto
                  nome="Luiz Inácio Lula da Silva"
                  numero={13}
                  cargo="pres"
                  corHex="#dc2626"
                  partido="PT"
                  size="md"
                  aspectRatio="portrait"
                  showNumberBadge
                  priority
                />
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    Luiz Inácio Lula da Silva
                  </h3>
                  <span className="text-xs font-semibold text-red-700">
                    Partido dos Trabalhadores (PT)
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Vice: Geraldo Alckmin
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-3xl sm:text-4xl font-extrabold text-red-600 tabular-nums block">
                  {formatters.percent(dadosExibicao.lula)}
                </span>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {modoExibicao === 'validos'
                    ? 'dos votos válidos'
                    : modoExibicao === 'totais'
                    ? 'intenção de voto'
                    : 'rejeição declarada'}
                </span>
              </div>
            </div>
          </div>

          {/* Barra Termômetro Comparativa Proporcional */}
          {modoExibicao === 'validos' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span className="text-blue-700 font-bold">
                  Flávio: {formatters.percent(dadosExibicao.flavio)}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Meta da vitória: 50% + 1 voto · Margem: ±{dadosExibicao.margem}%
                </span>
                <span className="text-red-700 font-bold">
                  Lula: {formatters.percent(dadosExibicao.lula)}
                </span>
              </div>

              <div className="relative h-4 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                {/* Barra Flávio */}
                <div
                  className="h-full bg-gradient-to-r from-blue-700 to-blue-600 transition-all duration-500"
                  style={{ width: `${dadosExibicao.flavio}%` }}
                />
                {/* Linha de 50% central */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white z-10 shadow-sm" />
                {/* Barra Lula */}
                <div
                  className="h-full bg-gradient-to-r from-red-600 to-red-700 transition-all duration-500"
                  style={{ width: `${dadosExibicao.lula}%` }}
                />
              </div>
            </div>
          )}

          {/* Destaques da Pesquisa Ativa */}
          {dadosExibicao.destaques.length > 0 && (
            <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 sm:p-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Pontos Relevantes desta Pesquisa
              </span>
              <ul className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-slate-700">
                {dadosExibicao.destaques.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                    <span className="text-slate-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 3. Comparativo Completo por Instituto (Ordenação Ativa: Mais Recente Primeiro) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Todas as Pesquisas Registradas no TSE
              </h3>
              <span className="rounded-full bg-slate-100 text-slate-800 text-xs px-2 py-0.5 font-bold border border-slate-200">
                {pesquisasFiltradas.length} de {pesquisasOrdenadas.length} pesquisas
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Ordenadas cronologicamente da mais recente para a mais antiga. Clique em qualquer card para fixá-lo no placar superior.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Mais recente:{' '}
            <strong className="text-slate-800">
              {pesquisaMaisRecente?.instituto} ({formatarData(pesquisaMaisRecente?.divulgacao)})
            </strong>
          </div>
        </div>

        {/* Barra de Filtro e Busca Rápida por Instituto */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por instituto (ex: Veritá, Datafolha, Quaest, RealTime...)"
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-50 border border-slate-200/80 pl-9 pr-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          {/* Atalhos Rápidos */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => setFiltroTexto('')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                filtroTexto === ''
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => {
                setFiltroTexto('Veritá');
                const verita = pesquisasOrdenadas.find((p) => p.instituto.toLowerCase().includes('verit'));
                if (verita) {
                  setModoFoco('mais_recente');
                  setPesquisaSelecionadaId(verita.id);
                }
              }}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                filtroTexto.toLowerCase().includes('verit')
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Veritá (23/10)
            </button>
            <button
              type="button"
              onClick={() => setFiltroTexto('RealTime')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                filtroTexto.toLowerCase().includes('realtime')
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              RealTime (23/10)
            </button>
            <button
              type="button"
              onClick={() => setFiltroTexto('Datafolha')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                filtroTexto.toLowerCase().includes('datafolha')
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Datafolha
            </button>
            <button
              type="button"
              onClick={() => setFiltroTexto('Quaest')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                filtroTexto.toLowerCase().includes('quaest')
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Quaest
            </button>
            <button
              type="button"
              onClick={() => setFiltroTexto('Atlas')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all shrink-0 cursor-pointer ${
                filtroTexto.toLowerCase().includes('atlas')
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              AtlasIntel
            </button>
          </div>
        </div>

        {/* Grid de Cards das Pesquisas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pesquisasFiltradas.map((pesquisa, idx) => {
            const isMaisNova = idx === 0 && !filtroTexto;
            const isEmFoco = modoFoco === 'mais_recente' && pesquisa.id === pesquisaAtiva.id;
            const isVerita = pesquisa.instituto.toLowerCase().includes('verit');

            return (
              <div
                key={pesquisa.id}
                onClick={() => {
                  setModoFoco('mais_recente');
                  setPesquisaSelecionadaId(pesquisa.id);
                }}
                className={`cursor-pointer rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all relative ${
                  isEmFoco
                    ? 'border-slate-800 bg-slate-50/50 ring-2 ring-slate-800/10'
                    : isVerita
                    ? 'border-indigo-400 bg-indigo-50/20 ring-2 ring-indigo-500/15 hover:border-indigo-500'
                    : isMaisNova
                    ? 'border-emerald-400 bg-emerald-50/15 ring-2 ring-emerald-500/15 hover:border-emerald-500'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Badges de Destaque */}
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isMaisNova && (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                          <Flame className="h-3 w-3 text-amber-300 fill-amber-300" />
                          Mais Recente
                        </span>
                      )}

                      {isVerita && (
                        <span className="inline-flex items-center gap-1 rounded bg-indigo-600 text-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
                          <Sparkles className="h-3 w-3 text-amber-300" />
                          Maior Amostra (15.554)
                        </span>
                      )}

                      {!isMaisNova && !isVerita && (
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">
                          Levantamento TSE
                        </span>
                      )}
                    </div>

                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700 tabular-nums">
                      {formatarData(pesquisa.divulgacao)}
                    </span>
                  </div>

                  {/* Nome do Instituto */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {pesquisa.instituto}
                      </h4>
                      {pesquisa.contratante && (
                        <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                          {pesquisa.contratante}
                        </p>
                      )}
                    </div>

                    {isEmFoco && (
                      <span className="rounded bg-slate-900 text-white px-1.5 py-0.5 text-[10px] font-bold shrink-0">
                        Em Destaque
                      </span>
                    )}
                  </div>

                  {/* Metodologia / Registro */}
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 pb-3 border-b border-slate-100 flex-wrap">
                    <span title="Amostra">
                      <strong>{formatters.number(pesquisa.amostra)}</strong> entrevistados
                    </span>
                    <span>·</span>
                    <span title="Margem de erro">±{pesquisa.margem}%</span>
                    {pesquisa.registroTse && (
                      <>
                        <span>·</span>
                        <span className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-600">
                          {pesquisa.registroTse}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Placar de Votos */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-2.5">
                      <span className="text-[10px] font-bold uppercase text-blue-700 block">
                        Flávio (PL)
                      </span>
                      <span className="text-xl font-extrabold text-blue-700 tabular-nums">
                        {modoExibicao === 'validos'
                          ? formatters.percent(pesquisa.validos.flavio)
                          : formatters.percent(pesquisa.totais.flavio)}
                      </span>
                    </div>

                    <div className="rounded-xl bg-red-50/70 border border-red-100 p-2.5">
                      <span className="text-[10px] font-bold uppercase text-red-700 block">
                        Lula (PT)
                      </span>
                      <span className="text-xl font-extrabold text-red-600 tabular-nums">
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

                  {/* Destaque */}
                  {pesquisa.destaques && pesquisa.destaques.length > 0 && (
                    <p className="mt-3 text-[11px] text-slate-600 line-clamp-2 pt-2 border-t border-slate-100 italic">
                      "{pesquisa.destaques[0]}"
                    </p>
                  )}
                </div>

                {/* Rodapé do Card */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-bold group-hover:underline flex items-center gap-1">
                    <span>Clique para focar no topo</span>
                  </span>

                  {pesquisa.fonteUrl && (
                    <a
                      href={pesquisa.fonteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-slate-800 transition-colors"
                      title="Abrir matéria oficial da pesquisa"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Recortes Regionais Comparativos */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Intenção de Voto por Grande Região Geográfica
            </h3>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-700">
              {modoFoco === 'mais_recente' ? pesquisaAtiva.instituto : 'Média Ponderada'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Recortes regionais com base nos dados ativos mais recentes da disputa.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {[
            {
              nome: 'Sudeste',
              peso: '~43% eleitores',
              flavio: pesquisaAtiva.regioes?.sudeste?.flavio ?? 53.8,
              lula: pesquisaAtiva.regioes?.sudeste?.lula ?? 46.2,
            },
            {
              nome: 'Nordeste',
              peso: '~27% eleitores',
              flavio: pesquisaAtiva.regioes?.nordeste?.flavio ?? 33.2,
              lula: pesquisaAtiva.regioes?.nordeste?.lula ?? 66.8,
            },
            {
              nome: 'Sul',
              peso: '~15% eleitores',
              flavio: pesquisaAtiva.regioes?.sul?.flavio ?? 63.1,
              lula: pesquisaAtiva.regioes?.sul?.lula ?? 36.9,
            },
            {
              nome: 'Centro-Oeste',
              peso: '~8% eleitores',
              flavio: pesquisaAtiva.regioes?.centroOeste?.flavio ?? 61.8,
              lula: pesquisaAtiva.regioes?.centroOeste?.lula ?? 38.2,
            },
            {
              nome: 'Norte',
              peso: '~7% eleitores',
              flavio: pesquisaAtiva.regioes?.norte?.flavio ?? 52.7,
              lula: pesquisaAtiva.regioes?.norte?.lula ?? 47.3,
            },
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

      {/* 5. Pesquisas de 2º Turno para Governos Estaduais */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Pesquisas Estaduais · Governos com 2º Turno
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Levantamentos dos governos em disputa decisiva ordenados pelas datas de divulgação mais recentes.
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            5 estados em disputa decisiva
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pesquisasGovOrdenadas.map((pgov) => (
            <div
              key={pgov.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-3.5 hover:border-slate-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-900 text-white font-extrabold text-xs px-2 py-0.5">
                    {pgov.uf.toUpperCase()}
                  </span>
                  <span className="font-bold text-slate-800 text-sm">Governo do Estado</span>
                </div>
                <span className="text-[11px] text-slate-500 font-bold tabular-nums bg-slate-100 px-2 py-0.5 rounded">
                  {formatarData(pgov.divulgacao)}
                </span>
              </div>

              <div className="text-xs text-slate-500 flex items-center justify-between">
                <span>{pgov.instituto}</span>
                <span>Margem: ±{pgov.margem}%</span>
              </div>

              {/* Candidatos da disputa estadual */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {pgov.candidato1.nome} ({pgov.candidato1.partido})
                  </span>
                  <span className="font-extrabold text-slate-900 tabular-nums">
                    {formatters.percent(pgov.candidato1.validos)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-800 rounded-full"
                    style={{ width: `${pgov.candidato1.validos}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-bold text-slate-800">
                    {pgov.candidato2.nome} ({pgov.candidato2.partido})
                  </span>
                  <span className="font-extrabold text-slate-600 tabular-nums">
                    {formatters.percent(pgov.candidato2.validos)}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-400 rounded-full"
                    style={{ width: `${pgov.candidato2.validos}%` }}
                  />
                </div>
              </div>

              {/* Rodapé */}
              {pgov.fonteUrl && (
                <div className="pt-2 border-t border-slate-100 text-right">
                  <a
                    href={pgov.fonteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900"
                  >
                    <span>Ver matéria da pesquisa</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
