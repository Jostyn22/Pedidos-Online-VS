import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const AdminProductos = () => {
    const [productos, setProductos] = useState([]);
    const [mensaje, setMensaje] = useState("");
    const [colorMensaje, setColorMensaje] = useState("");
    const navigate = useNavigate();

    const obtenerProductos = async () => {
        try {
            const response = await api.get("productos/");
            setProductos(response.data);
        } catch (error) {
            console.error("Error al obtener productos:", error);
            setMensaje("Error al cargar productos.");
            setColorMensaje("#dc2626");
            setTimeout(() => setMensaje(""), 4000);
        }
    };

    useEffect(() => {
        obtenerProductos();
    }, []);

    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este producto?")) return;

        try {
            await api.delete(`productos/${id}/`);
            setMensaje("Producto eliminado correctamente.");
            setColorMensaje("#16a34a");
            obtenerProductos();
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error al eliminar producto:", error);

            let msg = "No se pudo eliminar el producto.";
            if (error.response?.data?.detail) {
                msg = error.response.data.detail;
            }

            setMensaje(msg);
            setColorMensaje("#dc2626");
            setTimeout(() => setMensaje(""), 4000);
        }
    };

    return (
        <div style={{ padding: "30px", minHeight: "100vh" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Gestión de Productos</h2>

            {/* Botón agregar */}
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
                <button
                    onClick={() => navigate("/admin/productos/agregar")}
                    style={{
                        padding: "10px 18px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "16px",
                    }}
                >
                    Agregar Producto
                </button>
            </div>

            {/* Tabla de productos */}
            <div
                style={{
                    maxHeight: "75vh",
                    overflowY: "auto",
                    borderRadius: "10px",
                    border: "1px solid #cce3cc",
                }}
            >
                <table cellPadding="6" cellSpacing="0" style={{ width: "100%", background: "#fff" }}>
                    <thead style={{ position: "sticky", top: 0, background: "#dfffdf", zIndex: 10 }}>
                        <tr style={{ fontWeight: "bold" }}>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Marca</th>
                            <th>Categoría</th>
                            <th>Precio</th>
                            <th>Ver</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>

                    <tbody>
                        {mensaje && (
                            <tr>
                                <td colSpan="7" style={{ backgroundColor: colorMensaje, color: "white", textAlign: "center", fontWeight: "bold", padding: "10px" }}>
                                    {mensaje}
                                </td>
                            </tr>
                        )}

                        {productos.map((prod) => (
                            <tr key={prod.id} style={{ height: "52px", textAlign: "center" }}>
                                <td>{prod.id}</td>
                                <td>{prod.nombre}</td>
                                <td>{prod.marca?.nombre || "Sin marca"}</td>
                                <td>{prod.categoria?.nombre || "Sin categoría"}</td>
                                <td>${Number(prod.precio).toFixed(2)}</td>
                                <td>
                                    {prod.imagen ? (
                                        <button
                                            onClick={() => window.open(prod.imagen, "_blank")}
                                            style={{
                                                background: "#17a2b8",
                                                color: "white",
                                                border: "none",
                                                padding: "5px 8px",
                                                borderRadius: "6px",
                                                cursor: "pointer",
                                                fontSize: "0.85rem",
                                            }}
                                        >
                                            👁 Ver
                                        </button>
                                    ) : "—"}
                                </td>
                                <td>
                                    <button
                                        onClick={() => navigate(`/admin/productos/editar/${prod.id}`)}
                                        style={{
                                            background: "#007bff",
                                            color: "white",
                                            border: "none",
                                            padding: "5px 8px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            marginRight: "6px",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        ✏️ Editar
                                    </button>

                                    <button
                                        onClick={() => eliminarProducto(prod.id)}
                                        style={{
                                            background: "#dc3545",
                                            color: "white",
                                            border: "none",
                                            padding: "5px 8px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                        }}
                                    >
                                        🗑 Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductos;
