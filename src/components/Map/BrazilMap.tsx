/**
 * @file BrazilMap.tsx
 * @description Componente de Mapa Interativo em SVG com D3-geo para visualização das Eleições 2026.
 * Suporta navegação hierárquica completa: Brasil (UFs) -> Estado (Municípios/Mesorregiões) -> Município.
 */

import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3Geo from 'd3-geo';
import {
  carregarGeoBrasil,
  carregarGeoUf,
  carregarUfData,
  getVencedorUf,
  getDadosMesorregiao,
  getCandidatosDoCargo,
  getCorCandidato,
  CORES_PARTIDOS,
  NOMES_UFS,
  CODIGO_IBGE_UF,
} from '../../services/electionDatasetService';
import { ResumoNacionalBrasil, UfDataset, MunicipioData } from '../../types/dataset';
import { formatters } from '../../services/electionApi';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ArrowLeft,
  MapPin,
  TrendingUp,
  Users,
  CheckCircle2,
  ChevronRight,
  Info,
} from 'lucide-react';

interface BrazilMapProps {
  resumoNacional: ResumoNacionalBrasil | null;
  turno: number;
  cargo: 'pres' | 'gov' | 'sen';
  selectedUf: string | null;
  onSelectUf: (uf: string | null) => void;
  selectedMunicipio: MunicipioData | null;
  onSelectMunicipio: (mun: MunicipioData | null) => void;
  selectedMesoId: number | null;
  onSelectMesoId: (mesoId: number | null) => void;
  // Simulação de 2º turno opcional aplicada sobre o mapa
  simulacaoVotos?: { flavio: number; lula: number } | null;
}

export const BrazilMap: React.FC<BrazilMapProps> = ({
  resumoNacional,
  turno,
  cargo,
  selectedUf,
  onSelectUf,
  selectedMunicipio,
  onSelectMunicipio,
  selectedMesoId,
  onSelectMesoId,
  simulacaoVotos,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Estados dos GeoJSONs carregados
  const [geoBrasil, setGeoBrasil] = useState<any | null>(null);
  const [geoUfMun, setGeoUfMun] = useState<any | null>(null);
  const [geoUfMeso, setGeoUfMeso] = useState<any | null>(null);
  const [ufData, setUfData] = useState<UfDataset | null>(null);
  const [isLoadingUf, setIsLoadingUf] = useState<boolean>(false);

  // Modo de visualização dentro do estado: 'municipios' ou 'mesorregioes'
  const [camadaEstado, setCamadaEstado] = useState<'municipios' | 'mesorregioes'>('municipios');

  // Tooltip flutuante
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    x: number;
    y: number;
    titulo: string;
    subtitulo: string;
    vencedorNome?: string;
    vencedorPct?: number;
    vencedorCor?: string;
    votosValidos?: number;
  } | null>(null);

  // Zoom / Pan manual
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // 1. Carga inicial da malha do Brasil
  useEffect(() => {
    carregarGeoBrasil()
      .then((geo) => setGeoBrasil(geo))
      .catch((err) => console.error('Erro ao carregar GeoJSON Brasil:', err));
  }, []);

  // 2. Carga dos dados e malha quando um estado (UF) é selecionado
  useEffect(() => {
    if (!selectedUf) {
      setGeoUfMun(null);
      setGeoUfMeso(null);
      setUfData(null);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      return;
    }

    setIsLoadingUf(true);
    const ufLower = selectedUf.toLowerCase();

    Promise.all([
      carregarGeoUf(ufLower, 'mun').catch(() => null),
      carregarGeoUf(ufLower, 'meso').catch(() => null),
      carregarUfData(ufLower, turno).catch(() => null),
    ])
      .then(([geoMun, geoMeso, dataUf]) => {
        setGeoUfMun(geoMun);
        setGeoUfMeso(geoMeso);
        setUfData(dataUf);
        setZoomLevel(1);
        setPanOffset({ x: 0, y: 0 });
      })
      .finally(() => {
        setIsLoadingUf(false);
      });
  }, [selectedUf, turno]);

  // Dimensões do viewport SVG
  const width = 800;
  const height = 650;

  // 3. Projeção D3 calculada para enquadrar a malha atual
  // Usamos geoIdentity planar com reflexão de Y para coordenadas cartográficas do IBGE
  const { pathGenerator, projection } = useMemo(() => {
    const geoAtiva = selectedUf ? geoUfMun || geoUfMeso : geoBrasil;

    if (!geoAtiva || !geoAtiva.features?.length) {
      const p = d3Geo.geoIdentity().reflectY(true);
      return { projection: p, pathGenerator: d3Geo.geoPath().projection(p) };
    }

    const p = d3Geo.geoIdentity().reflectY(true);
    p.fitExtent(
      [
        [35, 35],
        [width - 35, height - 35],
      ],
      geoAtiva
    );

    return {
      projection: p,
      pathGenerator: d3Geo.geoPath().projection(p),
    };
  }, [selectedUf, geoBrasil, geoUfMun, geoUfMeso]);

  // Mapa de cores para cada feature (UF ou Município ou Mesorregião)
  const featuresRenderizadas = useMemo(() => {
    // A) Nível Nacional (Brasil por UF)
    if (!selectedUf) {
      if (!geoBrasil?.features) return [];

      return geoBrasil.features.map((feature: any) => {
        const codIbge = Number(feature.properties?.codarea);
        const siglaUf = CODIGO_IBGE_UF[codIbge]?.toLowerCase() || '';
        const dadosUf = resumoNacional && siglaUf ? getVencedorUf(resumoNacional, siglaUf, cargo) : null;

        let corFill = '#cbd5e1'; // slate-300 padrão
        if (dadosUf?.vencedor) {
          corFill = getCorCandidato(dadosUf.vencedor.n, dadosUf.vencedor.sg);
        }

        const centroid = pathGenerator.centroid(feature);
        return {
          id: siglaUf,
          nome: NOMES_UFS[siglaUf] || siglaUf.toUpperCase(),
          path: pathGenerator(feature) || '',
          corFill,
          dados: dadosUf,
          centroid,
          isUf: true,
        };
      });
    }

    // B) Nível Estadual: Mesorregiões
    if (camadaEstado === 'mesorregioes' && geoUfMeso?.features && ufData) {
      const candsResumo = getCandidatosDoCargo(resumoNacional, cargo, selectedUf);

      return geoUfMeso.features.map((feature: any) => {
        const mesoId = Number(feature.properties?.codarea);
        const dadosMeso = getDadosMesorregiao(ufData, mesoId, cargo);
        const isSelected = selectedMesoId === mesoId;
        const candVenc = candsResumo.find((c) => c.n === dadosMeso?.vencedorNumero);

        let corFill = '#e2e8f0';
        if (dadosMeso) {
          corFill = getCorCandidato(dadosMeso.vencedorNumero, candVenc?.sg);
        }

        return {
          id: `meso-${mesoId}`,
          mesoId,
          nome: dadosMeso?.nome || `Região ${mesoId}`,
          path: pathGenerator(feature) || '',
          corFill,
          dadosMeso,
          isSelected,
          isMeso: true,
        };
      });
    }

    // C) Nível Estadual: Municípios
    if (geoUfMun?.features && ufData) {
      const mapMunicipios = new Map<number, MunicipioData>();
      ufData.mun.forEach((m) => mapMunicipios.set(m.i, m));

      const ordemCands = ufData.ordem[cargo];
      const candsResumo = getCandidatosDoCargo(resumoNacional, cargo, selectedUf);

      return geoUfMun.features.map((feature: any) => {
        const ibgeId = Number(feature.properties?.codarea);
        const mun = mapMunicipios.get(ibgeId);
        const isSelected = selectedMunicipio?.i === ibgeId;
        const belongsToSelectedMeso = selectedMesoId && mun?.meso === selectedMesoId;

        let corFill = '#cbd5e1';
        let vencedorNumero = 0;
        let pctVencedor = 0;
        let candVencNome = '';

        const cData = mun?.[cargo];
        if (cData && cData.vv > 0) {
          let maxV = -1;
          let idxVenc = 0;
          cData.v.forEach((v, idx) => {
            if (v > maxV) {
              maxV = v;
              idxVenc = idx;
            }
          });
          vencedorNumero = ordemCands[idxVenc];
          pctVencedor = (maxV / cData.vv) * 100;
          const candVenc = candsResumo.find((c) => c.n === vencedorNumero);
          corFill = getCorCandidato(vencedorNumero, candVenc?.sg);
          candVencNome = candVenc ? `${candVenc.nmu} (${candVenc.sg})` : `Candidato ${vencedorNumero}`;
        }

        return {
          id: `mun-${ibgeId}`,
          ibgeId,
          nome: mun?.n || `Município ${ibgeId}`,
          path: pathGenerator(feature) || '',
          corFill,
          mun,
          isSelected,
          belongsToSelectedMeso,
          vencedorNumero,
          vencedorNome: candVencNome,
          pctVencedor,
          isMun: true,
        };
      });
    }

    return [];
  }, [
    selectedUf,
    geoBrasil,
    geoUfMun,
    geoUfMeso,
    ufData,
    resumoNacional,
    camadaEstado,
    cargo,
    selectedMesoId,
    selectedMunicipio,
    pathGenerator,
  ]);

  // Handlers de interação
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPanOffset({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.8, Math.min(4, Number((prev + delta).toFixed(2)))));
  };

  const handleReset = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    if (selectedUf) {
      onSelectUf(null);
      onSelectMunicipio(null);
      onSelectMesoId(null);
    }
  };

  return (
    <div className="relative flex flex-col w-full h-[640px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none">
      {/* 1. Barra Superior Editorial de Controles e Navegação */}
      <div className="absolute top-3 inset-x-3 z-20 flex items-center justify-between pointer-events-none">
        {/* Breadcrumb / Indicador de Navegação */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => {
              onSelectUf(null);
              onSelectMunicipio(null);
              onSelectMesoId(null);
            }}
            className={`text-xs font-bold tracking-wide transition-colors ${
              !selectedUf ? 'text-blue-400 font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            BRASIL
          </button>

          {selectedUf && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <button
                type="button"
                onClick={() => {
                  onSelectMunicipio(null);
                  onSelectMesoId(null);
                }}
                className={`text-xs font-bold uppercase transition-colors ${
                  !selectedMunicipio && !selectedMesoId
                    ? 'text-blue-400 font-extrabold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {NOMES_UFS[selectedUf.toLowerCase()] || selectedUf.toUpperCase()}
              </button>
            </>
          )}

          {selectedMesoId && ufData && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-bold text-amber-400">
                {ufData.mesorregioes[String(selectedMesoId)] || `Região ${selectedMesoId}`}
              </span>
            </>
          )}

          {selectedMunicipio && (
            <>
              <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
              <span className="text-xs font-bold text-emerald-400 truncate max-w-[150px]">
                {selectedMunicipio.n}
              </span>
            </>
          )}
        </div>

        {/* Controles de Camada e Ferramentas */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Alternador de Mesorregião / Município (quando dentro do estado) */}
          {selectedUf && (
            <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg text-xs">
              <button
                type="button"
                onClick={() => setCamadaEstado('municipios')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  camadaEstado === 'municipios'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Cidades
              </button>
              <button
                type="button"
                onClick={() => setCamadaEstado('mesorregioes')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                  camadaEstado === 'mesorregioes'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Regiões
              </button>
            </div>
          )}

          {/* Botões de Zoom */}
          <div className="flex bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg text-slate-300">
            <button
              type="button"
              onClick={() => handleZoom(0.3)}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Aproximar"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.3)}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Afastar"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Redefinir visualização"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Área SVG do Mapa com Transform para Zoom e Pan */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing relative flex items-center justify-center overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <g
            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
            transform-origin={`${width / 2} ${height / 2}`}
            style={{ transition: isDragging ? 'none' : 'transform 0.25s ease-out' }}
          >
            {featuresRenderizadas.map((feat: any) => {
              const isHighlighted =
                feat.isSelected ||
                feat.belongsToSelectedMeso ||
                (selectedUf && feat.id === selectedUf);

              return (
                <path
                  key={feat.id}
                  d={feat.path}
                  fill={feat.corFill}
                  fillOpacity={feat.isUf ? 0.92 : feat.isMeso ? 0.85 : 0.88}
                  stroke={isHighlighted ? '#f8fafc' : '#0f172a'}
                  strokeWidth={
                    isHighlighted ? (feat.isUf ? 2.5 : 2.0) : feat.isUf ? 1.0 : 0.4
                  }
                  strokeLinejoin="round"
                  className="transition-all duration-150 cursor-pointer hover:brightness-125 hover:stroke-white hover:stroke-[1.5]"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (feat.isUf) {
                      onSelectUf(feat.id);
                    } else if (feat.isMeso) {
                      onSelectMesoId(feat.mesoId);
                    } else if (feat.isMun && feat.mun) {
                      onSelectMunicipio(feat.mun);
                    }
                  }}
                  onMouseEnter={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    const clientX = e.clientX - (rect?.left || 0);
                    const clientY = e.clientY - (rect?.top || 0);

                    if (feat.isUf && feat.dados) {
                      setTooltip({
                        visible: true,
                        x: clientX,
                        y: clientY,
                        titulo: feat.nome,
                        subtitulo: `Eleitorado: ${formatters.number(feat.dados.totais.te)}`,
                        vencedorNome: `${feat.dados.vencedor.nmu} (${feat.dados.vencedor.sg})`,
                        vencedorPct: feat.dados.pctVencedor,
                        vencedorCor: feat.corFill,
                        votosValidos: feat.dados.totais.vv,
                      });
                    } else if (feat.isMeso && feat.dadosMeso) {
                      const candsResumo = getCandidatosDoCargo(resumoNacional, cargo, selectedUf);
                      const candVenc = candsResumo.find((c) => c.n === feat.dadosMeso.vencedorNumero);
                      const nomeVenc = candVenc ? `${candVenc.nmu} (${candVenc.sg})` : `Candidato ${feat.dadosMeso.vencedorNumero}`;
                      setTooltip({
                        visible: true,
                        x: clientX,
                        y: clientY,
                        titulo: feat.nome,
                        subtitulo: `${feat.dadosMeso.totalMunicipios} cidades · ${formatters.number(feat.dadosMeso.eleitorado)} eleitores`,
                        vencedorNome: nomeVenc,
                        vencedorPct: feat.dadosMeso.pctVencedor,
                        vencedorCor: feat.corFill,
                        votosValidos: feat.dadosMeso.votosValidos,
                      });
                    } else if (feat.isMun && feat.mun) {
                      const cData = feat.mun[cargo];
                      setTooltip({
                        visible: true,
                        x: clientX,
                        y: clientY,
                        titulo: feat.nome,
                        subtitulo: `Eleitores: ${formatters.number(feat.mun.e || 0)}`,
                        vencedorNome: feat.vencedorNome || 'Sem dados',
                        vencedorPct: feat.pctVencedor,
                        vencedorCor: feat.corFill,
                        votosValidos: cData?.vv,
                      });
                    }
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}

            {/* Rótulos das Siglas das UFs no mapa do Brasil */}
            {!selectedUf &&
              featuresRenderizadas.map((feat: any) => {
                if (!feat.isUf || !feat.centroid || isNaN(feat.centroid[0])) return null;
                return (
                  <text
                    key={`lbl-${feat.id}`}
                    x={feat.centroid[0]}
                    y={feat.centroid[1]}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="fill-white font-black text-[10px] pointer-events-none select-none tracking-wider opacity-95"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 5px rgba(0,0,0,0.9)' }}
                  >
                    {feat.id.toUpperCase()}
                  </text>
                );
              })}
          </g>
        </svg>

        {/* Loading Overlay suave ao carregar município de estado */}
        {isLoadingUf && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-10">
            <div className="flex items-center gap-3 bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-700 shadow-xl text-xs text-white">
              <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
              <span>Carregando municípios de {NOMES_UFS[selectedUf?.toLowerCase() || '']}…</span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Tooltip Flutuante */}
      {tooltip && tooltip.visible && (
        <div
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs text-white min-w-[200px] pointer-events-none">
            <div className="font-extrabold text-sm tracking-tight text-white mb-0.5">
              {tooltip.titulo}
            </div>
            <div className="text-[11px] text-slate-400 mb-2">{tooltip.subtitulo}</div>

            {tooltip.vencedorNome && (
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: tooltip.vencedorCor }}
                  />
                  <span className="font-semibold text-slate-200">{tooltip.vencedorNome}</span>
                </div>
                <span className="font-bold text-white tabular-nums">
                  {formatters.percent(tooltip.vencedorPct || 0)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. Barra Inferior com Legenda de Cores dos Candidatos */}
      <div className="absolute bottom-3 inset-x-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-slate-800 shadow-lg text-xs">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Liderança:
          </span>

          {/* Flávio Bolsonaro (PL) */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-700 border border-blue-400/40" />
            <span className="font-bold text-white">Flávio Bolsonaro</span>
            <span className="text-[10px] text-blue-400 font-semibold">(PL)</span>
          </div>

          {/* Lula (PT) */}
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-600 border border-red-400/40" />
            <span className="font-bold text-white">Lula</span>
            <span className="text-[10px] text-red-400 font-semibold">(PT)</span>
          </div>

          {/* Governadores / Outros Partidos */}
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            <span>PSD</span>
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            <span>Avante</span>
            <span className="h-2 w-2 rounded-full bg-blue-900" />
            <span>Republicanos</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          Clique no estado ou cidade para detalhar
        </div>
      </div>
    </div>
  );
};
