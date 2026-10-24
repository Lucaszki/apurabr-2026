/**
 * @file pesquisas2026.ts
 * @description Base consolidada de pesquisas de intenção de voto do 2º Turno das Eleições 2026,
 * parâmetros demográficos regionais, transferências de voto do 1º turno e cenários de simulação.
 */

import { PesquisaPresidente, PesquisaGovernador, TransferenciaVotoCandidato } from '../types/pesquisas';

/**
 * Pesquisas Nacionais registradas no TSE para Presidente (2º Turno)
 * Atualizadas ativamente com ordenação cronológica decrescente.
 */
export const PESQUISAS_PRESIDENTE_2T: PesquisaPresidente[] = [
  {
    id: 'verita-2026-10-23',
    instituto: 'Instituto Veritá',
    contratante: 'Iniciativa Própria / Instituto Veritá Ltda.',
    divulgacao: '2026-10-23',
    campo: '18 a 22 de outubro de 2026',
    amostra: 15554,
    margem: 1.0,
    registroTse: 'BR-06070/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 50.2,
      lula: 47.5,
      brancosNulos: 1.4,
      indecisos: 0.9,
    },
    validos: {
      flavio: 51.3,
      lula: 48.7,
    },
    rejeicao: {
      flavio: 44.8,
      lula: 46.9,
    },
    regioes: {
      sudeste: { flavio: 53.8, lula: 46.2 },
      sul: { flavio: 63.1, lula: 36.9 },
      nordeste: { flavio: 33.2, lula: 66.8 },
      centroOeste: { flavio: 61.8, lula: 38.2 },
      norte: { flavio: 52.7, lula: 47.3 },
    },
    destaques: [
      'Maior levantamento de todas as pesquisas registradas no TSE: 15.554 eleitores em todas as 27 UFs',
      'Flávio lidera numericamente com 51,3% contra 48,7% de Lula nos votos válidos (diferença de 2,6 pp)',
      'Baixo índice de votos brancos e nulos (1,4%) e indecisos (0,9%), apontando alta cristalização do voto',
    ],
    fonteUrl: 'https://www.institutoverita.com.br/pesquisa-eleicoes-2026-segundo-turno-presidente',
  },
  {
    id: 'realtime-2026-10-23',
    instituto: 'RealTime Big Data',
    contratante: 'Record TV / Três Poderes',
    divulgacao: '2026-10-23',
    campo: '21 e 22 de outubro de 2026',
    amostra: 3000,
    margem: 2.0,
    registroTse: 'BR-06012/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 49.0,
      lula: 45.0,
      brancosNulos: 4.0,
      indecisos: 2.0,
    },
    validos: {
      flavio: 52.0,
      lula: 48.0,
    },
    rejeicao: {
      flavio: 45.0,
      lula: 47.0,
    },
    regioes: {
      sudeste: { flavio: 54.0, lula: 46.0 },
      sul: { flavio: 61.0, lula: 39.0 },
      nordeste: { flavio: 34.0, lula: 66.0 },
      centroOeste: { flavio: 60.0, lula: 40.0 },
      norte: { flavio: 52.0, lula: 48.0 },
    },
    destaques: [
      'Levantamento RealTime Big Data divulgado na reta final em 23/10',
      'Flávio atinge 52% dos votos válidos contra 48% de Lula',
      'Acirramento nos maiores colégios eleitorais do Sudeste e Sul',
    ],
    fonteUrl: 'https://recordtv.r7.com/eleicoes-2026/pesquisa-realtime-big-data-segundo-turno',
  },
  {
    id: 'datafolha-2026-10-22',
    instituto: 'Datafolha',
    contratante: 'Folha de S.Paulo / TV Globo',
    divulgacao: '2026-10-22',
    campo: '20 a 22 de outubro de 2026',
    amostra: 3520,
    margem: 2.0,
    registroTse: 'BR-05991/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 47.0,
      lula: 46.0,
      brancosNulos: 5.0,
      indecisos: 2.0,
    },
    validos: {
      flavio: 50.0,
      lula: 50.0,
    },
    rejeicao: {
      flavio: 46.0,
      lula: 46.0,
    },
    regioes: {
      sudeste: { flavio: 52.5, lula: 47.5 },
      sul: { flavio: 59.0, lula: 41.0 },
      nordeste: { flavio: 36.5, lula: 63.5 },
      centroOeste: { flavio: 58.0, lula: 42.0 },
      norte: { flavio: 51.0, lula: 49.0 },
    },
    destaques: [
      'Empate técnico absoluto de 50,0% a 50,0% nos votos válidos',
      'Igualdade também no índice de rejeição declarada (46% para ambos)',
      'Máxima polarização e acirramento na véspera do encerramento da campanha',
    ],
    fonteUrl: 'https://g1.globo.com/politica/eleicoes/2026/pesquisa-datafolha-22-outubro-segundo-turno.ghtml',
  },
  {
    id: 'datafolha-2026-10-19',
    instituto: 'Datafolha',
    contratante: 'Folha de S.Paulo / TV Globo',
    divulgacao: '2026-10-19',
    campo: '17 a 19 de outubro de 2026',
    amostra: 3600,
    margem: 2.0,
    registroTse: 'BR-09988/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 48.0,
      lula: 46.5,
      brancosNulos: 4.5,
      indecisos: 1.0,
    },
    validos: {
      flavio: 50.8,
      lula: 49.2,
    },
    rejeicao: {
      flavio: 45.5,
      lula: 46.5,
    },
    regioes: {
      sudeste: { flavio: 53.0, lula: 47.0 },
      sul: { flavio: 60.5, lula: 39.5 },
      nordeste: { flavio: 35.0, lula: 65.0 },
      centroOeste: { flavio: 59.5, lula: 40.5 },
      norte: { flavio: 51.5, lula: 48.5 },
    },
    destaques: [
      'Levantamento Datafolha a 6 dias da votação do 2º Turno',
      'Flávio e Lula mantêm empate técnico rigoroso dentro da margem de erro (2,0 pp)',
      'Diferença nos votos válidos oscila para 1,6 pp com acirramento nas capitais',
    ],
    fonteUrl: 'https://g1.globo.com/politica/eleicoes/2026/pesquisa-datafolha-segundo-turno.ghtml',
  },
  {
    id: 'quaest-2026-10-19',
    instituto: 'Quaest / Genial',
    contratante: 'Genial Investimentos Corretora de Câmbio e Valores Mobiliários S.A.',
    divulgacao: '2026-10-19',
    campo: '16 a 18 de outubro de 2026',
    amostra: 3200,
    margem: 2.0,
    registroTse: 'BR-09941/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 47.5,
      lula: 47.0,
      brancosNulos: 4.5,
      indecisos: 1.0,
    },
    validos: {
      flavio: 50.3,
      lula: 49.7,
    },
    rejeicao: {
      flavio: 46.2,
      lula: 46.0,
    },
    regioes: {
      sudeste: { flavio: 52.0, lula: 48.0 },
      sul: { flavio: 59.0, lula: 41.0 },
      nordeste: { flavio: 36.0, lula: 64.0 },
      centroOeste: { flavio: 58.5, lula: 41.5 },
      norte: { flavio: 51.0, lula: 49.0 },
    },
    destaques: [
      'Empate técnico absoluto na reta final: 50,3% x 49,7% nos votos válidos',
      'Avanço de Lula no Sudeste reduz a vantagem nacional para apenas 0,6 ponto percentual',
      'Índice de decisão consolidada atinge 94% dos eleitores',
    ],
    fonteUrl: 'https://oglobo.globo.com/politica/eleicoes-2026/pesquisa-quaest-segundo-turno-presidente',
  },
  {
    id: 'atlasintel-2026-10-19',
    instituto: 'AtlasIntel',
    contratante: 'AtlasIntel / Bloomberg',
    divulgacao: '2026-10-19',
    campo: '15 a 18 de outubro de 2026',
    amostra: 5000,
    margem: 1.0,
    registroTse: 'BR-09972/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 50.4,
      lula: 46.6,
      brancosNulos: 2.0,
      indecisos: 1.0,
    },
    validos: {
      flavio: 51.9,
      lula: 48.1,
    },
    rejeicao: {
      flavio: 46.8,
      lula: 47.6,
    },
    regioes: {
      sudeste: { flavio: 54.2, lula: 45.8 },
      sul: { flavio: 62.5, lula: 37.5 },
      nordeste: { flavio: 33.5, lula: 66.5 },
      centroOeste: { flavio: 61.0, lula: 39.0 },
      norte: { flavio: 53.0, lula: 47.0 },
    },
    destaques: [
      'Maior amostra nacional: 5.000 questionários com margem de 1 ponto percentual',
      'Flávio lidera numericamente com 51,9% contra 48,1% de Lula nos válidos',
      'Resistência maior de Lula no eleitorado feminino e de baixa renda',
    ],
    fonteUrl: 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-atlasintel-segundo-turno-presidente/',
  },
  {
    id: 'parana-2026-10-18',
    instituto: 'Paraná Pesquisas',
    contratante: 'Paraná Pesquisas / Gazeta',
    divulgacao: '2026-10-18',
    campo: '14 a 17 de outubro de 2026',
    amostra: 2800,
    margem: 2.2,
    registroTse: 'BR-09890/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 49.8,
      lula: 45.6,
      brancosNulos: 3.6,
      indecisos: 1.0,
    },
    validos: {
      flavio: 52.2,
      lula: 47.8,
    },
    rejeicao: {
      flavio: 45.2,
      lula: 47.5,
    },
    regioes: {
      sudeste: { flavio: 53.8, lula: 46.2 },
      sul: { flavio: 62.0, lula: 38.0 },
      nordeste: { flavio: 34.2, lula: 65.8 },
      centroOeste: { flavio: 60.5, lula: 39.5 },
      norte: { flavio: 52.5, lula: 47.5 },
    },
    destaques: [
      'Flávio mantém vantagem de 4,4 pp nos válidos (52,2% x 47,8%)',
      'Consolidação de votos no interior de São Paulo, Minas e Paraná',
    ],
    fonteUrl: 'https://www.paranapesquisas.com.br/eleicoes-2026-segundo-turno',
  },
  {
    id: 'datafolha-2026-10-14',
    instituto: 'Datafolha',
    contratante: 'Folha de S.Paulo / TV Globo',
    divulgacao: '2026-10-14',
    campo: '12 a 14 de outubro de 2026',
    amostra: 3240,
    margem: 2.0,
    registroTse: 'BR-09142/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 49.0,
      lula: 46.0,
      brancosNulos: 4.0,
      indecisos: 1.0,
    },
    validos: {
      flavio: 51.5,
      lula: 48.5,
    },
    rejeicao: {
      flavio: 45.0,
      lula: 47.0,
    },
    regioes: {
      sudeste: { flavio: 53.5, lula: 46.5 },
      sul: { flavio: 61.0, lula: 39.0 },
      nordeste: { flavio: 34.5, lula: 65.5 },
      centroOeste: { flavio: 60.5, lula: 39.5 },
      norte: { flavio: 52.0, lula: 48.0 },
    },
    destaques: [
      'Mais recente levantamento do Datafolha divulgado em 14/10',
      'Flávio mantém liderança numérica com 51,5% dos votos válidos na margem técnica',
      'Lula avança 1 pp no Sudeste com maior engajamento metropolitano',
    ],
    fonteUrl: 'https://g1.globo.com/politica/eleicoes/2026/pesquisa-datafolha-segundo-turno.ghtml',
  },
  {
    id: 'quaest-2026-10-14',
    instituto: 'Quaest / Genial',
    contratante: 'Genial Investimentos Corretora de Câmbio e Valores Mobiliários S.A.',
    divulgacao: '2026-10-14',
    campo: '11 a 13 de outubro de 2026',
    amostra: 3000,
    margem: 2.0,
    registroTse: 'BR-08734/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 48.0,
      lula: 46.5,
      brancosNulos: 4.5,
      indecisos: 1.0,
    },
    validos: {
      flavio: 50.8,
      lula: 49.2,
    },
    rejeicao: {
      flavio: 46.0,
      lula: 46.5,
    },
    regioes: {
      sudeste: { flavio: 52.5, lula: 47.5 },
      sul: { flavio: 59.5, lula: 40.5 },
      nordeste: { flavio: 35.5, lula: 64.5 },
      centroOeste: { flavio: 59.0, lula: 41.0 },
      norte: { flavio: 51.5, lula: 48.5 },
    },
    destaques: [
      'Empate técnico rigoroso: diferença de apenas 1,6 pp nos votos válidos',
      'Alta consolidação de voto com 92% dos eleitores se declarando totalmente decididos',
    ],
    fonteUrl: 'https://oglobo.globo.com/politica/eleicoes-2026/pesquisa-quaest-segundo-turno-presidente',
  },
  {
    id: 'atlasintel-2026-10-14',
    instituto: 'AtlasIntel',
    contratante: 'AtlasIntel / Bloomberg',
    divulgacao: '2026-10-14',
    campo: '10 a 13 de outubro de 2026',
    amostra: 4850,
    margem: 1.0,
    registroTse: 'BR-09852/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 50.8,
      lula: 46.1,
      brancosNulos: 2.0,
      indecisos: 1.1,
    },
    validos: {
      flavio: 52.4,
      lula: 47.6,
    },
    rejeicao: {
      flavio: 46.5,
      lula: 48.0,
    },
    regioes: {
      sudeste: { flavio: 54.8, lula: 45.2 },
      sul: { flavio: 63.0, lula: 37.0 },
      nordeste: { flavio: 33.0, lula: 67.0 },
      centroOeste: { flavio: 61.5, lula: 38.5 },
      norte: { flavio: 53.5, lula: 46.5 },
    },
    destaques: [
      'Maior amostra nacional: 4.850 questionários com margem reduzida de 1 pp',
      'Flávio abre 4,8 pontos percentuais de vantagem sobre Lula em votos válidos',
    ],
    fonteUrl: 'https://www.gazetadopovo.com.br/eleicoes/2026/pesquisa-atlasintel-segundo-turno-presidente/',
  },
  {
    id: 'parana-2026-10-14',
    instituto: 'Paraná Pesquisas',
    contratante: 'Paraná Pesquisas / Gazeta',
    divulgacao: '2026-10-14',
    campo: '10 a 13 de outubro de 2026',
    amostra: 2800,
    margem: 2.2,
    registroTse: 'BR-07521/2026',
    cenario: 'estimulada',
    totais: {
      flavio: 50.1,
      lula: 45.2,
      brancosNulos: 3.7,
      indecisos: 1.0,
    },
    validos: {
      flavio: 52.6,
      lula: 47.4,
    },
    rejeicao: {
      flavio: 44.8,
      lula: 47.9,
    },
    regioes: {
      sudeste: { flavio: 54.2, lula: 45.8 },
      sul: { flavio: 62.5, lula: 37.5 },
      nordeste: { flavio: 33.8, lula: 66.2 },
      centroOeste: { flavio: 61.0, lula: 39.0 },
      norte: { flavio: 53.0, lula: 47.0 },
    },
    destaques: [
      'Flávio atinge 52,6% dos válidos contra 47,4% de Lula',
      'Vantagem consolidada de 5,2 pp no levantamento da Paraná Pesquisas',
    ],
    fonteUrl: 'https://www.paranapesquisas.com.br/eleicoes-2026-segundo-turno',
  },
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
 * Retorna as pesquisas de governador ordenadas pela mais recente
 */
export function getPesquisasGovernadorOrdenadas(
  pesquisas: PesquisaGovernador[] = PESQUISAS_GOVERNADOR_2T
): PesquisaGovernador[] {
  return [...pesquisas].sort((a, b) => {
    return new Date(b.divulgacao).getTime() - new Date(a.divulgacao).getTime();
  });
}

/**
 * Retorna as pesquisas presidenciais ordenadas ativamente da mais recente para a mais antiga
 */
export function getPesquisasOrdenadas(
  pesquisas: PesquisaPresidente[] = PESQUISAS_PRESIDENTE_2T
): PesquisaPresidente[] {
  return [...pesquisas].sort((a, b) => {
    const dataDiff = new Date(b.divulgacao).getTime() - new Date(a.divulgacao).getTime();
    if (dataDiff !== 0) return dataDiff;
    return b.amostra - a.amostra;
  });
}

/**
 * Retorna dinamicamente a pesquisa registrada mais recente de todas
 */
export function getPesquisaMaisRecente(
  pesquisas: PesquisaPresidente[] = PESQUISAS_PRESIDENTE_2T
): PesquisaPresidente {
  const ordenadas = getPesquisasOrdenadas(pesquisas);
  return ordenadas[0];
}

/**
 * Média ponderada agregada das pesquisas nacionais (Tracker Eleitoral Dinâmico)
 * Pondera as pesquisas dando maior peso estatístico às mais recentes (decaimento temporal)
 * e ao tamanho da amostra amostral.
 */
export function calcularMediaAgregada(
  pesquisasCustom?: PesquisaPresidente[]
) {
  const ordenadas = getPesquisasOrdenadas(pesquisasCustom || PESQUISAS_PRESIDENTE_2T);
  if (!ordenadas.length) return null;

  const maisRecente = ordenadas[0];
  const refTime = new Date(maisRecente.divulgacao).getTime();

  let somaPesos = 0;
  let somaValidosFlavio = 0;
  let somaValidosLula = 0;
  let somaTotaisFlavio = 0;
  let somaTotaisLula = 0;
  let somaBn = 0;
  let somaIndecisos = 0;

  ordenadas.forEach((p) => {
    // Fator de recência: pesquisas mais recentes recebem peso significativamente maior
    const pollTime = new Date(p.divulgacao).getTime();
    const diffDays = Math.max(0, (refTime - pollTime) / (1000 * 60 * 60 * 24));
    const pesoRecencia = Math.max(0.4, 1 / (1 + diffDays * 0.35));
    // Fator de amostra: amostras maiores têm peso marginalmente maior
    const pesoAmostra = Math.sqrt(p.amostra / 2000);
    const pesoFinal = pesoRecencia * pesoAmostra;

    somaPesos += pesoFinal;
    somaValidosFlavio += p.validos.flavio * pesoFinal;
    somaValidosLula += p.validos.lula * pesoFinal;
    somaTotaisFlavio += p.totais.flavio * pesoFinal;
    somaTotaisLula += p.totais.lula * pesoFinal;
    somaBn += p.totais.brancosNulos * pesoFinal;
    somaIndecisos += p.totais.indecisos * pesoFinal;
  });

  const validosFlavio = Number((somaValidosFlavio / somaPesos).toFixed(1));
  const validosLula = Number((somaValidosLula / somaPesos).toFixed(1));

  // Formata a data mais recente amigavelmente
  const [ano, mes, dia] = maisRecente.divulgacao.split('-');
  const meses = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const dataFormatada = `${Number(dia)} de ${meses[Number(mes) - 1]} de ${ano}`;

  return {
    validos: {
      flavio: validosFlavio,
      lula: validosLula,
    },
    totais: {
      flavio: Number((somaTotaisFlavio / somaPesos).toFixed(1)),
      lula: Number((somaTotaisLula / somaPesos).toFixed(1)),
      brancosNulos: Number((somaBn / somaPesos).toFixed(1)),
      indecisos: Number((somaIndecisos / somaPesos).toFixed(1)),
    },
    vantagemFlavio: Number((validosFlavio - validosLula).toFixed(1)),
    quantidadePesquisas: ordenadas.length,
    atualizadoEm: dataFormatada,
    maisRecente,
  };
}
