import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./MiCuenta.css";

const MiCuenta = () => {
    const [usuario, setUsuario] = useState(null);
    const [seccion, setSeccion] = useState("escritorio");
    const [mensaje, setMensaje] = useState("");
    const navigate = useNavigate();
    const [editandoDireccion, setEditandoDireccion] = useState(false);
    const [editandoDatos, setEditandoDatos] = useState(false);
    const [nuevaDireccion, setNuevaDireccion] = useState("");
    const [nuevoTelefono, setNuevoTelefono] = useState("");
    const [nuevoUsername, setNuevoUsername] = useState("");
    const [nuevoEmail, setNuevoEmail] = useState("");

    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
                const response = await api.get("usuarios/actual/");
                const pedidosRes = await api.get("pedidos/cliente/");

                setUsuario({
                    ...response.data,
                    pedidos: pedidosRes.data,
                });

                setNuevaDireccion(response.data.direccion || "");
                setNuevoTelefono(response.data.telefono || "");
                setNuevoUsername(response.data.username || "");
                setNuevoEmail(response.data.email || "");
            } catch (error) {
                console.error("Error al obtener usuario:", error);
                setMensaje("No se pudo cargar la información de la cuenta.");
            }
        };
        obtenerUsuario();
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        localStorage.setItem("logoutMessage", "Sesión cerrada correctamente.");
        navigate("/");
    };

    const handleGuardarDireccion = async () => {
        try {
            await api.patch("usuarios/actual/", {
                direccion: nuevaDireccion,
                telefono: nuevoTelefono,
            });
            setUsuario({ ...usuario, direccion: nuevaDireccion, telefono: nuevoTelefono });
            setEditandoDireccion(false);
        } catch (error) {
            console.error("Error al actualizar dirección:", error);
        }
    };

    const handleGuardarDatos = async () => {
        try {
            await api.patch("usuarios/actual/", {
                username: nuevoUsername,
                email: nuevoEmail,
            });
            setUsuario({ ...usuario, username: nuevoUsername, email: nuevoEmail });
            setEditandoDatos(false);
        } catch (error) {
            console.error("Error al actualizar datos:", error);
        }
    };

    if (!usuario) {
        return <p className="cargando">Cargando información de tu cuenta...</p>;
    }

    return (
        <div className="cuenta-container">

            <nav className="navbar-cliente">
                <div
                    className="navbar-logo"
                    onClick={() => navigate("/cliente/inicio")}
                    style={{ cursor: "pointer" }}
                >
                    PedidosOnline<span>VS</span>
                </div>

                <ul className="navbar-links">
                    <li>
                        <button
                            className="link-btn"
                            onClick={() => navigate("/cliente/inicio")}
                        >
                            Inicio
                        </button>
                    </li>

                    <li>
                        <button
                            className="link-btn"
                            onClick={() => navigate("/cliente/inicio?seccion=productos")}
                        >
                            Productos
                        </button>
                    </li>

                    <li><Link to="/cliente/mi-cuenta">Cuenta</Link></li>
                </ul>

                <div className="navbar-right">
                    <div className="navbar-search">
                        <input type="text" placeholder="Buscar productos..." />
                        <span className="icon-search">🔍</span>
                    </div>

                    <span
                        className="icon-cart"
                        onClick={() => navigate("/cliente/inicio?seccion=carrito")}
                        style={{ cursor: "pointer" }}
                    >
                        🛒
                    </span>
                </div>
            </nav>

            <header className="cuenta-header">
                <h1>DATOS <span>PERSONALES</span></h1>
            </header>

            <div className="cuenta-contenido">

                <aside className="cuenta-sidebar">
                    <div className="cuenta-usuario">
                        <div className="avatar">{usuario.username.charAt(0).toUpperCase()}</div>
                        <h3>{usuario.username}</h3>
                        <button className="btn-salir" onClick={handleLogout}>Cerrar sesión</button>
                    </div>

                    <ul className="menu-cuenta">
                        <li className={seccion === "escritorio" ? "activo" : ""} onClick={() => setSeccion("escritorio")}>Escritorio</li>
                        <li className={seccion === "pedidos" ? "activo" : ""} onClick={() => setSeccion("pedidos")}>Pedidos</li>
                        <li className={seccion === "direcciones" ? "activo" : ""} onClick={() => setSeccion("direcciones")}>Direcciones</li>
                        <li className={seccion === "detalles" ? "activo" : ""} onClick={() => setSeccion("detalles")}>Detalles de la cuenta</li>
                    </ul>
                </aside>

                <main className="cuenta-main">

                    {seccion === "escritorio" && (
                        <div className="escritorio-section">
                            <h2>Hola, <span>{usuario.username}</span> 👋</h2>
                            <p>Puedes administrar tus pedidos, direcciones y detalles de cuenta desde aquí.</p>
                        </div>
                    )}

                    {seccion === "pedidos" && (
                        <div className="pedidos-section">
                            <h3>Tus pedidos</h3>

                            {!usuario.pedidos || usuario.pedidos.length === 0 ? (
                                <p>No tienes pedidos aún.</p>
                            ) : (
                                <table className="tabla-pedidos">
                                    <thead>
                                        <tr>
                                            <th>Pedido</th>
                                            <th>Fecha</th>
                                            <th>Total</th>
                                            <th>Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usuario.pedidos.map((p) => (
                                            <tr key={p.id}>
                                                <td>{p.id}</td>
                                                <td>{new Date(p.fecha).toLocaleDateString()}</td>
                                                <td>${p.total}</td>
                                                <td>{p.estado}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    )}

                    {seccion === "direcciones" && (
                        <div className="direcciones-section">
                            <h3>Dirección de envío</h3>
                            <div className="direccion-box">
                                {editandoDireccion ? (
                                    <>
                                        <p><strong>Dirección:</strong></p>
                                        <input type="text" value={nuevaDireccion} onChange={(e) => setNuevaDireccion(e.target.value)} />

                                        <p><strong>Teléfono:</strong></p>
                                        <input type="text" value={nuevoTelefono} onChange={(e) => setNuevoTelefono(e.target.value)} />

                                        <button className="btn-editar" onClick={handleGuardarDireccion}>Guardar cambios</button>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Nombre:</strong> {usuario.username}</p>
                                        <p><strong>Dirección:</strong> {usuario.direccion || "No registrada"}</p>
                                        <p><strong>Teléfono:</strong> {usuario.telefono || "No registrado"}</p>
                                        <button className="btn-editar" onClick={() => setEditandoDireccion(true)}>Editar dirección</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {seccion === "detalles" && (
                        <div className="detalles-section">
                            <h3>Detalles de tu cuenta</h3>
                            <div className="detalles-grid">
                                {editandoDatos ? (
                                    <>
                                        <p><strong>Usuario:</strong></p>
                                        <input type="text" value={nuevoUsername} onChange={(e) => setNuevoUsername(e.target.value)} />

                                        <p><strong>Email:</strong></p>
                                        <input type="email" value={nuevoEmail} onChange={(e) => setNuevoEmail(e.target.value)} />

                                        <button className="btn-editar" onClick={handleGuardarDatos}>Guardar cambios</button>
                                    </>
                                ) : (
                                    <>
                                        <p><strong>Usuario:</strong> {usuario.username}</p>
                                        <p><strong>Email:</strong> {usuario.email}</p>
                                        <p><strong>Teléfono:</strong> {usuario.telefono || "No registrado"}</p>
                                        <p><strong>Dirección:</strong> {usuario.direccion || "No registrada"}</p>
                                        <button className="btn-editar" onClick={() => setEditandoDatos(true)}>Editar datos</button>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
};

export default MiCuenta;
