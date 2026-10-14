import { useStore } from '../store.jsx';
import { Card, Chip, H2, Icon, Toggle, btn } from '../components/ui.jsx';
import { decoNotif } from './Dashboard.jsx';

const TYPES = [['all', 'Բոլորը'], ['appt', 'Այցեր'], ['stock', 'Պահեստ'], ['patient', 'Պացիենտներ'], ['staff', 'Անձնակազմ'], ['pay', 'Ֆինանսներ'], ['system', 'Համակարգ']];

const CHANNELS = [['sms', 'SMS', 'Բոլոր օպերատորներ'], ['viber', 'Viber', 'Հաստատում պատասխանով'], ['tg', 'Telegram', 'Բոտի միջոցով'], ['email', 'Էլ. փոստ', 'Հաշիվներ և ամփոփումներ']];
const TIMING = [['r7', '1 շաբաթ առաջ', 'Պլանային և վերահսկիչ այցերի համար'], ['r24', '24 ժամ առաջ', 'Հաստատման խնդրանքով'], ['r2', '2 ժամ առաջ', 'Կարճ հիշեցում հասցեով']];
const RULES = [['lowstock', 'Ցածր մնացորդի ահազանգ', 'Ադմինիստրատորին և պահեստապետին'], ['noshow', 'Չներկայացած պացիենտներ', 'Բժշկին և ադմինիստրատորին'], ['bday', 'Ծննդյան օրեր', 'Շնորհավորական հաղորդագրության առաջարկ'], ['digest', 'Ամենօրյա ամփոփում', 'Ղեկավարին՝ ամեն երեկո 20:00-ին']];

export default function Notifications() {
  const { state: s, set } = useStore();
  const list = s.notifs.filter((n) => s.nFilter === 'all' || n.type === s.nFilter).map(decoNotif);

  const toggles = (rows) => rows.map(([key, label, desc]) => (
    <Toggle key={key} label={label} desc={desc} on={!!s.toggles[key]} onClick={() => set((x) => ({ toggles: { ...x.toggles, [key]: !x.toggles[key] } }))} />
  ));

  return (
    <div className="flex flex-wrap gap-4 items-start">
      <Card className="flex-[999_1_560px] min-w-0 gap-3">
        <div className="flex flex-wrap justify-between items-center gap-2.5">
          <div className="flex flex-wrap gap-1.5">
            {TYPES.map(([id, label]) => {
              const cnt = id === 'all' ? s.notifs.length : s.notifs.filter((n) => n.type === id).length;
              return <Chip key={id} on={s.nFilter === id} onClick={() => set({ nFilter: id })}>{label} · {cnt}</Chip>;
            })}
          </div>
          <button type="button" className={btn.link} onClick={() => set((x) => ({ notifs: x.notifs.map((n) => ({ ...n, read: true })) }))}>Նշել բոլորը կարդացված</button>
        </div>
        <div className="flex flex-col">
          {list.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => set((x) => ({ notifs: x.notifs.map((y) => (y.id === n.id ? { ...y, read: !y.read } : y)) }))}
              className={`flex gap-3.5 items-start px-3 py-3.5 border-t border-line2 text-left rounded-[10px] ${n.unread ? 'bg-[#F1F7F5]' : 'hover:bg-soft'}`}
            >
              <span className="basis-[38px] shrink-0 h-[38px] rounded-[11px] flex items-center justify-center" style={{ background: n.bg }}>
                <Icon d={n.icon} size={18} stroke={n.fg} width={1.9} />
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-0.5">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className={n.unread ? 'font-bold' : 'font-medium'}>{n.title}</span>
                  <span className="text-[11.5px] font-semibold" style={{ color: n.fg }}>{n.typeLabel}</span>
                </span>
                <span className="text-[13px] text-ink2">{n.text}</span>
              </span>
              <span className="flex items-center gap-2 text-xs text-muted whitespace-nowrap">
                {n.time}
                <span className="w-2 h-2 rounded" style={{ background: n.unread ? '#B3261E' : 'transparent' }} />
              </span>
            </button>
          ))}
          {list.length === 0 && <p className="m-0 py-5 text-muted">Այս կատեգորիայում ծանուցումներ չկան։</p>}
        </div>
      </Card>

      <aside className="flex-[1_1_340px] min-w-0 flex flex-col gap-4">
        <Card>
          <H2 className="mb-1">Ուղարկման ալիքներ</H2>
          {toggles(CHANNELS)}
        </Card>
        <Card>
          <H2 className="mb-1">Պացիենտների հիշեցումներ</H2>
          {toggles(TIMING)}
          <div className="mt-3.5 flex flex-col gap-1.5">
            <span className="text-[12.5px] text-muted font-semibold">Հաղորդագրության ձևանմուշ</span>
            <div className="px-3.5 py-3 rounded-[14px_14px_14px_4px] bg-[#E9F1EE] text-[13.5px] leading-normal">
              Հարգելի Անի, հիշեցնում ենք Ձեր այցը վաղը՝ 09:00-ին, Դր. Բաղդասարյանի մոտ։ Հաստատելու համար պատասխանեք «1», չեղարկելու համար՝ «2»։ [Կլինիկայի անվանում], +374 [հեռախոս]
            </div>
          </div>
        </Card>
        <Card>
          <H2 className="mb-1">Ներքին ծանուցման կանոններ</H2>
          {toggles(RULES)}
        </Card>
      </aside>
    </div>
  );
}
