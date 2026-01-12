import React, { useEffect, useState } from "react";
import api from "../../services/api";
import "./Productos.css";

const CatalogoProductos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [categoria, setCategoria] = useState("");
    const [marca, setMarca] = useState("");
    const [orden, setOrden] = useState("");
    const [mensaje, setMensaje] = useState("");

    /* =========================
       AGREGAR AL CARRITO
       ========================= */
    const agregarAlCarrito = (prod) => {
        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

        const precioBase = Number(prod.precio); // siempre el precio original

        const existente = carrito.find(
            (item) => item.producto_id === prod.id
        );

        if (existente) {
            if (existente.cantidad >= prod.stock) {
                alert("No hay más stock disponible para este producto");
                return;
            }
            existente.cantidad += 1;
        } else {
            if (prod.stock <= 0) {
                alert("Producto sin stock");
                return;
            }

            carrito.push({
                producto_id: prod.id,
                nombre: prod.nombre,
                imagen: prod.imagen,
                precio: Number(prod.precio),         // siempre el precio base
                precio_final: prod.precio_final || null,  // guardar precio con descuento si existe
                porcentaje_descuento: prod.porcentaje_descuento,
                cantidad: 1,
            });
        }

        localStorage.setItem("carrito", JSON.stringify(carrito));
        alert("Producto agregado al carrito");
    };



    /* =========================
       OBTENER DATOS
       ========================= */
    const obtenerProductos = async () => {
        try {
            const params = new URLSearchParams();

            if (busqueda) params.append("search", busqueda);
            if (categoria) params.append("categoria", categoria);
            if (marca) params.append("marca", marca);
            if (orden) params.append("ordering", orden);

            const url = params.toString()
                ? `productos/?${params.toString()}`
                : "productos/";

            const response = await api.get(url);
            setProductos(response.data);
            setMensaje("");
        } catch (error) {
            console.error(error);
            setMensaje("No se pudieron cargar los productos.");
        }
    };

    const obtenerCategorias = async () => {
        const res = await api.get("categorias/");
        setCategorias(res.data);
    };

    const obtenerMarcas = async () => {
        const res = await api.get("marcas/");
        setMarcas(res.data);
    };

    useEffect(() => {
        obtenerCategorias();
        obtenerMarcas();
        obtenerProductos();
    }, [busqueda, categoria, marca, orden]);

    /* =========================
       RENDER
       ========================= */
    return (
        <div className="catalogo-layout">
            <aside className="filtros">
                <h3>Filtrar productos</h3>

                <label>Búsqueda</label>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />

                <label>Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="">Todas</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>

                <label>Marca</label>
                <select value={marca} onChange={(e) => setMarca(e.target.value)}>
                    <option value="">Todas</option>
                    {marcas.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.nombre}
                        </option>
                    ))}
                </select>

                <label>Ordenar por</label>
                <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                    <option value="">Por defecto</option>
                    <option value="nombre">Nombre (A-Z)</option>
                    <option value="-precio">Precio (Mayor a menor)</option>
                    <option value="precio">Precio (Menor a mayor)</option>
                </select>
            </aside>

            <main className="grid-productos">
                <h2>Catálogo de Productos</h2>

                {mensaje && <p className="mensaje">{mensaje}</p>}

                <div className="grid-cards">
                    {productos.length > 0 ? (
                        productos.map((prod) => (
                            <div key={prod.id} className="card-producto">
                                <p className="marca">
                                    {prod.marca?.nombre || "Sin marca"}
                                </p>

                                {prod.imagen ? (
                                    <img src={prod.imagen} alt={prod.nombre} />
                                ) : (
                                    <div className="sin-imagen">Sin imagen</div>
                                )}

                                <h4>{prod.nombre}</h4>

                                <p className="categoria">
                                    {prod.categoria?.nombre || "Sin categoría"}
                                </p>

                                {/* ===== PRECIO CON DESCUENTO ===== */}
                                {prod.porcentaje_descuento > 0 ? (
                                    <div className="precio">
                                        <span
                                            style={{
                                                textDecoration: "line-through",
                                                color: "#6b7280",
                                                fontSize: "0.9rem",
                                            }}
                                        >
                                            ${Number(prod.precio).toFixed(2)}
                                        </span>
                                        <br />
                                        <span
                                            style={{
                                                color: "#dc2626",
                                                fontWeight: "bold",
                                                fontSize: "1.2rem",
                                            }}
                                        >
                                            ${Number(prod.precio_final).toFixed(2)}
                                        </span>
                                        <br />
                                        <span
                                            style={{
                                                color: "#16a34a",
                                                fontSize: "0.85rem",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            -{prod.porcentaje_descuento}%
                                        </span>
                                    </div>
                                ) : (
                                    <p className="precio">
                                        ${Number(prod.precio).toFixed(2)}
                                    </p>
                                )}

                                <p className="incluye-iva">No incluye IVA</p>

                                <p className={`stock ${prod.stock === 0 ? "agotado" : ""}`}>
                                    {prod.stock > 0
                                        ? `Stock disponible: ${prod.stock}`
                                        : "Producto agotado"}
                                </p>

                                <button
                                    className="btn-carrito"
                                    onClick={() => agregarAlCarrito(prod)}
                                    disabled={prod.stock === 0}
                                >
                                    {prod.stock === 0 ? "Sin stock" : "Añadir al carrito"}
                                </button>
                            </div>
                        ))
                    ) : (
                        <p>No hay productos disponibles.</p>
                    )}
                </div>
            </main>
        </div>
    );
};

export default CatalogoProductos;
