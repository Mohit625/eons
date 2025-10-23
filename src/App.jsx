import { Toaster } from "@/components/ui/toaster.jsx";
import { Toaster as Sonner } from "@/components/ui/sonner.jsx";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "./components/Navigation.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Events from "./pages/Events.jsx";
import Schedule from "./pages/Schedule.jsx";
import Members from "./pages/Members.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";
import EventLeaderboard from "./pages/EventLeaderboard.jsx";
import LockLoad from "./pages/LockLoad.jsx";
import EventSchedule from "./pages/EventSchedule.jsx";
import Admin from "./pages/Admin.jsx";
import Login from "./pages/Login.jsx";
import RequireAuth from "./auth/RequireAuth";
import RequireAdmin from "./auth/RequireAdmin";
import Gamingbonanza from "./pages/Gamingbonanza.jsx";
import TeamRegistration from "./pages/TeamRegistration.jsx";
import RegistrationConfirmation from "./pages/RegistrationConfirmation.jsx";

const queryClient = new QueryClient();

function MainRoutes() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <main className={`flex-1 ${isHome ? "pt-0" : "pt-16"}`}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:eventId/leaderboard" element={<EventLeaderboard />} />
        <Route path="/events/:eventId/leaderboard/:gameId" element={<EventLeaderboard />} />
        <Route path="/events/lock-load" element={<LockLoad />} />
        <Route path="/events/gamingbonanza" element={<Gamingbonanza />} />
        <Route path="/events/:eventId/schedule" element={<EventSchedule />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/members" element={<Members />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <MainRoutes />
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
