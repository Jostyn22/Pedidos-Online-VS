import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./LoginUsuario.css";

const LoginUsuario = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [colorMensaje, setColorMensaje] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // 🧹 Limpia tokens viejos
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        setMensaje("");
        setColorMensaje("");
        setLoading(true);

        try {
            console.log("🟢 Enviando a backend:", { username, password });

            const response = await api.post("/api/usuarios/login/", {
                username,
                password,
            });

            console.log("🔹 Respuesta del servidor:", response.data);

            // ✅ Guardar tokens y datos del usuario
            localStorage.setItem("access", response.data.access);
            localStorage.setItem("refresh", response.data.refresh);
            localStorage.setItem("username", response.data.username);
            localStorage.setItem("rol", response.data.rol);

            // 🟩 Mensaje verde de éxito
            setMensaje(`Bienvenid@, ${response.data.username}`);
            setColorMensaje("#16a34a");

            // 🔁 Redirigir según el rol
            setTimeout(() => {
                setLoading(false);
                if (response.data.rol === "CLIENTE") {
                    navigate("/cliente/inicio");
                } else if (response.data.rol === "ADMIN") {
                    navigate("/admin/inicio");
                } else if (response.data.rol === "VENDEDOR") {
                    navigate("/vendedor/inicio");
                } else {
                    navigate("/dashboard");
                }
            }, 1500);
        } catch (error) {
            console.error("❌ Error en login:", error);
            setMensaje("El usuario o la contraseña está incorrecto.");
            setColorMensaje("#dc2626");
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 className="titulo">Plataforma de Pedidos Online VS</h1>

                <div className="formulario">
                    <h2>Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <button type="submit" disabled={loading}>
                            {loading ? <span className="spinner"></span> : "Ingresar"}
                        </button>
                    </form>

                    {mensaje && (
                        <p className="mensaje" style={{ color: colorMensaje }}>
                            {mensaje}
                        </p>
                    )}

                    <p className="texto-login">
                        ¿No tienes una cuenta?{" "}
                        <span className="link" onClick={() => navigate("/registro")}>
                            Regístrate aquí
                        </span>
                    </p>

                    <p className="footer-text">
                        © {new Date().getFullYear()} Pedidos Online VS
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginUsuario;
