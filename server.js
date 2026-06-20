const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));
const PORT = process.env.PORT || 3000;

const nivelesValidos = ['D10-D11','D11-D12','D12-L1','L1-L2','L2-L3','L3-L4','L4-L5','L5-S1'];
const pick = a => a[Math.floor(Math.random()*a.length)];
const clean = (s='') => String(s).replace(/\s+/g,' ').replace(/\s+,/g,',').replace(/,\s*\./g,'.').replace(/\.\s*\./g,'.').replace(/\s+\./g,'.').trim();
const lowerFirst = s => s ? s.charAt(0).toLowerCase()+s.slice(1) : '';
function joinList(items=[]){ const a=[...new Set(items.filter(Boolean))]; if(a.length<=1) return a[0]||''; return a.slice(0,-1).join(', ')+' y '+a.at(-1); }
function normLevels(v, fb=['L4-L5']){ let a=Array.isArray(v)?v:[v].filter(Boolean); a=a.filter(x=>nivelesValidos.includes(x)); return a.length ? [...new Set(a)] : fb; }
function sameLevels(a,b){ return normLevels(a,[]).sort().join('|')===normLevels(b,[]).sort().join('|'); }

const tipos={
  HERNIA_DISCAL:{dxS:'Hernia discal',dxP:'Hernias discales',baseS:['Se identifica hernia discal','Se observa hernia discal','Llama la atención hernia discal'],baseP:['Se identifican hernias discales','Se observan hernias discales','Llaman la atención hernias discales'],extraS:'del disco intervertebral lumbar',extraP:'de los discos intervertebrales lumbares',sacoS:'la cual contacta e impronta el saco tecal',sacoP:'las cuales contactan e improntan el saco tecal'},
  PROTRUSION_DISCAL:{dxS:'Protrusión discal',dxP:'Protrusiones discales',baseS:['Se identifica protrusión discal','Se observa protrusión discal','Se aprecia protrusión discal'],baseP:['Se identifican protrusiones discales','Se observan protrusiones discales','Se aprecian protrusiones discales'],extraS:'del disco intervertebral lumbar',extraP:'de los discos intervertebrales lumbares',sacoS:'la cual impronta discretamente el saco tecal',sacoP:'las cuales improntan discretamente el saco tecal'},
  BULGING:{dxS:'Desbordamiento circunferencial discal',dxP:'Desbordamientos circunferenciales discales',baseS:['Se aprecia pérdida de la concavidad posterior','Se identifica abombamiento circunferencial discal','Se observa desbordamiento circunferencial discal'],baseP:['Se aprecian pérdidas de la concavidad posterior','Se identifican abombamientos circunferenciales discales','Se observan desbordamientos circunferenciales discales'],extraS:'del disco intervertebral lumbar',extraP:'de los discos intervertebrales lumbares',sacoS:'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes',sacoP:'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes'},
  BULGING_ASIMETRICO:{dxS:'Desbordamiento circunferencial asimétrico discal',dxP:'Desbordamientos circunferenciales asimétricos discales',baseS:['Se aprecia pérdida asimétrica de la concavidad posterior','Se identifica abombamiento circunferencial asimétrico','Se observa desbordamiento circunferencial asimétrico'],baseP:['Se aprecian pérdidas asimétricas de la concavidad posterior','Se identifican abombamientos circunferenciales asimétricos','Se observan desbordamientos circunferenciales asimétricos'],extraS:'del disco intervertebral lumbar',extraP:'de los discos intervertebrales lumbares',sacoS:'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes',sacoP:'sobrepasando el margen posterior de los cuerpos vertebrales adyacentes'}
};
const locs={CENTRAL:'central',FORAMINAL_DERECHA:'foraminal derecha',FORAMINAL_IZQUIERDA:'foraminal izquierda',SUBARTICULAR_DERECHA:'subarticular derecha',SUBARTICULAR_IZQUIERDA:'subarticular izquierda',FORAMINAL_BILATERAL:'foraminal bilateral',EXTRAFORAMINAL_DERECHA:'extraforaminal derecha',EXTRAFORAMINAL_IZQUIERDA:'extraforaminal izquierda'};
const desgarros={NO:'',SI:'con desgarro anular posterior'};
const migraciones={NO:'',CAUDAL:'asociada a migración caudal',CEFALICA:'asociada a migración cefálica',CAUDAL_SECUESTRO:'asociada a migración caudal y fragmento secuestrado',CEFALICA_SECUESTRO:'asociada a migración cefálica y fragmento secuestrado'};
const comps={SIN_COMPROMISO:'sin compromiso radicular',RADICULAR_BILATERAL:'condicionando compromiso radicular bilateral',RADICULAR_IPSILATERAL:'con compromiso radicular ipsilateral',ESTENOSIS_BILATERAL:'provocando estenosis radicular bilateral',BILATERAL_PREDOMINIO_DERECHO:'condicionando compromiso radicular bilateral, a predominio derecho',BILATERAL_PREDOMINIO_IZQUIERDO:'condicionando compromiso radicular bilateral, a predominio izquierdo',ESTENOSIS_RADICULAR_IPSILATERAL:'provocando estenosis radicular ipsilateral'};

function normalizarHallazgo(h={}){ return { tipo:h.tipo||'HERNIA_DISCAL', localizacion:h.localizacion||'CENTRAL', niveles:normLevels(h.niveles,['L4-L5']), desgarroAnular:h.desgarroAnular||'NO', migracion:h.migracion||'NO', compromiso:h.compromiso||'SIN_COMPROMISO', observacion:h.observacion||'', deshidratacion:h.deshidratacion||{modo:'NO'} }; }
function generarHallazgo(raw){
  const h=normalizarHallazgo(raw); const cfg=tipos[h.tipo]||tipos.HERNIA_DISCAL; const plural=h.niveles.length>1; const nivelesTxt=joinList(h.niveles);
  const desc=clean(`${pick(plural?cfg.baseP:cfg.baseS)} ${[locs[h.localizacion], plural?cfg.extraP:cfg.extraS, `en ${nivelesTxt}`, plural?cfg.sacoP:cfg.sacoS, desgarros[h.desgarroAnular], migraciones[h.migracion], comps[h.compromiso], h.observacion].filter(Boolean).join(', ')}.`);
  const dx=clean(`${[plural?cfg.dxP:cfg.dxS, locs[h.localizacion], `en ${nivelesTxt}`, desgarros[h.desgarroAnular], migraciones[h.migracion]?lowerFirst(migraciones[h.migracion].replace(/^asociada a /i,'con ')):'', comps[h.compromiso]&&comps[h.compromiso]!=='sin compromiso radicular'?lowerFirst(comps[h.compromiso]):'sin compromiso radicular'].filter(Boolean).join(', ')}.`);
  return {descripcion:desc, diagnostico:dx, niveles:h.niveles, raw:h};
}
function generarDeshidratacionGlobal(desh={}, nivelesReferencia=[]){
  const modo=desh.modo||'NO'; if(modo==='NO') return null;
  let niveles = modo==='TODOS' ? nivelesValidos : normLevels(desh.niveles && desh.niveles.length ? desh.niveles : nivelesReferencia, nivelesReferencia.length?nivelesReferencia:['L4-L5']);
  const plural=niveles.length>1 || modo==='ANTERIORES_PLURAL' || modo==='TODOS';
  if(modo==='ANTERIOR'||modo==='ANTERIORES_PLURAL'||sameLevels(niveles,nivelesReferencia)){
    return { descripcion: pick(plural?[
      'Los discos intervertebrales anteriormente descritos muestran disminución de su señal en T2/STIR, compatible con deshidratación discal',
      'Asocian disminución de la intensidad de señal T2/STIR de los discos referidos, en relación con deshidratación discal'
    ]:[
      'El disco intervertebral anteriormente descrito muestra disminución de su señal en T2/STIR, compatible con deshidratación discal',
      'Asocia disminución de la intensidad de señal T2/STIR del disco referido, en relación con deshidratación discal'
    ]), diagnostico: plural?'Deshidratación de los discos intervertebrales previamente descritos.':'Deshidratación del disco intervertebral previamente descrito.' };
  }
  const nivelesTxt=joinList(niveles);
  return { descripcion: plural?`Se aprecia disminución de la señal T2/STIR de los discos intervertebrales lumbares en ${nivelesTxt}, compatible con deshidratación discal.`:`Se aprecia disminución de la señal T2/STIR del disco intervertebral lumbar en ${nivelesTxt}, compatible con deshidratación discal.`, diagnostico: plural?`Deshidratación de los discos intervertebrales lumbares en ${nivelesTxt}.`:`Deshidratación del disco intervertebral lumbar en ${nivelesTxt}.` };
}
function generarDiscos(body={}){
  const hallazgos = Array.isArray(body.hallazgos) && body.hallazgos.length ? body.hallazgos : [body];
  const generados = hallazgos.map(generarHallazgo);
  const nivelesRef=[...new Set(generados.flatMap(x=>x.niveles))];
  const desh=generarDeshidratacionGlobal(body.deshidratacion||{}, nivelesRef);
  const descripcion = clean([...generados.map(x=>x.descripcion), desh?.descripcion].filter(Boolean).join(' '));
  const diagnostico = [...generados.map(x=>x.diagnostico), desh?.diagnostico].filter(Boolean).join('\n');
  return { descripcion, diagnostico, hallazgos_normalizados: generados.map(x=>x.raw), deshidratacion: body.deshidratacion||{modo:'NO'} };
}
app.get('/',(req,res)=>res.json({ok:true,motor:'discos-hernias-deshidratacion-v4',endpoint:'POST /generar-discos'}));
app.post('/generar-discos',(req,res)=>{ try{res.json(generarDiscos(req.body));}catch(e){res.status(500).json({error:'Error generando reporte de discos',detail:e.message});} });
app.listen(PORT,()=>console.log(`Motor discos/hernias/deshidratacion v4 activo en puerto ${PORT}`));
module.exports={generarDiscos};
