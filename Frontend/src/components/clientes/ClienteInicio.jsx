import React from "react";
import { Link } from "react-router-dom";
import "./ClienteInicio.css";
import fondoVivirSano from "../../assets/vivir_sano.jpg";

const ClienteInicio = () => {
    return (
        <div
            className="cliente-hero"
            style={{
                backgroundImage: `url(${fondoVivirSano})`,
            }}
        >
            {/* 🔹 Barra superior (dentro del fondo) */}
            <nav className="navbar-cliente">
                <div className="navbar-logo">
                    PedidosOnline<span>VS</span>
                </div>

                <ul className="navbar-links">
                    <li><Link to="/cliente/inicio">Inicio</Link></li>
                    <li><Link to="#productos">Productos</Link></li>
                    <li><Link to="#pedidos">Pedidos</Link></li>
                    <li><Link to="/cliente/mi-cuenta">Cuenta</Link></li>
                </ul>

                <div className="navbar-right">
                    {/* 🔍 Buscador */}
                    <div className="navbar-search">
                        <input type="text" placeholder="Buscar..." />
                        <span className="icon-search">🔍</span>
                    </div>

                    {/* 🛒 Carrito */}
                    <span className="icon-cart">🛒</span>
                </div>
            </nav>

            {/* 🔹 Capa azul con desenfoque */}
            <div className="cliente-overlay"></div>

            {/* 🔹 Contenido principal */}
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

            {/* 🔹 Pie de página */}
            <footer className="cliente-footer">
                ©Pedidos Online VS
            </footer>
        </div>
    );
};

export default ClienteInicio;
