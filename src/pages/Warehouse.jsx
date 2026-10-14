import { useState } from 'react';
import { useStore } from '../store.jsx';
import { DOCS, ITEMS, WH } from '../data.js';
import { money } from '../utils.js';
import { Card, Chip, H2, Icon, ICONS, Pill, SearchBox, Stat, btn } from '../components/ui.jsx';

const itemById = (id) => ITEMS.find((i) => i.id === id);
const nowLabel = () => {
  const d = new Date();
  return 'այսօր ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
};

export default function Warehouse() {
  const { state: s, set, notify } = useStore();
  const [selected, setSelected] = useState({}); // itemId -> true
  const [issueOpen, setIssueOpen] = useState(false);
  const [moveCab, setMoveCab] = useState('all');

  const wq = s.whQuery.trim().toLowerCase();
  const lowN = ITEMS.filter((i) => s.stock[i.id] <= i.min).length;
  const rows = ITEMS.filter((i) => (s.whFilter === 'all' || i.wh === s.whFilter) && (!wq || i.name.toLowerCase().includes(wq) || i.cat.toLowerCase().includes(wq)));
  const selIds = Object.keys(selected).filter((k) => selected[k] && s.stock[k] > 0);
  const allVisibleSelected = rows.length > 0 && rows.filter((i) => s.stock[i.id] > 0).every((i) => selected[i.id]);

  const toggle = (id) => setSelected((x) => ({ ...x, [id]: !x[id] }));
  const toggleAll = () => setSelected((x) => {
    const next = { ...x };
    rows.forEach((i) => { if (s.stock[i.id] > 0) next[i.id] = !allVisibleSelected; });
    return next;
  });

  const order = (i) => {
    set((x) => ({ ordered: { ...x.ordered, [i.id]: true } }));
    notify('stock', 'Պատվերն ուղարկված է', `${i.name} · ${i.max - s.stock[i.id]} ${i.unit} · ${i.sup}`);
  };

  const moves = s.moves.filter((m) => moveCab === 'all' || (moveCab === 'in' ? m.kind === 'in' : m.kind === 'out' && m.cab === Number(moveCab)));
  const issuedByCab = DOCS.map((d) => ({ cab: d.cab, color: d.color, count: s.moves.filter((m) => m.kind === 'out' && m.cab === d.cab).reduce((t, m) => t + m.qty, 0) }));

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

          {selIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-side text-white">
              <span className="font-semibold">Ընտրված է՝ {selIds.length} ապրանք</span>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelected({})} className="min-h-10 px-3.5 rounded-[10px] border border-side-line text-side-text font-semibold hover:bg-side-hover">Մաքրել</button>
                <button type="button" onClick={() => setIssueOpen(true)} className="min-h-10 px-4 rounded-[10px] bg-accent text-side font-bold hover:brightness-105">Ելք կաբինետ →</button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-muted text-[12.5px]">
                  <th className="p-2 border-b border-line w-9">
                    <input type="checkbox" aria-label="Ընտրել բոլորը" checked={allVisibleSelected} onChange={toggleAll} className="w-4 h-4 accent-brand" />
                  </th>
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
                  const st = qty === 0 ? ['Վերջացել է', '#F7E0DE', '#9A241C'] : low ? ['Ցածր մնացորդ', '#F7E0DE', '#9A241C'] : i.soon ? ['Ժամկետը մոտ է', '#FBEBD9', '#8A4513'] : ['Նորմալ', '#DCEFE6', '#1F6B45'];
                  const isSel = !!selected[i.id];
                  return (
                    <tr key={i.id} className={isSel ? 'bg-[#EAF4F1]' : 'hover:bg-soft'}>
                      <td className="p-2 border-b border-line2">
                        <input type="checkbox" aria-label={'Ընտրել ' + i.name} checked={isSel} disabled={qty === 0} onChange={() => toggle(i.id)} className="w-4 h-4 accent-brand" />
                      </td>
                      <td className="p-2 border-b border-line2 cursor-pointer" onClick={() => qty > 0 && toggle(i.id)}>
                        <span className="flex flex-col"><span className="font-semibold">{i.name}</span><span className="text-xs text-muted">{i.cat} · {i.sup}</span></span>
                      </td>
                      <td className="p-2 border-b border-line2 text-[12.5px]">{WH[i.wh]}</td>
                      <td className="p-2 border-b border-line2">
                        <div className="flex flex-col gap-1">
                          <span className="tnum"><strong>{qty}</strong> {i.unit} <span className="text-muted">/ նվազ. {i.min}</span></span>
                          <div className="h-1.5 rounded-sm bg-line2 overflow-hidden"><div className="h-1.5 transition-all" style={{ width: Math.min(100, Math.round((qty / i.max) * 100)) + '%', background: low ? '#B3261E' : '#0E7C74' }} /></div>
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

        <Card className="flex-[1_1_320px] min-w-0 gap-3">
          <H2>Շարժերի մատյան</H2>
          <div className="grid grid-cols-5 gap-1.5">
            {issuedByCab.map((c) => (
              <button key={c.cab} type="button" onClick={() => setMoveCab(moveCab === String(c.cab) ? 'all' : String(c.cab))} className="flex flex-col items-center py-2 rounded-[10px] border" style={{ borderColor: moveCab === String(c.cab) ? c.color : '#EEF1EF', background: moveCab === String(c.cab) ? '#F4F7F5' : '#FFFFFF' }}>
                <span className="text-[11px] text-muted">Կաբ. {c.cab}</span>
                <span className="font-bold tnum" style={{ color: c.color }}>{c.count}</span>
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-[12.5px] text-muted">Ցույց տալ
            <select value={moveCab} onChange={(e) => setMoveCab(e.target.value)} className="flex-1 h-9 px-2 border border-line rounded-[10px] bg-white text-ink">
              <option value="all">Բոլոր շարժերը</option>
              <option value="in">Միայն մուտքեր</option>
              {DOCS.map((d) => <option key={d.cab} value={String(d.cab)}>Ելք՝ Կաբինետ {d.cab} · {d.short}</option>)}
            </select>
          </label>
          <div className="flex flex-col max-h-[520px] overflow-y-auto">
            {moves.map((m) => {
              const it = itemById(m.itemId);
              const out = m.kind === 'out';
              const c = out ? ['#F8E6D8', '#8A4513'] : ['#DCEFE6', '#1F6B45'];
              return (
                <div key={m.id} className="flex gap-2.5 items-start py-2 border-t border-line2">
                  <span className="px-2 py-0.5 rounded-md text-[11.5px] font-bold" style={{ background: c[0], color: c[1] }}>{out ? 'Ելք' : 'Մուտք'}</span>
                  <span className="flex-1 min-w-0 flex flex-col">
                    <span className="text-[13px] font-semibold">{it.name}</span>
                    <span className="text-xs text-muted">{out ? 'Կաբինետ ' + m.cab : WH[it.wh]} · {m.time} · {m.by}</span>
                    {m.note && <span className="text-xs text-ink2 italic">«{m.note}»</span>}
                  </span>
                  <span className="font-bold tnum whitespace-nowrap" style={{ color: c[1] }}>{out ? '−' : '+'}{m.qty}</span>
                </div>
              );
            })}
            {moves.length === 0 && <p className="m-0 py-4 text-muted">Շարժեր չկան։</p>}
          </div>
        </Card>
      </div>

      {issueOpen && (
        <IssueModal
          ids={selIds}
          onClose={() => setIssueOpen(false)}
          onDone={() => { setIssueOpen(false); setSelected({}); }}
        />
      )}
    </div>
  );
}

function IssueModal({ ids, onClose, onDone }) {
  const { state: s, set, notify } = useStore();
  const [cab, setCab] = useState('');
  const [qty, setQty] = useState(() => Object.fromEntries(ids.map((id) => [id, 1])));
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');

  const setQ = (id, v) => {
    const n = Math.max(0, Math.min(s.stock[id], Number.isNaN(v) ? 0 : v));
    setQty((x) => ({ ...x, [id]: n }));
    setErr('');
  };

  const confirm = () => {
    if (!cab) return setErr('Ընտրեք կաբինետը։');
    const lines = ids.filter((id) => qty[id] > 0);
    if (!lines.length) return setErr('Նշեք առնվազն մեկ ապրանքի քանակ։');
    const c = Number(cab);
    const time = nowLabel();
    set((st) => {
      const stock = { ...st.stock };
      lines.forEach((id) => { stock[id] = Math.max(0, stock[id] - qty[id]); });
      const newMoves = lines.map((id, k) => ({ id: 'mv' + (st.moveId + k), kind: 'out', itemId: id, qty: qty[id], cab: c, by: 'Նունե Զաքարյան', time, note: note.trim() }));
      return { stock, moves: [...newMoves, ...st.moves], moveId: st.moveId + lines.length };
    });
    notify('stock', `Ելք՝ Կաբինետ ${c}`, `${lines.length} անուն ապրանք · ${lines.map((id) => `${itemById(id).name} ×${qty[id]}`).join(', ')}`);
    lines.forEach((id) => {
      const it = itemById(id);
      const left = s.stock[id] - qty[id];
      if (left <= it.min && s.stock[id] > it.min) notify('stock', 'Ցածր մնացորդ՝ ' + it.name, `Մնացել է ${left} ${it.unit}, նվազագույնը՝ ${it.min}`);
    });
    onDone();
  };

  const qBtn = 'w-9 h-9 rounded-[10px] border border-line bg-white text-lg leading-none hover:bg-soft';

  return (
    <div className="fixed inset-0 bg-[rgba(16,48,44,0.45)] flex items-start justify-center px-4 py-12 overflow-y-auto z-50" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Ելք կաբինետ" className="w-full max-w-[600px] bg-white rounded-[18px] p-6 flex flex-col gap-4 shadow-[0_24px_60px_rgba(16,48,44,0.25)]">
        <div className="flex justify-between items-center gap-3">
          <h2 className="m-0 font-serif text-[22px] font-bold">Ելք պահեստից</h2>
          <button type="button" onClick={onClose} aria-label="Փակել" className="w-10 h-10 rounded-[10px] hover:bg-[#EEF2F0] flex items-center justify-center">
            <Icon d={ICONS.close} size={18} stroke="#3E4B48" width={2} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <span className="font-semibold text-[13px]">Կաբինետ</span>
          <div className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(100px,1fr))]">
            {DOCS.map((d) => {
              const on = cab === String(d.cab);
              return (
                <button key={d.cab} type="button" aria-pressed={on} onClick={() => { setCab(String(d.cab)); setErr(''); }} className="flex flex-col items-start px-3 py-2 rounded-xl text-left" style={{ border: `1.5px solid ${on ? d.color : '#DDE3DF'}`, background: on ? d.tint : '#FFFFFF' }}>
                  <span className="font-bold">Կաբինետ {d.cab}</span>
                  <span className="text-xs text-muted">{d.short}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col">
          <span className="font-semibold text-[13px] mb-1">Ապրանքներ և քանակ</span>
          {ids.map((id) => {
            const it = itemById(id);
            return (
              <div key={id} className="flex items-center gap-3 py-2 border-t border-line2">
                <span className="flex-1 min-w-0 flex flex-col">
                  <span className="text-[13.5px] font-semibold">{it.name}</span>
                  <span className="text-xs text-muted">Հասանելի՝ {s.stock[id]} {it.unit} · մնալու է {s.stock[id] - (qty[id] || 0)}</span>
                </span>
                <button type="button" aria-label="Պակասեցնել" className={qBtn} onClick={() => setQ(id, (qty[id] || 0) - 1)}>−</button>
                <input type="number" min="0" max={s.stock[id]} value={qty[id]} onChange={(e) => setQ(id, parseInt(e.target.value, 10))} aria-label={'Քանակ ' + it.name} className="w-14 h-9 text-center border border-line rounded-[10px] tnum font-bold" />
                <button type="button" aria-label="Ավելացնել" className={qBtn} onClick={() => setQ(id, (qty[id] || 0) + 1)}>+</button>
              </div>
            );
          })}
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="font-semibold text-[13px]">Նշում (ըստ ցանկության)</span>
          <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="օր.՝ Դր. Մելքոնյանի խնդրանքով" className="h-11 px-3 border border-[#CBD3CF] rounded-[10px]" />
        </label>

        {err && <div className="px-3.5 py-2.5 rounded-[10px] bg-danger-bg text-danger-fg font-semibold">{err}</div>}

        <div className="flex justify-end gap-2 flex-wrap">
          <button type="button" onClick={onClose} className={btn.ghost}>Չեղարկել</button>
          <button type="button" onClick={confirm} className={btn.primary}>Հաստատել ելքը</button>
        </div>
      </div>
    </div>
  );
}
