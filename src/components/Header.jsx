import { useStore } from '../store.jsx';
import { Icon, ICONS } from './ui.jsx';

export default function Header({ title, subtitle }) {
  const { state, set, openModal } = useStore();
  const unread = state.notifs.filter((n) => !n.read).length;

  return (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="m-0 font-serif text-[30px] font-bold tracking-tight">{title}</h1>
        <span className="text-muted">{subtitle}</span>
      </div>
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex items-center gap-2 h-11 px-3.5 bg-white border border-line rounded-xl min-w-[240px]">
          <Icon d={ICONS.search} size={18} stroke="#55625F" width={1.8} />
          <span className="sr-only">Որոնել պացիենտ</span>
          <input
            type="search"
            value={state.patQuery}
            onChange={(e) => set({ patQuery: e.target.value, sec: 'pat' })}
            placeholder="Որոնել պացիենտ, հեռախոս…"
            className="border-0 outline-none bg-transparent flex-1 min-w-0 h-10"
          />
        </label>
        <button type="button" onClick={() => openModal()} className="inline-flex items-center gap-2 h-11 px-[18px] rounded-xl bg-brand hover:bg-brand-dark text-white font-semibold">
          <Icon d={ICONS.plus} size={18} width={2} />
          Նոր այց
        </button>
        <button type="button" onClick={() => set({ sec: 'notif' })} aria-label="Ծանուցումներ" className="relative w-11 h-11 rounded-xl border border-line bg-white flex items-center justify-center">
          <Icon d={ICONS.notif} stroke="#142321" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-danger text-white text-[11px] font-bold flex items-center justify-center">{unread}</span>
          )}
        </button>
      </div>
    </header>
  );
}
