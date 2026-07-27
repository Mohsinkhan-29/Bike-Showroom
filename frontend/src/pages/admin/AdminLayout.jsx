import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

const LINKS = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/catalog", label: "Catalog" },
  { to: "/admin/leads", label: "Leads" },
  { to: "/admin/chatbot", label: "Chatbot" },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login");
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-60 bg-asphalt-2 border-b md:border-b-0 md:border-r border-steel-line p-5 flex md:flex-col gap-4">
        <div className="font-display uppercase tracking-wide text-sm mb-2">
          S.M. Autos <span className="text-amber">Admin</span>
        </div>
        <nav className="flex md:flex-col gap-1 flex-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `px-3 py-2 rounded text-sm font-display uppercase tracking-wide ${
                  isActive ? "bg-amber text-ink" : "text-chrome-light hover:bg-steel"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden md:block mt-auto pt-4 border-t border-steel-line">
          <p className="text-xs text-chrome font-mono mb-2 truncate">{user?.email}</p>
          <button onClick={handleLogout} className="btn btn-outline w-full text-xs py-2">Log out</button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
}
