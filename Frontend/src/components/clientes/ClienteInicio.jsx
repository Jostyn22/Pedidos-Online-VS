import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ClienteInicio.css";
import fondoVivirSano from "../../assets/vivir_sano.jpg";
import CatalogoProductos from "../productos/CatalogoProductos";
import ClienteCarrito from "./ClienteCarrito";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ClienteInicio = () => {
    const [mostrarCatalogo, setMostrarCatalogo] = useState(false);
    const [mostrarCarrito, setMostrarCarrito] = useState(false);

    const manejarClickProductos = () => {
        setMostrarCatalogo(true);
        setMostrarCarrito(false);
        setTimeout(() => {
            const seccion = document.getElementById("productos");
            if (seccion) {
                seccion.scrollIntoView({ behavior: "smooth" });
            }
        }, 200);
    };

    const manejarClickInicio = () => {
        setMostrarCatalogo(false);
        setMostrarCarrito(false); // ocultar carrito
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const manejarClickCarrito = () => {
        setMostrarCatalogo(false);
        setMostrarCarrito(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };
    const location = useLocation();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const seccion = params.get("seccion");

        if (seccion === "productos") {
            setMostrarCatalogo(true);
            setMostrarCarrito(false);
        }

        if (seccion === "carrito") {
            setMostrarCarrito(true);
            setMostrarCatalogo(false);
        }
    }, [location]);

    return (
        <div>
            {/* 🔹 Navbar */}
            <nav className="navbar-cliente">
                <div className="navbar-logo">
                    PedidosOnline<span>VS</span>
                </div>

                <ul className="navbar-links">
                    <li>
                        <button
                            onClick={manejarClickInicio}
                            className={`link-btn ${!mostrarCatalogo && !mostrarCarrito ? "activo" : ""}`}
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

                    <li><Link to="/cliente/mi-cuenta">Cuenta</Link></li>
                </ul>

                <div className="navbar-right">
                    <div className="navbar-search">
                        <input type="text" placeholder="Buscar..." />
                        <span className="icon-search">🔍</span>
                    </div>

                    {/*CARRITO*/}
                    <span
                        className="icon-cart"
                        onClick={manejarClickCarrito}
                        style={{ cursor: "pointer" }}
                    >
                        🛒
                    </span>
                </div>
            </nav>

            {/* Sección HERO */}
            {!mostrarCatalogo && !mostrarCarrito && (
                <div
                    className="cliente-hero"
                    style={{ backgroundImage: `url(${fondoVivirSano})` }}
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

            {/*Catálogo de productos */}
            {mostrarCatalogo && !mostrarCarrito && (
                <section id="productos" style={{ background: "#f8f9fa", padding: "40px 0" }}>

                    <CatalogoProductos />
                </section>
            )}

            {/*CARRITO*/}
            {mostrarCarrito && (
                <section style={{ background: "#f8f9fa", padding: "40px 0" }}>
                    <ClienteCarrito />
                </section>
            )}

            {/* Footer */}
            <footer className="cliente-footer">©Pedidos Online VS</footer>
        </div>
    );
};

export default ClienteInicio;

