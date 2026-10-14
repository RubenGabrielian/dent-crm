import { useStore } from '../store.jsx';
import { ITEMS, WH } from '../data.js';
import { money } from '../utils.js';
import { Card, Chip, H2, Pill, SearchBox, Stat } from '../components/ui.jsx';

const mv = (kind, item, where, time, qty) => ({ kind, item, where, time, qty, out: kind === 'Ելք' });
const MOVES = [
  mv('Ելք', 'Կոմպոզիտ լուսապնդվող A2', 'Կաբինետ 2', 'այսօր 10:12', '−2'),
  mv('Ելք', 'Իմպլանտ 4.0 × 10 մմ', 'Կաբինետ 3', 'այսօր 10:05', '−1'),
  mv('Ելք', 'Արտիկաին 4%, 1.7 մլ', 'Կաբինետ 4', 'այսօր 09:58', '−4'),
  mv('Մուտք', 'Եռաշերտ դիմակներ', WH.cab, 'երեկ 16:30', '+20'),
  mv('Մուտք', 'Ալգինատային դրոշմանյութ', WH.central, 'երեկ 12:10', '+6'),
  mv('Ելք', 'Նիտրիլային ձեռնոցներ, M', 'Կաբինետ 1', 'երեկ 09:15', '−3'),
];

export default function Warehouse() {
  const { state: s, set, notify } = useStore();
  const wq = s.whQuery.trim().toLowerCase();
  const lowN = ITEMS.filter((i) => s.stock[i.id] <= i.min).length;
  const rows = ITEMS.filter((i) => (s.whFilter === 'all' || i.wh === s.whFilter) && (!wq || i.name.toLowerCase().includes(wq) || i.cat.toLowerCase().includes(wq)));

  const order = (i) => {
    set((x) => ({ ordered: { ...x.ordered, [i.id]: true } }));
    notify('stock', 'Պատվերն ուղարկված է', `${i.name} · ${i.max - s.stock[i.id]} ${i.unit} · ${i.sup}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(200px,100%),1fr))]">
        <Stat label="Ապրանքային դիրքեր" value={ITEMS.length} />
        <Stat label="Ցածր մնացորդ" value={lowN} color={lowN ? '#9A241C' : '#142321'} />
        <Stat label="Ժամկետը մոտ է" value={ITEMS.filter((i) => i.soon).length} color="#8A4513" />
        <Stat label="Պաշարի արժեք" value={money(ITEMS.reduce((t, i) => t + s.stock[i.id] * i.price, 0))} color="#0E7C74" />
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        <Card className="flex-[999_1_640px] min-w-0 gap-3.5">
          <div className="flex flex-wrap justify-between items-center gap-2.5">
            <div className="flex flex-wrap gap-1.5">
              {[['all', 'Բոլորը'], ...Object.entries(WH)].map(([id, label]) => (
                <Chip key={id} on={s.whFilter === id} onClick={() => set({ whFilter: id })}>{label}</Chip>
              ))}
            </div>
            <SearchBox value={s.whQuery} onChange={(v) => set({ whQuery: v })} placeholder="Ապրանքի անվանում" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-muted text-[12.5px]">
                  <th className="p-2 font-semibold border-b border-line">Ապրանք</th>
                  <th className="p-2 font-semibold border-b border-line">Պահեստ</th>
                  <th className="p-2 font-semibold border-b border-line w-[170px]">Մնացորդ</th>
                  <th className="p-2 font-semibold border-b border-line">Պիտանիություն</th>
                  <th className="p-2 font-semibold border-b border-line">Կարգավիճակ</th>
                  <th className="p-2 font-semibold border-b border-line text-right">Գործողություն</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((i) => {
                  const qty = s.stock[i.id];
                  const low = qty <= i.min;
                  const st = low ? ['Ցածր մնացորդ', '#F7E0DE', '#9A241C'] : i.soon ? ['Ժամկետը մոտ է', '#FBEBD9', '#8A4513'] : ['Նորմալ', '#DCEFE6', '#1F6B45'];
                  return (
                    <tr key={i.id} className="hover:bg-soft">
                      <td className="p-2 border-b border-line2"><span className="flex flex-col"><span className="font-semibold">{i.name}</span><span className="text-xs text-muted">{i.cat} · {i.sup}</span></span></td>
                      <td className="p-2 border-b border-line2 text-[12.5px]">{WH[i.wh]}</td>
                      <td className="p-2 border-b border-line2">
                        <div className="flex flex-col gap-1">
                          <span className="tnum"><strong>{qty}</strong> {i.unit} <span className="text-muted">/ նվազ. {i.min}</span></span>
                          <div className="h-1.5 rounded-sm bg-line2 overflow-hidden"><div className="h-1.5" style={{ width: Math.min(100, Math.round((qty / i.max) * 100)) + '%', background: low ? '#B3261E' : '#0E7C74' }} /></div>
                        </div>
                      </td>
                      <td className="p-2 border-b border-line2 tnum" style={{ color: i.soon ? '#8A4513' : '#142321' }}>{i.exp}</td>
                      <td className="p-2 border-b border-line2"><Pill bg={st[1]} fg={st[2]}>{st[0]}</Pill></td>
                      <td className="p-2 border-b border-line2 text-right">
                        {s.ordered[i.id] ? (
                          <span className="text-[12.5px] text-ok-fg font-semibold">Պատվիրված է</span>
                        ) : low ? (
                          <button type="button" onClick={() => order(i)} className="min-h-9 px-3 rounded-[9px] bg-ink text-white font-semibold text-[12.5px]">Պատվիրել</button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="flex-[1_1_300px] min-w-0 gap-1.5">
          <H2 className="mb-1.5">Վերջին շարժեր</H2>
          {MOVES.map((m) => {
            const c = m.out ? ['#F8E6D8', '#8A4513'] : ['#DCEFE6', '#1F6B45'];
            return (
              <div key={m.item + m.time} className="flex gap-2.5 items-start py-2 border-t border-line2">
                <span className="px-2 py-0.5 rounded-md text-[11.5px] font-bold" style={{ background: c[0], color: c[1] }}>{m.kind}</span>
                <span className="flex-1 min-w-0 flex flex-col"><span className="text-[13px] font-semibold">{m.item}</span><span className="text-xs text-muted">{m.where} · {m.time}</span></span>
                <span className="font-bold tnum" style={{ color: c[1] }}>{m.qty}</span>
              </div>
            );
          })}
        </Card>
      </div>
    </div>
  );
}
