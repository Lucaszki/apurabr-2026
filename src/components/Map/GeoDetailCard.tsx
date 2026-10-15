/**
 * @file GeoDetailCard.tsx
 * @description Painel lateral editorial que detalha as estatísticas eleitorais do nível geográfico
 * selecionado (Brasil Nacional, Estado UF, Mesorregião ou Município específico).
 */

import React from 'react';
import { ResumoNacionalBrasil, UfDataset, MunicipioData } from '../../types/dataset';
import {
  getVencedorUf,
  getDadosMesorregiao,
  getCandidatosDoCargo,
  getCorCandidato,
  CORES_PARTIDOS,
  NOMES_UFS,
} from '../../services/electionDatasetService';
import { formatters } from '../../services/electionApi';
import { CandidatePhoto } from '../CandidatePhoto';
import {
  MapPin,
  TrendingUp,
  Users,
  CheckCircle2,
  Trophy,
  ArrowRight,
  X,
  PieChart,
  Vote,
  Compass,
  Info,
} from 'lucide-react';

interface GeoDetailCardProps {
  resumoNacional: ResumoNacionalBrasil | null;
  turno: number;
  cargo: 'pres' | 'gov' | 'sen';
  selectedUf: string | null;
  selectedMesoId: number | null;
  selectedMunicipio: MunicipioData | null;
  ufData: UfDataset | null;
  onClearSelection: () => void;
  onSelectMunicipio: (mun: MunicipioData | null) => void;
  onSelectMesoId: (mesoId: number | null) => void;
}

export const GeoDetailCard: React.FC<GeoDetailCardProps> = ({
  resumoNacional,
  turno,
  cargo,
  selectedUf,
  selectedMesoId,
  selectedMunicipio,
  ufData,
  onClearSelection,
  onSelectMunicipio,
  onSelectMesoId,
}) => {
  // 1. Cenário: MUNICÍPIO SELECIONADO
  if (selectedMunicipio && ufData) {
    const cData = selectedMunicipio[cargo];
    const ordemCands = ufData.ordem[cargo];
    const candsResumo = getCandidatosDoCargo(resumoNacional, cargo, selectedUf);

    // Mapeia os candidatos com votos no município
    const listaCandidatos = ordemCands
      .map((num, idx) => {
        const votos = cData?.v[idx] || 0;
        const candOficial = candsResumo.find((c) => c.n === num);
        const cor = getCorCandidato(num, candOficial?.sg);
        const pct = cData && cData.vv > 0 ? (votos / cData.vv) * 100 : 0;
        return {
          numero: num,
          nome: candOficial?.nmu || candOficial?.nm || `Candidato ${num}`,
          partido: candOficial?.sg || '',
          partidoNome: candOficial?.pn || '',
          vice: candOficial?.vice,
          cor,
          votos,
          pct,
        };
      })
      .sort((a, b) => b.votos - a.votos);

    const lider = listaCandidatos[0];
    const nomeMeso =
      selectedMunicipio.meso && ufData.mesorregioes[String(selectedMunicipio.meso)]
        ? ufData.mesorregioes[String(selectedMunicipio.meso)]
        : null;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Cabeçalho do Município */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-800">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {selectedMunicipio.n}
              </h3>
              {selectedMunicipio.c === 1 && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">
                  Capital
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {NOMES_UFS[selectedUf?.toLowerCase() || '']} ({selectedUf?.toUpperCase()})
              {nomeMeso && ` · ${nomeMeso}`}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectMunicipio(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Fechar detalhes da cidade"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Destaque do Líder */}
        {lider && (
          <div
            className="rounded-xl p-3 border flex items-center justify-between"
            style={{
              backgroundColor: `${lider.cor}10`,
              borderColor: `${lider.cor}30`,
            }}
          >
            <div className="flex items-center gap-3">
              <CandidatePhoto
                nome={lider.nome}
                numero={lider.numero}
                cargo={cargo}
                uf={selectedUf}
                corHex={lider.cor}
                partido={lider.partido}
                size="sm"
                aspectRatio="portrait"
                showNumberBadge
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Mais votado na cidade
                </span>
                <strong className="text-sm font-bold text-slate-900">
                  {lider.nome}{' '}
                  <span className="text-xs font-semibold text-slate-500">({lider.partido})</span>
                </strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold tabular-nums block" style={{ color: lider.cor }}>
                {formatters.percent(lider.pct)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium tabular-nums">
                {formatters.number(lider.votos)} votos
              </span>
            </div>
          </div>
        )}

        {/* Resumo de Participação */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Eleitorado</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {formatters.number(selectedMunicipio.e || 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Comparecimento</span>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">
              {formatters.number(selectedMunicipio.cp || 0)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Abstenção</span>
            <span className="text-xs font-bold text-rose-600 tabular-nums">
              {formatters.number(selectedMunicipio.a || 0)}
            </span>
          </div>
        </div>

        {/* Lista de Votação por Candidato */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Votação apurada na cidade
          </span>
          {listaCandidatos.map((cand, idx) => (
            <div key={cand.numero} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-400 font-bold tabular-nums text-[11px] w-4">
                    {idx + 1}º
                  </span>
                  <CandidatePhoto
                    nome={cand.nome}
                    numero={cand.numero}
                    cargo={cargo}
                    uf={selectedUf}
                    corHex={cand.cor}
                    partido={cand.partido}
                    size="xs"
                    aspectRatio="circle"
                  />
                  <span className="font-bold text-slate-800 truncate">{cand.nome}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ({cand.partido})
                  </span>
                </div>
                <div className="text-right shrink-0 tabular-nums font-bold text-slate-900">
                  {formatters.percent(cand.pct)}
                  <span className="text-[10px] text-slate-400 font-normal ml-1">
                    ({formatters.number(cand.votos)})
                  </span>
                </div>
              </div>

              {/* Barra de Progresso */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, cand.pct))}%`,
                    backgroundColor: cand.cor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. Cenário: MESORREGIÃO SELECIONADA
  if (selectedMesoId && ufData) {
    const dadosMeso = getDadosMesorregiao(ufData, selectedMesoId, cargo);
    const candsResumo = getCandidatosDoCargo(resumoNacional, cargo, selectedUf);
    const ordemCands = ufData.ordem[cargo];

    if (!dadosMeso) return null;

    const listaCandidatos = ordemCands
      .map((num, idx) => {
        const votos = dadosMeso.votosPorCandidato[idx] || 0;
        const candOficial = candsResumo.find((c) => c.n === num);
        const cor = getCorCandidato(num, candOficial?.sg);
        const pct = dadosMeso.votosValidos > 0 ? (votos / dadosMeso.votosValidos) * 100 : 0;
        return {
          numero: num,
          nome: candOficial?.nmu || candOficial?.nm || `Candidato ${num}`,
          partido: candOficial?.sg || '',
          partidoNome: candOficial?.pn || '',
          vice: candOficial?.vice,
          cor,
          votos,
          pct,
        };
      })
      .sort((a, b) => b.votos - a.votos);

    const lider = listaCandidatos[0];

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Cabeçalho da Mesorregião */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-800">
                <Compass className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {dadosMeso.nome}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Região com {dadosMeso.totalMunicipios} municípios ·{' '}
              {NOMES_UFS[selectedUf?.toLowerCase() || '']}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectMesoId(null)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Fechar detalhes da região"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Destaque do Líder da Região */}
        {lider && (
          <div
            className="rounded-xl p-3 border flex items-center justify-between"
            style={{
              backgroundColor: `${lider.cor}10`,
              borderColor: `${lider.cor}30`,
            }}
          >
            <div className="flex items-center gap-3">
              <CandidatePhoto
                nome={lider.nome}
                numero={lider.numero}
                cargo={cargo}
                uf={selectedUf}
                corHex={lider.cor}
                partido={lider.partido}
                size="sm"
                aspectRatio="portrait"
                showNumberBadge
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Vencedor na região
                </span>
                <strong className="text-sm font-bold text-slate-900">
                  {lider.nome}{' '}
                  <span className="text-xs font-semibold text-slate-500">({lider.partido})</span>
                </strong>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xl font-extrabold tabular-nums block" style={{ color: lider.cor }}>
                {formatters.percent(lider.pct)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium tabular-nums">
                {formatters.number(lider.votos)} votos
              </span>
            </div>
          </div>
        )}

        {/* Resumo da Região */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Eleitorado</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {formatters.number(dadosMeso.eleitorado)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Comparecimento</span>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">
              {formatters.number(dadosMeso.comparecimento)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cidades</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {dadosMeso.totalMunicipios}
            </span>
          </div>
        </div>

        {/* Votação por Candidato */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Votação total na região
          </span>
          {listaCandidatos.map((cand, idx) => (
            <div key={cand.numero} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-400 font-bold tabular-nums text-[11px] w-4">
                    {idx + 1}º
                  </span>
                  <CandidatePhoto
                    nome={cand.nome}
                    numero={cand.numero}
                    cargo={cargo}
                    uf={selectedUf}
                    corHex={cand.cor}
                    partido={cand.partido}
                    size="xs"
                    aspectRatio="circle"
                  />
                  <span className="font-bold text-slate-800 truncate">{cand.nome}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    ({cand.partido})
                  </span>
                </div>
                <div className="text-right shrink-0 tabular-nums font-bold text-slate-900">
                  {formatters.percent(cand.pct)}
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(100, Math.max(0, cand.pct))}%`,
                    backgroundColor: cand.cor,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Cidades da Região */}
        <div className="pt-2 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Cidades desta região (clique para abrir):
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
            {dadosMeso.municipios.slice(0, 30).map((m) => (
              <button
                key={m.i}
                type="button"
                onClick={() => onSelectMunicipio(m)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 hover:text-slate-900 px-2 py-1 text-[11px] font-medium text-slate-700 transition-colors cursor-pointer"
              >
                {m.n}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // 3. Cenário: ESTADO (UF) SELECIONADO
  if (selectedUf && resumoNacional) {
    const dadosUf = getVencedorUf(resumoNacional, selectedUf, cargo);
    if (!dadosUf) return null;

    const corVencedor = getCorCandidato(dadosUf.vencedor.n, dadosUf.vencedor.sg);

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
        {/* Cabeçalho do Estado */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-slate-800">
                <MapPin className="h-3.5 w-3.5" />
              </span>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                {dadosUf.nome}
              </h3>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-extrabold text-slate-700">
                {selectedUf.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {dadosUf.municipiosCount} municípios · Totalização: {formatters.percent(dadosUf.secoesTotalizadasPct)}
            </p>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Voltar ao mapa do Brasil"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Destaque do Vencedor Estadual */}
        {dadosUf.vencedor && (
          <div
            className="rounded-xl p-3 border flex items-center justify-between"
            style={{
              backgroundColor: `${corVencedor}10`,
              borderColor: `${corVencedor}30`,
            }}
          >
            <div className="flex items-center gap-3">
              <CandidatePhoto
                nome={dadosUf.vencedor.nmu}
                numero={dadosUf.vencedor.n}
                sq={dadosUf.vencedor.sq}
                cargo={cargo}
                uf={selectedUf}
                corHex={corVencedor}
                partido={dadosUf.vencedor.sg}
                size="sm"
                aspectRatio="portrait"
                showNumberBadge
              />
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  {cargo === 'pres' ? 'Vencedor no estado' : cargo === 'gov' ? 'Líder para Governador' : 'Líder para Senador'}
                </span>
                <strong className="text-sm font-bold text-slate-900">
                  {dadosUf.vencedor.nmu}{' '}
                  <span className="text-xs font-semibold text-slate-500">
                    ({dadosUf.vencedor.sg})
                  </span>
                </strong>
              </div>
            </div>

            <div className="text-right">
              <span
                className="text-xl font-extrabold tabular-nums block"
                style={{ color: corVencedor }}
              >
                {formatters.percent(dadosUf.pctVencedor)}
              </span>
              <span className="text-[11px] text-slate-500 font-medium tabular-nums">
                +{formatters.percent(dadosUf.margem)} sobre 2º
              </span>
            </div>
          </div>
        )}

        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-100 text-center">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Eleitores</span>
            <span className="text-xs font-bold text-slate-800 tabular-nums">
              {formatters.number(dadosUf.totais.te)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Comparecimento</span>
            <span className="text-xs font-bold text-emerald-700 tabular-nums">
              {formatters.number(dadosUf.totais.c)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Abstenção</span>
            <span className="text-xs font-bold text-rose-600 tabular-nums">
              {formatters.number(dadosUf.totais.a)}
            </span>
          </div>
        </div>

        {/* Votação por Candidato no Estado */}
        <div className="space-y-2.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Resultado oficial no estado
          </span>
          {dadosUf.candidatos
            .sort((a, b) => b.votosUf - a.votosUf)
            .map((cand, idx) => {
              const corCand = getCorCandidato(cand.n, cand.sg);
              return (
                <div key={cand.n} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 font-bold tabular-nums text-[11px] w-4">
                        {idx + 1}º
                      </span>
                      <CandidatePhoto
                        nome={cand.nmu}
                        numero={cand.n}
                        sq={cand.sq}
                        cargo={cargo}
                        uf={selectedUf}
                        corHex={corCand}
                        partido={cand.sg}
                        size="xs"
                        aspectRatio="circle"
                      />
                      <span className="font-bold text-slate-800 truncate">{cand.nmu}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">
                        ({cand.sg})
                      </span>
                    </div>
                    <div className="text-right shrink-0 tabular-nums font-bold text-slate-900">
                      {formatters.percent(cand.pctUf)}
                      <span className="text-[10px] text-slate-400 font-normal ml-1">
                        ({formatters.number(cand.votosUf)})
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(0, cand.pctUf))}%`,
                        backgroundColor: corCand,
                      }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Mesorregiões do Estado */}
        {ufData && Object.keys(ufData.mesorregioes).length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">
              Regiões do estado (clique para isolar):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {Object.entries(ufData.mesorregioes).map(([id, nome]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectMesoId(Number(id))}
                  className="rounded-lg bg-slate-100 hover:bg-amber-100 hover:text-amber-900 px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  {nome}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // 4. Cenário: BRASIL NACIONAL (Nenhum selecionado)
  if (!resumoNacional) return null;

  const liderNacional = resumoNacional.pres.cands[0];
  const segundoNacional = resumoNacional.pres.cands[1];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <div>
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
          Panorama Nacional
        </span>
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Eleições Gerais 2026 · Brasil
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {turno === 1 ? '1º Turno (Oficial Concluído)' : '2º Turno (Disputa Decisiva)'} · 27 Estados (UFs)
        </p>
      </div>

      {/* Destaque dos 2 Classificados para o 2º Turno */}
      <div className="space-y-2">
        {/* 1º Lugar */}
        {liderNacional && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CandidatePhoto
                nome={liderNacional.nmu}
                numero={liderNacional.n}
                sq={liderNacional.sq}
                cargo="pres"
                corHex="#1e40af"
                partido={liderNacional.sg}
                size="sm"
                aspectRatio="portrait"
                showNumberBadge
              />
              <div>
                <strong className="text-sm font-bold text-slate-900 block leading-tight">
                  {liderNacional.nmu}{' '}
                  <span className="text-xs font-semibold text-blue-700">({liderNacional.sg})</span>
                </strong>
                <span className="text-[11px] text-slate-500 font-medium">
                  {formatters.number(liderNacional.v)} votos
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums block">
                {formatters.percent(liderNacional.p)}
              </span>
              <span className="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                No 2º Turno
              </span>
            </div>
          </div>
        )}

        {/* 2º Lugar */}
        {segundoNacional && (
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CandidatePhoto
                nome={segundoNacional.nmu}
                numero={segundoNacional.n}
                sq={segundoNacional.sq}
                cargo="pres"
                corHex="#dc2626"
                partido={segundoNacional.sg}
                size="sm"
                aspectRatio="portrait"
                showNumberBadge
              />
              <div>
                <strong className="text-sm font-bold text-slate-900 block leading-tight">
                  {segundoNacional.nmu}{' '}
                  <span className="text-xs font-semibold text-red-700">({segundoNacional.sg})</span>
                </strong>
                <span className="text-[11px] text-slate-500 font-medium">
                  {formatters.number(segundoNacional.v)} votos
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-extrabold text-slate-900 tabular-nums block">
                {formatters.percent(segundoNacional.p)}
              </span>
              <span className="text-[10px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                No 2º Turno
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas Globais do Brasil */}
      <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-100 text-xs">
        <div className="bg-slate-50 rounded-xl p-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Total de Eleitores</span>
          <span className="font-bold text-slate-800 tabular-nums">
            {formatters.number(resumoNacional.pres.tot.te)}
          </span>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Comparecimento</span>
          <span className="font-bold text-emerald-700 tabular-nums">
            {formatters.number(resumoNacional.pres.tot.c)} (78,92%)
          </span>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Votos Válidos</span>
          <span className="font-bold text-emerald-700 tabular-nums">
            {formatters.number(resumoNacional.pres.tot.vv)} (95,23%)
          </span>
        </div>
        <div className="bg-slate-50 rounded-xl p-2.5">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">Brancos e Nulos</span>
          <span className="font-bold text-slate-600 tabular-nums">
            {formatters.number(resumoNacional.pres.tot.vb + resumoNacional.pres.tot.vn)} (4,77%)
          </span>
        </div>
      </div>

      {/* Dica de Interatividade */}
      <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-xs text-slate-600 flex items-start gap-2">
        <Info className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed text-[11px]">
          Clique em qualquer estado no mapa para ver todas as cidades, ou use a barra de busca para localizar diretamente qualquer município.
        </p>
      </div>
    </div>
  );
};
