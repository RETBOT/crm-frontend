import React, { useEffect, useState } from "react";
import {
  FiSearch, FiPlus, FiTrash2, FiEdit, FiCheckCircle, FiXCircle,
} from "react-icons/fi";
import { getProducts, productsAbc } from "../../api/products";
import { ProductForm } from "../../components/products/productform";
import { hasPermission } from "../../utils/auth";
import { PERMISSIONS } from "../../utils/permissions";

export function Products() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    loadProducts();
  }, []);

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const loadProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts();
      const filtered = searchTerm ? res.filter(p => 
        (p.NAME || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.SKU || "").toLowerCase().includes(searchTerm.toLowerCase())
      ) : res;
      setProducts(filtered);
    } catch (err) {
      setError(err?.message || "Error al cargar productos");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (payload) => {
    try {
      await productsAbc({ ...payload, TIPO: "A" });
      showNotification("Producto creado correctamente");
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      showNotification(err?.message || "Error al crear producto", "error");
    }
  };

  const handleUpdate = async (payload) => {
    try {
      await productsAbc({ ...payload, TIPO: "C" });
      showNotification("Producto actualizado correctamente");
      setShowForm(false);
      setEditingProduct(null);
      await loadProducts();
    } catch (err) {
      showNotification(err?.message || "Error al actualizar producto", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Está seguro de eliminar este producto?")) return;
    
    try {
      await productsAbc({ TIPO: "B", PRODUCT_ID: id });
      showNotification("Producto eliminado correctamente");
      await loadProducts();
    } catch (err) {
      showNotification(err?.message || "Error al eliminar producto", "error");
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Productos</h1>
            <p className="text-gray-600">Administración de catálogo de productos</p>
          </div>
          <div className="flex space-x-3">
            {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
              <button 
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                onClick={() => { setShowForm(true); setEditingProduct(null); }}
              >
                <FiPlus className="mr-1" /> Nuevo Producto
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {notification.show && (
          <div className={`mb-4 p-4 rounded ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
            {notification.message}
            <button 
              onClick={() => setNotification({ ...notification, show: false })}
              className="ml-2 text-xs underline"
            >
              ×
            </button>
          </div>
        )}

        {showForm && (
          <ProductForm
            title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
            initialData={editingProduct}
            submitLabel={editingProduct ? "Actualizar" : "Crear"}
            onSave={editingProduct ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingProduct(null); }}
          />
        )}

        {error && !loading && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr 
                      key={product.ID} 
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-4 py-3 text-sm font-medium">{product.SKU || "-"}</td>
                      <td className="px-4 py-3 text-sm font-medium">{product.NAME || "-"}</td>
                      <td className="px-4 py-3 text-sm">{product.DESCRIPTION || "-"}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        ${product.UNIT_PRICE ? Number(product.UNIT_PRICE).toFixed(2) : "0.00"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.IS_ACTIVE 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {product.IS_ACTIVE ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
                          <button
                            className="text-indigo-600 hover:text-indigo-900"
                            onClick={() => { setShowForm(true); setEditingProduct(product); }}
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleDelete(product.ID)}
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  
                  {!loading && products.length === 0 && (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                        No se encontraron productos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;