import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminUsuarios.css";

const AdminUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [busqueda, setBusqueda] = useState("");
    const [rol, setRol] = useState("Todos");
    const [nextUrl, setNextUrl] = useState(null);
    const [prevUrl, setPrevUrl] = useState(null);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);

    useEffect(() => {
        obtenerUsuarios("/api/usuarios/listar/");
    }, [busqueda, rol]);

    const obtenerUsuarios = async (url = "/api/usuarios/listar/") => {
        try {
            if (url.startsWith("http://127.0.0.1:8000")) {
                url = url.replace("http://127.0.0.1:8000", "");
            } else if (url.startsWith("http://localhost:8000")) {
                url = url.replace("http://localhost:8000", "");
            }

            const params = new URLSearchParams();
            if (busqueda.trim() !== "") params.append("search", busqueda);
            if (rol !== "Todos") params.append("rol", rol);
            const separator = url.includes("?") ? "&" : "?";
            const finalUrl = `${url}${params.toString() ? separator + params.toString() : ""}`;

            const { data } = await api.get(finalUrl);

            setUsuarios(data.results || data);
            setNextUrl(data.next);
            setPrevUrl(data.previous);

            //Detectar número de página
            if (data.count) {
                const paginas = Math.ceil(data.count / 3);
                setTotalPaginas(paginas);
                const pageMatch = finalUrl.match(/page=(\d+)/);
                setPaginaActual(pageMatch ? parseInt(pageMatch[1]) : 1);
            }
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            setMensaje("Error al cargar usuarios.");
        }
    };

    const cambiarRol = async (id, nuevoRol) => {
        try {
            await api.patch(`usuarios/cambiar_rol/${id}/`, { rol: nuevoRol });
            setMensaje("Rol actualizado correctamente.");
            obtenerUsuarios("usuarios/listar/");
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
            obtenerUsuarios("/api/usuarios/listar/?page=1");
        } catch (error) {
            console.error("Error al eliminar usuario:", error);
            setMensaje("❌ No se pudo eliminar el usuario.");
        }
    };

    return (
        <div className="admin-usuarios-container">
            <h2>Gestión de Usuarios</h2>
            {mensaje && <p className="mensaje">{mensaje}</p>}

            <div className="controles-superiores">
                <input
                    type="text"
                    className="input-busqueda"
                    placeholder="Buscar usuario..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />

                <div className="filtro-rol">
                    <label>Rol:</label>
                    <select value={rol} onChange={(e) => setRol(e.target.value)}>
                        <option value="Todos">Todos</option>
                        <option value="ADMIN">Admin</option>
                        <option value="CLIENTE">Cliente</option>
                        <option value="VENDEDOR">Vendedor</option>
                        <option value="REPARTIDOR">Repartidor</option>
                    </select>
                </div>
            </div>

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
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6">No se encontraron usuarios.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/*Paginación */}
            <div className="paginacion">
                <button onClick={() => obtenerUsuarios(prevUrl)} disabled={!prevUrl}>
                    ← Anterior
                </button>
                <span>
                    Página {paginaActual} de {totalPaginas}
                </span>
                <button onClick={() => obtenerUsuarios(nextUrl)} disabled={!nextUrl}>
                    Siguiente →
                </button>
            </div>
        </div>
    );
};

export default AdminUsuarios;
