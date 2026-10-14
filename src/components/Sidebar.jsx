import { useStore } from '../store.jsx';
import { ITEMS } from '../data.js';
import { SECTIONS } from '../App.jsx';
import { Icon, ICONS } from './ui.jsx';

export default function Sidebar() {
  const { state, set } = useStore();
  const unread = state.notifs.filter((n) => !n.read).length;
  const low = ITEMS.filter((i) => state.stock[i.id] <= i.min).length;

  return (
    <aside className="flex-[1_1_252px] bg-side text-side-text px-3.5 py-6 flex flex-col gap-7">
      <div className="flex items-center gap-3 px-2">
        <div className="w-[42px] h-[42px] rounded-xl bg-brand-tint text-brand flex items-center justify-center">
          <Icon d={ICONS.tooth} size={24} width={1.8} />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-[22px] font-bold text-white leading-tight">Ժպիտ</span>
          <span className="text-xs text-side-muted">Ատամնաբուժական CRM</span>
        </div>
      </div>

      <nav aria-label="Գլխավոր մենյու" className="flex flex-col gap-1">
        {Object.entries(SECTIONS).map(([id, s]) => {
          const active = state.sec === id;
          const badge = id === 'notif' ? unread : id === 'wh' ? low : 0;
          return (
            <button
              key={id}
              type="button"
              onClick={() => set({ sec: id })}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 min-h-11 px-3 rounded-[10px] text-left text-[14.5px] font-medium ${active ? 'bg-side-active text-white' : 'text-side-text hover:bg-side-hover'}`}
            >
              <Icon d={ICONS[id]} />
              <span className="flex-1">{s.nav}</span>
              {badge > 0 && (
                <span className="min-w-[22px] h-[22px] px-1.5 rounded-full bg-accent text-side text-xs font-bold inline-flex items-center justify-center">{badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 pt-4 px-3 border-t border-side-line">
        <span className="text-xs text-side-muted">Մասնաճյուղ</span>
        <span className="text-white font-semibold">[Կլինիկայի անվանում] · Երևան</span>
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-accent text-side font-bold text-[13px] flex items-center justify-center">ՆԶ</span>
          <span className="flex flex-col">
            <span className="text-white font-semibold text-[13.5px]">Նունե Զաքարյան</span>
            <span className="text-xs text-side-muted">Ադմինիստրատոր</span>
          </span>
        </div>
      </div>
    </aside>
  );
}
