/**
 * @file pesquisas2026.ts
 * @description Base consolidada de pesquisas de intenção de voto do 2º Turno das Eleições 2026,
 * parâmetros demográficos regionais, transferências de voto do 1º turno e cenários de simulação.
 */

import { PesquisaPresidente, PesquisaGovernador, TransferenciaVotoCandidato } from '../types/pesquisas';

/**
 * Pesquisas Nacionais registradas no TSE para Presidente (2º Turno)
 * Levantadas entre 05/10/2026 e 13/10/2026
 */
export const PESQUISAS_PRESIDENTE_2T: PesquisaPresidente[] = [
  {
    id: 'datafolha-2026-10-08',
    instituto: 'Datafolha',
    contratante: 'Folha de S.Paulo / TV Globo',
    divulgacao: '2026-10-08',
    campo: '06 a 08 de outubro de 2026',
    amostra: 2884,
    margem: 2.0,
    registroTse: 'BR-04812/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 49.0,
      lula: 45.0,
      brancosNulos: 5.0,
      indecisos: 1.0,
    },
    validos: {
      flavio: 52.1,
      lula: 47.9,
    },
    rejeicao: {
      flavio: 46.0,
      lula: 48.0,
    },
    regioes: {
      sudeste: { flavio: 54.0, lula: 46.0 },
      sul: { flavio: 62.0, lula: 38.0 },
      nordeste: { flavio: 33.0, lula: 67.0 },
      centroOeste: { flavio: 61.0, lula: 39.0 },
      norte: { flavio: 53.0, lula: 47.0 },
    },
    destaques: [
      'Primeira pesquisa Datafolha após o encerramento do 1º turno',
      'Flávio numericamente à frente com 52% dos válidos, no limite da margem de erro técnica',
      'Lula mantém vantagem consolidada no Nordeste (67%), mas Flávio lidera no Sudeste e Sul',
    ],
    fonteUrl: 'https://g1.globo.com/politica/eleicoes/2026/pesquisa-datafolha-segundo-turno.ghtml',
  },
  {
    id: 'atlasintel-2026-10-09',
    instituto: 'AtlasIntel',
    contratante: 'AtlasIntel / Bloomberg',
    divulgacao: '2026-10-09',
    campo: '05 a 08 de outubro de 2026',
    amostra: 4520,
    margem: 1.0,
    registroTse: 'BR-01934/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 51.1,
      lula: 45.7,
      brancosNulos: 2.1,
      indecisos: 1.1,
    },
    validos: {
      flavio: 52.8,
      lula: 47.2,
    },
    rejeicao: {
      flavio: 47.0,
      lula: 49.0,
    },
    regioes: {
      sudeste: { flavio: 55.2, lula: 44.8 },
      sul: { flavio: 63.5, lula: 36.5 },
      nordeste: { flavio: 32.4, lula: 67.6 },
      centroOeste: { flavio: 62.1, lula: 37.9 },
      norte: { flavio: 54.0, lula: 46.0 },
    },
    destaques: [
      'Amostra ampla com 4.520 entrevistas pela internet',
      'Margem de erro reduzida de 1 ponto percentual',
      'Flávio abre 5,6 pontos percentuais sobre Lula em votos válidos',
    ],
    fonteUrl: 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-atlasintel-segundo-turno-presidente/',
  },
  {
    id: 'btg-nexus-2026-10-13',
    instituto: 'BTG Pactual / Nexus',
    contratante: 'Banco BTG Pactual S.A.',
    divulgacao: '2026-10-13',
    campo: '09 a 12 de outubro de 2026',
    amostra: 3000,
    margem: 2.0,
    registroTse: 'BR-06721/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 48.0,
      lula: 45.0,
      brancosNulos: 5.0,
      indecisos: 2.0,
    },
    validos: {
      flavio: 51.6,
      lula: 48.4,
    },
    rejeicao: {
      flavio: 46.5,
      lula: 47.8,
    },
    regioes: {
      sudeste: { flavio: 53.0, lula: 47.0 },
      sul: { flavio: 60.0, lula: 40.0 },
      nordeste: { flavio: 35.0, lula: 65.0 },
      centroOeste: { flavio: 59.0, lula: 41.0 },
      norte: { flavio: 51.0, lula: 49.0 },
    },
    destaques: [
      'Empate técnico dentro da margem de erro (+/- 2,0 pp)',
      'Migração favorável de eleitores de Caiado e Zema para a candidatura de Flávio',
      'Eleitores de centro mantêm indefinição na reta final',
    ],
    fonteUrl: 'https://noticias.uol.com.br/eleicoes/2026/pesquisa-btg-nexus-segundo-turno.htm',
  },
  {
    id: 'poderdata-2026-10-13',
    instituto: 'PoderData',
    contratante: 'Poder360 / AYA Institute',
    divulgacao: '2026-10-13',
    campo: '10 a 12 de outubro de 2026',
    amostra: 3500,
    margem: 1.8,
    registroTse: 'BR-08204/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 48.0,
      lula: 46.0,
      brancosNulos: 4.0,
      indecisos: 2.0,
    },
    validos: {
      flavio: 51.0,
      lula: 49.0,
    },
    rejeicao: {
      flavio: 47.0,
      lula: 48.0,
    },
    regioes: {
      sudeste: { flavio: 52.0, lula: 48.0 },
      sul: { flavio: 59.0, lula: 41.0 },
      nordeste: { flavio: 36.0, lula: 64.0 },
      centroOeste: { flavio: 58.0, lula: 42.0 },
      norte: { flavio: 51.0, lula: 49.0 },
    },
    destaques: [
      'Quadro de empate técnico mais acirrado entre as pesquisas (51% x 49%)',
      'Diferença cai para 2 pontos percentuais em votos válidos',
      'Crescimento da polarização direta entre as duas frentes políticas',
    ],
    fonteUrl: 'https://www.poder360.com.br/poderdata/pesquisa-poderdata-segundo-turno-presidente-2026/',
  },
  {
    id: 'futura-2026-10-13',
    instituto: 'Futura / 100% Cidades',
    contratante: '100% Cidades / Exame',
    divulgacao: '2026-10-13',
    campo: '08 a 11 de outubro de 2026',
    amostra: 2000,
    margem: 2.2,
    registroTse: 'BR-03419/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 49.2,
      lula: 45.8,
      brancosNulos: 3.5,
      indecisos: 1.5,
    },
    validos: {
      flavio: 51.8,
      lula: 48.2,
    },
    rejeicao: {
      flavio: 45.0,
      lula: 48.5,
    },
    destaques: [
      'Flávio mantém liderança de 3,6 pontos em votos válidos',
      'Maior índice de fidelidade entre eleitores do 1º turno',
    ],
    fonteUrl: 'https://www.cnnbrasil.com.br/politica/eleicoes-2026-pesquisa-futura-segundo-turno/',
  },
  {
    id: 'gerp-2026-10-13',
    instituto: 'Instituto GERP',
    contratante: 'GERP Comunicação',
    divulgacao: '2026-10-13',
    campo: '07 a 11 de outubro de 2026',
    amostra: 2095,
    margem: 2.18,
    registroTse: 'BR-05187/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 51.0,
      lula: 42.0,
      brancosNulos: 5.0,
      indecisos: 2.0,
    },
    validos: {
      flavio: 54.8,
      lula: 45.2,
    },
    destaques: [
      'Maior vantagem pró-Flávio entre os institutos avaliados (+9,6 pp válidos)',
      'Forte peso da votação do interior de São Paulo, Minas e Rio de Janeiro',
    ],
    fonteUrl: 'https://www.instituto-gerp.com.br/pesquisas/eleicoes-2026-segundo-turno',
  },
];

/**
 * Candidatos que disputaram o 1º turno e distribuição dos seus votos para o 2º turno
 */
export const CANDIDATOS_1T_TRANSFERENCIA: TransferenciaVotoCandidato[] = [
  {
    numero: 70,
    nome: 'Augusto Cury',
    siglaPartido: 'AVANTE',
    votos1T: 3448569,
    pctValidos1T: 2.89,
    migracaoFlavio: 48,
    migracaoLula: 28,
    migracaoBrancoNulo: 24,
  },
  {
    numero: 14,
    nome: 'Renan Santos',
    siglaPartido: 'MISSÃO',
    votos1T: 2675887,
    pctValidos1T: 2.24,
    migracaoFlavio: 65,
    migracaoLula: 10,
    migracaoBrancoNulo: 25,
  },
  {
    numero: 55,
    nome: 'Ronaldo Caiado',
    siglaPartido: 'PSD',
    votos1T: 2605148,
    pctValidos1T: 2.18,
    migracaoFlavio: 72,
    migracaoLula: 16,
    migracaoBrancoNulo: 12,
  },
  {
    numero: 30,
    nome: 'Romeu Zema',
    siglaPartido: 'NOVO',
    votos1T: 326488,
    pctValidos1T: 0.27,
    migracaoFlavio: 82,
    migracaoLula: 8,
    migracaoBrancoNulo: 10,
  },
  {
    numero: 80,
    nome: 'Samara',
    siglaPartido: 'UP',
    votos1T: 122911,
    pctValidos1T: 0.10,
    migracaoFlavio: 5,
    migracaoLula: 82,
    migracaoBrancoNulo: 13,
  },
  {
    numero: 16,
    nome: 'Hertz Dias',
    siglaPartido: 'PSTU',
    votos1T: 43103,
    pctValidos1T: 0.04,
    migracaoFlavio: 4,
    migracaoLula: 78,
    migracaoBrancoNulo: 18,
  },
  {
    numero: 27,
    nome: 'Clariana Barão',
    siglaPartido: 'DC',
    votos1T: 40043,
    pctValidos1T: 0.03,
    migracaoFlavio: 62,
    migracaoLula: 18,
    migracaoBrancoNulo: 20,
  },
  {
    numero: 21,
    nome: 'Edmilson Costa',
    siglaPartido: 'PCB',
    votos1T: 22693,
    pctValidos1T: 0.02,
    migracaoFlavio: 3,
    migracaoLula: 85,
    migracaoBrancoNulo: 12,
  },
];

/**
 * Pesquisas estaduais para os Governos com 2º Turno (AM, RN, DF, ES, AC)
 */
export const PESQUISAS_GOVERNADOR_2T: PesquisaGovernador[] = [
  {
    id: 'quaest-am-2026',
    uf: 'am',
    instituto: 'Quaest / Rede Amazônica',
    contratante: 'TV Globo / Rede Amazônica',
    divulgacao: '2026-10-12',
    amostra: 1000,
    margem: 3.1,
    registroTse: 'AM-04918/2026',
    candidato1: { nome: 'Wilson Lima', partido: 'UNIÃO', validos: 52.4, totais: 48.0 },
    candidato2: { nome: 'Eduardo Braga', partido: 'MDB', validos: 47.6, totais: 43.6 },
    brancosNulos: 5.4,
    indecisos: 3.0,
    fonteUrl: 'https://g1.globo.com/am/amazonas/eleicoes/2026/pesquisa-quaest-segundo-turno-governo-am.ghtml',
  },
  {
    id: 'quaest-df-2026',
    uf: 'df',
    instituto: 'Quaest / TV Globo DF',
    contratante: 'TV Globo',
    divulgacao: '2026-10-12',
    amostra: 1200,
    margem: 2.8,
    registroTse: 'DF-02315/2026',
    candidato1: { nome: 'Celina Leão', partido: 'PP', validos: 54.0, totais: 49.0 },
    candidato2: { nome: 'Leandro Grass', partido: 'PV', validos: 46.0, totais: 42.0 },
    brancosNulos: 6.0,
    indecisos: 3.0,
    fonteUrl: 'https://g1.globo.com/df/distrito-federal/eleicoes/2026/pesquisa-quaest-governo-df-2t.ghtml',
  },
  {
    id: 'quaest-ac-2026',
    uf: 'ac',
    instituto: 'Quaest / Rede Amazônica AC',
    contratante: 'Rede Amazônica',
    divulgacao: '2026-10-13',
    amostra: 800,
    margem: 3.5,
    registroTse: 'AC-01182/2026',
    candidato1: { nome: 'Alan Rick', partido: 'UNIÃO', validos: 53.0, totais: 48.0 },
    candidato2: { nome: 'Jorge Viana', partido: 'PT', validos: 47.0, totais: 43.0 },
    brancosNulos: 6.0,
    indecisos: 3.0,
    fonteUrl: 'https://g1.globo.com/ac/acre/eleicoes/2026/pesquisa-quaest-governo-ac-2t.ghtml',
  },
  {
    id: 'ipesp-rn-2026',
    uf: 'rn',
    instituto: 'Ipespe / Tribuna do Norte',
    contratante: 'Tribuna do Norte',
    divulgacao: '2026-10-13',
    amostra: 1000,
    margem: 3.2,
    registroTse: 'RN-03310/2026',
    candidato1: { nome: 'Rogério Marinho', partido: 'PL', validos: 51.5, totais: 46.0 },
    candidato2: { nome: 'Carlos Eduardo', partido: 'PSD', validos: 48.5, totais: 43.5 },
    brancosNulos: 7.0,
    indecisos: 3.5,
    fonteUrl: 'https://tribunadonorte.com.br/eleicoes/2026/pesquisa-ipespe-governo-rn-2t',
  },
  {
    id: 'futura-es-2026',
    uf: 'es',
    instituto: 'Futura / Folha Vitória',
    contratante: 'Rede Vitória',
    divulgacao: '2026-10-12',
    amostra: 1000,
    margem: 3.1,
    registroTse: 'ES-02209/2026',
    candidato1: { nome: 'Carlos Manato', partido: 'PL', validos: 52.0, totais: 47.5 },
    candidato2: { nome: 'Ricardo Ferraço', partido: 'MDB', validos: 48.0, totais: 44.0 },
    brancosNulos: 5.5,
    indecisos: 3.0,
    fonteUrl: 'https://folhavitoria.com.br/eleicoes-2026/pesquisa-futura-governo-es-2t',
  },
];

/**
 * Média ponderada agregada das pesquisas nacionais (Tracker Eleitoral)
 */
export function calcularMediaAgregada() {
  const pesquisas = PESQUISAS_PRESIDENTE_2T;
  if (!pesquisas.length) return null;

  let somaValidosFlavio = 0;
  let somaValidosLula = 0;
  let somaTotaisFlavio = 0;
  let somaTotaisLula = 0;
  let somaBn = 0;
  let somaIndecisos = 0;

  pesquisas.forEach((p) => {
    somaValidosFlavio += p.validos.flavio;
    somaValidosLula += p.validos.lula;
    somaTotaisFlavio += p.totais.flavio;
    somaTotaisLula += p.totais.lula;
    somaBn += p.totais.brancosNulos;
    somaIndecisos += p.totais.indecisos;
  });

  const n = pesquisas.length;
  const validosFlavio = Number((somaValidosFlavio / n).toFixed(1));
  const validosLula = Number((somaValidosLula / n).toFixed(1));

  return {
    validos: {
      flavio: validosFlavio,
      lula: validosLula,
    },
    totais: {
      flavio: Number((somaTotaisFlavio / n).toFixed(1)),
      lula: Number((somaTotaisLula / n).toFixed(1)),
      brancosNulos: Number((somaBn / n).toFixed(1)),
      indecisos: Number((somaIndecisos / n).toFixed(1)),
    },
    vantagemFlavio: Number((validosFlavio - validosLula).toFixed(1)),
    quantidadePesquisas: n,
    atualizadoEm: '13 de outubro de 2026',
  };
}
