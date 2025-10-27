import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginUsuario from "./components/usuarios/LoginUsuario";
import RegistroUsuario from "./components/usuarios/RegistroUsuario";
import Dashboard from "./components/usuarios/Dashboard";
import ClienteInicio from "./components/clientes/ClienteInicio";
import MiCuenta from "./components/clientes/MiCuenta";
import AdminInicio from "./components/admin/AdminInicio";
import AdminUsuarios from "./components/admin/AdminUsuarios";
import VendedorInicio from "./components/vendedor/VendedorInicio"; // 🟠 Import nuevo
import RutaProtegida from "./components/RutaProtegida";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🔹 Página de inicio de sesión */}
        <Route path="/" element={<LoginUsuario />} />

        {/* 🔹 Registro */}
        <Route path="/registro" element={<RegistroUsuario />} />

        {/* 🔹 Dashboard general */}
        <Route
          path="/dashboard"
          element={
            <RutaProtegida>
              <Dashboard />
            </RutaProtegida>
          }
        />

        {/* 👤 Cliente: Inicio */}
        <Route
          path="/cliente/inicio"
          element={
            <RutaProtegida rolPermitido="CLIENTE">
              <ClienteInicio />
            </RutaProtegida>
          }
        />

        {/* 👤 Cliente: Mi Cuenta */}
        <Route
          path="/cliente/mi-cuenta"
          element={
            <RutaProtegida rolPermitido="CLIENTE">
              <MiCuenta />
            </RutaProtegida>
          }
        />

        {/* 🧭 Administrador: Inicio */}
        <Route
          path="/admin/inicio"
          element={
            <RutaProtegida rolPermitido="ADMIN">
              <AdminInicio />
            </RutaProtegida>
          }
        />

        {/* 🧩 Administrador: Gestión de usuarios */}
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida rolPermitido="ADMIN">
              <AdminUsuarios />
            </RutaProtegida>
          }
        />

        {/* 🟠 Vendedor: Panel principal */}
        <Route
          path="/vendedor/inicio"
          element={
            <RutaProtegida rolPermitido="VENDEDOR">
              <VendedorInicio />
            </RutaProtegida>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
