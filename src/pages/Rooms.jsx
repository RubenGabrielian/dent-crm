import { useStore } from '../store.jsx';
import { DOCS, NOW, ROOMS } from '../data.js';
import { hm } from '../utils.js';
import { Card, Pill, btn } from '../components/ui.jsx';

export default function Rooms() {
  const { state: s, set } = useStore();

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))]">
      {DOCS.map((d) => {
        const mine = s.appts.filter((a) => a.day === 0 && a.doc === d.id).sort((a, b) => a.start - b.start);
        const cur = mine.find((a) => a.status === 'now');
        const nx = mine.find((a) => a.start > NOW && (a.status === 'conf' || a.status === 'pend'));
        const cleaning = !cur && !!s.cleaning[d.cab];
        const R = ROOMS[d.cab];

        let st, panel;
        if (cur) {
          st = ['Զբաղված', '#0E7C74', '#FFFFFF'];
          panel = { bg: d.tint, cap: 'Ընթացիկ ընդունելություն', text: cur.patient, sub: `${cur.proc} · մինչև ${hm(cur.end)}` };
        } else if (cleaning) {
          st = ['Ախտահանում', '#FBEBD9', '#8A4513'];
          panel = { bg: '#FBF3EA', cap: 'Ախտահանում ընթացքում', text: 'Ասիստենտ՝ Մերի Ասատրյան', sub: nx ? `Հաջորդ այցը՝ ${hm(nx.start)} · ${nx.patient}` : 'Այսօր այլ այցեր չկան' };
        } else {
          st = ['Ազատ', '#DCEFE6', '#1F6B45'];
          panel = { bg: '#F4F7F5', cap: 'Հաջորդ այցը', text: nx ? `${hm(nx.start)} · ${nx.patient}` : 'Այսօր այլ այցեր չկան', sub: nx ? nx.proc : 'Կաբինետը պատրաստ է' };
        }

        return (
          <Card as="article" key={d.id} className="gap-3.5">
            <div className="flex justify-between items-start gap-2.5">
              <span className="flex flex-col"><span className="font-serif text-xl font-bold">Կաբինետ {d.cab}</span><span className="text-muted">{R.floor} · {d.short}</span></span>
              <Pill bg={st[1]} fg={st[2]} className="!text-[12.5px] !px-3 !py-1">{st[0]}</Pill>
            </div>
            <div className="px-3.5 py-3 rounded-xl flex flex-col gap-0.5" style={{ background: panel.bg }}>
              <span className="text-xs text-muted">{panel.cap}</span>
              <span className="font-semibold">{panel.text}</span>
              <span className="text-[12.5px] text-ink2">{panel.sub}</span>
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-[12.5px] text-muted font-semibold">Սարքավորումներ</span>
              <div className="flex flex-wrap gap-1.5">{R.equip.map((e) => <span key={e} className="px-2.5 py-1 rounded-lg bg-soft text-[12.5px]">{e}</span>)}</div>
            </div>
            {!cur && (
              <button type="button" className={btn.ghost} onClick={() => set((x) => ({ cleaning: { ...x.cleaning, [d.cab]: !x.cleaning[d.cab] } }))}>
                {cleaning ? 'Ախտահանումն ավարտված է' : 'Սկսել ախտահանումը'}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
