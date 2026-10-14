import { useStore } from '../store.jsx';
import { ATT, STAFF, TODAY_COL } from '../data.js';
import { parseShift } from '../utils.js';
import { Card, H2, Pill } from '../components/ui.jsx';

const DAYS = ['Երկ 5', 'Երք 6', 'Չրք 7', 'Հնգ 8', 'Ուրբ 9', 'Շբթ 10'];
const ATT_ST = { ok: ['Ժամանակին', '#DCEFE6', '#1F6B45'], late: [null, '#FBEBD9', '#8A4513'], wait: [null, '#E6ECEA', '#3E4B48'] };

export default function WorkTime() {
  const { state: s, set, notify } = useStore();
  const rows = STAFF.map((x) => ({ ...x, hours: x.week.reduce((t, w) => t + parseShift(w), 0) }));
  const total = rows.reduce((t, r) => t + r.hours, 0);

  const decide = (l, st) => {
    set((x) => ({ leaves: x.leaves.map((y) => (y.id === l.id ? { ...y, st } : y)) }));
    if (st === 'ok') notify('staff', 'Հայտը հաստատված է', `${l.name} · ${l.dates}`);
  };

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-3">
        <div className="flex flex-wrap justify-between items-baseline gap-2.5">
          <H2>Շաբաթվա աշխատանքային գրաֆիկ · 5–10 հոկտեմբեր</H2>
          <span className="text-[12.5px] text-muted">Ընդամենը պլանավորված՝ {total} ժամ</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-[13px]">
            <thead>
              <tr className="text-left text-muted text-[12.5px]">
                <th className="p-2 font-semibold border-b border-line">Աշխատակից</th>
                {DAYS.map((d, i) => (
                  <th key={d} className={`p-2 border-b border-line text-center ${i === TODAY_COL ? 'font-bold text-brand' : 'font-semibold'}`}>{i === TODAY_COL ? d + ' · այսօր' : d}</th>
                ))}
                <th className="p-2 font-semibold border-b border-line text-right">Ժամեր</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="p-2 border-b border-line2"><span className="flex flex-col"><span className="font-semibold">{r.name}</span><span className="text-xs text-muted">{r.role}</span></span></td>
                  {r.week.map((w, i) => {
                    const today = i === TODAY_COL;
                    return (
                      <td key={i} className={`px-1 py-1.5 border-b border-line2 text-center ${today ? 'bg-[#F5FAF8]' : ''}`}>
                        <span className="inline-block min-w-16 px-2 py-[5px] rounded-lg font-semibold text-[12.5px] tnum" style={{ background: w ? (today ? '#0E7C74' : '#DCF0EC') : 'transparent', color: w ? (today ? '#FFFFFF' : '#0B5F59') : '#8E9A96' }}>
                          {w || 'Հանգիստ'}
                        </span>
                      </td>
                    );
                  })}
                  <td className="p-2 border-b border-line2 text-right font-bold tnum">{r.hours} ժ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(min(420px,100%),1fr))]">
        <Card className="gap-1.5">
          <H2 className="mb-1.5">Այսօրվա հաճախումներ</H2>
          {ATT.map(([name, role, inTime, code, note]) => {
            const m = ATT_ST[code];
            return (
              <div key={name} className="flex items-center gap-3 py-2 border-t border-line2">
                <span className="flex-1 min-w-0 flex flex-col"><span className="font-semibold">{name}</span><span className="text-xs text-muted">{role}</span></span>
                <span className="tnum font-semibold">{inTime}</span>
                <Pill bg={m[1]} fg={m[2]}>{m[0] || note}</Pill>
              </div>
            );
          })}
        </Card>
        <Card className="gap-2.5">
          <H2 className="mb-1">Արձակուրդի և բացակայության հայտեր</H2>
          {s.leaves.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center gap-3 py-3 border-t border-line2">
              <span className="flex-[1_1_200px] flex flex-col"><span className="font-semibold">{l.name}</span><span className="text-[12.5px] text-muted">{l.kind} · {l.dates}</span></span>
              {l.st === 'pend' ? (
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => decide(l, 'ok')} className="min-h-10 px-3.5 rounded-[10px] bg-brand hover:bg-brand-dark text-white font-semibold">Հաստատել</button>
                  <button type="button" onClick={() => decide(l, 'no')} className="min-h-10 px-3.5 rounded-[10px] border border-line bg-white font-semibold hover:bg-soft">Մերժել</button>
                </div>
              ) : (
                <Pill bg={l.st === 'ok' ? '#DCEFE6' : '#F7E0DE'} fg={l.st === 'ok' ? '#1F6B45' : '#9A241C'}>{l.st === 'ok' ? 'Հաստատված' : 'Մերժված'}</Pill>
              )}
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
