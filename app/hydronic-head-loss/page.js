'use client';
import { useState, useRef, useEffect } from 'react';

// ── Helpers ───────────────────────────────────────────────────────────────────
function parseLength(val) {
  if (!val) return 0;
  const str = String(val).trim();
  if (str.includes('-')) {
    const [ft, inch] = str.split('-').map(s => parseFloat(s)||0);
    return ft + inch/12;
  }
  return parseFloat(str)||0;
}
function fmtLength(decFt) {
  const ft=Math.floor(decFt), inch=Math.round((decFt-ft)*12);
  if (inch===0) return `${ft} ft`;
  if (inch===12) return `${ft+1} ft`;
  return `${ft}'-${inch}"`;
}
function today() {
  const d=new Date();
  return `${d.getMonth()+1}/${d.getDate()}/${d.getFullYear()}`;
}

// ── Water Properties ──────────────────────────────────────────────────────────
function waterProps(tempF) {
  const density   = 62.56 - 0.00289*tempF - 0.0000378*tempF*tempF;
  const viscosity = Math.exp(-11.0318 + 1057.51/(tempF+214.624))/32.174;
  return { density, nu: viscosity/density };
}

// ── Pipe Data (ASHRAE HoF 2021 Ch.22 Tables 16 & 17) ─────────────────────────
const PIPES = [
  { label:'½" Cu-L',  nominal:0.5,  id:0.545,  roughness:0.000005 },
  { label:'¾" Cu-L',  nominal:0.75, id:0.785,  roughness:0.000005 },
  { label:'1" Cu-L',  nominal:1,    id:1.025,  roughness:0.000005 },
  { label:'1¼" Cu-L', nominal:1.25, id:1.265,  roughness:0.000005 },
  { label:'1½" Cu-L', nominal:1.5,  id:1.505,  roughness:0.000005 },
  { label:'2" Cu-L',  nominal:2,    id:1.985,  roughness:0.000005 },
  { label:'¾" Stl',   nominal:0.75, id:0.824,  roughness:0.00015  },
  { label:'1" Stl',   nominal:1,    id:1.049,  roughness:0.00015  },
  { label:'1¼" Stl',  nominal:1.25, id:1.380,  roughness:0.00015  },
  { label:'1½" Stl',  nominal:1.5,  id:1.610,  roughness:0.00015  },
  { label:'2" Stl',   nominal:2,    id:2.067,  roughness:0.00015  },
  { label:'2½" Stl',  nominal:2.5,  id:2.469,  roughness:0.00015  },
  { label:'3" Stl',   nominal:3,    id:3.068,  roughness:0.00015  },
  { label:'4" Stl',   nominal:4,    id:4.026,  roughness:0.00015  },
  { label:'6" Stl',   nominal:6,    id:6.065,  roughness:0.00015  },
  { label:'8" Stl',   nominal:8,    id:7.981,  roughness:0.00015  },
  { label:'10" Stl',  nominal:10,   id:10.020, roughness:0.00015  },
  { label:'12" Stl',  nominal:12,   id:11.938, roughness:0.00015  },
  { label:'14" Stl',  nominal:14,   id:13.126, roughness:0.00015  },
  { label:'16" Stl',  nominal:16,   id:15.000, roughness:0.00015  },
  { label:'18" Stl',  nominal:18,   id:16.876, roughness:0.00015  },
  { label:'20" Stl',  nominal:20,   id:18.814, roughness:0.00015  },
  { label:'24" Stl',  nominal:24,   id:22.626, roughness:0.00015  },
];

// ── Crane TP-410 fT table (A-26) ─────────────────────────────────────────────
const CRANE_FT = {
  0.5:0.027,0.75:0.025,1:0.023,1.25:0.022,1.5:0.021,
  2:0.019,2.5:0.018,3:0.018,4:0.017,5:0.016,
  6:0.015,8:0.014,10:0.014,12:0.013,14:0.013,
  16:0.013,18:0.012,20:0.012,24:0.012,
};
function getFT(nom) {
  const keys=Object.keys(CRANE_FT).map(Number).sort((a,b)=>a-b);
  if (CRANE_FT[nom]!=null) return CRANE_FT[nom];
  const lo=Math.max(...keys.filter(k=>k<=nom));
  const hi=Math.min(...keys.filter(k=>k>=nom));
  if (lo===hi) return CRANE_FT[lo];
  const t=(nom-lo)/(hi-lo);
  return CRANE_FT[lo]+t*(CRANE_FT[hi]-CRANE_FT[lo]);
}

// ── K-Factor Tables (ASHRAE HoF 2021 Ch.22 Tables 3,4,6,7) ───────────────────
const K_THREADED = {
  0.375:{'90std':2.5, '90lr':null,'45':0.38,'return':2.5, 'teeLine':0.90,'teeBranch':2.7, 'globe':20,  'gate':0.40,'angle':null,'swingCheck':8.0},
  0.5:  {'90std':2.1, '90lr':null,'45':0.37,'return':2.1, 'teeLine':0.90,'teeBranch':2.4, 'globe':14,  'gate':0.33,'angle':null,'swingCheck':5.5},
  0.75: {'90std':1.7, '90lr':0.92,'45':0.35,'return':1.7, 'teeLine':0.90,'teeBranch':2.1, 'globe':10,  'gate':0.28,'angle':6.1, 'swingCheck':3.7},
  1:    {'90std':1.5, '90lr':0.78,'45':0.34,'return':1.5, 'teeLine':0.90,'teeBranch':1.8, 'globe':9,   'gate':0.24,'angle':4.6, 'swingCheck':3.0},
  1.25: {'90std':1.3, '90lr':0.65,'45':0.33,'return':1.3, 'teeLine':0.90,'teeBranch':1.7, 'globe':8.5, 'gate':0.22,'angle':3.6, 'swingCheck':2.7},
  1.5:  {'90std':1.2, '90lr':0.54,'45':0.32,'return':1.2, 'teeLine':0.90,'teeBranch':1.6, 'globe':8,   'gate':0.19,'angle':2.9, 'swingCheck':2.5},
  2:    {'90std':1.0, '90lr':0.42,'45':0.31,'return':1.0, 'teeLine':0.90,'teeBranch':1.4, 'globe':7,   'gate':0.17,'angle':2.1, 'swingCheck':2.3},
};
const K_FLANGED = {
  1:    {'90std':0.43,'90lr':0.41,'45':0.22,'return':0.43,'teeLine':0.26,'teeBranch':1.0, 'globe':13, 'gate':null,'angle':4.8,'swingCheck':2.0},
  1.25: {'90std':0.41,'90lr':0.37,'45':0.22,'return':0.41,'teeLine':0.25,'teeBranch':0.95,'globe':12, 'gate':null,'angle':3.7,'swingCheck':2.0},
  1.5:  {'90std':0.40,'90lr':0.35,'45':0.21,'return':0.40,'teeLine':0.23,'teeBranch':0.90,'globe':10, 'gate':null,'angle':3.0,'swingCheck':2.0},
  2:    {'90std':0.38,'90lr':0.30,'45':0.20,'return':0.38,'teeLine':0.20,'teeBranch':0.84,'globe':9,  'gate':0.34,'angle':2.5,'swingCheck':2.0},
  2.5:  {'90std':0.35,'90lr':0.28,'45':0.19,'return':0.35,'teeLine':0.18,'teeBranch':0.79,'globe':8,  'gate':0.27,'angle':2.3,'swingCheck':2.0},
  3:    {'90std':0.34,'90lr':0.25,'45':0.18,'return':0.34,'teeLine':0.17,'teeBranch':0.76,'globe':7,  'gate':0.22,'angle':2.2,'swingCheck':2.0},
  4:    {'90std':0.31,'90lr':0.22,'45':0.18,'return':0.31,'teeLine':0.15,'teeBranch':0.70,'globe':6.5,'gate':0.16,'angle':2.1,'swingCheck':2.0},
  6:    {'90std':0.29,'90lr':0.18,'45':0.17,'return':0.29,'teeLine':0.12,'teeBranch':0.62,'globe':6,  'gate':0.10,'angle':2.1,'swingCheck':2.0},
  8:    {'90std':0.27,'90lr':0.16,'45':0.17,'return':0.27,'teeLine':0.10,'teeBranch':0.58,'globe':5.7,'gate':0.08,'angle':2.1,'swingCheck':2.0},
  10:   {'90std':0.25,'90lr':0.14,'45':0.16,'return':0.25,'teeLine':0.09,'teeBranch':0.53,'globe':5.7,'gate':0.06,'angle':2.1,'swingCheck':2.0},
  12:   {'90std':0.24,'90lr':0.13,'45':0.16,'return':0.24,'teeLine':0.08,'teeBranch':0.50,'globe':5.7,'gate':0.05,'angle':2.1,'swingCheck':2.0},
};
const K_WELD_LR_VEL = {
  4:  [0.37,0.34,0.33], 6:  [0.26,0.24,0.24],
  8:  [0.22,0.20,0.19], 10: [0.21,0.17,0.16],
  12: [0.16,0.17,0.17], 16: [0.12,0.12,0.12],
  20: [0.12,0.12,0.10], 24: [0.098,0.089,0.089],
};
const K_WELD_TEE_LINE   = {4:0.06,6:0.12,8:0.08,10:0.06,12:0.091,16:0.028};
const K_WELD_TEE_BRANCH = {4:0.57,6:0.56,8:0.53,10:0.52,12:0.63, 16:0.55 };

const REDUCER_DATA = [
  [4,3,0.23,0.14,0.10],[6,4,0.62,0.54,0.53],[8,6,0.31,0.28,0.26],
  [10,8,0.16,0.14,0.14],[12,10,0.16,0.14,0.13],[16,12,0.17,0.16,0.13],
  [6,8,0.15,0.12,0.11],[8,10,0.11,0.09,0.08],[10,12,0.11,0.11,0.11],
  [12,16,0.076,0.076,0.073],[16,20,0.021,0.021,0.022],
];
function getReducerK(upNom,downNom,vFps) {
  const row=REDUCER_DATA.find(r=>r[0]===upNom&&r[1]===downNom);
  if (!row) return 0.14;
  return vFps<6?row[2]??0.14:vFps<10?row[3]??0.14:row[4]??0.14;
}

function interpK(table,nominal,key) {
  const keys=Object.keys(table).map(Number).sort((a,b)=>a-b);
  if (table[nominal]?.[key]!=null) return table[nominal][key];
  const lo=Math.max(...keys.filter(k=>k<=nominal));
  const hi=Math.min(...keys.filter(k=>k>=nominal));
  if (lo===hi) return table[lo]?.[key]??null;
  const t=(nominal-lo)/(hi-lo);
  const vLo=table[lo]?.[key],vHi=table[hi]?.[key];
  if (vLo==null||vHi==null) return vLo??vHi??null;
  return vLo+t*(vHi-vLo);
}
function nearest(obj,nominal) {
  return obj[Object.keys(obj).map(Number).reduce((p,c)=>Math.abs(c-nominal)<Math.abs(p-nominal)?c:p)];
}

function getLRK(nominal,vFps) {
  const keys=Object.keys(K_WELD_LR_VEL).map(Number).sort((a,b)=>a-b);
  const nearNom=keys.reduce((p,c)=>Math.abs(c-nominal)<Math.abs(p-nominal)?c:p);
  const cols=K_WELD_LR_VEL[nearNom];
  if (vFps<=4)  return cols[0];
  if (vFps<=8)  return cols[0]+(cols[1]-cols[0])*((vFps-4)/4);
  if (vFps<=12) return cols[1]+(cols[2]-cols[1])*((vFps-8)/4);
  return cols[2];
}

function getK(type,nominal,vFps=8) {
  if (type==='ball')      return {K:0.05,src:'Industry std'};
  if (type==='butterfly') return {K:0.30,src:'Generic (override w/ mfr Cv)'};
  const fT=getFT(nominal);
  const threaded=nominal<2.5;

  if (type==='90lr') {
    if (nominal<=24) return {K:getLRK(nominal,vFps),src:'ASHRAE HoF 2021 Table 6'};
    return {K:14*fT,src:'Crane TP-410 (14×fT)'};
  }
  if (type==='90std') {
    if (nominal<=12) return {K:interpK(K_FLANGED,nominal,'90std')??interpK(K_THREADED,nominal,'90std'),src:'ASHRAE HoF 2021 Table 4'};
    return {K:30*fT,src:'Crane TP-410 (30×fT)'};
  }
  if (type==='45') {
    if (nominal<=12) return {K:interpK(K_FLANGED,nominal,'45')??interpK(K_THREADED,nominal,'45'),src:'ASHRAE HoF 2021 Table 4'};
    return {K:16*fT,src:'Crane TP-410 (16×fT)'};
  }
  if (type==='return') {
    const K=threaded?interpK(K_THREADED,nominal,'return'):interpK(K_FLANGED,nominal,'return');
    return {K:K??50*fT,src:'ASHRAE HoF 2021 Table 3/4'};
  }
  if (type==='teeLine') {
    if (nominal<=16) return {K:nearest(K_WELD_TEE_LINE,nominal),src:'ASHRAE HoF 2021 Table 7'};
    return {K:20*fT,src:'Crane TP-410 (20×fT)'};
  }
  if (type==='teeBranch') {
    if (nominal<=16) return {K:nearest(K_WELD_TEE_BRANCH,nominal),src:'ASHRAE HoF 2021 Table 7'};
    return {K:60*fT,src:'Crane TP-410 (60×fT)'};
  }
  if (type==='gate')      return {K:(threaded?interpK(K_THREADED,nominal,'gate'):interpK(K_FLANGED,nominal,'gate'))??8*fT,  src:'ASHRAE HoF 2021 Table 3/4'};
  if (type==='globe')     return {K:(threaded?interpK(K_THREADED,nominal,'globe'):interpK(K_FLANGED,nominal,'globe'))??340*fT,src:'ASHRAE HoF 2021 Table 3/4'};
  if (type==='angle')     return {K:(threaded?interpK(K_THREADED,nominal,'angle'):interpK(K_FLANGED,nominal,'angle'))??55*fT, src:'ASHRAE HoF 2021 Table 3/4'};
  if (type==='swingCheck')return {K:(threaded?interpK(K_THREADED,nominal,'swingCheck'):interpK(K_FLANGED,nominal,'swingCheck'))??100*fT,src:'ASHRAE HoF 2021 Table 3/4'};
  if (type==='waferCheck')return {K:null,src:'Manual override required'};
  return {K:null,src:'Unknown'};
}

function frictionFactor(Re,roughness,dFt) {
  if (Re<2300) return 64/Re;
  const rr=roughness/dFt; let f=0.02;
  for (let i=0;i<50;i++){const r=1.74-2*Math.log10(2*rr+18.7/(Re*Math.sqrt(f)));f=1/(r*r);}
  return f;
}

// ── Component Catalog ─────────────────────────────────────────────────────────
const CATEGORIES = [
  { id:'pipe', label:'Pipe', items:[
    {type:'pipe',      label:'Straight Pipe',               mode:'pipe'   },
    {type:'reducer',   label:'Reducer / Expansion',         mode:'reducer'},
  ]},
  { id:'fittings', label:'Fittings', items:[
    {type:'90std',     label:'90° Elbow (Standard)',         mode:'fitting'},
    {type:'90lr',      label:'90° Elbow (Long Radius)',      mode:'fitting'},
    {type:'45',        label:'45° Elbow',                    mode:'fitting'},
    {type:'return',    label:'180° Return Bend',             mode:'fitting'},
    {type:'teeLine',   label:'Tee — Line (straight through)',mode:'fitting'},
    {type:'teeBranch', label:'Tee — Branch',                 mode:'fitting'},
  ]},
  { id:'accessories', label:'Accessories', items:[
    {type:'gate',      label:'Gate Valve (fully open)',      mode:'fitting'},
    {type:'globe',     label:'Globe Valve (fully open)',     mode:'fitting'},
    {type:'angle',     label:'Angle Valve (fully open)',     mode:'fitting'},
    {type:'swingCheck',label:'Check Valve (Swing)',          mode:'fitting'},
    {type:'waferCheck',label:'Check Valve (Wafer) — manual K',mode:'fitting',hasKOverride:true},
    {type:'ball',      label:'Ball Valve (fully open)',      mode:'fitting'},
    {type:'butterfly', label:'Butterfly Valve (fully open)', mode:'fitting',hasKOverride:true},
    {type:'balancing', label:'Balancing Valve',              mode:'manual' },
    {type:'control',   label:'Control Valve',                mode:'manual' },
    {type:'prv',       label:'Pressure Reducing Valve',      mode:'manual' },
    {type:'strainer',  label:'Strainer / Y-Strainer',        mode:'manual' },
    {type:'flow_meter',label:'Flow Meter',                   mode:'manual' },
  ]},
  { id:'equipment', label:'Equipment', items:[
    {type:'chiller_evap',  label:'Chiller — Evaporator',       mode:'manual'},
    {type:'chiller_cond',  label:'Chiller — Condenser',        mode:'manual'},
    {type:'cooling_tower', label:'Cooling Tower (fill)',        mode:'manual'},
    {type:'ct_static',     label:'Cooling Tower — Static Lift',mode:'static'},
    {type:'boiler',        label:'Boiler',                      mode:'manual'},
    {type:'heat_exchanger',label:'Heat Exchanger',              mode:'manual'},
    {type:'ahu_coil',      label:'AHU / FCU Coil',             mode:'manual'},
    {type:'custom',        label:'Custom Component',            mode:'manual'},
  ]},
];
const ALL_COMPS = CATEGORIES.flatMap(c=>c.items);

const SYSTEM_DEFAULTS = {
  chw:  {label:'Chilled Water',       supply:44,  return:54 },
  cw:   {label:'Condenser Water',     supply:82,  return:94 },
  hhw:  {label:'Heating Hot Water',   supply:140, return:120},
  hthw: {label:'High Temp Hot Water', supply:180, return:160},
  other:{label:'Other / Custom',      supply:60,  return:60 },
};

// ── Abbreviations ─────────────────────────────────────────────────────────────
const ABBREV = {
  pipe:'PIPE', reducer:'RED/EXP',
  '90std':'90° ELL-SR','90lr':'90° ELL-LR','45':'45° ELL','return':'RET BEND',
  teeLine:'TEE-T',teeBranch:'TEE-B',
  gate:'GV',globe:'GLV',angle:'AV',swingCheck:'CV-SW',waferCheck:'CV-WF',
  ball:'BV',butterfly:'BFV',balancing:'BAL-V',control:'CTRL-V',
  prv:'PRV',strainer:'STR',flow_meter:'FM',
  chiller_evap:'CHIL-E',chiller_cond:'CHIL-C',cooling_tower:'CT',
  ct_static:'CT-LIFT',boiler:'BLVR',heat_exchanger:'HX',ahu_coil:'AHU',custom:'CUST',
};
const LEGEND_LABELS = {
  pipe:'Straight Pipe',reducer:'Reducer / Expansion',
  '90std':'90° Elbow, Standard Radius','90lr':'90° Elbow, Long Radius',
  '45':'45° Elbow','return':'180° Return Bend',
  teeLine:'Tee, Line (Through)',teeBranch:'Tee, Branch',
  gate:'Gate Valve',globe:'Globe Valve',angle:'Angle Valve',
  swingCheck:'Check Valve (Swing)',waferCheck:'Check Valve (Wafer)',
  ball:'Ball Valve',butterfly:'Butterfly Valve',
  balancing:'Balancing Valve',control:'Control Valve',
  prv:'Pressure Reducing Valve',strainer:'Strainer / Y-Strainer',
  flow_meter:'Flow Meter',chiller_evap:'Chiller, Evaporator',
  chiller_cond:'Chiller, Condenser',cooling_tower:'Cooling Tower',
  ct_static:'Cooling Tower Static Lift',boiler:'Boiler',
  heat_exchanger:'Heat Exchanger',ahu_coil:'AHU / FCU Coil',custom:'Custom Component',
};

// ── Determine zone temp for each component ────────────────────────────────────
// Walks through components and determines which zone (supply or return) each is in
function assignZones(components) {
  let currentZone = 'supply';
  return components.map(c => {
    if (c.type === '__zone_switch__') {
      currentZone = c.switchTo;
      return { ...c, zone: currentZone };
    }
    return { ...c, zone: currentZone };
  });
}

// ── Circuit Diagram ───────────────────────────────────────────────────────────
function CircuitDiagram({ components }) {
  const realComps = components.filter(c => c.type !== '__zone_switch__');
  if (!realComps.length) return null;
  const ROW_MAX=14, CW=60, CH=80, PAD_X=50, PAD_Y=30, GAP_Y=40;
  const rows=Math.ceil(realComps.length/ROW_MAX);
  const W=PAD_X*2+ROW_MAX*CW;
  const H=PAD_Y*2+rows*CH+(rows-1)*GAP_Y;

  const posOf=(idx)=>{
    const row=Math.floor(idx/ROW_MAX),col=idx%ROW_MAX,rev=row%2===1;
    const x=PAD_X+(rev?(ROW_MAX-1-col):col)*CW+CW/2;
    const y=PAD_Y+row*(CH+GAP_Y)+CH/2;
    return {x,y,row};
  };

  const iconOf=(type,x,y)=>{
    const s=9;
    switch(type){
      case 'pipe':      return <rect x={x-s} y={y-2.5} width={s*2} height={5} rx="1.5" fill="var(--brand)" fillOpacity="0.5"/>;
      case 'reducer':   return <polygon points={`${x-s},${y-4} ${x-s/2},${y-2} ${x-s/2},${y+2} ${x-s},${y+4} ${x+s},${y+4} ${x+s/2},${y+2} ${x+s/2},${y-2} ${x+s},${y-4}`} fill="none" stroke="var(--brand)" strokeWidth="1.2"/>;
      case '90std':
      case '90lr':      return <path d={`M${x-s},${y+2} Q${x-s},${y-s} ${x+2},${y-s}`} fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"/>;
      case '45':        return <line x1={x-s} y1={y+s/2} x2={x+s} y2={y-s/2} stroke="var(--brand)" strokeWidth="2" strokeLinecap="round"/>;
      case 'return':    return <path d={`M${x-s},${y} A${s},${s/2} 0 0,0 ${x+s},${y}`} fill="none" stroke="var(--brand)" strokeWidth="2"/>;
      case 'teeLine':   return <><line x1={x-s} y1={y} x2={x+s} y2={y} stroke="var(--brand)" strokeWidth="2"/><line x1={x} y1={y} x2={x} y2={y-s} stroke="var(--brand)" strokeWidth="1.5"/></>;
      case 'teeBranch': return <><line x1={x-s} y1={y} x2={x+s} y2={y} stroke="var(--border-secondary)" strokeWidth="1.5"/><line x1={x} y1={y} x2={x} y2={y-s} stroke="var(--brand)" strokeWidth="2.5"/></>;
      case 'gate':      return <><line x1={x-s} y1={y-s} x2={x+s} y2={y+s} stroke="var(--brand)" strokeWidth="1.8"/><line x1={x-s} y1={y+s} x2={x+s} y2={y-s} stroke="var(--brand)" strokeWidth="1.8"/ ></>;
      case 'globe':     return <circle cx={x} cy={y} r={s} fill="none" stroke="var(--brand)" strokeWidth="1.8"/>;
      case 'angle':     return <><circle cx={x} cy={y} r={s*0.8} fill="none" stroke="var(--brand)" strokeWidth="1.5"/><line x1={x} y1={y-s*0.8} x2={x} y2={y+s*0.8} stroke="var(--brand)" strokeWidth="1.2"/></>;
      case 'swingCheck':return <><circle cx={x} cy={y} r={s*0.9} fill="none" stroke="var(--brand)" strokeWidth="1.5"/><path d={`M${x-s*0.4},${y-s*0.6} L${x+s*0.5},${y}`} stroke="var(--brand)" strokeWidth="1.8" strokeLinecap="round"/></>;
      case 'waferCheck':return <><circle cx={x} cy={y} r={s*0.9} fill="none" stroke="var(--brand)" strokeWidth="1.5"/><line x1={x} y1={y-s*0.9} x2={x} y2={y+s*0.9} stroke="var(--brand)" strokeWidth="1.5"/></>;
      case 'ball':      return <circle cx={x} cy={y} r={s} fill="var(--brand)" fillOpacity="0.2" stroke="var(--brand)" strokeWidth="1.8"/>;
      case 'butterfly': return <><line x1={x} y1={y-s} x2={x} y2={y+s} stroke="var(--brand)" strokeWidth="2.2"/><path d={`M${x},${y} L${x-s*0.8},${y-s*0.6} L${x-s*0.8},${y+s*0.6} Z`} fill="var(--brand)" fillOpacity="0.35"/><path d={`M${x},${y} L${x+s*0.8},${y-s*0.6} L${x+s*0.8},${y+s*0.6} Z`} fill="var(--brand)" fillOpacity="0.35"/></>;
      case 'ct_static': return <><line x1={x} y1={y+s} x2={x} y2={y-s} stroke="var(--brand)" strokeWidth="1.5" strokeDasharray="2,2"/><path d={`M${x-s*0.5},${y-s*0.3} L${x},${y-s} L${x+s*0.5},${y-s*0.3}`} fill="none" stroke="var(--brand)" strokeWidth="1.5"/></>;
      default:          return <rect x={x-s} y={y-s*0.7} width={s*2} height={s*1.4} rx="2" fill="none" stroke="var(--brand)" strokeWidth="1.5"/>;
    }
  };

  const rowLines=Array.from({length:rows}).map((_,r)=>{
    const s=r*ROW_MAX,e=Math.min((r+1)*ROW_MAX-1,realComps.length-1);
    if (s>e) return null;
    const p1=posOf(s),p2=posOf(e);
    return <line key={`rl${r}`} x1={Math.min(p1.x,p2.x)-CW/2+10} y1={p1.y} x2={Math.max(p1.x,p2.x)+CW/2-10} y2={p1.y} stroke="var(--border-secondary)" strokeWidth="1.5"/>;
  });

  const zigzags=[];
  for (let r=0;r<rows-1;r++){
    const lastIdx=Math.min((r+1)*ROW_MAX-1,realComps.length-1);
    const nextIdx=(r+1)*ROW_MAX;
    if (nextIdx>=realComps.length) break;
    const p1=posOf(lastIdx),p2=posOf(nextIdx);
    const rev=r%2===1;
    const sideX=rev?p1.x-16:p1.x+16;
    const rx=30,ry=(p2.y-p1.y)/2,sweep=rev?0:1;
    zigzags.push(
      <path key={`zz${r}`}
        d={`M${sideX},${p1.y} A${rx},${ry} 0 0,${sweep} ${sideX},${p2.y}`}
        fill="none" stroke="var(--border-secondary)" strokeWidth="1.2" strokeDasharray="4,3"/>
    );
  }

  const usedTypes=[...new Set(realComps.map(c=>c.type))];

  return (
    <div>
      <div style={{overflowX:'auto',overflowY:'auto',maxHeight:'320px',border:'0.5px solid var(--border-primary)',borderRadius:'8px',padding:'8px',background:'var(--bg-secondary)'}}>
        <svg width={W} height={H} style={{display:'block'}}>
          {rowLines}{zigzags}
          <circle cx={PAD_X-20} cy={posOf(0).y} r={14} fill="var(--bg-accent)" stroke="var(--brand)" strokeWidth="1.8"/>
          <text x={PAD_X-20} y={posOf(0).y+1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="var(--brand)">P</text>
          <line x1={PAD_X-6} y1={posOf(0).y} x2={PAD_X+CW/2-10} y2={posOf(0).y} stroke="var(--border-secondary)" strokeWidth="1.5"/>
          {realComps.map((comp,idx)=>{
            const {x,y}=posOf(idx);
            const abbr=ABBREV[comp.type]||comp.type.toUpperCase().slice(0,6);
            const zoneColor = comp.zone==='return' ? '#f97316' : 'var(--brand)';
            return (
              <g key={comp.id}>
                <circle cx={x} cy={y} r={16} fill="var(--bg-card)" stroke={comp.zone==='return'?'#f97316':'var(--border-primary)'} strokeWidth={comp.zone==='return'?'1.2':'0.75'}/>
                {iconOf(comp.type,x,y)}
                <text x={x} y={y-22} textAnchor="middle" fontSize="7.5" fill="var(--text-tertiary)">{idx+1}</text>
                <text x={x} y={y+26} textAnchor="middle" fontSize="7" fill={comp.zone==='return'?'#f97316':'var(--text-muted)'} fontWeight="500">{abbr}</text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{marginTop:'10px',padding:'10px 12px',background:'var(--bg-tertiary)',borderRadius:'6px',border:'0.5px solid var(--border-primary)'}}>
        <div style={{fontSize:'10px',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em',marginBottom:'7px'}}>Legend</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'6px 20px'}}>
          {usedTypes.map(type=>(
            <span key={type} style={{fontSize:'11px',color:'var(--text-secondary)',whiteSpace:'nowrap'}}>
              <span style={{fontWeight:600,color:'var(--text-accent)'}}>{ABBREV[type]||type}</span>
              {' — '}{LEGEND_LABELS[type]||type}
            </span>
          ))}
          <span style={{fontSize:'11px',color:'#f97316',whiteSpace:'nowrap',marginLeft:'12px'}}>
            <span style={{fontWeight:600}}>●</span> Return side (orange)
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Diagram SVG for report ────────────────────────────────────────────────────
function generateDiagramSVG(components) {
  const realComps = components.filter(c => c.type !== '__zone_switch__');
  if (!realComps.length) return '';
  const ROW_MAX=14,CW=52,CH=65,PAD_X=45,PAD_Y=25,GAP_Y=35;
  const rows=Math.ceil(realComps.length/ROW_MAX);
  const W=PAD_X*2+ROW_MAX*CW;
  const H=PAD_Y*2+rows*CH+(rows-1)*GAP_Y;
  const posOf=(idx)=>{
    const row=Math.floor(idx/ROW_MAX),col=idx%ROW_MAX,rev=row%2===1;
    return {x:PAD_X+(rev?(ROW_MAX-1-col):col)*CW+CW/2, y:PAD_Y+row*(CH+GAP_Y)+CH/2};
  };
  let rowLines='';
  for(let r=0;r<rows;r++){
    const s=r*ROW_MAX,e=Math.min((r+1)*ROW_MAX-1,realComps.length-1);
    if(s>e) continue;
    const p1=posOf(s),p2=posOf(e);
    rowLines+=`<line x1="${Math.min(p1.x,p2.x)-CW/2+8}" y1="${p1.y}" x2="${Math.max(p1.x,p2.x)+CW/2-8}" y2="${p1.y}" stroke="#cbd5e1" stroke-width="1.5"/>`;
  }
  let zz='';
  for(let r=0;r<rows-1;r++){
    const lastIdx=Math.min((r+1)*ROW_MAX-1,realComps.length-1);
    const nextIdx=(r+1)*ROW_MAX;
    if(nextIdx>=realComps.length) break;
    const p1=posOf(lastIdx),p2=posOf(nextIdx);
    const rev=r%2===1;
    const sideX=rev?p1.x-16:p1.x+16;
    const rx=28,ry=(p2.y-p1.y)/2,sweep=rev?0:1;
    zz+=`<path d="M${sideX},${p1.y} A${rx},${ry} 0 0,${sweep} ${sideX},${p2.y}" fill="none" stroke="#cbd5e1" stroke-width="1.2" stroke-dasharray="4,3"/>`;
  }
  const p0=posOf(0);
  let pump=`<circle cx="${PAD_X-18}" cy="${p0.y}" r="12" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/><text x="${PAD_X-18}" y="${p0.y+1}" text-anchor="middle" dominant-baseline="middle" font-size="9" font-weight="bold" fill="#2563eb">P</text><line x1="${PAD_X-6}" y1="${p0.y}" x2="${PAD_X+CW/2-8}" y2="${p0.y}" stroke="#cbd5e1" stroke-width="1.5"/>`;
  let comps='';
  realComps.forEach((comp,idx)=>{
    const {x,y}=posOf(idx);
    const ab=ABBREV[comp.type]||comp.type.toUpperCase().slice(0,6);
    const strokeColor = comp.zone==='return' ? '#f97316' : '#e2e8f0';
    const textColor = comp.zone==='return' ? '#f97316' : '#475569';
    comps+=`<circle cx="${x}" cy="${y}" r="14" fill="white" stroke="${strokeColor}" stroke-width="${comp.zone==='return'?1.2:0.75}"/><text x="${x}" y="${y-18}" text-anchor="middle" font-size="7" fill="#94a3b8">${idx+1}</text><text x="${x}" y="${y+22}" text-anchor="middle" font-size="7" fill="${textColor}" font-weight="500">${ab}</text>`;
  });
  const usedTypes=[...new Set(realComps.map(c=>c.type))];
  const legendItems=usedTypes.map(t=>`<tspan>${ABBREV[t]||t}: ${LEGEND_LABELS[t]||t}</tspan>`).join('  ');
  return `<svg width="${W}" height="${H+30}" xmlns="http://www.w3.org/2000/svg" style="max-width:100%">${rowLines}${zz}${pump}${comps}<text x="${PAD_X}" y="${H+18}" font-size="7.5" fill="#64748b">${legendItems}</text></svg>`;
}

// ── Print Report ──────────────────────────────────────────────────────────────
function printReport({projectName,projectNum,engineer,systemType,supplyTemp,returnTemp,safetyFactor,results,totalHead,designHead,pipeLoss,fitLoss,equipLoss,fluidSupply,fluidReturn,includeDiagram,components}) {
  const sys=SYSTEM_DEFAULTS[systemType]?.label||systemType;
  const rows=results.filter(r=>r.type!=='__zone_switch__').map((r,i)=>{
    const isEquip=r.mode==='manual'||r.mode==='static';
    const pipeCol=isEquip?'—':r.mode==='reducer'?`${r.pipe}→${r.pipeDown}`:r.pipe;
    const gpmCol=isEquip?'—':r.gpm;
    const velCol=r.vFps?`${r.vFps.toFixed(2)} fps`:'—';
    const fCol=r.f?r.f.toFixed(4):'—';
    const KCol=r.K!=null?r.K.toFixed(3):'—';
    const zoneBadge = r.zone==='return' ? '<span style="font-size:7px;color:#f97316;font-weight:600;margin-left:3px">[R]</span>' : '';
    return `<tr style="border-bottom:0.5px solid #e2e8f0">
      <td style="padding:4px 5px;font-size:9px;color:#64748b;text-align:center">${i+1}</td>
      <td style="padding:4px 5px;font-size:9px;font-weight:500">${r.label}${zoneBadge}</td>
      <td style="padding:4px 5px;font-size:9px;text-align:center">${gpmCol}</td>
      <td style="padding:4px 5px;font-size:9px;text-align:center">${pipeCol}</td>
      <td style="padding:4px 5px;font-size:9px;text-align:center">${velCol}</td>
      <td style="padding:4px 5px;font-size:9px;text-align:center">${fCol}</td>
      <td style="padding:4px 5px;font-size:9px;text-align:center">${KCol}</td>
      <td style="padding:4px 5px;font-size:9px;text-align:right;font-weight:600;color:#2563eb">${(r.hLoss||0).toFixed(3)} ft</td>
    </tr>`;
  }).join('');

  const diagramSection=includeDiagram&&components.filter(c=>c.type!=='__zone_switch__').length>0?`
    <div class="sec">
      <div class="sec-hdr">Circuit Diagram</div>
      <div style="border:0.5px solid #e2e8f0;border-radius:5px;padding:10px;background:#f8fafc;overflow:hidden">
        ${generateDiagramSVG(components)}
      </div>
    </div>`:'';

  const tempDisplay = supplyTemp===returnTemp ? `${supplyTemp}°F` : `${supplyTemp}°F supply / ${returnTemp}°F return`;

  const html=`<!DOCTYPE html><html><head><meta charset="utf-8"/>
<title>Head Loss — ${projectName||'Untitled'}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:Arial,Helvetica,sans-serif;font-size:10px;color:#0f172a;background:white;padding:32px 44px}
.top-bar{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #0f172a;padding-bottom:10px;margin-bottom:18px}
.firm{font-size:20px;font-weight:700;letter-spacing:-0.3px}
.firm-sub{font-size:9px;color:#64748b;margin-top:2px}
.doc-right{text-align:right;line-height:1.7}
.doc-title{font-size:13px;font-weight:700}
.sec{margin-bottom:16px}
.sec-hdr{font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.09em;color:#64748b;border-bottom:0.5px solid #e2e8f0;padding-bottom:3px;margin-bottom:8px}
.info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.info-item label{font-size:7.5px;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:#94a3b8;display:block;margin-bottom:1px}
.info-item .v{font-size:10px;font-weight:500}
table{width:100%;border-collapse:collapse}
thead tr{background:#f8fafc}
th{padding:5px 5px;font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#64748b;border-bottom:1px solid #e2e8f0}
th.c{text-align:center} th.r{text-align:right}
.sum-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:5px;padding:12px 16px;margin-top:14px}
.sum-row{display:flex;justify-content:space-between;padding:3px 0;font-size:9.5px;border-bottom:0.5px solid #eee}
.sum-row:last-child{border-bottom:none}
.sum-ttl{font-weight:700;font-size:11px;padding-top:7px}
.sum-des{font-weight:700;font-size:14px;color:#2563eb;padding-top:5px}
.ref-box{background:#f8fafc;border:0.5px solid #e2e8f0;border-radius:4px;padding:9px 12px;margin-top:14px;font-size:8px;color:#64748b;line-height:2}
.footer{margin-top:20px;padding-top:8px;border-top:0.5px solid #e2e8f0;display:flex;justify-content:space-between;font-size:7.5px;color:#94a3b8}
@page{size:letter portrait;margin:0}
</style></head><body>

<div class="top-bar">
  <div><div class="firm">MEP Calcs</div><div class="firm-sub">mepcalcs.com</div></div>
  <div class="doc-right">
    <div class="doc-title">Hydronic System Head Loss Calculation</div>
    <div style="font-size:9px;color:#475569">Darcy-Weisbach / K-Factor Method &nbsp;·&nbsp; ASHRAE HoF 2021, Ch. 22</div>
    <div style="font-size:9px;color:#475569">Date: ${today()} &nbsp;|&nbsp; Engineer: ${engineer||'_________________'}</div>
  </div>
</div>

<div class="sec">
  <div class="sec-hdr">Project Information</div>
  <div class="info-grid">
    <div class="info-item"><label>Project Name</label><div class="v">${projectName||'—'}</div></div>
    <div class="info-item"><label>Project Number</label><div class="v">${projectNum||'—'}</div></div>
    <div class="info-item"><label>Engineer</label><div class="v">${engineer||'—'}</div></div>
  </div>
</div>

<div class="sec">
  <div class="sec-hdr">System Parameters</div>
  <div class="info-grid">
    <div class="info-item"><label>System Type</label><div class="v">${sys}</div></div>
    <div class="info-item"><label>Supply / Return Temp</label><div class="v">${tempDisplay}</div></div>
    <div class="info-item"><label>Safety Factor</label><div class="v">${safetyFactor}</div></div>
  </div>
  <div style="margin-top:8px;font-size:8.5px;color:#475569;line-height:1.9">
    Supply side: ρ=${fluidSupply.density.toFixed(2)} lb/ft³, ν=${fluidSupply.nu.toExponential(2)} ft²/s &nbsp;|&nbsp;
    Return side: ρ=${fluidReturn.density.toFixed(2)} lb/ft³, ν=${fluidReturn.nu.toExponential(2)} ft²/s<br/>
    V = GPM × 0.002228 / A(ft²) &nbsp;|&nbsp; Δh<sub>pipe</sub> = f·(L/D)·(V²/2g) &nbsp;|&nbsp;
    Δh<sub>fitting</sub> = K·(V²/2g) &nbsp;|&nbsp; f = Colebrook-White (ASHRAE HoF 2021 Ch.22 Eq. 4)
  </div>
</div>

${diagramSection}

<div class="sec">
  <div class="sec-hdr">Index Circuit — Component Head Loss</div>
  <table>
    <thead><tr>
      <th class="c" style="width:24px">#</th>
      <th>Component / Description</th>
      <th class="c">GPM</th>
      <th class="c">Pipe Size</th>
      <th class="c">Velocity</th>
      <th class="c">f</th>
      <th class="c">K</th>
      <th class="r">Head Loss</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="font-size:8px;color:#94a3b8;margin-top:4px">[R] = Component in return-temperature zone</div>
</div>

<div class="sum-box">
  <div class="sec-hdr" style="margin-bottom:7px">Head Loss Summary</div>
  <div class="sum-row"><span>Pipe Friction Losses</span><span>${pipeLoss.toFixed(3)} ft</span></div>
  <div class="sum-row"><span>Fitting &amp; Valve Losses</span><span>${fitLoss.toFixed(3)} ft</span></div>
  <div class="sum-row"><span>Equipment &amp; Miscellaneous</span><span>${equipLoss.toFixed(3)} ft</span></div>
  <div class="sum-row sum-ttl"><span>System TDH (subtotal)</span><span>${totalHead.toFixed(3)} ft &nbsp;(${(totalHead*0.4335).toFixed(2)} PSI)</span></div>
  <div class="sum-row" style="padding-top:4px"><span>Design Safety Factor</span><span>× ${safetyFactor}</span></div>
  <div class="sum-row sum-des"><span>DESIGN TDH</span><span>${designHead.toFixed(2)} ft &nbsp;(${(designHead*0.4335).toFixed(2)} PSI)</span></div>
</div>

<div class="ref-box">
  <strong>References &amp; Methodology — ASHRAE Handbook of Fundamentals, 2021 I-P Edition, Chapter 22: Pipe Design</strong><br/>
  · Eq. 2: Darcy-Weisbach pipe friction — Δh = f·(L/D)·(V²/2g)<br/>
  · Eq. 4: Colebrook-White friction factor (iterative, 50 passes) — 1/√f = 1.74 − 2·log(2ε/D + 18.7/Re·√f)<br/>
  · Eq. 7: Fitting / valve head loss — Δh = K·(V²/2g)<br/>
  · Table 3: K Factors, Threaded Steel Pipe Fittings (ASHRAE HoF 2021 Ch.22)<br/>
  · Table 4: K Factors, Flanged Welded Steel Pipe Fittings (ASHRAE HoF 2021 Ch.22)<br/>
  · Table 6: K Values for Steel Ells, Reducers, Expansions with velocity interpolation — ASHRAE Research Project RP-968 (as cited in ASHRAE HoF 2021 Ch.22)<br/>
  · Table 7: K Values for Steel Pipe Tees — ASHRAE Research Projects RP-1034 (as cited in ASHRAE HoF 2021 Ch.22)<br/>
  · Table 16: Steel Pipe Dimensions — ASME Standard B36.10M, Schedule 40 (as cited in ASHRAE HoF 2021 Ch.22)<br/>
  · Table 17: Copper Tube Dimensions — ASTM Standard B88, Type L (as cited in ASHRAE HoF 2021 Ch.22)<br/>
  · For pipe sizes exceeding ASHRAE table limits (tees &gt;16", std. elbows &gt;12"): Crane Co., Flow of Fluids Through Valves, Fittings and Pipe, Technical Paper No. 410 (1988), Appendix A, Table A-26 through A-29<br/>
  Supply/return temperature zones: fluid properties computed separately at each temp; components tagged [R] use return-side properties.
  Assumptions: Threaded NPS &lt; 2½"; flanged/welded NPS ≥ 2½". Reducer K referenced to upstream pipe velocity (ASHRAE Table 6).
  Ball valve K=0.05 (turbulent, fully open). Butterfly valve K=0.30 generic — override with K=894·d⁴/Cv² (ASHRAE HoF 2021 Ch.22 Eq. 8).
  K-factor tolerance ±20–35% per ASHRAE HoF 2021 Ch.22 Table 5. Static lift for open loop systems only.
</div>

<div class="footer">
  <div>Generated by MEP Calcs · mepcalcs.com · ${today()}</div>
  <div>ASHRAE HoF 2021 Ch.22 / Crane TP-410 · For engineering review — verify before use on construction documents</div>
</div>

</body></html>`;

  const w=window.open('','_blank','width=870,height=1150');
  w.document.write(html);
  w.document.close();
  setTimeout(()=>w.print(),600);
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HydronicHeadLoss() {
  const [projectName,  setProjectName]  = useState('');
  const [projectNum,   setProjectNum]   = useState('');
  const [engineer,     setEngineer]     = useState('');
  const [systemType,   setSystemType]   = useState('cw');
  const [supplyTemp,   setSupplyTemp]   = useState(82);
  const [returnTemp,   setReturnTemp]   = useState(94);
  const [safetyFactor, setSafetyFactor] = useState(1.15);
  const [components,   setComponents]   = useState([]);
  const [currentGpm,   setCurrentGpm]   = useState('');
  const [activeCat,    setActiveCat]    = useState('pipe');
  const [addType,      setAddType]      = useState('pipe');
  const [addLabel,     setAddLabel]     = useState('');
  const [addGpm,       setAddGpm]       = useState('');
  const [addPipe,      setAddPipe]      = useState('8" Stl');
  const [addPipeDown,  setAddPipeDown]  = useState('6" Stl');
  const [addLength,    setAddLength]    = useState('');
  const [addQty,       setAddQty]       = useState('1');
  const [addManual,    setAddManual]    = useState('');
  const [addLift,      setAddLift]      = useState('');
  const [addKOverride, setAddKOverride] = useState('');
  const [includeDiagram,setIncludeDiagram]=useState(false);

  const tableScrollRef  = useRef(null);
  const diagScrollRef   = useRef(null);

  const fluidSupply = waterProps(supplyTemp);
  const fluidReturn = waterProps(returnTemp);
  const catItems    = CATEGORIES.find(c=>c.id===activeCat)?.items||[];
  const selectedDef = ALL_COMPS.find(c=>c.type===addType)||ALL_COMPS[0];

  useEffect(()=>{
    if (tableScrollRef.current) tableScrollRef.current.scrollTop=tableScrollRef.current.scrollHeight;
    if (diagScrollRef.current)  diagScrollRef.current.scrollTop=diagScrollRef.current.scrollHeight;
  },[components]);

  function handleSystemChange(val){
    setSystemType(val);
    setSupplyTemp(SYSTEM_DEFAULTS[val].supply);
    setReturnTemp(SYSTEM_DEFAULTS[val].return);
  }
  function handleCatChange(catId){
    setActiveCat(catId);
    const first=CATEGORIES.find(c=>c.id===catId)?.items[0];
    if(first) setAddType(first.type);
  }

  // ── Calc ──────────────────────────────────────────────────────────────────
  function calcComp(comp, fluid) {
    if (comp.type === '__zone_switch__') {
      return { hLoss:0, vFps:0, Re:0, f:0, K:null, detail:`─── Switch to ${comp.switchTo} temperature ───` };
    }
    if (comp.mode==='static') return {hLoss:parseFloat(comp.lift)||0,vFps:0,Re:0,f:0,K:null,detail:'Static lift — open loop only'};
    if (comp.mode==='manual') return {hLoss:parseFloat(comp.manual)||0,vFps:0,Re:0,f:0,K:null,detail:'Manufacturer / manual entry'};
    const pipe=PIPES.find(p=>p.label===comp.pipe)||PIPES[15];
    const gpm=parseFloat(comp.gpm)||0;
    const dFt=pipe.id/12,area=Math.PI*dFt*dFt/4;
    const vFps=(gpm*0.002228)/area;
    const Re=vFps*dFt/fluid.nu;
    const f=frictionFactor(Re,pipe.roughness,dFt);

    if (comp.type==='pipe') {
      const L=parseLength(comp.length);
      return {hLoss:f*(L/dFt)*(vFps*vFps)/(2*32.174),vFps,Re,f,K:null,
        detail:`${fmtLength(L)} · f=${f.toFixed(4)} · Re=${Math.round(Re).toLocaleString()} · V=${vFps.toFixed(2)} fps`};
    }
    if (comp.mode==='reducer') {
      const pd=PIPES.find(p=>p.label===comp.pipeDown)||pipe;
      const K=getReducerK(pipe.nominal,pd.nominal,vFps);
      const qty=parseInt(comp.qty)||1;
      return {hLoss:K*qty*(vFps*vFps)/(2*32.174),vFps,Re,f,K,
        detail:`K=${K.toFixed(3)} · ${pipe.label}→${pd.label} · ASHRAE Table 6${qty>1?` × ${qty}`:''}`};
    }
    let K,src;
    if (comp.kOverride&&parseFloat(comp.kOverride)) {
      K=parseFloat(comp.kOverride); src='user override';
    } else {
      const res=getK(comp.type,pipe.nominal,vFps);
      K=res.K; src=res.src;
    }
    if (K==null) return {hLoss:0,vFps,Re,f,K:null,detail:`No K data — enter manual override`};
    const qty=parseInt(comp.qty)||1;
    return {hLoss:K*qty*(vFps*vFps)/(2*32.174),vFps,Re,f,K,
      detail:`K=${K.toFixed(3)}${qty>1?` × ${qty}`:''} · ${src} · V=${vFps.toFixed(2)} fps${comp.kOverride?' ⚠':''}`};
  }

  // Assign zones and calculate
  const zonedComponents = assignZones(components);
  const results = zonedComponents.map(c => ({
    ...c,
    ...calcComp(c, c.zone==='return' ? fluidReturn : fluidSupply)
  }));

  const realResults = results.filter(r => r.type !== '__zone_switch__');
  const totalHead  = realResults.reduce((s,r)=>s+(r.hLoss||0),0);
  const designHead = totalHead*safetyFactor;
  const pipeLoss   = realResults.filter(r=>r.type==='pipe').reduce((s,r)=>s+(r.hLoss||0),0);
  const fitLoss    = realResults.filter(r=>r.mode==='fitting'||r.mode==='reducer').reduce((s,r)=>s+(r.hLoss||0),0);
  const equipLoss  = realResults.filter(r=>r.mode==='manual'||r.mode==='static').reduce((s,r)=>s+(r.hLoss||0),0);

  function addComponent() {
    const def=ALL_COMPS.find(c=>c.type===addType);
    if (!def) return;
    const gpmToUse=addGpm||currentGpm;
    if (def.mode!=='manual'&&def.mode!=='static'&&!gpmToUse) return;
    if (def.type==='pipe'&&!addLength) return;
    if (def.mode==='manual'&&!addManual) return;
    if (def.mode==='static'&&!addLift) return;
    if (def.type==='waferCheck'&&!addKOverride) return;
    setComponents(prev=>[...prev,{
      id:Date.now(),type:addType,mode:def.mode,
      label:addLabel||def.label,
      gpm:gpmToUse,pipe:addPipe,pipeDown:addPipeDown,
      length:addLength,qty:addQty||'1',
      manual:addManual,lift:addLift,kOverride:addKOverride||'',
    }]);
    if (gpmToUse) setCurrentGpm(gpmToUse);
    setAddLabel('');setAddLength('');setAddQty('1');
    setAddManual('');setAddLift('');setAddKOverride('');setAddGpm('');
  }

  function addZoneSwitch(switchTo) {
    setComponents(prev=>[...prev,{
      id:Date.now(),type:'__zone_switch__',switchTo,
    }]);
  }

  function handleKeyDown(e) {
    if (e.code==='Space'&&e.target.tagName!=='INPUT'&&e.target.tagName!=='SELECT'&&e.target.tagName!=='TEXTAREA') {
      e.preventDefault(); addComponent();
    }
    if (e.key==='Enter') addComponent();
  }

  useEffect(()=>{
    window.addEventListener('keydown',handleKeyDown);
    return ()=>window.removeEventListener('keydown',handleKeyDown);
  });

  function removeComp(id){setComponents(p=>p.filter(c=>c.id!==id));}
  function moveComp(id,dir){
    setComponents(prev=>{
      const i=prev.findIndex(c=>c.id===id);
      if(i<0) return prev;
      const n=[...prev],j=i+dir;
      if(j<0||j>=n.length) return prev;
      [n[i],n[j]]=[n[j],n[i]]; return n;
    });
  }

  // Determine what the current "active" zone is based on last switch
  const currentZone = (() => {
    let z = 'supply';
    for (const c of components) {
      if (c.type === '__zone_switch__') z = c.switchTo;
    }
    return z;
  })();

  // ── Styles ────────────────────────────────────────────────────────────────
  const inp  = {background:'var(--bg-input)',border:'0.5px solid var(--border-primary)',borderRadius:'6px',padding:'6px 10px',fontSize:'13px',color:'var(--text-primary)',outline:'none',width:'100%'};
  const lbl  = {fontSize:'10px',fontWeight:500,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em',display:'block',marginBottom:'3px'};
  const card = {background:'var(--bg-card)',border:'0.5px solid var(--border-primary)',borderRadius:'10px',padding:'16px',marginBottom:'12px'};
  const secH = {fontSize:'11px',fontWeight:500,letterSpacing:'0.07em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:'10px'};
  const btnP = {background:'var(--brand)',color:'white',border:'none',borderRadius:'7px',padding:'7px 16px',fontSize:'13px',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'};
  const btnG = {background:'transparent',color:'var(--text-secondary)',border:'0.5px solid var(--border-primary)',borderRadius:'7px',padding:'7px 14px',fontSize:'13px',cursor:'pointer'};
  const btnZone = {background:'#fff7ed',color:'#f97316',border:'0.5px solid #fed7aa',borderRadius:'6px',padding:'5px 10px',fontSize:'11px',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'};
  const btnZoneBlue = {background:'var(--bg-accent)',color:'var(--brand)',border:'0.5px solid var(--border-primary)',borderRadius:'6px',padding:'5px 10px',fontSize:'11px',fontWeight:500,cursor:'pointer',whiteSpace:'nowrap'};
  const frow = {display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'flex-end',marginBottom:'8px'};

  return (
    <main style={{minHeight:'100vh',background:'var(--bg-primary)',padding:'24px'}}>
      <div style={{maxWidth:'980px',margin:'0 auto'}}>

        {/* Header */}
        <div style={{marginBottom:'20px'}}>
          <h1 style={{fontSize:'20px',fontWeight:500,letterSpacing:'-0.2px',marginBottom:'4px'}}>
            <span style={{color:'var(--brand)'}}>Hydronic</span>
            <span style={{color:'var(--text-secondary)'}}> Head Loss Calculator</span>
          </h1>
          <p style={{fontSize:'12px',color:'var(--text-tertiary)'}}>
            Total Dynamic Head (TDH) · Darcy-Weisbach / K-factor · ASHRAE HoF 2021 Ch.22 + Crane TP-410
          </p>
        </div>

        {/* Project Info */}
        <div style={card}>
          <p style={secH}>Project Information</p>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap'}}>
            <div style={{flex:2,minWidth:'160px'}}><label style={lbl}>Project Name</label><input style={inp} value={projectName} onChange={e=>setProjectName(e.target.value)} placeholder="Project name"/></div>
            <div style={{flex:1,minWidth:'120px'}}><label style={lbl}>Project Number</label><input style={inp} value={projectNum} onChange={e=>setProjectNum(e.target.value)} placeholder="Project number"/></div>
            <div style={{flex:1,minWidth:'120px'}}><label style={lbl}>Engineer</label><input style={inp} value={engineer} onChange={e=>setEngineer(e.target.value)} placeholder="Engineer name"/></div>
          </div>
        </div>

        {/* System Settings */}
        <div style={card}>
          <p style={secH}>System Settings</p>
          <div style={{display:'flex',gap:'12px',flexWrap:'wrap',alignItems:'flex-end'}}>
            <div style={{flex:2,minWidth:'150px'}}>
              <label style={lbl}>System Type</label>
              <select style={inp} value={systemType} onChange={e=>handleSystemChange(e.target.value)}>
                {Object.entries(SYSTEM_DEFAULTS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <div style={{flex:1,minWidth:'110px'}}><label style={lbl}>Supply Temp (°F)</label><input style={inp} type="number" value={supplyTemp} onChange={e=>setSupplyTemp(parseFloat(e.target.value)||60)}/></div>
            <div style={{flex:1,minWidth:'110px'}}><label style={lbl}>Return Temp (°F)</label><input style={inp} type="number" value={returnTemp} onChange={e=>setReturnTemp(parseFloat(e.target.value)||60)}/></div>
            <div style={{flex:1,minWidth:'110px'}}><label style={lbl}>Safety Factor</label><input style={inp} type="number" step="0.05" value={safetyFactor} onChange={e=>setSafetyFactor(parseFloat(e.target.value)||1.0)}/></div>
            <div style={{flex:1,minWidth:'130px'}}>
              <label style={lbl}>Starting GPM</label>
              <input style={{...inp,borderColor:currentGpm?'var(--brand)':'var(--border-primary)'}} type="number" value={currentGpm} onChange={e=>setCurrentGpm(e.target.value)} placeholder="e.g. 1101"/>
            </div>
          </div>
          <div style={{marginTop:'10px',display:'flex',gap:'16px',flexWrap:'wrap',fontSize:'11px',color:'var(--text-muted)'}}>
            <div><span style={{color:'var(--brand)',fontWeight:600}}>Supply {supplyTemp}°F:</span> ρ={fluidSupply.density.toFixed(2)} lb/ft³, ν={fluidSupply.nu.toExponential(2)} ft²/s</div>
            <div><span style={{color:'#f97316',fontWeight:600}}>Return {returnTemp}°F:</span> ρ={fluidReturn.density.toFixed(2)} lb/ft³, ν={fluidReturn.nu.toExponential(2)} ft²/s</div>
          </div>
        </div>

        {/* Circuit Diagram */}
        {components.filter(c=>c.type!=='__zone_switch__').length>0&&(
          <div style={card}>
            <p style={secH}>Circuit Diagram</p>
            <div ref={diagScrollRef}>
              <CircuitDiagram components={zonedComponents}/>
            </div>
          </div>
        )}

        {/* Component Table */}
        <div style={card}>
          <p style={secH}>Index Circuit Components</p>

          <div style={{display:'grid',gridTemplateColumns:'28px 2.2fr 0.65fr 1.1fr 0.75fr 0.65fr 0.6fr 0.85fr 56px',gap:'4px',padding:'0 6px 8px',borderBottom:'0.5px solid var(--border-primary)',marginBottom:'4px'}}>
            {['#','Component','GPM','Pipe','Vel.','f','K','Head Loss',''].map((h,i)=>(
              <span key={i} style={{fontSize:'10px',fontWeight:500,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>{h}</span>
            ))}
          </div>

          <div ref={tableScrollRef} style={{maxHeight:'360px',overflowY:'auto',marginBottom:'4px'}}>
            {results.length===0&&(
              <div style={{textAlign:'center',padding:'28px',color:'var(--text-muted)',fontSize:'13px'}}>
                Set starting GPM above, then add components below
              </div>
            )}
            {(() => {
              let visibleIdx = 0;
              return results.map((comp,idx)=>{
                if (comp.type === '__zone_switch__') {
                  const isReturn = comp.switchTo === 'return';
                  const color = isReturn ? '#f97316' : 'var(--brand)';
                  const bg = isReturn ? '#fff7ed' : 'var(--bg-accent)';
                  const tempVal = isReturn ? returnTemp : supplyTemp;
                  return (
                    <div key={comp.id} style={{display:'flex',alignItems:'center',gap:'8px',padding:'6px 10px',background:bg,border:`0.5px dashed ${color}`,borderRadius:'6px',marginBottom:'4px'}}>
                      <span style={{fontSize:'10px',fontWeight:600,color,letterSpacing:'0.08em',textTransform:'uppercase',flex:1,textAlign:'center'}}>
                        ─── Switch to {comp.switchTo} temp ({tempVal}°F) ───
                      </span>
                      <button onClick={()=>removeComp(comp.id)} style={{background:'none',border:'none',cursor:'pointer',color,fontSize:'12px'}}>✕</button>
                    </div>
                  );
                }
                visibleIdx += 1;
                const isEquip=comp.mode==='manual'||comp.mode==='static';
                const zoneStyle = comp.zone==='return'
                  ? {borderLeft:'3px solid #f97316',background:idx%2===0?'#fff7ed':'#fffbf5'}
                  : {background:idx%2===0?'var(--bg-tertiary)':'transparent'};
                return (
                  <div key={comp.id} style={{display:'grid',gridTemplateColumns:'28px 2.2fr 0.65fr 1.1fr 0.75fr 0.65fr 0.6fr 0.85fr 56px',gap:'4px',padding:'7px 6px',...zoneStyle,borderRadius:'6px',alignItems:'center',marginBottom:'2px'}}>
                    <span style={{fontSize:'11px',color:'var(--text-muted)'}}>{visibleIdx}</span>
                    <div>
                      <div style={{fontSize:'12px',color:'var(--text-primary)',fontWeight:500}}>
                        {comp.label}
                        {comp.zone==='return' && <span style={{marginLeft:'6px',fontSize:'9px',color:'#f97316',fontWeight:600}}>[RETURN]</span>}
                      </div>
                      <div style={{fontSize:'10px',color:'var(--text-muted)',marginTop:'1px'}}>{comp.detail}</div>
                    </div>
                    <span style={{fontSize:'12px',color:'var(--text-secondary)'}}>{isEquip?'—':comp.gpm}</span>
                    <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>{isEquip?'—':comp.mode==='reducer'?`${comp.pipe}→${comp.pipeDown}`:comp.pipe}</span>
                    <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>{comp.vFps?`${comp.vFps.toFixed(1)} fps`:'—'}</span>
                    <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>{comp.f?comp.f.toFixed(4):'—'}</span>
                    <span style={{fontSize:'11px',color:'var(--text-secondary)'}}>{comp.K!=null?comp.K.toFixed(3):'—'}</span>
                    <span style={{fontSize:'12px',color:'var(--text-accent)',fontWeight:500}}>{(comp.hLoss||0).toFixed(3)} ft</span>
                    <div style={{display:'flex',gap:'2px'}}>
                      <button onClick={()=>moveComp(comp.id,-1)} style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'12px',padding:'2px 3px'}}>↑</button>
                      <button onClick={()=>moveComp(comp.id,1)}  style={{background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',fontSize:'12px',padding:'2px 3px'}}>↓</button>
                      <button onClick={()=>removeComp(comp.id)}  style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',           fontSize:'12px',padding:'2px 3px'}}>✕</button>
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* Zone switch buttons */}
          {components.length>0 && (
            <div style={{display:'flex',gap:'6px',marginTop:'8px',padding:'8px 10px',background:'var(--bg-tertiary)',borderRadius:'6px',border:'0.5px solid var(--border-primary)'}}>
              <span style={{fontSize:'11px',color:'var(--text-muted)',marginRight:'auto'}}>
                Current zone: <strong style={{color:currentZone==='return'?'#f97316':'var(--brand)'}}>
                  {currentZone.toUpperCase()} ({currentZone==='return'?returnTemp:supplyTemp}°F)
                </strong>
              </span>
              {currentZone==='supply' ? (
                <button style={btnZone} onClick={()=>addZoneSwitch('return')}>
                  ↓ Switch to Return Temp ({returnTemp}°F)
                </button>
              ) : (
                <button style={btnZoneBlue} onClick={()=>addZoneSwitch('supply')}>
                  ↓ Switch to Supply Temp ({supplyTemp}°F)
                </button>
              )}
            </div>
          )}

          {/* ── Add Row ── */}
          <div style={{borderTop:'0.5px solid var(--border-primary)',marginTop:'14px',paddingTop:'14px'}}>
            <p style={{...secH,marginBottom:'10px'}}>Add Component <span style={{fontSize:'10px',fontWeight:400,color:'var(--text-muted)',textTransform:'none',letterSpacing:0}}>(press Enter or Space to add)</span></p>

            <div style={{display:'flex',gap:'6px',marginBottom:'12px',flexWrap:'wrap'}}>
              {CATEGORIES.map(cat=>(
                <button key={cat.id} onClick={()=>handleCatChange(cat.id)} style={{
                  padding:'5px 14px',borderRadius:'20px',fontSize:'12px',fontWeight:500,cursor:'pointer',
                  border:'0.5px solid var(--border-primary)',
                  background:activeCat===cat.id?'var(--brand)':'var(--bg-tertiary)',
                  color:activeCat===cat.id?'white':'var(--text-secondary)',
                }}>{cat.label}</button>
              ))}
            </div>

            <div style={frow}>
              <div style={{flex:2,minWidth:'180px'}}>
                <label style={lbl}>Type</label>
                <select style={inp} value={addType} onChange={e=>setAddType(e.target.value)}>
                  {catItems.map(item=><option key={item.type} value={item.type}>{item.label}</option>)}
                </select>
              </div>
              <div style={{flex:2,minWidth:'160px'}}>
                <label style={lbl}>Label (optional)</label>
                <input style={inp} value={addLabel} onChange={e=>setAddLabel(e.target.value)} placeholder={selectedDef?.label||''}/>
              </div>
            </div>

            <div style={frow}>
              {(selectedDef?.mode==='pipe'||selectedDef?.mode==='fitting'||selectedDef?.mode==='reducer')&&(
                <div style={{flex:1,minWidth:'90px'}}>
                  <label style={lbl}>GPM{currentGpm?` (${currentGpm})`:''}</label>
                  <input style={{...inp,borderColor:addGpm?'var(--brand)':currentGpm?'var(--border-primary)':'#ef4444'}}
                    type="number" value={addGpm} onChange={e=>setAddGpm(e.target.value)} placeholder={currentGpm||'required'}/>
                </div>
              )}
              {(selectedDef?.mode==='pipe'||selectedDef?.mode==='fitting'||selectedDef?.mode==='reducer')&&(
                <div style={{flex:1,minWidth:'130px'}}>
                  <label style={lbl}>{selectedDef?.mode==='reducer'?'Upstream Pipe':'Pipe Size'}</label>
                  <select style={inp} value={addPipe} onChange={e=>setAddPipe(e.target.value)}>
                    {PIPES.map(p=><option key={p.label} value={p.label}>{p.label} — ID {p.id}"</option>)}
                  </select>
                </div>
              )}
              {selectedDef?.mode==='reducer'&&(
                <div style={{flex:1,minWidth:'130px'}}>
                  <label style={lbl}>Downstream Pipe</label>
                  <select style={inp} value={addPipeDown} onChange={e=>setAddPipeDown(e.target.value)}>
                    {PIPES.map(p=><option key={p.label} value={p.label}>{p.label} — ID {p.id}"</option>)}
                  </select>
                </div>
              )}
              {selectedDef?.mode==='pipe'&&(
                <div style={{flex:1,minWidth:'120px'}}>
                  <label style={lbl}>Length (ft or ft-in)</label>
                  <input style={inp} value={addLength} onChange={e=>setAddLength(e.target.value)} placeholder="e.g. 19-9 or 19.75"/>
                </div>
              )}
              {(selectedDef?.mode==='fitting'||selectedDef?.mode==='reducer')&&(
                <div style={{flex:1,minWidth:'60px'}}>
                  <label style={lbl}>Qty</label>
                  <input style={inp} type="number" value={addQty} onChange={e=>setAddQty(e.target.value)} min="1" placeholder="1"/>
                </div>
              )}
              {selectedDef?.mode==='fitting'&&(
                <div style={{flex:1,minWidth:'90px'}}>
                  <label style={lbl}>{selectedDef.type==='waferCheck'?'K (required)':'K Override'}</label>
                  <input style={{...inp,borderColor:selectedDef.type==='waferCheck'&&!addKOverride?'#ef4444':'var(--border-primary)'}}
                    type="number" step="0.001" value={addKOverride} onChange={e=>setAddKOverride(e.target.value)}
                    placeholder={selectedDef.type==='waferCheck'?'required':'auto'}/>
                </div>
              )}
              {selectedDef?.mode==='manual'&&(
                <div style={{flex:1,minWidth:'140px'}}>
                  <label style={lbl}>Pressure Drop (ft w.g.)</label>
                  <input style={inp} type="number" value={addManual} onChange={e=>setAddManual(e.target.value)} placeholder="e.g. 25.0"/>
                </div>
              )}
              {selectedDef?.mode==='static'&&(
                <div style={{flex:1,minWidth:'140px'}}>
                  <label style={lbl}>Static Lift (ft)</label>
                  <input style={inp} type="number" value={addLift} onChange={e=>setAddLift(e.target.value)} placeholder="e.g. 17.0"/>
                </div>
              )}
              <button style={btnP} onClick={addComponent}>Add ↵</button>
            </div>

            {selectedDef?.mode==='static'&&(
              <div style={{fontSize:'11px',color:'var(--text-muted)',padding:'7px 10px',background:'var(--bg-tertiary)',borderRadius:'6px',border:'0.5px solid var(--border-primary)'}}>
                ⚠ Static lift applies to open loop systems only. In closed loops (CHW, HHW, closed CW), static head cancels and should not be included.
              </div>
            )}
            {selectedDef?.mode==='fitting'&&(
              <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'4px'}}>
                {selectedDef.type==='waferCheck'?'Wafer check K must be entered from manufacturer data. '
                  :selectedDef.type==='butterfly'?'Butterfly valve K=0.30 generic. For mfr. data: K = 894 × d⁴(in) / Cv² (ASHRAE HoF 2021 Ch.22 Eq. 8). '
                  :'K override: leave blank for ASHRAE/Crane table value. '}
              </div>
            )}
            {selectedDef?.mode==='pipe'&&(
              <div style={{fontSize:'11px',color:'var(--text-muted)',marginTop:'4px'}}>Length: decimal ft (19.75) or ft-in (19-9)</div>
            )}
          </div>

          {realResults.length>0&&(
            <div style={{borderTop:'0.5px solid var(--border-primary)',marginTop:'14px',paddingTop:'12px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:'16px'}}>
              <div style={{fontSize:'12px',color:'var(--text-muted)',lineHeight:2.2}}>
                <div>Pipe friction: <strong style={{color:'var(--text-secondary)'}}>{pipeLoss.toFixed(3)} ft</strong></div>
                <div>Fittings &amp; valves: <strong style={{color:'var(--text-secondary)'}}>{fitLoss.toFixed(3)} ft</strong></div>
                <div>Equipment &amp; misc: <strong style={{color:'var(--text-secondary)'}}>{equipLoss.toFixed(3)} ft</strong></div>
                <div style={{borderTop:'0.5px solid var(--border-primary)',marginTop:'4px',paddingTop:'4px'}}>
                  System TDH: <strong style={{color:'var(--text-secondary)'}}>{totalHead.toFixed(3)} ft</strong> × {safetyFactor}
                </div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'11px',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.07em'}}>Design TDH</div>
                <div style={{fontSize:'30px',fontWeight:600,color:'var(--brand)',letterSpacing:'-0.5px'}}>{designHead.toFixed(2)} ft</div>
                <div style={{fontSize:'12px',color:'var(--text-muted)'}}>{(designHead*0.4335).toFixed(2)} PSI</div>
              </div>
            </div>
          )}
        </div>

        {realResults.length>0&&(
          <div style={{display:'flex',justifyContent:'flex-end',alignItems:'center',gap:'16px',marginBottom:'24px'}}>
            <label style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'12px',color:'var(--text-secondary)',cursor:'pointer'}}>
              <input type="checkbox" checked={includeDiagram} onChange={e=>setIncludeDiagram(e.target.checked)} style={{accentColor:'var(--brand)'}}/>
              Include circuit diagram in report
            </label>
            <button style={btnG} onClick={()=>printReport({projectName,projectNum,engineer,systemType,supplyTemp,returnTemp,safetyFactor,results,totalHead,designHead,pipeLoss,fitLoss,equipLoss,fluidSupply,fluidReturn,includeDiagram,components:zonedComponents})}>
              Generate Report
            </button>
          </div>
        )}

        <div style={{...card,marginTop:'8px'}}>
          <p style={secH}>Methodology &amp; References</p>
          <div style={{fontSize:'11px',color:'var(--text-muted)',lineHeight:1.9}}>
            <div><strong style={{color:'var(--text-secondary)'}}>Pipe:</strong> Δh = f·(L/D)·(V²/2g) — ASHRAE HoF 2021 Ch.22 Eq. 2</div>
            <div><strong style={{color:'var(--text-secondary)'}}>Fittings:</strong> Δh = K·(V²/2g) — ASHRAE HoF 2021 Ch.22 Eq. 7</div>
            <div><strong style={{color:'var(--text-secondary)'}}>Friction factor:</strong> Colebrook-White (50-iteration) — ASHRAE HoF 2021 Ch.22 Eq. 4</div>
            <div><strong style={{color:'var(--text-secondary)'}}>K-factors:</strong> ASHRAE HoF 2021 Ch.22 Tables 3,4,6,7 (with velocity interpolation for Table 6 LR ells)</div>
            <div><strong style={{color:'var(--text-secondary)'}}>Large pipe K-factors</strong> (tees &gt;16", std. elbows &gt;12"): Crane TP-410 A-26 through A-29</div>
            <div><strong style={{color:'var(--text-secondary)'}}>Pipe dimensions:</strong> ASME B36.10M Sch.40 (Table 16) · ASTM B88 Type L (Table 17) — as cited in ASHRAE HoF 2021 Ch.22</div>
            <div><strong style={{color:'var(--text-secondary)'}}>Temperature zones:</strong> Fluid properties computed separately at supply and return temps; components tagged by zone based on their position relative to the zone-switch dividers.</div>
            <div style={{color:'var(--text-tertiary)',marginTop:'4px'}}>
              Threaded NPS&lt;2½" · Flanged/welded NPS≥2½" · Reducer K ref. upstream velocity · K tolerance ±20–35% per ASHRAE Table 5
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}