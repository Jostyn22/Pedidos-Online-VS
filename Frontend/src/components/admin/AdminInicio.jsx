import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../services/api";
import "./AdminInicio.css";
const AdminInicio = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [vista, setVista] = useState("panel");
    const [mensaje, setMensaje] = useState("");

    // USUARIOS
    const [usuarios, setUsuarios] = useState([]);
    const [usuariosOriginal, setUsuariosOriginal] = useState([]);
    const [rolFiltro, setRolFiltro] = useState("");
    const [busqueda, setBusqueda] = useState("");

    // PRODUCTOS
    const [productos, setProductos] = useState([]);
    const [busquedaProducto, setBusquedaProducto] = useState("");
    const [marcaFiltro, setMarcaFiltro] = useState("");
    // PEDIDOS
    const [pedidos, setPedidos] = useState([]);
    const [busquedaPedido, setBusquedaPedido] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");


    const handleLogout = () => {
        localStorage.clear();
        localStorage.setItem("logoutMessage", "Sesión cerrada correctamente.");
        navigate("/");
    };

    const obtenerUsuarios = async (rol = "") => {
        try {
            const params = new URLSearchParams();
            if (rol) params.append("rol", rol);
            const response = await api.get(`usuarios/listar/?${params.toString()}`);
            setUsuarios(response.data);
            setUsuariosOriginal(response.data);
        } catch (error) {
            setMensaje("Error al cargar usuarios.");
        }
    };

    const obtenerProductos = async () => {
        try {
            const response = await api.get("productos/");
            setProductos(response.data);
        } catch (error) {
            setMensaje("Error al cargar productos.");
        }
    };

    const obtenerPedidos = async () => {
        try {
            const response = await api.get("pedidos/");
            setPedidos(response.data);
        } catch (error) {
            setMensaje("Error al cargar pedidos.");
        }
    };
    const pedidosFiltrados = pedidos.filter((p) =>
        p.cliente_nombre?.toLowerCase().includes(busquedaPedido.toLowerCase()) ||
        p.id.toString().includes(busquedaPedido)
    );
    const eliminarPedido = async (id) => {
        const confirmar = window.confirm("¿Seguro que deseas eliminar este pedido?");
        if (!confirmar) return;

        try {
            await api.delete(`pedidos/eliminar/${id}/`);
            obtenerPedidos();
        } catch (error) {
            alert("No se pudo eliminar el pedido");
        }
    };

    const cambiarEstadoPedido = async (id, nuevoEstado) => {
        try {
            await api.patch(`pedidos/${id}/`, { estado: nuevoEstado });
            obtenerPedidos();
        } catch {
            setMensaje("No se pudo actualizar el estado del pedido.");
        }
    };
    const imprimirFactura = async (id) => {
        try {
            const response = await api.get(`pedidos/imprimir/${id}/`, {
                responseType: "blob",
            });

            // Crear URL y abrir PDF
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `Factura_Pedido_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();

        } catch (error) {
            console.error("Error al imprimir pedido:", error);
            alert("No se pudo generar la factura.");
        }
    };

    useEffect(() => {
        if (vista === "usuarios") obtenerUsuarios(rolFiltro);
        if (vista === "productos") obtenerProductos();
        if (vista === "pedidos") obtenerPedidos();
    }, [vista, rolFiltro]);

    useEffect(() => {
        if (location.state?.vista === "productos") {
            setVista("productos");
        }
    }, [location]);

    const handleBusqueda = (valor) => {
        setBusqueda(valor);
        if (!valor) setUsuarios(usuariosOriginal);
        else {
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
            obtenerUsuarios(rolFiltro);
        } catch {
            setMensaje("No se pudo cambiar el rol.");
        }
    };

    const eliminarUsuario = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;
        try {
            await api.delete(`usuarios/eliminar/${id}/`);
            obtenerUsuarios(rolFiltro);
        } catch {
            setMensaje("No se pudo eliminar el usuario.");
        }
    };

    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;
        try {
            await api.delete(`productos/${id}/`);
            obtenerProductos();
        } catch {
            setMensaje("No se pudo eliminar el producto.");
        }
    };

    return (
        <div className="admin-hero">
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

            <div className="admin-content">

                {/* PANEL */}
                {vista === "panel" && (
                    <>
                        <h1>Panel de Administración</h1>
                        <p>Gestiona usuarios, productos, pedidos y más.</p>
                    </>
                )}

                {/* USUARIOS */}
                {vista === "usuarios" && (
                    <div className="admin-usuarios-container">
                        <h2>Gestión de Usuarios</h2>

                        <div className="controles-superiores">
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                value={busqueda}
                                onChange={(e) => handleBusqueda(e.target.value)}
                                className="input-busqueda"
                            />

                            <div className="filtro-rol">
                                <label>Rol:</label>
                                <select value={rolFiltro} onChange={(e) => setRolFiltro(e.target.value)}>
                                    <option value="">Todos</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="CLIENTE">Cliente</option>
                                    <option value="VENDEDOR">Vendedor</option>
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
                                                >
                                                    <option value="ADMIN">Admin</option>
                                                    <option value="CLIENTE">Cliente</option>
                                                    <option value="VENDEDOR">Vendedor</option>
                                                </select>
                                            </td>

                                            <td>
                                                <button className="btn-eliminar" onClick={() => eliminarUsuario(u.id)}>
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan="6">No se encontraron usuarios.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* PRODUCTOS */}
                {vista === "productos" && (
                    <div className="admin-usuarios-container">
                        <h2>Gestión de Productos</h2>

                        {/* BOTÓN IZQUIERDA + FILTROS DERECHA */}
                        <div style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            margin: "20px 0"
                        }}>

                            {/* IZQUIERDA → Botón */}
                            <button
                                className="btn-agregar"
                                onClick={() => navigate("/admin/productos/agregar")}
                                style={{ minWidth: "180px" }}
                            >
                                Agregar Producto
                            </button>

                            {/* DERECHA → Buscador + Filtro */}
                            <div className="controles-superiores" style={{ display: "flex", gap: "15px" }}>

                                <input
                                    type="text"
                                    placeholder="Buscar producto..."
                                    value={busquedaProducto}
                                    onChange={(e) => setBusquedaProducto(e.target.value)}
                                    className="input-busqueda"
                                />

                                <div className="filtro-rol">
                                    <label>Marca:</label>
                                    <select
                                        value={marcaFiltro}
                                        onChange={(e) => setMarcaFiltro(e.target.value)}
                                    >
                                        <option value="">Todas</option>
                                        {[...new Set(productos.map(p => p.marca?.nombre))]
                                            .filter(Boolean)
                                            .map((marca, index) => (
                                                <option key={index} value={marca}>{marca}</option>
                                            ))}
                                    </select>
                                </div>

                            </div>
                        </div>

                        <table className="tabla-usuarios">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Categoría</th>
                                    <th>Marca</th>
                                    <th>Precio</th>
                                    <th>Imagen</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {productos
                                    .filter(p => p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase()))
                                    .filter(p => marcaFiltro ? p.marca?.nombre === marcaFiltro : true)
                                    .map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.nombre}</td>
                                            <td>{p.categoria?.nombre || "Sin categoría"}</td>
                                            <td>{p.marca?.nombre || "Sin marca"}</td>
                                            <td>${Number(p.precio).toFixed(2)}</td>

                                            <td>
                                                {p.imagen ? (
                                                    <button className="btn-icon view" onClick={() => window.open(p.imagen, "_blank")}>
                                                        👁
                                                    </button>
                                                ) : "—"}
                                            </td>
                                            <td>
                                                <button
                                                    className={`estado-btn ${p.activo ? "activo" : "inactivo"}`}
                                                    onClick={async () => {
                                                        await api.patch(`productos/toggle/${p.id}/`);
                                                        obtenerProductos();
                                                    }}
                                                >
                                                    {p.activo ? "Activo " : "Inactivo "}
                                                </button>
                                            </td>

                                            <td className="td-acciones">
                                                <button className="btn-icon edit" onClick={() => navigate(`/admin/productos/editar/${p.id}`)}>
                                                    ✏️
                                                </button>

                                                <button className="btn-icon delete" onClick={() => eliminarProducto(p.id)}>
                                                    🗑
                                                </button>
                                            </td>

                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                )}
                {/* PEDIDOS */}
                {vista === "pedidos" && (
                    <div className="admin-usuarios-container">
                        <h2>Gestión de Pedidos</h2>
                        <div className="controles-superiores">
                            <input
                                type="text"
                                placeholder="Buscar cliente o ID..."
                                value={busquedaPedido}
                                onChange={(e) => setBusquedaPedido(e.target.value)}
                                className="input-busqueda"
                            />

                            <div className="filtro-rol">
                                <label>Estado:</label>
                                <select
                                    value={filtroEstado}
                                    onChange={(e) => setFiltroEstado(e.target.value)}
                                >
                                    <option value="">Todos</option>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="PREPARANDO">Preparando</option>
                                    <option value="LISTO">Listo</option>
                                    <option value="ENTREGADO">Entregado</option>
                                    <option value="CANCELADO">Cancelado</option>
                                </select>
                            </div>
                        </div>
                        <table className="tabla-usuarios">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Fecha</th>
                                    <th>Estado</th>
                                    <th>Facturas</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>

                            <tbody>
                                {pedidos.length > 0 ? (
                                    pedidos
                                        .filter(p =>
                                            (p.cliente_nombre?.toLowerCase().includes(busquedaPedido.toLowerCase()) ||
                                                String(p.id).includes(busquedaPedido)) &&
                                            (filtroEstado === "" || p.estado === filtroEstado)
                                        )
                                        .map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>{p.cliente_nombre}</td>
                                                <td>${Number(p.total).toFixed(2)}</td>
                                                <td>{p.estado}</td>
                                                <td>{p.fecha}</td>

                                                <td>
                                                    <select
                                                        onChange={(e) => cambiarEstadoPedido(p.id, e.target.value)}
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Cambiar estado</option>
                                                        <option value="PENDIENTE">Pendiente</option>
                                                        <option value="PREPARANDO">Preparando</option>
                                                        <option value="LISTO">Listo</option>
                                                        <option value="ENTREGADO">Entregado</option>
                                                        <option value="CANCELADO">Cancelado</option>
                                                    </select>

                                                </td>

                                                <td><button
                                                    className="btn-icon view"
                                                    onClick={() => imprimirFactura(p.id)}
                                                >
                                                    🖨
                                                </button></td>
                                                <td>
                                                    <button
                                                        className="btn-eliminar"
                                                        onClick={() => eliminarPedido(p.id)}
                                                        style={{
                                                            background: "#e63946",
                                                            color: "white",
                                                            border: "none",
                                                            padding: "6px 10px",
                                                            borderRadius: "6px",
                                                            cursor: "pointer"
                                                        }}
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>

                                            </tr>
                                        ))
                                ) : (
                                    <tr><td colSpan="6">No se encontraron pedidos.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

            </div>

            <footer className="admin-footer">
                © {new Date().getFullYear()} Sistema de Pedidos Online VS — Administrador
            </footer>
        </div>
    );
};

export default AdminInicio;
