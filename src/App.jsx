import React from 'react';
import {
  THEMES, MC, TWEAK_DEFAULTS, DEFAULT_ROUTINES,
  ALL_EXERCISES, EXERCISE_TYPES, EXERCISE_TYPE_COLORS,
} from './data.js';
import { supabase } from './supabase.js';
import { pushToCloud, pullFromCloud } from './sync.js';

// ─── Native detection & haptics ───────────────────────────────
const isNative = () => !!(window.Capacitor?.isNativePlatform?.());
const haptic = async (style = 'medium') => {
  try {
    if (!isNative()) return;
    const Plugins = window.Capacitor?.Plugins;
    if (!Plugins?.Haptics) return;
    const s = style === 'light' ? 'LIGHT' : style === 'heavy' ? 'HEAVY' : 'MEDIUM';
    await Plugins.Haptics.impact({ style: s });
  } catch(e) {}
};
const hapticSelect = async () => {
  try {
    if (!isNative()) return;
    const Plugins = window.Capacitor?.Plugins;
    if (!Plugins?.Haptics) return;
    await Plugins.Haptics.selectionChanged();
  } catch(e) {}
};

// ─── Helpers ──────────────────────────────────────────────────
const h2r = hex => {
  if (!hex || hex.length < 7) return '125,211,252';
  return `${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)}`;
};
const calc1RM = (w, r) => Math.round(w * (1 + r / 30));
const uid = () => Math.random().toString(36).slice(2, 9);

// ─── Beams ────────────────────────────────────────────────────
function BeamsCanvas({ accent, intensity }) {
  const ref = React.useRef(null);
  const aRef = React.useRef(accent);
  const iRef = React.useRef(intensity);
  React.useEffect(() => { aRef.current = accent; }, [accent]);
  React.useEffect(() => { iRef.current = intensity; }, [intensity]);
  React.useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 390, H = 844; canvas.width = W; canvas.height = H;
    class Beam {
      reset(s) {
        this.x=40+Math.random()*310; this.y=s?Math.random()*H:H+80;
        this.vy=-(0.55+Math.random()*1.3); this.vx=(Math.random()-0.5)*0.35;
        this.rx=60+Math.random()*120; this.ry=160+Math.random()*320;
        this.baseA=0.48+Math.random()*0.44; this.phase=Math.random()*Math.PI*2;
        this.ps=0.007+Math.random()*0.016; this.wo=Math.random()*Math.PI*2;
        this.ws=0.004+Math.random()*0.007; this.life=s?Math.random()*500:0;
        this.maxLife=420+Math.random()*340;
      }
      constructor(s){this.reset(s);}
      update(t){
        this.wo+=this.ws; this.x+=this.vx+Math.sin(this.wo)*0.22; this.y+=this.vy; this.life++;
        const p=0.68+0.32*Math.sin(t*this.ps+this.phase);
        this.alpha=this.baseA*p*Math.min(this.life/90,1)*Math.min((this.maxLife-this.life)/90,1)*(iRef.current/100);
      }
      draw(ctx){
        const rgb=h2r(aRef.current); ctx.save(); ctx.filter='blur(24px)';
        const g=ctx.createRadialGradient(this.x,this.y,0,this.x,this.y,this.rx*1.6);
        g.addColorStop(0,`rgba(${rgb},${Math.min(this.alpha,1)})`);
        g.addColorStop(0.3,`rgba(${rgb},${Math.min(this.alpha*0.6,1)})`);
        g.addColorStop(1,`rgba(${rgb},0)`);
        ctx.fillStyle=g; ctx.beginPath(); ctx.ellipse(this.x,this.y,this.rx,this.ry,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
      dead(){return this.life>=this.maxLife||this.y<-(this.ry+20);}
    }
    let beams=Array.from({length:16},()=>new Beam(true)); let t=0,raf;
    const tick=()=>{ctx.clearRect(0,0,W,H);t++;beams=beams.filter(b=>!b.dead());while(beams.length<16)beams.push(new Beam(false));beams.forEach(b=>{b.update(t);b.draw(ctx);});raf=requestAnimationFrame(tick);};
    tick(); return ()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{position:'absolute',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none'}}/>;
}

function FilmGrain(){
  return(
    <div style={{position:'absolute',inset:0,zIndex:55,pointerEvents:'none',mixBlendMode:'overlay'}}>
      <svg width="100%" height="100%" style={{position:'absolute',inset:0}}>
        <filter id="gr"><feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
        <rect width="100%" height="100%" filter="url(#gr)" opacity="0.18"/>
      </svg>
    </div>
  );
}

function StatusBar(){
  const t=new Date(); const time=`${t.getHours()%12||12}:${String(t.getMinutes()).padStart(2,'0')}`;
  return(
    <div style={{position:'absolute',top:0,left:0,right:0,height:54,zIndex:20,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 28px 0',pointerEvents:'none'}}>
      <span style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.92)'}}>{time}</span>
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none"><rect x="0" y="7" width="3" height="5" rx="0.6" fill="rgba(255,255,255,0.85)"/><rect x="5" y="4" width="3" height="8" rx="0.6" fill="rgba(255,255,255,0.85)"/><rect x="10" y="1.5" width="3" height="10.5" rx="0.6" fill="rgba(255,255,255,0.85)"/><rect x="15" y="0" width="3" height="12" rx="0.6" fill="rgba(255,255,255,0.85)"/></svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none"><rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="rgba(255,255,255,0.45)"/><rect x="2" y="2" width="17" height="9" rx="2" fill="rgba(255,255,255,0.88)"/><path d="M24 4.5V8.5C24.8 8.2 25.5 7.4 25.5 6.5S24.8 4.8 24 4.5Z" fill="rgba(255,255,255,0.4)"/></svg>
      </div>
    </div>
  );
}

const Lbl = ({children}) => <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.3,textTransform:'uppercase',marginBottom:14}}>{children}</div>;

function PhoneFrame({children}){
  if(isNative()) return <div style={{width:'100%',height:'100dvh',overflow:'hidden',background:'#050a07',position:'relative'}}>{children}</div>;
  return(
    <div style={{position:'relative',borderRadius:57,padding:11,background:'linear-gradient(150deg,#262626 0%,#0f0f0f 60%,#1a1a1a 100%)',boxShadow:'0 64px 120px rgba(0,0,0,0.85),0 0 0 1px rgba(255,255,255,0.07),inset 0 1px 0 rgba(255,255,255,0.09)'}}>
      {[[true,118,32],[true,162,32],[true,210,68],[false,166,82]].map(([l,top,h],i)=>(
        <div key={i} style={{position:'absolute',[l?'left':'right']:-3,top,width:3,height:h,background:'#1c1c1c',borderRadius:l?'3px 0 0 3px':'0 3px 3px 0'}}/>
      ))}
      <div style={{width:390,height:844,borderRadius:47,overflow:'hidden',background:'#0d0d0d',position:'relative'}}>
        {children}
        <div style={{position:'absolute',top:12,left:'50%',transform:'translateX(-50%)',width:124,height:36,background:'#000',borderRadius:20,zIndex:80,pointerEvents:'none'}}/>
        <div style={{position:'absolute',bottom:9,left:'50%',transform:'translateX(-50%)',width:134,height:5,borderRadius:3,background:'rgba(255,255,255,0.26)',zIndex:80,pointerEvents:'none'}}/>
      </div>
    </div>
  );
}

// ─── Onboarding ───────────────────────────────────────────────
function OnboardingScreen({onComplete}){
  const [step,setStep]=React.useState(0);
  const [name,setName]=React.useState('');
  const [unit,setUnit]=React.useState('lbs');
  const [theme,setTheme]=React.useState('Ice');
  const accent=THEMES[theme]?.p||'#7dd3fc';
  const rgb=h2r(accent);
  const TOTAL_STEPS=5;
  const canNext=step===0||(step===1&&name.trim().length>0)||step===2||step===3||step===4;

  const PRESET_ROUTINES=[
    {name:'Push A',muscles:['Chest','Shoulders','Triceps'],exercises:6,desc:'Bench, OHP, Cable Fly, Laterals...'},
    {name:'Pull B',muscles:['Back','Biceps'],exercises:5,desc:'Deadlift, Pull-Up, Cable Row...'},
    {name:'Legs C',muscles:['Quads','Hamstrings','Glutes'],exercises:7,desc:'Squat, Romanian DL, Leg Press...'},
    {name:'Upper D',muscles:['Chest','Back','Shoulders'],exercises:8,desc:'DB Bench, Bent Row, OHP...'},
  ];

  return(
    <div style={{position:'absolute',inset:0,zIndex:500,background:'#0a0a0a',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'0 32px'}}>
      <div style={{position:'absolute',top:'18%',left:'50%',transform:'translateX(-50%)',width:280,height:280,borderRadius:'50%',background:`rgba(${rgb},0.1)`,filter:'blur(80px)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',top:68,display:'flex',gap:8}}>
        {Array.from({length:TOTAL_STEPS},(_,i)=>(
          <div key={i} style={{width:i===step?20:6,height:6,borderRadius:3,background:i===step?accent:'rgba(255,255,255,0.12)',transition:'all 0.3s'}}/>
        ))}
      </div>
      <div style={{width:'100%',position:'relative',zIndex:1}}>
        {step===0&&(
          <div style={{textAlign:'center',animation:'dialIn 0.35s ease'}}>
            <div style={{fontSize:52,marginBottom:20}}>🏋️</div>
            <div style={{fontSize:34,fontWeight:800,color:'#fff',letterSpacing:-1.5,marginBottom:12,lineHeight:1.1}}>Welcome to<br/>Dialed</div>
            <div style={{fontSize:15,color:'rgba(255,255,255,0.38)',lineHeight:1.6}}>Track your lifts, see your progress, stay consistent. Let's get you set up.</div>
          </div>
        )}
        {step===1&&(
          <div style={{animation:'dialIn 0.35s ease'}}>
            <div style={{fontSize:28,fontWeight:800,color:'#fff',letterSpacing:-1,marginBottom:8}}>What's your name?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:32}}>We'll use it to personalise your experience.</div>
            <input autoFocus value={name} onChange={e=>setName(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&name.trim())setStep(2);}} placeholder="Your first name" style={{width:'100%',background:'rgba(255,255,255,0.06)',border:`1px solid rgba(${rgb},0.3)`,borderRadius:16,padding:'16px 18px',fontSize:18,fontWeight:600,color:'#fff',outline:'none',fontFamily:'Outfit,sans-serif'}}/>
          </div>
        )}
        {step===2&&(
          <div style={{animation:'dialIn 0.35s ease'}}>
            <div style={{fontSize:28,fontWeight:800,color:'#fff',letterSpacing:-1,marginBottom:8}}>Weight unit?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:32}}>You can change this later in settings.</div>
            <div style={{display:'flex',gap:12}}>
              {['lbs','kg'].map(u=>{const sel=unit===u;const ur=h2r(accent);return(
                <div key={u} onClick={()=>setUnit(u)} style={{flex:1,height:72,borderRadius:20,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,background:sel?`rgba(${ur},0.18)`:'rgba(255,255,255,0.04)',border:sel?`1px solid rgba(${ur},0.4)`:'1px solid rgba(255,255,255,0.08)',cursor:'pointer',transition:'all 0.15s'}}>
                  <span style={{fontSize:26,fontWeight:800,color:sel?accent:'rgba(255,255,255,0.5)'}}>{u}</span>
                  <span style={{fontSize:11,color:sel?`rgba(${ur},0.7)`:'rgba(255,255,255,0.2)',fontWeight:500}}>{u==='lbs'?'Pounds':'Kilograms'}</span>
                </div>
              );})}
            </div>
          </div>
        )}
        {step===3&&(
          <div style={{animation:'dialIn 0.35s ease'}}>
            <div style={{fontSize:28,fontWeight:800,color:'#fff',letterSpacing:-1,marginBottom:8}}>Pick your color</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:32}}>Your accent color throughout the app.</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {Object.entries(THEMES).map(([k,v])=>{const sel=theme===k;const tr=h2r(v.p);return(
                <div key={k} onClick={()=>setTheme(k)} style={{height:64,borderRadius:18,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,background:sel?`rgba(${tr},0.2)`:'rgba(255,255,255,0.04)',border:sel?`2px solid ${v.p}`:'1px solid rgba(255,255,255,0.07)',cursor:'pointer',transition:'all 0.15s'}}>
                  <div style={{width:24,height:24,borderRadius:8,background:v.p,boxShadow:sel?`0 0 12px ${v.p}`:'none'}}/>
                  <span style={{fontSize:10,fontWeight:700,color:sel?v.p:'rgba(255,255,255,0.3)',letterSpacing:0.3}}>{k}</span>
                </div>
              );})}
            </div>
          </div>
        )}
        {step===4&&(
          <div style={{animation:'dialIn 0.35s ease'}}>
            <div style={{fontSize:28,fontWeight:800,color:'#fff',letterSpacing:-1,marginBottom:8}}>Start with routines?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:24,lineHeight:1.6}}>We have 4 pre-built Push/Pull/Legs routines ready to go. You can always edit or delete them later.</div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:8}}>
              {PRESET_ROUTINES.map(r=>{
                const pc=MC[r.muscles[0]]||accent; const cr=h2r(pc);
                return(
                  <div key={r.name} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 14px',background:`rgba(${cr},0.06)`,border:`1px solid rgba(${cr},0.15)`,borderRadius:16}}>
                    <div style={{width:36,height:36,borderRadius:11,background:`rgba(${cr},0.15)`,border:`1px solid rgba(${cr},0.25)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:pc,flexShrink:0}}>{r.name[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:'#fff',marginBottom:2}}>{r.name}</div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.3)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{r.desc}</div>
                    </div>
                    <div style={{display:'flex',gap:4,flexShrink:0}}>
                      {r.muscles.map(m=>{const mc2=MC[m];return <div key={m} style={{width:8,height:8,borderRadius:4,background:mc2}}/>;}) }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      <div style={{position:'absolute',bottom:56,left:32,right:32,display:'flex',flexDirection:'column',gap:10}}>
        {step===4?(
          <>
            <div onClick={()=>onComplete({name:name.trim()||'Athlete',unit,theme,usePresets:true})} style={{height:56,borderRadius:18,background:`linear-gradient(135deg,${accent},${THEMES['Emerald']?.g||accent})`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 8px 28px rgba(${rgb},0.35)`}}>
              <span style={{fontSize:16,fontWeight:700,color:'#000'}}>Yes, add pre-built routines →</span>
            </div>
            <div onClick={()=>onComplete({name:name.trim()||'Athlete',unit,theme,usePresets:false})} style={{height:48,borderRadius:18,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
              <span style={{fontSize:15,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>No thanks, start blank</span>
            </div>
          </>
        ):(
          <div onClick={()=>{if(!canNext)return;setStep(s=>s+1);}}
            style={{height:56,borderRadius:18,background:canNext?`linear-gradient(135deg,${accent},${THEMES['Emerald']?.g||accent})`:'rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',cursor:canNext?'pointer':'default',transition:'all 0.2s',boxShadow:canNext?`0 8px 28px rgba(${rgb},0.35)`:'none'}}>
            <span style={{fontSize:16,fontWeight:700,color:canNext?'#000':'rgba(255,255,255,0.2)'}}>Continue →</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Exercise Picker Sheet (shared by workout + routine builder) ─
function ExercisePicker({accent,onAdd,onClose,customExercises=[],onNewCustomSaved}){
  const rgb=h2r(accent);
  const [search,setSearch]=React.useState('');
  const [muscle,setMuscle]=React.useState('All');
  const [showCreator,setShowCreator]=React.useState(false);
  const allLib=[...ALL_EXERCISES,...customExercises];
  const filtered=allLib.filter(e=>{
    const ms=e.name.toLowerCase().includes(search.toLowerCase())||e.muscle.toLowerCase().includes(search.toLowerCase());
    const mm=muscle==='All'||e.muscle===muscle;
    return ms&&mm;
  });
  if(showCreator) return(
    <CustomExerciseCreator accent={accent} onClose={()=>setShowCreator(false)} onSave={ex=>{setShowCreator(false);if(onNewCustomSaved)onNewCustomSaved(ex);onAdd(ex);}}/>
  );
  return(
    <div style={{position:'absolute',inset:0,zIndex:500,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
      <div style={{width:'100%',background:'#151515',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.08)',borderBottom:'none',display:'flex',flexDirection:'column',maxHeight:'80%'}}>
        <div style={{padding:'16px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:17,fontWeight:700,color:'#fff',letterSpacing:-0.4}}>Add Exercise</div>
          <div onClick={onClose} style={{cursor:'pointer',opacity:0.4,padding:'4px'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
        </div>
        <div style={{padding:'12px 16px 8px',display:'flex',flexDirection:'column',gap:10}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'10px 14px'}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4"/><path d="M10 10l3 3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round"/></svg>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search exercises" style={{background:'none',border:'none',outline:'none',color:'#fff',fontSize:15,flex:1,fontFamily:'Outfit,sans-serif'}}/>
          </div>
          <div style={{display:'flex',gap:7,overflowX:'auto',paddingBottom:2}}>
            {['All','Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings','Glutes','Core','Calves','Forearms'].map(mg=>{
              const c=MC[mg]||accent; const cr=h2r(c); const sel=muscle===mg;
              return <div key={mg} onClick={()=>setMuscle(mg)} style={{padding:'5px 13px',borderRadius:20,flexShrink:0,cursor:'pointer',background:sel?`rgba(${cr},0.2)`:'rgba(255,255,255,0.06)',border:sel?`1px solid rgba(${cr},0.35)`:'1px solid rgba(255,255,255,0.08)',fontSize:12,fontWeight:600,color:sel?c:'rgba(255,255,255,0.45)',transition:'all 0.15s'}}>{mg}</div>;
            })}
          </div>
        </div>
        <div style={{overflowY:'auto',flex:1,padding:'4px 16px 0'}}>
          {filtered.map(e=>{
            const mc=MC[e.muscle]||accent;
            return(
              <div key={e.name} onClick={()=>onAdd(e)} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',cursor:'pointer'}}>
                <div style={{width:36,height:36,borderRadius:11,background:`${mc}18`,border:`1px solid ${mc}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:mc,flexShrink:0}}>{e.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:15,fontWeight:600,color:'#fff'}}>{e.name}</span>
                    {e.isCustom&&<span style={{fontSize:9,fontWeight:700,color:accent,background:`rgba(${rgb},0.14)`,border:`1px solid rgba(${rgb},0.22)`,borderRadius:20,padding:'1px 6px'}}>CUSTOM</span>}
                  </div>
                  <div style={{fontSize:11.5,color:mc,marginTop:2,fontWeight:500}}>{e.muscle}</div>
                </div>
                <svg width="7" height="13" viewBox="0 0 7 13" fill="none"><path d="M1 1l5 5.5L1 12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            );
          })}
          <div onClick={()=>setShowCreator(true)} style={{display:'flex',alignItems:'center',gap:12,padding:'14px 0',cursor:'pointer',margin:'4px 0 28px'}}>
            <div style={{width:36,height:36,borderRadius:11,background:`rgba(${rgb},0.12)`,border:`1px dashed rgba(${rgb},0.3)`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke={accent} strokeWidth="1.8" strokeLinecap="round"/></svg>
            </div>
            <div>
              <div style={{fontSize:15,fontWeight:600,color:accent}}>Create Custom Exercise</div>
              <div style={{fontSize:11.5,color:'rgba(255,255,255,0.3)',marginTop:2}}>Add to your personal library</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Custom Exercise Creator ──────────────────────────────────
function CustomExerciseCreator({accent,onClose,onSave}){
  const rgb=h2r(accent);
  const [name,setName]=React.useState('');
  const [type,setType]=React.useState('');
  const [muscle,setMuscle]=React.useState('');
  const [secondary,setSecondary]=React.useState([]);
  const muscles=Object.keys(MC).filter(m=>m!=='Full Body');
  const canSave=name.trim()&&type&&muscle;
  return(
    <div style={{position:'absolute',inset:0,zIndex:600,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)'}}>
      <div style={{width:'100%',background:'#141414',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.08)',borderBottom:'none',maxHeight:'90%',display:'flex',flexDirection:'column',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
        <div style={{padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:-0.4}}>Create Exercise</div>
          <div onClick={onClose} style={{cursor:'pointer',opacity:0.35,padding:'6px'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
        </div>
        <div style={{overflowY:'auto',flex:1,padding:'16px 20px'}}>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>Exercise Name</div>
            <input autoFocus value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Close Grip Bench Press" style={{width:'100%',background:'rgba(255,255,255,0.06)',border:`1px solid rgba(${rgb},0.2)`,borderRadius:14,padding:'13px 16px',fontSize:16,fontWeight:500,color:'#fff',outline:'none',fontFamily:'Outfit,sans-serif'}}/>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>Exercise Type</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {EXERCISE_TYPES.map(t=>{const sel=type===t;const c=EXERCISE_TYPE_COLORS[t];const cr=h2r(c);return(
                <div key={t} onClick={()=>setType(t)} style={{padding:'7px 16px',borderRadius:100,cursor:'pointer',background:sel?`rgba(${cr},0.2)`:`rgba(${cr},0.06)`,border:sel?`1px solid rgba(${cr},0.45)`:`1px solid rgba(${cr},0.2)`,fontSize:13,fontWeight:700,color:sel?c:`rgba(${cr},0.7)`,transition:'all 0.15s'}}>{t}</div>
              );})}
            </div>
          </div>
          <div style={{marginBottom:22}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>Primary Muscle</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {muscles.map(m=>{const sel=muscle===m;const c=MC[m];const cr=h2r(c);return(
                <div key={m} onClick={()=>{setMuscle(m);setSecondary(p=>p.filter(x=>x!==m));}} style={{padding:'7px 16px',borderRadius:100,cursor:'pointer',background:sel?`rgba(${cr},0.2)`:`rgba(${cr},0.06)`,border:sel?`1px solid rgba(${cr},0.45)`:`1px solid rgba(${cr},0.2)`,fontSize:13,fontWeight:700,color:sel?c:`rgba(${cr},0.55)`,transition:'all 0.15s'}}>{m}</div>
              );})}
            </div>
          </div>
          <div style={{marginBottom:8}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>Secondary Muscles <span style={{opacity:0.5,fontWeight:400,textTransform:'none',letterSpacing:0}}>(optional)</span></div>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
              {muscles.filter(m=>m!==muscle).map(m=>{const sel=secondary.includes(m);const c=MC[m];const cr=h2r(c);return(
                <div key={m} onClick={()=>setSecondary(p=>p.includes(m)?p.filter(x=>x!==m):[...p,m])} style={{padding:'7px 16px',borderRadius:100,cursor:'pointer',background:sel?`rgba(${cr},0.15)`:'rgba(255,255,255,0.04)',border:sel?`1px solid rgba(${cr},0.35)`:'1px solid rgba(255,255,255,0.08)',fontSize:13,fontWeight:600,color:sel?c:'rgba(255,255,255,0.3)',transition:'all 0.15s',opacity:!muscle?0.4:1}}>{m}</div>
              );})}
            </div>
          </div>
        </div>
        <div style={{padding:'12px 20px 36px',borderTop:'1px solid rgba(255,255,255,0.05)'}}>
          <div onClick={()=>{if(!canSave)return;onSave({name:name.trim(),muscle,secondary,type,isCustom:true,isTime:type==='Timed'});}} style={{height:52,borderRadius:16,background:canSave?`linear-gradient(135deg,${accent},${THEMES['Emerald']?.g||accent})`:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',justifyContent:'center',cursor:canSave?'pointer':'default',transition:'all 0.2s',boxShadow:canSave?`0 6px 24px rgba(${rgb},0.3)`:'none'}}>
            <span style={{fontSize:16,fontWeight:700,color:canSave?'#000':'rgba(255,255,255,0.2)'}}>Save Exercise</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Routine Builder (create + edit) ─────────────────────────
function RoutineBuilder({accent,existing,onClose,onSave,onDelete,customExercises,onSaveCustomExercise}){
  const rgb=h2r(accent);
  const isEdit=!!existing;
  const [rName,setRName]=React.useState(existing?.name||'');
  const [exercises,setExercises]=React.useState(existing?.exercises?.map(e=>({...e,_id:uid()}))||[]);
  const [showPicker,setShowPicker]=React.useState(false);
  const [showDeleteConfirm,setShowDeleteConfirm]=React.useState(false);

  const [localCustom,setLocalCustom]=React.useState(customExercises||[]);
  const muscleFor=exName=>{const f=[...ALL_EXERCISES,...localCustom].find(e=>e.name===exName);return f?f.muscle:'Full Body';};
  const derivedMuscles=[...new Set(exercises.map(e=>muscleFor(e.name)))].slice(0,3);

  const addEx=ex=>{setExercises(p=>[...p,{name:ex.name,sets:3,reps:'8–12',last:'—',_id:uid()}]);setShowPicker(false);};
  const removeEx=id=>setExercises(p=>p.filter(e=>e._id!==id));
  const updateSets=(id,val)=>setExercises(p=>p.map(e=>e._id===id?{...e,sets:Math.max(1,parseInt(val)||1)}:e));
  const canSave=rName.trim().length>0&&exercises.length>0;

  const handleSave=()=>{
    if(!canSave)return;
    onSave({
      id:existing?.id||uid(),
      name:rName.trim(),
      muscles:derivedMuscles,
      lastDone:existing?.lastDone||'Never',
      freq:'',
      exercises:exercises.map(({_id,...rest})=>rest),
    });
  };

  return(
    <div style={{position:'absolute',inset:0,zIndex:400,background:'#0d0d0d',display:'flex',flexDirection:'column',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}}>
      {/* Header */}
      <div style={{background:'rgba(13,13,13,0.96)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'54px 18px 14px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexShrink:0}}>
        <div onClick={onClose} style={{cursor:'pointer',padding:'4px 8px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10}}>
          <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>Cancel</span>
        </div>
        <div style={{fontSize:16,fontWeight:700,color:'#fff',letterSpacing:-0.3}}>{isEdit?'Edit Routine':'New Routine'}</div>
        <div onClick={handleSave} style={{cursor:canSave?'pointer':'default',padding:'4px 14px',background:canSave?`rgba(${rgb},0.2)`:'rgba(255,255,255,0.04)',border:canSave?`1px solid rgba(${rgb},0.35)`:'1px solid rgba(255,255,255,0.08)',borderRadius:10}}>
          <span style={{fontSize:13,fontWeight:700,color:canSave?accent:'rgba(255,255,255,0.2)'}}>Save</span>
        </div>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'16px 14px 40px'}}>
        {/* Name input */}
        <div style={{marginBottom:20}}>
          <input value={rName} onChange={e=>setRName(e.target.value)} placeholder="Routine name (e.g. Push A)" style={{width:'100%',background:'rgba(255,255,255,0.05)',border:`1px solid rgba(${rgb},0.2)`,borderRadius:16,padding:'14px 18px',fontSize:20,fontWeight:700,color:'#fff',outline:'none',fontFamily:'Outfit,sans-serif',letterSpacing:-0.5}}/>
        </div>

        {/* Derived muscles */}
        {derivedMuscles.length>0&&(
          <div style={{display:'flex',gap:8,marginBottom:18,flexWrap:'wrap'}}>
            {derivedMuscles.map(m=>{const c=MC[m]||accent;const cr=h2r(c);return(
              <div key={m} style={{padding:'5px 13px',borderRadius:100,background:`rgba(${cr},0.12)`,border:`1px solid rgba(${cr},0.25)`,fontSize:12,fontWeight:700,color:c}}>{m}</div>
            );})}
          </div>
        )}

        {/* Exercises */}
        {exercises.length===0&&(
          <div style={{textAlign:'center',padding:'40px 20px',color:'rgba(255,255,255,0.2)',fontSize:14}}>Add exercises to build your routine</div>
        )}
        {exercises.map((ex)=>{
          const mc=MC[muscleFor(ex.name)]||accent;
          return(
            <div key={ex._id} style={{marginBottom:10,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:18,padding:'14px 14px'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:34,height:34,borderRadius:11,flexShrink:0,background:`${mc}18`,border:`1px solid ${mc}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:mc}}>{ex.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.5,fontWeight:700,color:'#fff',letterSpacing:-0.3,marginBottom:3}}>{ex.name}</div>
                  <span style={{fontSize:10.5,fontWeight:700,color:mc,background:`${mc}15`,border:`1px solid ${mc}28`,borderRadius:20,padding:'2px 8px'}}>{muscleFor(ex.name)}</span>
                </div>
                <div onClick={()=>removeEx(ex._id)} style={{cursor:'pointer',padding:'6px 6px',background:'rgba(255,68,68,0.1)',border:'1px solid rgba(255,68,68,0.18)',borderRadius:8}}>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="#FF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:10,marginTop:12}}>
                <span style={{fontSize:12,color:'rgba(255,255,255,0.35)',fontWeight:500}}>Sets</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div onClick={()=>updateSets(ex._id,ex.sets-1)} style={{width:28,height:28,borderRadius:9,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16,color:'rgba(255,255,255,0.6)'}}>−</div>
                  <span style={{fontSize:16,fontWeight:700,color:'#fff',minWidth:20,textAlign:'center'}}>{ex.sets}</span>
                  <div onClick={()=>updateSets(ex._id,ex.sets+1)} style={{width:28,height:28,borderRadius:9,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:16,color:'rgba(255,255,255,0.6)'}}>+</div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add exercise button */}
        <div onClick={()=>setShowPicker(true)} style={{height:46,borderRadius:14,border:`1px dashed rgba(${rgb},0.25)`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:8,marginTop:4}}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke={`rgba(${rgb},0.5)`} strokeWidth="1.8" strokeLinecap="round"/></svg>
          <span style={{fontSize:13,fontWeight:600,color:`rgba(${rgb},0.55)`}}>Add Exercise</span>
        </div>

        {/* Delete routine */}
        {isEdit&&(
          <div onClick={()=>setShowDeleteConfirm(true)} style={{height:46,borderRadius:14,border:'1px solid rgba(244,63,94,0.18)',background:'rgba(244,63,94,0.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',marginTop:16}}>
            <span style={{fontSize:14,fontWeight:600,color:'#f43f5e'}}>Delete Routine</span>
          </div>
        )}
      </div>

      {showPicker&&<ExercisePicker accent={accent} onAdd={addEx} onClose={()=>setShowPicker(false)} customExercises={localCustom} onNewCustomSaved={ex=>{setLocalCustom(p=>[...p,ex]);if(onSaveCustomExercise)onSaveCustomExercise(ex);}}/>}

      {/* Delete confirm */}
      {showDeleteConfirm&&(
        <div style={{position:'absolute',inset:0,zIndex:600,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
          <div style={{width:'100%',background:'#161616',borderRadius:'28px 28px 0 0',padding:'28px 22px 48px',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:8,letterSpacing:-0.5}}>Delete "{existing?.name}"?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:28,lineHeight:1.5}}>This can't be undone. Your workout history won't be affected.</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div onClick={()=>{onDelete(existing.id);}} style={{height:52,borderRadius:16,background:'rgba(244,63,94,0.15)',border:'1px solid rgba(244,63,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16,fontWeight:700,color:'#f43f5e'}}>Yes, Delete</span>
              </div>
              <div onClick={()=>setShowDeleteConfirm(false)} style={{height:52,borderRadius:16,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Routine Sheet (view + launch) ───────────────────────────
function RoutineSheet({r,accent,onClose,onStart,onEdit}){
  const rgb=h2r(accent);const [sp,setSp]=React.useState(false);
  return(
    <div style={{position:'absolute',inset:0,zIndex:200,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.6)',backdropFilter:'blur(6px)'}}/>
      <div style={{position:'relative',zIndex:1,background:'#141414',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none',maxHeight:'82%',display:'flex',flexDirection:'column',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
        <div style={{padding:'18px 22px 16px',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:24,fontWeight:700,color:'#fff',letterSpacing:-0.6,marginBottom:5}}>{r.name}</div>
            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
              {r.muscles.map((m,mi)=>(<React.Fragment key={m}>{mi>0&&<div style={{width:3,height:3,borderRadius:2,background:'rgba(255,255,255,0.15)'}}/>}<span style={{fontSize:13,fontWeight:600,color:MC[m]||accent}}>{m}</span></React.Fragment>))}
            </div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'flex-start',paddingTop:2}}>
            <div onClick={()=>{onClose();onEdit(r);}} style={{height:32,padding:'0 12px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',cursor:'pointer'}}>
              <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.45)'}}>Edit</span>
            </div>
          </div>
        </div>
        <div style={{height:1,background:'rgba(255,255,255,0.05)',margin:'0 22px'}}/>
        <div style={{overflowY:'auto',flex:1,padding:'8px 0 20px'}}>
          {r.exercises.map((ex,i)=>(
            <div key={ex.name+i} style={{display:'flex',alignItems:'center',padding:'14px 22px',borderBottom:i<r.exercises.length-1?'1px solid rgba(255,255,255,0.04)':'none'}}>
              <div style={{width:28,height:28,borderRadius:10,flexShrink:0,background:`rgba(${rgb},0.1)`,border:`1px solid rgba(${rgb},0.18)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:accent,marginRight:14}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:600,color:'#fff',letterSpacing:-0.2,marginBottom:3}}>{ex.name}</div>
                <div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>{ex.sets} sets · {ex.reps} reps</div>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.28)'}}>{ex.last}</div>
            </div>
          ))}
        </div>
        <div style={{padding:'12px 22px 36px'}}>
          <div onPointerDown={()=>setSp(true)} onPointerUp={()=>setSp(false)} onPointerLeave={()=>setSp(false)} onClick={()=>onStart&&onStart(r)} style={{height:56,borderRadius:18,background:`linear-gradient(135deg,${accent} 0%,${THEMES['Emerald']?.g||accent} 100%)`,display:'flex',alignItems:'center',justifyContent:'center',gap:10,cursor:'pointer',transform:sp?'scale(0.97)':'scale(1)',transition:'transform 0.1s',boxShadow:`0 8px 28px rgba(${rgb},0.35)`}}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 1l14 8-14 8V1z" fill="#000"/></svg>
            <span style={{fontSize:16,fontWeight:700,color:'#000'}}>Start {r.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rest Timer Banner ────────────────────────────────────────
function RestTimerBanner({accent,duration,onDismiss}){
  const [remaining,setRemaining]=React.useState(duration);
  const rgb=h2r(accent);
  React.useEffect(()=>{if(remaining<=0){onDismiss();return;}const t=setTimeout(()=>setRemaining(r=>r-1),1000);return()=>clearTimeout(t);},[remaining]);
  React.useEffect(()=>{if(remaining===0){try{const ctx=new(window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.connect(g);g.connect(ctx.destination);o.frequency.value=880;g.gain.setValueAtTime(0.3,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);o.start();o.stop(ctx.currentTime+0.4);}catch(e){}}},[remaining]);
  const pct=(duration-remaining)/duration;
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return(
    <div style={{position:'absolute',top:58,left:12,right:12,zIndex:350}}>
      <div style={{background:'rgba(18,18,18,0.97)',border:`1px solid rgba(${rgb},0.25)`,borderRadius:16,padding:'10px 14px',display:'flex',alignItems:'center',gap:12,backdropFilter:'blur(20px)',boxShadow:`0 8px 32px rgba(0,0,0,0.5)`}}>
        <div style={{position:'relative',width:38,height:38,flexShrink:0}}>
          <svg width="38" height="38" viewBox="0 0 38 38" style={{transform:'rotate(-90deg)'}}>
            <circle cx="19" cy="19" r="16" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3"/>
            <circle cx="19" cy="19" r="16" fill="none" stroke={accent} strokeWidth="3" strokeDasharray={`${2*Math.PI*16}`} strokeDashoffset={`${2*Math.PI*16*(1-pct)}`} strokeLinecap="round" style={{transition:'stroke-dashoffset 1s linear'}}/>
          </svg>
          <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:accent}}>{remaining}</div>
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.4)',letterSpacing:0.8,textTransform:'uppercase',marginBottom:1}}>Rest Timer</div>
          <div style={{fontSize:20,fontWeight:200,color:'#fff',letterSpacing:-0.5,lineHeight:1}}>{fmt(remaining)}</div>
        </div>
        <div onClick={onDismiss} style={{padding:'6px 12px',borderRadius:10,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.09)',cursor:'pointer'}}>
          <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>Skip</span>
        </div>
      </div>
      <div style={{height:2,background:'rgba(255,255,255,0.04)',borderRadius:1,margin:'4px 4px 0'}}>
        <div style={{height:'100%',width:`${pct*100}%`,background:accent,borderRadius:1,transition:'width 1s linear'}}/>
      </div>
    </div>
  );
}

// ─── Progression Chart Sheet ──────────────────────────────────
function ProgressionSheet({exerciseName,accent,unit,onClose,progressionData}){
  const rgb=h2r(accent);
  const exInfo=ALL_EXERCISES.find(e=>e.name===exerciseName);
  const mc=MC[exInfo?.muscle]||accent;
  const [metric,setMetric]=React.useState('1rm');
  const [range,setRange]=React.useState('1y');
  const data=progressionData[exerciseName]||[];
  const filterByRange=arr=>{const now=new Date('2026-04-19');const cutoffs={'6m':180,'1y':365,'all':99999};return arr.filter(d=>(now-new Date(d.date))/86400000<=cutoffs[range]);};
  const filtered=filterByRange(data);
  const getValue=d=>metric==='1rm'?calc1RM(d.weight,d.reps):metric==='vol'?d.volume:d.weight;
  const values=filtered.map(getValue);
  const maxV=Math.max(...values,1);const minV=Math.min(...values,0);const rng=maxV-minV||1;
  const W=326,H=120,PAD=12,plotH=H-20;
  const pts=filtered.map((d,i)=>({x:PAD+(i/Math.max(filtered.length-1,1))*(W-PAD*2),y:plotH-((getValue(d)-minV)/rng)*(plotH-10)+5,d}));
  const pathD=pts.length<2?'':pts.map((p,i)=>{if(i===0)return`M ${p.x} ${p.y}`;const prev=pts[i-1];const cpx=(prev.x+p.x)/2;return`C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;}).join(' ');
  const areaD=pts.length<2?'':`${pathD} L ${pts[pts.length-1].x} ${plotH+5} L ${pts[0].x} ${plotH+5} Z`;
  const latest=filtered[filtered.length-1];const earliest=filtered[0];
  const latestVal=latest?getValue(latest):0;const earliestVal=earliest?getValue(earliest):0;
  const delta=latestVal-earliestVal;const deltaPct=earliestVal?Math.round((delta/earliestVal)*100):0;
  const metricColors={'1rm':accent,'vol':'#60a5fa','max':mc};
  const metricLabels={'1rm':'Est. 1RM','vol':'Volume','max':'Max Weight'};
  return(
    <div style={{position:'absolute',inset:0,zIndex:400,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)'}}/>
      <div style={{position:'relative',zIndex:1,background:'#131313',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none',maxHeight:'88%',display:'flex',flexDirection:'column',animation:'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
        <div style={{padding:'14px 22px 10px',display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}><div style={{width:8,height:8,borderRadius:4,background:mc,boxShadow:`0 0 8px ${mc}`}}/><div style={{fontSize:20,fontWeight:700,color:'#fff',letterSpacing:-0.5}}>{exerciseName}</div></div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>Progression over time</div>
          </div>
          <div onClick={onClose} style={{cursor:'pointer',opacity:0.35,padding:'4px'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
        </div>
        <div style={{overflowY:'auto',flex:1,padding:'0 22px 36px'}}>
          {latest&&(
            <div style={{display:'flex',gap:10,marginBottom:20}}>
              <div style={{flex:1,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'12px 14px'}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Current</div>
                <div style={{fontSize:22,fontWeight:700,color:'#fff'}}>{latestVal} <span style={{fontSize:12,color:'rgba(255,255,255,0.3)',fontWeight:400}}>{unit}</span></div>
              </div>
              <div style={{flex:1,background:delta>=0?`rgba(${rgb},0.07)`:'rgba(244,63,94,0.07)',border:delta>=0?`1px solid rgba(${rgb},0.15)`:'1px solid rgba(244,63,94,0.15)',borderRadius:16,padding:'12px 14px'}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Change</div>
                <div style={{fontSize:22,fontWeight:700,color:delta>=0?accent:'#f43f5e'}}>{delta>=0?'+':''}{deltaPct}%</div>
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:7,marginBottom:16}}>
            {Object.entries(metricLabels).map(([k,label])=>{const sel=metric===k;const c=metricColors[k];const cr=h2r(c);return(
              <div key={k} onClick={()=>setMetric(k)} style={{padding:'6px 14px',borderRadius:20,cursor:'pointer',background:sel?`rgba(${cr},0.18)`:'rgba(255,255,255,0.05)',border:sel?`1px solid rgba(${cr},0.35)`:'1px solid rgba(255,255,255,0.08)',fontSize:12,fontWeight:700,color:sel?c:'rgba(255,255,255,0.35)',transition:'all 0.15s',flexShrink:0}}>{label}</div>
            );})}
          </div>
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,padding:'16px 14px 10px',marginBottom:16}}>
            {filtered.length<2?(
              <div style={{height:120,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:28,marginBottom:8}}>📈</div><div style={{fontSize:13,color:'rgba(255,255,255,0.25)'}}>Log more sessions to see your chart</div></div></div>
            ):(
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={metricColors[metric]} stopOpacity="0.3"/><stop offset="100%" stopColor={metricColors[metric]} stopOpacity="0"/></linearGradient></defs>
                {[0.25,0.5,0.75,1].map((f,i)=><line key={i} x1={PAD} y1={plotH*f+5} x2={W-PAD} y2={plotH*f+5} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
                <path d={areaD} fill="url(#cg)"/>
                <path d={pathD} fill="none" stroke={metricColors[metric]} strokeWidth="2" strokeLinecap="round"/>
                {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?4:2.5} fill={i===pts.length-1?metricColors[metric]:'rgba(255,255,255,0.4)'} stroke={i===pts.length-1?`rgba(${h2r(metricColors[metric])},0.3)`:'none'} strokeWidth="6"/>)}
                {[pts[0],pts[pts.length-1]].map((p,i)=><text key={i} x={p.x} y={H-2} textAnchor={i===0?'start':'end'} fill="rgba(255,255,255,0.22)" fontSize="9" fontFamily="Outfit,sans-serif">{new Date(p.d.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</text>)}
              </svg>
            )}
          </div>
          <div style={{display:'flex',gap:7,marginBottom:20}}>
            {[['6m','6 Months'],['1y','1 Year'],['all','All Time']].map(([k,label])=>{const sel=range===k;return(
              <div key={k} onClick={()=>setRange(k)} style={{padding:'6px 16px',borderRadius:20,cursor:'pointer',background:sel?`rgba(${rgb},0.15)`:'rgba(255,255,255,0.05)',border:sel?`1px solid rgba(${rgb},0.3)`:'1px solid rgba(255,255,255,0.08)',fontSize:12,fontWeight:700,color:sel?accent:'rgba(255,255,255,0.35)',transition:'all 0.15s',flexShrink:0}}>{label}</div>
            );})}
          </div>
          {filtered.length>0&&(
            <div><Lbl>Session Log</Lbl>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {[...filtered].reverse().slice(0,8).map((d,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14}}>
                    <div><div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.7)'}}>{new Date(d.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</div><div style={{fontSize:11,color:'rgba(255,255,255,0.28)',marginTop:2}}>{d.weight} {unit} × {d.reps} reps</div></div>
                    <div style={{textAlign:'right'}}><div style={{fontSize:15,fontWeight:700,color:mc}}>{calc1RM(d.weight,d.reps)}</div><div style={{fontSize:10,color:'rgba(255,255,255,0.22)',marginTop:1}}>est. 1RM</div></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bodyweight Chart Sheet ───────────────────────────────────
function BodyweightSheet({accent,unit,onClose,bwLog,onAdd}){
  const rgb=h2r(accent);
  const [inputVal,setInputVal]=React.useState('');
  const [adding,setAdding]=React.useState(false);
  const [range,setRange]=React.useState('all');
  const sorted=[...bwLog].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const filterByRange=arr=>{const now=new Date('2026-04-19');const cutoffs={'6m':180,'1y':365,'all':99999};return arr.filter(d=>(now-new Date(d.date))/86400000<=cutoffs[range]);};
  const filtered=filterByRange(sorted);
  const weights=filtered.map(d=>d.weight);
  const maxW=Math.max(...weights,1);const minW=Math.min(...weights,0);const rng=maxW-minW||1;
  const W=326,H=110,PAD=12,plotH=H-20;
  const pts=filtered.map((d,i)=>({x:PAD+(i/Math.max(filtered.length-1,1))*(W-PAD*2),y:plotH-((d.weight-minW)/rng)*(plotH-10)+5,d}));
  const pathD=pts.length<2?'':pts.map((p,i)=>{if(i===0)return`M ${p.x} ${p.y}`;const prev=pts[i-1];const cpx=(prev.x+p.x)/2;return`C ${cpx} ${prev.y} ${cpx} ${p.y} ${p.x} ${p.y}`;}).join(' ');
  const areaD=pts.length<2?'':`${pathD} L ${pts[pts.length-1].x} ${plotH+5} L ${pts[0].x} ${plotH+5} Z`;
  const latest=sorted[sorted.length-1];const first=sorted[0];
  const delta=latest&&first?latest.weight-first.weight:0;
  return(
    <div style={{position:'absolute',inset:0,zIndex:400,display:'flex',flexDirection:'column',justifyContent:'flex-end'}}>
      <div onClick={onClose} style={{position:'absolute',inset:0,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(8px)'}}/>
      <div style={{position:'relative',zIndex:1,background:'#131313',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none',maxHeight:'85%',display:'flex',flexDirection:'column',animation:'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
        <div style={{padding:'14px 22px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div><div style={{fontSize:20,fontWeight:700,color:'#fff',letterSpacing:-0.5,marginBottom:2}}>Body Weight</div><div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>Track your weight over time</div></div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div onClick={()=>setAdding(a=>!a)} style={{height:32,padding:'0 14px',borderRadius:10,background:`rgba(${rgb},0.15)`,border:`1px solid rgba(${rgb},0.25)`,display:'flex',alignItems:'center',cursor:'pointer'}}><span style={{fontSize:13,fontWeight:700,color:accent}}>+ Log</span></div>
            <div onClick={onClose} style={{cursor:'pointer',opacity:0.35,padding:'4px'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          </div>
        </div>
        <div style={{overflowY:'auto',flex:1,padding:'0 22px 36px'}}>
          {adding&&(
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <input autoFocus value={inputVal} onChange={e=>setInputVal(e.target.value)} placeholder={`Weight in ${unit}`} type="number" style={{flex:1,background:'rgba(255,255,255,0.06)',border:`1px solid rgba(${rgb},0.3)`,borderRadius:12,padding:'12px 14px',fontSize:16,fontWeight:600,color:'#fff',outline:'none',fontFamily:'Outfit,sans-serif'}}/>
              <div onClick={()=>{const v=parseFloat(inputVal);if(v>0){onAdd(v);setInputVal('');setAdding(false);}}} style={{height:46,padding:'0 18px',borderRadius:12,background:inputVal?`rgba(${rgb},0.9)`:'rgba(255,255,255,0.05)',display:'flex',alignItems:'center',cursor:'pointer',transition:'all 0.15s'}}>
                <span style={{fontSize:14,fontWeight:700,color:inputVal?'#000':'rgba(255,255,255,0.2)'}}>Save</span>
              </div>
            </div>
          )}
          {latest&&(
            <div style={{display:'flex',gap:10,marginBottom:16}}>
              <div style={{flex:1,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,padding:'12px 14px'}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>Current</div>
                <div style={{fontSize:22,fontWeight:700,color:'#fff'}}>{latest.weight} <span style={{fontSize:13,fontWeight:400,color:'rgba(255,255,255,0.3)'}}>{unit}</span></div>
              </div>
              <div style={{flex:1,background:delta<=0?`rgba(${rgb},0.07)`:'rgba(244,63,94,0.07)',border:delta<=0?`1px solid rgba(${rgb},0.15)`:'1px solid rgba(244,63,94,0.15)',borderRadius:16,padding:'12px 14px'}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.25)',letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>All Time</div>
                <div style={{fontSize:22,fontWeight:700,color:delta<=0?accent:'#f43f5e'}}>{delta>0?'+':''}{delta} <span style={{fontSize:13,fontWeight:400,color:'rgba(255,255,255,0.3)'}}>{unit}</span></div>
              </div>
            </div>
          )}
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,padding:'16px 14px 10px',marginBottom:16}}>
            {filtered.length<2?(
              <div style={{height:110,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{fontSize:24,marginBottom:8}}>⚖️</div><div style={{fontSize:13,color:'rgba(255,255,255,0.25)'}}>Log 2+ entries to see your chart</div></div></div>
            ):(
              <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{overflow:'visible'}}>
                <defs><linearGradient id="bwg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity="0.25"/><stop offset="100%" stopColor={accent} stopOpacity="0"/></linearGradient></defs>
                {[0.33,0.66,1].map((f,i)=><line key={i} x1={PAD} y1={plotH*f+5} x2={W-PAD} y2={plotH*f+5} stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>)}
                <path d={areaD} fill="url(#bwg)"/>
                <path d={pathD} fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
                {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={i===pts.length-1?4:2.5} fill={i===pts.length-1?accent:'rgba(255,255,255,0.4)'} stroke={i===pts.length-1?`rgba(${rgb},0.3)`:'none'} strokeWidth="6"/>)}
                {[pts[0],pts[pts.length-1]].map((p,i)=><text key={i} x={p.x} y={H-2} textAnchor={i===0?'start':'end'} fill="rgba(255,255,255,0.22)" fontSize="9" fontFamily="Outfit,sans-serif">{new Date(p.d.date).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</text>)}
              </svg>
            )}
          </div>
          <div style={{display:'flex',gap:7,marginBottom:20}}>
            {[['6m','6 Months'],['1y','1 Year'],['all','All Time']].map(([k,label])=>{const sel=range===k;return(
              <div key={k} onClick={()=>setRange(k)} style={{padding:'6px 16px',borderRadius:20,cursor:'pointer',background:sel?`rgba(${rgb},0.15)`:'rgba(255,255,255,0.05)',border:sel?`1px solid rgba(${rgb},0.3)`:'1px solid rgba(255,255,255,0.08)',fontSize:12,fontWeight:700,color:sel?accent:'rgba(255,255,255,0.35)',transition:'all 0.15s',flexShrink:0}}>{label}</div>
            );})}
          </div>
          {sorted.length>0&&(
            <div><Lbl>Log</Lbl>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {[...sorted].reverse().slice(0,10).map((d,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:14}}>
                    <div style={{fontSize:13,fontWeight:500,color:'rgba(255,255,255,0.5)'}}>{new Date(d.date).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</div>
                    <div style={{fontSize:16,fontWeight:700,color:'#fff'}}>{d.weight} <span style={{fontSize:12,fontWeight:400,color:'rgba(255,255,255,0.3)'}}>{unit}</span></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Workout Screen ───────────────────────────────────────────
function WorkoutScreen({routine,accent,onEnd,restTimerEnabled,restTimerDuration,progressionData,customExercises,historyData,onSaveCustomExercise,unit,userName}){
  const rgb=h2r(accent);
  const [elapsed,setElapsed]=React.useState(0);
  const [restTimer,setRestTimer]=React.useState(null);
  const [showAddEx,setShowAddEx]=React.useState(false);
  const [collapsed,setCollapsed]=React.useState({});
  const [chartEx,setChartEx]=React.useState(null);
  const [discardConfirm,setDiscardConfirm]=React.useState(false);
  const [finishConfirm,setFinishConfirm]=React.useState(false);
  const [saveRoutinePrompt,setSaveRoutinePrompt]=React.useState(false);
  const [pendingSave,setPendingSave]=React.useState(null);
  const [showNotes,setShowNotes]=React.useState(false);
  const [workoutNotes,setWorkoutNotes]=React.useState('');
  const [showPlates,setShowPlates]=React.useState(false);
  const [showShareCard,setShowShareCard]=React.useState(false);
  const [localCustomExercises,setLocalCustomExercises]=React.useState(customExercises||[]);

  const originalExNames=React.useRef(routine.exercises.map(e=>e.name));

  // Build last-logged lookup: { exName -> { w, r } }
  const lastLogged=React.useMemo(()=>{
    const map={};
    [...historyData].reverse().forEach(session=>{
      (session.exercises||[]).forEach(ex=>{
        if(!map[ex.name]&&ex.sets&&ex.sets.length){
          const last=ex.sets[ex.sets.length-1];
          map[ex.name]={w:last.w,r:last.r};
        }
      });
    });
    return map;
  },[historyData]);

  const initSets=()=>routine.exercises.map(ex=>{
    const prev=lastLogged[ex.name];
    return Array.from({length:ex.sets},()=>({weight:prev?String(prev.w):'',reps:'',done:false}));
  });
  const [sets,setSets]=React.useState(initSets);
  const [exercises,setExercises]=React.useState(routine.exercises);

  const [finished,setFinished]=React.useState(false);
  const startTimeRef=React.useRef(Date.now());
  React.useEffect(()=>{
    if(finished)return;
    const tick=()=>setElapsed(Math.floor((Date.now()-startTimeRef.current)/1000));
    const t=setInterval(tick,1000);
    const onVisible=()=>{if(document.visibilityState==='visible')tick();};
    document.addEventListener('visibilitychange',onVisible);
    return()=>{clearInterval(t);document.removeEventListener('visibilitychange',onVisible);};
  },[finished]);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const totalSets=sets.reduce((a,ex)=>a+ex.length,0);
  const doneSets=sets.reduce((a,ex)=>a+ex.filter(s=>s.done).length,0);

  const updateSet=(ei,si,field,val)=>setSets(prev=>{const n=prev.map(ex=>ex.map(s=>({...s})));n[ei][si][field]=val;return n;});
  const toggleDone=(ei,si)=>{
    const s=sets[ei][si];
    const repsVal=parseInt(s.reps)||0;
    if(!s.done&&repsVal===0)return;
    setSets(prev=>{const n=prev.map(ex=>ex.map(s=>({...s})));n[ei][si].done=!n[ei][si].done;return n;});
    if(!s.done&&repsVal>0){
      haptic('medium');
      if(restTimerEnabled)setRestTimer(restTimerDuration);
    }
  };
  const addSet=(ei)=>{
    const prev=lastLogged[exercises[ei]?.name];
    setSets(p=>{const n=p.map(ex=>ex.map(s=>({...s})));n[ei]=[...n[ei],{weight:prev?String(prev.w):'',reps:'',done:false}];return n;});
  };
  const removeSet=(ei,si)=>setSets(p=>{const n=p.map(ex=>ex.map(s=>({...s})));n[ei]=n[ei].filter((_,i)=>i!==si);return n;});
  const removeEx=(ei)=>{setExercises(p=>p.filter((_,i)=>i!==ei));setSets(p=>p.filter((_,i)=>i!==ei));};
  const toggleCollapse=(ei)=>setCollapsed(c=>({...c,[ei]:!c[ei]}));
  const muscleFor=exName=>{const f=[...ALL_EXERCISES,...localCustomExercises].find(e=>e.name===exName);return f?f.muscle:(routine.muscles[0]||'Full Body');};

  const addExercise=ex=>{
    const prev=lastLogged[ex.name];
    setExercises(p=>[...p,{name:ex.name,sets:3,reps:'8-10',last:prev?`${prev.w} lbs`:'—'}]);
    setSets(p=>[...p,Array.from({length:3},()=>({weight:prev?String(prev.w):'',reps:'',done:false}))]);
    setShowAddEx(false);
  };

  const buildCompletedWorkout=()=>{
    const completedExercises=exercises.map((ex,ei)=>{
      const doneSetsForEx=(sets[ei]||[]).filter(s=>s.done);
      const bestWeight=Math.max(...doneSetsForEx.map(s=>parseFloat(s.weight)||0),0);
      const bestReps=doneSetsForEx.find(s=>parseFloat(s.weight)===bestWeight)?.reps||0;
      const totalVolume=doneSetsForEx.reduce((a,s)=>(a+(parseFloat(s.weight)||0)*(parseInt(s.reps)||0)),0);
      const loggedSets=doneSetsForEx.map(s=>({w:parseFloat(s.weight)||0,r:parseInt(s.reps)||0}));
      return {name:ex.name,sets:loggedSets,bestWeight,bestReps:parseInt(bestReps)||0,totalVolume};
    });
    const totalVol=completedExercises.reduce((a,e)=>a+e.totalVolume,0);
    const totalDoneSets=completedExercises.reduce((a,e)=>a+e.sets.length,0);
    // For free/quick workouts, derive actual muscles from the exercises logged
    const derivedM=routine.id===null&&completedExercises.length>0
      ?[...new Set(completedExercises.map(e=>muscleFor(e.name)).filter(m=>m&&m!=='Full Body'))].slice(0,4)
      :null;
    return {
      routineName:routine.name,
      muscles:derivedM&&derivedM.length>0?derivedM:routine.muscles,
      duration:fmt(elapsed),
      volume:Math.round(totalVol),
      totalSets:totalDoneSets,
      exercises:completedExercises,
      notes:workoutNotes,
    };
  };

  // Persist in-progress workout to sessionStorage so tab switches don't kill it
  React.useEffect(()=>{
    if(!finished){
      try{
        sessionStorage.setItem('dialed_active_workout',JSON.stringify({
          routineId:routine.id,
          routineName:routine.name,
          exercises,
          sets,
          elapsed,
          workoutNotes,
        }));
      }catch(e){}
    } else {
      sessionStorage.removeItem('dialed_active_workout');
    }
  },[exercises,sets,elapsed,workoutNotes,finished]);

  const handleFinish=()=>{
    const curNames=exercises.map(e=>e.name);
    const orig=originalExNames.current;
    const changed=JSON.stringify(curNames)!==JSON.stringify(orig);
    const completed=buildCompletedWorkout();
    if(changed&&routine.id){
      setPendingSave({exercises,curNames,completed});
      setSaveRoutinePrompt(true);
    } else {
      onEnd({discard:false,completedWorkout:completed});
    }
  };

  return(
    <div style={{position:'absolute',inset:0,zIndex:300,background:'#0d0d0d',display:'flex',flexDirection:'column',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}}>
      {restTimer!==null&&<RestTimerBanner accent={accent} duration={restTimer} onDismiss={()=>setRestTimer(null)}/>}

      {/* Header */}
      <div style={{position:'sticky',top:0,zIndex:10,background:'rgba(13,13,13,0.96)',backdropFilter:'blur(16px)',borderBottom:'1px solid rgba(255,255,255,0.05)',padding:'54px 18px 14px',display:'flex',alignItems:'flex-end',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.28)',letterSpacing:0.8,marginBottom:2,textTransform:'uppercase'}}>{routine.name}</div>
          <div style={{fontSize:32,fontWeight:200,color:'#fff',letterSpacing:-1,lineHeight:1}}>{fmt(elapsed)}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          {/* Notes button */}
          <div onClick={()=>setShowNotes(true)} style={{width:36,height:36,borderRadius:12,background:workoutNotes?`rgba(${rgb},0.15)`:'rgba(255,255,255,0.06)',border:workoutNotes?`1px solid rgba(${rgb},0.3)`:'1px solid rgba(255,255,255,0.09)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 2h11v9H2zM2 11l3 3M5 5h5M5 8h3" stroke={workoutNotes?accent:'rgba(255,255,255,0.35)'} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Discard */}
          <div onClick={()=>setDiscardConfirm(true)} style={{height:36,padding:'0 12px',borderRadius:12,background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.2)',display:'flex',alignItems:'center',cursor:'pointer'}}>
            <span style={{fontSize:13,fontWeight:600,color:'#f43f5e'}}>Discard</span>
          </div>
          <div style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.3)'}}>{doneSets}/{totalSets}</div>
          <div onClick={()=>{haptic('heavy');setFinishConfirm(true);setFinished(true);}} style={{height:36,padding:'0 18px',borderRadius:12,background:`linear-gradient(135deg,${accent},${THEMES['Crimson']?.p||accent})`,display:'flex',alignItems:'center',cursor:'pointer',boxShadow:`0 4px 16px rgba(${rgb},0.35)`}}>
            <span style={{fontSize:14,fontWeight:700,color:'#000'}}>Finish</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{height:4,background:'rgba(255,255,255,0.08)',flexShrink:0}}>
        <div style={{height:'100%',width:`${totalSets===0?0:Math.round((doneSets/totalSets)*100)}%`,background:`linear-gradient(90deg,${accent},${THEMES['Crimson']?.p||accent})`,transition:'width 0.45s ease',boxShadow:`0 0 12px rgba(${rgb},0.7)`,minWidth:doneSets>0?6:0}}/>
      </div>

      {/* Exercise list */}
      <div style={{flex:1,overflowY:'auto',padding:'10px 12px 20px'}}>
        {exercises.length===0&&<div style={{textAlign:'center',padding:'40px 20px',color:'rgba(255,255,255,0.25)',fontSize:14}}>Tap "Add Exercise" below to get started</div>}
        {exercises.map((ex,ei)=>{
          const mc=MC[muscleFor(ex.name)]||accent;
          const isCollapsed=collapsed[ei];
          const prev=lastLogged[ex.name];
          return(
            <div key={`${ex.name}-${ei}`} style={{marginBottom:10,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:18,overflow:'hidden'}}>
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'13px 14px',borderBottom:isCollapsed?'none':'1px solid rgba(255,255,255,0.05)'}}>
                <div onClick={()=>setChartEx(ex.name)} style={{width:34,height:34,borderRadius:11,flexShrink:0,background:`${mc}18`,border:`1px solid ${mc}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:mc,cursor:'pointer'}}>{ex.name[0]}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:14.5,fontWeight:700,color:'#fff',letterSpacing:-0.3,marginBottom:4}}>{ex.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:6}}>
                    <span style={{fontSize:10.5,fontWeight:700,color:mc,background:`${mc}15`,border:`1px solid ${mc}28`,borderRadius:20,padding:'2px 8px'}}>{muscleFor(ex.name)}</span>
                    {prev&&<span style={{fontSize:10.5,color:'rgba(255,255,255,0.2)',fontWeight:400}}>Last: {prev.w} × {prev.r}</span>}
                  </div>
                </div>
                <div onClick={()=>toggleCollapse(ei)} style={{cursor:'pointer',padding:'4px 6px',opacity:0.35}}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d={isCollapsed?'M1 7l5-6 5 6':'M1 1l5 6 5-6'} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <div onClick={()=>removeEx(ei)} style={{cursor:'pointer',padding:'4px 5px',background:'rgba(255,68,68,0.1)',border:'1px solid rgba(255,68,68,0.18)',borderRadius:7,marginLeft:2}}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1 1l7 7M8 1L1 8" stroke="#FF4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
                </div>
              </div>
              {!isCollapsed&&(
                <div>
                  <div style={{display:'grid',gridTemplateColumns:'52px 1fr 1fr 36px',padding:'7px 14px',gap:8}}>
                    {['SET','WEIGHT','REPS',''].map((h,i)=><div key={i} style={{fontSize:9.5,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:1.1,textTransform:'uppercase'}}>{h}</div>)}
                  </div>
                  {sets[ei]&&sets[ei].map((s,si)=>{
                    const repsVal=parseInt(s.reps)||0;
                    const canCheck=repsVal>0;
                    return(
                      <div key={si} style={{display:'grid',gridTemplateColumns:'32px 1fr 1fr 36px',padding:'5px 14px',gap:8,alignItems:'center',opacity:s.done?0.45:1,transition:'opacity 0.2s'}}>
                        <div style={{display:'flex',alignItems:'center',gap:4}}>
                          <div onClick={()=>removeSet(ei,si)} style={{width:16,height:16,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,background:'rgba(255,68,68,0.1)',border:'1px solid rgba(255,68,68,0.18)',borderRadius:5}}>
                            <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1l4 4M5 1L1 5" stroke="#FF4444" strokeWidth="1.4" strokeLinecap="round"/></svg>
                          </div>
                          <div style={{fontSize:13,fontWeight:700,color:'rgba(255,255,255,0.28)',flex:1,textAlign:'center'}}>{si+1}</div>
                        </div>
                        {/* Weight field — placeholder shows last logged weight greyed out */}
                        <div style={{height:36,borderRadius:9,background:s.done?`rgba(${rgb},0.08)`:'rgba(255,255,255,0.05)',border:s.done?`1px solid rgba(${rgb},0.2)`:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',transition:'all 0.2s'}}>
                          <input
                            type="number" inputMode="decimal"
                            value={s.weight}
                            onChange={e=>updateSet(ei,si,'weight',e.target.value)}
                            placeholder={prev?String(prev.w):'0'}
                            onFocus={e=>{if(!s.weight&&prev){updateSet(ei,si,'weight',String(prev.w));}}}
                            style={{background:'none',border:'none',outline:'none',color:s.done?accent:'#fff',fontSize:14,fontWeight:600,textAlign:'center',width:'100%',padding:'0 8px'}}
                          />
                        </div>
                        {/* Reps field — placeholder shows last logged reps greyed out */}
                        <div style={{height:36,borderRadius:9,background:s.done?`rgba(${rgb},0.08)`:'rgba(255,255,255,0.05)',border:s.done?`1px solid rgba(${rgb},0.2)`:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',transition:'all 0.2s'}}>
                          <input
                            type="number" inputMode="numeric"
                            value={s.reps}
                            onChange={e=>updateSet(ei,si,'reps',e.target.value)}
                            placeholder={prev?String(prev.r):'0'}
                            style={{background:'none',border:'none',outline:'none',color:s.done?accent:'#fff',fontSize:14,fontWeight:600,textAlign:'center',width:'100%',padding:'0 8px'}}
                          />
                        </div>
                        {/* Checkmark — blocked if reps=0 */}
                        <div onClick={()=>toggleDone(ei,si)} style={{width:32,height:32,borderRadius:10,background:s.done?`rgba(${rgb},0.18)`:canCheck?'rgba(255,255,255,0.05)':'rgba(255,255,255,0.02)',border:s.done?`1px solid rgba(${rgb},0.3)`:canCheck?'1px solid rgba(255,255,255,0.07)':'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'center',cursor:canCheck?'pointer':'not-allowed',transition:'all 0.15s',opacity:canCheck?1:0.3}}>
                          <svg width="13" height="10" viewBox="0 0 13 10" fill="none"><path d="M1 5l4 4L12 1" stroke={s.done?accent:'rgba(255,255,255,0.2)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </div>
                      </div>
                    );
                  })}
                  <div onClick={()=>addSet(ei)} style={{margin:'6px 14px 12px',height:34,borderRadius:10,border:'1px dashed rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:6}}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round"/></svg>
                    <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.25)'}}>Add Set</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add exercise + Plate calculator buttons */}
      <div style={{padding:'4px 12px 28px',flexShrink:0,display:'flex',flexDirection:'column',gap:8}}>
        <div style={{display:'flex',gap:8}}>
          <div onClick={()=>setShowAddEx(true)} style={{flex:1,height:46,borderRadius:14,border:`1px dashed rgba(${rgb},0.25)`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:8}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke={`rgba(${rgb},0.5)`} strokeWidth="1.8" strokeLinecap="round"/></svg>
            <span style={{fontSize:13,fontWeight:600,color:`rgba(${rgb},0.55)`}}>Add Exercise</span>
          </div>
          <div onClick={()=>setShowPlates(true)} style={{height:46,padding:'0 16px',borderRadius:14,border:'1px solid rgba(255,255,255,0.09)',background:'rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:7,flexShrink:0}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.4"/><rect x="1" y="6.5" width="3" height="3" rx="1" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/><rect x="12" y="6.5" width="3" height="3" rx="1" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2"/><line x1="4" y1="8" x2="5.5" y2="8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4"/><line x1="10.5" y1="8" x2="12" y2="8" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4"/></svg>
            <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.4)',whiteSpace:'nowrap'}}>Plates</span>
          </div>
        </div>
      </div>

      {showAddEx&&<ExercisePicker accent={accent} onAdd={ex=>{addExercise(ex);}} onClose={()=>setShowAddEx(false)} customExercises={localCustomExercises} onNewCustomSaved={ex=>{const updated=[...localCustomExercises,ex];setLocalCustomExercises(updated);onSaveCustomExercise&&onSaveCustomExercise(ex);}}/>}
      {showPlates&&<PlateCalculator accent={accent} unit={unit||'lbs'} onClose={()=>setShowPlates(false)}/>}
      {showNotes&&<WorkoutNotesSheet accent={accent} notes={workoutNotes} onSave={t=>setWorkoutNotes(t)} onClose={()=>setShowNotes(false)}/>}
      {chartEx&&<ProgressionSheet exerciseName={chartEx} accent={accent} unit="lbs" onClose={()=>setChartEx(null)} progressionData={progressionData||{}}/>}
      {showShareCard&&<ShareWorkoutCard accent={accent} routine={routine} elapsed={elapsed} doneSets={doneSets} totalSets={totalSets} exercises={exercises} sets={sets} unit={unit||'lbs'} userName={userName} onClose={()=>{const completed=buildCompletedWorkout();setShowShareCard(false);onEnd({discard:false,completedWorkout:completed});}}/>}

      {/* Discard confirm — separate from finish flow */}
      {discardConfirm&&(
        <div style={{position:'absolute',inset:0,zIndex:400,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
          <div style={{width:'100%',background:'#161616',borderRadius:'28px 28px 0 0',padding:'28px 22px 48px',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:8,letterSpacing:-0.5}}>Discard workout?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:28,lineHeight:1.5}}>All {doneSets} sets will be lost. This can't be undone.</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div onClick={()=>onEnd({discard:true})} style={{height:52,borderRadius:16,background:'rgba(244,63,94,0.12)',border:'1px solid rgba(244,63,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16,fontWeight:700,color:'#f43f5e'}}>Yes, Discard</span>
              </div>
              <div onClick={()=>setDiscardConfirm(false)} style={{height:52,borderRadius:16,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>Keep Going</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Finish confirm */}
      {finishConfirm&&(
        <div style={{position:'absolute',inset:0,zIndex:400,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
          <div style={{width:'100%',background:'#161616',borderRadius:'28px 28px 0 0',padding:'28px 22px 48px',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:8,letterSpacing:-0.5}}>Finish workout?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:28,lineHeight:1.5}}>{doneSets} sets logged · {fmt(elapsed)} elapsed{workoutNotes&&' · Notes saved'}</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div onClick={()=>{setFinishConfirm(false);handleFinish();}} style={{height:54,borderRadius:16,background:`linear-gradient(135deg,${accent},${THEMES['Crimson']?.p||accent})`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 6px 24px rgba(${rgb},0.3)`}}>
                <span style={{fontSize:16,fontWeight:700,color:'#000'}}>Save & Finish</span>
              </div>
              <div onClick={()=>{setFinishConfirm(false);setFinished(true);setShowShareCard(true);}} style={{height:54,borderRadius:16,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',gap:8}}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1l3 3-3 3M1 7v1a5 5 0 005 5h1M13 4H6a5 5 0 00-5 5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span style={{fontSize:15,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>Save & Share</span>
              </div>
              <div onClick={()=>setFinishConfirm(false)} style={{height:46,borderRadius:16,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.3)'}}>Keep Going</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save updated routine prompt */}
      {saveRoutinePrompt&&(
        <div style={{position:'absolute',inset:0,zIndex:500,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
          <div style={{width:'100%',background:'#161616',borderRadius:'28px 28px 0 0',padding:'28px 22px 48px',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:8,letterSpacing:-0.5}}>Update routine?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:28,lineHeight:1.5}}>You changed the exercises in "{routine.name}". Save these changes to the routine?</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div onClick={()=>{setSaveRoutinePrompt(false);onEnd({discard:false,updatedRoutine:{...routine,exercises:pendingSave.exercises},completedWorkout:pendingSave.completed});}} style={{height:54,borderRadius:16,background:`linear-gradient(135deg,${accent},${THEMES['Emerald']?.g||accent})`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 6px 24px rgba(${rgb},0.3)`}}>
                <span style={{fontSize:16,fontWeight:700,color:'#000'}}>Update Routine</span>
              </div>
              <div onClick={()=>{setSaveRoutinePrompt(false);onEnd({discard:false,completedWorkout:pendingSave.completed});}} style={{height:54,borderRadius:16,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>Just This Once</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Plate Calculator ─────────────────────────────────────────
function PlateCalculator({accent,unit,onClose}){
  const rgb=h2r(accent);
  const [target,setTarget]=React.useState('');
  const [barWeight,setBarWeight]=React.useState(unit==='kg'?20:45);
  const BAR_OPTIONS_LBS=[{label:'Standard (45 lbs)',w:45},{label:'Short (35 lbs)',w:35},{label:'EZ Bar (25 lbs)',w:25},{label:'Custom',w:0}];
  const BAR_OPTIONS_KG=[{label:'Olympic (20 kg)',w:20},{label:'Short (15 kg)',w:15},{label:'EZ Bar (7.5 kg)',w:7.5},{label:'Custom',w:0}];
  const barOptions=unit==='kg'?BAR_OPTIONS_KG:BAR_OPTIONS_LBS;
  const [customBar,setCustomBar]=React.useState('');
  const [selectedBar,setSelectedBar]=React.useState(barOptions[0].label);
  const PLATES_LBS=[45,35,25,10,5,2.5];
  const PLATES_KG=[25,20,15,10,5,2.5,1.25];
  const plateSet=unit==='kg'?PLATES_KG:PLATES_LBS;
  const PLATE_COLORS={45:'#f472b6',35:'#60a5fa',25:'#34d399',10:'#facc15',5:'#fb923c',2.5:'#a78bfa',25.0:'#34d399',20:'#f472b6',15:'#60a5fa',1.25:'#94a3b8',7.5:'#fb923c'};

  const effectiveBar=selectedBar==='Custom'?(parseFloat(customBar)||0):barOptions.find(b=>b.label===selectedBar)?.w||45;
  const targetNum=parseFloat(target)||0;
  const perSide=(targetNum-effectiveBar)/2;

  // Calculate plates per side
  const calcPlates=(remaining,plates)=>{
    const result=[];
    let rem=remaining;
    for(const p of plates){
      const count=Math.floor(rem/p+0.001);
      if(count>0){result.push({plate:p,count});rem=Math.round((rem-p*count)*1000)/1000;}
    }
    return result;
  };
  const plates=perSide>0?calcPlates(perSide,plateSet):[];
  const achievable=effectiveBar+plates.reduce((a,{plate,count})=>a+plate*count*2,0);
  const isExact=targetNum>0&&Math.abs(achievable-targetNum)<0.01;

  // Visual bar — centered full bar: [plates] [collar] [bar shaft] [collar] [plates]
  const COLLAR_W=12; const BAR_SHAFT_W=60; const PLATE_GAP=2;
  // Build plate dimensions for one side
  const sidePlates=[];
  plates.forEach(({plate,count})=>{
    const pw=Math.max(16,plate*0.65); const ph=Math.min(76,24+plate*0.85);
    for(let i=0;i<count;i++) sidePlates.push({w:pw,h:ph,color:PLATE_COLORS[plate]||'#94a3b8',label:plate});
  });
  const oneSideW=sidePlates.reduce((a,p)=>a+p.w+PLATE_GAP,0);
  const totalSvgW=Math.max(oneSideW*2+COLLAR_W*2+BAR_SHAFT_W+40,200);
  const BAR_H=60;
  const cx=totalSvgW/2-16;
  // Right side plates (from collar outward right)
  let rx=cx+BAR_SHAFT_W/2+COLLAR_W;
  const rightPlates=sidePlates.map(p=>{const x=rx;rx+=p.w+PLATE_GAP;return {...p,x};});
  // Left side plates (mirror, from collar outward left)
  let lx=cx-BAR_SHAFT_W/2-COLLAR_W;
  const leftPlates=[...sidePlates].map(p=>{lx-=p.w+PLATE_GAP;return {...p,x:lx};});
  return(
    <div style={{position:'absolute',inset:0,zIndex:500,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
      <div style={{width:'100%',background:'#141414',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.08)',borderBottom:'none',maxHeight:'88%',display:'flex',flexDirection:'column',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
        <div style={{padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div>
            <div style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:-0.4}}>Plate Calculator</div>
            {targetNum>0&&<div style={{fontSize:12,color:'rgba(255,255,255,0.3)',marginTop:2}}>Target: {targetNum} {unit}</div>}
          </div>
          <div onClick={onClose} style={{cursor:'pointer',opacity:0.35,padding:'6px'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
        </div>
        <div style={{overflowY:'auto',flex:1,padding:'16px 20px 36px'}}>
          {/* Target weight input */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>Target Weight ({unit})</div>
            <input autoFocus type="number" inputMode="decimal" value={target} onChange={e=>setTarget(e.target.value)} placeholder={`e.g. ${unit==='kg'?'100':'225'}`} style={{width:'100%',background:'rgba(255,255,255,0.06)',border:`1px solid rgba(${rgb},0.25)`,borderRadius:14,padding:'14px 18px',fontSize:24,fontWeight:700,color:'#fff',outline:'none',fontFamily:'Outfit,sans-serif',letterSpacing:-0.5}}/>
          </div>

          {/* Bar selector */}
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>Bar</div>
            <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
              {barOptions.map(b=>{const sel=selectedBar===b.label;return(
                <div key={b.label} onClick={()=>setSelectedBar(b.label)} style={{padding:'6px 14px',borderRadius:20,cursor:'pointer',background:sel?`rgba(${rgb},0.18)`:'rgba(255,255,255,0.05)',border:sel?`1px solid rgba(${rgb},0.35)`:'1px solid rgba(255,255,255,0.08)',fontSize:12,fontWeight:600,color:sel?accent:'rgba(255,255,255,0.4)',transition:'all 0.15s',flexShrink:0}}>{b.label}</div>
              );})}
            </div>
            {selectedBar==='Custom'&&(
              <input type="number" inputMode="decimal" value={customBar} onChange={e=>setCustomBar(e.target.value)} placeholder={`Bar weight in ${unit}`} style={{width:'100%',marginTop:10,background:'rgba(255,255,255,0.06)',border:`1px solid rgba(${rgb},0.2)`,borderRadius:12,padding:'11px 14px',fontSize:15,fontWeight:600,color:'#fff',outline:'none',fontFamily:'Outfit,sans-serif'}}/>
            )}
          </div>

          {/* Visual bar diagram — centered full bar */}
          {targetNum>0&&(
            <div style={{marginBottom:20,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,padding:'20px 8px',overflowX:'auto'}}>
              <svg width="100%" viewBox={`0 0 ${totalSvgW} ${BAR_H+16}`} style={{display:'block',overflow:'visible',minWidth:totalSvgW>320?totalSvgW:undefined}}>
                {/* Bar shaft (center) */}
                <rect x={cx-BAR_SHAFT_W/2} y={BAR_H/2-3} width={BAR_SHAFT_W} height={6} rx={3} fill="#333"/>
                {/* Bar weight label */}
                <text x={cx} y={BAR_H+13} textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="9" fontFamily="Outfit,sans-serif" fontWeight="600">{effectiveBar}{unit} bar</text>
                {/* Left collar */}
                <rect x={cx-BAR_SHAFT_W/2-COLLAR_W} y={BAR_H/2-6} width={COLLAR_W} height={12} rx={3} fill="#666"/>
                {/* Right collar */}
                <rect x={cx+BAR_SHAFT_W/2} y={BAR_H/2-6} width={COLLAR_W} height={12} rx={3} fill="#666"/>
                {/* Left plates */}
                {leftPlates.map((p,i)=>{const py=(BAR_H-p.h)/2;return(
                  <g key={`l${i}`}>
                    <rect x={p.x} y={py} width={p.w} height={p.h} rx={3} fill={p.color} opacity="0.92"/>
                    {p.w>=18&&<text x={p.x+p.w/2} y={py+p.h/2+4} textAnchor="middle" fill="#000" fontSize="8" fontFamily="Outfit,sans-serif" fontWeight="800">{p.label}</text>}
                  </g>
                );})}
                {/* Right plates */}
                {rightPlates.map((p,i)=>{const py=(BAR_H-p.h)/2;return(
                  <g key={`r${i}`}>
                    <rect x={p.x} y={py} width={p.w} height={p.h} rx={3} fill={p.color} opacity="0.92"/>
                    {p.w>=18&&<text x={p.x+p.w/2} y={py+p.h/2+4} textAnchor="middle" fill="#000" fontSize="8" fontFamily="Outfit,sans-serif" fontWeight="800">{p.label}</text>}
                  </g>
                );})}
                {sidePlates.length===0&&(
                  <text x={cx} y={BAR_H+13} textAnchor="middle" fill="rgba(255,255,255,0.2)" fontSize="10" fontFamily="Outfit,sans-serif">Bar only</text>
                )}
              </svg>
            </div>
          )}

          {/* Plates per side list */}
          {targetNum>0&&(
            <div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase'}}>Each Side</div>
                {!isExact&&targetNum>0&&<div style={{fontSize:12,fontWeight:600,color:'#fb923c'}}>Closest: {achievable} {unit}</div>}
                {isExact&&<div style={{fontSize:12,fontWeight:700,color:accent}}>✓ Exact</div>}
              </div>
              {perSide<=0?(
                <div style={{fontSize:13,color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'20px 0'}}>Target must be greater than bar weight ({effectiveBar} {unit})</div>
              ):plates.length===0?(
                <div style={{fontSize:13,color:'rgba(255,255,255,0.3)',textAlign:'center',padding:'20px 0'}}>No plates needed</div>
              ):(
                <div style={{display:'flex',flexDirection:'column',gap:8}}>
                  {plates.map(({plate,count})=>{
                    const c=PLATE_COLORS[plate]||'#94a3b8';const cr=h2r(c);
                    return(
                      <div key={plate} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 16px',background:`rgba(${cr},0.07)`,border:`1px solid rgba(${cr},0.18)`,borderRadius:14}}>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <div style={{width:36,height:36,borderRadius:10,background:c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,color:'#000'}}>{plate}</div>
                          <span style={{fontSize:15,fontWeight:600,color:'#fff'}}>{plate} {unit} plate</span>
                        </div>
                        <div style={{fontSize:18,fontWeight:800,color:c}}>× {count}</div>
                      </div>
                    );
                  })}
                  <div style={{padding:'10px 16px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:14,display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
                    <span style={{fontSize:13,color:'rgba(255,255,255,0.35)',fontWeight:500}}>Per side total</span>
                    <span style={{fontSize:15,fontWeight:700,color:'rgba(255,255,255,0.7)'}}>{perSide} {unit}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Workout Notes Sheet ──────────────────────────────────────
function WorkoutNotesSheet({accent,notes,onSave,onClose}){
  const rgb=h2r(accent);
  const [text,setText]=React.useState(notes||'');
  return(
    <div style={{position:'absolute',inset:0,zIndex:500,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
      <div style={{width:'100%',background:'#141414',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.08)',borderBottom:'none',animation:'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
        <div style={{padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:-0.4}}>Workout Notes</div>
          <div style={{display:'flex',gap:8}}>
            <div onClick={()=>{onSave(text);onClose();}} style={{height:32,padding:'0 16px',borderRadius:10,background:`rgba(${rgb},0.18)`,border:`1px solid rgba(${rgb},0.3)`,display:'flex',alignItems:'center',cursor:'pointer'}}>
              <span style={{fontSize:13,fontWeight:700,color:accent}}>Save</span>
            </div>
            <div onClick={onClose} style={{cursor:'pointer',opacity:0.35,padding:'6px 2px'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          </div>
        </div>
        <div style={{padding:'16px 20px 48px'}}>
          <textarea
            autoFocus
            value={text}
            onChange={e=>setText(e.target.value)}
            placeholder="How did the session feel? Any notes on form, energy, sleep..."
            rows={6}
            style={{width:'100%',background:'rgba(255,255,255,0.05)',border:`1px solid rgba(${rgb},0.15)`,borderRadius:16,padding:'14px 16px',fontSize:15,fontWeight:400,outline:'none',fontFamily:'Outfit,sans-serif',resize:'none',lineHeight:1.6,color:'rgba(255,255,255,0.85)'}}
          />
          <div style={{fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:8,textAlign:'right'}}>{text.length} characters</div>
        </div>
      </div>
    </div>
  );
}

// ─── Share Workout Card ───────────────────────────────────────
function ShareWorkoutCard({accent,routine,elapsed,doneSets,totalSets,exercises,sets,unit,userName,onClose}){
  const rgb=h2r(accent);
  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const vol=exercises.reduce((total,ex,ei)=>{
    return total+(sets[ei]||[]).filter(s=>s.done).reduce((a,s)=>a+(parseFloat(s.weight)||0)*(parseInt(s.reps)||0),0);
  },0);
  const prs=exercises.filter((_,ei)=>(sets[ei]||[]).some(s=>s.done&&parseFloat(s.weight)>0));

  const topExercises=exercises.filter((_,ei)=>(sets[ei]||[]).some(s=>s.done)).slice(0,4);

  return(
    <div style={{position:'absolute',inset:0,zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.85)',backdropFilter:'blur(12px)',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:340,animation:'popIn 0.3s ease'}}>
        {/* The card */}
        <div style={{background:'linear-gradient(145deg,#111 0%,#0a0a0a 100%)',border:`1px solid rgba(${rgb},0.25)`,borderRadius:28,overflow:'hidden',boxShadow:`0 24px 64px rgba(0,0,0,0.8),0 0 0 1px rgba(${rgb},0.1)`}}>
          {/* Top glow */}
          <div style={{height:4,background:`linear-gradient(90deg,transparent,${accent},transparent)`}}/>
          <div style={{padding:'24px 22px 20px'}}>
            {/* Header */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontSize:11,fontWeight:700,color:`rgba(${rgb},0.7)`,letterSpacing:1.5,textTransform:'uppercase',marginBottom:4}}>Dialed</div>
                <div style={{fontSize:26,fontWeight:800,color:'#fff',letterSpacing:-0.8,lineHeight:1.1}}>{routine.name}</div>
                {userName&&<div style={{fontSize:13,color:'rgba(255,255,255,0.35)',marginTop:3}}>{userName}</div>}
              </div>
              <div style={{width:44,height:44,borderRadius:14,background:`rgba(${rgb},0.15)`,border:`1px solid rgba(${rgb},0.25)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🏋️</div>
            </div>

            {/* Stats row */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:20}}>
              {[{v:fmt(elapsed),l:'Duration'},{v:`${doneSets}`,l:'Sets'},{v:`${Math.round(vol/1000*10)/10}k`,l:unit}].map((s,i)=>{
                const colors=['#60a5fa','#34d399',accent];
                return(
                  <div key={s.l} style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:14,padding:'10px 8px',textAlign:'center'}}>
                    <div style={{fontSize:18,fontWeight:700,color:colors[i],letterSpacing:-0.5}}>{s.v}</div>
                    <div style={{fontSize:9.5,color:'rgba(255,255,255,0.3)',fontWeight:600,letterSpacing:0.8,textTransform:'uppercase',marginTop:2}}>{s.l}</div>
                  </div>
                );
              })}
            </div>

            {/* Exercises */}
            {topExercises.length>0&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:10}}>Exercises</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {topExercises.map((ex,i)=>{
                    const ei=exercises.indexOf(ex);
                    const doneSetsForEx=(sets[ei]||[]).filter(s=>s.done);
                    const bestWeight=Math.max(...doneSetsForEx.map(s=>parseFloat(s.weight)||0),0);
                    const mc=MC[ALL_EXERCISES.find(e=>e.name===ex.name)?.muscle]||accent;
                    return(
                      <div key={ex.name} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 10px',background:'rgba(255,255,255,0.03)',borderRadius:11}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{width:6,height:6,borderRadius:3,background:mc,flexShrink:0}}/>
                          <span style={{fontSize:13,fontWeight:600,color:'rgba(255,255,255,0.8)'}}>{ex.name}</span>
                        </div>
                        <span style={{fontSize:12,color:'rgba(255,255,255,0.35)',fontWeight:500}}>{doneSetsForEx.length} sets · {bestWeight}{unit}</span>
                      </div>
                    );
                  })}
                  {exercises.filter((_,ei)=>(sets[ei]||[]).some(s=>s.done)).length>4&&(
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.2)',textAlign:'center',padding:'4px 0'}}>+{exercises.filter((_,ei)=>(sets[ei]||[]).some(s=>s.done)).length-4} more exercises</div>
                  )}
                </div>
              </div>
            )}

            {/* Muscle pills */}
            <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
              {routine.muscles.map(m=>{const c=MC[m]||accent;const cr=h2r(c);return(
                <div key={m} style={{padding:'4px 10px',borderRadius:100,background:`rgba(${cr},0.12)`,border:`1px solid rgba(${cr},0.25)`,fontSize:11,fontWeight:700,color:c}}>{m}</div>
              );})}
            </div>
          </div>
          <div style={{height:2,background:`linear-gradient(90deg,transparent,rgba(${rgb},0.3),transparent)`,margin:'0 22px 16px'}}/>
          <div style={{padding:'0 22px 20px',display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:16,height:16,borderRadius:5,background:`rgba(${rgb},0.3)`,border:`1px solid rgba(${rgb},0.5)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,fontWeight:800,color:accent}}>D</div>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.2)',fontWeight:500,letterSpacing:0.3}}>dialed.app</span>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{display:'flex',gap:10,marginTop:16}}>
          <div onClick={onClose} style={{flex:1,height:48,borderRadius:16,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
            <span style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.5)'}}>Close</span>
          </div>
          <div onClick={()=>{
            if(navigator.share){navigator.share({title:`${routine.name} Workout`,text:`Just finished ${routine.name} — ${doneSets} sets, ${fmt(elapsed)} on Dialed 💪`}).catch(()=>{});} else {
              const txt=`Just finished ${routine.name} — ${doneSets} sets, ${fmt(elapsed)} 💪 #Dialed`;
              navigator.clipboard?.writeText(txt).then(()=>alert('Copied to clipboard!'));
            }
          }} style={{flex:1,height:48,borderRadius:16,background:`linear-gradient(135deg,${accent},${THEMES['Emerald']?.g||accent})`,display:'flex',alignItems:'center',justifyContent:'center',gap:8,cursor:'pointer',boxShadow:`0 6px 20px rgba(${rgb},0.35)`}}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 1l3 3-3 3M1 7v1a5 5 0 005 5h1M13 4H6a5 5 0 00-5 5" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span style={{fontSize:14,fontWeight:700,color:'#000'}}>Share</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Bottom Nav ───────────────────────────────────────────────
const NAV=[
  {id:'home',draw:c=><svg width="23" height="22" viewBox="0 0 23 22" fill="none"><path d="M2 11L11.5 3 21 11M4.5 9.5V19a1 1 0 001 1h4.5v-5h3v5h4.5a1 1 0 001-1V9.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>},
  {id:'history',draw:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="9" stroke={c} strokeWidth="1.8"/><path d="M11 6.5V11l3.5 3.5" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:'calendar',draw:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="2" y="4" width="18" height="16" rx="3" stroke={c} strokeWidth="1.8"/><path d="M2 9.5h18M7 2v4M15 2v4" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><rect x="6" y="13" width="2.5" height="2.5" rx="0.6" fill={c} opacity="0.5"/><rect x="10.5" y="13" width="2.5" height="2.5" rx="0.6" fill={c} opacity="0.5"/></svg>},
  {id:'awards',draw:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 3h10M8 3v5a3 3 0 006 0V3" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M5 3H3c0 3.5 2.2 5.5 5 6.2M17 3h2c0 3.5-2.2 5.5-5 6.2" stroke={c} strokeWidth="1.8" strokeLinecap="round"/><path d="M11 14v4M8 18h6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/></svg>},
  {id:'settings',draw:c=><svg width="22" height="22" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3" stroke={c} strokeWidth="1.8"/><path d="M9.1 2.3L8 5.1 5.4 4 3.4 6.6l2.1 2.3a6 6 0 000 4.2L3.4 15.4 5.4 18l2.6-1.1 1.1 2.8h3.8l1.1-2.8L16.6 18l2-2.6-2.1-2.3a6 6 0 000-4.2l2.1-2.3L16.6 4l-2.6 1.1L12.9 2.3z" stroke={c} strokeWidth="1.8" strokeLinejoin="round"/></svg>},
];
function BottomNav({tab,setTab,accent}){
  return(
    <div style={{position:'absolute',bottom:0,left:0,right:0,height:82,zIndex:40,background:'rgba(11,11,11,0.93)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(255,255,255,0.045)',display:'flex',alignItems:'center',paddingBottom:16}}>
      {NAV.map(n=>{const active=tab===n.id;const c=active?accent:'rgba(255,255,255,0.2)';return(
        <div key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:5,cursor:'pointer',paddingTop:2}}>
          {n.draw(c)}
          {active&&<div style={{width:5,height:5,borderRadius:3,background:accent}}/>}
        </div>
      );})}
    </div>
  );
}

// ─── Weekly Chart ─────────────────────────────────────────────
function WeeklyChart({accent,weekData}){
  const data=weekData||[];if(!data.length)return null;
  const maxV=Math.max(...data.map(d=>d.v),1);
  const BW=32,GAP=14,BH=54;const W=data.length*(BW+GAP)-GAP;
  return(
    <svg width={W} height={BH+24} style={{overflow:'visible',display:'block'}}>
      <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={accent} stopOpacity="1"/><stop offset="100%" stopColor={accent} stopOpacity="0.12"/></linearGradient></defs>
      {data.map((d,i)=>{const bh=d.v>0?Math.max(5,(d.v/maxV)*BH):3;const x=i*(BW+GAP);return(
        <g key={i}>
          <rect x={x} y={BH-bh} width={BW} height={bh} rx={5} fill={d.v>0?'url(#wg)':'rgba(255,255,255,0.04)'}/>
          {d.today&&d.v===0&&<rect x={x} y={BH-4} width={BW} height={4} rx={2} fill={`${accent}50`}/>}
          <text x={x+BW/2} y={BH+17} textAnchor="middle" fill={d.today?accent:'rgba(255,255,255,0.22)'} fontSize={10.5} fontWeight={d.today?700:400} fontFamily="Outfit,sans-serif">{d.d}</text>
        </g>
      );})}
    </svg>
  );
}

// ─── Bodyweight Card ──────────────────────────────────────────
function BodyweightCard({accent,unit,bwLog,onOpenChart}){
  const rgb=h2r(accent);
  const sorted=[...bwLog].sort((a,b)=>new Date(a.date)-new Date(b.date));
  const latest=sorted[sorted.length-1];const prev=sorted[sorted.length-2];
  const delta=latest&&prev?(latest.weight-prev.weight).toFixed(1):null;
  const last7=sorted.slice(-7);
  const W=110,H=36;
  const maxW2=Math.max(...last7.map(d=>d.weight),1);const minW2=Math.min(...last7.map(d=>d.weight),0);const rng2=maxW2-minW2||1;
  const spts=last7.map((d,i)=>({x:(i/Math.max(last7.length-1,1))*W,y:H-((d.weight-minW2)/rng2)*(H-4)-2}));
  const sparkPath=spts.length<2?'':spts.map((p,i)=>{if(i===0)return`M ${p.x} ${p.y}`;const p2=spts[i-1];const cpx=(p2.x+p.x)/2;return`C ${cpx} ${p2.y} ${cpx} ${p.y} ${p.x} ${p.y}`;}).join(' ');
  return(
    <div onClick={onOpenChart} style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,padding:'14px 16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
      <div style={{flex:1}}>
        <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:6}}>Body Weight</div>
        {latest?(
          <div style={{display:'flex',alignItems:'baseline',gap:6}}>
            <span style={{fontSize:28,fontWeight:700,color:'#fff',letterSpacing:-1,lineHeight:1}}>{latest.weight}</span>
            <span style={{fontSize:13,color:'rgba(255,255,255,0.3)',fontWeight:400}}>{unit}</span>
            {delta!==null&&<span style={{fontSize:12,fontWeight:700,color:parseFloat(delta)<=0?accent:'#f43f5e',background:parseFloat(delta)<=0?`rgba(${rgb},0.12)`:'rgba(244,63,94,0.1)',border:parseFloat(delta)<=0?`1px solid rgba(${rgb},0.2)`:'1px solid rgba(244,63,94,0.15)',borderRadius:20,padding:'2px 8px'}}>{parseFloat(delta)>0?'+':''}{delta}</span>}
          </div>
        ):<div style={{fontSize:14,color:'rgba(255,255,255,0.3)'}}>Tap to log your weight</div>}
        <div style={{fontSize:11,color:'rgba(255,255,255,0.2)',marginTop:4}}>Tap to see chart →</div>
      </div>
      {last7.length>=2&&(
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{flexShrink:0}}>
          <path d={sparkPath} fill="none" stroke={`rgba(${rgb},0.5)`} strokeWidth="1.8" strokeLinecap="round"/>
          {spts[spts.length-1]&&<circle cx={spts[spts.length-1].x} cy={spts[spts.length-1].y} r="3" fill={accent}/>}
        </svg>
      )}
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────
function HomeScreen({accent,unit,userName,historyData,muscleSets,weekChart,routines,onRoutineTap,onStartPlan,onQuickStart,onOpenBW,bwLog,onNewRoutine,todaySchedule}){
  const rgb=h2r(accent);
  const hr=new Date().getHours();
  const greet=hr<12?'Good morning':hr<17?'Good afternoon':'Good evening';
  const dateStr=new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
  const thisWeekVol=historyData.slice(0,4).reduce((a,s)=>a+(s.volume||0),0);
  const isEmpty=historyData.length===0;
  return(
    <div style={{height:'100%',overflowY:'auto',position:'relative',zIndex:10,paddingTop:58,paddingBottom:90}}>
      <div style={{padding:'0 22px'}}>
        <div style={{marginTop:10,marginBottom:22,display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
          <div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.25)',fontWeight:400,letterSpacing:0.2,marginBottom:2}}>{dateStr}</div>
            <div style={{fontSize:13.5,color:'rgba(255,255,255,0.38)',fontWeight:500}}>{greet}{userName?`, ${userName}`:''}</div>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'5px 11px',marginTop:2}}>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none"><path d="M6.5 1C6.5 1 9 4 8.5 6.5C11 5.5 12 3 12 3C12 3 12 9 8 11.5C9 10 9 8.5 7.5 8C7.5 10 5 12 3 13C3 13 0 11 0 8C0 5.5 2 4 3.5 4C2.5 5.5 3 7 4.5 7C4.5 4.5 6.5 1 6.5 1Z" fill={`${accent}cc`}/></svg>
            <span style={{fontSize:11.5,fontWeight:700,color:accent}}>{historyData.length>0?`${Math.min(historyData.length,5)} days`:'0 days'}</span>
          </div>
        </div>

        {isEmpty?(
          <div style={{background:`rgba(${rgb},0.06)`,border:`1px solid rgba(${rgb},0.14)`,borderRadius:24,padding:'28px 22px',marginBottom:26,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:14}}>🏋️</div>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',letterSpacing:-0.5,marginBottom:8}}>Ready to lift?</div>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.35)',lineHeight:1.6,marginBottom:20}}>Log your first workout and your stats, charts, and progress will start appearing here.</div>
            <div onClick={onQuickStart} style={{height:46,borderRadius:14,background:`linear-gradient(135deg,${accent},${THEMES['Emerald']?.g||accent})`,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',boxShadow:`0 6px 20px rgba(${rgb},0.35)`}}>
              <span style={{fontSize:15,fontWeight:700,color:'#000'}}>Start First Workout →</span>
            </div>
          </div>
        ):(
          <>
            <div style={{marginBottom:10}}>
              <div style={{lineHeight:1}}>
                <span style={{fontSize:72,fontWeight:700,letterSpacing:-4,background:`linear-gradient(140deg,#ffffff 10%,${accent}dd 90%)`,WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text'}}>{Math.floor(thisWeekVol/1000)}</span>
                <span style={{fontSize:72,fontWeight:200,letterSpacing:-4,color:'rgba(255,255,255,0.28)'}}>,{String(thisWeekVol%1000).padStart(3,'0')}</span>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:9,marginTop:9}}>
                <span style={{fontSize:13,color:'rgba(255,255,255,0.28)',fontWeight:400,whiteSpace:'nowrap'}}>{unit} this week</span>
                <span style={{fontSize:11.5,fontWeight:700,color:accent,background:`rgba(${rgb},0.13)`,border:`1px solid rgba(${rgb},0.22)`,borderRadius:20,padding:'2px 9px',whiteSpace:'nowrap',flexShrink:0}}>↑ 14%</span>
              </div>
            </div>
            <div style={{marginBottom:26}}><WeeklyChart accent={accent} weekData={weekChart}/></div>
          </>
        )}

        {/* Action tiles */}
        <div style={{display:'flex',gap:10,marginBottom:26}}>
          <div onClick={onStartPlan} style={{flex:'1 1 auto',padding:'18px 16px 20px',borderRadius:22,background:`linear-gradient(160deg,rgba(${rgb},0.24) 0%,rgba(${rgb},0.07) 100%)`,border:`1px solid rgba(${rgb},0.22)`,position:'relative',overflow:'hidden',cursor:routines.length>0?'pointer':'default',boxShadow:`0 -1px 0 rgba(${rgb},0.75) inset`}}>
            <div style={{position:'absolute',top:-36,left:'50%',transform:'translateX(-50%)',width:110,height:55,borderRadius:'50%',background:`rgba(${rgb},0.38)`,filter:'blur(30px)',pointerEvents:'none'}}/>
            <div style={{position:'relative',zIndex:1}}>
              <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:3,letterSpacing:-0.3}}>Today's Plan</div>
              <div style={{fontSize:11.5,color:'rgba(255,255,255,0.42)',marginBottom:15}}>
                {todaySchedule?`${todaySchedule.routineName}${todaySchedule.time?' · '+todaySchedule.time:''}`:routines.length>0?`${routines[0].name} · ${routines[0].exercises.length} exercises`:'No routines yet'}
              </div>
              {(todaySchedule||routines.length>0)&&<div style={{display:'inline-flex',alignItems:'center',background:`rgba(${rgb},0.2)`,border:`1px solid rgba(${rgb},0.32)`,borderRadius:20,padding:'5px 13px',fontSize:12,fontWeight:700,color:accent}}>Start →</div>}
            </div>
          </div>
          <div onClick={onQuickStart} style={{flex:'0 0 42%',padding:'16px 14px 18px',borderRadius:22,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.065)',cursor:'pointer',display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
            <div>
              <svg width="16" height="24" viewBox="0 0 16 24" style={{marginBottom:11}} fill="none"><path d="M10 1L1 14h7L6 23l10-13H9z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinejoin="round"/></svg>
              <div style={{fontSize:15,fontWeight:700,color:'rgba(255,255,255,0.82)',marginBottom:3,letterSpacing:-0.3}}>Quick Start</div>
              <div style={{fontSize:11.5,color:'rgba(255,255,255,0.28)'}}>No plan, just lift</div>
            </div>
            <div style={{marginTop:14}}>
              <div style={{display:'inline-flex',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:20,padding:'5px 11px',fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.45)'}}>Go →</div>
            </div>
          </div>
        </div>

        {/* Body weight */}
        <div style={{marginBottom:26}}><Lbl>Body Weight</Lbl><BodyweightCard accent={accent} unit={unit} bwLog={bwLog} onOpenChart={onOpenBW}/></div>

        {!isEmpty&&(
          <>
            <div style={{marginBottom:26}}>
              <Lbl>This Week</Lbl>
              <div style={{display:'flex',alignItems:'center'}}>
                {[{v:String(historyData.length),l:'Workouts'},{v:String(historyData.reduce((a,s)=>a+(s.exercises||[]).filter(e=>e.pr).length,0)),l:'PRs'},{v:`${Math.round(historyData.reduce((a,s)=>a+(s.volume||0),0)/1000)}k`,l:unit}].map((s,i)=>(
                  <React.Fragment key={s.l}>
                    {i>0&&<div style={{width:1,height:32,background:'rgba(255,255,255,0.07)',flexShrink:0}}/>}
                    <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
                      <div style={{fontSize:26,fontWeight:700,color:'#fff',letterSpacing:-0.8,lineHeight:1}}>{s.v}</div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.28)',fontWeight:500,letterSpacing:0.8,textTransform:'uppercase'}}>{s.l}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
            {muscleSets.length>0&&(
              <div style={{marginBottom:26}}>
                <Lbl>Muscle Focus</Lbl>
                <div style={{display:'flex',flexWrap:'wrap',gap:8}}>
                  {muscleSets.map(m=>{const c=MC[m.n];const maxS=Math.max(...muscleSets.map(x=>x.s));const scale=0.48+(m.s/maxS)*0.52;const fs=Math.round(11.5+scale*3);const px=Math.round(11+scale*7);const py=Math.round(5+scale*3.5);return(
                    <div key={m.n} style={{padding:`${py}px ${px}px`,borderRadius:100,background:`linear-gradient(135deg,${c}1e,${c}0a)`,border:`1px solid ${c}35`,fontSize:fs,fontWeight:600,color:c,display:'flex',alignItems:'center',gap:5}}>
                      {m.n}<span style={{opacity:0.45,fontWeight:400,fontSize:fs-1.5}}>{m.s}</span>
                    </div>
                  );})}
                </div>
              </div>
            )}
          </>
        )}

        {/* Routines */}
        <div style={{marginBottom:12}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.3,textTransform:'uppercase'}}>My Routines</div>
            <div onClick={onNewRoutine} style={{display:'flex',alignItems:'center',gap:5,background:`rgba(${rgb},0.12)`,border:`1px solid rgba(${rgb},0.22)`,borderRadius:20,padding:'4px 12px',cursor:'pointer'}}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke={accent} strokeWidth="1.6" strokeLinecap="round"/></svg>
              <span style={{fontSize:11,fontWeight:700,color:accent}}>New</span>
            </div>
          </div>
          {routines.map((r,i)=>{
            const pc=MC[r.muscles[0]]||accent;
            return(
              <div key={r.id||r.name} onClick={()=>onRoutineTap(r)} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 0',borderBottom:i<routines.length-1?'1px solid rgba(255,255,255,0.045)':'none',cursor:'pointer'}}>
                <div style={{width:48,height:48,borderRadius:16,flexShrink:0,background:`linear-gradient(145deg,${pc}28,${pc}0a)`,border:`1px solid ${pc}22`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700,color:pc}}>{r.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:15.5,fontWeight:600,color:'#fff',letterSpacing:-0.3,marginBottom:5}}>{r.name}</div>
                  <div style={{display:'flex',alignItems:'center',gap:5,flexWrap:'wrap'}}>
                    {r.muscles.map((m,mi)=>(<React.Fragment key={m}>{mi>0&&<div style={{width:3,height:3,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/>}<span style={{fontSize:12,fontWeight:500,color:MC[m]||accent}}>{m}</span></React.Fragment>))}
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4,flexShrink:0}}>
                  <span style={{fontSize:11,color:'rgba(255,255,255,0.2)'}}>{r.exercises.length} exercises</span>
                  <span style={{fontSize:10.5,color:'rgba(255,255,255,0.16)'}}>{r.lastDone}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── History Screen ───────────────────────────────────────────
function HistoryScreen({accent,historyData,historyWeeks,progressionData,unit,onDeleteWorkout}){
  const rgb=h2r(accent);
  const [expanded,setExpanded]=React.useState({});
  const [chartEx,setChartEx]=React.useState(null);
  const [confirmDelete,setConfirmDelete]=React.useState(null);
  const toggle=id=>setExpanded(p=>({...p,[id]:!p[id]}));
  if(!historyData.length) return(
    <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:'58px 32px 90px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>🕐</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',letterSpacing:-0.5,marginBottom:8}}>No workouts yet</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.3)',lineHeight:1.6}}>Your completed workouts will appear here.</div>
      </div>
    </div>
  );
  // If grouping failed (e.g. all sessions fell into no bucket), fall back to showing all as "Recent"
  const displayWeeks = historyWeeks.length > 0 ? historyWeeks : [{label:'Recent',ids:historyData.map(s=>s.id),vol:historyData.reduce((a,s)=>a+(s.volume||0),0),workouts:historyData.length}];
  return(
    <div style={{height:'100%',overflowY:'auto',paddingBottom:90,paddingTop:58,position:'relative'}}>
      <div style={{padding:'10px 20px 20px'}}>
        <div style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:-0.5,marginBottom:20}}>History</div>
        {displayWeeks.map(week=>(
          <div key={week.label} style={{marginBottom:28}}>
            <div style={{display:'flex',alignItems:'baseline',justifyContent:'space-between',marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.2)',letterSpacing:1.3,textTransform:'uppercase'}}>{week.label}</div>
              <div style={{display:'flex',gap:14}}><span style={{fontSize:12,color:'rgba(255,255,255,0.28)'}}>{week.workouts} sessions</span><span style={{fontSize:12,color:accent,fontWeight:700}}>{(week.vol/1000).toFixed(1)}k lbs</span></div>
            </div>
            {week.ids.map(id=>{
              const s=historyData.find(h=>h.id===id);if(!s)return null;
              const isOpen=expanded[id];const hasPR=s.exercises.some(e=>e.pr);const pc=MC[s.muscles[0]]||accent;
              return(
                <div key={id} style={{marginBottom:8,background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,overflow:'hidden'}}>
                  <div style={{display:'flex',alignItems:'center',gap:12,padding:'14px 16px',cursor:'pointer'}} onClick={()=>toggle(id)}>
                    <div style={{width:40,height:40,borderRadius:13,flexShrink:0,background:`${pc}18`,border:`1px solid ${pc}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:pc}}>{s.routine[0]}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                        <span style={{fontSize:15,fontWeight:700,color:'#fff'}}>{s.routine}</span>
                        {hasPR&&<span style={{fontSize:9.5,fontWeight:800,color:accent,background:`rgba(${rgb},0.14)`,border:`1px solid rgba(${rgb},0.25)`,borderRadius:20,padding:'2px 7px',textTransform:'uppercase',letterSpacing:0.6}}>PR</span>}
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:4,flexWrap:'wrap'}}>
                        {s.muscles.map((m)=>{const mc=MC[m]||accent;const mcr=h2r(mc);return(<span key={m} style={{fontSize:10.5,fontWeight:700,color:mc,background:`rgba(${mcr},0.12)`,border:`1px solid rgba(${mcr},0.22)`,borderRadius:20,padding:'2px 8px'}}>{m}</span>);})}
                      </div>
                    </div>
                    <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3,flexShrink:0}}>
                      <span style={{fontSize:12,fontWeight:600,color:'rgba(255,255,255,0.5)'}}>{s.duration}</span>
                      <span style={{fontSize:11,color:'rgba(255,255,255,0.22)'}}>{s.sets} sets</span>
                    </div>
                    <div onClick={e=>{e.stopPropagation();haptic('light');setConfirmDelete(id);}} style={{width:30,height:30,borderRadius:9,background:'rgba(244,63,94,0.08)',border:'1px solid rgba(244,63,94,0.18)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',flexShrink:0,marginLeft:4}}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1l8 8M9 1L1 9" stroke="#f43f5e" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    </div>
                    <svg width="8" height="13" viewBox="0 0 8 13" style={{flexShrink:0,transition:'transform 0.2s',transform:isOpen?'rotate(90deg)':'rotate(0deg)'}}><path d="M1 1l6 5.5L1 12" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  {isOpen&&(
                    <div style={{borderTop:'1px solid rgba(255,255,255,0.05)',padding:'4px 0 12px'}}>
                      <div style={{display:'flex',gap:18,padding:'10px 16px 8px'}}>
                        {[{v:s.volume.toLocaleString(),l:'Total lbs'},{v:s.sets,l:'Sets'},{v:s.duration,l:'Time'}].map((x,i)=>(
                          <React.Fragment key={x.l}>
                            {i>0&&<div style={{width:1,background:'rgba(255,255,255,0.07)'}}/>}
                            <div><div style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:-0.5}}>{x.v}</div><div style={{fontSize:10,color:'rgba(255,255,255,0.25)',letterSpacing:0.8,textTransform:'uppercase'}}>{x.l}</div></div>
                          </React.Fragment>
                        ))}
                      </div>
                      <div style={{height:1,background:'rgba(255,255,255,0.04)',margin:'4px 16px 8px'}}/>
                      {s.exercises.map((ex,ei)=>{
                        const best=Math.max(...ex.sets.map(s=>s.w));
                        const mc2=MC[ALL_EXERCISES.find(e=>e.name===ex.name)?.muscle]||accent;
                        return(
                          <div key={ex.name} style={{padding:'9px 16px',borderBottom:ei<s.exercises.length-1?'1px solid rgba(255,255,255,0.04)':'none'}}>
                            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:5}}>
                              <div style={{display:'flex',alignItems:'center',gap:6}}>
                                <div onClick={()=>setChartEx(ex.name)} style={{width:28,height:28,borderRadius:9,background:`${mc2}18`,border:`1px solid ${mc2}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:mc2,cursor:'pointer',flexShrink:0}}>{ex.name[0]}</div>
                                <span style={{fontSize:13.5,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>{ex.name}</span>
                                {ex.pr&&<span style={{fontSize:9,fontWeight:800,color:accent,background:`rgba(${rgb},0.14)`,border:`1px solid rgba(${rgb},0.22)`,borderRadius:20,padding:'1px 6px'}}>PR</span>}
                              </div>
                              <span style={{fontSize:12,color:'rgba(255,255,255,0.28)'}}>{ex.sets.length} sets</span>
                            </div>
                            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
                              {ex.sets.map((set,si)=>(
                                <div key={si} style={{padding:'3px 9px',borderRadius:8,background:set.w===best&&ex.pr?`rgba(${rgb},0.12)`:'rgba(255,255,255,0.05)',border:set.w===best&&ex.pr?`1px solid rgba(${rgb},0.22)`:'1px solid rgba(255,255,255,0.06)',fontSize:11.5,fontWeight:600,color:set.w===best&&ex.pr?accent:'rgba(255,255,255,0.45)'}}>{set.w} × {set.r}</div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
      {chartEx&&<ProgressionSheet exerciseName={chartEx} accent={accent} unit={unit} onClose={()=>setChartEx(null)} progressionData={progressionData}/>}
      {confirmDelete&&(
        <div style={{position:'absolute',inset:0,zIndex:500,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
          <div style={{width:'100%',background:'#161616',borderRadius:'28px 28px 0 0',padding:'28px 22px 48px',border:'1px solid rgba(255,255,255,0.07)',borderBottom:'none'}}>
            <div style={{fontSize:20,fontWeight:700,color:'#fff',marginBottom:8,letterSpacing:-0.5}}>Delete workout?</div>
            <div style={{fontSize:14,color:'rgba(255,255,255,0.35)',marginBottom:28,lineHeight:1.5}}>This can't be undone.</div>
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              <div onClick={()=>{haptic('medium');onDeleteWorkout&&onDeleteWorkout(confirmDelete);setConfirmDelete(null);}} style={{height:52,borderRadius:16,background:'rgba(244,63,94,0.15)',border:'1px solid rgba(244,63,94,0.3)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16,fontWeight:700,color:'#f43f5e'}}>Yes, Delete</span>
              </div>
              <div onClick={()=>setConfirmDelete(null)} style={{height:52,borderRadius:16,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                <span style={{fontSize:16,fontWeight:600,color:'rgba(255,255,255,0.4)'}}>Cancel</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Custom Time Picker ───────────────────────────────────────
function CustomTimePicker({value, onChange, accent}){
  const rgb = h2r(accent);
  // value is "HH:MM" 24h
  const parseVal = v => {
    const [h,m] = (v||'07:00').split(':').map(Number);
    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return { hour: hour12, minute: m, ampm: h < 12 ? 'AM' : 'PM' };
  };
  const {hour: initH, minute: initM, ampm: initA} = parseVal(value);
  const [hour, setHour] = React.useState(initH);
  const [minute, setMinute] = React.useState(initM);
  const [ampm, setAmpm] = React.useState(initA);

  const emit = (h, m, a) => {
    let h24 = h % 12;
    if(a === 'PM') h24 += 12;
    onChange(`${String(h24).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
  };

  const setH = v => { setHour(v); emit(v, minute, ampm); };
  const setM = v => { setMinute(v); emit(hour, v, ampm); };
  const setA = v => { setAmpm(v); emit(hour, minute, v); };

  const hours = [12,1,2,3,4,5,6,7,8,9,10,11];
  const minutes = [0,5,10,15,20,25,30,35,40,45,50,55];

  const Drum = ({items, selected, onSelect, fmt}) => {
    const ref = React.useRef();
    const itemH = 44;
    React.useEffect(() => {
      const idx = items.indexOf(selected);
      if(ref.current) ref.current.scrollTop = idx * itemH;
    }, []);
    return (
      <div style={{flex:1, position:'relative', height:180, overflow:'hidden'}}>
        {/* Frosted highlight band */}
        <div style={{position:'absolute',top:'50%',left:0,right:0,height:itemH,transform:'translateY(-50%)',background:`rgba(${rgb},0.1)`,border:`1px solid rgba(${rgb},0.2)`,borderRadius:12,pointerEvents:'none',zIndex:2}}/>
        {/* Fade top */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:60,background:'linear-gradient(to bottom, #131313, transparent)',zIndex:3,pointerEvents:'none'}}/>
        {/* Fade bottom */}
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:60,background:'linear-gradient(to top, #131313, transparent)',zIndex:3,pointerEvents:'none'}}/>
        <div ref={ref} onScroll={e=>{
          const idx = Math.round(e.target.scrollTop / itemH);
          if(items[idx] !== undefined) onSelect(items[idx]);
        }} style={{height:'100%',overflowY:'scroll',scrollSnapType:'y mandatory',scrollbarWidth:'none',WebkitScrollbarWidth:'none',msOverflowStyle:'none',paddingTop:(180/2 - itemH/2),paddingBottom:(180/2 - itemH/2)}}>
          <style>{`.drum-scroll::-webkit-scrollbar{display:none}`}</style>
          {items.map(v => {
            const sel = v === selected;
            return (
              <div key={v} onClick={()=>onSelect(v)} style={{height:itemH,display:'flex',alignItems:'center',justifyContent:'center',scrollSnapAlign:'center',cursor:'pointer'}}>
                <span style={{fontSize:sel?26:18,fontWeight:sel?700:400,color:sel?'#fff':`rgba(255,255,255,${sel?1:0.25})`,transition:'all 0.15s',fontFamily:'Outfit,sans-serif',letterSpacing:-0.5}}>{fmt?fmt(v):String(v).padStart(2,'0')}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{background:'rgba(255,255,255,0.04)',border:`1px solid rgba(${rgb},0.18)`,borderRadius:20,padding:'12px 8px',backdropFilter:'blur(20px)',WebkitBackdropFilter:'blur(20px)'}}>
      <div style={{display:'flex',gap:4,alignItems:'center'}}>
        <Drum items={hours} selected={hour} onSelect={setH} fmt={v=>String(v)}/>
        <div style={{fontSize:26,fontWeight:700,color:'rgba(255,255,255,0.3)',marginBottom:2,flexShrink:0}}>:</div>
        <Drum items={minutes} selected={minute} onSelect={setM} fmt={v=>String(v).padStart(2,'0')}/>
        <div style={{width:1,height:120,background:'rgba(255,255,255,0.07)',flexShrink:0,alignSelf:'center'}}/>
        <div style={{display:'flex',flexDirection:'column',gap:8,padding:'0 8px',flexShrink:0}}>
          {['AM','PM'].map(a=>{
            const sel=ampm===a;
            return (
              <div key={a} onClick={()=>setA(a)} style={{padding:'10px 14px',borderRadius:12,cursor:'pointer',background:sel?`rgba(${rgb},0.2)`:'rgba(255,255,255,0.04)',border:sel?`1px solid rgba(${rgb},0.35)`:'1px solid rgba(255,255,255,0.07)',transition:'all 0.15s'}}>
                <span style={{fontSize:14,fontWeight:700,color:sel?accent:'rgba(255,255,255,0.3)'}}>{a}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{textAlign:'center',marginTop:8,fontSize:13,color:'rgba(255,255,255,0.25)',fontWeight:500}}>
        {hour}:{String(minute).padStart(2,'0')} {ampm}
      </div>
    </div>
  );
}

// ─── Schedule Builder ─────────────────────────────────────────
function ScheduleBuilder({accent,routines,schedules=[],existing,onSave,onDelete,onClose}){
  const rgb=h2r(accent);
  const DAY_NAMES=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const allRoutinesForPlan=[...(routines||[]),{id:'rest',name:'Rest Day',muscles:['Full Body'],exercises:[],isRest:true}];
  const [tab,setTab]=React.useState('routine'); // 'routine' | 'time'
  const [selectedRoutine,setSelectedRoutine]=React.useState(existing?(existing.isRest?{id:'rest',name:'Rest Day',muscles:['Full Body'],exercises:[],isRest:true}:routines.find(r=>r.name===existing.routineName)||routines[0]):null);
  const [selectedDays,setSelectedDays]=React.useState(existing?.days||[]);
  const [time,setTime]=React.useState(existing?.time||'07:00');
  const [useTime,setUseTime]=React.useState(!!(existing?.time));
  const toggleDay=d=>setSelectedDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d].sort((a,b)=>a-b));
  const canSave=selectedRoutine&&selectedDays.length>0;
  const handleSave=()=>{
    if(!canSave)return;
    const sched={
      id:existing?.id||uid(),
      routineName:selectedRoutine.name,
      muscles:selectedRoutine.muscles,
      isRest:selectedRoutine.isRest||false,
      days:selectedDays,
      time:useTime?time:null,
    };
    onSave(sched);
  };
  return(
    <div style={{position:'absolute',inset:0,zIndex:600,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.8)',backdropFilter:'blur(10px)'}}>
      <div style={{width:'100%',background:'#131313',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.09)',borderBottom:'none',maxHeight:'88%',display:'flex',flexDirection:'column',animation:'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)'}}>
        <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
        {/* Header */}
        <div style={{padding:'14px 20px 0',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:20,fontWeight:700,color:'#fff',letterSpacing:-0.5}}>{existing?'Edit Schedule':'New Schedule'}</div>
          <div style={{display:'flex',gap:8}}>
            {existing&&onDelete&&(
              <div onClick={onDelete} style={{height:32,padding:'0 14px',borderRadius:10,background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.2)',display:'flex',alignItems:'center',cursor:'pointer'}}>
                <span style={{fontSize:13,fontWeight:700,color:'#f43f5e'}}>Delete</span>
              </div>
            )}
            <div onClick={onClose} style={{cursor:'pointer',opacity:0.35,padding:'6px'}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
          </div>
        </div>
        {/* Tabs */}
        <div style={{display:'flex',gap:6,padding:'14px 20px 0'}}>
          {[['routine','Routine & Days'],['time','Time']].map(([k,label])=>{const sel=tab===k;return(
            <div key={k} onClick={()=>setTab(k)} style={{padding:'7px 18px',borderRadius:20,cursor:'pointer',background:sel?`rgba(${rgb},0.18)`:'rgba(255,255,255,0.05)',border:sel?`1px solid rgba(${rgb},0.35)`:'1px solid rgba(255,255,255,0.08)',fontSize:13,fontWeight:700,color:sel?accent:'rgba(255,255,255,0.35)',transition:'all 0.15s'}}>{label}</div>
          );})}
        </div>
        <div style={{overflowY:'auto',flex:1,padding:'18px 20px 0'}}>
          {tab==='routine'&&(
            <>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:12}}>Choose Routine</div>
              <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:22}}>
                {allRoutinesForPlan.map(r=>{
                  const sel=selectedRoutine?.name===r.name;
                  const pc=r.isRest?'#94a3b8':(MC[r.muscles?.[0]]||accent);const pcr=h2r(pc);
                  return(
                    <div key={r.id||r.name} onClick={()=>setSelectedRoutine(r)} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',background:sel?`rgba(${pcr},0.1)`:'rgba(255,255,255,0.03)',border:sel?`1px solid rgba(${pcr},0.3)`:'1px solid rgba(255,255,255,0.06)',borderRadius:16,cursor:'pointer',transition:'all 0.15s'}}>
                      <div style={{width:38,height:38,borderRadius:12,background:r.isRest?'rgba(148,163,184,0.12)':`rgba(${pcr},0.15)`,border:`1px solid rgba(${pcr},0.25)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:r.isRest?18:13,fontWeight:700,color:pc,flexShrink:0}}>{r.isRest?'😴':r.name[0]}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:700,color:sel?'#fff':'rgba(255,255,255,0.8)',marginBottom:2}}>{r.name}</div>
                        {r.isRest?<div style={{fontSize:11,color:'rgba(255,255,255,0.3)'}}>Recovery day</div>:(
                          <div style={{display:'flex',gap:4}}>{(r.muscles||[]).slice(0,3).map((m,mi)=>(<React.Fragment key={m}>{mi>0&&<span style={{color:'rgba(255,255,255,0.2)',fontSize:10}}>·</span>}<span style={{fontSize:11,color:MC[m],fontWeight:500}}>{m}</span></React.Fragment>))}</div>
                        )}
                      </div>
                      {sel&&<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                  );
                })}
              </div>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:12}}>Repeat On</div>
              <div style={{display:'flex',gap:7,marginBottom:8}}>
                {DAY_NAMES.map((d,i)=>{const sel=selectedDays.includes(i);return(
                  <div key={i} onClick={()=>toggleDay(i)} style={{flex:1,height:46,borderRadius:13,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2,cursor:'pointer',background:sel?`rgba(${rgb},0.2)`:'rgba(255,255,255,0.04)',border:sel?`1px solid rgba(${rgb},0.4)`:'1px solid rgba(255,255,255,0.07)',transition:'all 0.15s'}}>
                    <span style={{fontSize:11,fontWeight:700,color:sel?accent:'rgba(255,255,255,0.35)'}}>{d[0]}</span>
                  </div>
                );})}
              </div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.2)',marginBottom:24,textAlign:'center'}}>{selectedDays.length===0?'Tap days to select':selectedDays.map(d=>DAY_NAMES[d]).join(', ')}</div>
            </>
          )}
          {tab==='time'&&(
            <>
              <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.22)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:12}}>Reminder Time</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:16,marginBottom:16}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.85)'}}>Set a time</div>
                  <div style={{fontSize:11.5,color:'rgba(255,255,255,0.3)',marginTop:2}}>Get a reminder before your session</div>
                </div>
                <div onClick={()=>setUseTime(v=>!v)} style={{width:44,height:26,borderRadius:13,flexShrink:0,background:useTime?`rgba(${rgb},0.9)`:'rgba(255,255,255,0.1)',border:useTime?`1px solid rgba(${rgb},1)`:'1px solid rgba(255,255,255,0.12)',position:'relative',cursor:'pointer',transition:'all 0.2s'}}>
                  <div style={{width:20,height:20,borderRadius:10,background:'#fff',position:'absolute',top:2,left:useTime?21:2,transition:'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/>
                </div>
              </div>
              {useTime&&(
                <CustomTimePicker value={time} onChange={setTime} accent={accent}/>
              )}
              {!useTime&&(
                <div style={{padding:'32px 20px',textAlign:'center'}}>
                  <div style={{fontSize:32,marginBottom:12}}>⏰</div>
                  <div style={{fontSize:14,color:'rgba(255,255,255,0.3)',lineHeight:1.6}}>Toggle on to add a reminder time for this recurring schedule.</div>
                </div>
              )}
            </>
          )}
        </div>
        {/* Save button */}
        <div style={{padding:'16px 20px 40px',flexShrink:0}}>
          <div onClick={handleSave} style={{height:54,borderRadius:18,background:canSave?`linear-gradient(135deg,${accent},${THEMES['Emerald']?.g||accent})`:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',cursor:canSave?'pointer':'default',transition:'all 0.2s',boxShadow:canSave?`0 8px 28px rgba(${rgb},0.35)`:'none'}}>
            <span style={{fontSize:16,fontWeight:700,color:canSave?'#000':'rgba(255,255,255,0.2)'}}>{existing?'Save Changes':'Create Schedule'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Screen ──────────────────────────────────────────
function CalendarScreen({accent,calWorkouts,routines,schedules=[],onSaveSchedule,onDeleteSchedule,currentStreak=0}){
  const rgb=h2r(accent);
  const today=new Date(2026,3,19);
  const _now=new Date();const [curYear,setCurYear]=React.useState(_now.getFullYear());const [curMonth,setCurMonth]=React.useState(_now.getMonth());
  const [selected,setSelected]=React.useState(null);const [planDay,setPlanDay]=React.useState(null);
  const [planned,setPlanned]=React.useState({});const [showSched,setShowSched]=React.useState(false);const [editingSchedule,setEditingSchedule]=React.useState(null);
  const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAYS=['S','M','T','W','T','F','S'];
  const firstDay=new Date(curYear,curMonth,1).getDay();const daysInMonth=new Date(curYear,curMonth+1,0).getDate();
  const cells=[];for(let i=0;i<firstDay;i++)cells.push(null);for(let d=1;d<=daysInMonth;d++)cells.push(d);while(cells.length%7!==0)cells.push(null);
  const keyFor=d=>d?`${curYear}-${String(curMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`:null;
  const isToday=d=>d===today.getDate()&&curMonth===today.getMonth()&&curYear===today.getFullYear();
  const isFuture=d=>{if(!d)return false;return new Date(curYear,curMonth,d)>today;};
  // Build schedule-generated planned days for current month view
  const schedulePlanned = React.useMemo(()=>{
    const map={};
    schedules.forEach(sched=>{
      // Generate occurrences for +-2 months around current view
      const start=new Date(curYear,curMonth-1,1);
      const end=new Date(curYear,curMonth+2,0);
      const d=new Date(start);
      while(d<=end){
        if(sched.days.includes(d.getDay())){
          const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
          map[key]={routine:sched.routineName,muscles:sched.muscles,volume:0,sets:0,planned:true,isRest:sched.isRest,scheduleId:sched.id,time:sched.time};
        }
        d.setDate(d.getDate()+1);
      }
    });
    return map;
  },[schedules,curYear,curMonth]);
  const allW={...schedulePlanned,...calWorkouts,...planned};
  const selW=selected&&allW[selected];
  const monthKeys=Object.keys(allW).filter(k=>k.startsWith(`${curYear}-${String(curMonth+1).padStart(2,'0')}`));
  // streak comes from real history via prop, not from planned/scheduled days
  const allRoutinesForPlan=[...(routines||[]),{id:'rest',name:'Rest Day',muscles:['Full Body'],exercises:[],isRest:true}];
  return(
    <div style={{height:'100%',display:'flex',flexDirection:'column',paddingTop:58,paddingBottom:82,position:'relative'}}>
      <div style={{padding:'10px 20px 10px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:-0.5}}>Calendar</div>
        <div style={{display:'flex',gap:8}}>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:20,padding:'5px 11px'}}>
            <svg width="11" height="13" viewBox="0 0 12 14" fill="none"><path d="M6.5 1C6.5 1 9 4 8.5 6.5C11 5.5 12 3 12 3C12 3 12 9 8 11.5C9 10 9 8.5 7.5 8C7.5 10 5 12 3 13C3 13 0 11 0 8C0 5.5 2 4 3.5 4C2.5 5.5 3 7 4.5 7C4.5 4.5 6.5 1 6.5 1Z" fill={`${accent}cc`}/></svg>
            <span style={{fontSize:11.5,fontWeight:700,color:accent}}>{currentStreak} days</span>
          </div>
          <div onClick={()=>setShowSched(true)} style={{width:36,height:36,borderRadius:12,cursor:'pointer',background:`rgba(${rgb},0.14)`,border:`1px solid rgba(${rgb},0.28)`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke={accent} strokeWidth="2" strokeLinecap="round"/></svg>
          </div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px 10px'}}>
        <div onClick={()=>{if(curMonth===0){setCurMonth(11);setCurYear(y=>y-1);}else setCurMonth(m=>m-1);}} style={{width:32,height:32,borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6l5 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
        <div style={{fontSize:15,fontWeight:700,color:'#fff'}}>{MONTHS[curMonth]} {curYear}</div>
        <div onClick={()=>{if(curMonth===11){setCurMonth(0);setCurYear(y=>y+1);}else setCurMonth(m=>m+1);}} style={{width:32,height:32,borderRadius:10,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}><svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',padding:'0 10px',marginBottom:4}}>
        {DAYS.map((d,i)=><div key={i} style={{textAlign:'center',fontSize:11,fontWeight:600,color:'rgba(255,255,255,0.2)',padding:'2px 0'}}>{d}</div>)}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'5px',padding:'0 10px'}}>
        {cells.map((d,i)=>{
          const key=keyFor(d);const w=key&&allW[key];const today_=isToday(d);const isSel=key&&key===selected;const future=isFuture(d);
          const isRest=w?.isRest;const pc=w?(isRest?'#94a3b8':(MC[w.muscles?.[0]]||accent)):null;
          return(
            <div key={i} onClick={()=>{if(!d)return;if(w&&!w.planned){setSelected(key);}else if(w?.planned&&!w.scheduleId){setPlanDay(key);setSelected(null);}else if(w?.scheduleId){setSelected(key);}else if(future||isToday(d)){setPlanDay(key);setSelected(null);}}} style={{height:52,borderRadius:13,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:4,cursor:d?'pointer':'default',background:isSel?`rgba(${rgb},0.18)`:today_?'rgba(255,255,255,0.07)':future&&!w?'rgba(255,255,255,0.02)':'transparent',border:isSel?`1px solid rgba(${rgb},0.35)`:today_?'1px solid rgba(255,255,255,0.1)':future?'1px dashed rgba(255,255,255,0.06)':'1px solid transparent',transition:'all 0.13s'}}>
              {d&&<>
                <span style={{fontSize:15,fontWeight:today_||isSel?700:w?500:400,color:isSel?accent:today_?'#fff':w?'rgba(255,255,255,0.85)':'rgba(255,255,255,0.22)',lineHeight:1}}>{d}</span>
                {w?<div style={{width:5,height:5,borderRadius:3,background:isSel?accent:pc,opacity:isSel?1:0.7}}/>:future?<div style={{width:5,height:5,borderRadius:3,background:'rgba(255,255,255,0.08)'}}/>:null}
              </>}
            </div>
          );
        })}
      </div>
      <div style={{display:'flex',margin:'12px 10px 0',background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:16,overflow:'hidden',flexShrink:0}}>
        {[{l:'Workouts',v:monthKeys.filter(k=>!allW[k]?.isRest).length},{l:'Volume',v:(Object.entries(allW).filter(([k])=>k.startsWith(`${curYear}-${String(curMonth+1).padStart(2,'0')}`)).reduce((a,[,w])=>a+(w.volume||0),0)/1000).toFixed(0)+'k'},{l:'PRs',v:Object.entries(allW).filter(([k,w])=>k.startsWith(`${curYear}-${String(curMonth+1).padStart(2,'0')}`)&&w.pr).length}].map((s,i)=>(
          <React.Fragment key={s.l}>
            {i>0&&<div style={{width:1,background:'rgba(255,255,255,0.05)'}}/>}
            <div style={{flex:1,padding:'10px 0',display:'flex',flexDirection:'column',alignItems:'center',gap:2}}>
              <span style={{fontSize:18,fontWeight:700,color:'#fff',letterSpacing:-0.5}}>{s.v}</span>
              <span style={{fontSize:9.5,color:'rgba(255,255,255,0.22)',letterSpacing:0.8,textTransform:'uppercase'}}>{s.l}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      {selW&&(
        <div style={{margin:'10px 10px 0',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:18,padding:'14px',flex:1,overflowY:'auto',flexShrink:0}}>
          <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:8}}>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:4}}>
                <span style={{fontSize:16,fontWeight:700,color:'#fff'}}>{selW.routine}</span>
                {selW.pr&&<span style={{fontSize:9,fontWeight:800,color:accent,background:`rgba(${rgb},0.14)`,border:`1px solid rgba(${rgb},0.25)`,borderRadius:20,padding:'2px 7px'}}>PR</span>}
                {selW.isRest&&<span style={{fontSize:9,fontWeight:700,color:'#94a3b8',background:'rgba(148,163,184,0.1)',borderRadius:20,padding:'2px 7px'}}>REST</span>}
                {selW.planned&&<span style={{fontSize:9,fontWeight:700,color:'rgba(255,255,255,0.4)',background:'rgba(255,255,255,0.06)',borderRadius:20,padding:'2px 7px'}}>SCHEDULED</span>}
              </div>
              <div style={{display:'flex',gap:5,flexWrap:'wrap',alignItems:'center'}}>
                {(selW.muscles||[]).map((m,mi)=>(<React.Fragment key={m}>{mi>0&&<div style={{width:3,height:3,borderRadius:2,background:'rgba(255,255,255,0.12)',marginTop:0}}/>}<span style={{fontSize:11.5,color:MC[m]||'#94a3b8',fontWeight:500}}>{m}</span></React.Fragment>))}
                {selW.time&&<span style={{fontSize:11,color:'rgba(255,255,255,0.3)',marginLeft:4}}>· {selW.time}</span>}
              </div>
            </div>
            <div style={{display:'flex',gap:6,flexShrink:0}}>
              {selW.scheduleId&&(
                <div onClick={()=>{const s=schedules.find(x=>x.id===selW.scheduleId);if(s)setEditingSchedule(s);}} style={{height:30,padding:'0 12px',borderRadius:10,background:`rgba(${rgb},0.12)`,border:`1px solid rgba(${rgb},0.25)`,display:'flex',alignItems:'center',cursor:'pointer'}}>
                  <span style={{fontSize:12,fontWeight:700,color:accent}}>Edit</span>
                </div>
              )}
              {selW.duration&&<div style={{fontSize:12,color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center'}}>{selW.duration}</div>}
            </div>
          </div>
          {selW.volume>0&&<div style={{height:3,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden',marginTop:8}}><div style={{height:'100%',width:`${Math.round((selW.volume/20000)*100)}%`,background:`linear-gradient(90deg,${accent},${THEMES['Crimson']?.p||accent})`,borderRadius:2}}/></div>}
        </div>
      )}
      {/* Plan workout sheet */}
      {planDay&&(
        <div style={{position:'absolute',inset:0,zIndex:600,display:'flex',alignItems:'flex-end',background:'rgba(0,0,0,0.75)',backdropFilter:'blur(8px)'}}>
          <div style={{width:'100%',background:'#151515',borderRadius:'28px 28px 0 0',border:'1px solid rgba(255,255,255,0.08)',borderBottom:'none',maxHeight:'80%',display:'flex',flexDirection:'column'}}>
            <div style={{display:'flex',justifyContent:'center',padding:'12px 0 0'}}><div style={{width:36,height:4,borderRadius:2,background:'rgba(255,255,255,0.12)'}}/></div>
            <div style={{padding:'14px 20px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <div style={{fontSize:18,fontWeight:700,color:'#fff'}}>{planned[planDay]?'Change Plan':'Plan Day'}</div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                {planned[planDay]&&<div onClick={()=>{setPlanned(p=>{const n={...p};delete n[planDay];return n;});setPlanDay(null);setSelected(null);}} style={{height:30,padding:'0 12px',borderRadius:10,background:'rgba(244,63,94,0.1)',border:'1px solid rgba(244,63,94,0.2)',display:'flex',alignItems:'center',cursor:'pointer'}}><span style={{fontSize:12,fontWeight:700,color:'#f43f5e'}}>Remove</span></div>}
                <div onClick={()=>setPlanDay(null)} style={{cursor:'pointer',opacity:0.35}}><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round"/></svg></div>
              </div>
            </div>
            <div style={{overflowY:'auto',padding:'12px 20px 32px'}}>
              {allRoutinesForPlan.map(r=>{
                const pc=r.isRest?'#94a3b8':(MC[r.muscles[0]]||accent);const pcr=h2r(pc);
                return(
                  <div key={r.id} onClick={()=>{setPlanned(p=>({...p,[planDay]:{routine:r.name,muscles:r.muscles,volume:0,sets:0,planned:true,isRest:r.isRest}}));setSelected(planDay);setPlanDay(null);}} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',marginBottom:8,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:16,cursor:'pointer'}}>
                    <div style={{width:40,height:40,borderRadius:13,background:r.isRest?'rgba(148,163,184,0.12)':`${pc}18`,border:r.isRest?'1px solid rgba(148,163,184,0.2)':`1px solid ${pc}25`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:r.isRest?18:13,fontWeight:700,color:pc,flexShrink:0}}>{r.isRest?'😴':r.name[0]}</div>
                    <div>
                      <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:3}}>{r.name}</div>
                      {r.isRest?<div style={{fontSize:11.5,color:'rgba(255,255,255,0.3)'}}>Counts toward streak</div>:(
                        <div style={{display:'flex',gap:5}}>{r.muscles.map((m,mi)=>(<React.Fragment key={m}>{mi>0&&<span style={{color:'rgba(255,255,255,0.2)'}}>·</span>}<span style={{fontSize:11.5,color:MC[m],fontWeight:500}}>{m}</span></React.Fragment>))}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {showSched&&(
        <ScheduleBuilder accent={accent} routines={routines} schedules={schedules} onSave={s=>{onSaveSchedule(s);setShowSched(false);}} onClose={()=>setShowSched(false)}/>
      )}
      {editingSchedule&&(
        <ScheduleBuilder accent={accent} routines={routines} schedules={schedules} existing={editingSchedule} onSave={s=>{onSaveSchedule(s);setEditingSchedule(null);}} onDelete={()=>{onDeleteSchedule(editingSchedule.id);setEditingSchedule(null);}} onClose={()=>setEditingSchedule(null)}/>
      )}
    </div>
  );
}

// ─── Awards Screen ────────────────────────────────────────────
function AwardsScreen({accent,prsData,historyData=[],currentStreak=0}){
  const rgb=h2r(accent);
  const totalWorkouts = historyData.length;
  const totalVolK = Math.round(historyData.reduce((a,s)=>a+(s.volume||0),0)/1000);
  const totalPRs = prsData.length;
  const MILESTONES=[
    {label:'Total Workouts',value:totalWorkouts,target:50,unit:'sessions',icon:'🏋️',unlocked:totalWorkouts>=1,color:'#60a5fa'},
    {label:'Total Volume',value:totalVolK,target:1000,unit:'k lbs',icon:'⚡',unlocked:totalVolK>=100,color:'#facc15'},
    {label:'Current Streak',value:currentStreak,target:10,unit:'days',icon:'🔥',unlocked:currentStreak>=3,color:'#fb923c'},
    {label:'Personal Records',value:totalPRs,target:10,unit:'PRs',icon:'🎯',unlocked:totalPRs>=1,color:'#34d399'},
    {label:'100 Sessions',value:totalWorkouts,target:100,unit:'sessions',icon:'💎',unlocked:totalWorkouts>=100,color:'#a78bfa'},
    {label:'Iron Streak',value:currentStreak,target:30,unit:'days',icon:'⚔️',unlocked:currentStreak>=30,color:'#f43f5e'},
  ];
  const BADGES=[
    {name:'First Rep',desc:'Logged your first workout',earned:totalWorkouts>=1,color:'#34d399',icon:'▶'},
    {name:'Week Warrior',desc:'7 workouts in a week',earned:totalWorkouts>=7,color:'#60a5fa',icon:'🗓'},
    {name:'PR Machine',desc:'Set 5 personal records',earned:totalPRs>=5,color:'#facc15',icon:'⚡'},
    {name:'Iron Will',desc:'30-day streak',earned:currentStreak>=30,color:'#f43f5e',icon:'🔥'},
    {name:'Volume King',desc:'1,000,000 lbs total',earned:totalVolK>=1000,color:'#a78bfa',icon:'👑'},
    {name:'Century Club',desc:'100 workouts',earned:totalWorkouts>=100,color:'#fb923c',icon:'💯'},
  ];
  if(!totalWorkouts) return(
    <div style={{height:'100%',display:'flex',alignItems:'center',justifyContent:'center',padding:'58px 32px 90px'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>🏆</div>
        <div style={{fontSize:22,fontWeight:700,color:'#fff',marginBottom:8}}>No awards yet</div>
        <div style={{fontSize:14,color:'rgba(255,255,255,0.3)',lineHeight:1.6}}>Log workouts and set PRs to start earning awards here.</div>
      </div>
    </div>
  );
  return(
    <div style={{height:'100%',overflowY:'auto',paddingBottom:90,paddingTop:58}}>
      <div style={{padding:'10px 20px 24px'}}>
        <div style={{marginBottom:28}}><div style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:-0.5,marginBottom:4}}>Awards</div><div style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Your lifting legacy</div></div>
        <div style={{borderRadius:24,background:`linear-gradient(145deg,rgba(${rgb},0.16) 0%,rgba(${rgb},0.04) 100%)`,border:`1px solid rgba(${rgb},0.2)`,padding:'22px 22px 18px',marginBottom:28,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:-40,right:-20,width:140,height:140,borderRadius:'50%',background:`rgba(${rgb},0.18)`,filter:'blur(50px)',pointerEvents:'none'}}/>
          <div style={{position:'relative',zIndex:1}}>
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}>
              <div><div style={{fontSize:12,fontWeight:700,color:'rgba(255,255,255,0.28)',letterSpacing:1.2,textTransform:'uppercase',marginBottom:6}}>Current Streak</div><div style={{display:'flex',alignItems:'baseline',gap:6}}><span style={{fontSize:52,fontWeight:700,color:'#fff',letterSpacing:-2,lineHeight:1}}>{currentStreak}</span><span style={{fontSize:18,fontWeight:300,color:'rgba(255,255,255,0.35)'}}>days</span></div></div>
              <div style={{width:52,height:52,borderRadius:18,background:`rgba(${rgb},0.18)`,border:`1px solid rgba(${rgb},0.3)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24}}>🔥</div>
            </div>
            <div style={{display:'flex',gap:6}}>{[...Array(7)].map((_,i)=>{const f=i<currentStreak;return <div key={i} style={{flex:1,height:6,borderRadius:3,background:f?`rgba(${rgb},0.8)`:'rgba(255,255,255,0.07)',boxShadow:f?`0 0 8px rgba(${rgb},0.5)`:'none'}}/>;})}
            </div>
          </div>
        </div>
        <div style={{marginBottom:28}}><Lbl>Personal Records</Lbl>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {prsData.map((pr,i)=>{const mc=MC[pr.muscle]||accent;return(
              <div key={pr.exercise} style={{display:'flex',alignItems:'center',gap:12,padding:'13px 14px',background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:16}}>
                <div style={{width:36,height:36,borderRadius:11,flexShrink:0,background:`${mc}18`,border:`1px solid ${mc}28`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800,color:mc}}>PR</div>
                <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:'#fff',marginBottom:3}}>{pr.exercise}</div><div style={{fontSize:11,color:'rgba(255,255,255,0.28)'}}>{pr.date} · <span style={{color:mc,fontWeight:600}}>{pr.muscle}</span></div></div>
                <div style={{textAlign:'right'}}><div style={{fontSize:16,fontWeight:700,color:'#fff'}}>{pr.weight}<span style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginLeft:2}}>lbs</span></div><div style={{fontSize:11,color:'rgba(255,255,255,0.28)'}}>{pr.reps} reps</div></div>
              </div>
            );})}
          </div>
        </div>
        <div style={{marginBottom:28}}><Lbl>Milestones</Lbl>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {MILESTONES.map(m=>{const pct=Math.min((m.value/m.target)*100,100);const mr=h2r(m.color);return(
              <div key={m.label} style={{padding:'14px 16px',background:m.unlocked?`linear-gradient(135deg,rgba(${mr},0.1) 0%,rgba(${mr},0.03) 100%)`:'rgba(255,255,255,0.02)',border:m.unlocked?`1px solid rgba(${mr},0.18)`:'1px solid rgba(255,255,255,0.05)',borderRadius:18,opacity:m.unlocked?1:0.55}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}><div style={{display:'flex',alignItems:'center',gap:10}}><span style={{fontSize:18}}>{m.icon}</span><div><div style={{fontSize:14,fontWeight:600,color:m.unlocked?'#fff':'rgba(255,255,255,0.5)'}}>{m.label}</div><div style={{fontSize:11,color:'rgba(255,255,255,0.22)',marginTop:1}}>{m.value}/{m.target} {m.unit}</div></div></div><div style={{fontSize:13,fontWeight:700,color:m.unlocked?m.color:'rgba(255,255,255,0.2)',background:m.unlocked?`rgba(${mr},0.15)`:'rgba(255,255,255,0.05)',border:m.unlocked?`1px solid rgba(${mr},0.25)`:'1px solid rgba(255,255,255,0.07)',borderRadius:20,padding:'3px 10px'}}>{Math.round(pct)}%</div></div>
                <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',width:`${pct}%`,background:m.unlocked?`linear-gradient(90deg,${m.color},${m.color}99)`:'rgba(255,255,255,0.1)',borderRadius:2,boxShadow:m.unlocked?`0 0 10px rgba(${mr},0.5)`:'none'}}/></div>
              </div>
            );})}
          </div>
        </div>
        <div style={{marginBottom:12}}><Lbl>Badges</Lbl>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {BADGES.map(b=>{const br=h2r(b.color);return(
              <div key={b.name} style={{padding:'16px 14px',background:b.earned?`linear-gradient(145deg,rgba(${br},0.14) 0%,rgba(${br},0.04) 100%)`:'rgba(255,255,255,0.02)',border:b.earned?`1px solid rgba(${br},0.22)`:'1px solid rgba(255,255,255,0.05)',borderRadius:18,display:'flex',flexDirection:'column',alignItems:'center',gap:8,textAlign:'center',opacity:b.earned?1:0.45}}>
                <div style={{width:44,height:44,borderRadius:16,background:b.earned?`rgba(${br},0.18)`:'rgba(255,255,255,0.05)',border:b.earned?`1px solid rgba(${br},0.3)`:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>{b.earned?b.icon:'🔒'}</div>
                <div><div style={{fontSize:12.5,fontWeight:700,color:b.earned?'#fff':'rgba(255,255,255,0.35)',marginBottom:3}}>{b.name}</div><div style={{fontSize:10.5,color:'rgba(255,255,255,0.25)',lineHeight:1.4}}>{b.desc}</div></div>
              </div>
            );})}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────
function SettingsScreen({accent,tw,onTwChange,workoutCount,streak}){
  const rgb=h2r(accent);
  const Toggle=({value,onChange})=>{const r2=h2r(accent);return <div onClick={()=>onChange(!value)} style={{width:44,height:26,borderRadius:13,flexShrink:0,background:value?`rgba(${r2},0.9)`:'rgba(255,255,255,0.1)',border:value?`1px solid rgba(${r2},1)`:'1px solid rgba(255,255,255,0.12)',position:'relative',cursor:'pointer',transition:'all 0.2s'}}><div style={{width:20,height:20,borderRadius:10,background:'#fff',position:'absolute',top:2,left:value?21:2,transition:'left 0.2s cubic-bezier(0.34,1.56,0.64,1)',boxShadow:'0 1px 4px rgba(0,0,0,0.3)'}}/></div>;};
  const Row=({label,sub,children,last})=>(
    <div style={{padding:'14px 18px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:last?'none':'1px solid rgba(255,255,255,0.04)',gap:12}}>
      <div style={{flex:1,minWidth:0}}><div style={{fontSize:14.5,fontWeight:500,color:'rgba(255,255,255,0.85)'}}>{label}</div>{sub&&<div style={{fontSize:11.5,color:'rgba(255,255,255,0.28)',marginTop:2}}>{sub}</div>}</div>
      {children}
    </div>
  );
  const [notifs,setNotifs]=React.useState(true);const [haptics,setHaptics]=React.useState(true);const [editingName,setEditingName]=React.useState(false);const [nameInput,setNameInput]=React.useState(tw.userName||'');
  const timerOptions=[30,45,60,90,120,180];
  return(
    <div style={{height:'100%',overflowY:'auto',paddingBottom:90,paddingTop:58}}>
      <div style={{padding:'10px 20px 24px'}}>
        <div style={{marginBottom:24}}><div style={{fontSize:32,fontWeight:700,color:'#fff',letterSpacing:-0.5,marginBottom:4}}>Settings</div><div style={{fontSize:13,color:'rgba(255,255,255,0.3)'}}>Customize your experience</div></div>
        {editingName?(
          <div style={{borderRadius:22,background:'rgba(255,255,255,0.03)',border:`1px solid rgba(${rgb},0.2)`,padding:'16px 18px',marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.3)',letterSpacing:1,textTransform:'uppercase',marginBottom:10}}>Your Name</div>
            <div style={{display:'flex',gap:10}}>
              <input autoFocus value={nameInput} onChange={e=>setNameInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){onTwChange({...tw,userName:nameInput.trim()||tw.userName});setEditingName(false);}}} placeholder="Your name" style={{flex:1,background:'rgba(255,255,255,0.06)',border:`1px solid rgba(${rgb},0.3)`,borderRadius:12,padding:'11px 14px',fontSize:16,fontWeight:600,color:'#fff',outline:'none',fontFamily:'Outfit,sans-serif'}}/>
              <div onClick={()=>{onTwChange({...tw,userName:nameInput.trim()||tw.userName});setEditingName(false);}} style={{height:44,padding:'0 18px',borderRadius:12,background:`rgba(${rgb},0.18)`,border:`1px solid rgba(${rgb},0.3)`,display:'flex',alignItems:'center',cursor:'pointer'}}><span style={{fontSize:14,fontWeight:700,color:accent}}>Save</span></div>
            </div>
          </div>
        ):(
          <div onClick={()=>{setNameInput(tw.userName||'');setEditingName(true);}} style={{borderRadius:22,background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',padding:'16px 18px',marginBottom:20,display:'flex',alignItems:'center',gap:14,cursor:'pointer'}}>
            <div style={{width:52,height:52,borderRadius:18,flexShrink:0,background:`linear-gradient(145deg,rgba(${rgb},0.3),rgba(${rgb},0.1))`,border:`1px solid rgba(${rgb},0.25)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,fontWeight:700,color:accent}}>{(tw.userName||'A')[0].toUpperCase()}</div>
            <div style={{flex:1}}><div style={{fontSize:16,fontWeight:700,color:'#fff',marginBottom:2}}>{tw.userName||'Athlete'}</div><div style={{fontSize:12,color:'rgba(255,255,255,0.3)'}}>{workoutCount} workout{workoutCount!==1?'s':''} · {streak} day streak</div></div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 1l4 4-8 8H1v-4L9 1Z" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinejoin="round"/></svg>
          </div>
        )}
        <div style={{marginBottom:16}}><Lbl>Appearance</Lbl>
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,overflow:'hidden'}}>
            <Row label="Accent Color" sub="Theme for highlights and buttons">
              <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}>
                {Object.entries(THEMES).map(([k,v])=>{const a=tw.theme===k;return <div key={k} onClick={()=>onTwChange({...tw,theme:k})} style={{width:22,height:22,borderRadius:8,background:v.p,border:a?'2px solid #fff':'2px solid transparent',cursor:'pointer',boxShadow:a?`0 0 10px ${v.p}`:'none',transition:'all 0.15s',flexShrink:0}}/>;}) }
              </div>
            </Row>
            <Row label="Beam Intensity" sub={`Ambient glow — ${tw.beamIntensity}%`} last>
              <div style={{display:'flex',alignItems:'center',gap:10,width:140,flexShrink:0}}>
                <input type="range" min="0" max="100" value={tw.beamIntensity} onChange={e=>{hapticSelect();onTwChange({...tw,beamIntensity:+e.target.value});}} style={{flex:1,accentColor:accent,cursor:'pointer'}}/>
                <span style={{fontSize:12,fontWeight:600,color:accent,minWidth:30,textAlign:'right'}}>{tw.beamIntensity}%</span>
              </div>
            </Row>
          </div>
        </div>
        <div style={{marginBottom:16}}><Lbl>Units & Tracking</Lbl>
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,overflow:'hidden'}}>
            <Row label="Weight Unit" sub="Used throughout the app">
              <div style={{display:'flex',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:10,overflow:'hidden',flexShrink:0}}>
                {['lbs','kg'].map(u=><div key={u} onClick={()=>onTwChange({...tw,unit:u})} style={{padding:'6px 16px',background:tw.unit===u?`rgba(${rgb},0.2)`:'transparent',color:tw.unit===u?accent:'rgba(255,255,255,0.35)',fontSize:13,fontWeight:700,cursor:'pointer',borderRight:u==='lbs'?'1px solid rgba(255,255,255,0.07)':'none'}}>{u}</div>)}
              </div>
            </Row>
            <Row label="Rest Timer" sub="Auto-start after set completion" last={!tw.restTimerEnabled}><Toggle value={tw.restTimerEnabled} onChange={v=>onTwChange({...tw,restTimerEnabled:v})}/></Row>
            {tw.restTimerEnabled&&(
              <div style={{padding:'10px 18px 16px',borderTop:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{display:'flex',flexDirection:'column',gap:2,marginBottom:12}}>
                  <div style={{fontSize:14,fontWeight:500,color:'rgba(255,255,255,0.7)'}}>Rest Duration</div>
                  <div style={{fontSize:11.5,color:'rgba(255,255,255,0.28)'}}>Seconds between sets</div>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                  {timerOptions.map(s=>{const sel=tw.restTimerDuration===s;const sr=h2r(accent);return <div key={s} onClick={()=>{haptic('light');onTwChange({...tw,restTimerDuration:s});}} style={{padding:'7px 16px',borderRadius:20,cursor:'pointer',background:sel?`rgba(${sr},0.2)`:'rgba(255,255,255,0.05)',border:sel?`1px solid rgba(${sr},0.35)`:'1px solid rgba(255,255,255,0.08)',fontSize:13,fontWeight:700,color:sel?accent:'rgba(255,255,255,0.35)',transition:'all 0.15s'}}>{s}s</div>;})}
                </div>
              </div>
            )}
          </div>
        </div>
        <div style={{marginBottom:16}}><Lbl>Notifications</Lbl>
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,overflow:'hidden'}}>
            <Row label="Workout Reminders" sub="Daily push notifications"><Toggle value={notifs} onChange={setNotifs}/></Row>
            <Row label="Haptic Feedback" sub="Vibration on set completion" last><Toggle value={haptics} onChange={setHaptics}/></Row>
          </div>
        </div>
        <div style={{marginBottom:24}}><Lbl>About</Lbl>
          <div style={{background:'rgba(255,255,255,0.025)',border:'1px solid rgba(255,255,255,0.055)',borderRadius:20,overflow:'hidden'}}>
            <Row label="Version" sub="Dialed v3.0"><span style={{fontSize:12,color:'rgba(255,255,255,0.2)'}}>Current</span></Row>
            <Row label="Rate Dialed" last><div style={{display:'flex',gap:2}}>{[...Array(5)].map((_,i)=><span key={i} style={{fontSize:14,color:accent}}>★</span>)}</div></Row>
          </div>
        </div>
        <div onClick={async()=>{haptic('medium');await supabase.auth.signOut();}} style={{height:50,borderRadius:16,background:'rgba(244,63,94,0.07)',border:'1px solid rgba(244,63,94,0.15)',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
          <span style={{fontSize:15,fontWeight:600,color:'#f43f5e'}}>Sign Out</span>
        </div>
      </div>
    </div>
  );
}
// ─── Auth Screen ──────────────────────────────────────────────
function AuthScreen({ accent }) {
  const [mode, setMode] = React.useState('landing');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const rgb = h2r(accent);

  const handleGoogle = async () => {
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) return setError('Enter your email and password.');
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); }
      // on success, onAuthStateChange swaps the screen
    } catch(e) {
      setError('Something went wrong. Check your connection and try again.');
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) return setError('Enter your email and password.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setLoading(true); setError('');
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); }
      else { setSuccess('Check your email to confirm your account!'); setLoading(false); }
    } catch(e) {
      setError('Something went wrong. Check your connection and try again.');
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.06)',
    border: `1px solid rgba(${rgb},0.25)`, borderRadius: 14,
    padding: '15px 18px', fontSize: 16, fontWeight: 500,
    color: '#fff', outline: 'none', fontFamily: 'Outfit,sans-serif',
    boxSizing: 'border-box',
  };
  const btnPrimary = {
    width: '100%', padding: '15px 18px', borderRadius: 14,
    background: accent, border: 'none', color: '#000',
    fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
    opacity: loading ? 0.6 : 1, fontFamily: 'Outfit,sans-serif', transition: 'opacity 0.2s',
  };
  const btnSecondary = {
    width: '100%', padding: '15px 18px', borderRadius: 14,
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 16, fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Outfit,sans-serif',
  };

  return (
    <div style={{ position:'absolute', inset:0, zIndex:500, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'0 32px', overflowY:'auto' }}>
      <div style={{ position:'absolute', top:'15%', left:'50%', transform:'translateX(-50%)', width:300, height:300, borderRadius:'50%', background:`rgba(${rgb},0.12)`, filter:'blur(80px)', pointerEvents:'none' }}/>
      <div style={{ width:'100%', position:'relative', zIndex:1 }}>
        {mode === 'landing' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:52, marginBottom:16 }}>⚡</div>
            <div style={{ fontSize:36, fontWeight:800, color:'#fff', letterSpacing:-1.5, marginBottom:48, lineHeight:1.1 }}>Dialed</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {!isNative() && (<>
              <button onClick={handleGoogle} style={btnSecondary}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.6 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.3 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/></svg>
                  Continue with Google
                </div>
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:12, margin:'4px 0' }}>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
                <span style={{ fontSize:12, color:'rgba(255,255,255,0.25)', fontWeight:500 }}>or</span>
                <div style={{ flex:1, height:1, background:'rgba(255,255,255,0.1)' }}/>
              </div>
              </>)}
              <button onClick={()=>{setMode('email-signin');setError('');}} style={btnPrimary}>Continue with Email</button>
              <button onClick={()=>{setMode('email-signup');setError('');}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', fontSize:14, cursor:'pointer', fontFamily:'Outfit,sans-serif', marginTop:4 }}>
                Don't have an account? <span style={{ color:accent }}>Sign up</span>
              </button>
            </div>
          </div>
        )}
        {mode === 'email-signin' && (
          <div>
            <button onClick={()=>{setMode('landing');setError('');}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:14, cursor:'pointer', fontFamily:'Outfit,sans-serif', marginBottom:24, padding:0, display:'flex', alignItems:'center', gap:6 }}>← Back</button>
            <div style={{ fontSize:28, fontWeight:800, color:'#fff', letterSpacing:-1, marginBottom:28 }}>Sign in</div>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmailSignIn()} autoFocus/>
              <input style={inputStyle} type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmailSignIn()}/>
              {error && <div style={{ fontSize:13, color:'#f87171', textAlign:'center' }}>{error}</div>}
              <button onClick={handleEmailSignIn} style={{ ...btnPrimary, marginTop:4 }} disabled={loading}>{loading?'Signing in...':'Sign In'}</button>
              <button onClick={()=>{setMode('email-signup');setError('');}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', fontSize:14, cursor:'pointer', fontFamily:'Outfit,sans-serif', textAlign:'center' }}>
                Don't have an account? <span style={{ color:accent }}>Sign up</span>
              </button>
            </div>
          </div>
        )}
        {mode === 'email-signup' && (
          <div>
            <button onClick={()=>{setMode('landing');setError('');}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', fontSize:14, cursor:'pointer', fontFamily:'Outfit,sans-serif', marginBottom:24, padding:0, display:'flex', alignItems:'center', gap:6 }}>← Back</button>
            <div style={{ fontSize:28, fontWeight:800, color:'#fff', letterSpacing:-1, marginBottom:28 }}>Create account</div>
            {success ? (
              <div style={{ background:`rgba(${rgb},0.1)`, border:`1px solid rgba(${rgb},0.3)`, borderRadius:14, padding:'20px 18px', textAlign:'center' }}>
                <div style={{ fontSize:32, marginBottom:10 }}>📬</div>
                <div style={{ fontSize:15, color:'#fff', fontWeight:600, marginBottom:6 }}>Check your email</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>We sent a confirmation link to <strong>{email}</strong></div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <input style={inputStyle} type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} autoFocus/>
                <input style={inputStyle} type="password" placeholder="Password (min 6 characters)" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleEmailSignUp()}/>
                {error && <div style={{ fontSize:13, color:'#f87171', textAlign:'center' }}>{error}</div>}
                <button onClick={handleEmailSignUp} style={{ ...btnPrimary, marginTop:4 }} disabled={loading}>{loading?'Creating account...':'Create Account'}</button>
                <button onClick={()=>{setMode('email-signin');setError('');}} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.35)', fontSize:14, cursor:'pointer', fontFamily:'Outfit,sans-serif', textAlign:'center' }}>
                  Already have an account? <span style={{ color:accent }}>Sign in</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────
export default function App(){
  const [session, setSession] = React.useState(undefined);

  React.useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session } }) => setSession(session))
      .catch(() => setSession(null));
    // Fallback: if getSession hangs (can happen on native), fall through to auth after 4s
    const timeout = setTimeout(() => setSession(s => s === undefined ? null : s), 4000);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => { subscription.unsubscribe(); clearTimeout(timeout); };
  }, []);

  // Wrapper style: center the phone mockup on web, fill the screen on native
  const wrapStyle = isNative()
    ? { width:'100%', minHeight:'100dvh', background:'#050a07' }
    : { display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' };

  const storageKey = session ? `dialed_v4_${session.user.id}` : 'dialed_v4';
  const loadState = () => { try { return JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch(e) { return null; } };

  const [onboarded, setOnboarded] = React.useState(false);
  const [tw, setTw] = React.useState(TWEAK_DEFAULTS);
  const [tab, setTab] = React.useState('home');
  const [routines, setRoutines] = React.useState([]);
  const [historyData, setHistoryData] = React.useState([]);
  const [bwLog, setBwLog] = React.useState([]);
  const [customExercises, setCustomExercises] = React.useState([]);
  const [progressionData, setProgressionData] = React.useState({});
  const [schedules, setSchedules] = React.useState([]);

  React.useEffect(() => {
    if (session === undefined) return;
    const saved = loadState();
    if (saved) {
      setOnboarded(!!saved.onboarded);
      setTw({ ...TWEAK_DEFAULTS, ...(saved.tw || {}) });
      setTab(saved.tab || 'home');
      setRoutines(saved.routines || []);
      setHistoryData(saved.historyData || []);
      setBwLog(saved.bwLog || []);
      setCustomExercises(saved.customExercises || []);
      setProgressionData(saved.progressionData || {});
      setSchedules(saved.schedules || []);
    }
    if (session?.user?.id) {
      pullFromCloud(session.user.id).then(cloud => {
        if (!cloud) return;
        if (cloud.routines.length > 0 || cloud.historyData.length > 0 || cloud.tw) {
          if (cloud.tw) setTw(prev => ({ ...TWEAK_DEFAULTS, ...cloud.tw }));
          if (cloud.routines.length > 0) setRoutines(cloud.routines);
          if (cloud.historyData.length > 0) setHistoryData(cloud.historyData);
          if (Object.keys(cloud.progressionData).length > 0) setProgressionData(cloud.progressionData);
          if (cloud.bwLog.length > 0) setBwLog(cloud.bwLog);
          if (cloud.schedules.length > 0) setSchedules(cloud.schedules);
          setOnboarded(true);
          localStorage.setItem(storageKey, JSON.stringify({ onboarded:true, tw:cloud.tw||saved?.tw, routines:cloud.routines, historyData:cloud.historyData, progressionData:cloud.progressionData, bwLog:cloud.bwLog, schedules:cloud.schedules, customExercises:saved?.customExercises||[], tab:saved?.tab||'home' }));
        }
      });
    }
  }, [session]);

  const [openRoutine, setOpenRoutine] = React.useState(null);
  const [activeWorkout, setActiveWorkout] = React.useState(null);
  const [editingRoutine, setEditingRoutine] = React.useState(null);
  const [creatingRoutine, setCreatingRoutine] = React.useState(false);
  const [showBWChart, setShowBWChart] = React.useState(false);

  const accent = THEMES[tw.theme]?.p || '#7dd3fc';

  const stateRef = React.useRef({});
  React.useEffect(() => {
    stateRef.current = { tw, tab, routines, historyData, bwLog, customExercises, progressionData, schedules };
  });

  const persist = (updates = {}) => {
    const state = { onboarded:true, ...stateRef.current, ...updates };
    localStorage.setItem(storageKey, JSON.stringify(state));
    if (session?.user?.id) {
      const merged = { ...stateRef.current, ...updates };
      pushToCloud(session.user.id, { tw:merged.tw, routines:merged.routines, historyData:merged.historyData, progressionData:merged.progressionData, bwLog:merged.bwLog, schedules:merged.schedules });
    }
  };

  const saveTw = t => { setTw(t); persist({ tw:t }); };
  const changeTab = id => { setTab(id); persist({ tab:id }); };

  const handleOnboardingComplete = ({ name, unit, theme, usePresets }) => {
    const newTw = { ...TWEAK_DEFAULTS, unit, theme, userName:name };
    setTw(newTw);
    const startRoutines = usePresets ? DEFAULT_ROUTINES : [];
    setRoutines(startRoutines);
    setHistoryData([]); setBwLog([]); setProgressionData({});
    setOnboarded(true);
    persist({ onboarded:true, tw:newTw, historyData:[], bwLog:[], progressionData:{}, routines:startRoutines });
  };

  const handleSaveRoutine = r => {
    const updated = routines.find(x => x.id === r.id) ? routines.map(x => x.id === r.id ? r : x) : [...routines, r];
    setRoutines(updated); persist({ routines:updated });
    setEditingRoutine(null); setCreatingRoutine(false);
  };
  const handleDeleteRoutine = id => {
    const updated = routines.filter(r => r.id !== id);
    setRoutines(updated); persist({ routines:updated }); setEditingRoutine(null);
  };
  const handleSaveSchedule = sched => {
    const updated = schedules.find(s => s.id === sched.id) ? schedules.map(s => s.id === sched.id ? sched : s) : [...schedules, sched];
    setSchedules(updated); persist({ schedules:updated });
  };
  const handleDeleteSchedule = id => {
    const updated = schedules.filter(s => s.id !== id);
    setSchedules(updated); persist({ schedules:updated });
  };

  const handleWorkoutEnd = ({ discard, updatedRoutine, completedWorkout }) => {
    if (!discard && completedWorkout) {
      const now = new Date();
      const localISO = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const newEntry = {
        id: `h${Date.now()}`,
        date: now.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' }),
        dateISO: localISO,
        routine: completedWorkout.routineName,
        muscles: completedWorkout.muscles,
        duration: completedWorkout.duration,
        volume: completedWorkout.volume,
        sets: completedWorkout.totalSets,
        exercises: completedWorkout.exercises,
      };
      const updatedHistory = [newEntry, ...historyData];
      setHistoryData(updatedHistory);
      const newProgression = { ...progressionData };
      completedWorkout.exercises.forEach(ex => {
        if (ex.bestWeight > 0 && ex.bestReps > 0) {
          if (!newProgression[ex.name]) newProgression[ex.name] = [];
          newProgression[ex.name] = [...newProgression[ex.name], { date:localISO, weight:ex.bestWeight, reps:ex.bestReps, volume:ex.totalVolume }];
        }
      });
      setProgressionData(newProgression);
      if (updatedRoutine) {
        const updatedR = routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r);
        setRoutines(updatedR);
        persist({ historyData:updatedHistory, progressionData:newProgression, routines:updatedR });
      } else {
        persist({ historyData:updatedHistory, progressionData:newProgression });
      }
    } else if (updatedRoutine) {
      const updatedR = routines.map(r => r.id === updatedRoutine.id ? updatedRoutine : r);
      setRoutines(updatedR); persist({ routines:updatedR });
    }
    setActiveWorkout(null);
  };

  const handleAddBW = weight => {
    const now = new Date();
    const localISO = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const entry = { date:localISO, weight };
    const updated = [...bwLog, entry];
    setBwLog(updated); persist({ bwLog:updated });
  };

  const handleSaveCustomExercise = ex => {
    const updated = [...customExercises, ex];
    setCustomExercises(updated); persist({ customExercises:updated });
  };

  const handleDeleteWorkout = id => {
    const updated = historyData.filter(h => h.id !== id);
    setHistoryData(updated); persist({ historyData:updated });
  };

  // ── Derived data ──
  const weekChart = React.useMemo(() => {
    const days = ['S','M','T','W','T','F','S'];
    const dow = new Date().getDay();
    return Array.from({ length:7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (dow - i + 7) % 7);
      const now = d;
      const key = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
      const v = historyData.filter(s => s.dateISO === key).reduce((a, s) => a + (s.volume || 0), 0);
      return { d:days[i], v, today:i === dow };
    });
  }, [historyData]);

  const muscleSets = React.useMemo(() => {
    const counts = {};
    historyData.forEach(session => {
      (session.exercises || []).forEach(ex => {
        const exInfo = ALL_EXERCISES.find(e => e.name === ex.name);
        const muscle = exInfo?.muscle || 'Full Body';
        counts[muscle] = (counts[muscle] || 0) + (ex.sets?.length || 0);
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, s]) => ({ n, s }));
  }, [historyData]);

  const historyWeeks = React.useMemo(() => {
    if (!historyData.length) return [];
    const today = new Date();
    const todayISO = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const startOfWeek = new Date(today); startOfWeek.setDate(today.getDate() - today.getDay());
    const startOfLastWeek = new Date(startOfWeek); startOfLastWeek.setDate(startOfWeek.getDate() - 7);
    const swISO = `${startOfWeek.getFullYear()}-${String(startOfWeek.getMonth()+1).padStart(2,'0')}-${String(startOfWeek.getDate()).padStart(2,'0')}`;
    const slwISO = `${startOfLastWeek.getFullYear()}-${String(startOfLastWeek.getMonth()+1).padStart(2,'0')}-${String(startOfLastWeek.getDate()).padStart(2,'0')}`;
    const thisWeek = [], lastWeek = [], older = [];
    historyData.forEach(s => {
      const iso = s.dateISO;
      if (!iso) { thisWeek.push(s); return; }
      if (iso >= swISO) thisWeek.push(s);
      else if (iso >= slwISO) lastWeek.push(s);
      else older.push(s);
    });
    const makeWeek = (label, sessions) => sessions.length === 0 ? null : ({ label, ids:sessions.map(s => s.id), vol:sessions.reduce((a, s) => a + (s.volume || 0), 0), workouts:sessions.length });
    return [makeWeek('This Week', thisWeek), makeWeek('Last Week', lastWeek), older.length ? makeWeek('Earlier', older) : null].filter(Boolean);
  }, [historyData]);

  const calWorkouts = React.useMemo(() => {
    const map = {};
    historyData.forEach(s => {
      if (s.dateISO) map[s.dateISO] = { routine:s.routine, muscles:s.muscles, volume:s.volume||0, duration:s.duration, sets:s.sets, pr:s.exercises?.some(e => e.pr)||false };
    });
    return map;
  }, [historyData]);

  const prsData = React.useMemo(() => {
    const prs = []; const seen = new Set();
    historyData.forEach(s => {
      (s.exercises || []).forEach(ex => {
        if (ex.pr && !seen.has(ex.name)) {
          seen.add(ex.name);
          const best = ex.sets?.reduce((a, set) => set.w > a.w ? set : a, ex.sets[0]);
          const exInfo = ALL_EXERCISES.find(e => e.name === ex.name);
          prs.push({ exercise:ex.name, weight:best?.w||0, reps:best?.r||0, date:s.dateISO||'', muscle:exInfo?.muscle||'Full Body' });
        }
      });
    });
    return prs;
  }, [historyData]);

  const currentStreak = React.useMemo(() => {
    if (!historyData.length) return 0;
    const dateSet = new Set(historyData.map(s => s.dateISO).filter(Boolean));
    let count = 0;
    const d = new Date();
    while (true) {
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (dateSet.has(key)) { count++; d.setDate(d.getDate() - 1); }
      else break;
    }
    return count;
  }, [historyData]);

  // ── Render ──
  if (session === undefined) {
    return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100dvh', background:'#050a07' }}><div style={{ fontSize:40 }}>⚡</div></div>;
  }

  if (!session) {
    return (
      <div style={wrapStyle}>
        <PhoneFrame>
          <BeamsCanvas accent="#7dd3fc" intensity={50}/>
          <FilmGrain/>
          <StatusBar/>
          <AuthScreen accent="#7dd3fc"/>
        </PhoneFrame>
      </div>
    );
  }

  if (!onboarded) {
    return (
      <div style={wrapStyle}>
        <PhoneFrame>
          <BeamsCanvas accent={accent} intensity={50}/>
          <FilmGrain/>
          <StatusBar/>
          <OnboardingScreen onComplete={handleOnboardingComplete}/>
        </PhoneFrame>
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <PhoneFrame>
        <BeamsCanvas accent={accent} intensity={tw.beamIntensity}/>
        <FilmGrain/>
        <StatusBar/>

        {tab==='home'&&<HomeScreen accent={accent} unit={tw.unit} userName={tw.userName} historyData={historyData} muscleSets={muscleSets} weekChart={weekChart} routines={routines} onRoutineTap={r=>setOpenRoutine(r)} onStartPlan={()=>{const dow=new Date().getDay();const todaySched=schedules.find(s=>s.days.includes(dow));const r=todaySched?routines.find(x=>x.name===todaySched.routineName):routines[0];if(r)setActiveWorkout(r);}} onQuickStart={()=>setActiveWorkout({name:'Free Workout',muscles:['Full Body'],exercises:[],id:null})} onOpenBW={()=>setShowBWChart(true)} bwLog={bwLog} onNewRoutine={()=>setCreatingRoutine(true)} todaySchedule={schedules.find(s=>s.days.includes(new Date().getDay()))}/>}
        {tab==='history'&&<HistoryScreen accent={accent} historyData={historyData} historyWeeks={historyWeeks} progressionData={progressionData} unit={tw.unit} onDeleteWorkout={handleDeleteWorkout}/>}
        {tab==='calendar'&&<CalendarScreen accent={accent} calWorkouts={calWorkouts} routines={routines} schedules={schedules} onSaveSchedule={handleSaveSchedule} onDeleteSchedule={handleDeleteSchedule} currentStreak={currentStreak}/>}
        {tab==='awards'&&<AwardsScreen accent={accent} prsData={prsData} historyData={historyData} currentStreak={currentStreak}/>}
        {tab==='settings'&&<SettingsScreen accent={accent} tw={tw} onTwChange={saveTw} workoutCount={historyData.length} streak={currentStreak}/>}

        {openRoutine&&<RoutineSheet r={openRoutine} accent={accent} onClose={()=>setOpenRoutine(null)} onStart={r=>{setOpenRoutine(null);setActiveWorkout(r);}} onEdit={r=>{setEditingRoutine(r);}}/>}
        {activeWorkout&&<WorkoutScreen routine={activeWorkout} accent={accent} onEnd={handleWorkoutEnd} restTimerEnabled={tw.restTimerEnabled} restTimerDuration={tw.restTimerDuration} progressionData={progressionData} customExercises={customExercises} historyData={historyData} onSaveCustomExercise={handleSaveCustomExercise} unit={tw.unit} userName={tw.userName}/>}
        {(editingRoutine||creatingRoutine)&&<RoutineBuilder accent={accent} existing={editingRoutine||null} onClose={()=>{setEditingRoutine(null);setCreatingRoutine(false);}} onSave={handleSaveRoutine} onDelete={handleDeleteRoutine} customExercises={customExercises} onSaveCustomExercise={handleSaveCustomExercise}/>}
        {showBWChart&&<BodyweightSheet accent={accent} unit={tw.unit} bwLog={bwLog} onClose={()=>setShowBWChart(false)} onAdd={handleAddBW}/>}

        <BottomNav tab={tab} setTab={changeTab} accent={accent}/>
      </PhoneFrame>
    </div>
  );
}
