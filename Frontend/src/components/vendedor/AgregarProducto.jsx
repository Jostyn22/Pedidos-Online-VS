import { useState, useEffect } from "react";
import api from "../../services/api";
import "./AgregarProducto.css";
import { useNavigate } from "react-router-dom";

const AgregarProducto = () => {
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

    const precioCostoNum = parseFloat(formData.precio_costo) || 0;
    const porcentajeGananciaNum = parseFloat(formData.porcentaje_ganancia) || 0;
    const precioVenta = precioCostoNum * (1 + porcentajeGananciaNum / 100);
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        const payload = {
            ...formData,
            precio_costo: (precioCostoNum).toFixed(2),
            porcentaje_ganancia: (porcentajeGananciaNum).toFixed(2),
            stock: parseInt(formData.stock || 0),
        };

        Object.entries(payload).forEach(([key, value]) => {
            data.append(key, value);
        });

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
            setTimeout(() => navigate(-1), 600);
        } catch (error) {
            console.error(error.response?.data || error);
            setMensaje("❌ Error al agregar producto");
        }
    };

    return (
        <div className="agregar-contenedor">
            <h2>Agregar nuevo producto</h2>
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
                </div>

                <p className="precio-venta">Precio de venta calculado: ${precioVenta.toFixed(2)}</p>

                <input
                    type="number"
                    name="stock"
                    placeholder="Stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                />

                <div className="fila">
                    <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                        <option value="">-- Seleccionar categoría --</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                        ))}
                    </select>

                    <select name="marca_id" value={formData.marca_id} onChange={handleChange} required>
                        <option value="">-- Seleccionar marca --</option>
                        {marcas.map(m => (
                            <option key={m.id} value={m.id}>{m.nombre}</option>
                        ))}
                    </select>
                </div>

                <input type="file" name="imagen" onChange={handleFile} />

                <button type="submit" className="btn-guardar">Guardar Producto</button>
            </form>
        </div>
    );
};

export default AgregarProducto;
