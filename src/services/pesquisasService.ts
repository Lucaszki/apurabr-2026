/**
 * @file pesquisasService.ts
 * @description Serviço dinâmico para carregamento, sincronização em tempo real e agregação
 * de pesquisas eleitorais do 2º Turno de 2026 diretamente a partir do repositório GitHub.
 */

import {
  PesquisaPresidente,
  PesquisaGovernador,
  TransferenciaVotoCandidato,
} from '../types/pesquisas';
import {
  PESQUISAS_PRESIDENTE_2T,
  PESQUISAS_GOVERNADOR_2T,
  CANDIDATOS_1T_TRANSFERENCIA,
  calcularMediaAgregada as calcularMediaAgregadaBase,
  getPesquisasOrdenadas as getPesquisasOrdenadasBase,
  getPesquisaMaisRecente as getPesquisaMaisRecenteBase,
  getPesquisasGovernadorOrdenadas as getPesquisasGovernadorOrdenadasBase,
} from '../data/pesquisas2026';

/** URL direta do feed no repositório GitHub (raw) */
export const GITHUB_RAW_FEED_URL =
  'https://raw.githubusercontent.com/Lucaszki/apurabr-2026/main/public/data/2026/pesquisas.json';

/** URL do feed local servido pela aplicação */
export const LOCAL_FEED_URL = '/data/2026/pesquisas.json';

export interface PesquisasPayload {
  presidente: PesquisaPresidente[];
  governador: PesquisaGovernador[];
  transferencias: TransferenciaVotoCandidato[];
  atualizadoEm: string;
  versao?: string;
  fonte: 'github_main' | 'feed_local' | 'base_local';
}

/**
 * Carrega as pesquisas em tempo real priorizando o repositório GitHub,
 * com fallback para o feed local e base consolidada.
 */
export async function carregarPesquisasEmTempoReal(): Promise<PesquisasPayload> {
  const cacheBuster = `?t=${Date.now()}`;

  // 1. Tenta buscar direto do repositório GitHub
  try {
    const resGithub = await fetch(`${GITHUB_RAW_FEED_URL}${cacheBuster}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (resGithub.ok) {
      const data = await resGithub.json();
      if (data && Array.isArray(data.presidente) && data.presidente.length > 0) {
        return {
          presidente: getPesquisasOrdenadasBase(data.presidente),
          governador: getPesquisasGovernadorOrdenadasBase(data.governador || PESQUISAS_GOVERNADOR_2T),
          transferencias: data.transferencias || CANDIDATOS_1T_TRANSFERENCIA,
          atualizadoEm: data.atualizadoEm || new Date().toISOString(),
          versao: data.versao || '2.0.0',
          fonte: 'github_main',
        };
      }
    }
  } catch (errGithub) {
    // Silencioso ou warning para tentar o feed local
  }

  // 2. Tenta o feed local do servidor web
  try {
    const resLocal = await fetch(`${LOCAL_FEED_URL}${cacheBuster}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (resLocal.ok) {
      const data = await resLocal.json();
      if (data && Array.isArray(data.presidente) && data.presidente.length > 0) {
        return {
          presidente: getPesquisasOrdenadasBase(data.presidente),
          governador: getPesquisasGovernadorOrdenadasBase(data.governador || PESQUISAS_GOVERNADOR_2T),
          transferencias: data.transferencias || CANDIDATOS_1T_TRANSFERENCIA,
          atualizadoEm: data.atualizadoEm || new Date().toISOString(),
          versao: data.versao || '2.0.0',
          fonte: 'feed_local',
        };
      }
    }
  } catch (errLocal) {
    // Fallback para a base bundled
  }

  // 3. Fallback seguro com a base estática do build
  return {
    presidente: getPesquisasOrdenadasBase(PESQUISAS_PRESIDENTE_2T),
    governador: getPesquisasGovernadorOrdenadasBase(PESQUISAS_GOVERNADOR_2T),
    transferencias: CANDIDATOS_1T_TRANSFERENCIA,
    atualizadoEm: new Date().toISOString(),
    versao: '1.0.0',
    fonte: 'base_local',
  };
}

// Re-exporta utilitários com suporte dinâmico
export const calcularMediaAgregada = calcularMediaAgregadaBase;
export const getPesquisasOrdenadas = getPesquisasOrdenadasBase;
export const getPesquisaMaisRecente = getPesquisaMaisRecenteBase;
export const getPesquisasGovernadorOrdenadas = getPesquisasGovernadorOrdenadasBase;
