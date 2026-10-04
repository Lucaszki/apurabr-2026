/**
 * @file election.ts
 * @description Definições de tipos e interfaces para o sistema de apuração eleitoral.
 * Estrutura compatível com padrões de APIs eleitorais abertas (como TSE DivulgaCandContas).
 */

export type CandidateStatus = 
  | 'lider'                // Liderando a contagem de votos
  | 'segundo_turno'        // Matematicamente no 2º turno
  | 'eleito'               // Matematicamente eleito (votos válidos > 50% ou finalizado)
  | 'em_apuracao'          // Disputa regular em andamento
  | 'nao_eleito';          // Matematicamente sem chances / não eleito

export interface Candidate {
  id: string;
  numero: number;
  nome: string;
  nomeUrna: string;
  partido: string;
  siglaPartido: string;
  coligacao?: string;
  vice?: string;
  votos: number;
  porcentagem: number;     // Percentual sobre os votos válidos (ex: 48.75)
  porcentagemTotal?: number; // Percentual sobre o total de votos
  status: CandidateStatus;
  statusDescricao?: string; // Ex: "Liderança matemática provisória"
  corHex: string;          // Cor de identidade visual da legenda
  fotoUrl?: string;
}

export type SituacaoApuracao = 
  | 'nao_iniciada'
  | 'em_andamento'
  | 'matematicamente_definido'
  | 'finalizada';

export interface ElectionSummary {
  /** Identificador da eleição */
  id: string;
  /** Título oficial do pleito */
  eleicao: string;
  /** Cargo em disputa (ex: "Presidente", "Governador", "Prefeito") */
  cargo: string;
  /** Abrangência geográfica (ex: "Brasil", "São Paulo", "Rio de Janeiro") */
  abrangencia: string;
  /** Ano eleitoral */
  ano: number;
  /** Turno (1 ou 2) */
  turno: number;

  /** Percentual de urnas apuradas (0.00 a 100.00) */
  total_urnas_apuradas: number;
  /** Total de seções eleitorais */
  secoes_total: number;
  /** Quantidade de seções já apuradas */
  secoes_apuradas: number;

  /** Total de eleitores aptos */
  total_eleitores: number;
  /** Total de comparecimento presencial */
  comparecimento: number;
  comparecimento_pct: number;
  /** Total de abstenções */
  abstencoes: number;
  abstencoes_pct: number;

  /** Total geral de votos computados nas urnas apuradas */
  votos_total: number;
  /** Total de votos válidos (nominais + legenda) */
  votos_validos: number;
  votos_validos_pct: number;
  /** Total de votos brancos */
  votos_brancos: number;
  votos_brancos_pct: number;
  /** Total de votos nulos */
  votos_nulos: number;
  votos_nulos_pct: number;

  /** Timestamp da última atualização no formato ISO */
  data_hora_atualizacao: string;
  /** Situação da totalização */
  situacao_totalizacao: SituacaoApuracao;

  /** Lista dos candidatos ordenada por votos válidos */
  candidatos: Candidate[];
}

export interface ApiConfiguration {
  endpointUrl: string;
  isMock: boolean;
  autoRefreshIntervalSeconds: number;
}
