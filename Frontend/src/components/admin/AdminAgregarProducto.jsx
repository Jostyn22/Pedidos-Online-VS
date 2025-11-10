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
        precio: "",
        stock: "",
        categoria_id: "",
        marca_id: "",
        imagen: null,
    });

    const [showCat, setShowCat] = useState(false);
    const [showMarca, setShowMarca] = useState(false);
    const [nuevaCat, setNuevaCat] = useState("");
    const [nuevaMarca, setNuevaMarca] = useState("");

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

    const agregarCategoria = async () => {
        if (!nuevaCat.trim()) return;
        await api.post("categorias/", { nombre: nuevaCat });
        const resCat = await api.get("categorias/");
        setCategorias(resCat.data);
        setNuevaCat("");
        setShowCat(false);
    };

    const agregarMarca = async () => {
        if (!nuevaMarca.trim()) return;
        await api.post("marcas/", { nombre: nuevaMarca });
        const resMar = await api.get("marcas/");
        setMarcas(resMar.data);
        setNuevaMarca("");
        setShowMarca(false);
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
            setTimeout(() => navigate("/admin/productos"), 1200);
        } catch (error) {
            setMensaje("Error al agregar producto");
        }
    };

    return (
        <div className="agregar-contenedor">
            <h2>Agregar Producto</h2>
            {mensaje && <p className="mensaje">{mensaje}</p>}

            <form onSubmit={handleSubmit} className="form-producto">

                <input type="text" name="nombre" placeholder="Nombre" value={formData.nombre} onChange={handleChange} required />

                <textarea name="descripcion" placeholder="Descripción" value={formData.descripcion} onChange={handleChange}></textarea>

                <div className="fila">
                    <input type="number" name="precio" placeholder="Precio" value={formData.precio} onChange={handleChange} required />
                    <input type="number" name="stock" placeholder="Stock" value={formData.stock} onChange={handleChange} required />
                </div>

                <div className="fila">
                    <div className="grupo-select">
                        <select name="categoria_id" value={formData.categoria_id} onChange={handleChange} required>
                            <option value="">-- Categoría --</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                        </select>
                        <button type="button" className="btn-mini" onClick={() => setShowCat(true)}>+</button>
                    </div>

                    <div className="grupo-select">
                        <select name="marca_id" value={formData.marca_id} onChange={handleChange} required>
                            <option value="">-- Marca --</option>
                            {marcas.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                        </select>
                        <button type="button" className="btn-mini" onClick={() => setShowMarca(true)}>+</button>
                    </div>
                </div>

                {showCat && (
                    <div className="nuevo-dato">
                        <input type="text" placeholder="Nueva categoría" value={nuevaCat} onChange={(e) => setNuevaCat(e.target.value)} />
                        <button type="button" onClick={agregarCategoria}>Guardar</button>
                        <button type="button" onClick={() => setShowCat(false)}>✖</button>
                    </div>
                )}

                {showMarca && (
                    <div className="nuevo-dato">
                        <input type="text" placeholder="Nueva marca" value={nuevaMarca} onChange={(e) => setNuevaMarca(e.target.value)} />
                        <button type="button" onClick={agregarMarca}>Guardar</button>
                        <button type="button" onClick={() => setShowMarca(false)}>✖</button>
                    </div>
                )}

                <input type="file" name="imagen" onChange={handleFile} />

                <button type="submit" className="btn-guardar">Guardar</button>

                <button type="button" className="btn-volver" onClick={() => navigate("/admin/inicio")}>
                    Volver
                </button>
            </form>
        </div>
    );
};

export default AdminAgregarProducto;
