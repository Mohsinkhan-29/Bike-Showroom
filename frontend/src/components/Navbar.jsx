import { useState } from "react";
import { NavLink, Link } from "react-router-dom";

const LINKS = [
  { to: "/bikes", label: "Catalog", idx: "01" },
  { to: "/recommend", label: "Find my bike", idx: "02" },
  { to: "/about", label: "About", idx: "03" },
  { to: "/contact", label: "Contact", idx: "04" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-asphalt/90 backdrop-blur border-b border-steel-line">
      <div className="container-page h-[72px] flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <svg viewBox="0 0 40 40" fill="none" className="w-8 h-8 text-amber">
            <circle cx="20" cy="20" r="17" stroke="currentColor" strokeWidth="1.4" />
            <path d="M11 24l4-8h6l4 6M20 16l3-4h5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <span className="font-display font-semibold leading-none">
            S.M. AUTOS
            <small className="block text-[10px] tracking-widest text-chrome font-body font-normal normal-case">
              Motorcycle Showroom
            </small>
          </span>
        </Link>

        <button
          className="md:hidden text-2xl"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          ☰
        </button>

        <nav className={`${open ? "flex" : "hidden"} md:flex flex-col md:flex-row absolute md:static top-[72px] left-0 right-0 bg-asphalt md:bg-transparent border-b md:border-0 border-steel-line items-start md:items-center gap-1 md:gap-6 p-4 md:p-0`}>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-display uppercase tracking-wide py-2 md:py-0 ${
                  isActive ? "text-amber" : "text-offwhite hover:text-amber"
                }`
              }
            >
              <span className="font-mono text-xs text-chrome">{l.idx}</span>
              {l.label}
            </NavLink>
          ))}
          <Link to="/contact" className="btn btn-primary w-full md:w-auto justify-center mt-2 md:mt-0">
            Book a test ride
          </Link>
        </nav>
      </div>
    </header>
  );
}
