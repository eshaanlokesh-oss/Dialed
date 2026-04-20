import React from 'react';
import {
  THEMES, MC, WEEK, MUSCLE_SETS, ROUTINES,
  HISTORY, WEEKS, TWEAK_DEFAULTS, CAL_WORKOUTS, ALL_PRS, ALL_EXERCISES,
} from './data.js';

// ─── Utility ─────────────────────────────────────────────────
function h2r(hex) {
  if (!hex || hex.length < 7) return '52,211,153';
  return `${parseInt(hex.slice(1, 3), 16)},${parseInt(hex.slice(3, 5), 16)},${parseInt(hex.slice(5, 7), 16)}`;
}

// ─── Beams Canvas ────────────────────────────────────────────
function BeamsCanvas({ accent, intensity }) {
  const ref = React.useRef(null);
  const accentRef = React.useRef(accent);
  const intRef = React.useRef(intensity);
  React.useEffect(() => { accentRef.current = accent; }, [accent]);
  React.useEffect(() => { intRef.current = intensity; }, [intensity]);

  React.useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = 390, H = 844;
    canvas.width = W; canvas.height = H;

    class Beam {
      reset(scatter) {
        this.x = 40 + Math.random() * 310;
        this.y = scatter ? Math.random() * H : H + 60 + Math.random() * 180;
        this.vy = -(0.55 + Math.random() * 1.3);
        this.vx = (Math.random() - 0.5) * 0.35;
        this.rx = 60 + Math.random() * 120;
        this.ry = 160 + Math.random() * 320;
        this.baseA = 0.48 + Math.random() * 0.44;
        this.phase = Math.random() * Math.PI * 2;
        this.ps = 0.007 + Math.random() * 0.016;
        this.wo = Math.random() * Math.PI * 2;
        this.ws = 0.004 + Math.random() * 0.007;
        this.life = scatter ? Math.random() * 500 : 0;
        this.maxLife = 420 + Math.random() * 340;
      }
      constructor(scatter) { this.reset(scatter); }
      update(t) {
        this.wo += this.ws;
        this.x += this.vx + Math.sin(this.wo) * 0.22;
        this.y += this.vy;
        this.life++;
        const pulse = 0.68 + 0.32 * Math.sin(t * this.ps + this.phase);
        const fi = Math.min(this.life / 90, 1);
        const fo = Math.min((this.maxLife - this.life) / 90, 1);
        this.alpha = this.baseA * pulse * fi * fo * (intRef.current / 100);
      }
      draw(ctx) {
        const rgb = h2r(accentRef.current);
        ctx.save();
        ctx.filter = 'blur(24px)';
        const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.rx * 1.6);
        g.addColorStop(0, `rgba(${rgb},${Math.min(this.alpha, 1)})`);
        g.addColorStop(0.3, `rgba(${rgb},${Math.min(this.alpha * 0.6, 1)})`);
        g.addColorStop(1, `rgba(${rgb},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.rx, this.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      dead() { return this.life >= this.maxLife || this.y < -(this.ry + 20); }
    }

    let beams = Array.from({ length: 16 }, () => new Beam(true));
    let t = 0, raf;
    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      t++;
      beams = beams.filter(b => !b.dead());
      while (beams.length < 16) beams.push(new Beam(false));
      beams.forEach(b => { b.update(t); b.draw(ctx); });
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); };
  }, []);

  return (
    <canvas ref={ref} style={{
      position: 'absolute', inset: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none',
    }} />
  );
}

// ─── Film Grain ──────────────────────────────────────────────
function FilmGrain() {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 55, pointerEvents: 'none', mixBlendMode: 'overlay' }}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', inset: 0 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.68" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" opacity="0.18" />
      </svg>
    </div>
  );
}

// ─── Status Bar ──────────────────────────────────────────────
function StatusBar() {
  const t = new Date();
  const time = `${t.getHours() % 12 || 12}:${String(t.getMinutes()).padStart(2, '0')}`;
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 54, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px 0', pointerEvents: 'none' }}>
      <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.92)', letterSpacing: 0.2 }}>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
          <rect x="0" y="7" width="3" height="5" rx="0.6" fill="rgba(255,255,255,0.85)" />
          <rect x="5" y="4" width="3" height="8" rx="0.6" fill="rgba(255,255,255,0.85)" />
          <rect x="10" y="1.5" width="3" height="10.5" rx="0.6" fill="rgba(255,255,255,0.85)" />
          <rect x="15" y="0" width="3" height="12" rx="0.6" fill="rgba(255,255,255,0.85)" />
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="0.5" y="0.5" width="22" height="12" rx="3.5" stroke="rgba(255,255,255,0.45)" />
          <rect x="2" y="2" width="17" height="9" rx="2" fill="rgba(255,255,255,0.88)" />
          <path d="M24 4.5V8.5C24.8 8.2 25.5 7.4 25.5 6.5S24.8 4.8 24 4.5Z" fill="rgba(255,255,255,0.4)" />
        </svg>
      </div>
    </div>
  );
}

// ─── Section Label ───────────────────────────────────────────
const Lbl = ({ children }) => (
  <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.3, textTransform: 'uppercase', marginBottom: 14 }}>
    {children}
  </div>
);

// ─── Phone Frame ─────────────────────────────────────────────
function PhoneFrame({ children }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 57, padding: 11,
      background: 'linear-gradient(150deg,#262626 0%,#0f0f0f 60%,#1a1a1a 100%)',
      boxShadow: '0 64px 120px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.09)',
    }}>
      {[[true, 118, 32], [true, 162, 32], [true, 210, 68], [false, 166, 82]].map(([left, top, h], i) => (
        <div key={i} style={{
          position: 'absolute', [left ? 'left' : 'right']: -3,
          top, width: 3, height: h,
          background: '#1c1c1c',
          borderRadius: left ? '3px 0 0 3px' : '0 3px 3px 0',
          boxShadow: left ? '-1px 0 0 rgba(255,255,255,0.04)' : '1px 0 0 rgba(255,255,255,0.04)',
        }} />
      ))}
      <div style={{ width: 390, height: 844, borderRadius: 47, overflow: 'hidden', background: '#0d0d0d', position: 'relative' }}>
        {children}
        <div style={{ position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', width: 124, height: 36, background: '#000', borderRadius: 20, zIndex: 80, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 9, left: '50%', transform: 'translateX(-50%)', width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.26)', zIndex: 80, pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

// ─── Weekly Chart ────────────────────────────────────────────
function WeeklyChart({ accent }) {
  const maxV = Math.max(...WEEK.map(d => d.v), 1);
  const BW = 32, GAP = 14, BH = 54;
  const W = WEEK.length * (BW + GAP) - GAP;
  return (
    <svg width={W} height={BH + 24} style={{ overflow: 'visible', display: 'block' }}>
      <defs>
        <linearGradient id="bg0" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={accent} stopOpacity="1" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.12" />
        </linearGradient>
      </defs>
      {WEEK.map((d, i) => {
        const bh = d.v > 0 ? Math.max(5, (d.v / maxV) * BH) : 3;
        const x = i * (BW + GAP);
        return (
          <g key={i}>
            <rect x={x} y={BH - bh} width={BW} height={bh} rx={5} fill={d.v > 0 ? 'url(#bg0)' : 'rgba(255,255,255,0.04)'} />
            {d.today && d.v === 0 && <rect x={x} y={BH - 4} width={BW} height={4} rx={2} fill={`${accent}50`} />}
            <text x={x + BW / 2} y={BH + 17} textAnchor="middle"
              fill={d.today ? accent : 'rgba(255,255,255,0.22)'}
              fontSize={10.5} fontWeight={d.today ? 700 : 400} fontFamily="Outfit,sans-serif">
              {d.d}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Action Tiles ────────────────────────────────────────────
// FIX: Quick Start now calls onQuickStart prop to open a blank workout
function ActionTiles({ accent, onStartPlan, onQuickStart }) {
  const rgb = h2r(accent);
  const [pa, setPa] = React.useState(false);
  const [fb, setFb] = React.useState(false);

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      {/* Today's Plan tile */}
      <div
        onPointerDown={() => setPa(true)}
        onPointerUp={() => setPa(false)}
        onPointerLeave={() => setPa(false)}
        style={{
          flex: '1 1 auto', padding: '18px 16px 20px', borderRadius: 22,
          background: `linear-gradient(160deg, rgba(${rgb},0.24) 0%, rgba(${rgb},0.07) 100%)`,
          border: `1px solid rgba(${rgb},0.22)`,
          position: 'relative', overflow: 'hidden', cursor: 'pointer',
          boxShadow: `0 -1px 0 rgba(${rgb},0.75) inset, 0 0 50px rgba(${rgb},0.09) inset`,
          transform: pa ? 'scale(0.965)' : 'scale(1)',
          transition: 'transform 0.12s ease',
        }}>
        <div style={{ position: 'absolute', top: -36, left: '50%', transform: 'translateX(-50%)', width: 110, height: 55, borderRadius: '50%', background: `rgba(${rgb},0.38)`, filter: 'blur(30px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <svg width="26" height="16" viewBox="0 0 26 16" style={{ marginBottom: 11 }} fill="none">
            <rect x="6" y="4" width="14" height="8" rx="1.5" stroke={accent} strokeWidth="1.6" />
            <rect x="3.5" y="1.5" width="2.5" height="13" rx="1.2" fill={accent} />
            <rect x="20" y="1.5" width="2.5" height="13" rx="1.2" fill={accent} />
            <rect x="0.5" y="4.5" width="3" height="7" rx="1" fill={`${accent}70`} />
            <rect x="22.5" y="4.5" width="3" height="7" rx="1" fill={`${accent}70`} />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 3, letterSpacing: -0.3 }}>Today's Plan</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.42)', marginBottom: 15, lineHeight: 1.4 }}>Push A · 6 exercises</div>
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: `rgba(${rgb},0.2)`, border: `1px solid rgba(${rgb},0.32)`,
              borderRadius: 20, padding: '5px 13px',
              fontSize: 12, fontWeight: 700, color: accent, letterSpacing: 0.3, cursor: 'pointer',
            }}
            onClick={e => { e.stopPropagation(); onStartPlan && onStartPlan(); }}>
            Start →
          </div>
        </div>
      </div>

      {/* Quick Start tile — FIX: onClick now triggers onQuickStart */}
      <div
        onPointerDown={() => setFb(true)}
        onPointerUp={() => { setFb(false); onQuickStart && onQuickStart(); }}
        onPointerLeave={() => setFb(false)}
        style={{
          flex: '0 0 42%', padding: '16px 14px 18px', borderRadius: 22,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.065)',
          cursor: 'pointer', position: 'relative', overflow: 'hidden',
          transform: fb ? 'scale(0.965)' : 'scale(1)',
          transition: 'transform 0.12s ease',
          display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        }}>
        <div>
          <svg width="16" height="24" viewBox="0 0 16 24" style={{ marginBottom: 11 }} fill="none">
            <path d="M10 1L1 14h7L6 23l10-13H9z" fill="rgba(255,255,255,0.35)" stroke="rgba(255,255,255,0.22)" strokeWidth="0.8" strokeLinejoin="round" />
          </svg>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.82)', marginBottom: 3, letterSpacing: -0.3 }}>Quick Start</div>
          <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', lineHeight: 1.4 }}>No plan, just lift</div>
        </div>
        <div style={{ marginTop: 14 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 20, padding: '5px 11px',
            fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap',
          }}>Go →</div>
        </div>
      </div>
    </div>
  );
}

// ─── Stats Row ───────────────────────────────────────────────
function StatsRow({ unit }) {
  const items = [{ v: '4', l: 'Workouts' }, { v: '6', l: 'PRs' }, { v: '178', l: unit }];
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {items.map((s, i) => (
        <React.Fragment key={s.l}>
          {i > 0 && <div style={{ width: 1, height: 32, background: 'rgba(255,255,255,0.07)', flexShrink: 0 }} />}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#fff', letterSpacing: -0.8, lineHeight: 1 }}>{s.v}</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 500, letterSpacing: 0.8, textTransform: 'uppercase' }}>{s.l}</div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Muscle Pills ────────────────────────────────────────────
function MusclePills() {
  const maxS = Math.max(...MUSCLE_SETS.map(m => m.s));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {MUSCLE_SETS.map(m => {
        const c = MC[m.n];
        const scale = 0.48 + (m.s / maxS) * 0.52;
        const fs = Math.round(11.5 + scale * 3);
        const px = Math.round(11 + scale * 7);
        const py = Math.round(5 + scale * 3.5);
        return (
          <div key={m.n} style={{
            padding: `${py}px ${px}px`, borderRadius: 100,
            background: `linear-gradient(135deg,${c}1e,${c}0a)`,
            border: `1px solid ${c}35`,
            fontSize: fs, fontWeight: 600, color: c,
            display: 'flex', alignItems: 'center', gap: 5,
            boxShadow: `0 2px 14px ${c}14`, letterSpacing: 0.1,
          }}>
            {m.n}
            <span style={{ opacity: 0.45, fontWeight: 400, fontSize: fs - 1.5 }}>{m.s}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Routine Icon ────────────────────────────────────────────
function RoutineIcon({ name, color }) {
  const icons = {
    'Push A': <path d="M11 16V7M11 7L7 11M11 7l4 4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    'Pull B': <path d="M11 7v9M11 16L7 12M11 16l4-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />,
    'Legs C': <><path d="M7 6h8M11 6v5L7 17M11 11l4 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></>,
    'Upper D': <><circle cx="11" cy="11" r="3.5" stroke={color} strokeWidth="1.6" /><path d="M11 4v2M11 16v2M4 11h2M16 11h2" stroke={color} strokeWidth="1.6" strokeLinecap="round" /></>,
  };
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      {icons[name] || <circle cx="11" cy="11" r="6" stroke={color} strokeWidth="1.6" />}
    </svg>
  );
}

// ─── Routine Row ─────────────────────────────────────────────
function RoutineRow({ r, isLast, onTap }) {
  const pc = MC[r.muscles[0]];
  const [pressed, setPressed] = React.useState(false);
  return (
    <div
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => { setPressed(false); onTap(); }}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '13px 0',
        borderBottom: !isLast ? '1px solid rgba(255,255,255,0.045)' : 'none',
        cursor: 'pointer',
        opacity: pressed ? 0.6 : 1,
        transform: pressed ? 'scale(0.99)' : 'scale(1)',
        transition: 'opacity 0.1s, transform 0.1s',
      }}>
      <div style={{
        width: 48, height: 48, borderRadius: 16, flexShrink: 0,
        background: `linear-gradient(145deg,${pc}28,${pc}0a)`,
        border: `1px solid ${pc}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <RoutineIcon name={r.name} color={pc} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15.5, fontWeight: 600, color: '#fff', letterSpacing: -0.3, marginBottom: 5 }}>{r.name}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
          {r.muscles.map((m, mi) => (
            <React.Fragment key={m}>
              {mi > 0 && <div style={{ width: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />}
              <span style={{ fontSize: 12, fontWeight: 500, color: MC[m] }}>{m}</span>
            </React.Fragment>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>{r.exercises.length} exercises</span>
        <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.16)', fontWeight: 400 }}>{r.lastDone}</span>
      </div>
    </div>
  );
}

// ─── Routine Detail Sheet ────────────────────────────────────
function RoutineSheet({ r, accent, onClose, onStart }) {
  const rgb = h2r(accent);
  const [startPressed, setStartPressed] = React.useState(false);
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 200, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }} />
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#141414', borderRadius: '28px 28px 0 0',
        border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none',
        maxHeight: '82%', display: 'flex', flexDirection: 'column',
        animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />
        </div>
        <div style={{ padding: '18px 22px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', letterSpacing: -0.6, marginBottom: 5 }}>{r.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {r.muscles.map((m, mi) => (
                <React.Fragment key={m}>
                  {mi > 0 && <div style={{ width: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.15)' }} />}
                  <span style={{ fontSize: 13, fontWeight: 600, color: MC[m] }}>{m}</span>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, paddingTop: 2 }}>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', letterSpacing: 0.2 }}>{r.freq}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)' }}>Last: {r.lastDone}</span>
          </div>
        </div>
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 22px' }} />
        <div style={{ overflowY: 'auto', flex: 1, padding: '8px 0 20px' }}>
          {r.exercises.map((ex, i) => (
            <div key={ex.name} style={{
              display: 'flex', alignItems: 'center',
              padding: '14px 22px',
              borderBottom: i < r.exercises.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: 10, flexShrink: 0,
                background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.18)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: accent, marginRight: 14,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: -0.2, marginBottom: 3 }}>{ex.name}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>{ex.sets} sets · {ex.reps} reps</div>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: 0.1 }}>{ex.last}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px 22px 36px' }}>
          <div
            onPointerDown={() => setStartPressed(true)}
            onPointerUp={() => setStartPressed(false)}
            onPointerLeave={() => setStartPressed(false)}
            onClick={() => { onStart && onStart(r); }}
            style={{
              height: 56, borderRadius: 18,
              background: `linear-gradient(135deg, ${accent} 0%, ${THEMES['Emerald']?.g || accent} 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              cursor: 'pointer',
              transform: startPressed ? 'scale(0.97)' : 'scale(1)',
              transition: 'transform 0.1s',
              boxShadow: `0 8px 28px rgba(${rgb},0.35)`,
            }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 1l14 8-14 8V1z" fill="#000" />
            </svg>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#000', letterSpacing: -0.2 }}>Start {r.name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Workout Screen ──────────────────────────────────────────
// FIX: Added "Discard Workout" option in the end confirm sheet
function WorkoutScreen({ routine, accent, onEnd }) {
  const rgb = h2r(accent);
  const [elapsed, setElapsed] = React.useState(0);
  const [endConfirm, setEndConfirm] = React.useState(false);
  const initSets = () => routine.exercises.map(ex =>
    Array.from({ length: ex.sets }, () => ({ weight: '', reps: '', done: false }))
  );
  const [sets, setSets] = React.useState(initSets);
  const [exercises, setExercises] = React.useState(routine.exercises);
  const [collapsed, setCollapsed] = React.useState({});
  const [showAddEx, setShowAddEx] = React.useState(false);
  const [exSearch, setExSearch] = React.useState('');
  const [exMuscle, setExMuscle] = React.useState('All');

  React.useEffect(() => {
    const t = setInterval(() => setElapsed(s => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const totalSets = sets.reduce((a, ex) => a + ex.length, 0);
  const doneSets = sets.reduce((a, ex) => a + ex.filter(s => s.done).length, 0);

  const updateSet = (ei, si, field, val) => {
    setSets(prev => {
      const next = prev.map(ex => ex.map(s => ({ ...s })));
      next[ei][si][field] = val;
      return next;
    });
  };
  const toggleDone = (ei, si) => {
    setSets(prev => {
      const next = prev.map(ex => ex.map(s => ({ ...s })));
      next[ei][si].done = !next[ei][si].done;
      return next;
    });
  };
  const addSet = (ei) => {
    setSets(prev => {
      const next = prev.map(ex => ex.map(s => ({ ...s })));
      next[ei] = [...next[ei], { weight: '', reps: '', done: false }];
      return next;
    });
  };
  const removeSet = (ei, si) => {
    setSets(prev => {
      const next = prev.map(ex => ex.map(s => ({ ...s })));
      next[ei] = next[ei].filter((_, i) => i !== si);
      return next;
    });
  };
  const removeExerciseCard = (ei) => {
    setExercises(prev => prev.filter((_, i) => i !== ei));
    setSets(prev => prev.filter((_, i) => i !== ei));
  };
  const toggleCollapse = (ei) => setCollapsed(c => ({ ...c, [ei]: !c[ei] }));

  const addExercise = (ex) => {
    setExercises(prev => [...prev, { name: ex.name, sets: 3, reps: '8-10', last: '—' }]);
    setSets(prev => [...prev, Array.from({ length: 3 }, () => ({ weight: '', reps: '', done: false }))]);
    setShowAddEx(false);
    setExSearch('');
  };

  const muscleFor = (ex) => {
    const found = ALL_EXERCISES.find(e => e.name === ex.name);
    return found ? found.muscle : routine.muscles[0];
  };

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 300, background: '#0d0d0d', display: 'flex', flexDirection: 'column', animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)' }}>
      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'rgba(13,13,13,0.96)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '54px 18px 14px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.28)', letterSpacing: 0.8, marginBottom: 2, textTransform: 'uppercase' }}>{routine.name}</div>
          <div style={{ fontSize: 32, fontWeight: 200, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>{fmt(elapsed)}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: 0.2 }}>{doneSets}/{totalSets}</div>
          <div
            onClick={() => setEndConfirm(true)}
            style={{
              height: 36, padding: '0 18px', borderRadius: 12,
              background: `linear-gradient(135deg,${accent},${THEMES['Crimson']?.p || accent})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: `0 4px 16px rgba(${rgb},0.35)`,
            }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#000', letterSpacing: -0.2 }}>Finish</span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', flexShrink: 0, borderRadius: 2 }}>
        <div style={{
          height: '100%',
          width: `${totalSets === 0 ? 0 : Math.round((doneSets / totalSets) * 100)}%`,
          background: `linear-gradient(90deg,${accent},${THEMES['Crimson']?.p || accent})`,
          borderRadius: 2, transition: 'width 0.45s ease',
          boxShadow: `0 0 12px rgba(${rgb},0.7)`,
          minWidth: doneSets > 0 ? 6 : 0,
        }} />
      </div>

      {/* Exercise list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px 40px' }}>
        {exercises.map((ex, ei) => {
          const mc = MC[muscleFor(ex)] || accent;
          const isCollapsed = collapsed[ei];
          return (
            <div key={`${ex.name}-${ei}`} style={{ marginBottom: 10, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 14px', borderBottom: isCollapsed ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, flexShrink: 0, background: `${mc}18`, border: `1px solid ${mc}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: mc }}>{ex.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', letterSpacing: -0.3, marginBottom: 4 }}>{ex.name}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 700, color: mc, background: `${mc}15`, border: `1px solid ${mc}28`, borderRadius: 20, padding: '2px 8px', letterSpacing: 0.2 }}>{muscleFor(ex)}</span>
                </div>
                <div onClick={() => toggleCollapse(ei)} style={{ cursor: 'pointer', padding: '4px 6px', opacity: 0.35 }}>
                  <svg width="12" height="8" viewBox="0 0 12 8" fill="none">
                    <path d={isCollapsed ? 'M1 7l5-6 5 6' : 'M1 1l5 6 5-6'} stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div onClick={() => removeExerciseCard(ei)} style={{ cursor: 'pointer', padding: '4px 5px', background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.18)', borderRadius: 7, marginLeft: 2 }}>
                  <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                    <path d="M1 1l7 7M8 1L1 8" stroke="#FF4444" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {!isCollapsed && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr 36px', padding: '7px 14px', gap: 8 }}>
                    {['SET', 'WEIGHT', 'REPS', ''].map((h, i) => (
                      <div key={i} style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: 1.1, textTransform: 'uppercase' }}>{h}</div>
                    ))}
                  </div>
                  {sets[ei] && sets[ei].map((s, si) => (
                    <div key={si} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 36px', padding: '5px 14px', gap: 8, alignItems: 'center', opacity: s.done ? 0.45 : 1, transition: 'opacity 0.2s' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <div onClick={() => removeSet(ei, si)} style={{ width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, background: 'rgba(255,68,68,0.1)', border: '1px solid rgba(255,68,68,0.18)', borderRadius: 5 }}>
                          <svg width="6" height="6" viewBox="0 0 6 6" fill="none"><path d="M1 1l4 4M5 1L1 5" stroke="#FF4444" strokeWidth="1.4" strokeLinecap="round" /></svg>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.28)', flex: 1, textAlign: 'center' }}>{si + 1}</div>
                      </div>
                      <div style={{ height: 36, borderRadius: 9, background: s.done ? `rgba(${rgb},0.08)` : 'rgba(255,255,255,0.05)', border: s.done ? `1px solid rgba(${rgb},0.2)` : '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <input type="number" inputMode="decimal" value={s.weight} onChange={e => updateSet(ei, si, 'weight', e.target.value)} placeholder={ex.last ? ex.last.replace(/[^0-9.]/g, '') || '0' : '0'} style={{ background: 'none', border: 'none', outline: 'none', color: s.done ? accent : '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', padding: '0 8px' }} />
                      </div>
                      <div style={{ height: 36, borderRadius: 9, background: s.done ? `rgba(${rgb},0.08)` : 'rgba(255,255,255,0.05)', border: s.done ? `1px solid rgba(${rgb},0.2)` : '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                        <input type="number" inputMode="numeric" value={s.reps} onChange={e => updateSet(ei, si, 'reps', e.target.value)} placeholder="0" style={{ background: 'none', border: 'none', outline: 'none', color: s.done ? accent : '#fff', fontSize: 14, fontWeight: 600, textAlign: 'center', width: '100%', padding: '0 8px' }} />
                      </div>
                      <div onClick={() => toggleDone(ei, si)} style={{ width: 32, height: 32, borderRadius: 10, background: s.done ? `rgba(${rgb},0.18)` : 'rgba(255,255,255,0.05)', border: s.done ? `1px solid rgba(${rgb},0.3)` : '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s' }}>
                        <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                          <path d="M1 5l4 4L12 1" stroke={s.done ? accent : 'rgba(255,255,255,0.2)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  ))}
                  <div onClick={() => addSet(ei)} style={{ margin: '6px 14px 12px', height: 34, borderRadius: 10, border: '1px dashed rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 6 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M6 1v10M1 6h10" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" /></svg>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.25)' }}>Add Set</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Exercise */}
      <div style={{ padding: '4px 12px 28px' }}>
        <div onClick={() => setShowAddEx(true)} style={{ height: 46, borderRadius: 14, border: `1px dashed rgba(${rgb},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', gap: 8 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1v12M1 7h12" stroke={`rgba(${rgb},0.5)`} strokeWidth="1.8" strokeLinecap="round" /></svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: `rgba(${rgb},0.55)` }}>Add Exercise</span>
        </div>
      </div>

      {/* Add Exercise Sheet */}
      {showAddEx && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 500, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', background: '#151515', borderRadius: '28px 28px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', display: 'flex', flexDirection: 'column', maxHeight: '75%' }}>
            <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>Add Exercise</div>
              <div onClick={() => { setShowAddEx(false); setExSearch(''); }} style={{ cursor: 'pointer', opacity: 0.4, padding: '4px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </div>
            </div>
            <div style={{ padding: '12px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '10px 14px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" /><path d="M10 10l3 3" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round" /></svg>
                <input value={exSearch} onChange={e => setExSearch(e.target.value)} placeholder="Search exercises" style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: 15, flex: 1, fontFamily: 'Outfit,sans-serif' }} />
              </div>
              <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
                {['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Quads', 'Hamstrings', 'Glutes', 'Core', 'Calves'].map(mg => (
                  <div key={mg} onClick={() => setExMuscle(mg)} style={{ padding: '5px 13px', borderRadius: 20, flexShrink: 0, cursor: 'pointer', background: exMuscle === mg ? (MC[mg] || accent) : 'rgba(255,255,255,0.06)', border: exMuscle === mg ? 'none' : '1px solid rgba(255,255,255,0.08)', fontSize: 12, fontWeight: 600, color: exMuscle === mg ? '#000' : 'rgba(255,255,255,0.45)', transition: 'all 0.15s' }}>{mg}</div>
                ))}
              </div>
            </div>
            <div style={{ overflowY: 'auto', padding: '4px 16px 32px' }}>
              {ALL_EXERCISES.filter(e => {
                const matchSearch = e.name.toLowerCase().includes(exSearch.toLowerCase()) || e.muscle.toLowerCase().includes(exSearch.toLowerCase());
                const matchMuscle = exMuscle === 'All' || e.muscle === exMuscle;
                return matchSearch && matchMuscle;
              }).map(e => {
                const mc2 = MC[e.muscle] || accent;
                return (
                  <div key={e.name} onClick={() => addExercise(e)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 11, background: `${mc2}18`, border: `1px solid ${mc2}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: mc2, flexShrink: 0 }}>{e.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', letterSpacing: -0.2 }}>{e.name}</div>
                      <div style={{ fontSize: 11.5, color: mc2, marginTop: 2, fontWeight: 500 }}>{e.muscle}</div>
                    </div>
                    <svg width="7" height="13" viewBox="0 0 7 13" fill="none"><path d="M1 1l5 5.5L1 12" stroke="rgba(255,255,255,0.15)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* End Confirm — FIX: added Discard Workout button */}
      {endConfirm && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 400, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div style={{ width: '100%', background: '#161616', borderRadius: '28px 28px 0 0', padding: '28px 22px 48px', border: '1px solid rgba(255,255,255,0.07)', borderBottom: 'none' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: -0.5 }}>Finish workout?</div>
            <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', marginBottom: 28, lineHeight: 1.5 }}>{doneSets} sets logged · {fmt(elapsed)} elapsed</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Save & Finish */}
              <div onClick={onEnd} style={{
                height: 54, borderRadius: 16,
                background: `linear-gradient(135deg,${accent},${THEMES['Crimson']?.p || accent})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                boxShadow: `0 6px 24px rgba(${rgb},0.3)`,
              }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#000' }}>Save & Finish</span>
              </div>
              {/* Keep Going */}
              <div onClick={() => setEndConfirm(false)} style={{
                height: 54, borderRadius: 16,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Keep Going</span>
              </div>
              {/* Discard Workout — NEW */}
              <div onClick={onEnd} style={{
                height: 46, borderRadius: 16,
                background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#f43f5e' }}>Discard Workout</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bottom Nav ──────────────────────────────────────────────
const NAV_ITEMS = [
  {
    id: 'home', draw: c => (
      <svg width="23" height="22" viewBox="0 0 23 22" fill="none">
        <path d="M2 11L11.5 3 21 11M4.5 9.5V19a1 1 0 001 1h4.5v-5h3v5h4.5a1 1 0 001-1V9.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'history', draw: c => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9" stroke={c} strokeWidth="1.8" />
        <path d="M11 6.5V11l3.5 3.5" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'calendar', draw: c => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="4" width="18" height="16" rx="3" stroke={c} strokeWidth="1.8" />
        <path d="M2 9.5h18M7 2v4M15 2v4" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <rect x="6" y="13" width="2.5" height="2.5" rx="0.6" fill={c} opacity="0.5" />
        <rect x="10.5" y="13" width="2.5" height="2.5" rx="0.6" fill={c} opacity="0.5" />
      </svg>
    ),
  },
  {
    id: 'awards', draw: c => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M6 3h10M8 3v5a3 3 0 006 0V3" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M5 3H3c0 3.5 2.2 5.5 5 6.2M17 3h2c0 3.5-2.2 5.5-5 6.2" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
        <path d="M11 14v4M8 18h6" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'settings', draw: c => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="3" stroke={c} strokeWidth="1.8" />
        <path d="M9.1 2.3L8 5.1 5.4 4 3.4 6.6l2.1 2.3a6 6 0 000 4.2L3.4 15.4 5.4 18l2.6-1.1 1.1 2.8h3.8l1.1-2.8L16.6 18l2-2.6-2.1-2.3a6 6 0 000-4.2l2.1-2.3L16.6 4l-2.6 1.1L12.9 2.3z" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function BottomNav({ tab, setTab, accent }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 82, zIndex: 40, background: 'rgba(11,11,11,0.93)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.045)', display: 'flex', alignItems: 'center', paddingBottom: 16 }}>
      {NAV_ITEMS.map(n => {
        const active = tab === n.id;
        const c = active ? accent : 'rgba(255,255,255,0.2)';
        return (
          <div key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', paddingTop: 2 }}>
            {n.draw(c)}
            {active && <div style={{ width: 5, height: 5, borderRadius: 3, background: accent }} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Home Screen ─────────────────────────────────────────────
function HomeScreen({ accent, unit, onRoutineTap, onStartPlan, onQuickStart }) {
  const rgb = h2r(accent);
  const hr = new Date().getHours();
  const greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div style={{ height: '100%', overflowY: 'auto', position: 'relative', zIndex: 10, paddingTop: 58, paddingBottom: 90 }}>
      <div style={{ padding: '0 22px' }}>
        <div style={{ marginTop: 10, marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontWeight: 400, letterSpacing: 0.2, marginBottom: 2, whiteSpace: 'nowrap' }}>{dateStr}</div>
            <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>{greet}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 11px', marginTop: 2 }}>
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M6.5 1C6.5 1 9 4 8.5 6.5C11 5.5 12 3 12 3C12 3 12 9 8 11.5C9 10 9 8.5 7.5 8C7.5 10 5 12 3 13C3 13 0 11 0 8C0 5.5 2 4 3.5 4C2.5 5.5 3 7 4.5 7C4.5 4.5 6.5 1 6.5 1Z" fill={`${accent}cc`} />
            </svg>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: accent, letterSpacing: 0.2 }}>5 days</span>
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <div style={{ lineHeight: 1, letterSpacing: -4, marginBottom: 0 }}>
            <span style={{ fontSize: 72, fontWeight: 700, letterSpacing: -4, background: `linear-gradient(140deg, #ffffff 10%, ${accent}dd 90%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>18</span>
            <span style={{ fontSize: 72, fontWeight: 200, letterSpacing: -4, color: 'rgba(255,255,255,0.28)' }}>,420</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 9 }}>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.28)', fontWeight: 400, letterSpacing: 0.1, whiteSpace: 'nowrap' }}>{unit} this week</span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: accent, background: `rgba(${rgb},0.13)`, border: `1px solid rgba(${rgb},0.22)`, borderRadius: 20, padding: '2px 9px', letterSpacing: 0.3, whiteSpace: 'nowrap', flexShrink: 0 }}>↑ 14%</span>
          </div>
        </div>

        <div style={{ marginBottom: 26 }}><WeeklyChart accent={accent} /></div>
        <div style={{ marginBottom: 26 }}><ActionTiles accent={accent} onStartPlan={onStartPlan} onQuickStart={onQuickStart} /></div>
        <div style={{ marginBottom: 26 }}><Lbl>This Week</Lbl><StatsRow unit={unit} /></div>
        <div style={{ marginBottom: 26 }}><Lbl>Muscle Focus</Lbl><MusclePills /></div>
        <div style={{ marginBottom: 12 }}>
          <Lbl>My Routines</Lbl>
          {ROUTINES.map((r, i) => (
            <RoutineRow key={r.name} r={r} isLast={i === ROUTINES.length - 1} onTap={() => onRoutineTap(r)} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Time Picker ─────────────────────────────────────────────
function TimePicker({ accent, onSet, onClear }) {
  const rgb = h2r(accent);
  const [ampm, setAmpm] = React.useState('AM');
  const [hour, setHour] = React.useState(6);
  const [minute, setMinute] = React.useState(0);
  const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const minutes = [0, 15, 30, 45];
  const Pill = ({ val, selected, onTap, label }) => (
    <div onClick={onTap} style={{ height: 40, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected ? `rgba(${rgb},0.22)` : 'rgba(255,255,255,0.05)', border: selected ? `1px solid rgba(${rgb},0.4)` : '1px solid rgba(255,255,255,0.07)', fontSize: 15, fontWeight: selected ? 700 : 400, color: selected ? accent : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.12s', userSelect: 'none' }}>{label || val}</div>
  );
  return (
    <div style={{ padding: '20px 20px 8px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 18 }}>
        {['AM', 'PM'].map(ap => (
          <div key={ap} onClick={() => setAmpm(ap)} style={{ height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ampm === ap ? `rgba(${rgb},0.2)` : 'rgba(255,255,255,0.04)', border: ampm === ap ? `1px solid rgba(${rgb},0.38)` : '1px solid rgba(255,255,255,0.07)', fontSize: 15, fontWeight: 700, color: ampm === ap ? accent : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.12s' }}>{ap}</div>
        ))}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Hour</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 16 }}>
        {hours.map(h => <Pill key={h} val={h} selected={hour === h} onTap={() => setHour(h)} />)}
      </div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8 }}>Minute</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 7, marginBottom: 22 }}>
        {minutes.map(m => <Pill key={m} val={m} selected={minute === m} onTap={() => setMinute(m)} label={`:${String(m).padStart(2, '0')}`} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div onClick={onClear} style={{ height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>Clear</div>
        <div onClick={() => onSet({ hour, minute, ampm })} style={{ height: 46, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `rgba(${rgb},0.2)`, border: `1px solid rgba(${rgb},0.38)`, fontSize: 15, fontWeight: 700, color: accent, cursor: 'pointer' }}>Set</div>
      </div>
    </div>
  );
}

// ─── Plan Workout Sheet ───────────────────────────────────────
function PlanWorkoutSheet({ dateKey, accent, onClose, onSave }) {
  const rgb = h2r(accent);
  const [step, setStep] = React.useState('routine');
  const [pickedRoutine, setPickedRoutine] = React.useState(null);
  const [pickedTime, setPickedTime] = React.useState(null);
  const fmt = (t) => t ? `${t.hour}:${String(t.minute).padStart(2, '0')} ${t.ampm}` : 'Set time';
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 600, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', background: '#151515', borderRadius: '28px 28px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', maxHeight: '88%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} /></div>
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>Plan Workout</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{dateKey}</div>
          </div>
          <div onClick={onClose} style={{ cursor: 'pointer', opacity: 0.35, padding: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          <div style={{ display: 'flex', padding: '14px 20px 10px', gap: 8 }}>
            {['Choose Routine', 'Set Time'].map((s, i) => {
              const active = (i === 0 && step === 'routine') || (i === 1 && step === 'time');
              return (
                <div key={s} onClick={() => setStep(i === 0 ? 'routine' : 'time')} style={{ padding: '6px 14px', borderRadius: 20, cursor: 'pointer', background: active ? `rgba(${rgb},0.15)` : 'rgba(255,255,255,0.05)', border: active ? `1px solid rgba(${rgb},0.3)` : '1px solid rgba(255,255,255,0.07)', fontSize: 12.5, fontWeight: 600, color: active ? accent : 'rgba(255,255,255,0.35)' }}>{s}</div>
              );
            })}
          </div>
          {step === 'routine' && (
            <div style={{ padding: '4px 20px 24px' }}>
              {ROUTINES.map(r => {
                const pc = MC[r.muscles[0]];
                const sel = pickedRoutine?.name === r.name;
                return (
                  <div key={r.name} onClick={() => setPickedRoutine(r)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', marginBottom: 8, background: sel ? `rgba(${rgb},0.1)` : 'rgba(255,255,255,0.03)', border: sel ? `1px solid rgba(${rgb},0.25)` : '1px solid rgba(255,255,255,0.06)', borderRadius: 16, cursor: 'pointer', transition: 'all 0.12s' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 13, background: `${pc}18`, border: `1px solid ${pc}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: pc, flexShrink: 0 }}>{r.name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.3, marginBottom: 4 }}>{r.name}</div>
                      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
                        {r.muscles.map((m, mi) => (
                          <React.Fragment key={m}>{mi > 0 && <div style={{ width: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />}<span style={{ fontSize: 11.5, color: MC[m], fontWeight: 500 }}>{m}</span></React.Fragment>
                        ))}
                      </div>
                    </div>
                    {sel && <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8l5 5L14 3" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                  </div>
                );
              })}
            </div>
          )}
          {step === 'time' && <TimePicker accent={accent} onSet={t => setPickedTime(t)} onClear={() => setPickedTime(null)} />}
        </div>
        <div style={{ padding: '12px 20px 36px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {pickedRoutine && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ color: MC[pickedRoutine.muscles[0]], fontWeight: 600 }}>{pickedRoutine.name}</span>
              {pickedTime && <><span style={{ opacity: 0.3 }}>·</span><span>{fmt(pickedTime)}</span></>}
            </div>
          )}
          <div onClick={() => { if (pickedRoutine) { onSave({ routine: pickedRoutine, time: pickedTime }); onClose(); } }}
            style={{ height: 52, borderRadius: 16, background: pickedRoutine ? `linear-gradient(135deg,${accent},${THEMES['Crimson']?.p || accent})` : 'rgba(255,255,255,0.05)', border: pickedRoutine ? 'none' : '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: pickedRoutine ? 'pointer' : 'default', transition: 'all 0.2s', boxShadow: pickedRoutine ? `0 6px 24px rgba(${rgb},0.3)` : 'none' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: pickedRoutine ? '#000' : 'rgba(255,255,255,0.2)' }}>Save Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Schedule Sheet ────────────────────────────────────
function CreateScheduleSheet({ accent, onClose }) {
  const rgb = h2r(accent);
  const [pickedDays, setPickedDays] = React.useState([]);
  const [pickedRoutines, setPickedRoutines] = React.useState({});
  const [pickedTime, setPickedTime] = React.useState(null);
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const toggleDay = d => setPickedDays(p => p.includes(d) ? p.filter(x => x !== d) : [...p, d]);
  const fmt = t => t ? `${t.hour}:${String(t.minute).padStart(2, '0')} ${t.ampm}` : null;
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 600, display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
      <div style={{ width: '100%', background: '#151515', borderRadius: '28px 28px 0 0', border: '1px solid rgba(255,255,255,0.08)', borderBottom: 'none', maxHeight: '90%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}><div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} /></div>
        <div style={{ padding: '14px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>Create Schedule</div>
          <div onClick={onClose} style={{ cursor: 'pointer', opacity: 0.35, padding: '6px' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="white" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </div>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '16px 20px 0' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Training Days</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginBottom: 22 }}>
            {DAYS.map(d => {
              const on = pickedDays.includes(d);
              return (
                <div key={d} onClick={() => toggleDay(d)} style={{ height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', background: on ? `rgba(${rgb},0.18)` : 'rgba(255,255,255,0.05)', border: on ? `1px solid rgba(${rgb},0.35)` : '1px solid rgba(255,255,255,0.07)', fontSize: 11.5, fontWeight: 700, color: on ? accent : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.12s' }}>{d}</div>
              );
            })}
          </div>
          {pickedDays.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Assign Routines</div>
              {pickedDays.map(d => (
                <div key={d} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>{d}</div>
                  <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
                    {ROUTINES.map(r => {
                      const sel = pickedRoutines[d]?.name === r.name;
                      return (
                        <div key={r.name} onClick={() => setPickedRoutines(p => ({ ...p, [d]: r }))} style={{ padding: '6px 14px', borderRadius: 20, flexShrink: 0, cursor: 'pointer', background: sel ? `rgba(${rgb},0.15)` : 'rgba(255,255,255,0.05)', border: sel ? `1px solid rgba(${rgb},0.3)` : '1px solid rgba(255,255,255,0.07)', fontSize: 12.5, fontWeight: 600, color: sel ? accent : 'rgba(255,255,255,0.35)' }}>{r.name}</div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 10 }}>Default Time</div>
            <TimePicker accent={accent} onSet={t => setPickedTime(t)} onClear={() => setPickedTime(null)} />
          </div>
        </div>
        <div style={{ padding: '12px 20px 36px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {(pickedDays.length > 0 || pickedTime) && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', marginBottom: 10 }}>{pickedDays.length} days · {fmt(pickedTime) || 'No time set'}</div>
          )}
          <div onClick={() => { if (pickedDays.length > 0) onClose(); }} style={{ height: 52, borderRadius: 16, background: pickedDays.length > 0 ? `linear-gradient(135deg,${accent},${THEMES['Crimson']?.p || accent})` : 'rgba(255,255,255,0.05)', border: pickedDays.length > 0 ? 'none' : '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: pickedDays.length > 0 ? `0 6px 24px rgba(${rgb},0.3)` : 'none' }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: pickedDays.length > 0 ? '#000' : 'rgba(255,255,255,0.2)' }}>Save Schedule</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── History Screen ───────────────────────────────────────────
function HistoryScreen({ accent }) {
  const rgb = h2r(accent);
  const [expanded, setExpanded] = React.useState({});
  const toggle = id => setExpanded(p => ({ ...p, [id]: !p[id] }));
  const sessionById = id => HISTORY.find(h => h.id === id);
  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 90, paddingTop: 58, animation: 'dialIn 0.25s ease' }}>
      <div style={{ padding: '10px 20px 20px' }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 20 }}>History</div>
        {WEEKS.map(week => (
          <div key={week.label} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: 1.3, textTransform: 'uppercase' }}>{week.label}</div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>{week.workouts} sessions</span>
                <span style={{ fontSize: 12, color: accent, fontWeight: 700, letterSpacing: 0.2 }}>{(week.vol / 1000).toFixed(1)}k lbs</span>
              </div>
            </div>
            {week.ids.map(id => {
              const s = sessionById(id);
              if (!s) return null;
              const isOpen = expanded[id];
              const hasPR = s.exercises.some(e => e.pr);
              const pc = MC[s.muscles[0]] || accent;
              return (
                <div key={id} style={{ marginBottom: 8, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 20, overflow: 'hidden' }}>
                  <div onClick={() => toggle(id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 13, flexShrink: 0, background: `${pc}18`, border: `1px solid ${pc}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: pc }}>{s.routine[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.3 }}>{s.routine}</span>
                        {hasPR && <span style={{ fontSize: 9.5, fontWeight: 800, color: accent, letterSpacing: 0.6, background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.25)`, borderRadius: 20, padding: '2px 7px', textTransform: 'uppercase' }}>PR</span>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {s.muscles.map((m, mi) => (
                          <React.Fragment key={m}>
                            {mi > 0 && <div style={{ width: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />}
                            <span style={{ fontSize: 11.5, fontWeight: 500, color: MC[m] }}>{m}</span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3, flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>{s.duration}</span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{s.sets} sets</span>
                    </div>
                    <svg width="8" height="13" viewBox="0 0 8 13" style={{ flexShrink: 0, transition: 'transform 0.2s', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>
                      <path d="M1 1l6 5.5L1 12" stroke="rgba(255,255,255,0.18)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {isOpen && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '4px 0 12px' }}>
                      <div style={{ display: 'flex', gap: 18, padding: '10px 16px 8px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{s.volume.toLocaleString()}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.8, textTransform: 'uppercase' }}>Total lbs</span>
                        </div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{s.sets}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.8, textTransform: 'uppercase' }}>Sets</span>
                        </div>
                        <div style={{ width: 1, background: 'rgba(255,255,255,0.07)' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{s.duration}</span>
                          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', letterSpacing: 0.8, textTransform: 'uppercase' }}>Time</span>
                        </div>
                      </div>
                      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '4px 16px 8px' }} />
                      {s.exercises.map((ex, ei) => {
                        const best = Math.max(...ex.sets.map(s => s.w));
                        return (
                          <div key={ex.name} style={{ padding: '9px 16px', borderBottom: ei < s.exercises.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.2 }}>{ex.name}</span>
                                {ex.pr && <span style={{ fontSize: 9, fontWeight: 800, color: accent, background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.22)`, borderRadius: 20, padding: '1px 6px', letterSpacing: 0.5 }}>PR</span>}
                              </div>
                              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>{ex.sets.length} sets</span>
                            </div>
                            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                              {ex.sets.map((set, si) => (
                                <div key={si} style={{ padding: '3px 9px', borderRadius: 8, background: set.w === best && ex.pr ? `rgba(${rgb},0.12)` : 'rgba(255,255,255,0.05)', border: set.w === best && ex.pr ? `1px solid rgba(${rgb},0.22)` : '1px solid rgba(255,255,255,0.06)', fontSize: 11.5, fontWeight: 600, color: set.w === best && ex.pr ? accent : 'rgba(255,255,255,0.45)' }}>{set.w} × {set.r}</div>
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
    </div>
  );
}

// ─── Calendar Screen ──────────────────────────────────────────
function CalendarScreen({ accent }) {
  const rgb = h2r(accent);
  const today = new Date(2026, 3, 19);
  const [curYear, setCurYear] = React.useState(2026);
  const [curMonth, setCurMonth] = React.useState(3);
  const [selected, setSelected] = React.useState(null);
  const [planDay, setPlanDay] = React.useState(null);
  const [planned, setPlanned] = React.useState({});
  const [showSched, setShowSched] = React.useState(false);
  const prevMonth = () => { if (curMonth === 0) { setCurMonth(11); setCurYear(y => y - 1); } else { setCurMonth(m => m - 1); } };
  const nextMonth = () => { if (curMonth === 11) { setCurMonth(0); setCurYear(y => y + 1); } else { setCurMonth(m => m + 1); } };
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const DAY_NAMES = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const firstDay = new Date(curYear, curMonth, 1).getDay();
  const daysInMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const keyFor = d => d ? `${curYear}-${String(curMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` : null;
  const isToday = d => d === today.getDate() && curMonth === today.getMonth() && curYear === today.getFullYear();
  const isFuture = d => { if (!d) return false; return new Date(curYear, curMonth, d) > today; };
  const allWorkouts = { ...CAL_WORKOUTS, ...planned };
  const selW = selected && allWorkouts[selected];
  const monthKeys = Object.keys(allWorkouts).filter(k => k.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`));
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', paddingTop: 58, paddingBottom: 82, animation: 'dialIn 0.25s ease', position: 'relative' }}>
      <div style={{ padding: '10px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>Calendar</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '5px 11px' }}>
            <svg width="11" height="13" viewBox="0 0 12 14" fill="none"><path d="M6.5 1C6.5 1 9 4 8.5 6.5C11 5.5 12 3 12 3C12 3 12 9 8 11.5C9 10 9 8.5 7.5 8C7.5 10 5 12 3 13C3 13 0 11 0 8C0 5.5 2 4 3.5 4C2.5 5.5 3 7 4.5 7C4.5 4.5 6.5 1 6.5 1Z" fill={`${accent}cc`} /></svg>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: accent }}>5 days</span>
          </div>
          <div onClick={() => setShowSched(true)} style={{ width: 36, height: 36, borderRadius: 12, cursor: 'pointer', background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.28)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke={accent} strokeWidth="2" strokeLinecap="round" /></svg>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px 10px' }}>
        <div onClick={prevMonth} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M6 1L1 6l5 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: -0.2 }}>{MONTH_NAMES[curMonth]} {curYear}</div>
        <div onClick={nextMonth} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="7" height="12" viewBox="0 0 7 12" fill="none"><path d="M1 1l5 5-5 5" stroke="rgba(255,255,255,0.5)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '0 10px', marginBottom: 4 }}>
        {DAY_NAMES.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.2)', letterSpacing: 0.4, padding: '2px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '5px', padding: '0 10px' }}>
        {cells.map((d, i) => {
          const key = keyFor(d);
          const w = key && allWorkouts[key];
          const today_ = isToday(d);
          const isSel = key && key === selected;
          const future = isFuture(d);
          const pc = w ? (MC[w.muscles[0]] || accent) : null;
          const isPlanned = key && planned[key];
          return (
            <div key={i} onClick={() => { if (!d) return; if (w) setSelected(key); else if (future) { setPlanDay(key); setSelected(null); } }} style={{ height: 52, borderRadius: 13, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: d ? 'pointer' : 'default', background: isSel ? `rgba(${rgb},0.18)` : today_ ? 'rgba(255,255,255,0.07)' : future && !w ? 'rgba(255,255,255,0.02)' : 'transparent', border: isSel ? `1px solid rgba(${rgb},0.35)` : today_ ? '1px solid rgba(255,255,255,0.1)' : future ? '1px dashed rgba(255,255,255,0.06)' : '1px solid transparent', transition: 'all 0.13s' }}>
              {d && <>
                <span style={{ fontSize: 15, fontWeight: today_ || isSel ? 700 : w ? 500 : 400, color: isSel ? accent : today_ ? '#fff' : w ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.22)', lineHeight: 1 }}>{d}</span>
                {w ? <div style={{ width: 5, height: 5, borderRadius: 3, background: isSel ? accent : pc, opacity: isSel ? 1 : isPlanned ? 0.5 : 0.7, boxShadow: isSel ? `0 0 6px ${accent}` : 'none', border: isPlanned ? `1px dashed ${pc}` : 'none' }} /> : future ? <div style={{ width: 5, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }} /> : null}
              </>}
            </div>
          );
        })}
      </div>
      <div style={{ display: 'flex', gap: 0, margin: '12px 10px 0', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
        {[
          { l: 'Workouts', v: monthKeys.length },
          { l: 'Volume', v: (Object.entries(allWorkouts).filter(([k]) => k.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`)).reduce((a, [, w]) => a + (w.volume || 0), 0) / 1000).toFixed(0) + 'k' },
          { l: 'PRs', v: Object.entries(allWorkouts).filter(([k, w]) => k.startsWith(`${curYear}-${String(curMonth + 1).padStart(2, '0')}`) && w.pr).length },
        ].map((s, i) => (
          <React.Fragment key={s.l}>
            {i > 0 && <div style={{ width: 1, background: 'rgba(255,255,255,0.05)' }} />}
            <div style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: -0.5 }}>{s.v}</span>
              <span style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.22)', letterSpacing: 0.8, textTransform: 'uppercase' }}>{s.l}</span>
            </div>
          </React.Fragment>
        ))}
      </div>
      {selW && (
        <div style={{ margin: '10px 10px 0', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 18, padding: '14px', animation: 'fadeIn 0.18s ease', flex: 1, overflowY: 'auto', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 5 }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: -0.4 }}>{selW.routine}</span>
                {selW.pr && <span style={{ fontSize: 9, fontWeight: 800, color: accent, background: `rgba(${rgb},0.14)`, border: `1px solid rgba(${rgb},0.25)`, borderRadius: 20, padding: '2px 7px', letterSpacing: 0.5 }}>PR</span>}
                {selW.planned && <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.06)', borderRadius: 20, padding: '2px 7px', letterSpacing: 0.4 }}>PLANNED</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {selW.muscles.map((m, mi) => (
                  <React.Fragment key={m}>{mi > 0 && <div style={{ width: 3, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.12)' }} />}<span style={{ fontSize: 11.5, fontWeight: 500, color: MC[m] }}>{m}</span></React.Fragment>
                ))}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              {selW.time && <div style={{ fontSize: 13, fontWeight: 600, color: accent, marginBottom: 3 }}>{selW.time.hour}:{String(selW.time.minute).padStart(2, '0')} {selW.time.ampm}</div>}
              {selW.duration && <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{selW.duration}</div>}
              {selW.sets && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 1 }}>{selW.sets} sets</div>}
            </div>
          </div>
          {selW.volume > 0 && (
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 10 }}>
              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
                <div style={{ height: '100%', width: `${Math.round((selW.volume / 20000) * 100)}%`, background: `linear-gradient(90deg,${accent},${THEMES['Crimson']?.p || accent})`, borderRadius: 2 }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)' }}>{selW.volume.toLocaleString()} lbs total volume</div>
            </div>
          )}
        </div>
      )}
      {planDay && <PlanWorkoutSheet dateKey={planDay} accent={accent} onClose={() => setPlanDay(null)} onSave={({ routine, time }) => { setPlanned(p => ({ ...p, [planDay]: { routine: routine.name, muscles: routine.muscles, volume: 0, sets: 0, planned: true, time } })); setSelected(planDay); setPlanDay(null); }} />}
      {showSched && <CreateScheduleSheet accent={accent} onClose={() => setShowSched(false)} />}
    </div>
  );
}

// ─── Awards Screen ────────────────────────────────────────────
function AwardsScreen({ accent }) {
  const rgb = h2r(accent);
  const MILESTONES = [
    { label: 'Total Workouts', value: 47, target: 50,   unit: 'sessions', icon: '🏋️', unlocked: true,  color: '#60a5fa' },
    { label: 'Total Volume',   value: 842, target: 1000, unit: 'k lbs',   icon: '⚡', unlocked: true,  color: '#facc15' },
    { label: 'Longest Streak', value: 7,  target: 10,   unit: 'days',     icon: '🔥', unlocked: true,  color: '#fb923c' },
    { label: 'PRs This Month', value: 6,  target: 10,   unit: 'records',  icon: '🎯', unlocked: true,  color: '#34d399' },
    { label: '100 Sessions',   value: 47, target: 100,  unit: 'sessions', icon: '💎', unlocked: false, color: '#a78bfa' },
    { label: 'Iron Streak',    value: 7,  target: 30,   unit: 'days',     icon: '⚔️', unlocked: false, color: '#f43f5e' },
  ];
  const BADGES = [
    { name: 'First Rep',    desc: 'Logged your first workout',   earned: true,  color: '#34d399', icon: '▶' },
    { name: 'Week Warrior', desc: '7 workouts in a single week', earned: true,  color: '#60a5fa', icon: '🗓' },
    { name: 'PR Machine',   desc: 'Set 5 personal records',      earned: true,  color: '#facc15', icon: '⚡' },
    { name: 'Iron Will',    desc: '30-day streak',               earned: false, color: '#f43f5e', icon: '🔥' },
    { name: 'Volume King',  desc: '1,000,000 lbs total volume',  earned: false, color: '#a78bfa', icon: '👑' },
    { name: 'Century Club', desc: 'Complete 100 workouts',       earned: false, color: '#fb923c', icon: '💯' },
  ];
  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 90, paddingTop: 58, animation: 'dialIn 0.25s ease' }}>
      <div style={{ padding: '10px 20px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 4 }}>Awards</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>Your lifting legacy</div>
        </div>
        {/* Streak card */}
        <div style={{ borderRadius: 24, background: `linear-gradient(145deg, rgba(${rgb},0.16) 0%, rgba(${rgb},0.04) 100%)`, border: `1px solid rgba(${rgb},0.2)`, padding: '22px 22px 18px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -20, width: 140, height: 140, borderRadius: '50%', background: `rgba(${rgb},0.18)`, filter: 'blur(50px)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.28)', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 }}>Current Streak</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 52, fontWeight: 700, color: '#fff', letterSpacing: -2, lineHeight: 1 }}>5</span>
                  <span style={{ fontSize: 18, fontWeight: 300, color: 'rgba(255,255,255,0.35)' }}>days</span>
                </div>
              </div>
              <div style={{ width: 52, height: 52, borderRadius: 18, background: `rgba(${rgb},0.18)`, border: `1px solid rgba(${rgb},0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🔥</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[...Array(7)].map((_, i) => {
                const filled = i < 5;
                return <div key={i} style={{ flex: 1, height: 6, borderRadius: 3, background: filled ? `rgba(${rgb},0.8)` : 'rgba(255,255,255,0.07)', boxShadow: filled ? `0 0 8px rgba(${rgb},0.5)` : 'none', transition: 'all 0.3s' }} />;
              })}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 8 }}>5 of 7 days this week · Best: 7 days</div>
          </div>
        </div>
        {/* PRs */}
        <div style={{ marginBottom: 28 }}>
          <Lbl>Personal Records</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ALL_PRS.map((pr, i) => {
              const mc = MC[pr.muscle] || accent;
              return (
                <div key={pr.exercise} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, animation: `popIn 0.3s ease ${i * 0.05}s both` }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, background: `${mc}18`, border: `1px solid ${mc}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: mc }}>PR</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', letterSpacing: -0.2, marginBottom: 3 }}>{pr.exercise}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 400 }}>{pr.date} · <span style={{ color: mc, fontWeight: 600 }}>{pr.muscle}</span></div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: -0.3 }}>{pr.weight}<span style={{ fontSize: 11, fontWeight: 400, color: 'rgba(255,255,255,0.35)', marginLeft: 2 }}>lbs</span></div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 1 }}>{pr.reps} reps</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Milestones */}
        <div style={{ marginBottom: 28 }}>
          <Lbl>Milestones</Lbl>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {MILESTONES.map(m => {
              const pct = Math.min((m.value / m.target) * 100, 100);
              const mRgb = h2r(m.color);
              return (
                <div key={m.label} style={{ padding: '14px 16px', background: m.unlocked ? `linear-gradient(135deg, rgba(${mRgb},0.1) 0%, rgba(${mRgb},0.03) 100%)` : 'rgba(255,255,255,0.02)', border: m.unlocked ? `1px solid rgba(${mRgb},0.18)` : '1px solid rgba(255,255,255,0.05)', borderRadius: 18, opacity: m.unlocked ? 1 : 0.55 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: m.unlocked ? '#fff' : 'rgba(255,255,255,0.5)', letterSpacing: -0.2 }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginTop: 1 }}>{m.value.toLocaleString()} / {m.target.toLocaleString()} {m.unit}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: m.unlocked ? m.color : 'rgba(255,255,255,0.2)', background: m.unlocked ? `rgba(${mRgb},0.15)` : 'rgba(255,255,255,0.05)', border: m.unlocked ? `1px solid rgba(${mRgb},0.25)` : '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '3px 10px' }}>{Math.round(pct)}%</div>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: m.unlocked ? `linear-gradient(90deg, ${m.color}, ${m.color}99)` : 'rgba(255,255,255,0.1)', borderRadius: 2, boxShadow: m.unlocked ? `0 0 10px rgba(${mRgb},0.5)` : 'none', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Badges */}
        <div style={{ marginBottom: 12 }}>
          <Lbl>Badges</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {BADGES.map(b => {
              const bRgb = h2r(b.color);
              return (
                <div key={b.name} style={{ padding: '16px 14px', background: b.earned ? `linear-gradient(145deg, rgba(${bRgb},0.14) 0%, rgba(${bRgb},0.04) 100%)` : 'rgba(255,255,255,0.02)', border: b.earned ? `1px solid rgba(${bRgb},0.22)` : '1px solid rgba(255,255,255,0.05)', borderRadius: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, textAlign: 'center', opacity: b.earned ? 1 : 0.45, position: 'relative', overflow: 'hidden' }}>
                  {b.earned && <div style={{ position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', width: 60, height: 30, borderRadius: '50%', background: `rgba(${bRgb},0.3)`, filter: 'blur(20px)', pointerEvents: 'none' }} />}
                  <div style={{ width: 44, height: 44, borderRadius: 16, background: b.earned ? `rgba(${bRgb},0.18)` : 'rgba(255,255,255,0.05)', border: b.earned ? `1px solid rgba(${bRgb},0.3)` : '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, position: 'relative', zIndex: 1 }}>{b.earned ? b.icon : '🔒'}</div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: b.earned ? '#fff' : 'rgba(255,255,255,0.35)', letterSpacing: -0.2, marginBottom: 3 }}>{b.name}</div>
                    <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', lineHeight: 1.4 }}>{b.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Screen ──────────────────────────────────────────
function SettingsScreen({ accent, tw, onTwChange }) {
  const rgb = h2r(accent);
  const SettingsRow = ({ label, sub, children, last }) => (
    <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: last ? 'none' : '1px solid rgba(255,255,255,0.04)', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
  const Toggle = ({ value, onChange }) => {
    const rgb2 = h2r(accent);
    return (
      <div onClick={() => onChange(!value)} style={{ width: 44, height: 26, borderRadius: 13, flexShrink: 0, background: value ? `rgba(${rgb2},0.9)` : 'rgba(255,255,255,0.1)', border: value ? `1px solid rgba(${rgb2},1)` : '1px solid rgba(255,255,255,0.12)', position: 'relative', cursor: 'pointer', transition: 'all 0.2s', boxShadow: value ? `0 0 12px rgba(${rgb2},0.4)` : 'none' }}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: '#fff', position: 'absolute', top: 2, left: value ? 21 : 2, transition: 'left 0.2s cubic-bezier(0.34,1.56,0.64,1)', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
      </div>
    );
  };
  const [notifs, setNotifs] = React.useState(true);
  const [haptics, setHaptics] = React.useState(true);
  const [restTimer, setRestTimer] = React.useState(false);
  const [showProfile, setShowProfile] = React.useState(false);
  const themeKeys = Object.keys(THEMES);
  return (
    <div style={{ height: '100%', overflowY: 'auto', paddingBottom: 90, paddingTop: 58, animation: 'dialIn 0.25s ease' }}>
      <div style={{ padding: '10px 20px 24px' }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#fff', letterSpacing: -0.5, marginBottom: 4 }}>Settings</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>Customize your experience</div>
        </div>
        {/* Profile */}
        <div onClick={() => setShowProfile(p => !p)} style={{ borderRadius: 22, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', padding: '16px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'opacity 0.1s' }}>
          <div style={{ width: 52, height: 52, borderRadius: 18, flexShrink: 0, background: `linear-gradient(145deg, rgba(${rgb},0.3), rgba(${rgb},0.1))`, border: `1px solid rgba(${rgb},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, color: accent }}>A</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: -0.3, marginBottom: 2 }}>Athlete</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>47 workouts · 5-day streak</div>
          </div>
          <svg width="7" height="13" viewBox="0 0 7 13" fill="none">
            <path d={showProfile ? 'M6 1L1 6.5 6 12' : 'M1 1l5 5.5L1 12'} stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        {/* Appearance */}
        <div style={{ marginBottom: 16 }}>
          <Lbl>Appearance</Lbl>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 20, overflow: 'hidden' }}>
            <SettingsRow label="Accent Color" sub="Theme for highlights and buttons">
              <div style={{ display: 'flex', gap: 6 }}>
                {themeKeys.map(k => {
                  const c = THEMES[k].p;
                  const active = tw.theme === k;
                  return <div key={k} onClick={() => onTwChange({ ...tw, theme: k })} style={{ width: 22, height: 22, borderRadius: 8, background: c, border: active ? '2px solid #fff' : '2px solid transparent', cursor: 'pointer', boxShadow: active ? `0 0 10px ${c}` : 'none', transition: 'all 0.15s', flexShrink: 0 }} />;
                })}
              </div>
            </SettingsRow>
            <SettingsRow label="Beam Intensity" sub={`Ambient glow — ${tw.beamIntensity}%`} last>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: 140, flexShrink: 0 }}>
                <input type="range" min="0" max="100" value={tw.beamIntensity} onChange={e => onTwChange({ ...tw, beamIntensity: +e.target.value })} style={{ flex: 1, accentColor: accent, cursor: 'pointer' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: accent, minWidth: 30, textAlign: 'right' }}>{tw.beamIntensity}%</span>
              </div>
            </SettingsRow>
          </div>
        </div>
        {/* Units */}
        <div style={{ marginBottom: 16 }}>
          <Lbl>Units & Tracking</Lbl>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 20, overflow: 'hidden' }}>
            <SettingsRow label="Weight Unit" sub="Used throughout the app">
              <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                {['lbs', 'kg'].map(u => (
                  <div key={u} onClick={() => onTwChange({ ...tw, unit: u })} style={{ padding: '6px 16px', background: tw.unit === u ? `rgba(${rgb},0.2)` : 'transparent', color: tw.unit === u ? accent : 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', borderRight: u === 'lbs' ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>{u}</div>
                ))}
              </div>
            </SettingsRow>
            <SettingsRow label="Rest Timer" sub="Auto-start after completing a set">
              <Toggle value={restTimer} onChange={setRestTimer} />
            </SettingsRow>
          </div>
        </div>
        {/* Notifications */}
        <div style={{ marginBottom: 16 }}>
          <Lbl>Notifications</Lbl>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 20, overflow: 'hidden' }}>
            <SettingsRow label="Workout Reminders" sub="Daily push notifications">
              <Toggle value={notifs} onChange={setNotifs} />
            </SettingsRow>
            <SettingsRow label="Haptic Feedback" sub="Vibration on set completion" last>
              <Toggle value={haptics} onChange={setHaptics} />
            </SettingsRow>
          </div>
        </div>
        {/* Data */}
        <div style={{ marginBottom: 16 }}>
          <Lbl>Data</Lbl>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 20, overflow: 'hidden' }}>
            {[
              { label: 'Export Workout Data', sub: 'Download as CSV', icon: '↓' },
              { label: 'Import Workouts', sub: 'From Apple Health or CSV', icon: '↑' },
              { label: 'Sync to Health App', sub: 'Share volume & calories', icon: '♡', last: true },
            ].map(item => (
              <div key={item.label} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: item.last ? 'none' : '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontSize: 14.5, fontWeight: 500, color: 'rgba(255,255,255,0.85)', letterSpacing: -0.2 }}>{item.label}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.28)', marginTop: 2 }}>{item.sub}</div>
                </div>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: accent, fontWeight: 700 }}>{item.icon}</div>
              </div>
            ))}
          </div>
        </div>
        {/* About */}
        <div style={{ marginBottom: 24 }}>
          <Lbl>About</Lbl>
          <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 20, overflow: 'hidden' }}>
            <SettingsRow label="Version" sub="Dialed v2.0">
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>Current</span>
            </SettingsRow>
            <SettingsRow label="Rate Dialed" last>
              <div style={{ display: 'flex', gap: 2 }}>
                {[...Array(5)].map((_, i) => <span key={i} style={{ fontSize: 14, color: accent }}>★</span>)}
              </div>
            </SettingsRow>
          </div>
        </div>
        {/* Sign out */}
        <div style={{ height: 50, borderRadius: 16, background: 'rgba(244,63,94,0.07)', border: '1px solid rgba(244,63,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f43f5e', letterSpacing: -0.2 }}>Sign Out</span>
        </div>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const saved = (() => { try { return JSON.parse(localStorage.getItem('dialed_tw') || '{}'); } catch (e) { return {}; } })();
  const [tw, setTw] = React.useState({ ...TWEAK_DEFAULTS, ...saved });
  const [tab, setTab] = React.useState(() => localStorage.getItem('dialed_tab') || 'home');
  const [openRoutine, setOpenRoutine] = React.useState(null);
  const [activeWorkout, setActiveWorkout] = React.useState(null);

  const accent = THEMES[tw.theme]?.p || '#34d399';

  const saveTw = t => {
    setTw(t);
    localStorage.setItem('dialed_tw', JSON.stringify(t));
  };
  const changeTab = id => { setTab(id); localStorage.setItem('dialed_tab', id); };

  // Quick Start: open a blank "Free Workout" session with no preset exercises
  const handleQuickStart = () => {
    setActiveWorkout({
      name: 'Free Workout',
      muscles: ['Full Body'],
      exercises: [],
    });
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <PhoneFrame>
        <BeamsCanvas accent={accent} intensity={tw.beamIntensity} />
        <FilmGrain />
        <StatusBar />
        {tab === 'home' && (
          <HomeScreen
            accent={accent}
            unit={tw.unit}
            onRoutineTap={r => setOpenRoutine(r)}
            onStartPlan={() => setActiveWorkout(ROUTINES[0])}
            onQuickStart={handleQuickStart}
          />
        )}
        {tab === 'history'  && <HistoryScreen accent={accent} />}
        {tab === 'calendar' && <CalendarScreen accent={accent} />}
        {tab === 'awards'   && <AwardsScreen accent={accent} />}
        {tab === 'settings' && <SettingsScreen accent={accent} tw={tw} onTwChange={saveTw} />}
        {openRoutine && (
          <RoutineSheet
            r={openRoutine}
            accent={accent}
            onClose={() => setOpenRoutine(null)}
            onStart={r => { setOpenRoutine(null); setActiveWorkout(r); }}
          />
        )}
        {activeWorkout && (
          <WorkoutScreen
            routine={activeWorkout}
            accent={accent}
            onEnd={() => setActiveWorkout(null)}
          />
        )}
        <BottomNav tab={tab} setTab={changeTab} accent={accent} />
      </PhoneFrame>
    </div>
  );
}
