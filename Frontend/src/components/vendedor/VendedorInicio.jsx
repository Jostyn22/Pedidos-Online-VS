import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./VendedorInicio.css";

const VendedorInicio = () => {
    const navigate = useNavigate();
    const [vista, setVista] = useState("inicio");
    const [pedidos, setPedidos] = useState([]);
    const [productos, setProductos] = useState([]);
    const [usuario, setUsuario] = useState({});
    const [mensajeExito, setMensajeExito] = useState("");
    const [busquedaCliente, setBusquedaCliente] = useState("");
    const [busquedaProducto, setBusquedaProducto] = useState("");

    const formatearFecha = (valor) => {
        if (!valor) return "—";
        const d = new Date(valor);
        return isNaN(d.getTime()) ? "—" : d.toLocaleString("es-EC");
    };

    const formatearDinero = (n) =>
        new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(Number(n || 0));

    useEffect(() => {
        if (vista === "pedidos") obtenerPedidos();
        if (vista === "productos") obtenerProductos();
        if (vista === "perfil") obtenerPerfil();
    }, [vista]);

    const obtenerPedidos = async () => {
        try {
            const response = await api.get("pedidos/vendedor/");
            setPedidos(response.data);
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
        }
    };
    const pedidosFiltrados = pedidos.filter((p) =>
        (p.cliente_nombre ?? p.cliente ?? "")
            .toLowerCase()
            .includes(busquedaCliente.toLowerCase())
    );
    const productosFiltrados = productos.filter((prod) =>
        prod.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
    );
    const obtenerProductos = async () => {
        try {
            const response = await api.get("productos/");
            setProductos(response.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    const obtenerPerfil = async () => {
        try {
            const response = await api.get("usuarios/actual/");
            setUsuario({ ...response.data, editando: false });
        } catch (error) {
            console.error("Error al cargar perfil:", error);
        }
    };

    const handleGuardarCambios = async () => {
        try {
            await api.patch("usuarios/actual/", {
                username: usuario.username,
                email: usuario.email,
                telefono: usuario.telefono,
                direccion: usuario.direccion,
            });

            setMensajeExito("Datos actualizados correctamente");
            setUsuario({ ...usuario, editando: false });

            setTimeout(() => setMensajeExito(""), 4000);
        } catch {
            setMensajeExito("No se pudo actualizar el perfil");
            setTimeout(() => setMensajeExito(""), 4000);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="vendedor-hero">
            <nav className="vendedor-navbar">
                <div className="vendedor-logo">
                    PedidosOnlineVS<span>Vendedores</span>
                </div>
                <ul className="vendedor-menu">
                    <li onClick={() => setVista("inicio")}>Inicio</li>
                    <li onClick={() => setVista("pedidos")}>Pedidos</li>
                    <li onClick={() => setVista("productos")}>Productos</li>
                    <li onClick={() => setVista("perfil")}>Perfil</li>
                </ul>
                <button className="logout-btn" onClick={handleLogout}>
                    Cerrar sesión
                </button>
            </nav>

            <section className="vendedor-content">

                {vista === "inicio" && (
                    <div>
                        <h1>Bienvenido, {usuario.username || localStorage.getItem("username")}</h1>
                        <p>Administra tus pedidos, productos y perfil desde este panel.</p>
                        <button className="btn-vendedor" onClick={() => setVista("pedidos")}>
                            Ir a mis pedidos
                        </button>
                    </div>
                )}

                {vista === "pedidos" && (
                    <div className="tabla-container">
                        <h2>Pedidos asignados</h2>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "12px" }}>
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={busquedaCliente}
                                onChange={(e) => setBusquedaCliente(e.target.value)}
                                style={{
                                    padding: "8px 14px",
                                    borderRadius: "8px",
                                    border: "1px solid #94a3b8",
                                    fontSize: "0.95rem",
                                    width: "250px"
                                }}
                            />
                        </div>
                        <table className="tabla-vendedor">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidosFiltrados.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.cliente_nombre ?? p.cliente}</td>
                                        <td>{formatearFecha(p.fecha)}</td>
                                        <td>{formatearDinero(p.total)}</td>
                                        <td>{p.estado}</td>
                                        <td>
                                            {p.estado !== "ENTREGADO" ? (
                                                <button
                                                    className="btn-estado"
                                                    onClick={async () => {
                                                        try {
                                                            await api.patch(`pedidos/estado/${p.id}/`);
                                                            obtenerPedidos();
                                                        } catch (error) {
                                                            console.error("Error cambiando estado:", error);
                                                        }
                                                    }}
                                                >
                                                    Siguiente estado
                                                </button>
                                            ) : (
                                                <span className="estado-final">Completado</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {vista === "productos" && (
                    <div className="tabla-container">
                        <h2 className="titulo-productos">Mis productos</h2>
                        {/* Buscador + Botón */}
                        <div className="acciones-productos">
                            <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={busquedaProducto}
                                onChange={(e) => setBusquedaProducto(e.target.value)}
                                className="input-buscar-producto"
                            />

                            <button className="btn-vendedor" onClick={() => navigate("/vendedor/productos/agregar")}>
                                Agregar Producto
                            </button>
                        </div>

                        <table className="tabla-vendedor">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Precio</th>
                                    <th>Stock</th>
                                </tr>
                            </thead>
                            <tbody>
                                {productosFiltrados.length > 0 ? (
                                    productosFiltrados.map((prod) => (
                                        <tr key={prod.id}>
                                            <td>{prod.id}</td>
                                            <td>{prod.nombre}</td>
                                            <td>{formatearDinero(prod.precio)}</td>
                                            <td>{prod.stock}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: "center", padding: "12px" }}>
                                            No se encontraron productos.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}


                {vista === "perfil" && (
                    <div className="perfil-container">
                        <h2>Detalles de tu cuenta</h2>

                        {!usuario.editando ? (
                            <div className="perfil-detalles">
                                <p><b>Usuario:</b> {usuario.username}</p>
                                <p><b>Email:</b> {usuario.email}</p>
                                <p><b>Teléfono:</b> {usuario.telefono || "No registrado"}</p>
                                <p><b>Dirección:</b> {usuario.direccion || "No registrada"}</p>

                                <button className="btn-vendedor" onClick={() => setUsuario({ ...usuario, editando: true })}>
                                    Editar datos
                                </button>
                            </div>
                        ) : (
                            <div className="perfil-editar">

                                <div className="campo-editable">
                                    <label><b>Usuario:</b></label>
                                    <input
                                        type="text"
                                        value={usuario.username || ""}
                                        onChange={(e) => setUsuario({ ...usuario, username: e.target.value })}
                                    />
                                </div>

                                <div className="campo-editable">
                                    <label><b>Email:</b></label>
                                    <input
                                        type="email"
                                        value={usuario.email || ""}
                                        onChange={(e) => setUsuario({ ...usuario, email: e.target.value })}
                                    />
                                </div>

                                <div className="campo-editable">
                                    <label><b>Teléfono:</b></label>
                                    <input
                                        type="text"
                                        value={usuario.telefono || ""}
                                        onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
                                    />
                                </div>

                                <div className="campo-editable">
                                    <label><b>Dirección:</b></label>
                                    <input
                                        type="text"
                                        value={usuario.direccion || ""}
                                        onChange={(e) => setUsuario({ ...usuario, direccion: e.target.value })}
                                    />
                                </div>

                                <div className="perfil-botones">
                                    <button className="btn-guardar" onClick={handleGuardarCambios}>
                                        Guardar cambios
                                    </button>

                                    <button className="btn-cancelar" onClick={() => setUsuario({ ...usuario, editando: false })}>
                                        Cancelar
                                    </button>
                                </div>

                                {mensajeExito && (
                                    <p className={`mensaje-exito ${mensajeExito.includes("❌") ? "error" : "ok"}`}>
                                        {mensajeExito}
                                    </p>
                                )}

                            </div>
                        )}
                    </div>
                )}
            </section>
            <footer className="vendedor-footer">
                © {new Date().getFullYear()} Pedidos Online VS — Vendedor
            </footer>
        </div>
    );
};

export default VendedorInicio;
