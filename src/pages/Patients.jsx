import { useStore } from '../store.jsx';
import { PATS, TOOTH } from '../data.js';
import { getDoc, initials, money } from '../utils.js';
import { Card, H2, Icon, ICONS, SearchBox, btn } from '../components/ui.jsx';

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

export default function Patients() {
  const { state: s, set, notify, openModal } = useStore();
  const q = s.patQuery.trim().toLowerCase();
  const list = PATS.filter((p) => !q || p.name.toLowerCase().includes(q) || p.phone.replace(/\s/g, '').includes(q.replace(/\s/g, '')));
  const P = PATS.find((p) => p.id === s.patSel) || PATS[0];
  const PD = getDoc(P.doc);

  const base = {};
  P.teeth.split(' ').filter(Boolean).forEach((t) => { base[t.slice(0, 2)] = t.slice(2); });
  const edits = s.teethEdit[P.id] || {};
  const applyTooth = (n) => set((st) => ({ teethEdit: { ...st.teethEdit, [P.id]: { ...(st.teethEdit[P.id] || {}), [n]: st.tool } } }));
  const planTotal = P.plan.reduce((t, x) => t + x[1], 0);

  const Tooth = ({ n, upper }) => {
    const T = TOOTH[edits[n] || base[n] || 'h'];
    const shape = (
      <span className="w-full h-8 transition-colors" style={{ background: T.bg, border: `1.5px ${T.bs} ${T.bc}`, borderRadius: upper ? '6px 6px 11px 11px' : '11px 11px 6px 6px' }} />
    );
    const num = <span className="text-[10.5px] text-muted tnum">{n}</span>;
    return (
      <button type="button" onClick={() => applyTooth(String(n))} aria-label={`Ատամ ${n}՝ ${T.label}`} className="flex flex-col items-center gap-[3px] hover:scale-105 transition-transform">
        {upper ? <>{num}{shape}</> : <>{shape}{num}</>}
      </button>
    );
  };

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <Card className="flex-[999_1_560px] min-w-0 gap-3.5">
        <div className="flex flex-wrap justify-between items-center gap-3">
          <H2>Պացիենտների բազա · {list.length} պացիենտ</H2>
          <SearchBox value={s.patQuery} onChange={(v) => set({ patQuery: v })} placeholder="Անուն կամ հեռախոս" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[660px] border-collapse text-[13.5px]">
            <thead>
              <tr className="text-left text-muted text-[12.5px]">
                {['Պացիենտ', 'Բժիշկ', 'Վերջին այց', 'Հաջորդ այց'].map((h) => <th key={h} className="p-2 font-semibold border-b border-line">{h}</th>)}
                <th className="p-2 font-semibold border-b border-line text-right">Պարտք</th>
                <th className="p-2 font-semibold border-b border-line">Պիտակ</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => {
                const d = getDoc(p.doc);
                return (
                  <tr key={p.id} className={s.patSel === p.id ? 'bg-[#EAF4F1]' : 'hover:bg-soft'}>
                    <td className="px-2 py-1.5 border-b border-line2">
                      <button type="button" onClick={() => set({ patSel: p.id })} className="flex items-center gap-2.5 py-1 text-left min-h-11 w-full">
                        <span className="basis-[34px] shrink-0 h-[34px] rounded-full font-bold text-xs flex items-center justify-center" style={{ background: d.tint, color: d.color }}>{initials(p.name)}</span>
                        <span className="flex flex-col"><span className="font-semibold">{p.name}</span><span className="text-xs text-muted tnum">{p.phone}</span></span>
                      </button>
                    </td>
                    <td className="px-2 py-1.5 border-b border-line2 whitespace-nowrap">{d.short}</td>
                    <td className="px-2 py-1.5 border-b border-line2 tnum">{p.last}</td>
                    <td className="px-2 py-1.5 border-b border-line2 tnum">{p.next}</td>
                    <td className="px-2 py-1.5 border-b border-line2 text-right tnum font-semibold whitespace-nowrap" style={{ color: p.bal ? '#9A241C' : '#55625F' }}>{p.bal ? money(p.bal) : '—'}</td>
                    <td className="px-2 py-1.5 border-b border-line2"><span className="px-2.5 py-[3px] rounded-full text-xs font-semibold bg-[#EEF2F0] text-ink2 whitespace-nowrap">{p.tag}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <p className="m-0 text-muted">Ոչինչ չի գտնվել։ Փորձեք այլ անուն կամ հեռախոսահամար։</p>}
      </Card>

      <Card className="flex-[1_1_500px] min-w-0 gap-4">
        <div className="flex gap-3.5 items-center">
          <span className="basis-14 shrink-0 h-14 rounded-full font-bold text-lg flex items-center justify-center" style={{ background: PD.tint, color: PD.color }}>{initials(P.name)}</span>
          <div className="flex-1 min-w-0 flex flex-col">
            <span className="font-serif text-[21px] font-bold">{P.name}</span>
            <span className="text-muted tnum">{2026 - P.birth} տարեկան · {P.phone}</span>
          </div>
        </div>
        {P.allergy && (
          <div className="flex gap-2.5 items-center px-3.5 py-2.5 rounded-xl bg-warn-bg text-[#7A3A0F] font-semibold">
            <Icon d={ICONS.warn} size={18} width={2} />Ալերգիա՝ {P.allergy}
          </div>
        )}
        <div className="grid gap-2.5 grid-cols-[repeat(auto-fit,minmax(min(130px,100%),1fr))]">
          {[['Բժիշկ', PD.short], ['Հաջորդ այց', P.next], ['Պարտք', P.bal ? money(P.bal) : 'Չկա', P.bal ? '#9A241C' : undefined], ['Աղբյուր', P.src]].map(([l, v, c]) => (
            <div key={l} className="px-3 py-2.5 rounded-xl bg-soft flex flex-col"><span className="text-xs text-muted">{l}</span><span className="font-semibold" style={{ color: c }}>{v}</span></div>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-baseline gap-2.5 flex-wrap">
            <h3 className="m-0 text-[15px] font-bold">Ատամնաբանաձև</h3>
            <span className="text-xs text-muted">Ընտրեք կարգավիճակ և սեղմեք ատամին</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(TOOTH).map(([k, T]) => (
              <button key={k} type="button" onClick={() => set({ tool: k })} aria-pressed={s.tool === k} className="inline-flex items-center gap-1.5 min-h-[34px] px-2.5 rounded-full bg-white text-[12.5px] font-semibold" style={{ border: `1.5px solid ${s.tool === k ? '#142321' : '#DDE3DF'}` }}>
                <span className="w-3 h-3 rounded" style={{ background: T.bg, border: `1.5px ${T.bs} ${T.bc}` }} />{T.label}
              </button>
            ))}
          </div>
          <div className="border border-line2 rounded-xl px-2.5 py-3 flex flex-col gap-2 overflow-x-auto">
            <div className="grid grid-cols-[repeat(16,minmax(22px,1fr))] gap-[3px] min-w-[400px]">{UPPER.map((n) => <Tooth key={n} n={n} upper />)}</div>
            <div className="h-px bg-line min-w-[400px]" />
            <div className="grid grid-cols-[repeat(16,minmax(22px,1fr))] gap-[3px] min-w-[400px]">{LOWER.map((n) => <Tooth key={n} n={n} />)}</div>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(210px,100%),1fr))]">
          <div className="flex flex-col gap-2">
            <h3 className="m-0 text-[15px] font-bold">Բուժման պլան</h3>
            {P.plan.map(([proc, price]) => (
              <div key={proc} className="flex justify-between gap-2.5 py-2 border-t border-line2 text-[13px]"><span>{proc}</span><span className="font-semibold whitespace-nowrap tnum">{money(price)}</span></div>
            ))}
            <div className="flex justify-between gap-2.5 pt-2 border-t border-line font-bold"><span>Ընդամենը</span><span className="tnum">{money(planTotal)}</span></div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="m-0 text-[15px] font-bold">Այցերի պատմություն</h3>
            {P.hist.map(([date, proc, doc]) => (
              <div key={date + proc} className="flex flex-col py-2 border-t border-line2 text-[13px]"><span className="font-semibold">{proc}</span><span className="text-xs text-muted tnum">{date} · {getDoc(doc).short}</span></div>
            ))}
            {P.hist.length === 0 && <span className="text-[13px] text-muted">Առաջին այցը դեռ չի կայացել։</span>}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={`flex-[1_1_160px] ${btn.primary}`} onClick={() => openModal({ patient: P.name, phone: P.phone, doc: P.doc, proc: P.plan[0] ? P.plan[0][0] : '', time: '17:00', dur: '60' })}>Գրանցել այցի</button>
          <button type="button" className={`flex-[1_1_160px] ${btn.ghost}`} onClick={() => notify('system', 'Հիշեցումն ուղարկված է', `${P.name} · ${P.phone}`)}>Ուղարկել հիշեցում</button>
        </div>
      </Card>
    </div>
  );
}
