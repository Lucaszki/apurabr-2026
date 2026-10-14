/**
 * @file RunoffSimulator.tsx
 * @description Simulador interativo do 2º Turno Presidencial das Eleições 2026.
 * Permite simular transferências de votos do 1º turno, abstenções, cenários regionais
 * e recalcular instantaneamente quem atinge a maioria absoluta (50% + 1 voto).
 */

import React, { useState, useMemo } from 'react';
import { CANDIDATOS_1T_TRANSFERENCIA } from '../../data/pesquisas2026';
import { formatters } from '../../services/electionApi';
import {
  Calculator,
  RotateCcw,
  Sparkles,
  Trophy,
  Users,
  CheckCircle2,
  TrendingUp,
  Percent,
  Sliders,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const RunoffSimulator: React.FC = () => {
  // Dados oficiais do 1º turno (TSE 2026)
  const votosBaseFlavio = 56104503;
  const votosBaseLula = 53879538;
  const totalValidos1T = 119300788;
  const votosOutros1T = totalValidos1T - votosBaseFlavio - votosBaseLula; // 9.316.747 votos

  // Estado das transferências de voto (%)
  const [transferencias, setTransferencias] = useState<
    Record<number, { flavio: number; lula: number; brancoNulo: number }>
  >({
    70: { flavio: 50, lula: 28, brancoNulo: 22 }, // Augusto Cury
    14: { flavio: 68, lula: 12, brancoNulo: 20 }, // Renan Santos
    55: { flavio: 72, lula: 16, brancoNulo: 12 }, // Ronaldo Caiado
    30: { flavio: 82, lula: 8, brancoNulo: 10 },  // Romeu Zema
    80: { flavio: 5, lula: 82, brancoNulo: 13 },  // Samara
  });

  // Ajustes globais
  const [variacaoAbstencao, setVariacaoAbstencao] = useState<number>(0); // em pp (-3% a +3%)
  const [swingSudeste, setSwingSudeste] = useState<number>(0); // em pp (-5% a +5% pró-Flávio)
  const [swingNordeste, setSwingNordeste] = useState<number>(0); // em pp (-5% a +5% pró-Lula)

  // Cenários pré-configurados
  const aplicarCenario = (tipo: 'pesquisas' | 'polarizacao' | 'virada' | 'conservador') => {
    if (tipo === 'pesquisas') {
      setTransferencias({
        70: { flavio: 52, lula: 28, brancoNulo: 20 },
        14: { flavio: 70, lula: 10, brancoNulo: 20 },
        55: { flavio: 75, lula: 15, brancoNulo: 10 },
        30: { flavio: 85, lula: 5, brancoNulo: 10 },
        80: { flavio: 5, lula: 85, brancoNulo: 10 },
      });
      setVariacaoAbstencao(0);
      setSwingSudeste(0);
      setSwingNordeste(0);
    } else if (tipo === 'virada') {
      setTransferencias({
        70: { flavio: 35, lula: 45, brancoNulo: 20 },
        14: { flavio: 50, lula: 25, brancoNulo: 25 },
        55: { flavio: 50, lula: 35, brancoNulo: 15 },
        30: { flavio: 65, lula: 20, brancoNulo: 15 },
        80: { flavio: 2, lula: 92, brancoNulo: 6 },
      });
      setVariacaoAbstencao(-1.5);
      setSwingSudeste(-2);
      setSwingNordeste(4);
    } else if (tipo === 'conservador') {
      setTransferencias({
        70: { flavio: 65, lula: 15, brancoNulo: 20 },
        14: { flavio: 82, lula: 6, brancoNulo: 12 },
        55: { flavio: 85, lula: 8, brancoNulo: 7 },
        30: { flavio: 90, lula: 4, brancoNulo: 6 },
        80: { flavio: 8, lula: 75, brancoNulo: 17 },
      });
      setVariacaoAbstencao(0.5);
      setSwingSudeste(3);
      setSwingNordeste(-2);
    } else if (tipo === 'polarizacao') {
      setTransferencias({
        70: { flavio: 45, lula: 35, brancoNulo: 20 },
        14: { flavio: 60, lula: 20, brancoNulo: 20 },
        55: { flavio: 65, lula: 25, brancoNulo: 10 },
        30: { flavio: 75, lula: 15, brancoNulo: 10 },
        80: { flavio: 5, lula: 85, brancoNulo: 10 },
      });
      setVariacaoAbstencao(0);
      setSwingSudeste(0);
      setSwingNordeste(0);
    }
  };

  const redefinir = () => {
    aplicarCenario('pesquisas');
  };

  // Cálculo da projeção matemática de votos do 2º turno
  const resultadoSimulado = useMemo(() => {
    let migracaoFlavio = 0;
    let migracaoLula = 0;

    CANDIDATOS_1T_TRANSFERENCIA.forEach((c) => {
      const config = transferencias[c.numero] || {
        flavio: c.migracaoFlavio,
        lula: c.migracaoLula,
        brancoNulo: c.migracaoBrancoNulo,
      };
      const votosC = c.votos1T;
      migracaoFlavio += Math.round((votosC * config.flavio) / 100);
      migracaoLula += Math.round((votosC * config.lula) / 100);
    });

    // Ajustes de Swing regional sobre as bases consolidadas
    const impactoSudeste = Math.round(votosBaseFlavio * (swingSudeste / 100) * 0.43);
    const impactoNordeste = Math.round(votosBaseLula * (swingNordeste / 100) * 0.27);

    let votosFinaisFlavio = votosBaseFlavio + migracaoFlavio + impactoSudeste;
    let votosFinaisLula = votosBaseLula + migracaoLula + impactoNordeste;

    // Fator de variação de abstenção
    const fatorComparecimento = 1 - variacaoAbstencao / 100;
    votosFinaisFlavio = Math.round(votosFinaisFlavio * fatorComparecimento);
    votosFinaisLula = Math.round(votosFinaisLula * fatorComparecimento);

    const totalValidosSimulados = votosFinaisFlavio + votosFinaisLula;
    const pctFlavio = totalValidosSimulados > 0 ? (votosFinaisFlavio / totalValidosSimulados) * 100 : 50;
    const pctLula = totalValidosSimulados > 0 ? (votosFinaisLula / totalValidosSimulados) * 100 : 50;

    const vencedor = pctFlavio >= 50 ? 'flavio' : 'lula';
    const diferencaVotos = Math.abs(votosFinaisFlavio - votosFinaisLula);
    const diferencaPct = Math.abs(pctFlavio - pctLula);

    return {
      votosFlavio: votosFinaisFlavio,
      pctFlavio: Number(pctFlavio.toFixed(2)),
      votosLula: votosFinaisLula,
      pctLula: Number(pctLula.toFixed(2)),
      totalValidos: totalValidosSimulados,
      vencedor,
      diferencaVotos,
      diferencaPct: Number(diferencaPct.toFixed(2)),
      metaMaioria: Math.floor(totalValidosSimulados / 2) + 1,
      migracaoFlavio,
      migracaoLula,
    };
  }, [transferencias, variacaoAbstencao, swingSudeste, swingNordeste]);

  const updateTransferencia = (numero: number, campo: 'flavio' | 'lula', val: number) => {
    setTransferencias((prev) => {
      const atual = prev[numero] || { flavio: 50, lula: 30, brancoNulo: 20 };
      const novoFlavio = campo === 'flavio' ? val : Math.min(100 - val, atual.flavio);
      const novoLula = campo === 'lula' ? val : Math.min(100 - val, atual.lula);
      const novoBn = Math.max(0, 100 - novoFlavio - novoLula);
      return {
        ...prev,
        [numero]: { flavio: novoFlavio, lula: novoLula, brancoNulo: novoBn },
      };
    });
  };

  return (
    <div className="space-y-8">
      {/* 1. Placar da Simulação e Veredito em Tempo Real */}
      <section className="rounded-2xl border border-blue-300 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 p-6 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 text-white">
                <Calculator className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Simulador Decisivo de Segundo Turno
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight mt-1 text-white">
              Projeção Matemática de Votação
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simule a distribuição dos votos do 1º turno, oscilações regionais e veja quem atinge os 50% + 1 voto.
            </p>
          </div>

          {/* Botões Rápidos de Cenários */}
          <div className="flex items-center gap-1.5 flex-wrap self-start sm:self-auto">
            <button
              type="button"
              onClick={() => aplicarCenario('pesquisas')}
              className="rounded-lg bg-blue-600/80 hover:bg-blue-600 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              Cenário Pesquisas
            </button>
            <button
              type="button"
              onClick={() => aplicarCenario('conservador')}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              Onda Direita
            </button>
            <button
              type="button"
              onClick={() => aplicarCenario('virada')}
              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-bold transition-colors"
            >
              Virada Lula
            </button>
            <button
              type="button"
              onClick={redefinir}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Redefinir simulação"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Placar dos 2 Candidatos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          {/* Flávio Bolsonaro */}
          <div
            className={`rounded-xl p-5 border transition-all ${
              resultadoSimulado.vencedor === 'flavio'
                ? 'bg-blue-900/40 border-blue-400 ring-2 ring-blue-500/20'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-base shadow-sm">
                  22
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Flávio Bolsonaro</h3>
                  <span className="text-xs text-blue-400 font-semibold">Partido Liberal (PL)</span>
                </div>
              </div>

              {resultadoSimulado.vencedor === 'flavio' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300">
                  <Trophy className="h-3 w-3" />
                  Eleito na Simulação
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-blue-400 tabular-nums">
                  {formatters.percent(resultadoSimulado.pctFlavio)}
                </span>
                <span className="text-xs text-slate-400 ml-1">dos válidos</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white tabular-nums block">
                  {formatters.number(resultadoSimulado.votosFlavio)}
                </span>
                <span className="text-[11px] text-slate-400">
                  +{formatters.number(resultadoSimulado.migracaoFlavio)} migrados
                </span>
              </div>
            </div>
          </div>

          {/* Lula */}
          <div
            className={`rounded-xl p-5 border transition-all ${
              resultadoSimulado.vencedor === 'lula'
                ? 'bg-red-900/40 border-red-400 ring-2 ring-red-500/20'
                : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white font-extrabold text-base shadow-sm">
                  13
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">Lula</h3>
                  <span className="text-xs text-red-400 font-semibold">
                    Partido dos Trabalhadores (PT)
                  </span>
                </div>
              </div>

              {resultadoSimulado.vencedor === 'lula' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2.5 py-0.5 text-xs font-extrabold text-emerald-300">
                  <Trophy className="h-3 w-3" />
                  Eleito na Simulação
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline justify-between border-t border-slate-800/80 pt-3">
              <div>
                <span className="text-3xl sm:text-4xl font-extrabold text-red-400 tabular-nums">
                  {formatters.percent(resultadoSimulado.pctLula)}
                </span>
                <span className="text-xs text-slate-400 ml-1">dos válidos</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-white tabular-nums block">
                  {formatters.number(resultadoSimulado.votosLula)}
                </span>
                <span className="text-[11px] text-slate-400">
                  +{formatters.number(resultadoSimulado.migracaoLula)} migrados
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Termômetro de 50% + 1 Voto */}
        <div className="mt-6 space-y-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-400 gap-1.5 sm:gap-2">
            <div className="flex items-center justify-between sm:justify-start gap-1">
              <span className="text-blue-400 font-bold">Flávio Bolsonaro:</span>
              <span className="text-blue-400 font-extrabold tabular-nums">{formatters.percent(resultadoSimulado.pctFlavio)}</span>
            </div>
            <span className="text-slate-300 font-semibold text-center text-[11px] sm:text-xs order-last sm:order-none">
              Maioria Absoluta: 50% (Meta: ~{formatters.number(resultadoSimulado.metaMaioria)} votos)
            </span>
            <div className="flex items-center justify-between sm:justify-end gap-1">
              <span className="text-red-400 font-bold">Lula:</span>
              <span className="text-red-400 font-extrabold tabular-nums">{formatters.percent(resultadoSimulado.pctLula)}</span>
            </div>
          </div>

          <div className="relative h-4 w-full bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${resultadoSimulado.pctFlavio}%` }}
            />
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white z-10 shadow-sm" />
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${resultadoSimulado.pctLula}%` }}
            />
          </div>

          <div className="text-center text-xs text-slate-400 pt-1">
            Vantagem simulada de{' '}
            <strong className="text-white font-bold">
              {formatters.percent(resultadoSimulado.diferencaPct)}
            </strong>{' '}
            ({formatters.number(resultadoSimulado.diferencaVotos)} votos) para{' '}
            <span
              className={`font-bold ${
                resultadoSimulado.vencedor === 'flavio' ? 'text-blue-400' : 'text-red-400'
              }`}
            >
              {resultadoSimulado.vencedor === 'flavio' ? 'Flávio Bolsonaro' : 'Lula'}
            </span>
          </div>
        </div>
      </section>

      {/* 2. Painel de Controles: Migração de Votos do 1º Turno */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-900 text-white">
              <Sliders className="h-3.5 w-3.5" />
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              Transferência dos Votos do 1º Turno
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Ajuste para onde migram os <strong>9,3 milhões de votos</strong> dos candidatos do 1º turno:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CANDIDATOS_1T_TRANSFERENCIA.slice(0, 4).map((c) => {
            const conf = transferencias[c.numero] || {
              flavio: c.migracaoFlavio,
              lula: c.migracaoLula,
              brancoNulo: c.migracaoBrancoNulo,
            };

            return (
              <div
                key={c.numero}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {c.nome}{' '}
                      <span className="text-xs font-semibold text-slate-500">
                        ({c.siglaPartido})
                      </span>
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      {formatters.number(c.votos1T)} votos ({formatters.percent(c.pctValidos1T)}) no 1T
                    </span>
                  </div>

                  <span className="rounded bg-slate-200 px-2 py-0.5 text-xs font-mono font-bold text-slate-800">
                    Nº {c.numero}
                  </span>
                </div>

                {/* Slider para Flávio */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-blue-700">Para Flávio (PL)</span>
                    <span className="font-bold text-blue-700 tabular-nums">
                      {conf.flavio}% ({formatters.number(Math.round((c.votos1T * conf.flavio) / 100))})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={conf.flavio}
                    onChange={(e) => updateTransferencia(c.numero, 'flavio', Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider para Lula */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-red-700">Para Lula (PT)</span>
                    <span className="font-bold text-red-700 tabular-nums">
                      {conf.lula}% ({formatters.number(Math.round((c.votos1T * conf.lula) / 100))})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={conf.lula}
                    onChange={(e) => updateTransferencia(c.numero, 'lula', Number(e.target.value))}
                    className="w-full accent-red-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="text-[11px] text-slate-400 flex justify-between pt-1 border-t border-slate-200">
                  <span>Brancos/Nulos/Abstenções:</span>
                  <span className="font-bold text-slate-600 tabular-nums">
                    {conf.brancoNulo}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Oscilações Regionais e Demográficas */}
        <div className="pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Swing Sudeste */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">Oscilação Sudeste (43% votos)</span>
              <span className="font-bold text-blue-700 tabular-nums">
                {swingSudeste > 0 ? `+${swingSudeste}%` : `${swingSudeste}%`}
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={swingSudeste}
              onChange={(e) => setSwingSudeste(Number(e.target.value))}
              className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              Variação percentual sobre a base do Sudeste
            </span>
          </div>

          {/* Swing Nordeste */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">Oscilação Nordeste (27% votos)</span>
              <span className="font-bold text-red-700 tabular-nums">
                {swingNordeste > 0 ? `+${swingNordeste}%` : `${swingNordeste}%`}
              </span>
            </div>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.5"
              value={swingNordeste}
              onChange={(e) => setSwingNordeste(Number(e.target.value))}
              className="w-full accent-red-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              Variação percentual sobre a base do Nordeste
            </span>
          </div>

          {/* Variação de Abstenção */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800">Variação de Abstenção Geral</span>
              <span className="font-bold text-slate-800 tabular-nums">
                {variacaoAbstencao > 0 ? `+${variacaoAbstencao}%` : `${variacaoAbstencao}%`}
              </span>
            </div>
            <input
              type="range"
              min="-3"
              max="3"
              step="0.5"
              value={variacaoAbstencao}
              onChange={(e) => setVariacaoAbstencao(Number(e.target.value))}
              className="w-full accent-slate-800 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-slate-400 block">
              Mais ou menos eleitores comparecendo às urnas
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
