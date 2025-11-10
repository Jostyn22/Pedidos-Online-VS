import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./AgregarProducto.css";

const AdminEditarProducto = () => {
    const { id } = useParams();
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
            try {
                const resProd = await api.get(`productos/${id}/`);
                const resCat = await api.get("categorias/");
                const resMar = await api.get("marcas/");

                setCategorias(resCat.data);
                setMarcas(resMar.data);

                setFormData({
                    nombre: resProd.data.nombre,
                    descripcion: resProd.data.descripcion || "",
                    precio: resProd.data.precio,
                    stock: resProd.data.stock,
                    categoria_id: resProd.data.categoria?.id || "",
                    marca_id: resProd.data.marca?.id || "",
                    imagen: null,
                });

            } catch (error) {
                console.log("Error al cargar producto:", error);
            }
        };

        cargarDatos();
    }, [id]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFile = (e) => {
        setFormData({ ...formData, imagen: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("nombre", formData.nombre);
        data.append("descripcion", formData.descripcion);
        data.append("precio", formData.precio);
        data.append("stock", formData.stock);
        data.append("categoria_id", formData.categoria_id);
        data.append("marca_id", formData.marca_id);

        if (formData.imagen) {
            data.append("imagen", formData.imagen);
        }

        try {
            await api.put(`productos/${id}/`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            setMensaje("Cambios guardados");
            setTimeout(() => navigate("/admin/inicio", { state: { vista: "productos" } }));
            ;


        } catch (error) {
            console.log("ERROR:", error.response?.data || error);
            setMensaje("No se pudo guardar los cambios");
        }
    };

    return (
        <div className="agregar-contenedor">
            <h2>Editar Producto</h2>
            {mensaje && <p className="mensaje">{mensaje}</p>}

            <form onSubmit={handleSubmit} className="form-producto">

                <input type="text" name="nombre" value={formData.nombre} onChange={handleChange} required />

                <textarea name="descripcion" value={formData.descripcion} onChange={handleChange}></textarea>

                <div className="fila">
                    <input type="number" name="precio" value={formData.precio} onChange={handleChange} required />
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
                </div>

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

                <label>Cambiar imagen (opcional):</label>
                <input type="file" name="imagen" onChange={handleFile} />

                <button type="submit" className="btn-guardar">Guardar Cambios</button>

                <button type="button" className="btn-volver" onClick={() => navigate("/admin/inicio")}>
                    Volver
                </button>

            </form>
        </div>
    );
};

export default AdminEditarProducto;
