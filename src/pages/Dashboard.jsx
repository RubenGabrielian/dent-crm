import { useStore } from '../store.jsx';
import { DOCS, ITEMS, NOW, NTYPE } from '../data.js';
import { deco, hm, money } from '../utils.js';
import { Card, H2, Icon, Pill, btn } from '../components/ui.jsx';

export const decoNotif = (n) => {
  const t = NTYPE[n.type];
  return { ...n, bg: t.bg, fg: t.fg, icon: t.icon, typeLabel: t.label, unread: !n.read };
};

const compact = (v) => (v === 0 ? 'Փակ' : v >= 1e6 ? (v / 1e6).toFixed(2).replace('.', ',') + ' մլն' : Math.round(v / 1000) + ' հզ.');

export default function Dashboard() {
  const { state: s, set } = useStore();
  const today = s.appts.filter((a) => a.day === 0);
  const done = today.filter((a) => a.status === 'done');
  const revenue = done.reduce((t, a) => t + a.price, 0);
  const planned = today.filter((a) => a.status !== 'noshow').reduce((t, a) => t + a.price, 0);
  const pendN = today.filter((a) => a.status === 'pend').length;
  const nowN = today.filter((a) => a.status === 'now').length;
  const lowN = ITEMS.filter((i) => s.stock[i.id] <= i.min).length;

  const kpis = [
    { label: 'Այսօրվա այցեր', value: today.length, sub: `Ավարտված՝ ${done.length} · Ընթացքում՝ ${nowN}`, color: '#142321' },
    { label: 'Եկամուտ այսօր', value: money(revenue), sub: 'Օրվա պլան՝ ' + money(planned), color: '#0E7C74' },
    { label: 'Չհաստատված այցեր', value: pendN, sub: 'Կուղարկվի ավտոմատ հիշեցում', color: pendN ? '#8A4513' : '#142321' },
    { label: 'Պահեստի ահազանգեր', value: lowN, sub: 'Ապրանքներ նվազագույն մնացորդից ցածր', color: lowN ? '#9A241C' : '#142321' },
  ];

  const upcoming = today
    .filter((a) => a.start >= NOW - 1 && a.status !== 'done' && a.status !== 'noshow')
    .sort((a, b) => a.start - b.start).slice(0, 6).map(deco);

  const occupancy = DOCS.map((d) => {
    const mine = today.filter((a) => a.doc === d.id && a.status !== 'noshow');
    const booked = mine.reduce((t, a) => t + (a.end - a.start), 0);
    const cur = mine.find((a) => a.status === 'now');
    const cleaning = !cur && s.cleaning[d.cab];
    const st = cur ? ['Զբաղված', '#0E7C74', '#FFFFFF'] : cleaning ? ['Ախտահանում', '#FBEBD9', '#8A4513'] : ['Ազատ', '#DCEFE6', '#1F6B45'];
    const pct = Math.min(100, Math.round((booked / 10) * 100));
    return { d, cur, st, pct, booked };
  });

  const weekRaw = [['Ուրբ', 1420000], ['Շբթ', 860000], ['Կիր', 0], ['Երկ', 1310000], ['Երք', 1580000], ['Չրք', 1190000], ['Հնգ', revenue]];
  const maxW = Math.max(...weekRaw.map((w) => w[1]));
  const weekTotal = weekRaw.reduce((t, w) => t + w[1], 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))]">
        {kpis.map((k) => (
          <div key={k.label} className="bg-white border border-line rounded-2xl px-5 py-[18px] flex flex-col gap-1">
            <span className="text-[13px] text-muted">{k.label}</span>
            <span className="text-[30px] font-bold tracking-tight tnum" style={{ color: k.color }}>{k.value}</span>
            <span className="text-[12.5px] text-muted">{k.sub}</span>
          </div>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))]">
        <Card className="gap-3">
          <div className="flex justify-between items-center gap-3">
            <H2>Մոտակա այցեր</H2>
            <button type="button" className={btn.link} onClick={() => set({ sec: 'cal', dayOff: 0 })}>Բացել օրացույցը</button>
          </div>
          <div className="flex flex-col">
            {upcoming.map((a) => (
              <button key={a.id} type="button" onClick={() => set({ sec: 'cal', dayOff: 0, selAppt: a.id })} className="flex items-center gap-3.5 px-2 py-2.5 border-t border-line2 text-left min-h-14 hover:bg-soft">
                <span className="basis-[52px] shrink-0 font-bold tnum">{a.startLabel}</span>
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="font-semibold">{a.patient}</span>
                  <span className="text-[12.5px] text-muted">{a.proc} · {a.cabLabel}</span>
                </span>
                <span className="hidden sm:flex items-center gap-1.5 text-[12.5px] text-ink2 whitespace-nowrap">
                  <span className="w-2 h-2 rounded" style={{ background: a.color }} />{a.docShort}
                </span>
                <Pill bg={a.stBg} fg={a.stFg}>{a.stLabel}</Pill>
              </button>
            ))}
          </div>
        </Card>

        <Card className="gap-3.5">
          <div className="flex justify-between items-center gap-3">
            <H2>Կաբինետների զբաղվածություն</H2>
            <span className="text-[12.5px] text-muted">Այժմ՝ {hm(NOW)}</span>
          </div>
          {occupancy.map(({ d, cur, st, pct, booked }) => (
            <div key={d.id} className="flex flex-col gap-1.5 py-2 border-t border-line2">
              <div className="flex justify-between items-center gap-2.5">
                <span className="flex flex-col">
                  <span className="font-semibold">Կաբինետ {d.cab}</span>
                  <span className="text-[12.5px] text-muted">{d.short} · {cur ? `${cur.patient} · մինչև ${hm(cur.end)}` : 'Պատրաստ է ընդունելության'}</span>
                </span>
                <Pill bg={st[1]} fg={st[2]}>{st[0]}</Pill>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-2 rounded bg-line2 overflow-hidden"><div className="h-2 rounded" style={{ width: pct + '%', background: d.color }} /></div>
                <span className="text-[12.5px] text-ink2 tnum">{pct}% · {String(booked).replace('.', ',')} ժ</span>
              </div>
            </div>
          ))}
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(440px,100%),1fr))]">
        <Card className="gap-4">
          <div className="flex justify-between items-baseline gap-3 flex-wrap">
            <H2>Եկամուտ՝ վերջին 7 օր</H2>
            <span className="text-[12.5px] text-muted">Ընդամենը՝ {money(weekTotal)}</span>
          </div>
          <div className="grid grid-cols-7 gap-2.5 items-end h-[200px]">
            {weekRaw.map(([d, v], i) => {
              const last = i === 6;
              return (
                <div key={d} className="flex flex-col items-center justify-end gap-1.5 h-[200px]">
                  <span className="text-[11.5px] text-ink2 tnum whitespace-nowrap">{compact(v)}</span>
                  <div className="w-full max-w-11 rounded-t-lg rounded-b-[3px] transition-all" style={{ height: Math.max(3, Math.round((v / maxW) * 150)), background: last ? '#0E7C74' : '#BFD8D2' }} />
                  <span className={`text-xs ${last ? 'text-ink font-bold' : 'text-muted font-medium'}`}>{d}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="gap-2">
          <div className="flex justify-between items-center gap-3">
            <H2>Վերջին ծանուցումներ</H2>
            <button type="button" className={btn.link} onClick={() => set({ sec: 'notif' })}>Բոլորը</button>
          </div>
          {s.notifs.slice(0, 4).map(decoNotif).map((n) => (
            <div key={n.id} className="flex gap-3 items-start py-2.5 border-t border-line2">
              <span className="basis-[34px] shrink-0 h-[34px] rounded-[10px] flex items-center justify-center" style={{ background: n.bg }}>
                <Icon d={n.icon} size={17} stroke={n.fg} width={1.9} />
              </span>
              <span className="flex-1 min-w-0 flex flex-col">
                <span className={n.unread ? 'font-bold' : 'font-medium'}>{n.title}</span>
                <span className="text-[12.5px] text-muted">{n.text}</span>
              </span>
              <span className="text-xs text-muted whitespace-nowrap">{n.time}</span>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
