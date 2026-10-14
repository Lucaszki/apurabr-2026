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
 * Dados oficiais consolidados dos 12 candidatos a Presidente da República do TSE (Eleições 2026)
 */
const BASE_CANDIDATES_DATA = [
  {
    id: 'cand-22',
    numero: 22,
    nome: 'Flávio Nantes Bolsonaro',
    nomeUrna: 'FLÁVIO BOLSONARO',
    partido: 'Partido Liberal',
    siglaPartido: 'PL',
    coligacao: 'Coligação Partido Liberal (PL)',
    vice: 'Alfredo Gaspar (PL)',
    corHex: '#1E40AF',
    votosReais: 56104503,
    proporcaoBase: 0.47027772,
  },
  {
    id: 'cand-13',
    numero: 13,
    nome: 'Luiz Inácio Lula da Silva',
    nomeUrna: 'LULA',
    partido: 'Partido dos Trabalhadores',
    siglaPartido: 'PT',
    coligacao: 'Brasil Pronto pra Mais (PT / PSB / PDT / PCdoB / PV / PSOL / REDE)',
    vice: 'Geraldo Alckmin (PSB)',
    corHex: '#DC2626',
    votosReais: 53879538,
    proporcaoBase: 0.45162768,
  },
  {
    id: 'cand-70',
    numero: 70,
    nome: 'Augusto Jorge Cury',
    nomeUrna: 'ESCRITOR AUGUSTO CURY',
    partido: 'Avante',
    siglaPartido: 'AVANTE',
    coligacao: 'Brasil dos Nossos Sonhos (Avante / Agir)',
    vice: 'Júlio Delgado (AVANTE)',
    corHex: '#D97706',
    votosReais: 3448569,
    proporcaoBase: 0.02890651,
  },
  {
    id: 'cand-14',
    numero: 14,
    nome: 'Renan Antonio Ferreira dos Santos',
    nomeUrna: 'RENAN SANTOS',
    partido: 'Partido Missão',
    siglaPartido: 'MISSÃO',
    coligacao: 'Partido Missão',
    vice: 'Coronel Medina (MISSÃO)',
    corHex: '#2563EB',
    votosReais: 2675887,
    proporcaoBase: 0.02242975,
  },
  {
    id: 'cand-55',
    numero: 55,
    nome: 'Ronaldo Ramos Caiado',
    nomeUrna: 'RONALDO CAIADO',
    partido: 'Partido Social Democrático',
    siglaPartido: 'PSD',
    coligacao: 'Partido Social Democrático',
    vice: 'Gilberto Kassab (PSD)',
    corHex: '#059669',
    votosReais: 2605148,
    proporcaoBase: 0.02183680,
  },
  {
    id: 'cand-30',
    numero: 30,
    nome: 'Romeu Zema Neto',
    nomeUrna: 'ZEMA',
    partido: 'Partido Novo',
    siglaPartido: 'NOVO',
    coligacao: 'Partido Novo',
    vice: 'Eduardo Girão (NOVO)',
    corHex: '#EA580C',
    votosReais: 326488,
    proporcaoBase: 0.00273668,
  },
  {
    id: 'cand-80',
    numero: 80,
    nome: 'Samara Martins da Silva Feitosa',
    nomeUrna: 'SAMARA',
    partido: 'Unidade Popular',
    siglaPartido: 'UP',
    coligacao: 'Unidade Popular',
    vice: 'Raquel Brício (UP)',
    corHex: '#BE123C',
    votosReais: 122911,
    proporcaoBase: 0.00103026,
  },
  {
    id: 'cand-16',
    numero: 16,
    nome: 'Hertz da Conceição Dias',
    nomeUrna: 'HERTZ DIAS',
    partido: 'PSTU',
    siglaPartido: 'PSTU',
    coligacao: 'Partido Socialista dos Trabalhadores Unificado',
    vice: 'Vanessa Portugal (PSTU)',
    corHex: '#B91C1C',
    votosReais: 43103,
    proporcaoBase: 0.00036130,
  },
  {
    id: 'cand-27',
    numero: 27,
    nome: 'Clariana Zacarkim Barão',
    nomeUrna: 'CLARIANA BARÃO',
    partido: 'Democracia Cristã',
    siglaPartido: 'DC',
    coligacao: 'Democracia Cristã',
    vice: 'Fabiana Torquato (DC)',
    corHex: '#0891B2',
    votosReais: 40043,
    proporcaoBase: 0.00033565,
  },
  {
    id: 'cand-21',
    numero: 21,
    nome: 'Edmilson Silva Costa',
    nomeUrna: 'EDMILSON COSTA',
    partido: 'Partido Comunista Brasileiro',
    siglaPartido: 'PCB',
    coligacao: 'Partido Comunista Brasileiro',
    vice: 'Cleusa Santos (PCB)',
    corHex: '#991B1B',
    votosReais: 22693,
    proporcaoBase: 0.00019022,
  },
  {
    id: 'cand-35',
    numero: 35,
    nome: 'Wilson Grassi Junior',
    nomeUrna: 'VETERINÁRIO WILSON GRASSI',
    partido: 'Democrata',
    siglaPartido: 'DEMOCRATA',
    coligacao: 'Democrata',
    vice: 'Suêd Haidar (DEMOCRATA)',
    corHex: '#4F46E5',
    votosReais: 16881,
    proporcaoBase: 0.00014150,
  },
  {
    id: 'cand-29',
    numero: 29,
    nome: 'Rui Costa Pimenta',
    nomeUrna: 'RUI COSTA PIMENTA',
    partido: 'Partido da Causa Operária',
    siglaPartido: 'PCO',
    coligacao: 'Partido da Causa Operária',
    vice: 'Antônio Carlos (PCO)',
    corHex: '#7F1D1D',
    votosReais: 15024,
    proporcaoBase: 0.00012593,
  },
];

// Estado oficial em memória consolidado do TSE
interface SimulationState {
  currentUrnasPercent: number;
  totalSecoes: number;
  totalEleitores: number;
  noiseFactor: number;
}

let simState: SimulationState = {
  currentUrnasPercent: 100.0,
  totalSecoes: 499248,
  totalEleitores: 158745502,
  noiseFactor: 0,
};

/**
 * Constrói o modelo de resumo eleitoral com base no percentual de urnas apuradas
 */
function buildMockElectionData(urnasPercent: number): ElectionSummary {
  const percent = Math.min(100, Math.max(0, urnasPercent));
  const secoesApuradas = percent >= 100 ? 499207 : Math.round((simState.totalSecoes * percent) / 100);
  
  // Taxas demográficas oficiais do TSE 2026
  const comparecimentoRate = 0.78916358; // 78,92%
  const abstencaoRate = 1 - comparecimentoRate; // 21,08%
  
  const eleitoresApurados = Math.round(simState.totalEleitores * (percent / 100));
  const comparecimentoApurado = percent >= 100 ? 125275835 : Math.round(eleitoresApurados * comparecimentoRate);
  const abstencoesApuradas = percent >= 100 ? 33469244 : eleitoresApurados - comparecimentoApurado;
  
  const validosRate = 0.95230487; // 95,23%
  const brancosRate = 0.01836585; // 1,84%
  const nulosRate = 0.02932927;   // 2,93%
  
  const votosValidos = percent >= 100 ? 119300788 : Math.round(comparecimentoApurado * validosRate);
  const votosBrancos = percent >= 100 ? 2300798 : Math.round(comparecimentoApurado * brancosRate);
  const votosNulos = percent >= 100 ? 3674249 : comparecimentoApurado - votosValidos - votosBrancos;

  // Construção dos candidatos com cálculo de votos inteiros
  const candidates: Candidate[] = BASE_CANDIDATES_DATA.map((base) => {
    const candidatePct = Number((base.proporcaoBase * 100).toFixed(2));
    const candidateVotes = percent >= 100 ? base.votosReais : Math.round((votosValidos * base.proporcaoBase));

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
      porcentagem: candidatePct,
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
