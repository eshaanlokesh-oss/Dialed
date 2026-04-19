// App.jsx — Dialed v7 (Beams)
import React, { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } from "react";
import { EXERCISES, ACHIEVEMENTS, MUSCLE_COLORS, MUSCLE_GROUPS, getExerciseById, getPrimaryColor } from "./data";
import { getExerciseIcon } from "./icons";

// ─── THEME ──────────────────────────────────────────────────────────────────
const THEMES={emerald:{accent:"#34d399",glow:"#10b981",name:"Emerald"},red:{accent:"#f43f5e",glow:"#e11d48",name:"Crimson"},blue:{accent:"#7dd3fc",glow:"#38bdf8",name:"Ice"},purple:{accent:"#a78bfa",glow:"#8b5cf6",name:"Violet"},orange:{accent:"#fb923c",glow:"#f97316",name:"Blaze"},gold:{accent:"#facc15",glow:"#eab308",name:"Gold"},pink:{accent:"#fb7185",glow:"#f43f5e",name:"Rose"}};
const ThemeCtx=createContext(THEMES.emerald);const useTheme=()=>useContext(ThemeCtx);
const hx=(hex,a)=>{const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return`rgba(${r},${g},${b},${a})`;};
const h2r=(hex)=>{if(!hex||hex.length<7)return'52,211,153';return`${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;};

// ─── STARTER ROUTINES ───────────────────────────────────────────────────────
const SR={2:[{name:"Full Body A",exercises:[{exerciseId:"squat",sets:3},{exerciseId:"bench_press",sets:3},{exerciseId:"seated_row",sets:3},{exerciseId:"cable_crunch",sets:3},{exerciseId:"tricep_pushdown",sets:3}]},{name:"Full Body B",exercises:[{exerciseId:"db_incline_bench",sets:3},{exerciseId:"lat_pulldown",sets:3},{exerciseId:"leg_extension",sets:3},{exerciseId:"db_curl",sets:3},{exerciseId:"leg_curl",sets:3},{exerciseId:"cable_lateral_raise",sets:3}]}],3:[{name:"Push",exercises:[{exerciseId:"bench_press",sets:3},{exerciseId:"db_shoulder_press",sets:3},{exerciseId:"db_incline_bench",sets:3},{exerciseId:"lateral_raise",sets:3},{exerciseId:"tricep_pushdown",sets:3}]},{name:"Pull",exercises:[{exerciseId:"barbell_row",sets:3},{exerciseId:"lat_pulldown",sets:3},{exerciseId:"seated_row",sets:3},{exerciseId:"face_pull",sets:3},{exerciseId:"barbell_curl",sets:3}]},{name:"Legs",exercises:[{exerciseId:"squat",sets:3},{exerciseId:"rdl",sets:3},{exerciseId:"leg_press",sets:3},{exerciseId:"leg_curl",sets:3},{exerciseId:"calf_raise",sets:3},{exerciseId:"hanging_leg_raise",sets:3}]}],4:[{name:"Upper A",exercises:[{exerciseId:"bench_press",sets:3},{exerciseId:"db_shoulder_press",sets:3},{exerciseId:"db_incline_bench",sets:3},{exerciseId:"lateral_raise",sets:3},{exerciseId:"tricep_pushdown",sets:3},{exerciseId:"cable_crunch",sets:3}]},{name:"Lower A",exercises:[{exerciseId:"squat",sets:3},{exerciseId:"leg_press",sets:3},{exerciseId:"leg_extension",sets:3},{exerciseId:"rdl",sets:3},{exerciseId:"calf_raise",sets:3}]},{name:"Upper B",exercises:[{exerciseId:"barbell_row",sets:3},{exerciseId:"lat_pulldown",sets:3},{exerciseId:"seated_row",sets:3},{exerciseId:"face_pull",sets:3},{exerciseId:"barbell_curl",sets:3},{exerciseId:"hammer_curl",sets:3}]},{name:"Lower B",exercises:[{exerciseId:"deadlift",sets:3},{exerciseId:"leg_curl",sets:3},{exerciseId:"hip_thrust",sets:3},{exerciseId:"bulgarian_split",sets:3},{exerciseId:"calf_raise",sets:3}]}]};SR[5]=SR[3];SR[6]=SR[3];
const ST={2:{mon:0,tue:null,wed:null,thu:1,fri:null,sat:null,sun:null},3:{mon:0,tue:null,wed:1,thu:null,fri:2,sat:null,sun:null},4:{mon:0,tue:1,wed:null,thu:2,fri:3,sat:null,sun:null},5:{mon:0,tue:1,wed:2,thu:0,fri:1,sat:null,sun:null},6:{mon:0,tue:1,wed:2,thu:0,fri:1,sat:2,sun:null}};

// ─── STORAGE ────────────────────────────────────────────────────────────────
const LS={get:(k,d=null)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}},set:(k,v)=>localStorage.setItem(k,JSON.stringify(v))};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

// ─── UTILS ──────────────────────────────────────────────────────────────────
const pad=n=>String(n).padStart(2,"0");
const fmtTime=s=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h>0?`${pad(h)}:${pad(m)}:${pad(sec)}`:`${pad(m)}:${pad(sec)}`;};
const fmtDur=s=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60);return h>0?`${h}h ${m}m`:`${m}m`;};
const est1RM=(w,r)=>r<=0||w<=0?0:Math.round(w*(36/(37-Math.min(r,36))));
const dKey=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const DS=["mon","tue","wed","thu","fri","sat","sun"];
const DL=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const fmt12=t=>{if(!t)return"";const[h,m]=t.split(":").map(Number);return`${h>12?h-12:h===0?12:h}:${pad(m)} ${h>=12?"PM":"AM"}`;};

function getStreakInfo(h,t=5){if(!h?.length)return{count:0,display:"0"};const now=new Date(),s=new Date(now);s.setDate(now.getDate()-((now.getDay()+6)%7));s.setHours(0,0,0,0);const d=new Set();h.forEach(w=>{const x=new Date(w.date);if(x>=s)d.add(x.toDateString());});return{count:d.size,display:`${d.size}`};}
function getWeekVol(h,off=0){const now=new Date(),s=new Date(now);s.setDate(now.getDate()-((now.getDay()+6)%7)-off*7);s.setHours(0,0,0,0);const e=new Date(s);e.setDate(s.getDate()+7);const d=[0,0,0,0,0,0,0];let tot=0,wk=0,prs=0;(h||[]).forEach(w=>{const x=new Date(w.date);if(x>=s&&x<e){d[(x.getDay()+6)%7]+=w.totalVolume||0;tot+=w.totalVolume||0;wk++;prs+=(w.prs||[]).length;}});return{data:d,total:tot,workouts:wk,prs};}
function getPrevBest(h,id){let b=null;(h||[]).forEach(w=>(w.exercises||[]).forEach(ex=>{if(ex.exerciseId===id)(ex.sets||[]).forEach(s=>{if(!b||(s.weight||0)>b.weight)b={weight:s.weight||0,reps:s.reps||0};});}));return b;}
function getPrevSets(h,id){for(let i=(h||[]).length-1;i>=0;i--){const ex=(h[i].exercises||[]).find(e=>e.exerciseId===id);if(ex?.sets?.length)return ex.sets;}return null;}
function getRecIds(h,n=6){const s=[];for(let i=(h||[]).length-1;i>=0;i--){(h[i].exercises||[]).forEach(ex=>{if(!s.includes(ex.exerciseId))s.push(ex.exerciseId);});if(s.length>=n)break;}return s.slice(0,n);}
function getExHist(h,id){const p=[];(h||[]).forEach(w=>{(w.exercises||[]).forEach(ex=>{if(ex.exerciseId===id){let bw=0,br=0,vol=0;(ex.sets||[]).forEach(s=>{const wt=s.weight||0,rp=s.reps||0;vol+=wt*rp;if(wt>bw||(wt===bw&&rp>br)){bw=wt;br=rp;}});if(bw>0||vol>0)p.push({date:w.date,bestWeight:bw,bestReps:br,volume:vol,est1rm:est1RM(bw,br)});}});});return p;}
function getMuscVol(h){const now=new Date(),s=new Date(now);s.setDate(now.getDate()-((now.getDay()+6)%7));s.setHours(0,0,0,0);const mv={};(h||[]).forEach(w=>{const d=new Date(w.date);if(d>=s)(w.exercises||[]).forEach(ex=>{const data=getExerciseById(ex.exerciseId);if(data)(data.primary||[]).forEach(m=>{if(!mv[m])mv[m]={sets:0,volume:0};(ex.sets||[]).forEach(st=>{mv[m].sets++;mv[m].volume+=(st.weight||0)*(st.reps||0);});});});});return mv;}
function getTodayPlan(routines){const tmpl=LS.get("dialed_weekly_template",{});const plans=LS.get("dialed_plans",{});const today=dKey(new Date());const dayKey=DS[(new Date().getDay()+6)%7];if(plans[today]){const p=plans[today];const r=routines.find(x=>x.id===p.routineId);return r?{routine:r,time:p.time}:null;}if(tmpl[dayKey]){const t=tmpl[dayKey];const r=routines.find(x=>x.id===t.routineId);return r?{routine:r,time:t.time}:null;}return null;}
function checkAch(h){const u=[],ct=(h||[]).length;let tv=0,tp=0,eu=new Set();if(ct>=1)u.push("first_workout");if(ct>=10)u.push("workouts_10");if(ct>=25)u.push("workouts_25");if(ct>=50)u.push("workouts_50");if(ct>=100)u.push("workouts_100");if(ct>=200)u.push("workouts_200");(h||[]).forEach(w=>{tv+=w.totalVolume||0;tp+=(w.prs||[]).length;(w.exercises||[]).forEach(ex=>{eu.add(ex.exerciseId);(ex.sets||[]).forEach(s=>{const wt=s.weight||0,id=ex.exerciseId;if(id==="bench_press"){if(wt>=135)u.push("bench_135");if(wt>=225)u.push("bench_225");if(wt>=315)u.push("bench_315");}if(id==="squat"){if(wt>=225)u.push("squat_225");if(wt>=315)u.push("squat_315");}if(id==="deadlift"){if(wt>=315)u.push("deadlift_315");if(wt>=405)u.push("deadlift_405");}});});});if(tv>=100000)u.push("vol_100k");if(tv>=500000)u.push("vol_500k");if(tv>=1000000)u.push("vol_1m");if(eu.size>=20)u.push("exercises_20");if(tp>=5)u.push("prs_5");if(tp>=25)u.push("prs_25");if(tp>=50)u.push("prs_50");return[...new Set(u)];}

// ─── BEAMS CANVAS (from Claude Design handoff) ─────────────────────────────
function BeamsCanvas({accent}){const ref=useRef(null);const accentRef=useRef(accent);useEffect(()=>{accentRef.current=accent;},[accent]);
useEffect(()=>{const canvas=ref.current;if(!canvas)return;const ctx=canvas.getContext('2d');const resize=()=>{const p=canvas.parentElement;if(!p)return;const dpr=window.devicePixelRatio||1;canvas.width=p.offsetWidth*dpr;canvas.height=p.offsetHeight*dpr;canvas.style.width=p.offsetWidth+'px';canvas.style.height=p.offsetHeight+'px';ctx.scale(dpr,dpr);};resize();
const W=()=>canvas.parentElement?.offsetWidth||390;const H=()=>canvas.parentElement?.offsetHeight||844;
class Beam{reset(scatter){const w=W(),h=H();this.x=40+Math.random()*(w-80);this.y=scatter?Math.random()*h:h+60+Math.random()*180;this.vy=-(0.55+Math.random()*1.3);this.vx=(Math.random()-0.5)*0.35;this.rx=60+Math.random()*120;this.ry=160+Math.random()*320;this.baseA=0.48+Math.random()*0.44;this.phase=Math.random()*Math.PI*2;this.ps=0.007+Math.random()*0.016;this.wo=Math.random()*Math.PI*2;this.ws=0.004+Math.random()*0.007;this.life=scatter?Math.random()*500:0;this.maxLife=420+Math.random()*340;}constructor(s){this.reset(s);}update(t){this.wo+=this.ws;this.x+=this.vx+Math.sin(this.wo)*0.22;this.y+=this.vy;this.life++;const pulse=0.68+0.32*Math.sin(t*this.ps+this.phase);const fi=Math.min(this.life/90,1);const fo=Math.min((this.maxLife-this.life)/90,1);this.alpha=this.baseA*pulse*fi*fo*0.36;}draw(ctx){const rgb=h2r(accentRef.current);ctx.save();ctx.filter='blur(24px)';const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.rx*1.6);g.addColorStop(0,`rgba(${rgb},${Math.min(this.alpha,1)})`);g.addColorStop(0.3,`rgba(${rgb},${Math.min(this.alpha*0.6,1)})`);g.addColorStop(1,`rgba(${rgb},0)`);ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(this.x,this.y,this.rx,this.ry,0,0,Math.PI*2);ctx.fill();ctx.restore();}dead(){return this.life>=this.maxLife||this.y<-(this.ry+20);}}
let beams=Array.from({length:16},()=>new Beam(true));let t=0,raf;
const tick=()=>{const w=W(),h=H();ctx.clearRect(0,0,w*2,h*2);t++;beams=beams.filter(b=>!b.dead());while(beams.length<16)beams.push(new Beam(false));beams.forEach(b=>{b.update(t);b.draw(ctx);});raf=requestAnimationFrame(tick);};tick();
window.addEventListener('resize',resize);return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);};},[]);
return<canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}/>;}

// ─── FILM GRAIN ─────────────────────────────────────────────────────────────
function FilmGrain(){return<div style={{position:'absolute',inset:0,zIndex:1,pointerEvents:'none',mixBlendMode:'overlay'}}><svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{position:'absolute',inset:0}}><filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="100%" height="100%" filter="url(#grain)" opacity="0.18"/></svg></div>;}

// ─── SHARED STYLES ──────────────────────────────────────────────────────────
const glassBg="rgba(255,255,255,0.035)";const glassBdr="0.5px solid rgba(255,255,255,0.14)";const glassSh="inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -0.5px 0 rgba(0,0,0,0.1), 0 4px 16px rgba(0,0,0,0.1)";const glassBlur={backdropFilter:"blur(40px)",WebkitBackdropFilter:"blur(40px)"};const glass={background:glassBg,border:glassBdr,borderRadius:22,padding:"16px",...glassBlur,boxShadow:glassSh};const glassSmall={...glass,borderRadius:14,padding:"13px 15px"};

function useS(){const{accent}=useTheme();return useMemo(()=>({
pg:{position:"relative",zIndex:2,minHeight:"100vh",padding:"0 20px 90px",fontFamily:"'Outfit',sans-serif"},
cd:{background:glassBg,border:glassBdr,borderRadius:22,padding:"16px",...glassBlur,boxShadow:glassSh},
cds:{background:glassBg,border:glassBdr,borderRadius:14,padding:"13px 15px",...glassBlur,boxShadow:glassSh},
cda(a){return{background:hx(a,.06),border:`0.5px solid ${hx(a,.2)}`,borderRadius:22,padding:"16px",...glassBlur};},
cdg:{background:"rgba(251,191,36,0.06)",border:"0.5px solid rgba(251,191,36,0.2)",borderRadius:22,padding:"16px",...glassBlur},
tt:{fontSize:28,fontWeight:700,letterSpacing:-.8,color:"#fff",margin:0},
lb:{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.3,textTransform:'uppercase',margin:0},
mt:{color:"rgba(255,255,255,0.45)",fontSize:11.5,fontWeight:500},
bp:{background:hx(accent,.08),color:accent,border:`0.5px solid ${hx(accent,.22)}`,borderRadius:14,padding:"14px 0",fontSize:15,fontWeight:600,width:"100%",cursor:"pointer",fontFamily:"'Outfit',sans-serif",...glassBlur},
bg:{background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.55)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:14,padding:"13px 0",fontSize:13,fontWeight:500,width:"100%",cursor:"pointer",fontFamily:"'Outfit',sans-serif"},
sv:{background:hx(accent,.12),color:accent,border:`0.5px solid ${hx(accent,.25)}`,borderRadius:100,padding:"8px 20px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif"},
ip:{background:"rgba(255,255,255,0.05)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:12,padding:"12px 14px",color:"#fff",fontSize:14,fontWeight:500,width:"100%",outline:"none",fontFamily:"'Outfit',sans-serif",boxSizing:"border-box"},
}),[accent]);}

const MP=({m})=>{const c=MUSCLE_COLORS[m]||"#94a3b8";return<span style={{display:"inline-block",padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:600,background:hx(c,.12),color:c,marginRight:4,marginBottom:3}}>{m}</span>;};
const EI=({id,size=36})=>{const ex=getExerciseById(id),c=getPrimaryColor(ex),I=getExerciseIcon(id);return<div style={{width:size,height:size,minWidth:size,borderRadius:Math.round(size*.28),background:hx(c,.1),border:`0.5px solid ${hx(c,.18)}`,display:"flex",alignItems:"center",justifyContent:"center",color:c}}><div style={{width:size*.55,height:size*.55}}><I/></div></div>;};

function Confirm({title,msg,ok,color,onOk,onNo}){const S=useS();return<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif"}}><div onClick={onNo} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/><div style={{position:"relative",width:"82%",maxWidth:340,...glass,padding:"24px 22px"}}><p style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:6}}>{title}</p><p style={{fontSize:13,fontWeight:500,color:"rgba(255,255,255,0.5)",marginBottom:20,lineHeight:1.5}}>{msg}</p><div style={{display:"flex",gap:8}}><button onClick={onNo} style={{...S.bg,flex:1}}>Go Back</button><button onClick={onOk} style={{...S.bp,flex:1,background:hx(color||"#f87171",.12),color:color||"#f87171",border:`0.5px solid ${hx(color||"#f87171",.25)}`}}>{ok}</button></div></div></div>;}

function Sparkline({data,color,w=80,h=28}){if(!data||data.length<2)return null;const mn=Math.min(...data),mx=Math.max(...data),rng=mx-mn||1;const pts=data.map((v,i)=>`${(i/(data.length-1))*w},${h-((v-mn)/rng)*(h-4)-2}`).join(" ");return<svg width={w} height={h} style={{display:"block"}}><polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
function LineChart({data,xKey,yKey,color,h=180}){if(!data||data.length<1)return<p style={{color:"rgba(255,255,255,0.3)",fontSize:12,textAlign:"center",padding:"20px 0"}}>Not enough data yet</p>;const vals=data.map(d=>d[yKey]),mn=Math.min(...vals),mx=Math.max(...vals),rng=mx-mn||1;const W=300,H=h,pL=40,cW=W-pL-8,cH=H-24-8;const pts=data.map((d,i)=>({x:pL+(data.length===1?.5:i/(data.length-1))*cW,y:8+(1-(d[yKey]-mn)/rng)*cH}));const yLb=[mn,mn+rng/2,mx].map(v=>Math.round(v));return<svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%",height:"auto",display:"block"}}>{[0,.5,1].map((f,i)=><line key={i} x1={pL} y1={8+(1-f)*cH} x2={W-8} y2={8+(1-f)*cH} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>)}{yLb.map((v,i)=><text key={i} x={pL-6} y={8+(1-[0,.5,1][i])*cH+3} textAnchor="end" fill="rgba(255,255,255,0.3)" fontSize="8" fontFamily="Outfit">{v.toLocaleString()}</text>)}{pts.length>1&&<polyline points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>}{pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="rgba(10,17,14,0.8)" strokeWidth="1.5"/>)}</svg>;}

// ─── SETTINGS ───────────────────────────────────────────────────────────────
function Settings({profile,onClose,onUpdate}){const{accent}=useTheme();const S=useS();const tid=profile.theme||"emerald";return<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end",fontFamily:"'Outfit',sans-serif"}}><div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/><div style={{position:"relative",...glass,borderRadius:"22px 22px 0 0",maxHeight:"75vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}/></div><div style={{padding:"6px 22px 28px"}}>
<p style={{fontSize:18,fontWeight:700,color:"#fff",marginBottom:20}}>Settings</p>
<p style={{...S.lb,marginBottom:8}}>NAME</p><input value={profile.name||""} onChange={e=>onUpdate({...profile,name:e.target.value})} style={{...S.ip,marginBottom:20}}/>
<p style={{...S.lb,marginBottom:10}}>ACCENT COLOR</p><div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:8,marginBottom:28}}>{Object.entries(THEMES).map(([id,t])=><button key={id} onClick={()=>onUpdate({...profile,theme:id})} style={{width:"100%",aspectRatio:"1",borderRadius:12,border:tid===id?`2px solid ${t.accent}`:"2px solid transparent",background:hx(t.accent,.18),cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}><div style={{width:16,height:16,borderRadius:"50%",background:t.accent}}/>{tid===id&&<div style={{position:"absolute",bottom:-16,left:"50%",transform:"translateX(-50%)",fontSize:8,fontWeight:600,color:t.accent,whiteSpace:"nowrap"}}>{t.name}</div>}</button>)}</div>
<p style={{...S.lb,marginBottom:8}}>WEEKLY GOAL</p><div style={{display:"flex",gap:6,marginBottom:20}}>{[2,3,4,5,6].map(n=><button key={n} onClick={()=>onUpdate({...profile,weeklyGoal:n})} style={{flex:1,padding:"10px 0",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:(profile.weeklyGoal||5)===n?hx(accent,.12):"rgba(255,255,255,0.04)",color:(profile.weeklyGoal||5)===n?accent:"rgba(255,255,255,0.45)",border:(profile.weeklyGoal||5)===n?`0.5px solid ${hx(accent,.25)}`:"0.5px solid rgba(255,255,255,0.08)"}}>{n}x</button>)}</div>
<p style={{...S.lb,marginBottom:8}}>WEIGHT UNIT</p><div style={{display:"flex",gap:6,marginBottom:24}}>{["lbs","kg"].map(u=><button key={u} onClick={()=>onUpdate({...profile,unit:u})} style={{flex:1,padding:"10px 0",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:(profile.unit||"lbs")===u?hx(accent,.12):"rgba(255,255,255,0.04)",color:(profile.unit||"lbs")===u?accent:"rgba(255,255,255,0.45)",border:(profile.unit||"lbs")===u?`0.5px solid ${hx(accent,.25)}`:"0.5px solid rgba(255,255,255,0.08)"}}>{u}</button>)}</div>
<button onClick={onClose} style={S.bp}>Done</button>
</div></div></div>;}

// ─── TIME PICKER ────────────────────────────────────────────────────────────
function TimePicker({value,onChange}){const{accent}=useTheme();const S=useS();const parsed=useMemo(()=>{if(!value)return{hr:12,min:0,ampm:"AM"};const[h,m]=value.split(":").map(Number);return{hr:h>12?h-12:h===0?12:h,min:m,ampm:h>=12?"PM":"AM"};},[value]);const[hr,setHr]=useState(parsed.hr);const[min,setMin]=useState(parsed.min);const[ampm,setAmpm]=useState(parsed.ampm);const[open,setOpen]=useState(false);useEffect(()=>{if(value){const p=value.split(":").map(Number);setHr(p[0]>12?p[0]-12:p[0]===0?12:p[0]);setMin(p[1]);setAmpm(p[0]>=12?"PM":"AM");}},[value]);const commit=()=>{let h24=hr;if(ampm==="PM"&&hr!==12)h24=hr+12;if(ampm==="AM"&&hr===12)h24=0;onChange(`${pad(h24)}:${pad(min)}`);setOpen(false);};
return<div style={{position:"relative"}}><button onClick={()=>setOpen(!open)} style={{...S.ip,padding:"8px 10px",fontSize:12,cursor:"pointer",textAlign:"center",color:value?"#fff":"rgba(255,255,255,0.4)",width:100}}>{value?fmt12(value):"Set time"}</button>
{open&&<div style={{position:"absolute",top:"100%",right:0,zIndex:50,marginTop:4,...glass,padding:14,width:220}}>
<div style={{display:"flex",gap:4,marginBottom:12,background:"rgba(255,255,255,0.04)",borderRadius:8,padding:3}}>{["AM","PM"].map(p=><button key={p} onClick={()=>setAmpm(p)} style={{flex:1,padding:"8px 0",borderRadius:6,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:ampm===p?hx(accent,.12):"transparent",color:ampm===p?accent:"rgba(255,255,255,0.45)",border:ampm===p?`0.5px solid ${hx(accent,.2)}`:"none"}}>{p}</button>)}</div>
<p style={{fontSize:9,fontWeight:600,letterSpacing:.8,color:"rgba(255,255,255,0.4)",marginBottom:6}}>HOUR</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>{[12,1,2,3,4,5,6,7,8,9,10,11].map(h=><button key={h} onClick={()=>setHr(h)} style={{padding:"7px 0",borderRadius:8,fontSize:13,fontWeight:hr===h?600:400,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:hr===h?hx(accent,.12):"rgba(255,255,255,0.03)",color:hr===h?accent:"rgba(255,255,255,0.55)",border:hr===h?`0.5px solid ${hx(accent,.2)}`:"0.5px solid transparent"}}>{h}</button>)}</div>
<p style={{fontSize:9,fontWeight:600,letterSpacing:.8,color:"rgba(255,255,255,0.4)",marginBottom:6}}>MINUTE</p>
<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4,marginBottom:12}}>{[0,15,30,45].map(m=><button key={m} onClick={()=>setMin(m)} style={{padding:"7px 0",borderRadius:8,fontSize:13,fontWeight:min===m?600:400,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:min===m?hx(accent,.12):"rgba(255,255,255,0.03)",color:min===m?accent:"rgba(255,255,255,0.55)",border:min===m?`0.5px solid ${hx(accent,.2)}`:"0.5px solid transparent"}}>:{pad(m)}</button>)}</div>
<div style={{display:"flex",gap:6}}><button onClick={()=>{onChange(null);setOpen(false);}} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.4)",border:"none"}}>Clear</button><button onClick={commit} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:hx(accent,.12),color:accent,border:`0.5px solid ${hx(accent,.2)}`}}>Set</button></div>
</div>}</div>;}

// ─── TEMPLATE EDITOR ────────────────────────────────────────────────────────
function TemplateEditor({routines,onClose}){const{accent}=useTheme();const S=useS();const[tmpl,setTmpl]=useState(()=>{const t=LS.get("dialed_weekly_template",{});const r={};DS.forEach(d=>r[d]=t[d]||null);return r;});const save=()=>{LS.set("dialed_weekly_template",tmpl);onClose();};const setDay=(day,rid)=>setTmpl({...tmpl,[day]:rid?{routineId:rid,time:tmpl[day]?.time||null}:null});const setTime=(day,t)=>{if(tmpl[day])setTmpl({...tmpl,[day]:{...tmpl[day],time:t||null}});};
return<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end",fontFamily:"'Outfit',sans-serif"}}><div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/><div style={{position:"relative",...glass,borderRadius:"22px 22px 0 0",maxHeight:"85vh",overflow:"auto"}}><div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}/></div><div style={{padding:"6px 22px 28px"}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}><p style={{fontSize:18,fontWeight:700,color:"#fff"}}>Weekly Schedule</p><button onClick={save} style={S.sv}>Save</button></div>
{DS.map((d,i)=>{const e=tmpl[d];return<div key={d} style={{display:"flex",alignItems:"center",gap:12,padding:"14px 0",borderBottom:"1px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,0.7)",width:36}}>{DL[i]}</span><div style={{flex:1}}><select value={e?.routineId||""} onChange={ev=>setDay(d,ev.target.value||null)} style={{...S.ip,padding:"8px 12px",fontSize:12,appearance:"none",cursor:"pointer",color:e?"#fff":"rgba(255,255,255,0.4)"}}><option value="" style={{background:"#0e1814"}}>Rest Day</option>{routines.map(r=><option key={r.id} value={r.id} style={{background:"#0e1814"}}>{r.name}</option>)}</select></div>{e&&<TimePicker value={e.time} onChange={t=>setTime(d,t)}/>}</div>;})}
</div></div></div>;}

// ─── ONBOARDING ─────────────────────────────────────────────────────────────
function Onboarding({onComplete}){const{accent}=useTheme();const S=useS();const[step,setStep]=useState(0),[name,setName]=useState(""),[goal,setGoal]=useState(""),[freq,setFreq]=useState(0);const goals=["Build Muscle","Lose Fat","Get Stronger","Stay Active"];
const finish=()=>{const f=freq||3;const starters=(SR[f]||SR[3]).map(r=>({...r,id:uid(),createdAt:Date.now()}));LS.set("dialed_routines",starters);const ts=ST[f]||ST[3];const tmpl={};DS.forEach(d=>{const idx=ts[d];tmpl[d]=idx!=null?{routineId:starters[idx%starters.length].id,time:null}:null;});LS.set("dialed_weekly_template",tmpl);LS.set("dialed_profile",{name:name||"Athlete",goal,onboarded:true,theme:"emerald",weeklyGoal:f,unit:"lbs"});onComplete();};
const next=()=>{if(step<3)setStep(step+1);else finish();};
return<div style={{...S.pg,display:"flex",flexDirection:"column",justifyContent:"center",minHeight:"100vh",padding:"40px 24px"}}><div style={{position:"relative",zIndex:1}}>
{step===0&&<><div style={{fontSize:44,fontWeight:800,color:"#fff",letterSpacing:-1.5,lineHeight:1.1,marginBottom:12}}>Get<br/><span style={{color:accent}}>Dialed</span> In.</div><p style={{...S.mt,fontSize:15,marginBottom:48,lineHeight:1.6}}>Track every rep. Hit every PR.<br/>No fluff, just progress.</p></>}
{step===1&&<><p style={{...S.lb,marginBottom:10}}>WHAT'S YOUR NAME?</p><div style={{fontSize:28,fontWeight:700,color:"#fff",letterSpacing:-.8,marginBottom:24}}>Let's get to know you.</div><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" style={{...S.ip,fontSize:18,padding:"16px 18px"}} autoFocus/></>}
{step===2&&<><p style={{...S.lb,marginBottom:10}}>YOUR GOAL</p><div style={{fontSize:28,fontWeight:700,color:"#fff",letterSpacing:-.8,marginBottom:24}}>What are you training for?</div><div style={{display:"flex",flexDirection:"column",gap:8}}>{goals.map(g=><button key={g} onClick={()=>setGoal(g)} style={{...(goal===g?S.cda(accent):S.cd),textAlign:"left",cursor:"pointer",fontSize:15,fontWeight:600,color:goal===g?accent:"#fff"}}>{g}</button>)}</div></>}
{step===3&&<><p style={{...S.lb,marginBottom:10}}>TRAINING FREQUENCY</p><div style={{fontSize:28,fontWeight:700,color:"#fff",letterSpacing:-.8,marginBottom:8}}>How many days a week?</div><p style={{...S.mt,marginBottom:24}}>We'll build your starter plan around this.</p><div style={{display:"flex",flexDirection:"column",gap:8}}>{[{n:2,l:"2x / week",s:"Full Body A & B"},{n:3,l:"3x / week",s:"Push / Pull / Legs"},{n:4,l:"4x / week",s:"Upper / Lower split"},{n:5,l:"5x / week",s:"Push / Pull / Legs × 2"},{n:6,l:"6x / week",s:"Push / Pull / Legs × 2"}].map(o=><button key={o.n} onClick={()=>setFreq(o.n)} style={{...(freq===o.n?S.cda(accent):S.cd),textAlign:"left",cursor:"pointer"}}><div style={{fontSize:15,fontWeight:600,color:freq===o.n?accent:"#fff"}}>{o.l}</div><div style={{fontSize:11,fontWeight:500,color:freq===o.n?hx(accent,.6):"rgba(255,255,255,0.4)",marginTop:2}}>{o.s}</div></button>)}</div></>}
<div style={{marginTop:40,display:"flex",flexDirection:"column",gap:10}}><button onClick={next} style={S.bp}>{step===0?"Let's Go":step===3?"Build My Plan":"Continue"}</button><button onClick={finish} style={{background:"none",border:"none",color:"rgba(255,255,255,0.3)",fontSize:12,fontWeight:500,cursor:"pointer",padding:8,fontFamily:"'Outfit',sans-serif"}}>Skip</button></div>
</div></div>;}

// ─── EXERCISE DETAIL ────────────────────────────────────────────────────────
function ExDetail({exerciseId,history,onClose}){const{accent}=useTheme();const S=useS();const data=getExerciseById(exerciseId);const[mode,setMode]=useState("weight");const[range,setRange]=useState("all");const allPts=useMemo(()=>getExHist(history,exerciseId),[history,exerciseId]);const filtered=useMemo(()=>{if(range==="all")return allPts;const ms={["1m"]:30,["3m"]:90,["6m"]:180,["1y"]:365}[range]||9999;return allPts.filter(p=>new Date(p.date)>=new Date(Date.now()-ms*86400000));},[allPts,range]);const yKey=mode==="weight"?"bestWeight":mode==="volume"?"volume":"est1rm";if(!data)return null;
return<div style={{position:"fixed",inset:0,zIndex:100,fontFamily:"'Outfit',sans-serif",background:"#0d0d0d",overflow:"auto"}}><BeamsCanvas accent={accent}/><FilmGrain/><div style={{position:"relative",zIndex:2,padding:"52px 20px 40px"}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><button onClick={onClose} style={{width:38,height:38,borderRadius:12,background:glassBg,border:glassBdr,...glassBlur,padding:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><EI id={exerciseId} size={42}/><div><div style={{fontSize:18,fontWeight:700,color:"#fff"}}>{data.name}</div><div style={{display:"flex",marginTop:3}}>{data.primary.map(m=><MP key={m} m={m}/>)}</div></div></div>
<div style={{display:"flex",gap:4,marginBottom:12,...glassSmall,padding:3}}>{[["weight","Weight"],["volume","Volume"],["e1rm","Est 1RM"]].map(([k,l])=><button key={k} onClick={()=>setMode(k)} style={{flex:1,padding:"8px 0",borderRadius:10,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:mode===k?hx(accent,.12):"transparent",color:mode===k?accent:"rgba(255,255,255,0.45)",border:mode===k?`0.5px solid ${hx(accent,.2)}`:"none"}}>{l}</button>)}</div>
<div style={{display:"flex",gap:4,marginBottom:20}}>{["1m","3m","6m","1y","all"].map(r=><button key={r} onClick={()=>setRange(r)} style={{flex:1,padding:"6px 0",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:range===r?hx(accent,.12):"transparent",color:range===r?accent:"rgba(255,255,255,0.35)",border:range===r?`0.5px solid ${hx(accent,.2)}`:"none"}}>{r.toUpperCase()}</button>)}</div>
<div style={{...S.cd,marginBottom:16,padding:"16px 12px"}}><LineChart data={filtered} xKey="date" yKey={yKey} color={accent} h={200}/></div>
</div></div>;}

// ─── BODY WEIGHT ────────────────────────────────────────────────────────────
function BWDetail({profile,onClose}){const{accent}=useTheme();const S=useS();const[range,setRange]=useState("3m");const bwData=LS.get("dialed_bodyweight",[]).sort((a,b)=>a.date.localeCompare(b.date));const unit=profile.unit||"lbs";const filtered=useMemo(()=>{if(range==="all")return bwData;const ms={["1m"]:30,["3m"]:90,["6m"]:180,["1y"]:365}[range]||9999;return bwData.filter(p=>new Date(p.date)>=new Date(Date.now()-ms*86400000));},[bwData,range]);
return<div style={{position:"fixed",inset:0,zIndex:100,fontFamily:"'Outfit',sans-serif",background:"#0d0d0d",overflow:"auto"}}><BeamsCanvas accent={accent}/><FilmGrain/><div style={{position:"relative",zIndex:2,padding:"52px 20px 40px"}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}><button onClick={onClose} style={{width:38,height:38,borderRadius:12,background:glassBg,border:glassBdr,...glassBlur,padding:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><div style={{fontSize:18,fontWeight:700,color:"#fff"}}>Body Weight</div></div>
<div style={{display:"flex",gap:4,marginBottom:20}}>{["1m","3m","6m","1y","all"].map(r=><button key={r} onClick={()=>setRange(r)} style={{flex:1,padding:"6px 0",borderRadius:8,fontSize:10,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:range===r?hx(accent,.12):"transparent",color:range===r?accent:"rgba(255,255,255,0.35)",border:range===r?`0.5px solid ${hx(accent,.2)}`:"none"}}>{r.toUpperCase()}</button>)}</div>
<div style={{...S.cd,marginBottom:16,padding:"16px 12px"}}><LineChart data={filtered.map(e=>({date:e.date,weight:e.weight}))} xKey="date" yKey="weight" color={accent} h={200}/></div>
</div></div>;}

function BWModal({profile,onClose,onLog}){const S=useS();const[val,setVal]=useState("");const unit=profile.unit||"lbs";const today=dKey(new Date());const bw=LS.get("dialed_bodyweight",[]);const te=bw.find(e=>e.date===today);useEffect(()=>{if(te)setVal(String(te.weight));},[]);const save=()=>{const n=parseFloat(val);if(!n)return;const u=bw.filter(e=>e.date!==today);u.push({date:today,weight:n});LS.set("dialed_bodyweight",u);onLog();onClose();};return<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif"}}><div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/><div style={{position:"relative",width:"85%",maxWidth:340,...glass,padding:24}}><p style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:12}}>Log Body Weight</p><div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16}}><input type="number" inputMode="decimal" value={val} onChange={e=>setVal(e.target.value)} placeholder="0" style={{...S.ip,fontSize:24,fontWeight:300,textAlign:"center",padding:"14px"}} autoFocus/><span style={{fontSize:14,fontWeight:600,color:"rgba(255,255,255,0.45)"}}>{unit}</span></div><button onClick={save} style={S.bp}>{te?"Update":"Log"}</button></div></div>;}

// ─── HOME SCREEN (v7 — from Claude Design handoff) ──────────────────────────
function HomeScreen({profile,history,routines,onStartRoutine,onNewRoutine,onEditRoutine,onQuickStart,onOpenSettings}){
const{accent}=useTheme();const S=useS();const rgb=h2r(accent);
const[showBW,setShowBW]=useState(false),[showBWD,setShowBWD]=useState(false),[bwK,setBwK]=useState(0);
const wk=getWeekVol(history,0),prevWk=getWeekVol(history,1),streak=getStreakInfo(history,profile.weeklyGoal||5);
const volDiff=prevWk.total>0?Math.round(((wk.total-prevWk.total)/prevWk.total)*100):0;
const mv=getMuscVol(history),mvE=Object.entries(mv).sort((a,b)=>b[1].sets-a[1].sets);const mvMax=mvE.length>0?Math.max(...mvE.map(([,v])=>v.sets)):1;
const bwData=LS.get("dialed_bodyweight",[]);const todayBW=bwData.find(e=>e.date===dKey(new Date()));
const unit=profile.unit||"lbs";const plan=getTodayPlan(routines);const now=new Date();
const hr=now.getHours();const greet=hr<12?"Good morning":hr<17?"Good afternoon":"Good evening";
const dateStr=now.toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"});
const dys=["M","T","W","T","F","S","S"],tIdx=(now.getDay()+6)%7,maxV=Math.max(...wk.data,1);
const volStr=wk.total>=10000?`${Math.floor(wk.total/1000)},${String(wk.total%1000).padStart(3,"0")}`:wk.total.toLocaleString();
const volParts=volStr.match(/^(\d+)(,\d+)?$/)||[volStr,volStr,""];

return<div style={{height:"100%",overflowY:"auto",position:"relative",zIndex:2,paddingTop:16,paddingBottom:90,fontFamily:"'Outfit',sans-serif"}}>
<div style={{padding:"0 22px"}}>

{/* Header */}
<div style={{marginTop:10,marginBottom:22,display:"flex",alignItems:"flex-start",justifyContent:"space-between"}}>
<div>
  <div style={{fontSize:12,color:"rgba(255,255,255,0.25)",fontWeight:400,letterSpacing:0.2,marginBottom:2}}>{dateStr}</div>
  <div style={{fontSize:13.5,color:"rgba(255,255,255,0.38)",fontWeight:500}}>{greet}</div>
</div>
<div style={{display:"flex",alignItems:"center",gap:8,marginTop:2}}>
  {streak.count>0&&<div style={{display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:20,padding:"5px 11px"}}>
    <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6.5 1C6.5 1 9 4 8.5 6.5C11 5.5 12 3 12 3C12 3 12 9 8 11.5C9 10 9 8.5 7.5 8C7.5 10 5 12 3 13C3 13 0 11 0 8C0 5.5 2 4 3.5 4C2.5 5.5 3 7 4.5 7C4.5 4.5 6.5 1 6.5 1Z" fill={`${accent}cc`}/></svg>
    <span style={{fontSize:11.5,fontWeight:700,color:accent,letterSpacing:0.2}}>{streak.count} days</span>
  </div>}
  <button onClick={onOpenSettings} style={{width:34,height:34,borderRadius:"50%",border:"0.5px solid rgba(255,255,255,0.08)",background:"transparent",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",padding:0}}>
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
  </button>
</div></div>

{/* Hero Volume */}
<div style={{marginBottom:10}}>
  <div style={{lineHeight:1,letterSpacing:-4,marginBottom:0}}>
    <span style={{fontSize:72,fontWeight:700,letterSpacing:-4,background:`linear-gradient(140deg, #ffffff 10%, ${accent}dd 90%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text"}}>{volParts[1]||"0"}</span>
    <span style={{fontSize:72,fontWeight:200,letterSpacing:-4,color:"rgba(255,255,255,0.28)"}}>{volParts[2]||""}</span>
  </div>
  <div style={{display:"flex",alignItems:"center",gap:9,marginTop:9}}>
    <span style={{fontSize:13,color:"rgba(255,255,255,0.28)",fontWeight:400,letterSpacing:0.1}}>{unit} this week</span>
    {volDiff!==0&&<span style={{fontSize:11.5,fontWeight:700,color:accent,background:`rgba(${rgb},0.13)`,border:`1px solid rgba(${rgb},0.22)`,borderRadius:20,padding:"2px 9px",letterSpacing:0.3}}>{volDiff>0?"↑":"↓"} {Math.abs(volDiff)}%</span>}
  </div>
</div>

{/* Weekly Chart */}
<div style={{marginBottom:26}}>
  <svg width={7*46-14} height={54+24} style={{overflow:"visible",display:"block"}}>
    <defs><linearGradient id="wkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity="1"/><stop offset="100%" stopColor={accent} stopOpacity="0.12"/></linearGradient></defs>
    {dys.map((d,i)=>{const v=wk.data[i];const bh=v>0?Math.max(5,(v/maxV)*54):3;const x=i*46;const isT=i===tIdx;
    return<g key={i}><rect x={x} y={54-bh} width={32} height={bh} rx={5} fill={v>0?"url(#wkg)":"rgba(255,255,255,0.04)"}/>
    {isT&&v===0&&<rect x={x} y={50} width={32} height={4} rx={2} fill={`${accent}50`}/>}
    <text x={x+16} y={71} textAnchor="middle" fill={isT?accent:"rgba(255,255,255,0.22)"} fontSize={10.5} fontWeight={isT?700:400} fontFamily="Outfit,sans-serif">{d}</text></g>;})}
  </svg>
</div>

{/* Action Tiles */}
<div style={{display:"flex",gap:10,marginBottom:26}}>
  <div onClick={()=>{const p=plan;if(p)onStartRoutine(p.routine);else if(routines[0])onStartRoutine(routines[0]);}} style={{flex:"1 1 auto",padding:"18px 16px 20px",borderRadius:22,background:`linear-gradient(160deg, rgba(${rgb},0.24) 0%, rgba(${rgb},0.07) 100%)`,border:`1px solid rgba(${rgb},0.22)`,position:"relative",overflow:"hidden",cursor:"pointer",boxShadow:`0 -1px 0 rgba(${rgb},0.75) inset, 0 0 50px rgba(${rgb},0.09) inset`}}>
    <div style={{position:"absolute",top:-36,left:"50%",transform:"translateX(-50%)",width:110,height:55,borderRadius:"50%",background:`rgba(${rgb},0.38)`,filter:"blur(30px)",pointerEvents:"none"}}/>
    <div style={{position:"relative",zIndex:1}}>
      <svg width="26" height="16" viewBox="0 0 26 16" style={{marginBottom:11}} fill="none"><rect x="6" y="4" width="14" height="8" rx="1.5" stroke={accent} strokeWidth="1.6"/><rect x="3.5" y="1.5" width="2.5" height="13" rx="1.2" fill={accent}/><rect x="20" y="1.5" width="2.5" height="13" rx="1.2" fill={accent}/><rect x="0.5" y="4.5" width="3" height="7" rx="1" fill={`${accent}70`}/><rect x="22.5" y="4.5" width="3" height="7" rx="1" fill={`${accent}70`}/></svg>
      <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:3,letterSpacing:-0.3}}>Today's Plan</div>
      <div style={{fontSize:11.5,color:"rgba(255,255,255,0.42)",marginBottom:15,lineHeight:1.4}}>{plan?`${plan.routine.name} · ${plan.routine.exercises.length} exercises`:"No plan set"}</div>
      <div style={{display:"inline-flex",alignItems:"center",gap:4,background:`rgba(${rgb},0.2)`,border:`1px solid rgba(${rgb},0.32)`,borderRadius:20,padding:"5px 13px",fontSize:12,fontWeight:700,color:accent,letterSpacing:0.3}}>Start →</div>
    </div>
  </div>
  <div onClick={onQuickStart} style={{flex:"0 0 42%",padding:"16px 14px 18px",borderRadius:22,background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.065)",cursor:"pointer",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
    <div>
      <svg width="16" height="24" viewBox="0 0 16 24" style={{marginBottom:11}} fill="none"><path d="M10 1L1 14h7L6 23l10-13H9z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinejoin="round"/></svg>
      <div style={{fontSize:15,fontWeight:700,color:"rgba(255,255,255,0.82)",marginBottom:3,letterSpacing:-0.3}}>Quick Start</div>
      <div style={{fontSize:11.5,color:"rgba(255,255,255,0.28)",lineHeight:1.4}}>No plan, just lift</div>
    </div>
    <div style={{marginTop:14}}><div style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:20,padding:"5px 11px",fontSize:12,fontWeight:600,color:"rgba(255,255,255,0.45)"}}>Go →</div></div>
  </div>
</div>

{/* Stats */}
<div style={{marginBottom:26}}>
  <div style={{...S.lb,marginBottom:14}}>This Week</div>
  <div style={{display:"flex",alignItems:"center"}}>
    {[{v:wk.workouts,l:"Workouts"},{v:wk.prs,l:"PRs"},{v:todayBW?todayBW.weight:"-",l:unit}].map((s,i)=><React.Fragment key={s.l}>
      {i>0&&<div style={{width:1,height:32,background:"rgba(255,255,255,0.07)",flexShrink:0}}/>}
      <div onClick={s.l===unit?()=>(todayBW?setShowBWD(true):setShowBW(true)):undefined} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4,cursor:s.l===unit?"pointer":"default"}}>
        <div style={{fontSize:26,fontWeight:700,color:"#fff",letterSpacing:-0.8,lineHeight:1}}>{s.v}</div>
        <div style={{fontSize:10,color:"rgba(255,255,255,0.28)",fontWeight:500,letterSpacing:0.8,textTransform:"uppercase"}}>{s.l}</div>
      </div>
    </React.Fragment>)}
  </div>
</div>

{/* Muscle Focus */}
{mvE.length>0&&<div style={{marginBottom:26}}>
  <div style={{...S.lb,marginBottom:14}}>Muscle Focus</div>
  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
    {mvE.map(([m,v])=>{const c=MUSCLE_COLORS[m]||"#94a3b8";const scale=0.48+(v.sets/mvMax)*0.52;const fs=Math.round(11.5+scale*3);const px=Math.round(11+scale*7);const py=Math.round(5+scale*3.5);
    return<div key={m} style={{padding:`${py}px ${px}px`,borderRadius:100,background:`linear-gradient(135deg,${c}1e,${c}0a)`,border:`1px solid ${c}35`,fontSize:fs,fontWeight:600,color:c,display:"flex",alignItems:"center",gap:5,boxShadow:`0 2px 14px ${c}14`,letterSpacing:0.1}}>
      {m}<span style={{opacity:0.45,fontWeight:400,fontSize:fs-1.5}}>{v.sets}</span>
    </div>;})}
  </div>
</div>}

{/* Routines */}
<div style={{marginBottom:12}}>
  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
    <div style={S.lb}>My Routines</div>
    <button onClick={onNewRoutine} style={{fontSize:13,fontWeight:600,color:accent,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>+ New</button>
  </div>
  {routines.map((r,i)=>{const muscles=[...new Set(r.exercises.flatMap(e=>{const ex=getExerciseById(e.exerciseId);return ex?ex.primary:[];}))];const pc=muscles.length>0?MUSCLE_COLORS[muscles[0]]||"#94a3b8":"#94a3b8";
  return<div key={r.id} onClick={()=>onEditRoutine(r)} style={{display:"flex",alignItems:"center",gap:14,padding:"13px 0",borderBottom:i<routines.length-1?"1px solid rgba(255,255,255,0.045)":"none",cursor:"pointer"}}>
    <div style={{width:44,height:44,borderRadius:14,flexShrink:0,background:`linear-gradient(145deg,${pc}32,${pc}0e)`,border:`1px solid ${pc}25`,display:"flex",alignItems:"center",justifyContent:"center"}}>
      {r.exercises[0]&&<div style={{width:20,height:20,color:pc}}>{React.createElement(getExerciseIcon(r.exercises[0].exerciseId))}</div>}
    </div>
    <div style={{flex:1,minWidth:0}}>
      <div style={{fontSize:15.5,fontWeight:600,color:"#fff",letterSpacing:-0.3,marginBottom:4}}>{r.name}</div>
      <div style={{display:"flex",alignItems:"center",flexWrap:"wrap"}}>
        {muscles.map((m,mi)=><React.Fragment key={m}>{mi>0&&<span style={{color:"rgba(255,255,255,0.14)",margin:"0 5px",fontSize:9}}>●</span>}<span style={{fontSize:12,fontWeight:500,color:MUSCLE_COLORS[m]||"#94a3b8"}}>{m}</span></React.Fragment>)}
      </div>
    </div>
    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3,flexShrink:0}}>
      <span style={{fontSize:11,color:"rgba(255,255,255,0.22)",fontWeight:400}}>{r.exercises.length} exercises</span>
      <svg width="7" height="13" viewBox="0 0 7 13" fill="none"><path d="M1 1l5 5.5L1 12" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  </div>;})}
  {routines.length===0&&<div style={{textAlign:"center",padding:28}}><p style={S.mt}>No routines yet</p></div>}
</div>

</div>
{showBW&&<BWModal profile={profile} onClose={()=>setShowBW(false)} onLog={()=>setBwK(k=>k+1)}/>}
{showBWD&&<BWDetail profile={profile} onClose={()=>setShowBWD(false)}/>}
</div>;}

// ─── ROUTINE BUILDER ────────────────────────────────────────────────────────
function RoutineBuilder({routine,onSave,onBack,onDelete,history}){const{accent}=useTheme();const S=useS();const[name,setName]=useState(routine?routine.name:"New Routine");const[exercises,setExercises]=useState(routine?routine.exercises.map(e=>({...e})):[]);const[showPicker,setShowPicker]=useState(false);
const addEx=ex=>{setExercises(prev=>[...prev,{exerciseId:ex.id,sets:3}]);setShowPicker(false);};const rmEx=i=>setExercises(prev=>prev.filter((_,j)=>j!==i));const setSets=(i,d)=>{const u=[...exercises];u[i]={...u[i],sets:Math.max(1,Math.min(10,u[i].sets+d))};setExercises(u);};const save=()=>onSave({id:routine?routine.id:uid(),name,exercises,createdAt:routine?routine.createdAt:Date.now()});
return<><div style={S.pg}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:56,marginBottom:8}}><button onClick={onBack} style={{width:38,height:38,borderRadius:12,background:glassBg,border:glassBdr,...glassBlur,padding:0,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#fff"}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg></button><div style={{display:"flex",gap:8}}>{routine&&<button onClick={()=>{onDelete(routine.id);onBack();}} style={{...S.sv,background:"rgba(248,113,113,0.1)",color:"#f87171",border:"0.5px solid rgba(248,113,113,0.2)"}}>Delete</button>}<button onClick={save} style={S.sv}>Save</button></div></div>
<input value={name} onChange={e=>setName(e.target.value)} style={{background:"none",border:"none",outline:"none",fontSize:22,fontWeight:700,color:"#fff",letterSpacing:-.5,width:"100%",fontFamily:"'Outfit',sans-serif",padding:"8px 0"}}/>
<div style={{height:1,background:"rgba(255,255,255,0.08)",marginBottom:24}}/>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}><div style={S.lb}>EXERCISES · {exercises.length}</div><button onClick={()=>setShowPicker(true)} style={{fontSize:13,fontWeight:600,color:accent,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>+ Add</button></div>
<div style={{display:"flex",flexDirection:"column",gap:8}}>{exercises.map((ex,i)=>{const data=getExerciseById(ex.exerciseId);if(!data)return null;return<div key={i} style={S.cds}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}><EI id={ex.exerciseId} size={38}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{data.name}</div><div style={{display:"flex",flexWrap:"wrap",marginTop:2}}>{data.primary.map(m=><MP key={m} m={m}/>)}</div></div><button onClick={()=>rmEx(i)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:14}}>×</button></div>
<div style={{height:1,background:"rgba(255,255,255,0.06)",marginBottom:10}}/>
<div style={{display:"flex",alignItems:"center",gap:12}}><span style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.35)"}}>SETS</span><button onClick={()=>setSets(i,-1)} style={{width:28,height:28,borderRadius:8,background:glassBg,border:glassBdr,color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button><span style={{fontSize:16,fontWeight:700,color:"#fff",minWidth:20,textAlign:"center"}}>{ex.sets}</span><button onClick={()=>setSets(i,1)} style={{width:28,height:28,borderRadius:8,background:glassBg,border:glassBdr,color:"#fff",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button></div></div>;})}</div>
<button onClick={()=>setShowPicker(true)} style={{width:"100%",padding:16,borderRadius:14,border:"1.5px dashed rgba(255,255,255,0.12)",background:"none",color:"rgba(255,255,255,0.35)",fontSize:13,fontWeight:600,cursor:"pointer",marginTop:12,fontFamily:"'Outfit',sans-serif"}}>+ Add Exercise</button></div>
{showPicker&&<ExPicker onSelect={addEx} onClose={()=>setShowPicker(false)} existingIds={exercises.map(e=>e.exerciseId)} history={history}/>}</>;
}

// ─── EXERCISE PICKER (fixed search + custom exercise) ───────────────────────
function ExPicker({onSelect,onClose,existingIds=[],history}){const{accent}=useTheme();const S=useS();const[search,setSearch]=useState(""),[filter,setFilter]=useState("All"),[showC,setShowC]=useState(false),[cN,setCN]=useState(""),[cT,setCT]=useState("weighted"),[cM,setCM]=useState([]),[customK,setCustomK]=useState(0);
const allEx=useMemo(()=>[...EXERCISES,...(()=>{try{return JSON.parse(localStorage.getItem("dialed_custom_exercises")||"[]")}catch{return[]}})()],[customK]);
const recIds=useMemo(()=>getRecIds(history),[history]);
const filtered=useMemo(()=>{let l=filter==="All"?allEx:allEx.filter(e=>e.primary.includes(filter)||(e.secondary&&e.secondary.includes(filter)));l=l.filter(e=>!existingIds.includes(e.id));if(search){const q=search.toLowerCase();l=l.filter(e=>e.name.toLowerCase().includes(q));l.sort((a,b)=>{const an=a.name.toLowerCase(),bn=b.name.toLowerCase();if(an===q&&bn!==q)return-1;if(bn===q&&an!==q)return 1;const as=an.startsWith(q),bs=bn.startsWith(q);if(as&&!bs)return-1;if(bs&&!as)return 1;return an.indexOf(q)-bn.indexOf(q);});}return l;},[search,filter,allEx,existingIds]);
const recEx=useMemo(()=>{if(search||filter!=="All")return[];return recIds.map(id=>allEx.find(e=>e.id===id)).filter(e=>e&&!existingIds.includes(e.id));},[recIds,allEx,existingIds,search,filter]);
const createC=()=>{if(!cN.trim())return;const ex={id:"custom_"+uid(),name:cN.trim(),primary:cM.length?[...cM]:["Full Body"],secondary:[],type:cT};try{const existing=JSON.parse(localStorage.getItem("dialed_custom_exercises")||"[]");existing.push(ex);localStorage.setItem("dialed_custom_exercises",JSON.stringify(existing));}catch(e){console.error(e);}setCustomK(k=>k+1);onSelect(ex);};
const Row=({ex})=><button onClick={()=>onSelect(ex)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",padding:"12px 0",background:"none",border:"none",borderBottom:"1px solid rgba(255,255,255,0.05)",cursor:"pointer",textAlign:"left"}}><EI id={ex.id} size={36}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{ex.name}</div><div style={{display:"flex",flexWrap:"wrap",marginTop:2}}>{ex.primary.map(m=><MP key={m} m={m}/>)}</div></div></button>;
return<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",flexDirection:"column",justifyContent:"flex-end",fontFamily:"'Outfit',sans-serif"}}><div onClick={onClose} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/><div style={{position:"relative",background:glassBg,border:glassBdr,...glassBlur,boxShadow:glassSh,borderRadius:"22px 22px 0 0",maxHeight:"85vh",display:"flex",flexDirection:"column"}}><div style={{display:"flex",justifyContent:"center",padding:"10px 0 6px"}}><div style={{width:36,height:4,borderRadius:2,background:"rgba(255,255,255,0.2)"}}/></div>
<div style={{padding:"0 20px"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises..." style={{...S.ip,marginBottom:12}} autoFocus/>
<div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:12}}>{["All",...MUSCLE_GROUPS].map(m=><button key={m} onClick={()=>setFilter(m)} style={{flexShrink:0,padding:"6px 14px",borderRadius:100,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:filter===m?hx(accent,.12):"rgba(255,255,255,0.04)",color:filter===m?accent:"rgba(255,255,255,0.45)",border:filter===m?`0.5px solid ${hx(accent,.2)}`:"none"}}>{m}</button>)}</div></div>
<div style={{flex:1,overflowY:"auto",padding:"0 20px 20px"}}>
{!showC&&<button onClick={()=>setShowC(true)} style={{width:"100%",padding:14,borderRadius:12,border:`1.5px dashed ${hx(accent,.3)}`,background:"none",color:accent,fontSize:12,fontWeight:600,cursor:"pointer",marginBottom:8,fontFamily:"'Outfit',sans-serif"}}>+ Create Custom Exercise</button>}
{showC&&<div style={S.cda(accent)}><input value={cN} onChange={e=>setCN(e.target.value)} placeholder="Exercise name" style={{...S.ip,marginBottom:10}}/>
<div style={{display:"flex",gap:6,marginBottom:10}}>{["weighted","bodyweight","timed"].map(t=><button key={t} onClick={()=>setCT(t)} style={{flex:1,padding:"8px 0",borderRadius:8,fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:cT===t?hx(accent,.12):"rgba(255,255,255,0.04)",color:cT===t?accent:"rgba(255,255,255,0.4)",border:cT===t?`0.5px solid ${hx(accent,.2)}`:"none",textTransform:"capitalize"}}>{t}</button>)}</div>
<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>{MUSCLE_GROUPS.map(m=><button key={m} onClick={()=>setCM(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m])} style={{padding:"4px 10px",borderRadius:6,fontSize:9,fontWeight:700,cursor:"pointer",fontFamily:"'Outfit',sans-serif",background:cM.includes(m)?hx(MUSCLE_COLORS[m],.18):"rgba(255,255,255,0.04)",color:cM.includes(m)?MUSCLE_COLORS[m]:"rgba(255,255,255,0.3)",border:"none"}}>{m}</button>)}</div>
<div style={{display:"flex",gap:8}}><button onClick={()=>setShowC(false)} style={{...S.bg,flex:1}}>Cancel</button><button onClick={createC} style={{...S.bp,flex:1}}>Create</button></div></div>}
{recEx.length>0&&<><p style={{...S.lb,color:hx(accent,.6),marginBottom:6,marginTop:4}}>RECENT</p>{recEx.map(ex=><Row key={ex.id} ex={ex}/>)}<div style={{height:1,background:"rgba(255,255,255,0.06)",margin:"8px 0"}}/></>}
{filtered.map(ex=><Row key={ex.id} ex={ex}/>)}{filtered.length===0&&<p style={{...S.mt,textAlign:"center",padding:20}}>No exercises found</p>}
</div></div></div>;}

// ─── LIVE WORKOUT ───────────────────────────────────────────────────────────
function LiveWorkout({routine,history,onFinish,onCancel}){const{accent}=useTheme();const S=useS();const[elapsed,setElapsed]=useState(0);const[exercises,setExercises]=useState(()=>(routine?routine.exercises:[]).map(ex=>{const prev=getPrevSets(history,ex.exerciseId);return{exerciseId:ex.exerciseId,sets:Array.from({length:ex.sets},(_,i)=>({reps:"",weight:"",done:false,isPR:false,prevReps:prev?.[i]?.reps||"",prevWeight:prev?.[i]?.weight||""}))};}));const[note,setNote]=useState("");const[showNote,setShowNote]=useState(false);const[prFlash,setPrFlash]=useState(null);const[showPk,setShowPk]=useState(false);const[showCan,setShowCan]=useState(false);
useEffect(()=>{const t=setInterval(()=>setElapsed(e=>e+1),1000);return()=>clearInterval(t);},[]);
const tS=exercises.reduce((a,e)=>a+e.sets.length,0),dS=exercises.reduce((a,e)=>a+e.sets.filter(s=>s.done).length,0),prog=tS>0?(dS/tS)*100:0;
const upSet=(ei,si,f,v)=>setExercises(exercises.map((ex,i)=>i!==ei?ex:{...ex,sets:ex.sets.map((s,j)=>j===si?{...s,[f]:v}:s)}));
const togDone=(ei,si)=>{const u=[...exercises];const set={...u[ei].sets[si]};set.done=!set.done;if(set.done){const best=getPrevBest(history,u[ei].exerciseId);const w=parseFloat(set.weight)||0,r=parseInt(set.reps)||0;if(best&&w>0&&(w>best.weight||(w===best.weight&&r>best.reps))){set.isPR=true;const d=getExerciseById(u[ei].exerciseId);setPrFlash(d?d.name:"PR");setTimeout(()=>setPrFlash(null),2200);}}else set.isPR=false;u[ei]={...u[ei],sets:u[ei].sets.map((s,j)=>j===si?set:s)};setExercises(u);};
const addSet=ei=>{const u=[...exercises];const prev=getPrevSets(history,u[ei].exerciseId);const si=u[ei].sets.length;u[ei]={...u[ei],sets:[...u[ei].sets,{reps:"",weight:"",done:false,isPR:false,prevReps:prev?.[si]?.reps||"",prevWeight:prev?.[si]?.weight||""}]};setExercises(u);};
const rmEx=ei=>setExercises(exercises.filter((_,i)=>i!==ei));
const addEx=ex=>{const prev=getPrevSets(history,ex.id);setExercises(prev2=>[...prev2,{exerciseId:ex.id,sets:Array.from({length:3},(_,i)=>({reps:"",weight:"",done:false,isPR:false,prevReps:prev?.[i]?.reps||"",prevWeight:prev?.[i]?.weight||""}))}]);setShowPk(false);};
const finish=()=>{const prs=[],muscles=new Set();let tv=0;const exData=exercises.map(ex=>{const d=getExerciseById(ex.exerciseId);if(d)d.primary.forEach(m=>muscles.add(m));const sets=ex.sets.filter(s=>s.done).map(s=>{const w=parseFloat(s.weight)||0,r=parseInt(s.reps)||0;tv+=w*r;if(s.isPR)prs.push({exerciseId:ex.exerciseId,weight:w,reps:r});return{weight:w,reps:r,isPR:s.isPR};});return{exerciseId:ex.exerciseId,sets};}).filter(e=>e.sets.length>0);onFinish({id:uid(),routineName:routine?routine.name:"Quick Workout",exercises:exData,duration:elapsed,totalVolume:tv,prs,muscles:[...muscles],date:new Date().toISOString(),note:note||null,setsCompleted:dS});};
const aI=exercises.findIndex(ex=>ex.sets.some(s=>!s.done));

return<><div style={{position:"relative",zIndex:1,minHeight:"100vh",paddingBottom:40,fontFamily:"'Outfit',sans-serif"}}>
<div style={{position:"sticky",top:0,zIndex:20,background:"rgba(13,13,13,0.85)",...glassBlur}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"52px 20px 10px"}}><div><div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.4)"}}>{routine?routine.name:"Quick Workout"}</div><div style={{fontSize:30,fontWeight:300,color:accent,fontVariantNumeric:"tabular-nums"}}>{fmtTime(elapsed)}</div></div><div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.45)",background:glassBg,border:glassBdr,borderRadius:100,padding:"4px 10px"}}>{dS}/{tS}</span><button onClick={finish} style={S.sv}>Finish</button></div></div>
<div style={{height:3,background:"rgba(255,255,255,0.06)"}}><div style={{height:"100%",width:`${prog}%`,background:hx(accent,.7),borderRadius:2,transition:"width 0.4s"}}/></div></div>

<div style={{padding:"16px 20px"}}>{exercises.map((ex,ei)=>{const data=getExerciseById(ex.exerciseId);if(!data)return null;const allDone=ex.sets.every(s=>s.done);
return<div key={ei} style={{...S.cds,marginBottom:10,border:allDone?`0.5px solid ${hx(accent,.3)}`:glassBdr,opacity:ei>aI&&aI>=0?.7:1}}>
<div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}><EI id={ex.exerciseId} size={34}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{data.name}</div><div style={{display:"flex",flexWrap:"wrap",marginTop:2}}>{data.primary.map(m=><MP key={m} m={m}/>)}</div></div><button onClick={()=>rmEx(ei)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",cursor:"pointer",fontSize:14}}>×</button></div>
<div style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 36px",gap:8,marginBottom:6}}><span style={{...S.lb,fontSize:8}}>SET</span><span style={{...S.lb,fontSize:8}}>WEIGHT</span><span style={{...S.lb,fontSize:8}}>REPS</span><span/></div>
{ex.sets.map((set,si)=>{const iBg=set.done?hx(accent,.05):"rgba(255,255,255,0.05)";const iBdr=set.done?`0.5px solid ${hx(accent,.22)}`:"0.5px solid rgba(255,255,255,0.12)";
return<div key={si} style={{display:"grid",gridTemplateColumns:"28px 1fr 1fr 36px",gap:8,marginBottom:6,alignItems:"center"}}>
<span style={{fontSize:12,fontWeight:700,color:set.done?accent:"rgba(255,255,255,0.45)",textAlign:"center"}}>{si+1}</span>
<input type="number" inputMode="decimal" value={set.weight} onChange={e=>upSet(ei,si,"weight",e.target.value)} placeholder={set.prevWeight?String(set.prevWeight):"0"} style={{...S.ip,padding:"9px 10px",fontSize:13,fontWeight:600,textAlign:"center",background:iBg,border:iBdr}}/>
<input type="number" inputMode="numeric" value={set.reps} onChange={e=>upSet(ei,si,"reps",e.target.value)} placeholder={set.prevReps?String(set.prevReps):"0"} style={{...S.ip,padding:"9px 10px",fontSize:13,fontWeight:600,textAlign:"center",background:iBg,border:iBdr}}/>
<button onClick={()=>togDone(ei,si)} style={{width:36,height:36,borderRadius:10,border:"none",cursor:"pointer",background:set.isPR?"rgba(251,191,36,0.12)":set.done?hx(accent,.1):"rgba(255,255,255,0.05)",color:set.isPR?"#fbbf24":set.done?accent:"rgba(255,255,255,0.35)",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>{set.isPR?"★":set.done?"✓":"○"}</button></div>;})}
<button onClick={()=>addSet(ei)} style={{width:"100%",padding:8,borderRadius:8,border:"1px dashed rgba(255,255,255,0.1)",background:"none",color:"rgba(255,255,255,0.3)",fontSize:11,fontWeight:600,cursor:"pointer",marginTop:4,fontFamily:"'Outfit',sans-serif"}}>+ Add Set</button></div>;})}
<button onClick={()=>setShowPk(true)} style={{...S.bg,marginTop:8}}>+ Add Exercise</button>
<button onClick={()=>setShowCan(true)} style={{...S.bg,marginTop:8,color:"#f87171",borderColor:"rgba(248,113,113,0.15)"}}>Cancel Workout</button>
</div></div>
{showCan&&<Confirm title="Cancel workout?" msg="All progress will be lost." ok="Cancel Workout" color="#f87171" onOk={onCancel} onNo={()=>setShowCan(false)}/>}
{prFlash&&<div style={{position:"fixed",inset:0,zIndex:200,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.7)",fontFamily:"'Outfit',sans-serif"}}><div style={{fontSize:56,marginBottom:12}}>⭐</div><div style={{fontSize:10,fontWeight:800,letterSpacing:3,color:"#fbbf24",marginBottom:6}}>PERSONAL RECORD</div><div style={{fontSize:18,fontWeight:700,color:"#fff"}}>{prFlash}</div></div>}
{showPk&&<ExPicker onSelect={addEx} onClose={()=>setShowPk(false)} existingIds={exercises.map(e=>e.exerciseId)} history={history}/>}
</>;}

// ─── SUMMARY ────────────────────────────────────────────────────────────────
function WorkoutSummary({workout,onDone}){const{accent}=useTheme();const S=useS();
return<div style={S.pg}><div style={{position:"relative",zIndex:1,paddingTop:80,textAlign:"center"}}><div style={{width:56,height:56,borderRadius:16,...glass,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",fontSize:26,background:"rgba(251,191,36,0.08)",border:"0.5px solid rgba(251,191,36,0.2)"}}>🏁</div><h1 style={{...S.tt,fontSize:26,marginBottom:4}}>Workout Done</h1><p style={{...S.mt,marginBottom:24}}>{workout.routineName}</p>
<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:16}}>{[["TIME",fmtDur(workout.duration)],["LBS",(workout.totalVolume||0).toLocaleString()],["SETS",workout.setsCompleted]].map(([l,v])=><div key={l} style={{...S.cd,padding:"14px 12px",textAlign:"center"}}><div style={{...S.lb,marginBottom:4}}>{l}</div><div style={{fontSize:18,fontWeight:300,color:"#fff"}}>{v}</div></div>)}</div>
{workout.prs?.length>0&&<div style={{...S.cdg,textAlign:"left",marginBottom:12}}><p style={{fontSize:9,fontWeight:700,letterSpacing:1.5,color:"#fbbf24",marginBottom:10}}>⭐ PERSONAL RECORDS</p>{workout.prs.map((pr,i)=>{const d=getExerciseById(pr.exerciseId);return<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderTop:i>0?"1px solid rgba(251,191,36,0.08)":"none"}}><span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{d?d.name:pr.exerciseId}</span><span style={{fontSize:13,fontWeight:700,color:"#fbbf24"}}>{pr.weight}×{pr.reps}</span></div>;})}</div>}
<button onClick={onDone} style={{...S.bp,marginTop:12}}>Done</button>
</div></div>;}

// ─── HISTORY ────────────────────────────────────────────────────────────────
function HistoryScreen({history,onDeleteWorkout,onOpenExDetail}){const{accent}=useTheme();const S=useS();const[exp,setExp]=useState(null);const[cDel,setCDel]=useState(null);return<div style={S.pg}><div style={{paddingTop:56,marginBottom:24}}><h1 style={S.tt}>History</h1><p style={{...S.mt,marginTop:4}}>{history.length} workouts logged</p></div>{history.length===0?<div style={{...S.cd,textAlign:"center",padding:28}}><p style={S.mt}>No workouts yet</p></div>:<div style={{display:"flex",flexDirection:"column",gap:8}}>{[...history].reverse().map((w,i)=>{const isE=exp===w.id;return<div key={w.id}><div style={{...S.cds,cursor:"pointer"}} onClick={()=>setExp(isE?null:w.id)}><div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:3}}>{w.routineName}</div><div style={{...S.mt,fontSize:11,marginBottom:6}}>{new Date(w.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})} · {fmtDur(w.duration)} · {(w.totalVolume||0).toLocaleString()} lbs</div></div><div style={{display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:10,color:"rgba(255,255,255,0.25)",transform:isE?"rotate(180deg)":"none",transition:"transform 0.2s"}}>▼</span><button onClick={e=>{e.stopPropagation();setCDel(w.id);}} style={{background:"none",border:"none",color:"rgba(255,255,255,0.2)",cursor:"pointer",fontSize:14}}>×</button></div></div>{w.prs?.length>0&&<span style={{display:"inline-block",padding:"2px 8px",borderRadius:6,fontSize:9,fontWeight:700,background:"rgba(251,191,36,0.1)",color:"#fbbf24",marginBottom:6}}>🏆 {w.prs.length} PR{w.prs.length>1?"s":""}</span>}<div style={{display:"flex",flexWrap:"wrap"}}>{(w.muscles||[]).map(m=><MP key={m} m={m}/>)}</div></div>{isE&&<div style={{padding:"8px 0",display:"flex",flexDirection:"column",gap:4}}>{(w.exercises||[]).map((ex,j)=>{const data=getExerciseById(ex.exerciseId);if(!data)return null;return<div key={j} style={S.cds}><button onClick={()=>onOpenExDetail(ex.exerciseId)} style={{display:"flex",alignItems:"center",gap:10,background:"none",border:"none",cursor:"pointer",width:"100%",textAlign:"left",marginBottom:6}}><EI id={ex.exerciseId} size={28}/><span style={{fontSize:12,fontWeight:600,color:"#fff"}}>{data.name}</span></button>{(ex.sets||[]).map((s,k)=><div key={k} style={{display:"flex",gap:12,paddingLeft:38,marginBottom:2}}><span style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.3)",width:20}}>{k+1}</span><span style={{fontSize:11,fontWeight:600,color:s.isPR?"#fbbf24":"rgba(255,255,255,0.65)"}}>{s.weight} × {s.reps}{s.isPR?" ⭐":""}</span></div>)}</div>;})}</div>}</div>;})}</div>}{cDel&&<Confirm title="Delete workout?" msg="This will be permanently removed." ok="Delete" color="#f87171" onOk={()=>{onDeleteWorkout(cDel);setCDel(null);}} onNo={()=>setCDel(null)}/>}</div>;}

// ─── CALENDAR ───────────────────────────────────────────────────────────────
function CalendarScreen({history,routines,onOpenExDetail,onStartRoutine}){const{accent}=useTheme();const S=useS();const[mOff,setMOff]=useState(0),[selDay,setSelDay]=useState(null),[showTmpl,setShowTmpl]=useState(false),[showAssign,setShowAssign]=useState(null);const now=new Date(),vm=new Date(now.getFullYear(),now.getMonth()-mOff,1);const yr=vm.getFullYear(),mo=vm.getMonth();const fd=(new Date(yr,mo,1).getDay()+6)%7;const dim=new Date(yr,mo+1,0).getDate();const mn=vm.toLocaleDateString("en-US",{month:"long",year:"numeric"});const wMap=useMemo(()=>{const m={};(history||[]).forEach(w=>{const k=dKey(new Date(w.date));if(!m[k])m[k]=[];m[k].push(w);});return m;},[history]);const tmpl=LS.get("dialed_weekly_template",{});const plans=LS.get("dialed_plans",{});const tKey=dKey(now);
const getPlan=k=>{if(plans[k])return plans[k];const d=new Date(k+"T12:00:00");return tmpl[DS[(d.getDay()+6)%7]]||null;};
const assignOO=(k,rid)=>{const p=LS.get("dialed_plans",{});if(rid)p[k]={routineId:rid,time:null};else delete p[k];LS.set("dialed_plans",p);setShowAssign(null);};
const selW=selDay?wMap[selDay]||[]:[];const selP=selDay?getPlan(selDay):null;const selF=selDay?selDay>=tKey:false;

return<div style={S.pg}><div style={{paddingTop:56,marginBottom:20}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><h1 style={S.tt}>Calendar</h1><button onClick={()=>setShowTmpl(true)} style={{fontSize:12,fontWeight:600,color:accent,background:"none",border:"none",cursor:"pointer",fontFamily:"'Outfit',sans-serif"}}>Schedule</button></div></div>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><button onClick={()=>setMOff(mOff+1)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.4)",cursor:"pointer",fontSize:14,padding:8}}>◀</button><span style={{fontSize:15,fontWeight:700,color:"#fff"}}>{mn}</span><button onClick={()=>setMOff(Math.max(0,mOff-1))} style={{background:"none",border:"none",color:mOff>0?"rgba(255,255,255,0.4)":"rgba(255,255,255,0.12)",cursor:mOff>0?"pointer":"default",fontSize:14,padding:8}}>▶</button></div>
<div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:4}}>{DL.map((d,i)=><div key={i} style={{textAlign:"center",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.45)",padding:"4px 0"}}>{d}</div>)}</div>
<div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:20}}>
{Array.from({length:fd}).map((_,i)=><div key={`e${i}`} style={{minHeight:60}}/>)}
{Array.from({length:dim}).map((_,i)=>{const day=i+1,k=`${yr}-${pad(mo+1)}-${pad(day)}`;const hasW=!!wMap[k];const plan=!hasW?getPlan(k):null;const isT=k===tKey;const isSel=k===selDay;const rName=hasW?wMap[k][0].routineName:plan?routines.find(r=>r.id===plan.routineId)?.name:null;
return<button key={day} onClick={()=>setSelDay(isSel?null:k)} style={{minHeight:60,borderRadius:10,border:isSel?`1.5px solid ${accent}`:isT?`1px solid rgba(255,255,255,0.2)`:"1px solid rgba(255,255,255,0.06)",background:isSel?hx(accent,.1):hasW?"rgba(255,255,255,0.05)":"rgba(255,255,255,0.02)",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"flex-start",padding:"4px 5px",gap:1,overflow:"hidden"}}>
<span style={{fontSize:11,fontWeight:isT?700:600,color:isT?"#fff":"rgba(255,255,255,0.6)",alignSelf:"flex-end"}}>{day}</span>
{rName&&<span style={{fontSize:7.5,fontWeight:600,color:hasW?accent:hx(accent,.65),lineHeight:1.2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",width:"100%"}}>{rName}</span>}
{hasW&&<div style={{width:4,height:4,borderRadius:2,background:accent,marginTop:"auto"}}/>}
</button>;})}
</div>
{selDay&&<div>{selW.length>0?selW.map(w=><div key={w.id} style={{...S.cd,marginBottom:8}}><div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:3}}>{w.routineName}</div><div style={{...S.mt,fontSize:11,marginBottom:8}}>{fmtDur(w.duration)} · {(w.totalVolume||0).toLocaleString()} lbs</div>{(w.exercises||[]).map((ex,j)=>{const data=getExerciseById(ex.exerciseId);if(!data)return null;return<div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 0",borderTop:"1px solid rgba(255,255,255,0.05)"}}><button onClick={()=>onOpenExDetail(ex.exerciseId)} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"none",cursor:"pointer",flex:1,textAlign:"left"}}><EI id={ex.exerciseId} size={24}/><span style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.75)"}}>{data.name}</span></button></div>;})}</div>)
:selP&&selF?<div style={S.cda(accent)}><div style={{fontSize:14,fontWeight:600,color:"#fff",marginBottom:3}}>{routines.find(r=>r.id===selP.routineId)?.name||"Routine"}</div><div style={{display:"flex",gap:8,marginTop:10}}><button onClick={()=>setShowAssign(selDay)} style={{...S.bg,flex:1,fontSize:11,padding:"8px 0"}}>Change</button><button onClick={()=>{const r=routines.find(x=>x.id===selP.routineId);if(r)onStartRoutine(r);}} style={{...S.bp,flex:1,fontSize:11,padding:"8px 0"}}>Start Now</button></div></div>
:selF?<button onClick={()=>setShowAssign(selDay)} style={{...S.bg,width:"100%"}}>+ Plan Workout</button>
:<p style={{...S.mt,textAlign:"center"}}>No workout this day</p>}</div>}
{showAssign&&<div style={{position:"fixed",inset:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif"}}><div onClick={()=>setShowAssign(null)} style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.5)"}}/><div style={{position:"relative",width:"85%",maxWidth:360,...glass,padding:24}}><p style={{fontSize:17,fontWeight:700,color:"#fff",marginBottom:16}}>Plan Workout</p><div style={{display:"flex",flexDirection:"column",gap:6}}>{routines.map(r=><button key={r.id} onClick={()=>assignOO(showAssign,r.id)} style={{...S.cds,textAlign:"left",cursor:"pointer",fontSize:14,fontWeight:600,color:"#fff"}}>{r.name}</button>)}</div></div></div>}
{showTmpl&&<TemplateEditor routines={routines} onClose={()=>setShowTmpl(false)}/>}
</div>;}

// ─── AWARDS ─────────────────────────────────────────────────────────────────
function AwardsScreen({history}){const{accent}=useTheme();const S=useS();const uIds=checkAch(history);const unlocked=ACHIEVEMENTS.filter(a=>uIds.includes(a.id));const locked=ACHIEVEMENTS.filter(a=>!uIds.includes(a.id));const ratio=ACHIEVEMENTS.length>0?(unlocked.length/ACHIEVEMENTS.length)*100:0;return<div style={S.pg}><div style={{paddingTop:56,marginBottom:6}}><h1 style={S.tt}>Achievements</h1><p style={{...S.mt,marginTop:4}}>{unlocked.length} of {ACHIEVEMENTS.length} unlocked</p></div><div style={{height:4,background:"rgba(255,255,255,0.06)",borderRadius:2,marginBottom:24,overflow:"hidden"}}><div style={{height:"100%",width:`${ratio}%`,background:accent,borderRadius:2}}/></div>{unlocked.length>0&&<><div style={{...S.lb,color:accent,marginBottom:10}}>UNLOCKED</div><div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>{unlocked.map(a=><div key={a.id} style={S.cda(accent)}><div style={{display:"flex",alignItems:"center",gap:14}}><span style={{fontSize:22}}>{a.icon}</span><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#fff"}}>{a.title}</div><div style={{fontSize:11,fontWeight:500,color:"rgba(255,255,255,0.4)"}}>{a.desc}</div></div></div></div>)}</div></>}{locked.length>0&&<><div style={{...S.lb,marginBottom:10}}>LOCKED</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>{locked.map(a=><div key={a.id} style={{...S.cd,background:"rgba(255,255,255,0.02)",border:"0.5px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:18,opacity:.15}}>{a.icon}</span><div style={{fontSize:11,fontWeight:600,color:"rgba(255,255,255,0.2)",marginTop:6}}>{a.title}</div><div style={{fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.12)",marginTop:2}}>{a.desc}</div></div>)}</div></>}</div>;}

// ─── BOTTOM NAV (5 tabs from handoff) ───────────────────────────────────────
const NAV=[{id:"home",d:c=><svg width="23" height="22" viewBox="0 0 23 22" fill="none"><path d="M2 11L11.5 3 21 11M4.5 9.5V19a1 1 0 001 1h4.5v-5h3v5h4.5a1 1 0 001-1V9.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},{id:"history",d:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={c} strokeWidth="1.8"/><path d="M11 6.5V11l3.5 3.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>},{id:"calendar",d:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="18" height="16" rx="3" stroke={c} strokeWidth="1.8"/><path d="M2 9.5h18M7 2v4M15 2v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>},{id:"awards",d:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 3h10M8 3v5a3 3 0 006 0V3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M5 3H3c0 3.5 2.2 5.5 5 6.2M17 3h2c0 3.5-2.2 5.5-5 6.2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M11 14v4M8 18h6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>}];

function Nav({tab,setTab}){const{accent}=useTheme();return<nav style={{position:"fixed",bottom:0,left:0,right:0,zIndex:50,background:"rgba(11,11,11,0.93)",backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)",borderTop:"1px solid rgba(255,255,255,0.045)",display:"flex",alignItems:"center",height:82,paddingBottom:16}}>{NAV.map(n=>{const a=tab===n.id;const c=a?accent:"rgba(255,255,255,0.2)";return<div key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,cursor:"pointer",paddingTop:2}}>{n.d(c)}{a&&<div style={{width:5,height:5,borderRadius:3,background:accent}}/>}</div>;})}</nav>;}

// ─── MAIN APP ───────────────────────────────────────────────────────────────
export default function App(){
const[profile,setProfile]=useState(()=>LS.get("dialed_profile",null));
const[routines,setRoutines]=useState(()=>LS.get("dialed_routines",[]));
const[history,setHistory]=useState(()=>LS.get("dialed_history",[]));
const[tab,setTab]=useState("home");const[view,setView]=useState("tabs");
const[editR,setEditR]=useState(null);const[activeR,setActiveR]=useState(null);const[lastW,setLastW]=useState(null);
const[showSettings,setShowSettings]=useState(false);const[exDetail,setExDetail]=useState(null);
const theme=THEMES[profile?.theme||"emerald"]||THEMES.emerald;
useEffect(()=>{LS.set("dialed_routines",routines);},[routines]);
useEffect(()=>{LS.set("dialed_history",history);},[history]);
const up=p=>{setProfile(p);LS.set("dialed_profile",p);};
const saveR=r=>{const i=routines.findIndex(x=>x.id===r.id);if(i>=0){const u=[...routines];u[i]=r;setRoutines(u);}else setRoutines([...routines,r]);setView("tabs");setEditR(null);};
const startR=r=>{setActiveR(r);setView("workout");};

return<ThemeCtx.Provider value={theme}>
<div style={{position:"relative",minHeight:"100vh",background:"#0d0d0d",overflow:"hidden"}}>
<BeamsCanvas accent={theme.accent}/>
<FilmGrain/>
{!profile?.onboarded?<Onboarding onComplete={()=>{setProfile(LS.get("dialed_profile"));setRoutines(LS.get("dialed_routines",[]));}}/>:
view==="builder"?<RoutineBuilder routine={editR} onSave={saveR} onBack={()=>{setView("tabs");setEditR(null);}} onDelete={id=>setRoutines(routines.filter(r=>r.id!==id))} history={history}/>:
view==="workout"?<LiveWorkout routine={activeR} history={history} onFinish={w=>{setHistory([...history,w]);setLastW(w);setView("summary");setActiveR(null);}} onCancel={()=>{setView("tabs");setActiveR(null);}}/>:
view==="summary"&&lastW?<WorkoutSummary workout={lastW} onDone={()=>{setView("tabs");setLastW(null);}}/>:
<>{tab==="home"&&<HomeScreen profile={profile} history={history} routines={routines} onStartRoutine={startR} onNewRoutine={()=>{setEditR(null);setView("builder");}} onEditRoutine={r=>{setEditR(r);setView("builder");}} onQuickStart={()=>{setActiveR({name:"Quick Workout",exercises:[]});setView("workout");}} onOpenSettings={()=>setShowSettings(true)}/>}
{tab==="history"&&<HistoryScreen history={history} onDeleteWorkout={id=>setHistory(history.filter(w=>w.id!==id))} onOpenExDetail={id=>setExDetail(id)}/>}
{tab==="calendar"&&<CalendarScreen history={history} routines={routines} onOpenExDetail={id=>setExDetail(id)} onStartRoutine={startR}/>}
{tab==="awards"&&<AwardsScreen history={history}/>}
<Nav tab={tab} setTab={setTab}/>
</>}
{showSettings&&<Settings profile={profile} onClose={()=>setShowSettings(false)} onUpdate={up}/>}
{exDetail&&<ExDetail exerciseId={exDetail} history={history} onClose={()=>setExDetail(null)}/>}
</div>
<style>{globalCSS}</style>
</ThemeCtx.Provider>;}

const globalCSS=`
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@200;300;400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body,#root{background:#0d0d0d;color:#fff;font-family:'Outfit',sans-serif;-webkit-font-smoothing:antialiased;min-height:100vh;overflow-x:hidden}
input[type="number"]::-webkit-inner-spin-button,input[type="number"]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}
input[type="number"]{-moz-appearance:textfield}
input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.25)}
select{-webkit-appearance:none}
button{-webkit-tap-highlight-color:transparent}
::-webkit-scrollbar{width:0;height:0}
`;
