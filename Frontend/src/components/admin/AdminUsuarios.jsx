import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminUsuarios.css";

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        obtenerUsuarios();
    }, []);

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
            console.error("Error al cambiar rol:", error);
            setMensaje("No se pudo cambiar el rol.");
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
                        <th>Cambiar Rol</th>
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
                                >
                                    <option value="CLIENTE">Cliente</option>
                                    <option value="ADMIN">Administrador</option>
                                    <option value="VENDEDOR">Vendedor</option>
                                    <option value="REPARTIDOR">Repartidor</option>
                                </select>
                            </td>
                            <td>
                                <button
                                    className="btn-eliminar"
                                    onClick={() => eliminarUsuario(u.id)}
                                >
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminUsuarios;
