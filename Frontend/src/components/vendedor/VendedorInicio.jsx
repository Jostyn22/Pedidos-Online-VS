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

    const obtenerProductos = async () => {
        try {
            const response = await api.get("productos/vendedor/");
            setProductos(response.data);
        } catch (error) {
            console.error("Error al cargar productos:", error);
        }
    };

    const obtenerPerfil = async () => {
        try {
            const response = await api.get("usuarios/actual/");
            setUsuario(response.data);
        } catch (error) {
            console.error("Error al cargar perfil:", error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    return (
        <div className="vendedor-hero">
            {/*Navbar */}
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

            {/*Contenido dinámico */}
            <section className="vendedor-content">
                {/* Vista inicio */}
                {vista === "inicio" && (
                    <div>
                        <h1>
                            Bienvenido, {usuario.username || localStorage.getItem("username")}
                        </h1>
                        <p>Administra tus pedidos, productos y perfil desde este panel.</p>
                        <button className="btn-vendedor">Ir a mis pedidos</button>
                    </div>
                )}

                {/* Vista pedidos */}
                {vista === "pedidos" && (
                    <div className="tabla-container">
                        <h2>Pedidos asignados</h2>
                        <table className="tabla-vendedor">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Cliente</th>
                                    <th>Fecha</th>
                                    <th>Total</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map((p) => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.cliente}</td>
                                        <td>{new Date(p.fecha_pedido).toLocaleDateString()}</td>
                                        <td>${p.total}</td>
                                        <td>{p.estado}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Vista productos */}
                {vista === "productos" && (
                    <div className="tabla-container">
                        <h2>Mis productos</h2>
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
                                {productos.map((prod) => (
                                    <tr key={prod.id}>
                                        <td>{prod.id}</td>
                                        <td>{prod.nombre}</td>
                                        <td>${prod.precio}</td>
                                        <td>{prod.stock}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* 👤 Vista perfil */}
                {vista === "perfil" && (
                    <div className="perfil-container">
                        <h2>Detalles de tu cuenta</h2>

                        {!usuario.editando ? (
                            <div className="perfil-detalles">
                                <p><b>Usuario:</b> {usuario.username}</p>
                                <p><b>Email:</b> {usuario.email}</p>
                                <p><b>Teléfono:</b> {usuario.telefono || "No registrado"}</p>
                                <p><b>Dirección:</b> {usuario.direccion || "No registrada"}</p>

                                <button
                                    className="btn-editar"
                                    onClick={() => setUsuario({ ...usuario, editando: true })}
                                >
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
                                        onChange={(e) =>
                                            setUsuario({ ...usuario, username: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="campo-editable">
                                    <label><b>Email:</b></label>
                                    <input
                                        type="email"
                                        value={usuario.email || ""}
                                        onChange={(e) =>
                                            setUsuario({ ...usuario, email: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="campo-editable">
                                    <label><b>Teléfono:</b></label>
                                    <input
                                        type="text"
                                        value={usuario.telefono || ""}
                                        onChange={(e) =>
                                            setUsuario({ ...usuario, telefono: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="campo-editable">
                                    <label><b>Dirección:</b></label>
                                    <input
                                        type="text"
                                        value={usuario.direccion || ""}
                                        onChange={(e) =>
                                            setUsuario({ ...usuario, direccion: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="perfil-botones">
                                    <button
                                        className="btn-guardar"
                                        onClick={async () => {
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
                                            } catch (error) {
                                                console.error("Error al actualizar perfil:", error);
                                                setMensajeExito("No se pudo actualizar el perfil");
                                                setTimeout(() => setMensajeExito(""), 4000);
                                            }
                                        }}
                                    >
                                        Guardar cambios
                                    </button>

                                    <button
                                        className="btn-cancelar"
                                        onClick={() => setUsuario({ ...usuario, editando: false })}
                                    >
                                        Cancelar
                                    </button>
                                </div>

                                {/* Mensaje debajo de los botones */}
                                {mensajeExito && (
                                    <p
                                        className={`mensaje-exito ${mensajeExito.includes("❌") ? "error" : "ok"
                                            }`}
                                    >
                                        {mensajeExito}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </section>

            {/*  Footer */}
            <footer className="vendedor-footer">
                © {new Date().getFullYear()} Pedidos Online VS — Vendedor
            </footer>
        </div>
    );
};

export default VendedorInicio;
