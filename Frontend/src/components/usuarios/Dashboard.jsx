import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./Dashboard.css";

const Dashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("access");
        if (!token) {
            navigate("/");
            return;
        }

        const fetchUsuario = async () => {
            try {
                const response = await api.get("usuarios/actual/");
                setUsuario(response.data);
            } catch (error) {
                console.error("Error al cargar usuario:", error);
                localStorage.clear();
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchUsuario();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/");
    };

    if (loading) return <p className="dashboard-loading">Cargando información...</p>;
    if (!usuario)
        return (
            <p className="dashboard-error">
                No se encontró la información del usuario.
            </p>
        );

    const rolConfig = {
        CLIENTE: {
            color: "#1e3a8a",
            titulo: "Módulo Cliente",
            desc: "Aquí podrás ver tus pedidos, pagos y envíos.",
        },
        VENDEDOR: {
            color: "#059669",
            titulo: "Módulo Vendedor",
            desc: "Gestiona tus productos y revisa órdenes de clientes.",
        },
        ADMIN: {
            color: "#b45309",
            titulo: "Módulo Administrador",
            desc: "Administra usuarios, pedidos y configuraciones.",
        },
    };

    const rolActual = rolConfig[usuario.rol] || rolConfig.CLIENTE;

    return (
        <div className="dashboard-container">
            {/* Navbar superior */}
            <nav className="navbar fixed-navbar">
                <div className="navbar-left">
                    <h2 className="navbar-logo">Pedidos Online</h2>
                </div>
                <div className="navbar-right">
                    <span className="navbar-user">
                        Bienvenido, <strong>{usuario.username}</strong>
                    </span>
                    <button className="navbar-logout" onClick={handleLogout}>
                        Cerrar sesión
                    </button>
                </div>
            </nav>

            {/* Contenido principal */}
            <main className="dashboard-content">
                <div className="dashboard-card">
                    <h2 className="bienvenida">
                        👋 Hola, <strong>{usuario.username}</strong>
                    </h2>

                    <p className="info">
                        <strong>Rol:</strong> {usuario.rol}
                    </p>
                    <p className="info">
                        <strong>Email:</strong> {usuario.email}
                    </p>

                    <hr />

                    <div
                        className="rol-section"
                        style={{ borderLeft: `4px solid ${rolActual.color}` }}
                    >
                        <h3 style={{ color: rolActual.color }}>{rolActual.titulo}</h3>
                        <p>{rolActual.desc}</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer-dashboard">
                © {new Date().getFullYear()} Sistema de Pedidos Online — Desarrollado
                por Jostyn Torres
            </footer>
        </div>
    );
};

export default Dashboard;
