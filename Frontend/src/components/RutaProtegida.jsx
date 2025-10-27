import React from "react";
import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children, rolPermitido }) => {
    // Obtener token y rol desde localStorage
    const token = localStorage.getItem("access");
    const rol = localStorage.getItem("rol");

    // Si no hay token → redirigir al login
    if (!token) {
        return <Navigate to="/" replace />;
    }

    // Si tiene token pero el rol no coincide → redirigir al dashboard
    if (rolPermitido && rol !== rolPermitido) {
        return <Navigate to="/dashboard" replace />;
    }

    // Si todo está bien → mostrar el componente hijo
    return children;
};

export default RutaProtegida;
