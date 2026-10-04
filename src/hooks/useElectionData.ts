/**
 * @file useElectionData.ts
 * @description Hook React customizado para gerenciar a requisição, ciclo de vida,
 * atualização periódica e simulação dos dados da apuração eleitoral.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ElectionSummary } from '../types/election';
import { fetchElectionData, resetSimulation, DEFAULT_API_URL } from '../services/electionApi';

interface UseElectionDataOptions {
  initialUrl?: string;
  autoRefresh?: boolean;
  refreshIntervalMs?: number;
}

export function useElectionData(options?: UseElectionDataOptions) {
  const [url, setUrl] = useState<string>(options?.initialUrl || DEFAULT_API_URL);
  const [data, setData] = useState<ElectionSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState<boolean>(options?.autoRefresh ?? false);
  const [isRealApiMode, setIsRealApiMode] = useState<boolean>(false);

  // Armazena a contagem de atualizações manuais feitas na sessão
  const updateCountRef = useRef(0);

  /**
   * Executa a requisição dos dados.
   * Por padrão, incrementa os lotes de urnas simulando o avanço em tempo real.
   */
  const loadData = useCallback(
    async (isManualRefresh: boolean = false, forcePercent?: number) => {
      try {
        if (isManualRefresh) {
          setIsRefreshing(true);
        } else {
          setLoading(true);
        }
        setError(null);

        // Se for refresh manual ou auto-refresh, incrementa a simulação
        const shouldIncrement = (isManualRefresh || updateCountRef.current > 0) && forcePercent === undefined;
        
        const result = await fetchElectionData(url, {
          forceUrnasPercent: forcePercent,
          incrementStep: shouldIncrement,
          useRealFetchOnly: isRealApiMode,
        });

        setData(result);
        setLastFetchTime(new Date());
        updateCountRef.current += 1;
      } catch (err: any) {
        const errorMsg = err?.message || 'Falha ao buscar os resultados da apuração.';
        setError(errorMsg);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [url, isRealApiMode]
  );

  // Carga inicial
  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Intervalo de auto-atualização opcional (padrão 15s)
  useEffect(() => {
    if (!isAutoRefreshActive) return;

    const intervalTime = options?.refreshIntervalMs || 12000;
    const intervalId = setInterval(() => {
      loadData(true);
    }, intervalTime);

    return () => clearInterval(intervalId);
  }, [isAutoRefreshActive, loadData, options?.refreshIntervalMs]);

  /** Dispara a atualização manual dos resultados com feedback visual */
  const refresh = useCallback(() => {
    return loadData(true);
  }, [loadData]);

  /** Permite testar diferentes estágios da apuração (ex: 25%, 50%, 85%, 100%) */
  const setSimulatedUrnasPercent = useCallback(
    (percent: number) => {
      return loadData(true, percent);
    },
    [loadData]
  );

  /** Reinicia a simulação para o início da apuração */
  const reset = useCallback(
    (initialPercent: number = 65.40) => {
      resetSimulation(initialPercent);
      return loadData(true, initialPercent);
    },
    [loadData]
  );

  /** Altera a URL de consumo da API (para apontar para a API real do usuário) */
  const changeApiUrl = useCallback((newUrl: string, useRealMode: boolean = false) => {
    setUrl(newUrl);
    setIsRealApiMode(useRealMode);
  }, []);

  return {
    data,
    loading,
    isRefreshing,
    error,
    lastFetchTime,
    isAutoRefreshActive,
    setIsAutoRefreshActive,
    refresh,
    setSimulatedUrnasPercent,
    reset,
    url,
    changeApiUrl,
    isRealApiMode,
  };
}
