import { useStore } from '../store.jsx';
import { DOCS, NOW, STAFF, TODAY_COL } from '../data.js';
import { hm, parseShift } from '../utils.js';
import { Card, btn } from '../components/ui.jsx';

export default function Doctors() {
  const { state: s, set } = useStore();

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(330px,100%),1fr))]">
      {DOCS.map((d) => {
        const mine = s.appts.filter((a) => a.day === 0 && a.doc === d.id && a.status !== 'noshow');
        const shift = STAFF.find((x) => x.id === d.staff).week[TODAY_COL];
        const booked = mine.reduce((t, a) => t + (a.end - a.start), 0);
        const load = Math.min(100, Math.round((booked / (parseShift(shift) || 1)) * 100));
        const nx = mine.filter((a) => a.start > NOW && (a.status === 'conf' || a.status === 'pend')).sort((a, b) => a.start - b.start)[0];
        const tiles = [['Կաբինետ', '№ ' + d.cab], ['Այսօր', shift || 'Հանգիստ'], ['Այցեր այսօր', mine.length], ['Հեռախոս', d.phone]];
        return (
          <Card as="article" key={d.id} className="gap-3.5">
            <div className="flex gap-3.5 items-center">
              <span className="basis-[52px] shrink-0 h-[52px] rounded-full text-white font-bold flex items-center justify-center" style={{ background: d.color }}>{d.ini}</span>
              <span className="flex flex-col min-w-0"><span className="text-[17px] font-bold">{d.name}</span><span className="text-muted">{d.spec} · {d.exp}</span></span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              {tiles.map(([l, v]) => (
                <div key={l} className="px-2.5 py-2 rounded-[10px] bg-soft flex flex-col"><span className="text-xs text-muted">{l}</span><span className="font-semibold tnum">{v}</span></div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[12.5px] text-ink2"><span>Ծանրաբեռնվածություն</span><span className="tnum">{load}%</span></div>
              <div className="h-2 rounded bg-line2 overflow-hidden"><div className="h-2" style={{ width: load + '%', background: d.color }} /></div>
            </div>
            <span className="text-[13px] text-ink2">Հաջորդ պացիենտ՝ <strong>{nx ? `${hm(nx.start)} · ${nx.patient}` : 'Այսօր այլևս չկա'}</strong></span>
            <div className="flex gap-2">
              <button type="button" className={`flex-1 ${btn.ghost}`} onClick={() => set({ sec: 'cal', calDoc: d.id, dayOff: 0 })}>Օրացույց</button>
              <button type="button" className={`flex-1 ${btn.dark}`} onClick={() => set({ sec: 'dcab', dcDoc: d.id, dcActive: null, dcMat: {} })}>Բժշկի կաբինետ</button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
