/**
 * @file App.tsx
 * @description Aplicação Principal: Sistema Definitivo de Visualização e Apuração das Eleições 2026.
 * Integra mapa vetorial do Brasil com drilldown (Brasil -> Estado -> Mesorregião -> Município),
 * pesquisas de intenção de voto do 2º turno, simulador de cenários 50%+1 voto e apuração oficial TSE.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useElectionData } from './hooks/useElectionData';
import { ElectionHeader } from './components/ElectionHeader';
import { UrnasProgressBar } from './components/UrnasProgressBar';
import { CandidateList } from './components/CandidateList';
import { ElectionStatsOverview } from './components/ElectionStatsOverview';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { BrazilMap } from './components/Map/BrazilMap';
import { GeoDetailCard } from './components/Map/GeoDetailCard';
import { PollsOverview } from './components/Polls/PollsOverview';
import { RunoffSimulator } from './components/Polls/RunoffSimulator';
import { StatesOverview } from './components/States/StatesOverview';
import { GlobalSearchModal } from './components/Search/GlobalSearchModal';
import { formatters } from './services/electionApi';
import {
  carregarResumoNacional,
  carregarUfData,
  getVencedorUf,
  getCandidatosDoCargo,
  getCorCandidato,
  CORES_PARTIDOS,
  NOMES_UFS,
} from './services/electionDatasetService';
import { ResumoNacionalBrasil, UfDataset, MunicipioData } from './types/dataset';
import { Candidate, ElectionSummary } from './types/election';
import {
  MapPin,
  TrendingUp,
  BarChart3,
  Calculator,
  Building2,
  Users,
  Search,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Calendar,
  CheckCircle2,
  Layers,
} from 'lucide-react';

export default function App() {
  // Controle de Abas
  const [abaAtiva, setAbaAtiva] = useState<
    'mapa' | 'pesquisas' | 'simulador' | 'estados'
  >('mapa');

  // Turno Ativo (1 = Consolidado Oficial TSE, 2 = Pesquisas & Apuração Decisiva)
  const [turnoAtivo, setTurnoAtivo] = useState<number>(1);

  // Cargo selecionado
  const [cargoAtivo, setCargoAtivo] = useState<'pres' | 'gov' | 'sen'>('pres');

  // Seleção Geográfica do Mapa
  const [selectedUf, setSelectedUf] = useState<string | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<MunicipioData | null>(null);
  const [selectedMesoId, setSelectedMesoId] = useState<number | null>(null);

  // Modais
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Dados carregados do dataset oficial
  const [resumoNacional, setResumoNacional] = useState<ResumoNacionalBrasil | null>(null);
  const [ufData, setUfData] = useState<UfDataset | null>(null);
  const [isLoadingNacional, setIsLoadingNacional] = useState<boolean>(true);

  // Hook existente para API REST / Simulação incremental em tempo real (Ao Vivo automático)
  const {
    data: simulatedData,
    loading: apiLoading,
    isRefreshing,
    error: apiError,
    isAutoRefreshActive,
    setIsAutoRefreshActive,
    refresh: apiRefresh,
    setSimulatedUrnasPercent,
    reset: apiReset,
    url: apiUrl,
    changeApiUrl,
    isRealApiMode,
  } = useElectionData({
    autoRefresh: true,
    refreshIntervalMs: 15000,
  });

  // 1. Carrega dados nacionais oficiais ao mudar de turno
  useEffect(() => {
    setIsLoadingNacional(true);
    carregarResumoNacional(turnoAtivo)
      .then((res) => {
        setResumoNacional(res);
      })
      .catch((err) => {
        console.warn('Falha ao carregar resumo nacional do dataset, usando fallback:', err);
      })
      .finally(() => {
        setIsLoadingNacional(false);
      });
  }, [turnoAtivo]);

  // 2. Carrega dados da UF selecionada
  useEffect(() => {
    if (!selectedUf) {
      setUfData(null);
      return;
    }
    carregarUfData(selectedUf.toLowerCase(), turnoAtivo)
      .then((dados) => {
        setUfData(dados);
      })
      .catch((err) => {
        console.error('Falha ao carregar dados da UF:', err);
      });
  }, [selectedUf, turnoAtivo]);

  // Handler para busca de município por código IBGE
  const handleSelectMunicipioByIbge = useCallback(
    async (ibge: number, ufSigla: string, nomeMun: string) => {
      setSelectedUf(ufSigla.toLowerCase());
      setAbaAtiva('mapa');

      try {
        const dadosUf = await carregarUfData(ufSigla.toLowerCase(), turnoAtivo);
        setUfData(dadosUf);
        const mun = dadosUf.mun.find((m) => m.i === ibge);
        if (mun) {
          setSelectedMunicipio(mun);
          setSelectedMesoId(mun.meso || null);
        } else {
          setSelectedMunicipio({
            i: ibge,
            t: '',
            n: nomeMun,
            c: 0,
          });
        }
      } catch (err) {
        console.error('Erro ao focar município via busca:', err);
      }
    },
    [turnoAtivo]
  );

  // Handler de refresh manual
  const handleRefresh = () => {
    apiRefresh();
    carregarResumoNacional(turnoAtivo).then(setResumoNacional);
    if (selectedUf) {
      carregarUfData(selectedUf, turnoAtivo).then(setUfData);
    }
  };

  const isFinalizada = turnoAtivo === 1 ? true : (simulatedData?.total_urnas_apuradas ?? 0) >= 100;

  // Ranking de candidatos para a UF selecionada ou Brasil Nacional (específico por cargo)
  const currentUfRanking = useMemo(() => {
    if (!selectedUf || !resumoNacional) return null;
    return getVencedorUf(resumoNacional, selectedUf, cargoAtivo);
  }, [selectedUf, resumoNacional, cargoAtivo]);

  const currentCandidatesList: Candidate[] = useMemo(() => {
    if (currentUfRanking) {
      return currentUfRanking.candidatos
        .map((c, idx) => {
          const corHex = getCorCandidato(c.n, c.sg);
          const status = (c.st === '2º turno'
            ? 'segundo_turno'
            : c.e || c.st === 'Eleito'
            ? 'eleito'
            : idx === 0
            ? 'lider'
            : 'nao_eleito') as Candidate['status'];

          return {
            id: `cand-${c.n}`,
            numero: c.n,
            nome: c.nm,
            nomeUrna: c.nmu,
            partido: c.pn || c.sg || '',
            siglaPartido: c.sg || '',
            coligacao: c.com || c.col || '',
            vice: c.vice || (c.sup && c.sup.length ? `Suplentes: ${c.sup.join(', ')}` : ''),
            votos: c.votosUf,
            porcentagem: Number(c.pctUf.toFixed(2)),
            corHex,
            status,
          };
        })
        .sort((a, b) => b.votos - a.votos);
    }

    if (cargoAtivo === 'gov' && resumoNacional?.gov) {
      // Quando estiver em nível nacional para Governador, exibe os governadores eleitos / líderes de cada estado
      return Object.entries(resumoNacional.gov).map(([ufSigla, gData]) => {
        const lider = gData.cands[0];
        const corHex = getCorCandidato(lider.n, lider.sg);
        return {
          id: `gov-${ufSigla}`,
          numero: lider.n,
          nome: `${lider.nm} (${NOMES_UFS[ufSigla] || ufSigla.toUpperCase()})`,
          nomeUrna: `${lider.nmu} - ${NOMES_UFS[ufSigla] || ufSigla.toUpperCase()}`,
          partido: lider.pn || lider.sg,
          siglaPartido: lider.sg,
          coligacao: lider.col || lider.com || '',
          vice: lider.vice,
          votos: lider.v,
          porcentagem: Number(lider.p.toFixed(2)),
          corHex,
          status: (lider.e || lider.st === 'Eleito' ? 'eleito' : lider.st === '2º turno' ? 'segundo_turno' : 'lider') as Candidate['status'],
        };
      }).sort((a, b) => b.votos - a.votos);
    }

    if (cargoAtivo === 'sen' && resumoNacional?.sen) {
      // Quando estiver em nível nacional para Senador, exibe os senadores mais votados de cada estado
      return Object.entries(resumoNacional.sen).map(([ufSigla, sData]) => {
        const lider = sData.cands[0];
        const corHex = getCorCandidato(lider.n, lider.sg);
        return {
          id: `sen-${ufSigla}`,
          numero: lider.n,
          nome: `${lider.nm} (${NOMES_UFS[ufSigla] || ufSigla.toUpperCase()})`,
          nomeUrna: `${lider.nmu} - ${NOMES_UFS[ufSigla] || ufSigla.toUpperCase()}`,
          partido: lider.pn || lider.sg,
          siglaPartido: lider.sg,
          coligacao: lider.col || lider.com || '',
          vice: lider.sup && lider.sup.length ? `Suplente: ${lider.sup[0]}` : '',
          votos: lider.v,
          porcentagem: Number(lider.p.toFixed(2)),
          corHex,
          status: (lider.e || lider.st === 'Eleito' ? 'eleito' : 'lider') as Candidate['status'],
        };
      }).sort((a, b) => b.votos - a.votos);
    }

    if (turnoAtivo === 2 && resumoNacional?.pres.cands) {
      // 2º Turno Nacional Presidente
      return resumoNacional.pres.cands
        .map((c) => {
          const corHex = getCorCandidato(c.n, c.sg);
          return {
            id: `cand-${c.n}`,
            numero: c.n,
            nome: c.nm,
            nomeUrna: c.nmu,
            partido: c.pn || c.sg,
            siglaPartido: c.sg,
            coligacao: c.com || c.col || '',
            vice: c.vice || '',
            votos: c.v,
            porcentagem: Number(c.p.toFixed(2)),
            corHex,
            status: 'segundo_turno' as Candidate['status'],
          };
        })
        .sort((a, b) => b.votos - a.votos);
    }

    return simulatedData?.candidatos || [];
  }, [currentUfRanking, cargoAtivo, turnoAtivo, resumoNacional, simulatedData]);

  const currentTotalValidos = useMemo(() => {
    if (currentUfRanking) {
      return currentUfRanking.totais.vv;
    }
    if (cargoAtivo === 'gov' && resumoNacional?.gov) {
      return Object.values(resumoNacional.gov).reduce((acc, g) => acc + (g.tot?.vv || 0), 0);
    }
    if (cargoAtivo === 'sen' && resumoNacional?.sen) {
      return Object.values(resumoNacional.sen).reduce((acc, s) => acc + (s.tot?.vv || 0), 0);
    }
    return turnoAtivo === 1 ? 119300788 : (simulatedData?.votos_validos ?? 0);
  }, [currentUfRanking, cargoAtivo, resumoNacional, turnoAtivo, simulatedData]);

  const currentUrnasPct = useMemo(() => {
    if (currentUfRanking) {
      return currentUfRanking.secoesTotalizadasPct;
    }
    return turnoAtivo === 1 ? 100 : (simulatedData?.total_urnas_apuradas ?? 0);
  }, [currentUfRanking, turnoAtivo, simulatedData]);

  const currentStatsSummary: ElectionSummary | null = useMemo(() => {
    if (currentUfRanking) {
      const tot = currentUfRanking.totais;
      return {
        id: `uf-${selectedUf}`,
        eleicao: `Eleições Gerais 2026 · ${currentUfRanking.nome}`,
        cargo: cargoAtivo === 'pres' ? 'Presidente da República' : cargoAtivo === 'gov' ? 'Governador' : 'Senador',
        abrangencia: currentUfRanking.nome,
        ano: 2026,
        turno: turnoAtivo,
        total_urnas_apuradas: tot.pst,
        secoes_total: tot.ts,
        secoes_apuradas: tot.st,
        total_eleitores: tot.te,
        comparecimento: tot.c,
        comparecimento_pct: tot.te > 0 ? Number(((tot.c / tot.te) * 100).toFixed(2)) : 0,
        abstencoes: tot.a,
        abstencoes_pct: tot.te > 0 ? Number(((tot.a / tot.te) * 100).toFixed(2)) : 0,
        votos_total: tot.tv,
        votos_validos: tot.vv,
        votos_validos_pct: tot.c > 0 ? Number(((tot.vv / tot.c) * 100).toFixed(2)) : 0,
        votos_brancos: tot.vb,
        votos_brancos_pct: tot.c > 0 ? Number(((tot.vb / tot.c) * 100).toFixed(2)) : 0,
        votos_nulos: tot.vn,
        votos_nulos_pct: tot.c > 0 ? Number(((tot.vn / tot.c) * 100).toFixed(2)) : 0,
        data_hora_atualizacao: resumoNacional?.pres.dt || new Date().toISOString(),
        situacao_totalizacao: tot.pst >= 100 ? 'finalizada' : 'em_andamento',
        candidatos: currentCandidatesList,
      };
    }
    return simulatedData;
  }, [currentUfRanking, selectedUf, cargoAtivo, turnoAtivo, resumoNacional, simulatedData, currentCandidatesList]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
      {/* 1. Header do Painel com Busca Global e Seletor de Turno */}
      <ElectionHeader
        titulo={resumoNacional?.pres?.cands ? 'Apuração das Eleições 2026' : 'Eleições 2026'}
        cargo={cargoAtivo === 'pres' ? 'Presidente da República' : cargoAtivo === 'gov' ? 'Governador' : 'Senador'}
        abrangencia={selectedUf ? NOMES_UFS[selectedUf.toLowerCase()] || selectedUf.toUpperCase() : 'Brasil'}
        dataHoraAtualizacao={resumoNacional?.pres?.dt || new Date().toISOString()}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        isAutoRefreshActive={isAutoRefreshActive}
        onToggleAutoRefresh={() => setIsAutoRefreshActive(!isAutoRefreshActive)}
        onOpenApiSettings={() => setIsSettingsOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        isFinalizada={isFinalizada}
        turnoAtivo={turnoAtivo}
        onSelectTurno={(t) => {
          setTurnoAtivo(t);
          setSelectedMunicipio(null);
          setSelectedMesoId(null);
        }}
      />

      {/* 2. Barra de Navegação por Abas Principais */}
      <nav className="border-b border-slate-200 bg-white sticky top-[69px] z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto py-2 no-scrollbar">
            {/* Lista de Abas */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setAbaAtiva('mapa')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  abaAtiva === 'mapa'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Mapa & Apuração</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('pesquisas')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  abaAtiva === 'pesquisas'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Pesquisas (2º Turno)</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('simulador')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  abaAtiva === 'simulador'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Calculator className="h-4 w-4" />
                <span>Simulador 50%+1</span>
              </button>

              <button
                type="button"
                onClick={() => setAbaAtiva('estados')}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  abaAtiva === 'estados'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Governos & Senados</span>
              </button>
            </div>

            {/* Seletor de Cargo quando na aba do Mapa */}
            {abaAtiva === 'mapa' && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold shrink-0">
                <button
                  type="button"
                  onClick={() => setCargoAtivo('pres')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    cargoAtivo === 'pres'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Presidente
                </button>
                <button
                  type="button"
                  onClick={() => setCargoAtivo('gov')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    cargoAtivo === 'gov'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Governador
                </button>
                <button
                  type="button"
                  onClick={() => setCargoAtivo('sen')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    cargoAtivo === 'sen'
                      ? 'bg-white text-slate-900 font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Senador
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 3. Barra de Progresso Global Oficial das Urnas */}
      {turnoAtivo === 1 ? (
        <UrnasProgressBar
          porcentagem={100}
          secoesApuradas={499207}
          secoesTotal={499248}
          situacao="finalizada"
        />
      ) : simulatedData ? (
        <UrnasProgressBar
          porcentagem={simulatedData.total_urnas_apuradas}
          secoesApuradas={simulatedData.secoes_apuradas}
          secoesTotal={simulatedData.secoes_total}
          situacao={simulatedData.situacao_totalizacao}
        />
      ) : null}

      {/* 4. Conteúdo Principal por Aba */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* ABA 1: MAPA INTERATIVO DO BRASIL E DETALHES GEOGRÁFICOS */}
        {abaAtiva === 'mapa' && (
          <div className="space-y-6">
            {/* Banner explicativo contextual */}
            <div className="rounded-2xl border border-blue-200/80 bg-gradient-to-r from-blue-50/70 to-indigo-50/50 p-4 shadow-2xs flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0 shadow-xs">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    {selectedUf
                      ? `Mapa do Estado: ${NOMES_UFS[selectedUf.toLowerCase()] || selectedUf.toUpperCase()}`
                      : 'Panorama Nacional por Unidade da Federação'}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedUf
                      ? 'Clique em qualquer cidade ou alterne para ver as regiões do estado.'
                      : 'Clique em um estado para dar zoom e visualizar seus municípios e mesorregiões.'}
                  </p>
                </div>
              </div>

              {selectedUf && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUf(null);
                    setSelectedMunicipio(null);
                    setSelectedMesoId(null);
                  }}
                  className="rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  Voltar ao Brasil
                </button>
              )}
            </div>

            {/* Grid Principal: Mapa (8 colunas) + Painel Lateral de Detalhes (4 colunas) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Coluna do Mapa Vetorial */}
              <div className="lg:col-span-8">
                <BrazilMap
                  resumoNacional={resumoNacional}
                  turno={turnoAtivo}
                  cargo={cargoAtivo}
                  selectedUf={selectedUf}
                  onSelectUf={(uf) => {
                    setSelectedUf(uf);
                    setSelectedMunicipio(null);
                    setSelectedMesoId(null);
                  }}
                  selectedMunicipio={selectedMunicipio}
                  onSelectMunicipio={setSelectedMunicipio}
                  selectedMesoId={selectedMesoId}
                  onSelectMesoId={setSelectedMesoId}
                />
              </div>

              {/* Coluna do Card de Detalhes da Localidade */}
              <div className="lg:col-span-4 space-y-4">
                <GeoDetailCard
                  resumoNacional={resumoNacional}
                  turno={turnoAtivo}
                  cargo={cargoAtivo}
                  selectedUf={selectedUf}
                  selectedMesoId={selectedMesoId}
                  selectedMunicipio={selectedMunicipio}
                  ufData={ufData}
                  onClearSelection={() => {
                    setSelectedUf(null);
                    setSelectedMunicipio(null);
                    setSelectedMesoId(null);
                  }}
                  onSelectMunicipio={setSelectedMunicipio}
                  onSelectMesoId={setSelectedMesoId}
                />

                {/* Card de atalho para pesquisa de 2º turno */}
                {turnoAtivo === 2 && (
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 space-y-2">
                    <div className="flex items-center gap-1.5 font-bold">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span>Intenção de Voto Consolidada</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Flávio Bolsonaro lidera a média ponderada com 52% dos votos válidos contra 48% de Lula.
                    </p>
                    <button
                      type="button"
                      onClick={() => setAbaAtiva('pesquisas')}
                      className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
                    >
                      <span>Abrir comparativo de institutos</span>
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Seção Integrada: Classificação Oficial dos Candidatos e Totalização Geral */}
            <div className="pt-8 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-xl font-black tracking-tight text-slate-900 font-sans flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    <span>
                      {selectedUf
                        ? `Classificação para ${cargoAtivo === 'pres' ? 'Presidente' : cargoAtivo === 'gov' ? 'Governador' : 'Senador'} em ${NOMES_UFS[selectedUf.toLowerCase()] || selectedUf.toUpperCase()}`
                        : cargoAtivo === 'pres'
                        ? turnoAtivo === 1
                          ? 'Classificação Oficial do 1º Turno (Consolidado TSE)'
                          : 'Quadro Oficial do 2º Turno'
                        : cargoAtivo === 'gov'
                        ? 'Governadores Eleitos e Líderes por Estado'
                        : 'Senadores Mais Votados por Estado'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedUf
                      ? `Votação apurada no estado de ${NOMES_UFS[selectedUf.toLowerCase()]} · ${currentTotalValidos ? formatters.number(currentTotalValidos) : 0} votos válidos`
                      : cargoAtivo === 'pres'
                      ? 'Totalização oficial de votos válidos para Presidente da República em todo o território nacional'
                      : cargoAtivo === 'gov'
                      ? 'Visão consolidada dos governadores de cada estado. Clique em um estado no mapa para ver todos os candidatos daquela UF.'
                      : 'Visão consolidada dos senadores. Clique em um estado no mapa para ver todos os concorrentes daquela UF.'}
                  </p>
                </div>

                {selectedUf && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedUf(null);
                      setSelectedMunicipio(null);
                      setSelectedMesoId(null);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors shadow-2xs cursor-pointer self-start sm:self-auto"
                  >
                    <span>Voltar à classificação de todo o Brasil</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-8">
                  {currentCandidatesList.length > 0 && (
                    <CandidateList
                      candidates={currentCandidatesList}
                      totalVotosValidos={currentTotalValidos}
                      urnasApuradasPct={currentUrnasPct}
                      isTotalizacaoFinal={isFinalizada}
                    />
                  )}
                </div>

                <div className="lg:col-span-4">
                  {currentStatsSummary && <ElectionStatsOverview data={currentStatsSummary} />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: PESQUISAS ELEITORAIS 2º TURNO */}
        {abaAtiva === 'pesquisas' && <PollsOverview />}

        {/* ABA 3: SIMULADOR 50%+1 VOTO */}
        {abaAtiva === 'simulador' && <RunoffSimulator />}

        {/* ABA 4: GOVERNOS ESTADUAIS & SENADOS */}
        {abaAtiva === 'estados' && (
          <StatesOverview
            resumoNacional={resumoNacional}
            onSelectUf={(uf) => {
              setSelectedUf(uf);
              setAbaAtiva('mapa');
            }}
          />
        )}
      </main>

      {/* 5. Rodapé Institucional */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-black tracking-tight text-slate-800">
              ELEIÇÕES <span className="text-blue-600">2026</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Dados Oficiais: Tribunal Superior Eleitoral (TSE) & Malhas: IBGE</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>1º Turno (04/10/2026)</span>
            <span aria-hidden="true">·</span>
            <span>2º Turno (25/10/2026)</span>
          </div>
        </div>
      </footer>

      {/* 6. Modal de Busca Global */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectUf={(uf) => {
          setSelectedUf(uf);
          setAbaAtiva('mapa');
        }}
        onSelectMunicipioByIbge={handleSelectMunicipioByIbge}
      />

      {/* 7. Modal de Configuração e Simulação da API */}
      <ApiSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUrl={apiUrl}
        isRealApiMode={isRealApiMode}
        onSaveUrl={changeApiUrl}
        onSimulatePercent={setSimulatedUrnasPercent}
        onResetSimulation={apiReset}
      />
    </div>
  );
}
