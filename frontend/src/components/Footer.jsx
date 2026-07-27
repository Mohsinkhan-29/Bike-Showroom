import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-asphalt-2 border-t border-steel-line mt-20">
      <div className="container-page py-14 grid gap-10 md:grid-cols-4">
        <div>
          <h4 className="text-sm mb-3">S.M. AUTOS</h4>
          <p className="text-chrome-light text-sm">
            Your neighborhood motorcycle showroom for sales, service, parts and honest advice.
          </p>
        </div>
        <div>
          <h4 className="text-sm mb-3">SITE</h4>
          <ul className="space-y-2 text-sm text-chrome-light">
            <li><Link to="/bikes" className="hover:text-amber">Catalog</Link></li>
            <li><Link to="/recommend" className="hover:text-amber">Find my bike</Link></li>
            <li><Link to="/about" className="hover:text-amber">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm mb-3">SUPPORT</h4>
          <ul className="space-y-2 text-sm text-chrome-light">
            <li><Link to="/contact" className="hover:text-amber">Contact us</Link></li>
            <li><Link to="/admin/login" className="hover:text-amber">Admin login</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm mb-3">VISIT</h4>
          <p className="text-chrome-light text-sm">Main Boulevard, [Your City]<br />Mon–Sat · 9:00–19:00</p>
        </div>
      </div>
      <div className="container-page py-5 border-t border-steel-line flex flex-col sm:flex-row justify-between gap-2 text-xs text-chrome font-mono">
        <span>© {new Date().getFullYear()} S.M. AUTOS</span>
        <span>SPEC PLATE SM-01</span>
      </div>
    </footer>
  );
}
