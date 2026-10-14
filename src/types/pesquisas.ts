/**
 * @file pesquisas.ts
 * @description Definições tipadas para o módulo de pesquisas eleitorais e simulador de segundo turno.
 */

export interface PesquisaPresidente {
  id: string;
  instituto: string;
  contratante?: string;
  divulgacao: string; // formato YYYY-MM-DD
  campo: string; // ex: "06 a 08/10/2026"
  amostra: number;
  margem: number; // ex: 2.0 (significa +/- 2.0 pp)
  registroTse?: string; // ex: "BR-04812/2026"
  cenario: 'estimulada' | 'espontanea';
  
  // Votos Totais (com Brancos, Nulos e Indecisos)
  totais: {
    flavio: number;
    lula: number;
    brancosNulos: number;
    indecisos: number;
  };

  // Votos Válidos (descontando brancos, nulos e indecisos)
  validos: {
    flavio: number;
    lula: number;
  };

  // Taxa de Rejeição ("Não votaria de jeito nenhum")
  rejeicao?: {
    flavio: number;
    lula: number;
  };

  // Recortes Regionais (% de votos válidos ou totais em cada região)
  regioes?: {
    sudeste?: { flavio: number; lula: number };
    sul?: { flavio: number; lula: number };
    nordeste?: { flavio: number; lula: number };
    centroOeste?: { flavio: number; lula: number };
    norte?: { flavio: number; lula: number };
  };

  destaques?: string[];
  fonteUrl?: string;
}

export interface PesquisaGovernador {
  id: string;
  uf: string;
  instituto: string;
  contratante?: string;
  divulgacao: string;
  amostra: number;
  margem: number;
  registroTse?: string;
  candidato1: { nome: string; partido: string; validos: number; totais: number };
  candidato2: { nome: string; partido: string; validos: number; totais: number };
  brancosNulos: number;
  indecisos: number;
  fonteUrl?: string;
}

export interface TransferenciaVotoCandidato {
  numero: number;
  nome: string;
  siglaPartido: string;
  votos1T: number;
  pctValidos1T: number;
  // Proporções estimadas com base em pesquisas
  migracaoFlavio: number; // 0-100
  migracaoLula: number;   // 0-100
  migracaoBrancoNulo: number; // 0-100
}

export interface SimuladorConfig {
  comparecimentoPct: number; // default ~79%
  brancosNulosPct: number;   // default ~4.5%
  // Migração personalizada por candidato do 1T
  transferencias: Record<number, { flavio: number; lula: number; brancoNulo: number }>;
  // Ajuste por região (% de variação em relação ao 1T)
  ajusteRegioes: {
    sudeste: number; // em pp para Flávio (-5 a +5)
    sul: number;
    nordeste: number;
    centroOeste: number;
    norte: number;
  };
}
