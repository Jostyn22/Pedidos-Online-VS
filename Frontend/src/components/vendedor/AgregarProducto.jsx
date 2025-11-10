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
        precio: "",
        stock: "",
        categoria_id: "",
        marca_id: "",
        imagen: null,
    });

    useEffect(() => {
        const cargarDatos = async () => {
            const resCat = await api.get("categorias/");
            const resMar = await api.get("marcas/");
            setCategorias(resCat.data);
            setMarcas(resMar.data);
        };
        cargarDatos();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFile = (e) => {
        setFormData({ ...formData, imagen: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => data.append(key, value));

        try {
            await api.post("productos/", data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            setMensaje("Producto añadido con éxito");
            setFormData({
                nombre: "",
                descripcion: "",
                precio: "",
                stock: "",
                categoria_id: "",
                marca_id: "",
                imagen: null,
            });
            setTimeout(() => {
                navigate(-1);
            }, 600);
        } catch (error) {
            setMensaje("Error al agregar producto");
        }
    };

    return (
        <div className="agregar-contenedor">
            <h2>Agregar nuevo producto</h2>
            {mensaje && <p className="mensaje">{mensaje}</p>}

            <form onSubmit={handleSubmit} className="form-producto">

                <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />

                <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange}></textarea>

                <div className="fila">
                    <input type="number" name="precio" placeholder="Precio" value={formData.precio} onChange={handleChange} required />
                    <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} required />
                </div>

                <div className="fila">
                    <select name="categoria_id" value={formData.categoria_id} onChange={handleChange}>
                        <option value="">-- Seleccionar categoría --</option>
                        {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                    </select>

                    <select name="marca_id" value={formData.marca_id} onChange={handleChange}>
                        <option value="">-- Seleccionar marca --</option>
                        {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                    </select>
                </div>

                <input type="file" name="imagen" onChange={handleFile} />

                <button type="submit" className="btn-guardar">Guardar Producto</button>

            </form>
        </div>
    );
};

export default AgregarProducto;
