import { useStore } from '../store.jsx';
import { DOCS, NOW, STATUS } from '../data.js';
import { dayInfo, deco, getPat, hm, money } from '../utils.js';
import { Chip, H2, Icon, ICONS, Pill } from '../components/ui.jsx';

const hours = Array.from({ length: 11 }, (_, i) => 9 + i);
const navBtn = 'w-11 h-11 rounded-xl border border-line bg-white flex items-center justify-center hover:bg-soft';

export default function Calendar() {
  const { state: s, set, setStatus, notify } = useStore();
  const { label: dayLabel, closed } = dayInfo(s.dayOff);
  const dayAppts = s.appts.filter((a) => a.day === s.dayOff);
  const cols = DOCS.filter((d) => s.calDoc === 'all' || s.calDoc === d.id);
  const selRaw = s.appts.find((a) => a.id === s.selAppt);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Նախորդ օր" className={navBtn} onClick={() => set((x) => ({ dayOff: x.dayOff - 1, selAppt: null }))}><Icon d={ICONS.left} size={18} width={2} /></button>
          <button type="button" className="h-11 px-4 rounded-xl border border-line bg-white font-semibold hover:bg-soft" onClick={() => set({ dayOff: 0 })}>Այսօր</button>
          <button type="button" aria-label="Հաջորդ օր" className={navBtn} onClick={() => set((x) => ({ dayOff: x.dayOff + 1, selAppt: null }))}><Icon d={ICONS.right} size={18} width={2} /></button>
          <span className="ml-2 font-serif text-[19px] font-semibold">{dayLabel}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip on={s.calDoc === 'all'} dot="#142321" onClick={() => set({ calDoc: 'all' })}>Բոլոր բժիշկները</Chip>
          {DOCS.map((d) => <Chip key={d.id} on={s.calDoc === d.id} dot={d.color} onClick={() => set({ calDoc: d.id })}>{d.short}</Chip>)}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex-[999_1_640px] min-w-0 bg-white border border-line rounded-2xl overflow-hidden">
          {closed ? (
            <div className="px-6 py-16 text-center text-muted flex flex-col gap-1.5 items-center">
              <span className="text-[17px] font-semibold text-ink">Կիրակի՝ կլինիկան փակ է</span>
              <span>Ընտրեք այլ օր՝ այցերը դիտելու համար։</span>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <div className="flex pb-3" style={{ minWidth: cols.length > 1 ? 940 : 300 }}>
                  <div className="basis-[60px] shrink-0 border-r border-line2">
                    <div className="h-16 border-b border-line" />
                    <div className="relative h-[600px] mt-2.5">
                      {hours.map((h) => (
                        <span key={h} className="absolute right-2 -translate-y-1/2 text-[11.5px] text-muted tnum" style={{ top: (h - 9) * 60 }}>{hm(h)}</span>
                      ))}
                    </div>
                  </div>
                  {cols.map((d) => {
                    const list = dayAppts.filter((a) => a.doc === d.id).sort((a, b) => a.start - b.start);
                    return (
                      <div key={d.id} className="flex-1 min-w-[170px] border-r border-line2">
                        <div className="h-16 px-3 py-2.5 border-b border-line flex flex-col justify-center">
                          <span className="font-bold">Կաբինետ {d.cab}</span>
                          <span className="flex items-center gap-1.5 text-[12.5px] text-ink2"><span className="w-2 h-2 rounded" style={{ background: d.color }} />{d.short} · {list.length} այց</span>
                        </div>
                        <div className="relative h-[600px] mt-2.5" style={{ backgroundImage: 'repeating-linear-gradient(to bottom, #EEF1EF 0, #EEF1EF 1px, transparent 1px, transparent 60px)' }}>
                          {list.map(deco).map((a) => {
                            const long = a.end - a.start >= 0.9;
                            return (
                              <button
                                key={a.id}
                                type="button"
                                onClick={() => set({ selAppt: a.id })}
                                className="absolute left-[5px] right-[5px] px-2 py-1.5 rounded-[9px] text-left overflow-hidden flex flex-col gap-px hover:brightness-95"
                                style={{
                                  top: Math.round((a.start - 9) * 60) + 2,
                                  height: Math.max(28, Math.round((a.end - a.start) * 60) - 4),
                                  background: a.status === 'noshow' ? '#F7E0DE' : d.tint,
                                  boxShadow: s.selAppt === a.id ? `0 0 0 2px ${d.color}` : 'none',
                                  opacity: a.status === 'done' ? 0.6 : 1,
                                }}
                              >
                                <span className="flex items-center gap-1.5 text-[11.5px] font-bold tnum" style={{ color: d.color }}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: d.color }} />{a.time}
                                </span>
                                <span className="text-[13px] font-semibold text-ink truncate max-w-full">{a.patient}</span>
                                {long && (
                                  <>
                                    <span className="text-xs text-ink2 truncate max-w-full">{a.proc}</span>
                                    <span className="mt-0.5 self-start px-2 py-px rounded-full text-[11px] font-semibold" style={{ background: a.stBg, color: a.stFg }}>{a.stLabel}</span>
                                  </>
                                )}
                              </button>
                            );
                          })}
                          {s.dayOff === 0 && <div className="absolute inset-x-0 h-0.5 bg-danger pointer-events-none" style={{ top: Math.round((NOW - 9) * 60) }} />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {dayAppts.length === 0 && (
                <div className="px-5 py-3.5 border-t border-line2 text-muted">Այս օրվա համար այցեր դեռ գրանցված չեն․ սեղմեք «Նոր այց»։</div>
              )}
            </>
          )}
        </div>

        <aside className="flex-[1_1_300px] min-w-0 bg-white border border-line rounded-2xl p-5 flex flex-col gap-3.5">
          {!selRaw ? (
            <>
              <H2>Այցի մանրամասներ</H2>
              <p className="m-0 text-muted">Ընտրեք այցը օրացույցում՝ կարգավիճակը փոխելու կամ պացիենտին հիշեցում ուղարկելու համար։</p>
              <div className="flex flex-col gap-2 pt-1.5">
                <span className="text-[12.5px] text-muted font-semibold">Կարգավիճակներ</span>
                {Object.values(STATUS).map((l) => <Pill key={l.label} bg={l.bg} fg={l.fg} className="self-start">{l.label}</Pill>)}
              </div>
            </>
          ) : (
            <SelectedAppt a={deco(selRaw)} onClose={() => set({ selAppt: null })} setStatus={setStatus} notify={notify} />
          )}
        </aside>
      </div>
    </div>
  );
}

function SelectedAppt({ a, onClose, setStatus, notify }) {
  const p = getPat(a.patient);
  const actionCls = 'min-h-11 rounded-[10px] font-semibold';
  return (
    <>
      <div className="flex justify-between items-start gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[12.5px] text-muted tnum">{a.time} · {a.cabLabel}</span>
          <span className="text-[19px] font-bold">{a.patient}</span>
          <span className="text-ink2">{a.proc}</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Փակել" className="w-9 h-9 rounded-lg hover:bg-[#EEF2F0] flex items-center justify-center shrink-0">
          <Icon d={ICONS.close} size={18} stroke="#3E4B48" width={2} />
        </button>
      </div>
      <Pill bg={a.stBg} fg={a.stFg} className="self-start">{a.stLabel}</Pill>
      <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-3.5 gap-y-2 text-[13.5px]">
        <dt className="text-muted">Բժիշկ</dt><dd className="m-0 font-semibold">{a.docName}</dd>
        <dt className="text-muted">Հեռախոս</dt><dd className="m-0">{p ? p.phone : '—'}</dd>
        <dt className="text-muted">Արժեք</dt><dd className="m-0 tnum">{a.priceLabel}</dd>
        <dt className="text-muted">Ալերգիա</dt><dd className="m-0 font-semibold" style={{ color: p?.allergy ? '#9A241C' : '#142321' }}>{p?.allergy || 'Չկա'}</dd>
      </dl>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => setStatus(a.id, 'conf')} className={`${actionCls} border border-[#CFE3DC] bg-ok-bg text-ok-fg`}>Հաստատել</button>
        <button type="button" onClick={() => setStatus(a.id, 'now')} className={`${actionCls} bg-brand text-white`}>Սկսել</button>
        <button type="button" onClick={() => { setStatus(a.id, 'done'); notify('pay', 'Այցն ավարտված է', `${a.patient} · ${a.price ? money(a.price) : 'Անվճար'}`); }} className={`${actionCls} border border-line bg-white`}>Ավարտել</button>
        <button type="button" onClick={() => { setStatus(a.id, 'noshow'); notify('appt', 'Պացիենտը չներկայացավ', `${a.patient} · ${a.startLabel}`); }} className={`${actionCls} border border-[#EBC8C4] bg-white text-danger-fg`}>Չներկայացավ</button>
      </div>
      <button type="button" onClick={() => notify('system', 'Հիշեցումն ուղարկված է', `${a.patient} · ${a.startLabel} · SMS և Viber`)} className={`${actionCls} flex items-center justify-center gap-2 border border-line bg-soft`}>
        <Icon d={ICONS.chat} size={18} width={1.8} />
        Ուղարկել հիշեցում (SMS / Viber)
      </button>
    </>
  );
}
