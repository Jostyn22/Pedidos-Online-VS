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
    const [mostrarDescuento, setMostrarDescuento] = useState(false);
    const [porcentajeDescuento, setPorcentajeDescuento] = useState("");
    const [categorias, setCategorias] = useState([]);
    const [categoriaDescuento, setCategoriaDescuento] = useState("");
    // PEDIDOS
    const [pedidos, setPedidos] = useState([]);
    const [busquedaPedido, setBusquedaPedido] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("");
    const [envios, setEnvios] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [filtroMetodo, setFiltroMetodo] = useState("");
    const [busquedaPago, setBusquedaPago] = useState("");
    const [filtroEstadoEnvio, setFiltroEstadoEnvio] = useState("");

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
        const res = await api.get("productos/");
        console.log("PRODUCTOS BACKEND:", res.data);
        setProductos(res.data);
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
        const pedido = pedidos.find(p => p.id === id);
        if (!pedido) return;

        // No permitir eliminar si el pedido tiene estado diferente a "PENDIENTE"
        if (pedido.estado !== "PENDIENTE") {
            alert("No se puede eliminar un pedido que ya ha sido procesado o realizado por un usuario.");
            return;
        }

        if (!window.confirm("¿Seguro que deseas eliminar este pedido?")) return;

        try {
            await api.delete(`pedidos/eliminar/${id}/`);
            obtenerPedidos();
        } catch (error) {
            alert("No se pudo eliminar el pedido");
        }
    };
    const obtenerPagosAdmin = async () => {
        try {
            const res = await api.get("pagos/admin/listar/"); // <- este endpoint devuelve todos
            setPagos(res.data);
        } catch (error) {
            console.error("Error cargando pagos:", error);
        }
    };

    const cambiarEstadoPago = async (id, nuevoEstado) => {
        try {
            await api.patch(`pagos/${id}/cambiar-estado/`, { estado_pago: nuevoEstado });
            obtenerPagosAdmin(); // refresca la tabla de pagos
        } catch (error) {
            console.error("Error cambiando estado del pago:", error);
        }
    };
    const eliminarPago = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este pago?")) return;

        try {
            await api.delete(`pagos/eliminar/${id}/`);
            obtenerPagosAdmin(); // refresca la tabla
        } catch (error) {
            console.error("Error eliminando pago:", error);
            alert("No se pudo eliminar el pago.");
        }
    };

    const obtenerEnviosAdmin = async () => {
        try {
            const res = await api.get("envios/admin/listar/");
            setEnvios(res.data);
        } catch (error) {
            console.error("Error cargando envíos:", error);
        }
    };
    const cambiarEstadoAdmin = async (id, estado) => {
        try {
            await api.patch(`envios/cambiar-estado/${id}/`, { estado });
            obtenerEnviosAdmin();
        } catch (error) {
            console.error("Error cambiando estado:", error);
        }
    };
    const eliminarEnvio = async (id) => {
        if (!window.confirm("¿Eliminar este envío?")) return;

        try {
            await api.delete(`envios/admin/eliminar/${id}/`);
            obtenerEnviosAdmin();
        } catch (error) {
            console.error("Error eliminando envío:", error);
        }
    };
    const formatearFecha = (fechaString) => {
        if (!fechaString) return "—";
        const fecha = new Date(fechaString);
        if (isNaN(fecha)) return "—";
        const dia = fecha.getDate().toString().padStart(2, "0");
        const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
        const anio = fecha.getFullYear();
        return `${dia}/${mes}/${anio}`;
    };

    const cambiarEstadoPedido = async (id, nuevoEstado) => {
        try {
            await api.patch(`pedidos/${id}/`, { estado: nuevoEstado });
            obtenerPedidos();       // refresca la tabla de pedidos
            if (nuevoEstado === "LISTO") obtenerEnviosAdmin(); // refresca envíos automáticamente
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
        if (vista === "productos") {
            obtenerProductos();
            obtenerCategorias();
        }
        if (vista === "pedidos") obtenerPedidos();
        if (vista === "pagos") obtenerPagosAdmin();
        if (vista === "envios") obtenerEnviosAdmin();
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
        const usuario = usuarios.find(u => u.id === id);
        if (!usuario) return;

        // Si es cliente y tiene pedidos
        const tienePedidos = pedidos.some(p => p.cliente === id);
        // Si es vendedor y tiene productos
        const tieneProductos = productos.some(p => p.vendedor === id);

        if (tienePedidos || tieneProductos) {
            alert("No se puede eliminar un usuario que tiene pedidos o productos asociados.");
            return;
        }

        if (!window.confirm("¿Seguro que deseas eliminar este usuario?")) return;

        try {
            await api.delete(`usuarios/eliminar/${id}/`);
            obtenerUsuarios(rolFiltro);
        } catch {
            alert("No se pudo eliminar el usuario.");
        }
    };

    const eliminarProducto = async (id) => {
        const productoEnPedido = pedidos.some(p =>
            p.detalles?.some(d => d.producto === id)
        );

        if (productoEnPedido) {
            alert("No se puede eliminar un producto que está asociado a un pedido.");
            return;
        }

        if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

        try {
            await api.delete(`productos/${id}/`);
            obtenerProductos();
        } catch {
            alert("No se pudo eliminar el producto.");
        }
    };
    const aplicarDescuento = async () => {
        if (!categoriaDescuento || !porcentajeDescuento) {
            alert("Seleccione categoría y porcentaje");
            return;
        }

        await api.patch("productos/aplicar-descuento-categoria/", {
            categoria_id: categoriaDescuento,
            porcentaje_descuento: porcentajeDescuento,
        });

        setMostrarDescuento(false);
        setCategoriaDescuento("");
        setPorcentajeDescuento("");
        obtenerProductos();
    };

    const obtenerCategorias = async () => {
        const res = await api.get("categorias/");
        setCategorias(res.data);
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

                            <button
                                onClick={() => setMostrarDescuento(!mostrarDescuento)}
                                className="btn-agregar"
                                style={{ background: "#f59e0b" }}
                            >
                                Aplicar descuento
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
                        {/* PANEL DESCUENTO POR CATEGORÍA */}
                        {mostrarDescuento && (
                            <div
                                style={{
                                    marginBottom: "20px",
                                    padding: "15px",
                                    background: "#fff7ed",
                                    border: "1px solid #f59e0b",
                                    borderRadius: "8px",
                                    display: "flex",
                                    gap: "15px",
                                    alignItems: "center"
                                }}
                            >
                                <select
                                    value={categoriaDescuento}
                                    onChange={(e) => setCategoriaDescuento(e.target.value)}
                                    style={{ padding: "8px", borderRadius: "6px" }}
                                >
                                    <option value="">Seleccione categoría</option>
                                    {categorias.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    min="1"
                                    max="90"
                                    placeholder="% descuento"
                                    value={porcentajeDescuento}
                                    onChange={(e) => setPorcentajeDescuento(e.target.value)}
                                    style={{
                                        width: "120px",
                                        padding: "8px",
                                        borderRadius: "6px",
                                        border: "1px solid #ccc"
                                    }}
                                />

                                <button
                                    className="btn-agregar"
                                    style={{ background: "#16a34a" }}
                                    onClick={aplicarDescuento}
                                >
                                    Aplicar
                                </button>
                            </div>
                        )}



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
                                            <td>
                                                {p.precio_final && Number(p.precio_final) < Number(p.precio) ? (
                                                    <>
                                                        <span style={{ textDecoration: "line-through", color: "#777" }}>
                                                            ${Number(p.precio).toFixed(2)}
                                                        </span>
                                                        <br />
                                                        <strong style={{ color: "#15803d" }}>
                                                            ${Number(p.precio_final).toFixed(2)}
                                                        </strong>
                                                        <span
                                                            style={{
                                                                marginLeft: "6px",
                                                                background: "#dcfce7",
                                                                color: "#15803d",
                                                                padding: "2px 6px",
                                                                borderRadius: "6px",
                                                                fontSize: "12px",
                                                                fontWeight: "bold",
                                                            }}
                                                        >
                                                            -{p.porcentaje_descuento}%
                                                        </span>
                                                    </>
                                                ) : (
                                                    <>${Number(p.precio).toFixed(2)}</>
                                                )}
                                            </td>

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
            {/* PAGOS */}
            {vista === "pagos" && (
                <div className="admin-usuarios-container">
                    <h2>Gestión de Pagos</h2>

                    {/* FILTROS */}
                    <div className="controles-superiores" style={{ marginBottom: "15px" }}>
                        <input
                            type="text"
                            placeholder="Buscar por cliente o ID..."
                            value={busquedaPago} // crear estado busquedaPago
                            onChange={(e) => setBusquedaPago(e.target.value)}
                            className="input-busqueda"
                        />

                        <div className="filtro-rol">
                            <label>Método de pago:</label>
                            <select
                                value={filtroMetodo} // crear estado filtroMetodo
                                onChange={(e) => setFiltroMetodo(e.target.value)}
                            >
                                <option value="">Todos</option>
                                <option value="EFECTIVO">Efectivo</option>
                                <option value="TARJETA">Tarjeta</option>
                                <option value="TRANSFERENCIA">Transferencia</option>
                            </select>
                        </div>
                    </div>

                    <table className="tabla-usuarios">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Pedido</th>
                                <th>Cliente</th>
                                <th>Monto</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th>Fecha</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pagos.length > 0 ? (
                                pagos
                                    .filter(p =>
                                        (filtroMetodo === "" || p.metodo === filtroMetodo) &&
                                        (busquedaPago === "" ||
                                            p.pedido_cliente_nombre?.toLowerCase().includes(busquedaPago.toLowerCase()) ||
                                            String(p.pedido).includes(busquedaPago))
                                    )
                                    .map((p) => (
                                        <tr key={p.id}>
                                            <td>{p.id}</td>
                                            <td>{p.pedido}</td>
                                            <td>{p.pedido_cliente_nombre}</td>
                                            <td>${Number(p.monto).toFixed(2)}</td>
                                            <td>{p.metodo}</td>
                                            <td>{p.estado_pago}</td>
                                            <td>{formatearFecha(p.fecha_pago)}</td>
                                            <td className="td-acciones">
                                                <select
                                                    value={p.estado_pago}
                                                    onChange={(ev) => {
                                                        if (p.estado_pago === "PAGADO") {
                                                            alert("No se puede cambiar el estado de un pago que ya está pagado.");
                                                            return;
                                                        }
                                                        cambiarEstadoPago(p.id, ev.target.value);
                                                    }}
                                                >
                                                    <option value="PENDIENTE">Pendiente</option>
                                                    <option value="PAGADO">Pagado</option>
                                                    <option value="RECHAZADO">Rechazado</option>
                                                </select>

                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() => {
                                                        if (p.estado_pago === "PAGADO") {
                                                            alert("No se puede eliminar un pago que ya está pagado.");
                                                            return;
                                                        }
                                                        eliminarPago(p.id);
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="8">No se encontraron pagos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ENVÍOS */}
            {vista === "envios" && (
                <div className="admin-usuarios-container">
                    <h2>Gestión de Envíos</h2>

                    {/* FILTRO POR ESTADO */}
                    <div className="controles-superiores" style={{ marginBottom: "15px" }}>
                        <label>Filtrar por estado:</label>
                        <select
                            value={filtroEstadoEnvio}
                            onChange={(e) => setFiltroEstadoEnvio(e.target.value)}
                            style={{ marginLeft: "10px", padding: "4px 8px" }}
                        >
                            <option value="">Todos</option>
                            <option value="PENDIENTE">Pendiente</option>
                            <option value="EN CAMINO">En camino</option>
                            <option value="ENTREGADO">Entregado</option>
                            <option value="CANCELADO">Cancelado</option>
                        </select>
                    </div>

                    <table className="tabla-usuarios">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Pedido</th>
                                <th>Dirección</th>
                                <th>Estado</th>
                                <th>Fecha envío</th>
                                <th>Fecha entrega</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {envios.length > 0 ? (
                                envios
                                    .filter(e => filtroEstadoEnvio === "" || e.estado === filtroEstadoEnvio)
                                    .map((e) => (
                                        <tr key={e.id}>
                                            <td>{e.id}</td>
                                            <td>{e.pedido}</td>
                                            <td>{e.direccion_envio}</td>
                                            <td>{e.estado}</td>
                                            <td>{formatearFecha(e.fecha_envio)}</td>
                                            <td>{formatearFecha(e.fecha_entrega)}</td>
                                            <td className="td-acciones">
                                                <select
                                                    value={e.estado}
                                                    onChange={(ev) => {
                                                        if (e.estado === "ENTREGADO") {
                                                            alert("No se puede cambiar el estado de un envío que ya ha sido entregado.");
                                                            return;
                                                        }
                                                        cambiarEstadoAdmin(e.id, ev.target.value);
                                                    }}
                                                >
                                                    <option value="PENDIENTE">Pendiente</option>
                                                    <option value="EN CAMINO">En camino</option>
                                                    <option value="ENTREGADO">Entregado</option>
                                                    <option value="CANCELADO">Cancelado</option>
                                                </select>

                                                <button
                                                    className="btn-eliminar"
                                                    onClick={() => {
                                                        if (e.estado === "ENTREGADO") {
                                                            alert("No se puede eliminar un envío que ya ha sido entregado.");
                                                            return;
                                                        }
                                                        eliminarEnvio(e.id);
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            ) : (
                                <tr>
                                    <td colSpan="7">No se encontraron envíos.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}




            <footer className="admin-footer">
                © {new Date().getFullYear()} Sistema de Pedidos Online VS — Administrador
            </footer>
        </div>
    );
};

export default AdminInicio;
