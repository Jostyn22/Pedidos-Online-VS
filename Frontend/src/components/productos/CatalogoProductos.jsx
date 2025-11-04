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
    //Obtener productos
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
            console.error("Error al obtener productos:", error);
            setMensaje("No se pudieron cargar los productos.");
        }
    };

    //Obtener categorías
    const obtenerCategorias = async () => {
        try {
            const response = await api.get("categorias/");
            setCategorias(response.data);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
        }
    };

    //Obtener marcas
    const obtenerMarcas = async () => {
        try {
            const response = await api.get("marcas/");
            setMarcas(response.data);
        } catch (error) {
            console.error("Error al obtener marcas:", error);
        }
    };

    //Efecto al cargar
    useEffect(() => {
        obtenerCategorias();
        obtenerMarcas();
        obtenerProductos();
    }, [busqueda, categoria, marca, orden]);

    return (
        <div className="catalogo-layout">
            {/* 🔹 Panel de filtros */}
            <aside className="filtros">
                <h3>Filtrar productos</h3>

                {/*Búsqueda */}
                <label>Búsqueda</label>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                />

                {/*Categoría */}
                <label>Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                    <option value="">Todas</option>
                    {categorias.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nombre}
                        </option>
                    ))}
                </select>

                {/*Marca */}
                <label>Marca</label>
                <select value={marca} onChange={(e) => setMarca(e.target.value)}>
                    <option value="">Todas</option>
                    {marcas.map((m) => (
                        <option key={m.id} value={m.id}>
                            {m.nombre}
                        </option>
                    ))}
                </select>

                {/*Orden */}
                <label>Ordenar por</label>
                <select value={orden} onChange={(e) => setOrden(e.target.value)}>
                    <option value="">Por defecto</option>
                    <option value="nombre">Nombre (A-Z)</option>
                    <option value="-precio">Precio (Mayor a menor)</option>
                    <option value="precio">Precio (Menor a mayor)</option>
                </select>
            </aside>

            {/* Catálogo de productos */}
            <main className="grid-productos">
                <h2>Catálogo de Productos</h2>

                {mensaje && <p className="mensaje">{mensaje}</p>}

                <div className="grid-cards">
                    {productos.length > 0 ? (
                        productos.map((prod) => (
                            <div key={prod.id} className="card-producto">
                                <p className="marca">
                                    {prod.marca ? prod.marca.nombre : "Sin marca"}
                                </p>

                                {prod.imagen ? (
                                    <img src={prod.imagen} alt={prod.nombre} />
                                ) : (
                                    <div className="sin-imagen">Sin imagen</div>
                                )}

                                <h4>{prod.nombre}</h4>

                                <p className="categoria">
                                    {prod.categoria ? prod.categoria.nombre : "Sin categoría"}
                                </p>

                                <p className="precio">${prod.precio}</p>
                                <p className="incluye-iva">Incluye IVA</p>

                                <button className="btn-carrito">Añadir al carrito</button>
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
