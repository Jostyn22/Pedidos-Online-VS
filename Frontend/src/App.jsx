import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginUsuario from "./components/usuarios/LoginUsuario";
import RegistroUsuario from "./components/usuarios/RegistroUsuario";
import Dashboard from "./components/usuarios/Dashboard";
import ClienteInicio from "./components/clientes/ClienteInicio";
import MiCuenta from "./components/clientes/MiCuenta";
import AdminInicio from "./components/admin/AdminInicio";
import AdminUsuarios from "./components/admin/AdminUsuarios";
import VendedorInicio from "./components/vendedor/VendedorInicio";
import RutaProtegida from "./components/RutaProtegida";
import CatalogoProductos from "./components/productos/CatalogoProductos";
import RecuperarContraseña from "./components/usuarios/RecuperarContraseña";
import ClienteCarrito from "./components/clientes/ClienteCarrito";
import AgregarProducto from "./components/vendedor/AgregarProducto";
import AdminProductos from "./components/admin/AdminProductos";
import AdminEditarProducto from "./components/admin/AdminEditarProducto";
import AdminAgregarProducto from "./components/admin/AdminAgregarProducto";

function App() {
  return (
    <Router>
      <Routes>
        {/*Página de inicio de sesión */}
        <Route path="/" element={<LoginUsuario />} />
        <Route path="/recuperar" element={<RecuperarContraseña />} />

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
        {/* Cliente: Inicio */}
        <Route
          path="/cliente/inicio"
          element={
            <RutaProtegida rolPermitido="CLIENTE">
              <ClienteInicio />
            </RutaProtegida>
          }
        />
        {/* Cliente: Mi Cuenta */}
        <Route
          path="/cliente/mi-cuenta"
          element={
            <RutaProtegida rolPermitido="CLIENTE">
              <MiCuenta />
            </RutaProtegida>
          }
        />

        {/* Administrador: Inicio */}
        <Route
          path="/admin/inicio"
          element={
            <RutaProtegida rolPermitido="ADMIN">
              <AdminInicio />
            </RutaProtegida>
          }
        />

        {/* Administrador: Gestión de usuarios */}
        <Route
          path="/admin/usuarios"
          element={
            <RutaProtegida rolPermitido="ADMIN">
              <AdminUsuarios />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/productos"
          element={
            <RutaProtegida rolPermitido="ADMIN">
              <AdminProductos />
            </RutaProtegida>
          }
        />
        <Route path="/admin/productos/editar/:id"
          element={
            <RutaProtegida rolPermitido="ADMIN">
              <AdminEditarProducto />
            </RutaProtegida>
          }
        />
        <Route
          path="/admin/productos/agregar"
          element={
            <RutaProtegida rolPermitido="ADMIN">
              <AdminAgregarProducto />
            </RutaProtegida>
          }
        />
        {/* Vendedor: Panel principal */}
        <Route
          path="/vendedor/inicio"
          element={
            <RutaProtegida rolPermitido="VENDEDOR">
              <VendedorInicio />
            </RutaProtegida>
          }
        />
        {/* Vendedor: Agregar Producto */}
        <Route
          path="/vendedor/productos/agregar"
          element={
            <RutaProtegida rolPermitido="VENDEDOR">
              <AgregarProducto />
            </RutaProtegida>
          }
        />
        {/* Catálogo de productos */}
        <Route path="/catalogo" element={<CatalogoProductos />} /> {/**/}
        {/*  Carrito */}
        <Route
          path="/cliente/carrito"
          element={
            <RutaProtegida rolPermitido="CLIENTE">
              <ClienteCarrito />
            </RutaProtegida>
          }
        />

      </Routes>
    </Router>
  );
}

export default App;
