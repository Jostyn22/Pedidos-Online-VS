import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ClienteInicio.css";
import fondoVivirSano from "../../assets/vivir_sano.jpg";
import CatalogoProductos from "../productos/CatalogoProductos";

const ClienteInicio = () => {
    const [mostrarCatalogo, setMostrarCatalogo] = useState(false);

    const manejarClickProductos = () => {
        setMostrarCatalogo(true);
        setTimeout(() => {
            const seccion = document.getElementById("productos");
            if (seccion) {
                seccion.scrollIntoView({ behavior: "smooth" });
            }
        }, 200);
    };

    const manejarClickInicio = () => {
        setMostrarCatalogo(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <div>
            {/*Navbar siempre visible */}
            <nav className="navbar-cliente">
                <div className="navbar-logo">
                    PedidosOnline<span>VS</span>
                </div>

                <ul className="navbar-links">
                    <li>
                        <button
                            onClick={manejarClickInicio}
                            className={`link-btn ${!mostrarCatalogo ? "activo" : ""}`}
                        >
                            Inicio
                        </button>
                    </li>
                    <li>
                        <button
                            onClick={manejarClickProductos}
                            className={`link-btn ${mostrarCatalogo ? "activo" : ""}`}
                        >
                            Productos
                        </button>
                    </li>
                    <li><Link to="#pedidos">Pedidos</Link></li>
                    <li><Link to="/cliente/mi-cuenta">Cuenta</Link></li>
                </ul>

                <div className="navbar-right">
                    <div className="navbar-search">
                        <input type="text" placeholder="Buscar..." />
                        <span className="icon-search">🔍</span>
                    </div>
                    <span className="icon-cart">🛒</span>
                </div>
            </nav>

            {/* 🔹 Mostrar hero solo si NO está el catálogo activo */}
            {!mostrarCatalogo && (
                <div
                    className="cliente-hero"
                    style={{
                        backgroundImage: `url(${fondoVivirSano})`,
                    }}
                >
                    <div className="cliente-overlay"></div>
                    <div className="cliente-content">
                        <h1 className="cliente-titulo">TODO PARA TUS PEDIDOS EN LÍNEA</h1>
                        <p className="cliente-subtitulo">
                            ¡Gestiona tus pedidos, pagos y envíos desde un solo lugar!
                        </p>
                        <button
                            className="cliente-boton"
                            onClick={() => (window.location.href = "/cliente/mi-cuenta")}
                        >
                            Ver mis pedidos
                        </button>
                    </div>
                </div>
            )}

            {/* 🔹 Mostrar catálogo solo cuando se da clic en "Productos" */}
            {mostrarCatalogo && (
                <section id="productos" style={{ background: "#f8f9fa", padding: "40px 0" }}>
                    <h2
                        style={{
                            textAlign: "center",
                            marginBottom: "30px",
                            fontFamily: "Poppins",
                        }}
                    >
                        Nuestros Productos
                    </h2>
                    <CatalogoProductos />
                </section>
            )}

            {/* 🔹 Pie de página */}
            <footer className="cliente-footer">©Pedidos Online VS</footer>
        </div>
    );
};

export default ClienteInicio;
