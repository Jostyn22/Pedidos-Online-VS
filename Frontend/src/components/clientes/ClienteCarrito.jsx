import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./ClienteCarrito.css";

const ClienteCarrito = () => {
    const [carrito, setCarrito] = useState([]);

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("carrito")) || [];
        setCarrito(data);
    }, []);

    const actualizarCantidad = (id, nuevaCantidad) => {
        const actualizado = carrito.map(item =>
            item.producto_id === id ? { ...item, cantidad: nuevaCantidad } : item
        );
        setCarrito(actualizado);
        localStorage.setItem("carrito", JSON.stringify(actualizado));
    };

    const eliminarProducto = (id) => {
        const actualizado = carrito.filter(item => item.producto_id !== id);
        setCarrito(actualizado);
        localStorage.setItem("carrito", JSON.stringify(actualizado));
    };

    const calcularTotal = () => {
        return carrito.reduce((total, item) => total + item.precio * item.cantidad, 0).toFixed(2);
    };

    const confirmarCompra = async () => {
        if (carrito.length === 0) return alert("Tu carrito está vacío.");
        try {
            await api.post("pedidos/crear/", { carrito });
            localStorage.removeItem("carrito");
            setCarrito([]);
        } catch (error) {
            alert("Ocurrió un problema al generar el pedido");
        }
    };

    return (
        <>
            <div className="carrito-hero">
                <h1><span>MI</span> CARRITO</h1>
            </div>

            <div className="carrito-page">
                <div className="carrito-left">
                    {carrito.length === 0 ? (
                        <p>Tu carrito está vacío.</p>
                    ) : (
                        <table className="carrito-table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>PRODUCTO</th>
                                    <th>PRECIO</th>
                                    <th>CANTIDAD</th>
                                    <th>SUBTOTAL</th>
                                </tr>
                            </thead>

                            <tbody>
                                {carrito.map((item) => (
                                    <tr key={item.producto_id}>
                                        <td>
                                            <button className="remove-btn" onClick={() => eliminarProducto(item.producto_id)}>×</button>
                                        </td>
                                        <td className="producto-info">
                                            <img src={item.imagen} alt={item.nombre} />
                                            <span>{item.nombre}</span>
                                        </td>
                                        <td>${item.precio.toFixed(2)}</td>
                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={e => actualizarCantidad(item.producto_id, Number(e.target.value))}
                                            />
                                        </td>
                                        <td>${(item.precio * item.cantidad).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="carrito-right">
                    <h3>TOTAL DEL CARRITO</h3>

                    <div className="resumen-row">
                        <span>Subtotal:</span>
                        <span>${calcularTotal()}</span>
                    </div>

                    <div className="resumen-row envio">
                        <span>Envío</span>
                        <label><input type="radio" defaultChecked /> Recogida en el local</label>
                    </div>

                    <div className="resumen-row total">
                        <span>Total:</span>
                        <span>${calcularTotal()}</span>
                    </div>

                    <button className="btn-comprar" onClick={confirmarCompra}>
                        FINALIZAR COMPRA
                    </button>
                </div>
            </div>
        </>
    );
};

export default ClienteCarrito;
