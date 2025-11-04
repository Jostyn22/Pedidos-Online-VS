import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroUsuario.css";

const RegistroUsuario = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        password2: "",
        rol: "CLIENTE",
        telefono: "",
        direccion: "",
    });

    const [mensaje, setMensaje] = useState("");
    const [exito, setExito] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.password2) {
            setExito(false);
            setMensaje("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/usuarios/registrar/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setExito(true);
                setMensaje("Usuario registrado exitosamente");
                setTimeout(() => navigate("/"), 2000);
            } else {
                setExito(false);
                setMensaje("Error: " + (data.password || data.detail || "Verifica los datos"));
            }
        } catch (error) {
            setExito(false);
            setMensaje("Error de conexión con el servidor");
        }
    };

    return (
        <div className="registro-container">
            <div className="registro-box">
                <h1 className="titulo">PLATAFORMA DE PEDIDOS ONLINE VS</h1>
                <h2 className="subtitulo">Crear cuenta</h2>

                <form onSubmit={handleSubmit} className="registro-form">
                    <input
                        type="text"
                        name="username"
                        placeholder="Nombre de usuario"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Correo electrónico"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="password"
                        name="password2"
                        placeholder="Confirmar contraseña"
                        value={formData.password2}
                        onChange={handleChange}
                        required
                    />
                    <input
                        type="text"
                        name="telefono"
                        placeholder="Teléfono"
                        value={formData.telefono}
                        onChange={handleChange}
                    />
                    <input
                        type="text"
                        name="direccion"
                        placeholder="Dirección"
                        value={formData.direccion}
                        onChange={handleChange}
                    />

                    <button type="submit" className="btn-registrar">
                        Registrarse
                    </button>
                </form>

                {mensaje && (
                    <p className={`mensaje ${exito ? "exito" : "error"}`}>{mensaje}</p>
                )}

                <p className="texto-login">
                    ¿Ya tienes una cuenta?{" "}
                    <span className="link" onClick={() => navigate("/")}>
                        Inicia sesión aquí
                    </span>
                </p>

                <p className="footer-text">
                    © {new Date().getFullYear()} Pedidos Online VS
                </p>
            </div>
        </div>
    );
};

export default RegistroUsuario;
