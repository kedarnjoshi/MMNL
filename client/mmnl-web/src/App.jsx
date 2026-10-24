import { BrowserRouter, Navigate, Outlet, Route, Routes, useParams } from "react-router-dom";
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, ReturnTo } from "./auth/AuthContext.jsx";
import Protected, { Module } from "./auth/Protected.jsx";
import { ToastProvider } from "./ui/index.jsx";
import { reportFatal, useFatal } from "./lib/errors.js";
import { hasAnyRole, isSA } from "./lib/perm.js";
import { ErrorPage, NotFound } from "./pages/System.jsx";
import PublicLayout from "./layouts/PublicLayout.jsx";
import AccountLayout from "./layouts/AccountLayout.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Home from "./pages/public/Home.jsx";
import Events from "./pages/public/Events.jsx";
import EventDetail from "./pages/public/EventDetail.jsx";
import Privacy from "./pages/public/Privacy.jsx";
import SignInPage from "./pages/public/SignInPage.jsx";
import Tickets from "./pages/account/Tickets.jsx";
import Feedback from "./pages/account/Feedback.jsx";
import { MyPerformances, PerformanceForm } from "./pages/account/Performances.jsx";
import Performer from "./pages/account/Performer.jsx";
import AccountPrivacy from "./pages/account/AccountPrivacy.jsx";
import AdminHome from "./pages/admin/AdminHome.jsx";
import Overview from "./pages/admin/Overview.jsx";
import { EventNew, Settings } from "./pages/admin/Settings.jsx";
import Ticketing from "./pages/admin/Ticketing.jsx";
import Cultural from "./pages/admin/Cultural.jsx";
import Sponsorship from "./pages/admin/Sponsorship.jsx";
import Procurement from "./pages/admin/Procurement.jsx";
import Finance from "./pages/admin/Finance.jsx";
import Campaigns from "./pages/admin/Campaigns.jsx";
import { Tasks, MyTasks } from "./pages/admin/Tasks.jsx";
import Assets from "./pages/admin/Assets.jsx";
import Surveys from "./pages/admin/Surveys.jsx";
import Team from "./pages/admin/Team.jsx";
import Audit from "./pages/admin/Audit.jsx";
import Platform from "./pages/admin/Platform.jsx";

// Any 5xx / network failure anywhere (queries or mutations) swaps the UI for the error page.
const onError = (e) => { if (e?.fatal) reportFatal(e); };
const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError }),
  mutationCache: new MutationCache({ onError }),
  defaultOptions: { queries: { retry: (n, e) => !!e?.fatal && n < 1, refetchOnWindowFocus: false } },
});

const EventScope = () => { const { eventId } = useParams(); return <Outlet key={eventId} />; };

function Gate() {
  const fatal = useFatal();
  if (fatal) return <ErrorPage error={fatal} />;
  const M = (id, el) => <Module id={id}>{el}</Module>;
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:eventId" element={<EventDetail />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="login" element={<SignInPage />} />
        <Route path="account" element={<Protected><AccountLayout /></Protected>}>
          <Route index element={<Navigate to="tickets" replace />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="performances" element={<MyPerformances />} />
          <Route path="performances/new" element={<PerformanceForm />} />
          <Route path="performances/:id" element={<PerformanceForm />} />
          <Route path="performer/:eventId" element={<Performer />} />
          <Route path="privacy" element={<AccountPrivacy />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="admin" element={<Protected test={hasAnyRole}><DashboardLayout /></Protected>}>
        <Route index element={<AdminHome />} />
        <Route path="my-tasks" element={<MyTasks />} />
        <Route path="platform" element={<Protected test={isSA}><Platform /></Protected>} />
        <Route path="events/new" element={<Protected test={isSA}><EventNew /></Protected>} />
        <Route path="e/:eventId" element={<EventScope />}>
          <Route index element={M("overview", <Overview />)} />
          <Route path="ticketing" element={M("ticketing", <Ticketing />)} />
          <Route path="cultural" element={M("cultural", <Cultural />)} />
          <Route path="sponsorship" element={M("sponsorship", <Sponsorship />)} />
          <Route path="procurement" element={M("procurement", <Procurement />)} />
          <Route path="campaigns" element={M("campaigns", <Campaigns />)} />
          <Route path="tasks" element={M("tasks", <Tasks />)} />
          <Route path="assets" element={M("assets", <Assets />)} />
          <Route path="finance" element={M("finance", <Finance />)} />
          <Route path="surveys" element={M("surveys", <Surveys />)} />
          <Route path="team" element={M("team", <Team />)} />
          <Route path="settings" element={M("settings", <Settings />)} />
          <Route path="audit" element={M("audit", <Audit />)} />
        </Route>
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <ReturnTo />
            <Gate />
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
