/**
 * @file usePesquisasData.ts
 * @description Hook React para gerenciar o ciclo de vida, atualização em tempo real,
 * auto-refresh dinâmico e agregação ponderada das pesquisas do 2º Turno de 2026 via GitHub.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  PesquisaPresidente,
  PesquisaGovernador,
  TransferenciaVotoCandidato,
} from '../types/pesquisas';
import {
  carregarPesquisasEmTempoReal,
  calcularMediaAgregada,
  getPesquisasOrdenadas,
  getPesquisaMaisRecente,
  getPesquisasGovernadorOrdenadas,
} from '../services/pesquisasService';
import {
  PESQUISAS_PRESIDENTE_2T,
  PESQUISAS_GOVERNADOR_2T,
  CANDIDATOS_1T_TRANSFERENCIA,
} from '../data/pesquisas2026';

interface UsePesquisasOptions {
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export function usePesquisasData(options?: UsePesquisasOptions) {
  const [pesquisas, setPesquisas] = useState<PesquisaPresidente[]>(() =>
    getPesquisasOrdenadas(PESQUISAS_PRESIDENTE_2T)
  );
  const [pesquisasGov, setPesquisasGov] = useState<PesquisaGovernador[]>(() =>
    getPesquisasGovernadorOrdenadas(PESQUISAS_GOVERNADOR_2T)
  );
  const [transferencias, setTransferencias] = useState<TransferenciaVotoCandidato[]>(
    () => CANDIDATOS_1T_TRANSFERENCIA
  );

  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [tempoDecorridoSegundos, setTempoDecorridoSegundos] = useState<number>(0);
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(options?.autoRefresh ?? true);
  const [fonte, setFonte] = useState<'github_main' | 'feed_local' | 'base_local'>('github_main');

  const refreshIntervalMs = options?.refreshIntervalMs || 25000;
  const initialLoadDone = useRef(false);

  /**
   * Executa a busca em tempo real no feed do GitHub / backend
   */
  const carregarDados = useCallback(async (isManual: boolean = false) => {
    if (isManual) {
      setIsSyncing(true);
    }
    try {
      const payload = await carregarPesquisasEmTempoReal();
      setPesquisas(payload.presidente);
      setPesquisasGov(payload.governador);
      setTransferencias(payload.transferencias);
      setFonte(payload.fonte);
      setLastSyncTime(new Date());
      setTempoDecorridoSegundos(0);
    } catch (e) {
      console.error('Falha ao sincronizar pesquisas em tempo real:', e);
    } finally {
      setLoading(false);
      if (isManual) {
        setIsSyncing(false);
      }
    }
  }, []);

  // Carga inicial
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      carregarDados(false);
    }
  }, [carregarDados]);

  // Contador de segundos desde a última checagem
  useEffect(() => {
    const timer = setInterval(() => {
      setTempoDecorridoSegundos((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Intervalo de auto-refresh em tempo real (conecta periodicamente ao GitHub)
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      carregarDados(false);
    }, refreshIntervalMs);
    return () => clearInterval(interval);
  }, [isAutoRefresh, carregarDados, refreshIntervalMs]);

  /**
   * Sincronização manual acionada pelo usuário
   */
  const refresh = useCallback(() => {
    return carregarDados(true);
  }, [carregarDados]);

  // Dados calculados dinamicamente
  const pesquisasOrdenadas = useMemo(() => getPesquisasOrdenadas(pesquisas), [pesquisas]);
  const pesquisaMaisRecente = useMemo(() => getPesquisaMaisRecente(pesquisasOrdenadas), [pesquisasOrdenadas]);
  const mediaAgregada = useMemo(() => calcularMediaAgregada(pesquisasOrdenadas), [pesquisasOrdenadas]);

  return {
    pesquisas: pesquisasOrdenadas,
    pesquisasGov,
    transferencias,
    pesquisaMaisRecente,
    mediaAgregada,
    loading,
    isSyncing,
    lastSyncTime,
    tempoDecorridoSegundos,
    isAutoRefresh,
    setIsAutoRefresh,
    toggleAutoRefresh: () => setIsAutoRefresh((prev) => !prev),
    refresh,
    fonte,
  };
}
