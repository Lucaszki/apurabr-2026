/**
 * @file dataset.ts
 * @description Interfaces dos dados processados das eleições 2026 (TSE + IBGE)
 */

export interface TotaisEleitorais {
  ts: number;  // total de seções
  st: number;  // seções totalizadas
  pst: number; // % seções totalizadas
  te: number;  // total eleitores
  c: number;   // comparecimento
  a: number;   // abstenção
  tv: number;  // total votos
  vv: number;  // votos válidos
  vb: number;  // votos brancos
  vn: number;  // votos nulos
  vl?: number; // votos de legenda (proporcionais)
}

export interface CandidatoResumo {
  n: number;
  sq: string;
  nm: string;
  nmu: string;
  sg: string;
  pn: string;
  col?: string;
  com?: string;
  vice?: string;
  sup?: string[];
  v: number;
  p: number;
  e: boolean;
  st: string;
  nasc?: string;
  fotoUrl?: string;
}

export interface CargoResumo {
  nv: number;
  dt: string;
  final: boolean;
  tot: TotaisEleitorais;
  cands: CandidatoResumo[];
}

export interface ResumoNacionalBrasil {
  meta: {
    turno: number;
    gerado: string;
    fonte: string;
    eleicoes: { federal: string; estadual: string };
    ufsEstaduais: string[];
  };
  pres: CargoResumo & {
    ufs: Record<string, {
      tot: TotaisEleitorais;
      dt: string;
      v: number[]; // votos na mesma ordem de cands
      mun?: number;
    }>;
  };
  gov: Record<string, CargoResumo>;
  sen: Record<string, CargoResumo>;
}

export interface MunicipioData {
  i: number;      // IBGE id (7 dígitos)
  t: string;      // TSE cd (5 dígitos)
  n: string;      // Nome do município
  c: number;      // É capital? 1 ou 0
  meso?: number | null; // ID da mesorregião
  micro?: number | null; // ID da microrregião
  ri?: number | null;    // Região geográfica imediata
  e?: number;     // Eleitorado
  cp?: number;    // Comparecimento
  a?: number;     // Abstenção
  ts?: number;    // Total seções
  st?: number;    // Seções totalizadas
  pres?: {
    vv: number;
    vb: number;
    vn: number;
    v: number[]; // Votos de cada candidato (na ordem de `ordem.pres`)
  };
  gov?: {
    vv: number;
    vb: number;
    vn: number;
    v: number[];
  };
  sen?: {
    vv: number;
    vb: number;
    vn: number;
    v: number[];
  };
}

export interface UfDataset {
  uf: string;
  turno: number;
  ordem: {
    pres: number[]; // números dos candidatos a presidente
    gov: number[];  // números dos candidatos a governador
    sen: number[];  // números dos candidatos a senador
  };
  mesorregioes: Record<string, string>; // id -> nome da mesorregião
  microrregioes: Record<string, string>;
  regImediatas: Record<string, string>;
  mun: MunicipioData[];
}

export type IndiceMunicipioItem = [
  number, // ibge
  string, // nome
  string, // uf (sigla minúscula)
  number, // capital (1 ou 0)
  number  // eleitores
];
