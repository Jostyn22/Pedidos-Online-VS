import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminInicio.css";

const AdminInicio = () => {
    const navigate = useNavigate();
    const [vista, setVista] = useState("panel");
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosOriginal, setUsuariosOriginal] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [rolFiltro, setRolFiltro] = useState("");
    const [busqueda, setBusqueda] = useState("");

    const handleLogout = () => {
        localStorage.clear();
        localStorage.setItem("logoutMessage", "Sesión cerrada correctamente.");
        navigate("/");
    };
    //Obtener usuarios
    const obtenerUsuarios = async (rol = "") => {
        try {
            const params = new URLSearchParams();
            if (rol) params.append("rol", rol);
            const response = await api.get(`usuarios/listar/?${params.toString()}`);
            setUsuarios(response.data);
            setUsuariosOriginal(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setMensaje("Error al cargar usuarios.");
        }
    };
    useEffect(() => {
        if (vista === "usuarios") obtenerUsuarios(rolFiltro);
    }, [vista, rolFiltro]);

    //Búsqueda local (nombre o correo)
    const handleBusqueda = (valor) => {
        setBusqueda(valor);
        if (!valor) {
            setUsuarios(usuariosOriginal);
        } else {
            const filtrados = usuariosOriginal.filter(
                (u) =>
                    u.username.toLowerCase().includes(valor.toLowerCase()) ||
                    u.email.toLowerCase().includes(valor.toLowerCase())
            );
            setUsuarios(filtrados);
        }
    };
    const cambiarRol = async (id, nuevoRol) => {
        try {
            await api.patch(`usuarios/cambiar_rol/${id}/`, { rol: nuevoRol });
            setMensaje("Rol actualizado correctamente.");
            obtenerUsuarios(rolFiltro);
        } catch (error) {
            if (error.response?.status === 403) {
                setMensaje("No puedes cambiar tu propio rol como administrador.");
            } else {
                setMensaje("No se pudo cambiar el rol.");
            }
        }
    };
    const eliminarUsuario = async (id) => {
        const confirmar = window.confirm("¿Seguro que deseas eliminar este usuario?");
        if (!confirmar) return;

        try {
            await api.delete(`usuarios/eliminar/${id}/`);
            setMensaje("Usuario eliminado correctamente.");
            obtenerUsuarios(rolFiltro);
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            setMensaje("No se pudo eliminar el usuario.");
        }
    };

    return (
        <div className="admin-hero">
            {/*Barra superior */}
            <nav className="admin-navbar">
                <div className="admin-logo" onClick={() => setVista("panel")}>
                    PedidosOnlineVS <span>Admin</span>
                </div>

                <ul className="admin-menu">
                    <li onClick={() => setVista("panel")}>Panel</li>
                    <li onClick={() => setVista("usuarios")}>Usuarios</li>
                    <li onClick={() => setVista("productos")}>Productos</li>
                    <li onClick={() => setVista("pedidos")}>Pedidos</li>
                    <li onClick={() => setVista("pagos")}>Pagos</li>
                    <li onClick={() => setVista("envios")}>Envíos</li>
                </ul>

                <button className="logout-btn" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </nav>

            {/*CONTENIDO CENTRAL */}
            <div className="admin-content">
                {vista === "panel" && (
                    <>
                        <h1>Panel de Administración</h1>
                        <p>Gestiona usuarios, productos, pedidos y más desde un solo lugar.</p>
                        <button className="btn-dashboard" onClick={() => setVista("usuarios")}>
                            Ir a Gestión de Usuarios
                        </button>
                    </>
                )}

                {vista === "usuarios" && (
                    <div className="admin-usuarios-container">
                        <h2>Gestión de Usuarios</h2>
                        {mensaje && <p className="mensaje">{mensaje}</p>}
                        {/*Controles superiores */}
                        <div className="controles-superiores">
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                value={busqueda}
                                onChange={(e) => handleBusqueda(e.target.value)}
                                className="input-busqueda"
                            />
                            <div className="filtro-rol">
                                <label htmlFor="rolFiltro">Rol:</label>
                                <select
                                    id="rolFiltro"
                                    value={rolFiltro}
                                    onChange={(e) => setRolFiltro(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="CLIENTE">Cliente</option>
                                    <option value="VENDEDOR">Vendedor</option>
                                </select>
                            </div>
                        </div>
                        {/*Tabla de usuarios */}
                        <table className="tabla-usuarios">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Email</th>
                                    <th>Rol</th>
                                    <th>Cambiar rol</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {usuarios.length > 0 ? (
                                    usuarios.map((u) => (
                                        <tr key={u.id}>
                                            <td>{u.id}</td>
                                            <td>{u.username}</td>
                                            <td>{u.email}</td>
                                            <td>{u.rol}</td>
                                            <td>
                                                <select
                                                    value={u.rol}
                                                    onChange={(e) => cambiarRol(u.id, e.target.value)}
                                                    disabled={u.username === localStorage.getItem("username")}
                                                >
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="CLIENTE">Cliente</option>
                                                    <option value="VENDEDOR">Vendedor</option>
                                                </select>
                                            </td>
                                            <td>
                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() => eliminarUsuario(u.id)}
                                                    disabled={u.username === localStorage.getItem("username")}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center", color: "#166534" }}>
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="admin-footer">
                © {new Date().getFullYear()} Sistema de Pedidos Online VS — Administrador
            </footer>
        </div>
    );
};

export default AdminInicio;

