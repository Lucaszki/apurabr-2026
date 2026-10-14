/**
 * @file electionDatasetService.ts
 * @description Serviço de carregamento e consultas analíticas para o dataset oficial das Eleições 2026.
 * Gerencia cache em memória, agregações por estado/região/município e busca global.
 */

import { ResumoNacionalBrasil, UfDataset, MunicipioData, IndiceMunicipioItem, CandidatoResumo } from '../types/dataset';

// Mapa amplo de cores das legendas partidárias brasileiras
export const CORES_PARTIDOS_MAP: Record<string, string> = {
  PT: '#dc2626',
  PL: '#1e40af',
  PSD: '#059669',
  PSB: '#f59e0b',
  REPUBLICANOS: '#1e3a8a',
  PP: '#0284c7',
  UNIÃO: '#0284c7',
  MDB: '#047857',
  PSDB: '#2563eb',
  NOVO: '#ea580c',
  PDT: '#e11d48',
  PODE: '#0284c7',
  PSOL: '#be123c',
  UP: '#be123c',
  AVANTE: '#d97706',
  MISSÃO: '#2563eb',
  PRD: '#475569',
  SOLIDARIEDADE: '#f97316',
  CIDADANIA: '#f97316',
  PSTU: '#b91c1c',
  PCB: '#991b1b',
  PCO: '#7f1d1d',
  DC: '#0891b2',
  PRTB: '#15803d',
  MOBILIZA: '#ca8a04',
  AGIR: '#06b6d4',
  DEMOCRATA: '#4f46e5',
  PV: '#16a34a',
  PCDOB: '#dc2626',
  REDE: '#0d9488',
};

// Mapeamento de cores por número eleitoral (2 dígitos ou prefixo do senador)
export const CORES_POR_NUMERO: Record<number, string> = {
  10: '#1e3a8a', // Republicanos
  11: '#0284c7', // PP
  12: '#e11d48', // PDT
  13: '#dc2626', // PT
  14: '#2563eb', // Missão
  15: '#047857', // MDB
  16: '#b91c1c', // PSTU
  18: '#0d9488', // Rede
  20: '#0284c7', // Pode
  21: '#991b1b', // PCB
  22: '#1e40af', // PL
  23: '#f97316', // Cidadania
  25: '#475569', // PRD
  27: '#0891b2', // DC
  28: '#15803d', // PRTB
  29: '#7f1d1d', // PCO
  30: '#ea580c', // Novo
  33: '#ca8a04', // Mobiliza
  35: '#4f46e5', // Democrata
  36: '#06b6d4', // Agir
  40: '#f59e0b', // PSB
  43: '#16a34a', // PV
  44: '#0284c7', // União
  45: '#2563eb', // PSDB
  50: '#be123c', // PSOL
  55: '#059669', // PSD
  65: '#dc2626', // PCdoB
  70: '#d97706', // Avante
  77: '#f97316', // Solidariedade
  80: '#be123c', // UP
};

/**
 * Retorna a cor visual oficial do candidato com base no seu partido ou número
 */
export function getCorCandidato(numero: number, sigla?: string): string {
  if (sigla) {
    const s = sigla.toUpperCase().trim();
    if (CORES_PARTIDOS_MAP[s]) return CORES_PARTIDOS_MAP[s];
  }
  const num2Dig = numero > 99 ? Math.floor(numero / 10) : numero;
  if (CORES_POR_NUMERO[num2Dig]) return CORES_POR_NUMERO[num2Dig];
  if (CORES_POR_NUMERO[numero]) return CORES_POR_NUMERO[numero];
  return '#64748b';
}

// Cores legadas para compatibilidade
export const CORES_PARTIDOS: Record<number, { cor: string; bgSoft: string; textDark: string; nome: string; sigla: string }> = {
  22: { cor: '#1e40af', bgSoft: '#dbeafe', textDark: '#1e3a8a', nome: 'PL', sigla: 'PL' },
  13: { cor: '#dc2626', bgSoft: '#fee2e2', textDark: '#991b1b', nome: 'PT', sigla: 'PT' },
  70: { cor: '#d97706', bgSoft: '#fef3c7', textDark: '#92400e', nome: 'AVANTE', sigla: 'AVANTE' },
  14: { cor: '#2563eb', bgSoft: '#eff6ff', textDark: '#1d4ed8', nome: 'MISSÃO', sigla: 'MISSÃO' },
  55: { cor: '#059669', bgSoft: '#d1fae5', textDark: '#065f46', nome: 'PSD', sigla: 'PSD' },
  30: { cor: '#ea580c', bgSoft: '#ffedd5', textDark: '#9a3412', nome: 'NOVO', sigla: 'NOVO' },
  80: { cor: '#be123c', bgSoft: '#ffe4e6', textDark: '#881337', nome: 'UP', sigla: 'UP' },
  16: { cor: '#b91c1c', bgSoft: '#fee2e2', textDark: '#7f1d1d', nome: 'PSTU', sigla: 'PSTU' },
  27: { cor: '#0891b2', bgSoft: '#cffafe', textDark: '#155e75', nome: 'DC', sigla: 'DC' },
  21: { cor: '#991b1b', bgSoft: '#fee2e2', textDark: '#7f1d1d', nome: 'PCB', sigla: 'PCB' },
  35: { cor: '#4f46e5', bgSoft: '#e0e7ff', textDark: '#3730a3', nome: 'DEMOCRATA', sigla: 'DEMOCRATA' },
  29: { cor: '#7f1d1d', bgSoft: '#fee2e2', textDark: '#450a0a', nome: 'PCO', sigla: 'PCO' },
  10: { cor: '#1e3a8a', bgSoft: '#dbeafe', textDark: '#1e3a8a', nome: 'REPUBLICANOS', sigla: 'REPUBLICANOS' },
  11: { cor: '#0284c7', bgSoft: '#e0f2fe', textDark: '#075985', nome: 'PP', sigla: 'PP' },
  15: { cor: '#047857', bgSoft: '#d1fae5', textDark: '#064e3b', nome: 'MDB', sigla: 'MDB' },
  40: { cor: '#f59e0b', bgSoft: '#fef3c7', textDark: '#92400e', nome: 'PSB', sigla: 'PSB' },
  44: { cor: '#0284c7', bgSoft: '#e0f2fe', textDark: '#0369a1', nome: 'UNIÃO', sigla: 'UNIÃO' },
  45: { cor: '#2563eb', bgSoft: '#dbeafe', textDark: '#1d4ed8', nome: 'PSDB', sigla: 'PSDB' },
  50: { cor: '#be123c', bgSoft: '#ffe4e6', textDark: '#881337', nome: 'PSOL', sigla: 'PSOL' },
};

export const NOMES_UFS: Record<string, string> = {
  ac: 'Acre', al: 'Alagoas', am: 'Amazonas', ap: 'Amapá', ba: 'Bahia', ce: 'Ceará', df: 'Distrito Federal',
  es: 'Espírito Santo', go: 'Goiás', ma: 'Maranhão', mg: 'Minas Gerais', ms: 'Mato Grosso do Sul',
  mt: 'Mato Grosso', pa: 'Pará', pb: 'Paraíba', pe: 'Pernambuco', pi: 'Piauí', pr: 'Paraná',
  rj: 'Rio de Janeiro', rn: 'Rio Grande do Norte', ro: 'Rondônia', rr: 'Roraima', rs: 'Rio Grande do Sul',
  sc: 'Santa Catarina', se: 'Sergipe', sp: 'São Paulo', to: 'Tocantins', zz: 'Exterior',
};

export const CODIGO_UF_IBGE: Record<string, number> = {
  ro: 11, ac: 12, am: 13, rr: 14, pa: 15, ap: 16, to: 17, ma: 21, pi: 22, ce: 23, rn: 24,
  pb: 25, pe: 26, al: 27, se: 28, ba: 29, mg: 31, es: 32, rj: 33, sp: 35, pr: 41, sc: 42,
  rs: 43, ms: 50, mt: 51, go: 52, df: 53,
};

export const CODIGO_IBGE_UF: Record<number, string> = Object.fromEntries(
  Object.entries(CODIGO_UF_IBGE).map(([sigla, cod]) => [cod, sigla])
);

// Cache em memória
const cacheNacional: Record<number, ResumoNacionalBrasil> = {};
const cacheUf: Record<string, UfDataset> = {};
let cacheIndiceMunicipios: IndiceMunicipioItem[] | null = null;
const cacheGeo: Record<string, any> = {};

/**
 * Carrega o resumo nacional oficial para o turno especificado
 */
export async function carregarResumoNacional(turno: number = 1): Promise<ResumoNacionalBrasil> {
  if (cacheNacional[turno]) return cacheNacional[turno];
  const res = await fetch(`/data/2026/t${turno}/br.json`);
  if (!res.ok) throw new Error(`Falha ao carregar dados nacionais (t${turno}): HTTP ${res.status}`);
  const data = await res.json();
  cacheNacional[turno] = data;
  return data;
}

/**
 * Carrega os dados detalhados por município de um estado
 */
export async function carregarUfData(uf: string, turno: number = 1): Promise<UfDataset> {
  const chave = `${uf.toLowerCase()}_t${turno}`;
  if (cacheUf[chave]) return cacheUf[chave];
  const res = await fetch(`/data/2026/t${turno}/uf/${uf.toLowerCase()}.json`);
  if (!res.ok) throw new Error(`Falha ao carregar dados do estado ${uf.toUpperCase()}: HTTP ${res.status}`);
  const data = await res.json();
  cacheUf[chave] = data;
  return data;
}

/**
 * Carrega a malha GeoJSON do Brasil (UFs)
 */
export async function carregarGeoBrasil(): Promise<any> {
  if (cacheGeo['br']) return cacheGeo['br'];
  const res = await fetch('/geo/br-uf.json');
  if (!res.ok) throw new Error(`Falha ao carregar malha do Brasil: HTTP ${res.status}`);
  const data = await res.json();
  cacheGeo['br'] = data;
  return data;
}

/**
 * Carrega a malha GeoJSON de um estado (por municípios ou mesorregiões)
 */
export async function carregarGeoUf(uf: string, tipo: 'mun' | 'meso' = 'mun'): Promise<any> {
  const chave = `${uf.toLowerCase()}_${tipo}`;
  if (cacheGeo[chave]) return cacheGeo[chave];
  const res = await fetch(`/geo/uf/${uf.toLowerCase()}-${tipo}.json`);
  if (!res.ok) throw new Error(`Falha ao carregar malha de ${uf.toUpperCase()} (${tipo}): HTTP ${res.status}`);
  const data = await res.json();
  cacheGeo[chave] = data;
  return data;
}

/**
 * Carrega o índice de busca rápida de todos os municípios
 */
export async function carregarIndiceMunicipios(): Promise<IndiceMunicipioItem[]> {
  if (cacheIndiceMunicipios) return cacheIndiceMunicipios;
  const res = await fetch('/data/2026/municipios.json');
  if (!res.ok) throw new Error(`Falha ao carregar índice de municípios: HTTP ${res.status}`);
  const data = await res.json();
  cacheIndiceMunicipios = data;
  return data;
}

/**
 * Retorna os candidatos oficiais para o cargo e estado especificados.
 * - 'pres': Retorna os candidatos da presidência da República.
 * - 'gov': Retorna os candidatos ao governo do estado especificado (UF).
 * - 'sen': Retorna os candidatos ao senado do estado especificado (UF).
 */
export function getCandidatosDoCargo(
  resumo: ResumoNacionalBrasil | null,
  cargo: 'pres' | 'gov' | 'sen' = 'pres',
  uf?: string | null
): CandidatoResumo[] {
  if (!resumo) return [];
  if (cargo === 'pres') {
    return resumo.pres?.cands || [];
  }
  const ufLower = (uf || '').toLowerCase();
  if (cargo === 'gov') {
    if (ufLower && resumo.gov?.[ufLower]?.cands) {
      return resumo.gov[ufLower].cands;
    }
    return [];
  }
  if (cargo === 'sen') {
    if (ufLower && resumo.sen?.[ufLower]?.cands) {
      return resumo.sen[ufLower].cands;
    }
    return [];
  }
  return [];
}

/**
 * Retorna os dados do vencedor e estatísticas da UF para o cargo solicitado
 */
export function getVencedorUf(
  resumo: ResumoNacionalBrasil,
  uf: string,
  cargo: 'pres' | 'gov' | 'sen' = 'pres'
) {
  const ufLower = uf.toLowerCase();

  // 1. CARGO PRESIDENTE
  if (cargo === 'pres') {
    const ufInfo = resumo.pres.ufs[ufLower];
    if (!ufInfo) return null;

    const cands = resumo.pres.cands;
    const votos = ufInfo.v;
    const totalValidos = ufInfo.tot.vv;

    let maxVotos = -1;
    let vencedorIdx = 0;
    cands.forEach((c, idx) => {
      const v = votos[idx] || 0;
      if (v > maxVotos) {
        maxVotos = v;
        vencedorIdx = idx;
      }
    });

    const vencedor = cands[vencedorIdx];
    const segundo = cands[vencedorIdx === 0 ? 1 : 0];
    const pctVencedor = totalValidos > 0 ? (maxVotos / totalValidos) * 100 : 0;
    const pctSegundo = totalValidos > 0 ? ((votos[vencedorIdx === 0 ? 1 : 0] || 0) / totalValidos) * 100 : 0;
    const margem = pctVencedor - pctSegundo;

    return {
      uf: ufLower,
      cargo: 'pres' as const,
      nome: NOMES_UFS[ufLower] || uf.toUpperCase(),
      vencedor,
      votosVencedor: maxVotos,
      pctVencedor,
      segundo,
      pctSegundo,
      margem,
      totais: ufInfo.tot,
      secoesTotalizadasPct: ufInfo.tot.pst,
      municipiosCount: ufInfo.mun || 0,
      candidatos: cands.map((c, idx) => ({
        ...c,
        votosUf: votos[idx] || 0,
        pctUf: totalValidos > 0 ? ((votos[idx] || 0) / totalValidos) * 100 : 0,
      })),
    };
  }

  // 2. CARGO GOVERNADOR
  if (cargo === 'gov') {
    const govInfo = resumo.gov?.[ufLower];
    if (!govInfo || !govInfo.cands?.length) return null;

    const cands = [...govInfo.cands].sort((a, b) => b.v - a.v);
    const vencedor = cands[0];
    const segundo = cands[1] || null;
    const totalValidos = govInfo.tot.vv;
    const pctVencedor = totalValidos > 0 ? (vencedor.v / totalValidos) * 100 : 0;
    const pctSegundo = segundo && totalValidos > 0 ? (segundo.v / totalValidos) * 100 : 0;
    const margem = pctVencedor - pctSegundo;

    return {
      uf: ufLower,
      cargo: 'gov' as const,
      nome: NOMES_UFS[ufLower] || uf.toUpperCase(),
      vencedor,
      votosVencedor: vencedor.v,
      pctVencedor,
      segundo,
      pctSegundo,
      margem,
      totais: govInfo.tot,
      secoesTotalizadasPct: govInfo.tot.pst,
      municipiosCount: resumo.pres.ufs[ufLower]?.mun || 0,
      candidatos: cands.map((c) => ({
        ...c,
        votosUf: c.v,
        pctUf: c.p,
      })),
    };
  }

  // 3. CARGO SENADOR
  if (cargo === 'sen') {
    const senInfo = resumo.sen?.[ufLower];
    if (!senInfo || !senInfo.cands?.length) return null;

    const cands = [...senInfo.cands].sort((a, b) => b.v - a.v);
    const vencedor = cands[0];
    const segundo = cands[1] || null;
    const totalValidos = senInfo.tot.vv;
    const pctVencedor = totalValidos > 0 ? (vencedor.v / totalValidos) * 100 : 0;
    const pctSegundo = segundo && totalValidos > 0 ? (segundo.v / totalValidos) * 100 : 0;
    const margem = pctVencedor - pctSegundo;

    return {
      uf: ufLower,
      cargo: 'sen' as const,
      nome: NOMES_UFS[ufLower] || uf.toUpperCase(),
      vencedor,
      votosVencedor: vencedor.v,
      pctVencedor,
      segundo,
      pctSegundo,
      margem,
      totais: senInfo.tot,
      secoesTotalizadasPct: senInfo.tot.pst,
      municipiosCount: resumo.pres.ufs[ufLower]?.mun || 0,
      candidatos: cands.map((c) => ({
        ...c,
        votosUf: c.v,
        pctUf: c.p,
      })),
    };
  }

  return null;
}

/**
 * Retorna os dados agregados para uma mesorregião do estado
 */
export function getDadosMesorregiao(ufData: UfDataset, mesoId: number, cargo: 'pres' | 'gov' | 'sen' = 'pres') {
  const munDaRegiao = ufData.mun.filter((m) => m.meso === mesoId);
  if (!munDaRegiao.length) return null;

  const nomeRegiao = ufData.mesorregioes[String(mesoId)] || `Mesorregião ${mesoId}`;
  const ordemCands = ufData.ordem[cargo];

  let eleitorado = 0;
  let comparecimento = 0;
  let abstencao = 0;
  let votosValidos = 0;
  let votosBrancos = 0;
  let votosNulos = 0;
  const somaVotos: number[] = new Array(ordemCands.length).fill(0);

  munDaRegiao.forEach((m) => {
    eleitorado += m.e || 0;
    comparecimento += m.cp || 0;
    abstencao += m.a || 0;
    const cData = m[cargo];
    if (cData) {
      votosValidos += cData.vv || 0;
      votosBrancos += cData.vb || 0;
      votosNulos += cData.vn || 0;
      cData.v.forEach((v, idx) => {
        somaVotos[idx] += v || 0;
      });
    }
  });

  // Vencedor na mesorregião
  let maxVotos = -1;
  let vencedorNumero = ordemCands[0];
  let vencedorIdx = 0;
  somaVotos.forEach((v, idx) => {
    if (v > maxVotos) {
      maxVotos = v;
      vencedorNumero = ordemCands[idx];
      vencedorIdx = idx;
    }
  });

  const pctVencedor = votosValidos > 0 ? (maxVotos / votosValidos) * 100 : 0;

  return {
    mesoId,
    nome: nomeRegiao,
    totalMunicipios: munDaRegiao.length,
    municipios: munDaRegiao,
    eleitorado,
    comparecimento,
    pctComparecimento: eleitorado > 0 ? (comparecimento / eleitorado) * 100 : 0,
    abstencao,
    votosValidos,
    votosBrancos,
    votosNulos,
    vencedorNumero,
    vencedorIdx,
    votosVencedor: maxVotos,
    pctVencedor,
    votosPorCandidato: somaVotos,
  };
}

/**
 * Busca flexível de municípios, estados e candidatos
 */
export async function buscarGeral(termo: string, max: number = 20) {
  if (!termo || termo.trim().length < 2) return { estados: [], municipios: [] };
  const limpo = termo.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. Busca em Estados
  const estadosEncontrados = Object.entries(NOMES_UFS)
    .filter(([sigla, nome]) => {
      const nomeLimpo = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return sigla.includes(limpo) || nomeLimpo.includes(limpo);
    })
    .map(([sigla, nome]) => ({ sigla, nome, tipo: 'estado' as const }));

  // 2. Busca no índice de municípios
  const indice = await carregarIndiceMunicipios();
  const municipiosEncontrados: Array<{
    ibge: number;
    nome: string;
    uf: string;
    nomeUf: string;
    capital: boolean;
    eleitores: number;
    tipo: 'municipio';
  }> = [];

  for (const item of indice) {
    const [ibge, nome, uf, capital, eleitores] = item;
    const nomeLimpo = nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nomeLimpo.includes(limpo)) {
      municipiosEncontrados.push({
        ibge,
        nome,
        uf: uf.toUpperCase(),
        nomeUf: NOMES_UFS[uf.toLowerCase()] || uf.toUpperCase(),
        capital: capital === 1,
        eleitores,
        tipo: 'municipio',
      });
      if (municipiosEncontrados.length >= max) break;
    }
  }

  return {
    estados: estadosEncontrados,
    municipios: municipiosEncontrados,
  };
}
