import { useEffect } from 'react';
import { useStore } from '../store.jsx';
import { DOCS } from '../data.js';
import { dayInfo, getDoc, hm } from '../utils.js';
import { Icon, ICONS, btn } from './ui.jsx';

const timeOptions = [];
for (let t = 9; t < 19; t += 0.5) timeOptions.push(hm(t));

const inputCls = 'h-11 px-3 border border-[#CBD3CF] rounded-[10px] bg-white';

export default function NewApptModal() {
  const { state: s, set, notify } = useStore();
  const { form, formErr } = s;
  const { label: dayLabel, closed } = dayInfo(s.dayOff);

  const close = () => set({ modal: false });
  const setF = (k) => (e) => {
    const v = e.target.value;
    set((x) => ({ form: { ...x.form, [k]: v }, formErr: '' }));
  };

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = () => {
    if (!form.patient.trim()) return set({ formErr: 'Նշեք պացիենտի անունը։' });
    if (closed) return set({ formErr: 'Կիրակի օրը կլինիկան փակ է։' });
    const [hh, mm] = form.time.split(':');
    const start = parseInt(hh, 10) + parseInt(mm, 10) / 60;
    const end = start + parseInt(form.dur, 10) / 60;
    if (end > 19) return set({ formErr: 'Այցը պետք է ավարտվի մինչև 19:00։' });
    const clash = s.appts.find((a) => a.day === s.dayOff && a.doc === form.doc && a.status !== 'noshow' && start < a.end && end > a.start);
    if (clash) return set({ formErr: `Այս ժամին բժիշկը զբաղված է (${hm(clash.start)}–${hm(clash.end)}, ${clash.patient})։` });

    const d = getDoc(form.doc);
    const id = 'x' + s.nid;
    set((x) => ({
      appts: [...x.appts, { id, day: x.dayOff, doc: form.doc, cab: d.cab, start, end, patient: form.patient.trim(), proc: form.proc.trim() || 'Խորհրդատվություն', status: 'pend', price: 0 }],
      modal: false, sec: 'cal', selAppt: id, calDoc: 'all',
    }));
    notify('appt', 'Նոր այց գրանցվեց', `${form.patient.trim()} · ${form.time} · ${d.short} · հաստատման հաղորդագրությունն ուղարկված է`);
  };

  return (
    <div className="fixed inset-0 bg-[rgba(16,48,44,0.45)] flex items-start justify-center px-4 py-12 overflow-y-auto z-50" onClick={(e) => e.target === e.currentTarget && close()}>
      <div role="dialog" aria-modal="true" aria-label="Նոր այց" className="w-full max-w-[560px] bg-white rounded-[18px] p-6 flex flex-col gap-4 shadow-[0_24px_60px_rgba(16,48,44,0.25)]">
        <div className="flex justify-between items-center gap-3">
          <h2 className="m-0 font-serif text-[22px] font-bold">Նոր այց</h2>
          <button type="button" onClick={close} aria-label="Փակել" className="w-10 h-10 rounded-[10px] hover:bg-[#EEF2F0] flex items-center justify-center">
            <Icon d={ICONS.close} size={18} stroke="#3E4B48" width={2} />
          </button>
        </div>
        <span className="text-muted -mt-2">{dayLabel}</span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5"><span className="font-semibold text-[13px]">Պացիենտ</span>
            <input type="text" value={form.patient} onChange={setF('patient')} placeholder="Անուն Ազգանուն" className={inputCls} autoFocus /></label>
          <label className="flex flex-col gap-1.5"><span className="font-semibold text-[13px]">Հեռախոս</span>
            <input type="tel" value={form.phone} onChange={setF('phone')} placeholder="+374 __ ___ ___" className={inputCls} /></label>
          <label className="flex flex-col gap-1.5"><span className="font-semibold text-[13px]">Բժիշկ</span>
            <select value={form.doc} onChange={setF('doc')} className={inputCls}>
              {DOCS.map((d) => <option key={d.id} value={d.id}>{d.name} · {d.spec}</option>)}
            </select></label>
          <label className="flex flex-col gap-1.5"><span className="font-semibold text-[13px]">Ծառայություն</span>
            <input type="text" value={form.proc} onChange={setF('proc')} placeholder="օր.՝ Լցոնում, մաքրում" className={inputCls} /></label>
          <label className="flex flex-col gap-1.5"><span className="font-semibold text-[13px]">Սկիզբ</span>
            <select value={form.time} onChange={setF('time')} className={inputCls}>
              {timeOptions.map((t) => <option key={t} value={t}>{t}</option>)}
            </select></label>
          <label className="flex flex-col gap-1.5"><span className="font-semibold text-[13px]">Տևողություն</span>
            <select value={form.dur} onChange={setF('dur')} className={inputCls}>
              <option value="30">30 րոպե</option><option value="45">45 րոպե</option><option value="60">1 ժամ</option><option value="90">1.5 ժամ</option><option value="120">2 ժամ</option>
            </select></label>
        </div>

        <span className="text-[13px] text-ink2">Պացիենտը կստանա հաստատման հաղորդագրություն և հիշեցում՝ ըստ «Ծանուցումներ» բաժնի կարգավորումների։</span>
        {formErr && <div className="px-3.5 py-2.5 rounded-[10px] bg-danger-bg text-danger-fg font-semibold">{formErr}</div>}

        <div className="flex justify-end gap-2 flex-wrap">
          <button type="button" onClick={close} className={btn.ghost}>Չեղարկել</button>
          <button type="button" onClick={save} className={btn.primary}>Գրանցել այցը</button>
        </div>
      </div>
    </div>
  );
}
