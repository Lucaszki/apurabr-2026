/**
 * @file electionApi.ts
 * @description Camada de serviço para consumo da API de resultados eleitorais.
 * 
 * GUIA DE INTEGRAÇÃO COM API REAL:
 * Para conectar a sua API real de produção (ex: TSE, API interna ou webhook):
 * 1. Altere a constante `DEFAULT_API_URL` para o endereço da sua API REST.
 * 2. Caso sua API possua estrutura de chaves diferente, ajuste a função normalizadora `normalizeApiResponse`.
 * 3. O cabeçalho 'Accept' já está configurado. Lembre-se de configurar CORS no servidor de origem caso necessário.
 */

import { Candidate, ElectionSummary } from '../types/election';

/** URL padrão de exemplo para a API externa de apuração */
export const DEFAULT_API_URL = 'https://dados-abertos.eleicoes.gov.br/api/v1/apuracao/presidente-brasil';

/**
 * Dados base de candidatos neutros para simulação editorial
 */
const BASE_CANDIDATES_DATA = [
  {
    id: 'cand-1',
    numero: 10,
    nome: 'Candidato A',
    nomeUrna: 'CANDIDATO A',
    partido: 'Partido Renovação',
    siglaPartido: 'PRN',
    coligacao: 'Coligação Brasil Futuro (PRN / PA / PU)',
    vice: 'Dra. Maria Santos',
    corHex: '#2563EB', // Azul democrático
    proporcaoBase: 0.478, // ~47.8% dos votos válidos
  },
  {
    id: 'cand-2',
    numero: 20,
    nome: 'Candidato B',
    nomeUrna: 'CANDIDATO B',
    partido: 'Partido Democrático Social',
    siglaPartido: 'PDS',
    coligacao: 'Aliança Democrática Unida (PDS / PLB / PSD)',
    vice: 'Prof. Carlos Eduardo',
    corHex: '#059669', // Verde institucional
    proporcaoBase: 0.432, // ~43.2% dos votos válidos
  },
  {
    id: 'cand-3',
    numero: 30,
    nome: 'Candidato C',
    nomeUrna: 'CANDIDATO C',
    partido: 'Partido da Cidadania',
    siglaPartido: 'PCD',
    coligacao: 'Frente Ampla Cidadã',
    vice: 'Helena Ribeiro',
    corHex: '#D97706', // Âmbar / Ouro
    proporcaoBase: 0.058, // ~5.8% dos votos válidos
  },
  {
    id: 'cand-4',
    numero: 40,
    nome: 'Candidato D',
    nomeUrna: 'CANDIDATO D',
    partido: 'Movimento Progressista',
    siglaPartido: 'MPR',
    coligacao: 'Partido Isolado',
    vice: 'Gabriel Albuquerque',
    corHex: '#7C3AED', // Púrpura discreto
    proporcaoBase: 0.032, // ~3.2% dos votos válidos
  },
];

// Estado mutável em memória para a simulação progressiva da apuração
interface SimulationState {
  currentUrnasPercent: number;
  totalSecoes: number;
  totalEleitores: number;
  noiseFactor: number;
}

let simState: SimulationState = {
  currentUrnasPercent: 86.42,
  totalSecoes: 472075,
  totalEleitores: 156454011,
  noiseFactor: 0,
};

/**
 * Constrói o modelo de resumo eleitoral com base no percentual de urnas apuradas
 */
function buildMockElectionData(urnasPercent: number): ElectionSummary {
  const percent = Math.min(100, Math.max(0, urnasPercent));
  const secoesApuradas = Math.round((simState.totalSecoes * percent) / 100);
  
  // Taxas demográficas realistas baseadas no histórico do TSE
  const comparecimentoRate = 0.7965; // ~79.6% comparecimento
  const abstencaoRate = 1 - comparecimentoRate; // ~20.4% abstenções
  
  // Eleitores processados até o momento
  const eleitoresApurados = Math.round(simState.totalEleitores * (percent / 100));
  const comparecimentoApurado = Math.round(eleitoresApurados * comparecimentoRate);
  const abstencoesApuradas = eleitoresApurados - comparecimentoApurado;
  
  // Decomposição dos votos computados
  const validosRate = 0.9480; // ~94.8% votos válidos
  const brancosRate = 0.0240; // ~2.4% brancos
  const nulosRate = 0.0280;   // ~2.8% nulos
  
  const votosValidos = Math.round(comparecimentoApurado * validosRate);
  const votosBrancos = Math.round(comparecimentoApurado * brancosRate);
  const votosNulos = comparecimentoApurado - votosValidos - votosBrancos;

  // Flutuação realista conforme a apuração avança por regiões
  // Cria uma leve oscilação natural na reta final
  const progressRatio = percent / 100;
  const shiftA = Math.sin(progressRatio * Math.PI * 4) * 0.008;
  const shiftB = -shiftA * 0.9;
  
  const rawWeights = [
    Math.max(0.01, BASE_CANDIDATES_DATA[0].proporcaoBase + shiftA),
    Math.max(0.01, BASE_CANDIDATES_DATA[1].proporcaoBase + shiftB),
    Math.max(0.01, BASE_CANDIDATES_DATA[2].proporcaoBase - (shiftA * 0.05)),
    Math.max(0.01, BASE_CANDIDATES_DATA[3].proporcaoBase - (shiftB * 0.05)),
  ];

  const sumWeights = rawWeights.reduce((acc, curr) => acc + curr, 0);
  const normalizedPcts = rawWeights.map(w => (w / sumWeights) * 100);

  // Construção dos candidatos com cálculo de votos inteiros
  const candidates: Candidate[] = BASE_CANDIDATES_DATA.map((base, idx) => {
    const candidatePct = normalizedPcts[idx];
    const candidateVotes = Math.round((votosValidos * candidatePct) / 100);

    return {
      id: base.id,
      numero: base.numero,
      nome: base.nome,
      nomeUrna: base.nomeUrna,
      partido: base.partido,
      siglaPartido: base.siglaPartido,
      coligacao: base.coligacao,
      vice: base.vice,
      votos: candidateVotes,
      porcentagem: Number(candidatePct.toFixed(2)),
      porcentagemTotal: Number(((candidateVotes / Math.max(1, comparecimentoApurado)) * 100).toFixed(2)),
      corHex: base.corHex,
      status: 'em_apuracao',
    };
  });

  // Ordena sempre do maior para o menor número de votos
  candidates.sort((a, b) => b.votos - a.votos);

  // Determina status eleitoral do líder e demais concorrentes
  const lider = candidates[0];
  const segundo = candidates[1];
  
  let situacaoTotalizacao: ElectionSummary['situacao_totalizacao'] = 'em_andamento';

  if (percent >= 100) {
    situacaoTotalizacao = 'finalizada';
    if (lider.porcentagem > 50.0) {
      lider.status = 'eleito';
      lider.statusDescricao = 'Eleito em 1º Turno';
    } else {
      lider.status = 'segundo_turno';
      lider.statusDescricao = 'Classificado para o 2º Turno';
      if (segundo) {
        segundo.status = 'segundo_turno';
        segundo.statusDescricao = 'Classificado para o 2º Turno';
      }
    }
  } else if (percent >= 90) {
    situacaoTotalizacao = 'matematicamente_definido';
    lider.status = 'lider';
    lider.statusDescricao = lider.porcentagem > 50 
      ? 'Liderança (Com chances de vitória em 1º turno)'
      : 'Liderança Matemática Provisória';
    if (segundo) {
      segundo.status = 'segundo_turno';
      segundo.statusDescricao = 'Em zona de 2º Turno';
    }
  } else {
    lider.status = 'lider';
    lider.statusDescricao = 'Liderança Provisória';
  }

  // Candidatos restantes
  for (let i = 2; i < candidates.length; i++) {
    candidates[i].status = percent >= 95 ? 'nao_eleito' : 'em_apuracao';
    candidates[i].statusDescricao = percent >= 95 ? 'Não eleito' : 'Em apuração';
  }

  const agora = new Date();

  return {
    id: 'eleicao-geral-2026',
    eleicao: 'Eleições Gerais de 2026 · Apuração Oficial',
    cargo: 'Presidente da República',
    abrangencia: 'Brasil (Totalização Nacional)',
    ano: 2026,
    turno: 1,

    total_urnas_apuradas: Number(percent.toFixed(2)),
    secoes_total: simState.totalSecoes,
    secoes_apuradas: secoesApuradas,

    total_eleitores: simState.totalEleitores,
    comparecimento: comparecimentoApurado,
    comparecimento_pct: Number((comparecimentoRate * 100).toFixed(2)),
    abstencoes: abstencoesApuradas,
    abstencoes_pct: Number((abstencaoRate * 100).toFixed(2)),

    votos_total: comparecimentoApurado,
    votos_validos: votosValidos,
    votos_validos_pct: Number((validosRate * 100).toFixed(2)),
    votos_brancos: votosBrancos,
    votos_brancos_pct: Number((brancosRate * 100).toFixed(2)),
    votos_nulos: votosNulos,
    votos_nulos_pct: Number((nulosRate * 100).toFixed(2)),

    data_hora_atualizacao: agora.toISOString(),
    situacao_totalizacao: situacaoTotalizacao,
    candidatos: candidates,
  };
}

/**
 * Função de fetch principal.
 * Se a URL informada for a URL simulada ou falhar na rede externa,
 * retorna a simulação fiel com setTimeout simulando o tempo de resposta da rede.
 */
export async function fetchElectionData(
  targetUrl: string = DEFAULT_API_URL,
  options?: {
    forceUrnasPercent?: number;
    incrementStep?: boolean;
    useRealFetchOnly?: boolean;
  }
): Promise<ElectionSummary> {
  const isMockUrl = !targetUrl || targetUrl.includes('exemplo') || targetUrl.includes('dados-abertos.eleicoes.gov.br');

  // Se o usuário configurar uma URL real e não for o padrão mock
  if (!isMockUrl && options?.useRealFetchOnly) {
    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta da API: HTTP ${response.status} ${response.statusText}`);
      }

      const json = await response.json();
      return normalizeApiResponse(json);
    } catch (err) {
      console.warn('Falha na chamada da API externa real, acionando fallback ou repassando erro:', err);
      throw err;
    }
  }

  // Fluxo simulado com latência de rede realista (400ms - 800ms)
  const networkDelay = Math.floor(Math.random() * 300) + 400;

  return new Promise((resolve) => {
    setTimeout(() => {
      if (options?.forceUrnasPercent !== undefined) {
        simState.currentUrnasPercent = options.forceUrnasPercent;
      } else if (options?.incrementStep) {
        // Incrementa as urnas de 1.2% a 3.8% simulando a chegada de lotes do TSE
        const increment = Number((Math.random() * 2.6 + 1.2).toFixed(2));
        simState.currentUrnasPercent = Math.min(100, Number((simState.currentUrnasPercent + increment).toFixed(2)));
      }

      const result = buildMockElectionData(simState.currentUrnasPercent);
      resolve(result);
    }, networkDelay);
  });
}

/**
 * Redefine a simulação para um percentual inicial (útil para testes de homologação)
 */
export function resetSimulation(initialPercent: number = 72.30): void {
  simState.currentUrnasPercent = initialPercent;
}

/**
 * Normalizador para converter respostas de APIs REST de eleições (ex: TSE)
 * para a interface tipada ElectionSummary.
 */
function normalizeApiResponse(raw: any): ElectionSummary {
  // Caso a API já siga exatamente o nosso contrato
  if (raw && typeof raw.total_urnas_apuradas === 'number' && Array.isArray(raw.candidatos)) {
    return raw as ElectionSummary;
  }

  // Exemplo de mapeador para APIs externas com chaves alternativas
  const candidatos: Candidate[] = (raw.cand || raw.candidatos || []).map((c: any, index: number) => ({
    id: String(c.id || c.sqcand || `cand-${index}`),
    numero: Number(c.numero || c.n || 0),
    nome: String(c.nome || c.nm || `Candidato ${index + 1}`),
    nomeUrna: String(c.nomeUrna || c.nmu || c.nome || ''),
    partido: String(c.partido || c.sgp || ''),
    siglaPartido: String(c.siglaPartido || c.sgp || ''),
    coligacao: c.coligacao || c.ds_coligacao,
    vice: c.vice || c.nm_vice,
    votos: Number(c.votos || c.vap || 0),
    porcentagem: Number(c.porcentagem || c.pvap || 0),
    status: c.status || 'em_apuracao',
    corHex: c.corHex || BASE_CANDIDATES_DATA[index % BASE_CANDIDATES_DATA.length]?.corHex || '#2563EB',
  }));

  candidatos.sort((a, b) => b.votos - a.votos);

  return {
    id: raw.id || 'eleicao-custom',
    eleicao: raw.eleicao || 'Apuração Eleitoral em Tempo Real',
    cargo: raw.cargo || 'Cargo Eletivo',
    abrangencia: raw.abrangencia || 'Nacional',
    ano: raw.ano || new Date().getFullYear(),
    turno: raw.turno || 1,
    total_urnas_apuradas: Number(raw.total_urnas_apuradas || raw.pst || 0),
    secoes_total: Number(raw.secoes_total || raw.s || 0),
    secoes_apuradas: Number(raw.secoes_apuradas || raw.sa || 0),
    total_eleitores: Number(raw.total_eleitores || raw.e || 0),
    comparecimento: Number(raw.comparecimento || raw.c || 0),
    comparecimento_pct: Number(raw.comparecimento_pct || raw.pc || 0),
    abstencoes: Number(raw.abstencoes || raw.a || 0),
    abstencoes_pct: Number(raw.abstencoes_pct || raw.pa || 0),
    votos_total: Number(raw.votos_total || raw.tv || 0),
    votos_validos: Number(raw.votos_validos || raw.vv || 0),
    votos_validos_pct: Number(raw.votos_validos_pct || raw.pvv || 0),
    votos_brancos: Number(raw.votos_brancos || raw.vb || 0),
    votos_brancos_pct: Number(raw.votos_brancos_pct || raw.pvb || 0),
    votos_nulos: Number(raw.votos_nulos || raw.vn || 0),
    votos_nulos_pct: Number(raw.votos_nulos_pct || raw.pvn || 0),
    data_hora_atualizacao: raw.data_hora_atualizacao || new Date().toISOString(),
    situacao_totalizacao: raw.situacao_totalizacao || 'em_andamento',
    candidatos,
  };
}

/**
 * Utilitários de formatação para o padrão brasileiro
 */
export const formatters = {
  /** Formata número inteiro com pontos de milhar (ex: 42.580.120) */
  number: (val: number): string => {
    return new Intl.NumberFormat('pt-BR').format(val);
  },

  /** Formata percentual com 2 casas decimais e vírgula (ex: 85,50%) */
  percent: (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val) + '%';
  },

  /** Formata data e hora no estilo editorial brasileiro */
  dateTime: (dateInput: string | Date): string => {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return 'Horário indisponível';

    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    const seg = String(d.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${ano} às ${hora}:${min}:${seg}`;
  },
};
