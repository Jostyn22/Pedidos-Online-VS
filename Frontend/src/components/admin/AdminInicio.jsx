import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AdminInicio.css";

const AdminInicio = () => {
    const navigate = useNavigate();
    const [vista, setVista] = useState("panel");
    const [usuarios, setUsuarios] = useState([]);
    const [mensaje, setMensaje] = useState("");

    const handleLogout = () => {
        localStorage.clear();
        localStorage.setItem("logoutMessage", "Sesión cerrada correctamente.");
        navigate("/");
    };

    useEffect(() => {
        if (vista === "usuarios") obtenerUsuarios();
    }, [vista]);

    const obtenerUsuarios = async () => {
        try {
            const response = await api.get("/api/usuarios/listar/");
            setUsuarios(response.data);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setMensaje("Error al cargar usuarios.");
        }
    };

    const cambiarRol = async (id, nuevoRol) => {
        try {
            await api.patch(`/api/usuarios/cambiar_rol/${id}/`, { rol: nuevoRol });
            obtenerUsuarios();
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
            await api.delete(`/api/usuarios/eliminar/${id}/`);
            setMensaje("Usuario eliminado correctamente.");
            obtenerUsuarios();
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            setMensaje("No se pudo eliminar el usuario.");
        }
    };

    return (
        <div className="admin-hero">
            {/* 🔷 Barra superior */}
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

            {/* 🧩 CONTENIDO CENTRAL */}
            <div className="admin-content">
                {vista === "panel" && (
                    <>
                        <h1>Panel de Administración</h1>
                        <p>
                            Gestiona usuarios, productos, pedidos y más desde un solo lugar.
                        </p>
                        <button className="btn-dashboard" onClick={() => setVista("usuarios")}>
                            Ir a Gestión de Usuarios
                        </button>
                    </>
                )}

                {vista === "usuarios" && (
                    <div className="admin-usuarios-container">
                        <h2>Gestión de Usuarios</h2>
                        {mensaje && <p className="mensaje">{mensaje}</p>}

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
                                {usuarios.map((u) => (
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
                                                <option value="REPARTIDOR">Repartidor</option>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ⚙️ Footer */}
            <footer className="admin-footer">
                © {new Date().getFullYear()} Sistema de Pedidos Online VS — Administrador
            </footer>
        </div>
    );
};

export default AdminInicio;
