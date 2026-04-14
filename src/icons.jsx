// icons.jsx — Dialed Custom SVG Exercise Icons
// Each icon is minimal line art, stroke 1.2-1.5px, round linecap

import React from "react";

const s = { strokeLinecap: "round", strokeLinejoin: "round", fill: "none" };

// Helper: wraps icon SVG content
const I = (d, sw = 1.3) => (
  <svg viewBox="0 0 24 24" width="100%" height="100%" style={{ display: "block" }}>
    <g stroke="currentColor" strokeWidth={sw} {...s}>
      {d}
    </g>
  </svg>
);

const icons = {
  // ── CHEST ──
  bench_press: () =>
    I(
      <>
        <line x1="4" y1="12" x2="20" y2="12" />
        <rect x="2" y="10" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="19" y="10" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="8" y1="8" x2="8" y2="16" />
        <line x1="16" y1="8" x2="16" y2="16" />
        <line x1="8" y1="8" x2="16" y2="8" />
      </>
    ),
  incline_bench: () =>
    I(
      <>
        <line x1="5" y1="14" x2="19" y2="10" />
        <rect x="2" y="12.5" width="3" height="3.5" rx="0.5" fill="currentColor" opacity="0.25" transform="rotate(-12 3.5 14)" />
        <rect x="19" y="8.5" width="3" height="3.5" rx="0.5" fill="currentColor" opacity="0.25" transform="rotate(-12 20.5 10)" />
        <line x1="8" y1="7" x2="6" y2="17" />
        <line x1="16" y1="5" x2="18" y2="15" />
      </>
    ),
  decline_bench: () =>
    I(
      <>
        <line x1="5" y1="10" x2="19" y2="14" />
        <rect x="2" y="8.5" width="3" height="3.5" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="19" y="12.5" width="3" height="3.5" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="8" y1="7" x2="8" y2="17" />
        <line x1="16" y1="7" x2="16" y2="17" />
      </>
    ),
  db_bench: () =>
    I(
      <>
        <rect x="3" y="10" width="4" height="4" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="17" y="10" width="4" height="4" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="7" y1="12" x2="10" y2="12" />
        <line x1="14" y1="12" x2="17" y2="12" />
        <circle cx="12" cy="16" r="1.5" />
      </>
    ),
  db_incline_bench: () =>
    I(
      <>
        <rect x="3" y="8" width="4" height="4" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="17" y="8" width="4" height="4" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="7" y1="10" x2="10" y2="12" />
        <line x1="14" y1="12" x2="17" y2="10" />
        <line x1="10" y1="14" x2="12" y2="19" />
        <line x1="14" y1="14" x2="12" y2="19" />
      </>
    ),
  db_fly: () =>
    I(
      <>
        <rect x="2" y="10" width="3.5" height="3.5" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="18.5" y="10" width="3.5" height="3.5" rx="1" fill="currentColor" opacity="0.2" />
        <path d="M5.5 11.5 C8 8, 16 8, 18.5 11.5" />
        <circle cx="12" cy="17" r="1" />
      </>
    ),
  cable_fly: () =>
    I(
      <>
        <line x1="3" y1="4" x2="3" y2="20" />
        <line x1="21" y1="4" x2="21" y2="20" />
        <path d="M3 6 C8 12, 12 14, 12 14" />
        <path d="M21 6 C16 12, 12 14, 12 14" />
        <circle cx="12" cy="14" r="1.5" />
      </>
    ),
  chest_dip: () =>
    I(
      <>
        <line x1="6" y1="6" x2="6" y2="18" />
        <line x1="18" y1="6" x2="18" y2="18" />
        <circle cx="12" cy="7" r="2" />
        <line x1="12" y1="9" x2="12" y2="15" />
        <line x1="12" y1="10" x2="6" y2="8" />
        <line x1="12" y1="10" x2="18" y2="8" />
        <line x1="12" y1="15" x2="10" y2="19" />
        <line x1="12" y1="15" x2="14" y2="19" />
      </>
    ),
  push_up: () =>
    I(
      <>
        <circle cx="6" cy="10" r="1.5" />
        <line x1="7" y1="11.5" x2="14" y2="13" />
        <line x1="14" y1="13" x2="18" y2="17" />
        <line x1="7" y1="12" x2="5" y2="16" />
        <line x1="5" y1="16" x2="5" y2="18" />
        <line x1="18" y1="17" x2="20" y2="17" />
      </>
    ),
  machine_chest_press: () =>
    I(
      <>
        <rect x="3" y="6" width="4" height="12" rx="1" strokeWidth="1" />
        <line x1="7" y1="12" x2="14" y2="12" />
        <circle cx="16" cy="12" r="2.5" />
        <line x1="18.5" y1="12" x2="21" y2="12" />
        <rect x="14" y="10.5" width="1.5" height="3" rx="0.5" fill="currentColor" opacity="0.3" />
      </>
    ),
  pec_deck: () =>
    I(
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M9 12 C6 8, 4 10, 4 12 C4 14, 6 16, 9 12" />
        <path d="M15 12 C18 8, 20 10, 20 12 C20 14, 18 16, 15 12" />
      </>
    ),

  // ── BACK ──
  deadlift: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="12" y1="13" x2="9" y2="19" />
        <line x1="12" y1="13" x2="15" y2="19" />
        <line x1="5" y1="14" x2="19" y2="14" />
        <rect x="3" y="12.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="18.5" y="12.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
      </>
    ),
  barbell_row: () =>
    I(
      <>
        <circle cx="10" cy="6" r="1.5" />
        <path d="M10 7.5 L10 11 L7 16" />
        <line x1="10" y1="11" x2="14" y2="16" />
        <line x1="4" y1="17" x2="18" y2="15" />
        <rect x="2" y="15.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="18" y="13.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="10" y1="9" x2="14" y2="15" />
      </>
    ),
  pull_up: () =>
    I(
      <>
        <line x1="4" y1="4" x2="20" y2="4" />
        <line x1="4" y1="4" x2="4" y2="7" />
        <line x1="20" y1="4" x2="20" y2="7" />
        <circle cx="12" cy="8.5" r="2" />
        <line x1="12" y1="10.5" x2="12" y2="16" />
        <line x1="12" y1="11" x2="8" y2="6" />
        <line x1="12" y1="11" x2="16" y2="6" />
        <line x1="12" y1="16" x2="10" y2="20" />
        <line x1="12" y1="16" x2="14" y2="20" />
      </>
    ),
  chin_up: () =>
    I(
      <>
        <line x1="4" y1="4" x2="20" y2="4" />
        <circle cx="12" cy="8" r="2" />
        <line x1="12" y1="10" x2="12" y2="16" />
        <path d="M12 11 L9 6 L9 4" />
        <path d="M12 11 L15 6 L15 4" />
        <line x1="12" y1="16" x2="10" y2="20" />
        <line x1="12" y1="16" x2="14" y2="20" />
      </>
    ),
  lat_pulldown: () =>
    I(
      <>
        <line x1="6" y1="4" x2="18" y2="4" />
        <line x1="12" y1="4" x2="12" y2="7" />
        <circle cx="12" cy="11" r="2" />
        <line x1="12" y1="13" x2="12" y2="18" />
        <line x1="12" y1="14" x2="7" y2="6" />
        <line x1="12" y1="14" x2="17" y2="6" />
        <line x1="10" y1="18" x2="14" y2="18" />
      </>
    ),
  seated_row: () =>
    I(
      <>
        <line x1="3" y1="8" x2="3" y2="18" />
        <circle cx="10" cy="10" r="1.5" />
        <line x1="10" y1="11.5" x2="10" y2="16" />
        <line x1="10" y1="13" x2="3" y2="11" />
        <line x1="10" y1="16" x2="8" y2="19" />
        <line x1="10" y1="16" x2="13" y2="19" />
        <line x1="3" y1="11" x2="3" y2="13" />
        <line x1="17" y1="10" x2="17" y2="16" />
        <rect x="16" y="8" width="2" height="3" rx="0.5" fill="currentColor" opacity="0.2" />
      </>
    ),
  db_row: () =>
    I(
      <>
        <circle cx="8" cy="7" r="1.5" />
        <path d="M8 8.5 L8 12 L5 17" />
        <line x1="8" y1="12" x2="12" y2="17" />
        <line x1="8" y1="10" x2="12" y2="15" />
        <rect x="11" y="14" width="3" height="3" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="16" y1="10" x2="20" y2="10" />
        <line x1="16" y1="10" x2="16" y2="17" />
      </>
    ),
  t_bar_row: () =>
    I(
      <>
        <line x1="3" y1="18" x2="18" y2="12" />
        <rect x="16" y="10.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <circle cx="14" cy="7" r="1.5" />
        <line x1="14" y1="8.5" x2="14" y2="13" />
        <line x1="14" y1="11" x2="18" y2="13" />
      </>
    ),
  face_pull: () =>
    I(
      <>
        <line x1="3" y1="6" x2="3" y2="18" />
        <circle cx="14" cy="9" r="2" />
        <line x1="3" y1="10" x2="10" y2="10" />
        <line x1="10" y1="10" x2="12" y2="9" />
        <line x1="14" y1="11" x2="14" y2="16" />
        <line x1="14" y1="13" x2="11" y2="10" />
        <line x1="14" y1="13" x2="17" y2="10" />
      </>
    ),
  rack_pull: () =>
    I(
      <>
        <line x1="5" y1="8" x2="5" y2="18" />
        <line x1="19" y1="8" x2="19" y2="18" />
        <line x1="5" y1="13" x2="19" y2="13" />
        <rect x="3" y="11.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="18" y="11.5" width="3" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <circle cx="12" cy="8" r="1.5" />
        <line x1="12" y1="9.5" x2="12" y2="13" />
      </>
    ),
  cable_pullover: () =>
    I(
      <>
        <line x1="12" y1="3" x2="12" y2="6" />
        <line x1="8" y1="3" x2="16" y2="3" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 6 C12 8, 12 10, 12 10" />
        <line x1="12" y1="14" x2="12" y2="19" />
        <line x1="10" y1="19" x2="14" y2="19" />
      </>
    ),

  // ── SHOULDERS ──
  ohp: () =>
    I(
      <>
        <circle cx="12" cy="11" r="2" />
        <line x1="12" y1="13" x2="12" y2="19" />
        <line x1="5" y1="5" x2="19" y2="5" />
        <rect x="3" y="3.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="18.5" y="3.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="14" x2="8" y2="6" />
        <line x1="12" y1="14" x2="16" y2="6" />
        <line x1="10" y1="19" x2="14" y2="19" />
      </>
    ),
  db_shoulder_press: () =>
    I(
      <>
        <circle cx="12" cy="12" r="2" />
        <line x1="12" y1="14" x2="12" y2="19" />
        <rect x="4" y="4" width="3" height="3" rx="1" fill="currentColor" opacity="0.2" />
        <rect x="17" y="4" width="3" height="3" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="13" x2="5.5" y2="7" />
        <line x1="12" y1="13" x2="18.5" y2="7" />
      </>
    ),
  lateral_raise: () =>
    I(
      <>
        <circle cx="12" cy="7" r="2" />
        <line x1="12" y1="9" x2="12" y2="16" />
        <line x1="12" y1="11" x2="5" y2="12" />
        <line x1="12" y1="11" x2="19" y2="12" />
        <rect x="3" y="11" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <rect x="18.5" y="11" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="16" x2="10" y2="20" />
        <line x1="12" y1="16" x2="14" y2="20" />
      </>
    ),
  front_raise: () =>
    I(
      <>
        <circle cx="12" cy="8" r="2" />
        <line x1="12" y1="10" x2="12" y2="17" />
        <line x1="12" y1="12" x2="7" y2="6" />
        <line x1="12" y1="12" x2="17" y2="14" />
        <rect x="5" y="4" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <rect x="16" y="13" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="17" x2="10" y2="21" />
        <line x1="12" y1="17" x2="14" y2="21" />
      </>
    ),
  reverse_fly: () =>
    I(
      <>
        <circle cx="12" cy="8" r="1.5" />
        <line x1="12" y1="9.5" x2="12" y2="14" />
        <path d="M12 11 L6 8" />
        <path d="M12 11 L18 8" />
        <rect x="4" y="7" width="2.5" height="2" rx="0.6" fill="currentColor" opacity="0.2" />
        <rect x="17.5" y="7" width="2.5" height="2" rx="0.6" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="14" x2="10" y2="19" />
        <line x1="12" y1="14" x2="14" y2="19" />
      </>
    ),
  arnold_press: () =>
    I(
      <>
        <circle cx="12" cy="11" r="2" />
        <line x1="12" y1="13" x2="12" y2="19" />
        <path d="M12 12 C10 9, 7 7, 6 5" />
        <path d="M12 12 C14 9, 17 7, 18 5" />
        <rect x="4.5" y="3.5" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <rect x="17" y="3.5" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
      </>
    ),
  upright_row: () =>
    I(
      <>
        <circle cx="12" cy="6" r="2" />
        <line x1="12" y1="8" x2="12" y2="15" />
        <line x1="12" y1="10" x2="8" y2="8" />
        <line x1="12" y1="10" x2="16" y2="8" />
        <line x1="7" y1="10" x2="17" y2="10" />
        <rect x="5" y="8.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="16.5" y="8.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="15" x2="10" y2="20" />
        <line x1="12" y1="15" x2="14" y2="20" />
      </>
    ),
  cable_lateral_raise: () =>
    I(
      <>
        <line x1="3" y1="4" x2="3" y2="20" />
        <circle cx="14" cy="7" r="2" />
        <line x1="14" y1="9" x2="14" y2="16" />
        <line x1="3" y1="13" x2="14" y2="12" />
        <line x1="14" y1="11" x2="20" y2="12" />
        <line x1="14" y1="16" x2="12" y2="20" />
        <line x1="14" y1="16" x2="16" y2="20" />
      </>
    ),

  // ── BICEPS ──
  barbell_curl: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="6" y1="13" x2="18" y2="13" />
        <path d="M12 10 L9 13" />
        <path d="M12 10 L15 13" />
        <rect x="4" y="11.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="17.5" y="11.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="13" x2="10" y2="19" />
        <line x1="12" y1="13" x2="14" y2="19" />
      </>
    ),
  db_curl: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <path d="M12 10 L9 12" />
        <path d="M12 10 L15 12" />
        <rect x="7" y="11" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <rect x="14.5" y="11" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="14" x2="10" y2="19" />
        <line x1="12" y1="14" x2="14" y2="19" />
      </>
    ),
  hammer_curl: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <path d="M12 10 L8 11" />
        <path d="M12 10 L16 11" />
        <line x1="7" y1="9.5" x2="7" y2="13" />
        <line x1="17" y1="9.5" x2="17" y2="13" />
        <line x1="12" y1="14" x2="10" y2="19" />
        <line x1="12" y1="14" x2="14" y2="19" />
      </>
    ),
  preacher_curl: () =>
    I(
      <>
        <path d="M6 8 L6 16 L14 16" />
        <circle cx="14" cy="9" r="1.5" />
        <path d="M14 10.5 L14 13 L10 16" />
        <line x1="14" y1="12" x2="18" y2="11" />
        <rect x="17" y="9.5" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
      </>
    ),
  incline_curl: () =>
    I(
      <>
        <path d="M8 18 L12 10 L16 18" />
        <circle cx="12" cy="8" r="1.5" />
        <line x1="12" y1="11" x2="8" y2="14" />
        <line x1="12" y1="11" x2="16" y2="14" />
        <rect x="6" y="13" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <rect x="15.5" y="13" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
      </>
    ),
  cable_curl: () =>
    I(
      <>
        <line x1="4" y1="4" x2="4" y2="20" />
        <circle cx="14" cy="7" r="2" />
        <line x1="14" y1="9" x2="14" y2="15" />
        <path d="M4 16 L10 16 L14 12" />
        <line x1="14" y1="15" x2="12" y2="19" />
        <line x1="14" y1="15" x2="16" y2="19" />
      </>
    ),
  concentration_curl: () =>
    I(
      <>
        <circle cx="10" cy="6" r="1.5" />
        <path d="M10 7.5 L10 12 L7 16" />
        <line x1="10" y1="12" x2="14" y2="16" />
        <path d="M10 9 L7 12" />
        <rect x="5" y="11" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
        <line x1="7" y1="16" x2="5" y2="16" />
      </>
    ),
  ez_bar_curl: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <path d="M5 13 L8 12 L10 13 L14 13 L16 12 L19 13" />
        <path d="M12 10 L10 13" />
        <path d="M12 10 L14 13" />
        <rect x="3" y="11.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="18.5" y="11.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="14" x2="10" y2="19" />
        <line x1="12" y1="14" x2="14" y2="19" />
      </>
    ),

  // ── TRICEPS ──
  tricep_pushdown: () =>
    I(
      <>
        <line x1="12" y1="3" x2="12" y2="6" />
        <line x1="8" y1="3" x2="16" y2="3" />
        <circle cx="12" cy="8" r="2" />
        <line x1="12" y1="10" x2="12" y2="16" />
        <path d="M12 12 L9 7 L9 6" />
        <path d="M12 12 L15 16" />
        <line x1="12" y1="16" x2="10" y2="20" />
        <line x1="12" y1="16" x2="14" y2="20" />
      </>
    ),
  overhead_extension: () =>
    I(
      <>
        <circle cx="12" cy="8" r="2" />
        <line x1="12" y1="10" x2="12" y2="17" />
        <path d="M12 11 L10 5" />
        <path d="M12 11 L14 5" />
        <rect x="9" y="3" width="6" height="2.5" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="17" x2="10" y2="21" />
        <line x1="12" y1="17" x2="14" y2="21" />
      </>
    ),
  skull_crusher: () =>
    I(
      <>
        <line x1="4" y1="14" x2="20" y2="14" />
        <circle cx="10" cy="12" r="1.5" />
        <line x1="10" y1="14" x2="16" y2="14" />
        <path d="M10 13 L7 10 L6 7" />
        <path d="M10 13 L13 10 L14 7" />
        <line x1="5" y1="7" x2="15" y2="7" />
        <rect x="3.5" y="5.5" width="2" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="14.5" y="5.5" width="2" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
      </>
    ),
  close_grip_bench: () =>
    I(
      <>
        <line x1="4" y1="12" x2="20" y2="12" />
        <rect x="2" y="10" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="19" y="10" width="3" height="4" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="10" y1="8" x2="10" y2="16" />
        <line x1="14" y1="8" x2="14" y2="16" />
        <line x1="10" y1="8" x2="14" y2="8" />
      </>
    ),
  dip: () =>
    I(
      <>
        <line x1="5" y1="6" x2="5" y2="18" />
        <line x1="19" y1="6" x2="19" y2="18" />
        <circle cx="12" cy="8" r="2" />
        <line x1="12" y1="10" x2="12" y2="16" />
        <line x1="12" y1="11" x2="5" y2="9" />
        <line x1="12" y1="11" x2="19" y2="9" />
        <line x1="12" y1="16" x2="10" y2="20" />
        <line x1="12" y1="16" x2="14" y2="20" />
      </>
    ),
  kickback: () =>
    I(
      <>
        <circle cx="8" cy="8" r="1.5" />
        <path d="M8 9.5 L8 13 L6 17" />
        <line x1="8" y1="13" x2="11" y2="17" />
        <path d="M8 11 L14 10 L19 10" />
        <rect x="18" y="8.5" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
      </>
    ),
  rope_pushdown: () =>
    I(
      <>
        <line x1="12" y1="3" x2="12" y2="7" />
        <line x1="8" y1="3" x2="16" y2="3" />
        <circle cx="12" cy="9" r="2" />
        <line x1="12" y1="11" x2="12" y2="15" />
        <path d="M12 7 L10 11" />
        <path d="M12 7 L14 11" />
        <path d="M12 13 L9 17" />
        <path d="M12 13 L15 17" />
        <circle cx="9" cy="17.5" r="0.8" fill="currentColor" opacity="0.3" />
        <circle cx="15" cy="17.5" r="0.8" fill="currentColor" opacity="0.3" />
      </>
    ),

  // ── FOREARMS ──
  wrist_curl: () =>
    I(
      <>
        <path d="M6 10 L6 16 L18 16" />
        <path d="M10 16 L10 12 L14 10" />
        <rect x="13" y="8.5" width="3" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
      </>
    ),
  reverse_wrist_curl: () =>
    I(
      <>
        <path d="M6 10 L6 16 L18 16" />
        <path d="M10 16 L10 14 L14 16" />
        <rect x="13" y="15" width="3" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
      </>
    ),
  farmer_walk: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <line x1="12" y1="9" x2="7" y2="12" />
        <line x1="12" y1="9" x2="17" y2="12" />
        <rect x="5" y="11" width="2.5" height="4" rx="0.8" fill="currentColor" opacity="0.2" />
        <rect x="16.5" y="11" width="2.5" height="4" rx="0.8" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="14" x2="10" y2="19" />
        <line x1="12" y1="14" x2="14" y2="19" />
      </>
    ),

  // ── CORE ──
  plank: () =>
    I(
      <>
        <circle cx="6" cy="11" r="1.5" />
        <line x1="7" y1="12" x2="18" y2="13" />
        <line x1="6" y1="12.5" x2="5" y2="15" />
        <line x1="18" y1="13" x2="19" y2="16" />
        <line x1="5" y1="15" x2="5" y2="17" />
      </>
    ),
  hanging_leg_raise: () =>
    I(
      <>
        <line x1="6" y1="3" x2="18" y2="3" />
        <circle cx="12" cy="6" r="1.5" />
        <line x1="12" y1="7.5" x2="12" y2="12" />
        <line x1="12" y1="8" x2="9" y2="4" />
        <line x1="12" y1="8" x2="15" y2="4" />
        <line x1="12" y1="12" x2="9" y2="17" />
        <line x1="12" y1="12" x2="15" y2="17" />
        <line x1="9" y1="17" x2="8" y2="17" />
        <line x1="15" y1="17" x2="16" y2="17" />
      </>
    ),
  cable_crunch: () =>
    I(
      <>
        <line x1="12" y1="3" x2="12" y2="6" />
        <line x1="8" y1="3" x2="16" y2="3" />
        <circle cx="12" cy="8" r="2" />
        <path d="M12 10 C12 13, 12 15, 12 18" />
        <line x1="12" y1="14" x2="10" y2="18" />
        <line x1="12" y1="14" x2="14" y2="18" />
      </>
    ),
  ab_wheel: () =>
    I(
      <>
        <circle cx="8" cy="16" r="3" />
        <line x1="8" y1="16" x2="8" y2="13" />
        <circle cx="16" cy="11" r="1.5" />
        <line x1="16" y1="12.5" x2="12" y2="16" />
        <line x1="16" y1="12" x2="10" y2="15" />
      </>
    ),
  russian_twist: () =>
    I(
      <>
        <circle cx="12" cy="7" r="2" />
        <path d="M12 9 L12 14" />
        <line x1="12" y1="14" x2="8" y2="18" />
        <line x1="12" y1="14" x2="16" y2="18" />
        <line x1="12" y1="11" x2="7" y2="13" />
        <rect x="5" y="12" width="2.5" height="2.5" rx="0.8" fill="currentColor" opacity="0.2" />
      </>
    ),
  side_plank: () =>
    I(
      <>
        <circle cx="7" cy="9" r="1.5" />
        <line x1="7" y1="10.5" x2="16" y2="14" />
        <line x1="16" y1="14" x2="18" y2="17" />
        <line x1="7" y1="11" x2="5" y2="14" />
        <line x1="7" y1="11" x2="9" y2="6" />
      </>
    ),
  crunch: () =>
    I(
      <>
        <circle cx="10" cy="9" r="2" />
        <path d="M10 11 L12 15" />
        <line x1="12" y1="15" x2="8" y2="19" />
        <line x1="12" y1="15" x2="16" y2="19" />
        <line x1="10" y1="11" x2="7" y2="9" />
        <line x1="10" y1="11" x2="14" y2="9" />
      </>
    ),

  // ── QUADS ──
  squat: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="5" y1="5" x2="19" y2="5" />
        <rect x="3" y="3.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="18.5" y="3.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="12" y1="13" x2="8" y2="19" />
        <line x1="12" y1="13" x2="16" y2="19" />
      </>
    ),
  front_squat: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="6" y1="8" x2="18" y2="8" />
        <rect x="4" y="6.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="17.5" y="6.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="12" y1="10" x2="9" y2="8" />
        <line x1="12" y1="10" x2="15" y2="8" />
        <line x1="12" y1="13" x2="8" y2="19" />
        <line x1="12" y1="13" x2="16" y2="19" />
      </>
    ),
  leg_press: () =>
    I(
      <>
        <path d="M5 18 L8 12 L14 12" />
        <line x1="14" y1="12" x2="18" y2="7" />
        <line x1="16" y1="5" x2="20" y2="9" />
        <line x1="8" y1="12" x2="5" y2="15" />
        <circle cx="7" cy="10" r="1.5" />
      </>
    ),
  leg_extension: () =>
    I(
      <>
        <path d="M6 8 L6 18" />
        <circle cx="10" cy="9" r="1.5" />
        <line x1="10" y1="10.5" x2="10" y2="14" />
        <path d="M6 14 L10 14 L16 10" />
        <circle cx="17" cy="10" r="1" fill="currentColor" opacity="0.3" />
      </>
    ),
  hack_squat: () =>
    I(
      <>
        <line x1="4" y1="4" x2="8" y2="20" />
        <line x1="20" y1="4" x2="16" y2="20" />
        <circle cx="12" cy="8" r="1.5" />
        <line x1="12" y1="9.5" x2="12" y2="14" />
        <line x1="12" y1="14" x2="9" y2="18" />
        <line x1="12" y1="14" x2="15" y2="18" />
        <line x1="10" y1="10" x2="6" y2="8" />
        <line x1="14" y1="10" x2="18" y2="8" />
      </>
    ),
  goblet_squat: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <rect x="10" y="8" width="4" height="3" rx="1" fill="currentColor" opacity="0.2" />
        <line x1="12" y1="13" x2="8" y2="19" />
        <line x1="12" y1="13" x2="16" y2="19" />
      </>
    ),
  lunge: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="12" y1="13" x2="7" y2="19" />
        <line x1="12" y1="13" x2="17" y2="16" />
        <line x1="17" y1="16" x2="19" y2="19" />
      </>
    ),
  bulgarian_split: () =>
    I(
      <>
        <circle cx="10" cy="5" r="2" />
        <line x1="10" y1="7" x2="10" y2="13" />
        <line x1="10" y1="13" x2="6" y2="19" />
        <line x1="10" y1="13" x2="16" y2="14" />
        <line x1="16" y1="14" x2="19" y2="12" />
        <line x1="17" y1="11" x2="21" y2="11" />
        <line x1="17" y1="11" x2="17" y2="14" />
      </>
    ),

  // ── HAMSTRINGS ──
  rdl: () =>
    I(
      <>
        <circle cx="10" cy="6" r="2" />
        <path d="M10 8 L10 12 L8 16" />
        <line x1="10" y1="12" x2="13" y2="16" />
        <line x1="5" y1="14" x2="17" y2="14" />
        <rect x="3" y="12.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="16.5" y="12.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
      </>
    ),
  leg_curl: () =>
    I(
      <>
        <line x1="3" y1="10" x2="20" y2="10" />
        <circle cx="8" cy="8.5" r="1.5" />
        <line x1="8" y1="10" x2="16" y2="10" />
        <path d="M16 10 L18 7 L20 8" />
        <circle cx="20" cy="8" r="1" fill="currentColor" opacity="0.3" />
        <line x1="8" y1="10" x2="6" y2="14" />
      </>
    ),
  nordic_curl: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="14" />
        <line x1="12" y1="14" x2="12" y2="20" />
        <line x1="10" y1="20" x2="14" y2="20" />
        <path d="M12 10 L8 8" />
        <path d="M12 10 L16 8" />
      </>
    ),
  good_morning: () =>
    I(
      <>
        <circle cx="10" cy="7" r="2" />
        <line x1="6" y1="7" x2="18" y2="7" />
        <rect x="4" y="5.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="17.5" y="5.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <path d="M10 9 L10 13 L8 17" />
        <line x1="10" y1="13" x2="13" y2="17" />
      </>
    ),
  stiff_leg_dl: () =>
    I(
      <>
        <circle cx="10" cy="5" r="2" />
        <path d="M10 7 L10 13" />
        <line x1="10" y1="13" x2="8" y2="19" />
        <line x1="10" y1="13" x2="13" y2="19" />
        <line x1="5" y1="13" x2="17" y2="13" />
        <rect x="3" y="11.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="16.5" y="11.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
      </>
    ),

  // ── GLUTES ──
  hip_thrust: () =>
    I(
      <>
        <path d="M4 16 L8 16 L12 10 L16 16 L20 16" />
        <line x1="10" y1="10" x2="14" y2="10" />
        <rect x="9" y="8.5" width="6" height="3" rx="0.5" fill="currentColor" opacity="0.15" />
        <line x1="4" y1="12" x2="4" y2="16" />
      </>
    ),
  cable_kickback: () =>
    I(
      <>
        <line x1="3" y1="6" x2="3" y2="20" />
        <circle cx="10" cy="8" r="1.5" />
        <line x1="10" y1="9.5" x2="10" y2="14" />
        <line x1="10" y1="14" x2="10" y2="19" />
        <path d="M3 15 L10 15 L17 12" />
      </>
    ),
  glute_bridge: () =>
    I(
      <>
        <path d="M4 16 L8 16 L12 11 L16 16 L20 16" />
        <circle cx="12" cy="9.5" r="1.5" />
        <line x1="4" y1="16" x2="4" y2="18" />
        <line x1="20" y1="16" x2="20" y2="18" />
      </>
    ),

  // ── CALVES ──
  calf_raise: () =>
    I(
      <>
        <circle cx="12" cy="4" r="2" />
        <line x1="12" y1="6" x2="12" y2="14" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="18" x2="14" y2="18" />
        <line x1="12" y1="18" x2="12" y2="20" />
        <line x1="9" y1="20" x2="15" y2="20" />
      </>
    ),
  seated_calf_raise: () =>
    I(
      <>
        <path d="M6 10 L6 18 L18 18" />
        <circle cx="10" cy="10" r="1.5" />
        <path d="M10 11.5 L10 14 L10 18" />
        <rect x="8" y="13" width="6" height="2" rx="0.5" fill="currentColor" opacity="0.15" />
        <line x1="10" y1="18" x2="10" y2="20" />
      </>
    ),

  // ── FULL BODY ──
  clean: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="6" y1="8" x2="18" y2="8" />
        <rect x="4" y="6.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="17.5" y="6.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="13" x2="9" y2="18" />
        <line x1="12" y1="13" x2="15" y2="18" />
      </>
    ),
  snatch: () =>
    I(
      <>
        <circle cx="12" cy="8" r="2" />
        <line x1="12" y1="10" x2="12" y2="14" />
        <line x1="5" y1="4" x2="19" y2="4" />
        <rect x="3" y="2.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="18.5" y="2.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="10" x2="7" y2="5" />
        <line x1="12" y1="10" x2="17" y2="5" />
        <line x1="12" y1="14" x2="8" y2="20" />
        <line x1="12" y1="14" x2="16" y2="20" />
      </>
    ),
  thruster: () =>
    I(
      <>
        <circle cx="12" cy="5" r="2" />
        <line x1="6" y1="5" x2="18" y2="5" />
        <rect x="4" y="3.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <rect x="17.5" y="3.5" width="2.5" height="3" rx="0.5" fill="currentColor" opacity="0.25" />
        <line x1="12" y1="7" x2="12" y2="13" />
        <line x1="12" y1="9" x2="8" y2="6" />
        <line x1="12" y1="9" x2="16" y2="6" />
        <line x1="12" y1="13" x2="9" y2="18" />
        <line x1="12" y1="13" x2="15" y2="18" />
      </>
    ),
  burpee: () =>
    I(
      <>
        <circle cx="12" cy="4" r="1.5" />
        <line x1="12" y1="5.5" x2="12" y2="10" />
        <line x1="12" y1="7" x2="8" y2="5" />
        <line x1="12" y1="7" x2="16" y2="5" />
        <line x1="12" y1="10" x2="8" y2="14" />
        <line x1="12" y1="10" x2="16" y2="14" />
        <path d="M8 14 L6 16" strokeDasharray="1.5 1.5" />
        <path d="M16 14 L18 16" strokeDasharray="1.5 1.5" />
        <line x1="10" y1="18" x2="14" y2="18" strokeWidth="0.8" opacity="0.4" />
      </>
    ),
  kettlebell_swing: () =>
    I(
      <>
        <circle cx="12" cy="15" r="3.5" />
        <path d="M10 12 L12 8 L14 12" />
        <circle cx="12" cy="5" r="1.5" />
        <line x1="12" y1="6.5" x2="12" y2="8" />
        <line x1="12" y1="7" x2="8" y2="9" />
        <line x1="12" y1="7" x2="16" y2="9" />
      </>
    ),
};

// Default fallback icon
const defaultIcon = () =>
  I(
    <>
      <circle cx="12" cy="12" r="6" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </>
  );

export function getExerciseIcon(exerciseId) {
  return icons[exerciseId] || defaultIcon;
}

export default icons;
