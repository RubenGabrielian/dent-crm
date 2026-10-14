import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { INITIAL_APPTS, INITIAL_LEAVES, INITIAL_MOVES, INITIAL_NOTIFS, ITEMS } from './data.js';

const StoreContext = createContext(null);

const emptyForm = (doc = 'd2') => ({ patient: '', phone: '', doc, proc: '', time: '17:00', dur: '60' });

const initialState = () => ({
  sec: 'dash',
  appts: INITIAL_APPTS,
  stock: Object.fromEntries(ITEMS.map((i) => [i.id, i.qty])),
  ordered: {},
  selAppt: null,
  calDoc: 'all',
  dayOff: 0,
  patQuery: '',
  patSel: 'p2',
  teethEdit: {},
  tool: 'c',
  whFilter: 'all',
  whQuery: '',
  moves: INITIAL_MOVES,
  moveId: 1,
  notifs: INITIAL_NOTIFS,
  nFilter: 'all',
  nid: 100,
  toggles: { sms: true, viber: true, tg: false, email: true, r7: false, r24: true, r2: true, lowstock: true, noshow: true, bday: true, digest: false },
  leaves: INITIAL_LEAVES,
  cleaning: { 1: true },
  dcDoc: 'd2',
  dcActive: null,
  dcNotes: '',
  dcMat: {},
  modal: false,
  form: emptyForm(),
  formErr: '',
});

export function StoreProvider({ children }) {
  const [state, setRaw] = useState(initialState);

  // Class-component style merge: accepts a partial object or (state) => partial.
  const set = useCallback((patch) => {
    setRaw((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) }));
  }, []);

  const notify = useCallback((type, title, text) => {
    set((s) => ({
      notifs: [{ id: 'n' + s.nid, type, title, text, time: 'Հենց հիմա', read: false }, ...s.notifs],
      nid: s.nid + 1,
    }));
  }, [set]);

  const setStatus = useCallback((id, status) => {
    set((s) => ({ appts: s.appts.map((a) => (a.id === id ? { ...a, status } : a)) }));
  }, [set]);

  const openModal = useCallback((form) => {
    set((s) => ({ modal: true, formErr: '', form: form || emptyForm(s.calDoc !== 'all' ? s.calDoc : 'd2') }));
  }, [set]);

  const value = useMemo(() => ({ state, set, notify, setStatus, openModal }), [state, set, notify, setStatus, openModal]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => useContext(StoreContext);
