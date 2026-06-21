const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 3000;

const nivelesValidos = ['D10-D11','D11-D12','D12-L1','L1-L2','L2-L3','L3-L4','L4-L5','L5-S1'];
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const unique = arr => [...new Set((arr || []).filter(Boolean))];
const clean = (s = '') => String(s)
  .replace(/\s+/g, ' ')
  .replace(/\s+,/g, ',')
  .replace(/,\s*\./g, '.')
  .replace(/\.\s*\./g, '.')
  .replace(/\s+\./g, '.')
  .replace(/,\s*,/g, ',')
  .trim();

function joinList(items = []) {
  const a = unique(items);
  if (a.length <= 1) return a[0] || '';
  return a.slice(0, -1).join(', ') + ' y ' + a.at(-1);
}

function normLevels(v, fallback = ['L4-L5']) {
  let a = Array.isArray(v) ? v : [v].filter(Boolean);
  a = unique(a).filter(x => nivelesValidos.includes(x));
  return a.length ? a : fallback;
}

function sameLevels(a, b) {
  return normLevels(a, []).sort().join('|') === normLevels(b, []).sort().join('|');
}

const locs = {
  CENTRAL: 'central',
  FORAMINAL_DERECHA: 'foraminal derecha',
  FORAMINAL_IZQUIERDA: 'foraminal izquierda',
  SUBARTICULAR_DERECHA: 'subarticular derecha',
  SUBARTICULAR_IZQUIERDA: 'subarticular izquierda',
  FORAMINAL_BILATERAL: 'foraminal bilateral',
  EXTRAFORAMINAL_DERECHA: 'extraforaminal derecha',
  EXTRAFORAMINAL_IZQUIERDA: 'extraforaminal izquierda'
};

const tipos = {
  HERNIA_DISCAL: {
    nombre: 'hernia',
    dxNombre: 'Hernia',
    dxPlural: 'Hernias',
    baseS: [
      'Se observa hernia discal',
      'Se identifica hernia discal',
      'Llama la atención hernia discal'
    ],
    baseP: [
      'Se observan hernias discales',
      'Se identifican hernias discales',
      'Llaman la atención hernias discales'
    ],
    sacoS: 'la cual contacta e impronta el saco tecal',
    sacoP: 'las cuales contactan e improntan el saco tecal'
  },
  PROTRUSION_DISCAL: {
    nombre: 'protrusión',
    dxNombre: 'Protrusión',
    dxPlural: 'Protrusiones',
    baseS: [
      'Se observa protrusión discal',
      'Se identifica protrusión discal',
      'Se aprecia protrusión discal'
    ],
    baseP: [
      'Se observan protrusiones discales',
      'Se identifican protrusiones discales',
      'Se aprecian protrusiones discales'
    ],
    sacoS: 'la cual impronta discretamente el saco tecal',
    sacoP: 'las cuales improntan discretamente el saco tecal'
  },
  BULGING: {
    nombre: 'desbordamiento circunferencial',
    dxNombre: 'Desbordamiento circunferencial',
    dxPlural: 'Desbordamientos circunferenciales',
    baseS: [
      'Se observa desbordamiento circunferencial discal',
      'Se identifica abombamiento circunferencial discal',
      'Se aprecia pérdida de la concavidad posterior del disco intervertebral'
    ],
    baseP: [
      'Se observan desbordamientos circunferenciales discales',
      'Se identifican abombamientos circunferenciales discales',
      'Se aprecian pérdidas de la concavidad posterior de los discos intervertebrales'
    ],
    sacoS: 'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes',
    sacoP: 'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes'
  },
  BULGING_ASIMETRICO: {
    nombre: 'desbordamiento circunferencial asimétrico',
    dxNombre: 'Desbordamiento circunferencial asimétrico',
    dxPlural: 'Desbordamientos circunferenciales asimétricos',
    baseS: [
      'Se observa desbordamiento circunferencial asimétrico discal',
      'Se identifica abombamiento circunferencial asimétrico',
      'Se aprecia pérdida asimétrica de la concavidad posterior del disco intervertebral'
    ],
    baseP: [
      'Se observan desbordamientos circunferenciales asimétricos discales',
      'Se identifican abombamientos circunferenciales asimétricos',
      'Se aprecian pérdidas asimétricas de la concavidad posterior de los discos intervertebrales'
    ],
    sacoS: 'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes',
    sacoP: 'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes'
  }
};

const desgarrosDesc = { NO: '', SI: 'con desgarro anular posterior' };
const desgarrosDx = { NO: '', SI: 'desgarro anular posterior' };
const migracionesDesc = {
  NO: '',
  CAUDAL: 'asociada a migración caudal',
  CEFALICA: 'asociada a migración cefálica',
  CAUDAL_SECUESTRO: 'asociada a migración caudal y fragmento secuestrado',
  CEFALICA_SECUESTRO: 'asociada a migración cefálica y fragmento secuestrado'
};
const migracionesDx = {
  NO: '',
  CAUDAL: 'migración caudal',
  CEFALICA: 'migración cefálica',
  CAUDAL_SECUESTRO: 'migración caudal y fragmento secuestrado',
  CEFALICA_SECUESTRO: 'migración cefálica y fragmento secuestrado'
};
const compsDesc = {
  SIN_COMPROMISO: 'sin compromiso radicular',
  RADICULAR_BILATERAL: 'condicionando compromiso radicular bilateral',
  RADICULAR_IPSILATERAL: 'con compromiso radicular ipsilateral',
  ESTENOSIS_BILATERAL: 'provocando estenosis radicular bilateral',
  BILATERAL_PREDOMINIO_DERECHO: 'condicionando compromiso radicular bilateral, a predominio derecho',
  BILATERAL_PREDOMINIO_IZQUIERDO: 'condicionando compromiso radicular bilateral, a predominio izquierdo',
  ESTENOSIS_RADICULAR_IPSILATERAL: 'provocando estenosis radicular ipsilateral'
};
const compsDx = {
  SIN_COMPROMISO: 'sin compromiso radicular',
  RADICULAR_BILATERAL: 'condicionando compromiso radicular bilateral',
  RADICULAR_IPSILATERAL: 'condicionando compromiso radicular ipsilateral',
  ESTENOSIS_BILATERAL: 'provocando estenosis radicular bilateral',
  BILATERAL_PREDOMINIO_DERECHO: 'condicionando compromiso radicular bilateral, a predominio derecho',
  BILATERAL_PREDOMINIO_IZQUIERDO: 'condicionando compromiso radicular bilateral, a predominio izquierdo',
  ESTENOSIS_RADICULAR_IPSILATERAL: 'provocando estenosis radicular ipsilateral'
};

function esBulging(tipo) {
  return tipo === 'BULGING' || tipo === 'BULGING_ASIMETRICO';
}

function normalizarHallazgo(h = {}) {
  return {
    tipo: h.tipo || 'HERNIA_DISCAL',
    localizacion: h.localizacion || 'CENTRAL',
    niveles: normLevels(h.niveles, ['L4-L5']),
    desgarroAnular: h.desgarroAnular || 'NO',
    migracion: h.migracion || 'NO',
    compromiso: h.compromiso || 'SIN_COMPROMISO',
    observacion: h.observacion || ''
  };
}

function unirConY(items) {
  const a = unique(items);
  if (a.length === 0) return '';
  if (a.length === 1) return a[0];
  return a.slice(0, -1).join(', ') + ' y ' + a.at(-1);
}

function fraseDisco(plural, nivelesTxt) {
  return plural
    ? `de los discos intervertebrales lumbares ${nivelesTxt}`
    : `del disco intervertebral lumbar ${nivelesTxt}`;
}

function generarDiagnosticoHallazgo(h, cfg) {
  const plural = h.niveles.length > 1;
  const nivelesTxt = joinList(h.niveles);
  const loc = esBulging(h.tipo) ? '' : (locs[h.localizacion] || 'central');
  const base = plural ? cfg.dxPlural : cfg.dxNombre;

  let inicio;
  if (esBulging(h.tipo)) {
    inicio = `${base} ${fraseDisco(plural, nivelesTxt)}`;
  } else {
    inicio = `${base} ${loc} ${fraseDisco(plural, nivelesTxt)}`;
  }

  const caracteristicas = unirConY([desgarrosDx[h.desgarroAnular], migracionesDx[h.migracion]]);
  const compromiso = compsDx[h.compromiso] || '';
  const partes = [inicio];
  if (caracteristicas) partes.push(`con ${caracteristicas}`);
  if (compromiso) partes.push(compromiso);
  return clean(partes.join(', ') + '.');
}

function generarHallazgo(raw) {
  const h = normalizarHallazgo(raw);
  const cfg = tipos[h.tipo] || tipos.HERNIA_DISCAL;
  const plural = h.niveles.length > 1;
  const nivelesTxt = joinList(h.niveles);
  const loc = esBulging(h.tipo) ? '' : (locs[h.localizacion] || 'central');
  const extra = plural ? 'de los discos intervertebrales lumbares' : 'del disco intervertebral lumbar';

  const desc = clean(`${pick(plural ? cfg.baseP : cfg.baseS)} ${[
    loc,
    extra,
    `en ${nivelesTxt}`,
    plural ? cfg.sacoP : cfg.sacoS,
    desgarrosDesc[h.desgarroAnular],
    migracionesDesc[h.migracion],
    compsDesc[h.compromiso],
    h.observacion
  ].filter(Boolean).join(', ')}.`);

  const dx = generarDiagnosticoHallazgo(h, cfg);
  return { descripcion: desc, diagnostico: dx, niveles: h.niveles, raw: h };
}

function dxDeshidratacion(niveles, modo = 'NIVELES') {
  const plural = niveles.length > 1 || modo === 'TODOS';
  const nivelesTxt = joinList(niveles);
  if (modo === 'TODOS') return 'Deshidratación discal lumbar multisegmentaria.';
  return plural
    ? `Deshidratación de los discos intervertebrales lumbares ${nivelesTxt}.`
    : `Deshidratación del disco intervertebral lumbar ${nivelesTxt}.`;
}

function descDeshidratacion(niveles, modo = 'NIVELES', referenciaDirecta = false) {
  const plural = niveles.length > 1 || modo === 'TODOS';
  const nivelesTxt = joinList(niveles);

  if (modo === 'TODOS') {
    return pick([
      'Se aprecia disminución difusa de la señal T2/STIR de los discos intervertebrales lumbares, compatible con deshidratación discal multisegmentaria.',
      'Los discos intervertebrales lumbares muestran disminución generalizada de su intensidad de señal en T2/STIR, en relación con cambios de deshidratación discal.'
    ]);
  }

  if (referenciaDirecta) {
    return pick(plural ? [
      'Los discos intervertebrales anteriormente descritos muestran disminución de su señal en T2/STIR, compatible con deshidratación discal.',
      'Asocian disminución de la intensidad de señal T2/STIR de los discos referidos, en relación con deshidratación discal.'
    ] : [
      'El disco intervertebral anteriormente descrito muestra disminución de su señal en T2/STIR, compatible con deshidratación discal.',
      'Asocia disminución de la intensidad de señal T2/STIR del disco referido, en relación con deshidratación discal.'
    ]);
  }

  return pick(plural ? [
    `Se aprecia disminución de la señal T2/STIR de los discos intervertebrales lumbares ${nivelesTxt}, compatible con deshidratación discal.`,
    `Los discos intervertebrales lumbares ${nivelesTxt} muestran disminución de su intensidad de señal en T2/STIR, en relación con cambios de deshidratación discal.`,
    `Cambios degenerativos por deshidratación discal en los niveles ${nivelesTxt}, caracterizados por disminución de la señal T2/STIR.`
  ] : [
    `Se aprecia disminución de la señal T2/STIR del disco intervertebral lumbar ${nivelesTxt}, compatible con deshidratación discal.`,
    `El disco intervertebral lumbar ${nivelesTxt} muestra disminución de su intensidad de señal en T2/STIR, en relación con cambios de deshidratación discal.`,
    `Cambios degenerativos por deshidratación del disco intervertebral lumbar ${nivelesTxt}.`
  ]);
}

function ordenarNivelesLumbar(niveles = []) {
  const orden = {
    'D10-D11': 1,
    'D11-D12': 2,
    'D12-L1': 3,
    'L1-L2': 4,
    'L2-L3': 5,
    'L3-L4': 6,
    'L4-L5': 7,
    'L5-S1': 8
  };

  return [...new Set(niveles.filter(Boolean))]
    .sort((a, b) => (orden[a] || 999) - (orden[b] || 999));
}

function generarDeshidratacionGlobal(desh = {}, nivelesReferencia = []) {
  const modo = desh.modo || 'NO';
  if (modo === 'NO') return null;

  let niveles;
  if (modo === 'TODOS') {
    niveles = nivelesValidos;
  } else if (desh.niveles && desh.niveles.length) {
    niveles = normLevels(desh.niveles, []);
  } else if (nivelesReferencia.length) {
    niveles = normLevels(nivelesReferencia, []);
  } else {
    niveles = ['L4-L5'];
  }

  if (modo === 'ANTERIOR' || modo === 'ANTERIORES_PLURAL') {
    niveles = ordenarNivelesLumbar(niveles);
  }

  const referenciaDirecta = ['ANTERIOR', 'ANTERIORES_PLURAL'].includes(modo) || sameLevels(niveles, nivelesReferencia);

  return {
    descripcion: clean(descDeshidratacion(niveles, modo, referenciaDirecta)),
    diagnostico: clean(dxDeshidratacion(niveles, modo)),
    niveles
  };
}

function generarDiscos(body = {}) {
  const hallazgos = Array.isArray(body.hallazgos) && body.hallazgos.length ? body.hallazgos : [body];
  const generados = hallazgos.map(generarHallazgo);
  const nivelesRef = unique(generados.flatMap(x => x.niveles));
  const desh = generarDeshidratacionGlobal(body.deshidratacion || {}, nivelesRef);

  const descripcion = clean([
    ...generados.map(x => x.descripcion),
    desh?.descripcion
  ].filter(Boolean).join(' '));

  // Importante: cada diagnóstico va separado por salto de línea para que el front lo trate como diagnóstico independiente.
  const diagnostico = [
    ...generados.map(x => x.diagnostico),
    desh?.diagnostico
  ].filter(Boolean).join('\n');

  return {
    descripcion,
    diagnostico,
    hallazgos_normalizados: generados.map(x => x.raw),
    deshidratacion: body.deshidratacion || { modo: 'NO' }
  };
}

app.get('/', (req, res) => res.json({
  ok: true,
  motor: 'discos-hernias-deshidratacion-v6',
  endpoint: 'POST /generar-discos'
}));

app.post('/generar-discos', (req, res) => {
  try {
    res.json(generarDiscos(req.body));
  } catch (e) {
    res.status(500).json({ error: 'Error generando reporte de discos', detail: e.message });
  }
});

app.listen(PORT, () => console.log(`Motor discos/hernias/deshidratacion v6 activo en puerto ${PORT}`));

module.exports = { generarDiscos };
