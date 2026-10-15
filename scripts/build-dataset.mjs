/**
 * @file build-dataset.mjs
 * @description Gera o dataset oficial do painel a partir da divulgação de resultados do TSE
 * (https://resultados.tse.jus.br) e das malhas/localidades do IBGE.
 *
 * Uso:
 *   node scripts/build-dataset.mjs            -> 1º turno (Presidente, Governador, Senador, Deputados) + malhas
 *   node scripts/build-dataset.mjs --turno 2  -> 2º turno (Presidente + Governador nas UFs com 2º turno)
 *   node scripts/build-dataset.mjs --sem-geo  -> não baixa novamente as malhas do IBGE
 *
 * Saída:
 *   public/data/2026/t{N}/br.json         Resumo nacional + resumo por UF (todos os cargos majoritários)
 *   public/data/2026/t{N}/uf/{uf}.json    Resultados por município (Presidente/Governador/Senador)
 *   public/data/2026/t1/dep/{uf}.json     Deputados Federais/Estaduais (candidatos, partidos, eleitos)
 *   public/data/2026/municipios.json      Índice de busca de municípios + regiões IBGE
 *   public/data/2026/dep-index.json       Índice de busca de deputados (todas as UFs)
 *   public/geo/*.json                     Malhas GeoJSON (Brasil por UF, UFs por município e regiões)
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DATA = path.join(ROOT, 'public', 'data', '2026');
const OUT_GEO = path.join(ROOT, 'public', 'geo');
const OUT_FOTOS = path.join(ROOT, 'public', 'fotos');

const args = process.argv.slice(2);
const TURNO = args.includes('--turno') ? Number(args[args.indexOf('--turno') + 1]) : 1;
const SKIP_GEO = args.includes('--sem-geo') || TURNO === 2;
const SKIP_FOTOS = args.includes('--sem-fotos');

const TSE = 'https://resultados.tse.jus.br/oficial';
const CICLO = 'ele2026';
const ELEICOES = {
  1: { federal: '6257', estadual: '6259' },
  2: { federal: '6258', estadual: '6260' },
};
const ELE = ELEICOES[TURNO];

const UFS = {
  ac: 12, al: 27, am: 13, ap: 16, ba: 29, ce: 23, df: 53, es: 32, go: 52, ma: 21, mg: 31, ms: 50, mt: 51,
  pa: 15, pb: 25, pe: 26, pi: 22, pr: 41, rj: 33, rn: 24, ro: 11, rr: 14, rs: 43, sc: 42, se: 28, sp: 35, to: 17,
};
const UF_LIST = Object.keys(UFS);

const CARGO = { pres: 1, gov: 3, sen: 5, depf: 6, depe: 7, depd: 8 };

const HEADERS = { 'User-Agent': 'Mozilla/5.0 (painel-eleicoes-2026)', Accept: 'application/json' };

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const pad6 = (e) => String(e).padStart(6, '0');
const pad4 = (c) => String(c).padStart(4, '0');
const num = (s) => (s === undefined || s === null || s === '' ? 0 : Number(String(s).replace(',', '.')));

async function getJson(url, { retries = 4, optional = false } = {}) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { headers: HEADERS });
      if (res.status === 404 || res.status === 403) {
        if (optional) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      if (attempt === retries) {
        if (optional) return null;
        throw new Error(`Falha ao baixar ${url}: ${err.message}`);
      }
      await sleep(400 * (attempt + 1));
    }
  }
  return null;
}

/** Executa tarefas assíncronas com limite de concorrência e barra de progresso simples */
async function pool(items, limit, worker, label) {
  const results = new Array(items.length);
  let next = 0;
  let done = 0;
  const t0 = Date.now();
  async function run() {
    while (next < items.length) {
      const idx = next++;
      results[idx] = await worker(items[idx], idx);
      done++;
      if (done % 250 === 0 || done === items.length) {
        const secs = ((Date.now() - t0) / 1000).toFixed(0);
        process.stdout.write(`\r  ${label}: ${done}/${items.length} (${secs}s)   `);
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  process.stdout.write('\n');
  return results;
}

const writeJson = async (file, data) => {
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, JSON.stringify(data));
};

const urlResultado = (ele, uf, abr, cargo) =>
  `${TSE}/${CICLO}/${ele}/dados/${uf}/${abr}-c${pad4(cargo)}-e${pad6(ele)}-u.json`;

// ---------------------------------------------------------------------------
// Parser do arquivo de resultado ("-u.json") do TSE
// ---------------------------------------------------------------------------

function parseResultado(j) {
  if (!j || !j.carg || !j.carg[0]) return null;
  const carg = j.carg[0];
  const federacoes = Object.fromEntries((carg.fed || []).map((f) => [f.n, f.sg]));
  const cands = [];
  const partidos = [];

  for (const agr of carg.agr || []) {
    for (const par of agr.par || []) {
      partidos.push({
        n: Number(par.n),
        sg: par.sg,
        nm: par.nm,
        fed: par.nfed ? federacoes[par.nfed] || '' : '',
        v: num(par.tvtn), // votos nominais + legenda
        vl: num(par.tvtl), // votos de legenda
        col: agr.tp === 'c' ? agr.nm : '',
      });
      for (const c of par.cand || []) {
        const vice = (c.vs || []).find((v) => v.tp === 'v');
        const sup = (c.vs || []).filter((v) => v.tp === 's1' || v.tp === 's2').map((v) => v.nmu);
        cands.push({
          n: Number(c.n),
          sq: c.sqcand,
          nm: c.nm,
          nmu: c.nmu,
          sg: par.sg,
          pn: par.nm,
          col: agr.tp === 'c' ? agr.nm : '',
          com: agr.com || par.sg,
          vice: vice ? `${vice.nmu} (${vice.sgp})` : undefined,
          sup: sup.length ? sup : undefined,
          v: num(c.vap),
          p: num(c.pvapn),
          e: c.e === 's',
          st: c.st || '',
          dvt: c.dvt || '',
          nasc: c.dt || '',
        });
      }
    }
  }
  cands.sort((a, b) => b.v - a.v);

  const s = j.s || {};
  const e = j.e || {};
  const v = j.v || {};
  return {
    nv: Number(carg.nv || 1),
    qe: carg.qe ? num(carg.qe) : undefined,
    dt: `${j.dt || ''} ${j.ht || ''}`.trim(),
    dg: `${j.dg || ''} ${j.hg || ''}`.trim(),
    final: j.tf === 's',
    cands,
    partidos,
    tot: {
      ts: num(s.ts), // seções totais
      st: num(s.st), // seções totalizadas
      pst: num(s.pstn),
      te: num(e.te), // eleitorado
      c: num(e.c), // comparecimento
      a: num(e.a), // abstenção
      tv: num(v.tv), // total de votos
      vv: num(v.vv), // válidos
      vb: num(v.vb), // brancos
      vn: num(v.tvn), // nulos (inclui nulos técnicos)
      vl: num(v.vl), // legenda (proporcionais)
    },
  };
}

/** Resumo compacto de candidato para listagens */
const candResumo = (c) => ({
  n: c.n, sq: c.sq, nm: c.nm, nmu: c.nmu, sg: c.sg, pn: c.pn, col: c.col, com: c.com,
  vice: c.vice, sup: c.sup, v: c.v, p: c.p, e: c.e, st: c.st, nasc: c.nasc,
});

// ---------------------------------------------------------------------------
// IBGE: localidades (regiões imediatas/intermediárias) e malhas
// ---------------------------------------------------------------------------

async function carregarLocalidadesIBGE() {
  console.log('• IBGE: localidades e regiões geográficas…');
  const lista = await getJson('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?view=nivelado');
  const map = new Map();
  for (const m of lista) {
    map.set(String(m['municipio-id']), {
      meso: m['mesorregiao-id'],
      meson: m['mesorregiao-nome'],
      micro: m['microrregiao-id'],
      micron: m['microrregiao-nome'],
      ri: m['regiao-imediata-id'],
      rin: m['regiao-imediata-nome'],
      nome: m['municipio-nome'],
    });
  }
  return map;
}

async function baixarMalhas() {
  console.log('• IBGE: malhas geográficas…');
  const base = 'https://servicodados.ibge.gov.br/api/v3/malhas';
  const fmt = 'formato=application/vnd.geo+json&qualidade=minima';
  const br = await getJson(`${base}/paises/BR?${fmt}&intrarregiao=UF`);
  await writeJson(path.join(OUT_GEO, 'br-uf.json'), br);

  const tarefas = [];
  for (const uf of UF_LIST) {
    const cod = UFS[uf];
    tarefas.push({ file: `${uf}-mun.json`, url: `${base}/estados/${cod}?${fmt}&intrarregiao=municipio` });
    tarefas.push({ file: `${uf}-meso.json`, url: `${base}/estados/${cod}?${fmt}&intrarregiao=mesorregiao` });
  }
  await pool(tarefas, 6, async (t) => {
    const geo = await getJson(t.url);
    if (geo) await writeJson(path.join(OUT_GEO, 'uf', t.file), geo);
  }, 'malhas');
}

// ---------------------------------------------------------------------------
// Pipeline principal
// ---------------------------------------------------------------------------

async function main() {
  const t0 = Date.now();
  console.log(`\n=== Dataset Eleições 2026 · ${TURNO}º turno ===`);
  const outTurno = path.join(OUT_DATA, `t${TURNO}`);

  if (!SKIP_GEO) await baixarMalhas();

  // 1) Configuração de municípios (códigos TSE ↔ IBGE)
  console.log('• TSE: configuração de municípios…');
  const cfgFed = await getJson(`${TSE}/${CICLO}/${ELE.federal}/config/mun-e${pad6(ELE.federal)}-cm.json`);
  const cfgEst = await getJson(`${TSE}/${CICLO}/${ELE.estadual}/config/mun-e${pad6(ELE.estadual)}-cm.json`, { optional: true });

  // UFs em disputa na eleição estadual deste turno (no 2º turno só algumas)
  const ufsEstaduais = new Set(
    TURNO === 1 ? UF_LIST : (cfgEst?.abr || []).map((a) => a.cd).filter((cd) => UFS[cd]),
  );
  if (TURNO === 2) {
    const cfgGeral = await getJson(`${TSE}/comum/config/ele-c.json`);
    ufsEstaduais.clear();
    for (const pl of cfgGeral.pl) for (const e of pl.e) {
      if (e.cd === ELE.estadual) for (const a of e.abr) if (UFS[a.cd]) ufsEstaduais.add(a.cd);
    }
  }

  const localidades = await carregarLocalidadesIBGE();

  // 2) Resultados nacionais e estaduais
  console.log('• TSE: resultados nacionais e estaduais…');
  const presBR = parseResultado(await getJson(urlResultado(ELE.federal, 'br', 'br', CARGO.pres)));
  const presUF = {};
  const govUF = {};
  const senUF = {};

  await pool([...UF_LIST, 'zz'], 8, async (uf) => {
    presUF[uf] = parseResultado(await getJson(urlResultado(ELE.federal, uf, uf, CARGO.pres)));
    if (uf !== 'zz' && ufsEstaduais.has(uf)) {
      govUF[uf] = parseResultado(await getJson(urlResultado(ELE.estadual, uf, uf, CARGO.gov), { optional: true }));
      if (TURNO === 1) {
        senUF[uf] = parseResultado(await getJson(urlResultado(ELE.estadual, uf, uf, CARGO.sen), { optional: true }));
      }
    }
  }, 'UFs');

  // 3) Resultados por município
  const municipiosPorUF = {};
  for (const abr of cfgFed.abr) {
    if (!UFS[abr.cd]) continue; // ignora exterior (zz) no nível municipal
    municipiosPorUF[abr.cd] = abr.mu.map((m) => ({ tse: m.cd, ibge: m.cdi, nome: m.nm, cap: m.c === 's' }));
  }

  const tarefas = [];
  for (const uf of UF_LIST) {
    for (const m of municipiosPorUF[uf] || []) {
      tarefas.push({ uf, m, cargo: 'pres', ele: ELE.federal, cd: CARGO.pres });
      if (ufsEstaduais.has(uf)) {
        tarefas.push({ uf, m, cargo: 'gov', ele: ELE.estadual, cd: CARGO.gov });
        if (TURNO === 1) tarefas.push({ uf, m, cargo: 'sen', ele: ELE.estadual, cd: CARGO.sen });
      }
    }
  }
  console.log(`• TSE: ${tarefas.length} arquivos municipais…`);
  const resultadosMun = new Map(); // key uf|tse|cargo
  await pool(tarefas, 48, async (t) => {
    const j = await getJson(urlResultado(t.ele, t.uf, `${t.uf}${t.m.tse}`, t.cd), { optional: true });
    const r = parseResultado(j);
    if (r) resultadosMun.set(`${t.uf}|${t.m.tse}|${t.cargo}`, r);
  }, 'municípios');

  // 4) Monta arquivos por UF
  console.log('• Gerando arquivos por UF…');
  const indiceMunicipios = [];
  const ufTotaisAux = {};

  for (const uf of UF_LIST) {
    const ordem = {
      pres: presBR.cands.map((c) => c.n),
      gov: govUF[uf]?.cands.map((c) => c.n) || [],
      sen: senUF[uf]?.cands.map((c) => c.n) || [],
    };
    const mesorregioes = {};
    const microrregioes = {};
    const regImediatas = {};
    const mun = [];

    for (const m of municipiosPorUF[uf] || []) {
      const loc = localidades.get(String(m.ibge));
      if (loc) {
        if (loc.meso) mesorregioes[loc.meso] = loc.meson;
        if (loc.micro) microrregioes[loc.micro] = loc.micron;
        if (loc.ri) regImediatas[loc.ri] = loc.rin;
      }
      const item = {
        i: Number(m.ibge),
        t: m.tse,
        n: loc?.nome || m.nome,
        c: m.cap ? 1 : 0,
        meso: loc?.meso ? Number(loc.meso) : null,
        micro: loc?.micro ? Number(loc.micro) : null,
        ri: loc?.ri ? Number(loc.ri) : null,
      };
      for (const cargo of ['pres', 'gov', 'sen']) {
        const r = resultadosMun.get(`${uf}|${m.tse}|${cargo}`);
        if (!r) continue;
        const votos = Object.fromEntries(r.cands.map((c) => [c.n, c.v]));
        item[cargo] = {
          vv: r.tot.vv, vb: r.tot.vb, vn: r.tot.vn,
          v: ordem[cargo].map((n) => votos[n] || 0),
        };
        if (cargo === 'pres') {
          item.e = r.tot.te; item.cp = r.tot.c; item.a = r.tot.a;
          item.ts = r.tot.ts; item.st = r.tot.st;
        }
      }
      mun.push(item);
      indiceMunicipios.push([item.i, item.n, uf, item.c, item.e || 0]);
    }

    ufTotaisAux[uf] = { municipios: mun.length };
    await writeJson(path.join(outTurno, 'uf', `${uf}.json`), {
      uf, turno: TURNO, ordem, mesorregioes, microrregioes, regImediatas, mun,
    });
  }

  // 5) Resumo nacional
  const resumoCargo = (r) => r ? ({
    nv: r.nv, dt: r.dt, final: r.final, tot: r.tot, cands: r.cands.map(candResumo),
  }) : null;

  const br = {
    meta: {
      turno: TURNO,
      gerado: new Date().toISOString(),
      fonte: 'TSE · Divulgação de Resultados (resultados.tse.jus.br) · IBGE (malhas e localidades)',
      eleicoes: ELE,
      ufsEstaduais: [...ufsEstaduais],
    },
    pres: {
      ...resumoCargo(presBR),
      ufs: Object.fromEntries(Object.entries(presUF).map(([uf, r]) => {
        const votos = Object.fromEntries(r.cands.map((c) => [c.n, c.v]));
        return [uf, { tot: r.tot, dt: r.dt, v: presBR.cands.map((c) => votos[c.n] || 0), mun: ufTotaisAux[uf]?.municipios }];
      })),
    },
    gov: Object.fromEntries(Object.entries(govUF).filter(([, r]) => r).map(([uf, r]) => [uf, resumoCargo(r)])),
    sen: Object.fromEntries(Object.entries(senUF).filter(([, r]) => r).map(([uf, r]) => [uf, resumoCargo(r)])),
  };
  await writeJson(path.join(outTurno, 'br.json'), br);

  if (TURNO === 1) {
    await writeJson(path.join(OUT_DATA, 'municipios.json'), indiceMunicipios);

    // 6) Deputados (federal e estadual/distrital)
    console.log('• TSE: deputados federais e estaduais…');
    const depIndex = [];
    await pool(UF_LIST, 6, async (uf) => {
      const out = { uf };
      for (const [chave, cd] of [['fed', CARGO.depf], ['est', uf === 'df' ? CARGO.depd : CARGO.depe]]) {
        const r = parseResultado(await getJson(urlResultado(ELE.estadual, uf, uf, cd), { optional: true }));
        if (!r) continue;
        const cadeiras = {};
        for (const c of r.cands) if (c.e) cadeiras[c.sg] = (cadeiras[c.sg] || 0) + 1;
        out[chave] = {
          nv: r.nv, qe: r.qe, tot: r.tot, dt: r.dt,
          partidos: r.partidos
            .map((p) => ({ ...p, cad: cadeiras[p.sg] || 0 }))
            .sort((a, b) => b.cad - a.cad || b.v - a.v),
          // [numero, nome urna, partido, votos, %válidos, situação, eleito(1/0), sqcand]
          cands: r.cands.map((c) => [c.n, c.nmu, c.sg, c.v, c.p, c.st, c.e ? 1 : 0, c.sq]),
        };
        for (const c of r.cands) depIndex.push([c.nmu, c.n, uf, chave, c.sg, c.v, c.st, c.e ? 1 : 0, c.sq]);
      }
      await writeJson(path.join(OUT_DATA, 't1', 'dep', `${uf}.json`), out);
    }, 'deputados');
    depIndex.sort((a, b) => b[5] - a[5]);
    await writeJson(path.join(OUT_DATA, 'dep-index.json'), depIndex);
  }

  // 7) Fotos oficiais dos candidatos
  if (!SKIP_FOTOS) {
    console.log('• TSE: fotos dos candidatos…');
    const fotoTasks = [];

    // Presidência
    if (presBR && presBR.cands) {
      const presDir = path.join(OUT_FOTOS, 'pres');
      await fs.mkdir(presDir, { recursive: true });
      for (const c of presBR.cands) {
        if (!c.sq) continue;
        const fileSq = path.join(presDir, `${c.sq}.jpeg`);
        const fileNum = path.join(presDir, `${c.n}.jpeg`);
        fotoTasks.push({
          url: `${TSE}/${CICLO}/${ELE.federal}/fotos/br/${c.sq}.jpeg`,
          targets: [fileSq, fileNum],
        });
      }
    }

    // Governos e Senados Estaduais
    for (const [cargoNome, cargoObj, eleId] of [
      ['gov', govUF, ELE.estadual],
      ['sen', senUF, ELE.estadual],
    ]) {
      for (const [uf, r] of Object.entries(cargoObj)) {
        if (!r || !r.cands) continue;
        const ufDir = path.join(OUT_FOTOS, uf.toLowerCase());
        await fs.mkdir(ufDir, { recursive: true });
        for (const c of r.cands) {
          if (!c.sq) continue;
          const fileSq = path.join(ufDir, `${c.sq}.jpeg`);
          const fileNum = path.join(ufDir, `${cargoNome}-${c.n}.jpeg`);
          fotoTasks.push({
            url: `${TSE}/${CICLO}/${eleId}/fotos/${uf.toLowerCase()}/${c.sq}.jpeg`,
            targets: [fileSq, fileNum],
          });
        }
      }
    }

    // Baixa fotos faltantes com concorrência controlada
    const fotosParaBaixar = [];
    for (const t of fotoTasks) {
      try {
        await fs.access(t.targets[0]);
      } catch {
        fotosParaBaixar.push(t);
      }
    }

    if (fotosParaBaixar.length > 0) {
      await pool(
        fotosParaBaixar,
        15,
        async (t) => {
          try {
            const res = await fetch(t.url, { headers: HEADERS });
            if (res.ok) {
              const buf = Buffer.from(await res.arrayBuffer());
              for (const tgt of t.targets) {
                await fs.writeFile(tgt, buf);
              }
            }
          } catch {}
        },
        'fotos TSE'
      );
    } else {
      console.log('  fotos TSE: todas as fotos já sincronizadas.');
    }
  }

  console.log(`\n✔ Concluído em ${((Date.now() - t0) / 1000).toFixed(0)}s → ${path.relative(ROOT, outTurno)}`);
}

main().catch((err) => {
  console.error('\n✖ Erro ao gerar dataset:', err);
  process.exit(1);
});
