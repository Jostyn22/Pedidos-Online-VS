import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./ClientePedidos.css";

const ClientePedidos = () => {
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        obtenerPedidos();
    }, []);

    const obtenerPedidos = async () => {
        try {
            const response = await api.get("pedidos/mis-pedidos/");
            setPedidos(response.data);
        } catch (error) {
            console.error("Error al cargar pedidos:", error);
        }
    };

    return (
        <div className="pedidos-hero">
            <h1><span>MIS</span> PEDIDOS</h1>

            <div className="pedidos-container">
                {pedidos.length === 0 ? (
                    <p className="sin-pedidos">Todavía no has realizado pedidos.</p>
                ) : (
                    <table className="pedidos-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Fecha</th>
                                <th>Total</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pedidos.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.id}</td>
                                    <td>{new Date(p.fecha_pedido).toLocaleDateString()}</td>
                                    <td>${p.total}</td>
                                    <td>{p.estado}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default ClientePedidos;
