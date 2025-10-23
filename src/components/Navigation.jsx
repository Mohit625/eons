import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button.jsx";
import logo from "@/assets/logo.png";
import { supabase } from "@/lib/supabase.js";
import { toast } from "sonner";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    { name: "Home", path: "/" },
    { name: "Events", path: "/events" },
    { name: "Schedule", path: "/schedule" },
    { name: "Members", path: "/members" },
    { name: "About", path: "/about" },
  ];

  const isActive = (path) => location.pathname === path;

  const allowedEmail = import.meta.env.VITE_ADMIN_EMAIL;

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUser(data.session?.user ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return toast.error(error.message);
    setUser(null);
    toast.success("Signed out");
    navigate("/");
  };

  return (
    <nav className="fixed top-4 left-0 right-0 z-50">
      <div className="flex justify-center px-4">
        <div className="flex items-center w-full max-w-4xl rounded-full glass-card border border-border/40 px-3 py-2">

          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 px-2 group">
            <div>
              <img src={logo} alt="NIT Silchar Esports Logo" className="h-14 w-14 rounded-full object-cover" />
            </div>
            <span className="hidden sm:inline-block font-orbitron font-bold text-lg text-gradient">NIT SILCHAR ESPORTS</span>
          </Link>

          {/* Desktop Links (right) */}
          <div className="ml-auto hidden md:flex items-center gap-2">
            {links.map((link) => (
              <Button key={link.path} asChild variant={isActive(link.path) ? "default" : "ghost"} className={`font-inter rounded-full px-3 ${isActive(link.path) ? "glow-primary" : ""}`}>
                <Link to={link.path}>{link.name}</Link>
              </Button>
            ))}

            {/* Admin or user actions */}
            {!user ? (
              <Button asChild variant={isActive('/login') ? 'default' : 'ghost'} className="font-inter rounded-full px-3">
                <Link to="/login">Admin</Link>
              </Button>
            ) : user.email === allowedEmail ? (
              // Admin signed in: show only dashboard link
              <Button asChild variant={isActive('/admin') ? 'default' : 'ghost'} className="font-inter rounded-full px-3">
                <Link to="/admin">Dashboard</Link>
              </Button>
            ) : (
              // Regular user signed in: show logout only
              <Button variant="outline" onClick={handleLogout}>Logout</Button>
            )}
          </div>

          {/* Mobile menu toggle (inside capsule) */}
          <div className="md:hidden ml-auto">
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-foreground hover:text-primary transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile navigation sheet (below capsule) */}
      {isOpen && (
        <div className="flex justify-center px-4 mt-3">
          <div className="w-full max-w-4xl bg-card glass-card rounded-xl border border-border/30 p-3 md:hidden">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Button key={link.path} asChild variant={isActive(link.path) ? "default" : "ghost"} className="w-full justify-start">
                  <Link to={link.path} onClick={() => setIsOpen(false)}>{link.name}</Link>
                </Button>
              ))}

              {/* Mobile admin / user actions */}
              {!user ? (
                <Button asChild variant={isActive('/login') ? 'default' : 'ghost'} className="w-full justify-start">
                  <Link to="/login" onClick={() => setIsOpen(false)}>Admin</Link>
                </Button>
              ) : user.email === allowedEmail ? (
                <Button asChild className="w-full justify-start">
                  <Link to="/admin" onClick={() => setIsOpen(false)}>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <div className="px-2 text-sm">{user.email}</div>
                  <Button className="w-full" onClick={() => { setIsOpen(false); handleLogout(); }}>Logout</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
