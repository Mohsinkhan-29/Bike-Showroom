import { Routes, Route } from "react-router-dom";
import Layout from "./pages/Layout.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import BikeDetail from "./pages/BikeDetail.jsx";
import Recommend from "./pages/Recommend.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";

import AdminLogin from "./pages/admin/AdminLogin.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCatalog from "./pages/admin/AdminCatalog.jsx";
import AdminBikeForm from "./pages/admin/AdminBikeForm.jsx";
import AdminLeads from "./pages/admin/AdminLeads.jsx";
import AdminRag from "./pages/admin/AdminRag.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/bikes" element={<Catalog />} />
        <Route path="/bikes/:id" element={<BikeDetail />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="catalog" element={<AdminCatalog />} />
        <Route path="catalog/new" element={<AdminBikeForm />} />
        <Route path="catalog/:id/edit" element={<AdminBikeForm />} />
        <Route path="leads" element={<AdminLeads />} />
        <Route path="chatbot" element={<AdminRag />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
