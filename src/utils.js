import { DOCS, HY_DAYS, HY_MON, PATS, STATUS } from './data.js';

// "Today" in the mock is Thursday, 8 October 2026.
export const dayInfo = (dayOff) => {
  const dt = new Date(2026, 9, 8 + dayOff);
  return {
    label: `${HY_DAYS[dt.getDay()]}, ${dt.getDate()} ${HY_MON[dt.getMonth()]} ${dt.getFullYear()}`,
    closed: dt.getDay() === 0,
  };
};

export const money = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ֏';

export const hm = (h) => {
  const H = Math.floor(h);
  const M = Math.round((h - H) * 60);
  return String(H).padStart(2, '0') + ':' + String(M).padStart(2, '0');
};

export const getDoc = (id) => DOCS.find((d) => d.id === id);
export const getPat = (name) => PATS.find((p) => p.name === name);
export const initials = (name) => name.split(' ').map((w) => w[0]).join('').slice(0, 2);

export const parseShift = (t) => {
  if (!t) return 0;
  const p = t.split('–');
  return parseInt(p[1], 10) - parseInt(p[0], 10);
};

// Enrich an appointment with display fields.
export const deco = (a) => {
  const d = getDoc(a.doc);
  const st = STATUS[a.status];
  return {
    ...a,
    time: hm(a.start) + '–' + hm(a.end),
    startLabel: hm(a.start),
    docName: d.name,
    docShort: d.short,
    color: d.color,
    tint: d.tint,
    cabLabel: 'Կաբինետ ' + a.cab,
    stLabel: st.label,
    stBg: st.bg,
    stFg: st.fg,
    priceLabel: a.price ? money(a.price) : 'Անվճար',
  };
};
