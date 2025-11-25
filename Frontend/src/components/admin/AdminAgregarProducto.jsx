import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AgregarProducto.css";

const AdminAgregarProducto = () => {
    const navigate = useNavigate();

    const [categorias, setCategorias] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [mensaje, setMensaje] = useState("");

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio_costo: "",
        porcentaje_ganancia: "",
        stock: "",
        categoria_id: "",
        marca_id: "",
        imagen: null,
    });

    const [showCat, setShowCat] = useState(false);
    const [showMarca, setShowMarca] = useState(false);
    const [nuevaCat, setNuevaCat] = useState("");
    const [nuevaMarca, setNuevaMarca] = useState("");

    // Cargar categorías y marcas
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const resCat = await api.get("categorias/");
                const resMar = await api.get("marcas/");
                setCategorias(resCat.data);
                setMarcas(resMar.data);
            } catch (error) {
                console.error("Error al cargar categorías o marcas:", error);
            }
        };
        cargarDatos();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFile = (e) => {
        setFormData({ ...formData, imagen: e.target.files[0] });
    };

    // Agregar nueva categoría
    const agregarCategoria = async () => {
        if (!nuevaCat.trim()) return;
        await api.post("categorias/", { nombre: nuevaCat });
        const resCat = await api.get("categorias/");
        setCategorias(resCat.data);
        setNuevaCat("");
        setShowCat(false);
    };

    // Agregar nueva marca
    const agregarMarca = async () => {
        if (!nuevaMarca.trim()) return;
        await api.post("marcas/", { nombre: nuevaMarca });
        const resMar = await api.get("marcas/");
        setMarcas(resMar.data);
        setNuevaMarca("");
        setShowMarca(false);
    };

    // Calcular precio de venta en tiempo real
    const precioVenta =
        (parseFloat(formData.precio_costo) || 0) *
        (1 + (parseFloat(formData.porcentaje_ganancia) || 0) / 100);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();

        // Convertir a números válidos antes de enviar
        const payload = {
            ...formData,
            precio_costo: parseFloat(formData.precio_costo || 0),
            porcentaje_ganancia: parseFloat(formData.porcentaje_ganancia || 0),
            stock: parseInt(formData.stock || 0),
        };

        Object.entries(payload).forEach(([key, value]) => data.append(key, value));

        try {
            await api.post("productos/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMensaje("✅ Producto añadido con éxito");
            setFormData({
                nombre: "",
                descripcion: "",
                precio_costo: "",
                porcentaje_ganancia: "",
                stock: "",
                categoria_id: "",
                marca_id: "",
                imagen: null,
            });
            setTimeout(() => navigate(-1), 1200);
        } catch (error) {
            console.error(error.response?.data || error);
            setMensaje("❌ Error al agregar producto");
        }
    };

    return (
        <div className="agregar-contenedor">
            <h2>Agregar Producto</h2>
            {mensaje && <p className={`mensaje ${mensaje.includes("✅") ? "success" : "error"}`}>{mensaje}</p>}

            <form onSubmit={handleSubmit} className="form-producto">

                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="descripcion"
                    placeholder="Descripción"
                    value={formData.descripcion}
                    onChange={handleChange}
                ></textarea>

                <div className="fila">
                    <input
                        type="number"
                        name="precio_costo"
                        placeholder="Precio de costo"
                        value={formData.precio_costo}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                    />
                    <input
                        type="number"
                        name="porcentaje_ganancia"
                        placeholder="Porcentaje de ganancia"
                        value={formData.porcentaje_ganancia}
                        onChange={handleChange}
                        required
                        min="0"
                        step="0.01"
                    />
                    <input
                        type="number"
                        name="stock"
                        placeholder="Stock"
                        value={formData.stock}
                        onChange={handleChange}
                        required
                        min="0"
                    />
                </div>

                <p className="precio-venta">Precio de venta: ${precioVenta.toFixed(2)}</p>

                <div className="fila">
                    <div className="grupo-select">
                        <select
                            name="categoria_id"
                            value={formData.categoria_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Categoría --</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                        </select>
                        <button type="button" className="btn-mini" onClick={() => setShowCat(true)}>+</button>
                    </div>

                    <div className="grupo-select">
                        <select
                            name="marca_id"
                            value={formData.marca_id}
                            onChange={handleChange}
                            required
                        >
                            <option value="">-- Marca --</option>
                            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                        <button type="button" className="btn-mini" onClick={() => setShowMarca(true)}>+</button>
                    </div>
                </div>

                {showCat && (
                    <div className="nuevo-dato">
                        <input
                            type="text"
                            placeholder="Nueva categoría"
                            value={nuevaCat}
                            onChange={(e) => setNuevaCat(e.target.value)}
                        />
                        <button type="button" onClick={agregarCategoria}>Guardar</button>
                        <button type="button" onClick={() => setShowCat(false)}>✖</button>
                    </div>
                )}

                {showMarca && (
                    <div className="nuevo-dato">
                        <input
                            type="text"
                            placeholder="Nueva marca"
                            value={nuevaMarca}
                            onChange={(e) => setNuevaMarca(e.target.value)}
                        />
                        <button type="button" onClick={agregarMarca}>Guardar</button>
                        <button type="button" onClick={() => setShowMarca(false)}>✖</button>
                    </div>
                )}

                <input type="file" name="imagen" onChange={handleFile} />

                <button type="submit" className="btn-guardar">Guardar</button>
                <button type="button" className="btn-volver" onClick={() => navigate("/admin/productos")}>Volver</button>
            </form>
        </div>
    );
};

export default AdminAgregarProducto;
