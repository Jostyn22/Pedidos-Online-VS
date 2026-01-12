import React, { useState, useEffect } from "react";
import api from "../../services/api";
import "./ClienteCarrito.css";

const IVA_PORCENTAJE = 0.15;

const ClienteCarrito = () => {
    const [carrito, setCarrito] = useState([]);
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");

    useEffect(() => {
        const data = JSON.parse(localStorage.getItem("carrito")) || [];
        setCarrito(data);
    }, []);

    const actualizarCantidad = (id, nuevaCantidad) => {
        if (nuevaCantidad < 1) return;

        const actualizado = carrito.map(item =>
            item.producto_id === id
                ? { ...item, cantidad: nuevaCantidad }
                : item
        );

        setCarrito(actualizado);
        localStorage.setItem("carrito", JSON.stringify(actualizado));
    };

    const eliminarProducto = (id) => {
        const actualizado = carrito.filter(item => item.producto_id !== id);
        setCarrito(actualizado);
        localStorage.setItem("carrito", JSON.stringify(actualizado));
    };

    /* =============================
         CÁLCULOS
    ============================== */

    // SUBTOTAL SIN DESCUENTOS (precio base)
    const calcularSubtotalBruto = () => {
        return carrito.reduce(
            (total, item) => total + item.precio * item.cantidad,
            0
        );
    };

    // DESCUENTO TOTAL (lo que se resta al subtotal)
    const calcularDescuento = () => {
        return carrito.reduce((total, item) => {
            if (
                item.precio_final != null &&
                item.precio_final < item.precio
            ) {
                return total + (item.precio - item.precio_final) * item.cantidad;
            }
            return total;
        }, 0);
    };

    // IVA sobre subtotal menos descuento
    const calcularIVA = () => {
        return (calcularSubtotalBruto() - calcularDescuento()) * IVA_PORCENTAJE;
    };

    // TOTAL FINAL
    // TOTAL FINAL redondeado a 2 decimales
    const calcularTotal = () => {
        const subtotal = calcularSubtotalBruto();
        const descuento = calcularDescuento();
        const iva = (subtotal - descuento) * IVA_PORCENTAJE;

        return Math.round((subtotal - descuento + iva) * 100) / 100;
    };



    /* =============================
         CONFIRMAR COMPRA
    ============================== */
    const confirmarCompra = async () => {
        if (carrito.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        try {
            // Enviar carrito al backend con precio_final si existe
            const pedidoRes = await api.post("pedidos/crear/", {
                carrito: carrito.map(item => ({
                    producto_id: item.producto_id,
                    cantidad: item.cantidad,
                    precio_final: item.precio_final != null ? Number(item.precio_final) : Number(item.precio),
                }))
            });

            const pedidoId = pedidoRes.data.pedido_id;
            const totalBackend = Number(pedidoRes.data.total); // Total exacto calculado por el backend

            // Registrar pago usando el total exacto del backend
            await api.post("pagos/registrar/", {
                pedido: pedidoId,
                metodo: metodoPago,
                monto: totalBackend,
                estado_pago: "PAGADO",
            });

            alert("Compra realizada correctamente.");
            localStorage.removeItem("carrito");
            setCarrito([]);

        } catch (error) {
            console.error(error.response?.data || error);
            alert(
                "Error al procesar la compra: " +
                (error.response?.data?.mensaje ||
                    error.response?.data?.non_field_errors?.[0] ||
                    "Error desconocido")
            );
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
                                {carrito.map(item => (
                                    <tr key={item.producto_id}>
                                        <td>
                                            <button
                                                className="remove-btn"
                                                onClick={() => eliminarProducto(item.producto_id)}
                                            >
                                                ×
                                            </button>
                                        </td>

                                        <td className="producto-info">
                                            <img src={item.imagen} alt={item.nombre} />
                                            <span>{item.nombre}</span>
                                        </td>

                                        {/* PRECIO BASE + PRECIO CON DESCUENTO (solo visual) */}
                                        <td>
                                            {item.precio_final != null && item.precio_final < item.precio ? (
                                                <>
                                                    <span style={{ textDecoration: "line-through", color: "#999" }}>
                                                        ${item.precio.toFixed(2)}
                                                    </span>
                                                    <br />
                                                    <span style={{ color: "#e63946", fontWeight: "bold" }}>
                                                        ${Number(item.precio_final).toFixed(2)}
                                                    </span>
                                                </>
                                            ) : (
                                                `$${item.precio.toFixed(2)}`
                                            )}
                                        </td>

                                        <td>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.cantidad}
                                                onChange={e =>
                                                    actualizarCantidad(
                                                        item.producto_id,
                                                        Number(e.target.value)
                                                    )
                                                }
                                            />
                                        </td>

                                        {/* SUBTOTAL SIEMPRE SIN DESCUENTO */}
                                        <td>
                                            ${(item.precio * item.cantidad).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="carrito-right">
                    <h3>RESUMEN DE COMPRA</h3>

                    <div className="resumen-row">
                        <span>Subtotal:</span>
                        <span>${calcularSubtotalBruto().toFixed(2)}</span>
                    </div>

                    {/* Descuento siempre visible */}
                    <div className="resumen-row descuento">
                        <span>Descuento:</span>
                        <span>- ${calcularDescuento().toFixed(2)}</span>
                    </div>

                    <div className="resumen-row">
                        <span>IVA (15%):</span>
                        <span>${calcularIVA().toFixed(2)}</span>
                    </div>

                    <div className="resumen-row total">
                        <span>Total:</span>
                        <span>${calcularTotal().toFixed(2)}</span>
                    </div>

                    <div className="resumen-row pago">
                        <span>Método de pago:</span>
                        <select
                            value={metodoPago}
                            onChange={e => setMetodoPago(e.target.value)}
                        >
                            <option value="EFECTIVO">Efectivo</option>
                            <option value="TARJETA">Tarjeta</option>
                            <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
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
