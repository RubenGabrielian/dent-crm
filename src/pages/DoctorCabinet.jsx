import { useStore } from '../store.jsx';
import { DOCS, ITEMS, MATS, STAFF, TODAY_COL } from '../data.js';
import { deco, getDoc, getPat, money } from '../utils.js';
import { H2, Pill, Stat, btn } from '../components/ui.jsx';

export default function DoctorCabinet() {
  const { state: s, set, setStatus, notify } = useStore();
  const D = getDoc(s.dcDoc);
  const mine = s.appts.filter((a) => a.day === 0 && a.doc === D.id).sort((a, b) => a.start - b.start);
  const fallback = mine.find((a) => a.status === 'now') || mine.find((a) => a.status === 'conf' || a.status === 'pend');
  const curRaw = mine.find((a) => a.id === s.dcActive) || fallback;
  const cur = curRaw && deco(curRaw);
  const p = curRaw && getPat(curRaw.patient);
  const done = mine.filter((a) => a.status === 'done');
  const shift = STAFF.find((x) => x.id === D.staff).week[TODAY_COL] || 'Հանգստյան օր';

  const stats = [
    ['Պացիենտներ այսօր', mine.length],
    ['Ավարտված', done.length],
    ['Կատարված աշխատանք', money(done.reduce((t, a) => t + a.price, 0))],
    ['Մնացած այցեր', mine.filter((a) => a.status === 'conf' || a.status === 'pend').length],
  ];

  const changeQty = (id, delta) => set((st) => ({ dcMat: { ...st.dcMat, [id]: Math.max(0, Math.min((st.dcMat[id] || 0) + delta, st.stock[id])) } }));

  const finish = () => {
    const used = Object.keys(s.dcMat).filter((k) => s.dcMat[k] > 0);
    set((st) => {
      const stock = { ...st.stock };
      used.forEach((k) => { stock[k] = Math.max(0, stock[k] - st.dcMat[k]); });
      const d = new Date();
      const time = 'այսօր ' + String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
      const newMoves = used.map((k, n) => ({ id: 'mv' + (st.moveId + n), kind: 'out', itemId: k, qty: st.dcMat[k], cab: D.cab, by: D.short, time, note: curRaw.patient }));
      return { stock, moves: [...newMoves, ...st.moves], moveId: st.moveId + used.length, dcMat: {}, dcNotes: '', dcActive: null, appts: st.appts.map((a) => (a.id === curRaw.id ? { ...a, status: 'done' } : a)) };
    });
    notify('appt', 'Այցն ավարտված է՝ ' + curRaw.patient, `${D.short} · ${used.length ? used.length + ' անուն նյութ դուրս է գրվել պահեստից' : 'Նյութեր չեն օգտագործվել'}`);
    used.forEach((k) => {
      const it = ITEMS.find((i) => i.id === k);
      const left = s.stock[k] - s.dcMat[k];
      if (left <= it.min && s.stock[k] > it.min) notify('stock', 'Ցածր մնացորդ՝ ' + it.name, `Մնացել է ${left} ${it.unit}, նվազագույնը՝ ${it.min}`);
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <span className="w-[52px] h-[52px] rounded-full text-white font-bold flex items-center justify-center" style={{ background: D.color }}>{D.ini}</span>
          <span className="flex flex-col">
            <span className="font-serif text-[21px] font-bold">Բարի օր, Դր. {D.first}</span>
            <span className="text-muted">{D.spec} · Կաբինետ {D.cab} · Հերթափոխ՝ {shift}</span>
          </span>
        </div>
        <label className="flex items-center gap-2 text-[13px] text-muted">Մուտք որպես
          <select value={s.dcDoc} onChange={(e) => set({ dcDoc: e.target.value, dcActive: null, dcMat: {}, dcNotes: '' })} className="h-10 px-2.5 border border-line rounded-[10px] bg-white text-ink">
            {DOCS.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>
      </div>

      <div className="grid gap-3 grid-cols-[repeat(auto-fit,minmax(min(180px,100%),1fr))]">
        {stats.map(([l, v]) => <Stat key={l} label={l} value={v} />)}
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        <section className="flex-[1_1_320px] min-w-0 bg-white border border-line rounded-2xl p-5 flex flex-col gap-2">
          <H2 className="mb-1">Իմ այսօրվա հերթը</H2>
          {mine.map(deco).map((q) => {
            const active = curRaw && curRaw.id === q.id;
            return (
              <button key={q.id} type="button" onClick={() => set({ dcActive: q.id, dcMat: {}, dcNotes: '' })} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left min-h-14" style={{ border: `1.5px solid ${active ? D.color : '#EEF1EF'}`, background: active ? D.tint : '#FFFFFF' }}>
                <span className="basis-12 shrink-0 font-bold tnum">{q.startLabel}</span>
                <span className="flex-1 min-w-0 flex flex-col"><span className="font-semibold">{q.patient}</span><span className="text-[12.5px] text-muted">{q.proc}</span></span>
                <Pill bg={q.stBg} fg={q.stFg} className="!text-[11.5px]">{q.stLabel}</Pill>
              </button>
            );
          })}
          {mine.length === 0 && <p className="m-0 text-muted">Այսօր այցեր չկան։</p>}
        </section>

        <section className="flex-[999_1_520px] min-w-0 bg-white border border-line rounded-2xl p-5 flex flex-col gap-4">
          {!cur ? (
            <p className="m-0 text-muted">Այսօր ակտիվ ընդունելություն չկա։</p>
          ) : (
            <>
              <div className="flex flex-wrap justify-between items-start gap-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12.5px] text-muted tnum">Ընթացիկ ընդունելություն · {cur.time}</span>
                  <span className="text-[21px] font-bold">{cur.patient}</span>
                  <span className="text-ink2">{cur.proc} · {cur.priceLabel}</span>
                </div>
                <Pill bg={cur.stBg} fg={cur.stFg} className="!text-[12.5px] !px-3 !py-1">{cur.stLabel}</Pill>
              </div>
              {p?.allergy && <div className="px-3.5 py-2.5 rounded-xl bg-warn-bg text-[#7A3A0F] font-semibold">Ուշադրություն․ ալերգիա՝ {p.allergy}</div>}
              <label className="flex flex-col gap-1.5">
                <span className="font-semibold">Բժշկական նշումներ</span>
                <textarea value={s.dcNotes} onChange={(e) => set({ dcNotes: e.target.value })} rows={4} placeholder="Գանգատներ, կատարված աշխատանք, նշանակումներ…" className="resize-y px-3 py-2.5 border border-line rounded-[10px] bg-[#FBFCFB]" />
              </label>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-baseline gap-2.5 flex-wrap">
                  <span className="font-semibold">Օգտագործված նյութեր</span>
                  <span className="text-xs text-muted">Ավարտելիս դուրս կգրվեն պահեստից</span>
                </div>
                {MATS.map((id) => {
                  const it = ITEMS.find((i) => i.id === id);
                  const left = s.stock[id];
                  const qBtn = 'w-9 h-9 rounded-[10px] border border-line bg-white text-lg leading-none hover:bg-soft';
                  return (
                    <div key={id} className="flex items-center gap-3 py-1.5 border-t border-line2">
                      <span className="flex-1 min-w-0 flex flex-col">
                        <span className="text-[13.5px]">{it.name}</span>
                        <span className="text-xs" style={{ color: left <= it.min ? '#9A241C' : '#55625F' }}>Պահեստում՝ {left} {it.unit}</span>
                      </span>
                      <button type="button" aria-label="Պակասեցնել" className={qBtn} onClick={() => changeQty(id, -1)}>−</button>
                      <span className="w-7 text-center font-bold tnum">{s.dcMat[id] || 0}</span>
                      <button type="button" aria-label="Ավելացնել" className={qBtn} onClick={() => changeQty(id, 1)}>+</button>
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={`flex-[1_1_160px] ${btn.ghost}`} onClick={() => { setStatus(curRaw.id, 'now'); set({ dcActive: curRaw.id }); }}>Սկսել ընդունելությունը</button>
                <button type="button" className={`flex-[2_1_240px] ${btn.primary}`} onClick={finish}>Ավարտել այցը և դուրս գրել նյութերը</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
