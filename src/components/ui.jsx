export const Icon = ({ d, size = 20, stroke = 'currentColor', width = 1.7, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    <path d={d} />
  </svg>
);

export const ICONS = {
  dash: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z',
  cal: 'M3 5h18v16H3zM3 10h18M8 3v4M16 3v4',
  pat: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  dcab: 'M3 7h18v13H3zM8 7V4h8v3M3 13h18M12 11v4',
  docs: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0M12 15v4M10 17h4',
  rooms: 'M5 21V3h11v18M3 21h18M13 12h.01M16 5h3v16',
  time: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  wh: 'M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8',
  notif: 'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
  plus: 'M12 5v14M5 12h14',
  close: 'M6 6l12 12M18 6L6 18',
  left: 'M15 18l-6-6 6-6',
  right: 'M9 18l6-6-6-6',
  chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
  warn: 'M12 9v4M12 17h.01M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  tooth: 'M7 3c-2.5 0-4 2-4 4.5 0 2 .8 3.4 1.3 5 .6 2.3.8 8.5 3 8.5 1.6 0 1.6-5 3.2-5h1c1.6 0 1.6 5 3.2 5 2.2 0 2.4-6.2 3-8.5.5-1.6 1.3-3 1.3-5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z',
};

export const Card = ({ as: Tag = 'section', className = '', children }) => (
  <Tag className={`bg-white border border-line rounded-2xl p-5 flex flex-col ${className}`}>{children}</Tag>
);

export const H2 = ({ children, className = '' }) => <h2 className={`m-0 text-[17px] font-bold ${className}`}>{children}</h2>;

export const Pill = ({ bg, fg, children, className = '' }) => (
  <span className={`px-2.5 py-[3px] rounded-full text-xs font-semibold whitespace-nowrap ${className}`} style={{ background: bg, color: fg }}>
    {children}
  </span>
);

export const chipColors = (on) => (on ? { background: '#142321', color: '#FFFFFF', borderColor: '#142321' } : { background: '#FFFFFF', color: '#142321', borderColor: '#DDE3DF' });

export const Chip = ({ on, onClick, dot, children }) => (
  <button type="button" onClick={onClick} aria-pressed={on} style={chipColors(on)} className="inline-flex items-center gap-1.5 min-h-9 px-3 rounded-full border text-[13px] font-semibold">
    {dot && <span className="w-2 h-2 rounded" style={{ background: dot }} />}
    {children}
  </button>
);

export const Toggle = ({ on, onClick, label, desc }) => (
  <button type="button" aria-pressed={on} onClick={onClick} className="flex items-center justify-between gap-4 w-full min-h-[52px] py-2 border-0 border-b border-line2 bg-transparent text-left">
    <span className="flex flex-col">
      <span className="font-semibold">{label}</span>
      <span className="text-[12.5px] text-muted">{desc}</span>
    </span>
    <span className="relative shrink-0 w-[42px] h-6 rounded-xl transition-colors" style={{ background: on ? '#0E7C74' : '#C2CCC7' }}>
      <span className="absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white transition-all" style={{ left: on ? 21 : 3 }} />
    </span>
  </button>
);

export const Stat = ({ label, value, color = '#142321' }) => (
  <div className="bg-white border border-line rounded-[14px] px-4 py-3.5 flex flex-col gap-0.5">
    <span className="text-[12.5px] text-muted">{label}</span>
    <span className="text-2xl font-bold tnum" style={{ color }}>{value}</span>
  </div>
);

export const SearchBox = ({ value, onChange, placeholder, label = 'Որոնում', className = '' }) => (
  <label className={`flex items-center gap-2 h-10 px-3 border border-line rounded-[10px] min-w-[200px] bg-white ${className}`}>
    <span className="text-[12.5px] text-muted">{label}</span>
    <input type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="border-0 outline-none flex-1 min-w-0 bg-transparent h-9" />
  </label>
);

export const btn = {
  primary: 'min-h-11 rounded-[10px] border-0 bg-brand hover:bg-brand-dark text-white font-semibold px-4',
  ghost: 'min-h-11 rounded-[10px] border border-line bg-white hover:bg-soft font-semibold px-4',
  dark: 'min-h-11 rounded-[10px] border-0 bg-ink text-white font-semibold px-4',
  link: 'border-0 bg-transparent text-brand font-semibold min-h-9 px-2.5 rounded-lg hover:bg-[#EEF2F0]',
};
