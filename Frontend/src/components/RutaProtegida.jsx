import React from "react";
import { Navigate } from "react-router-dom";

const RutaProtegida = ({ children, rolPermitido }) => {
    const token = localStorage.getItem("access");
    const rol = localStorage.getItem("rol");
    if (!token) {
        return <Navigate to="/" replace />;
    }
    if (rolPermitido && rol !== rolPermitido) {
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};

export default RutaProtegida;
