import { useStore } from './store.jsx';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import NewApptModal from './components/NewApptModal.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Calendar from './pages/Calendar.jsx';
import Patients from './pages/Patients.jsx';
import DoctorCabinet from './pages/DoctorCabinet.jsx';
import Doctors from './pages/Doctors.jsx';
import Rooms from './pages/Rooms.jsx';
import WorkTime from './pages/WorkTime.jsx';
import Warehouse from './pages/Warehouse.jsx';
import Notifications from './pages/Notifications.jsx';

export const SECTIONS = {
  dash: { nav: 'Վահանակ', title: 'Վահանակ', subtitle: 'Հինգշաբթի, 8 հոկտեմբերի 2026 · կլինիկայի այսօրվա պատկերը', Page: Dashboard },
  cal: { nav: 'Օրացույց', title: 'Այցերի օրացույց', subtitle: 'Ընդունելություններ ըստ կաբինետների և բժիշկների', Page: Calendar },
  pat: { nav: 'Պացիենտներ', title: 'Պացիենտներ', subtitle: 'Պացիենտների բազա, բժշկական քարտեր և բուժման պլաններ', Page: Patients },
  dcab: { nav: 'Բժշկի կաբինետ', title: 'Բժշկի կաբինետ', subtitle: 'Բժշկի անձնական աշխատանքային տարածք', Page: DoctorCabinet },
  docs: { nav: 'Բժիշկներ', title: 'Բժիշկներ', subtitle: 'Բժիշկների կազմ, ծանրաբեռնվածություն և կոնտակտներ', Page: Doctors },
  rooms: { nav: 'Կաբինետներ', title: 'Կաբինետներ', subtitle: 'Կաբինետների կարգավիճակ, սարքավորումներ և ախտահանում', Page: Rooms },
  time: { nav: 'Աշխատաժամանակ', title: 'Աշխատաժամանակ', subtitle: 'Հերթափոխեր, հաճախումներ և արձակուրդներ', Page: WorkTime },
  wh: { nav: 'Պահեստ', title: 'Պահեստ', subtitle: 'Նյութերի մնացորդներ, պիտանիություն և պատվերներ', Page: Warehouse },
  notif: { nav: 'Ծանուցումներ', title: 'Ծանուցումների կենտրոն', subtitle: 'Ահազանգեր, հիշեցումներ և ուղարկման կարգավորումներ', Page: Notifications },
};

export default function App() {
  const { state } = useStore();
  const sec = SECTIONS[state.sec];
  const Page = sec.Page;

  return (
    <div className="min-h-screen flex flex-wrap bg-canvas text-ink">
      <Sidebar />
      <main className="flex-[999_1_560px] min-w-0 px-4 sm:px-8 pt-6 pb-14 flex flex-col gap-6">
        <Header title={sec.title} subtitle={sec.subtitle} />
        <Page />
      </main>
      {state.modal && <NewApptModal />}
    </div>
  );
}
