import React, { useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import "./RecuperarContraseña.css";

const RecuperarContraseña = () => {
    const [email, setEmail] = useState("");
    const [password1, setPassword1] = useState("");
    const [password2, setPassword2] = useState("");
    const [verificado, setVerificado] = useState(false);
    const [mensaje, setMensaje] = useState("");
    const [colorMensaje, setColorMensaje] = useState("");
    const navigate = useNavigate();

    const verificarCorreo = async () => {
        try {
            const response = await api.post("usuarios/recuperar/verificar/", { email });
            if (response.data.exists) {
                setVerificado(true);
                setMensaje("Correo verificado, puedes cambiar tu contraseña.");
                setColorMensaje("#15803d");
            }
        } catch (error) {
            setMensaje("El correo no está registrado.");
            setColorMensaje("#b91c1c");
        }
    };

    const cambiarContrasena = async (e) => {
        e.preventDefault();

        if (password1 !== password2) {
            setMensaje("Las contraseñas no coinciden.");
            setColorMensaje("#b91c1c");
            return;
        }

        try {
            await api.post("usuarios/recuperar/cambiar/", {
                email,
                password: password1,
            });
            setMensaje("Contraseña actualizada correctamente.");
            setColorMensaje("#15803d");
            setTimeout(() => navigate("/"), 3000);
        } catch (error) {
            setMensaje("Error al cambiar la contraseña.");
            setColorMensaje("#b91c1c");
        }
    };

    return (
        <div className="recuperar-container">
            <div className="recuperar-box">
                {/* 🔹 Título principal*/}
                <h1 className="titulo">PLATAFORMA DE PEDIDOS ONLINE VS</h1>
                <h2 className="subtitulo">Recuperar Contraseña</h2>
                {/* 🔹 Campo de correo y botón Verificar */}
                <div className="correo-verificar">
                    <input
                        type="email"
                        placeholder="Ingresa tu correo registrado"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={verificado}
                    />
                    <button
                        type="button"
                        className="btn-verificar"
                        onClick={verificarCorreo}
                        disabled={!email || verificado}
                    >
                        Verificar
                    </button>
                </div>

                {/* 🔹 Campos de contraseña */}
                <form onSubmit={cambiarContrasena}>
                    <input
                        type="password"
                        placeholder="Nueva contraseña"
                        value={password1}
                        onChange={(e) => setPassword1(e.target.value)}
                        disabled={!verificado}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Repetir nueva contraseña"
                        value={password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        disabled={!verificado}
                        required
                    />

                    <button type="submit" disabled={!verificado}>
                        Cambiar contraseña
                    </button>
                </form>

                {mensaje && (
                    <p className="mensaje" style={{ color: colorMensaje }}>
                        {mensaje}
                    </p>
                )}

                {/* 🔹 Enlace para volver al login */}
                <p className="volver" onClick={() => navigate("/")}>
                    Volver al inicio de sesión
                </p>

                {/* 🔹 Pie de página igual al login */}
                <p className="footer-text">
                    © {new Date().getFullYear()} Pedidos Online VS
                </p>
            </div>
        </div>
    );
};

export default RecuperarContraseña;
