import React, { useEffect, useState, useCallback } from "react";
import {
  FiSearch, FiPlus, FiTrash2, FiEdit2, FiCheckCircle, FiXCircle,
  FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight,
  FiFilter, FiX, FiArrowUp, FiArrowDown, FiMinus, FiDollarSign, FiClock,
} from "react-icons/fi";
import { getProducts, productsAbc, getProductCategories } from "../../api/products";
import { ProductForm } from "../../components/products/productform";
import { hasPermission } from "../../utils/auth";
import { PERMISSIONS } from "../../utils/permissions";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [confirmModal, setConfirmModal] = useState(null);

  // Phase 2: Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegs, setTotalRegs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("product_name");
  const [sortDir, setSortDir] = useState("ASC");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filterStatus, filterCategory, pageSize]);

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getProducts({
        SEARCH: debouncedSearch,
        STATUS: filterStatus,
        CATEGORY_ID: filterCategory || null,
        SORT_BY: sortBy,
        SORT_DIR: sortDir,
        NPAG: page,
        TPAG: pageSize,
      });
      setProducts(res.data || []);
      setTotalPaginas(res.tot_pags || 1);
      setTotalRegs(res.total_regs || 0);
    } catch (err) {
      setError(err?.message || "Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, filterStatus, filterCategory, sortBy, sortDir, page, pageSize]);

  const loadCategories = async () => {
    try {
      const res = await getProductCategories();
      setCategories(Array.isArray(res) ? res : []);
    } catch { setCategories([]); }
  };

  useEffect(() => { loadProducts(); }, [loadProducts]);
  useEffect(() => { loadCategories(); }, []);

  const handleCreate = async (payload) => {
    setSaving(true);
    try {
      const response = await productsAbc({ ...payload, TIPO: "A" });
      if (response.resultado === 1) {
        showNotification(response.msg || "Producto creado correctamente");
        setShowForm(false);
        loadProducts();
      } else {
        showNotification(response.msg || "No se pudo crear el producto", "error");
      }
    } catch (err) {
      showNotification(err?.message || "Error al crear producto", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (payload) => {
    setSaving(true);
    try {
      const response = await productsAbc({ ...payload, TIPO: "C" });
      if (response.resultado === 1) {
        showNotification(response.msg || "Producto actualizado correctamente");
        setShowForm(false);
        setEditingProduct(null);
        loadProducts();
      } else {
        showNotification(response.msg || "No se pudo actualizar el producto", "error");
      }
    } catch (err) {
      showNotification(err?.message || "Error al actualizar producto", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      const response = await productsAbc({ TIPO: "B", PRODUCT_ID: confirmModal?.product?.ID });
      if (response.resultado === 1) {
        showNotification(response.msg || "Producto eliminado correctamente");
        loadProducts();
      } else {
        showNotification(response.msg || "No se pudo eliminar el producto", "error");
      }
    } catch (err) {
      showNotification(err?.message || "Error al eliminar producto", "error");
    } finally {
      setSaving(false);
      setConfirmModal(null);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(prev => prev === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortDir("ASC");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <FiMinus className="ml-1 text-gray-300" size={12} />;
    return sortDir === "ASC" ? <FiArrowUp className="ml-1 text-blue-600" size={12} /> : <FiArrowDown className="ml-1 text-blue-600" size={12} />;
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "$0";
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterCategory("");
    setSortBy("product_name");
    setSortDir("ASC");
  };

  const hasActiveFilters = filterStatus || filterCategory || sortBy !== "product_name";

  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startRow = totalRegs > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRow = Math.min(page * pageSize, totalRegs);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Productos</h1>
            <p className="text-gray-600">Administración de catálogo de productos</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hasPermission(PERMISSIONS.PRODUCTS_CREATE) && (
              <button
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
                disabled={saving}
                onClick={() => { setShowForm(true); setEditingProduct(null); }}
              >
                <FiPlus className="mr-1" /> Nuevo Producto
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o SKU..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FiFilter size={14} /> Filtros
            {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Estado</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                  <option value="">Todas</option>
                  {categories.map((c) => (
                    <option key={c.ID} value={c.ID}>{c.NAME}</option>
                  ))}
                </select>
              </div>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <FiX size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {notification.show && (
          <div className={`mb-4 p-4 rounded ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} flex justify-between items-center`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ ...notification, show: false })} className="text-xs underline ml-2">×</button>
          </div>
        )}

        {showForm && (
          <ProductForm
            title={editingProduct ? "Editar Producto" : "Nuevo Producto"}
            initialData={editingProduct}
            categories={categories}
            submitLabel={editingProduct ? "Actualizar" : "Crear"}
            onSave={editingProduct ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingProduct(null); }}
            saving={saving}
          />
        )}

        {error && !loading && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isMobileView ? (
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.ID}
                    className="p-4 hover:bg-blue-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base truncate">{product.NAME || "-"}</div>
                        {product.SKU && (
                          <div className="text-xs text-gray-400 mt-0.5">SKU: {product.SKU}</div>
                        )}
                        {product.CATEGORY_NAME && (
                          <div className="text-sm text-gray-500 mt-0.5">{product.CATEGORY_NAME}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${product.IS_ACTIVE ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                        {product.IS_ACTIVE ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="font-bold text-blue-600 text-base">{formatAmount(product.UNIT_PRICE)}</div>
                      <div className="flex gap-2">
                        {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
                          <button
                            className="p-2 rounded bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                            onClick={() => { setShowForm(true); setEditingProduct(product); }}
                          >
                            <FiEdit2 size={16} />
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && product.IS_ACTIVE && (
                          <button
                            className="p-2 rounded bg-red-50 text-red-600 hover:bg-red-100"
                            onClick={() => setConfirmModal({ product, type: "delete" })}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {!loading && products.length === 0 && (
                  <div className="py-8 text-center text-gray-500">No se encontraron productos</div>
                )}
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort("sku")}>
                      <span className="flex items-center">SKU <SortIcon column="sku" /></span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort("product_name")}>
                      <span className="flex items-center">Nombre <SortIcon column="product_name" /></span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort("unit_price")}>
                      <span className="flex items-center justify-end">Precio <SortIcon column="unit_price" /></span>
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.ID} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{product.SKU || "-"}</td>
                      <td className="px-4 py-3 text-sm font-medium">{product.NAME || "-"}</td>
                      <td className="px-4 py-3 text-sm">{product.CATEGORY_NAME || "-"}</td>
                      <td className="px-4 py-3 text-sm text-right font-medium">{formatAmount(product.UNIT_PRICE)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.IS_ACTIVE ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {product.IS_ACTIVE ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center space-x-2">
                        {hasPermission(PERMISSIONS.PRODUCTS_UPDATE) && (
                          <button className="text-indigo-600 hover:text-indigo-900" onClick={() => { setShowForm(true); setEditingProduct(product); }}>
                            <FiEdit2 className="h-4 w-4 inline" />
                          </button>
                        )}
                        {hasPermission(PERMISSIONS.PRODUCTS_DELETE) && product.IS_ACTIVE && (
                          <button className="text-red-600 hover:text-red-900" onClick={() => setConfirmModal({ product, type: "delete" })}>
                            <FiTrash2 className="h-4 w-4 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!loading && products.length === 0 && (
                    <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No se encontraron productos</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            )}
            {totalRegs > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>Mostrando {startRow}-{endRow} de {totalRegs}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Filas:</span>
                    <select className="border rounded px-2 py-1 text-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                      {PAGE_SIZE_OPTIONS.map((size) => (<option key={size} value={size}>{size}</option>))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(1)} disabled={page === 1}><FiChevronsLeft size={16} /></button>
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}><FiChevronLeft size={16} /></button>
                  <span className="px-3 text-sm text-gray-600">Pag. {page} / {totalPaginas}</span>
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(p => p + 1)} disabled={page >= totalPaginas}><FiChevronRight size={16} /></button>
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(totalPaginas)} disabled={page >= totalPaginas}><FiChevronsRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold mb-2">Eliminar Producto</h3>
              <p className="text-sm text-gray-600 mb-4">
                ¿Estás seguro de eliminar <strong>{confirmModal.product?.NAME}</strong>? Esta acción no se puede deshacer.
              </p>
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => setConfirmModal(null)}>Cancelar</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50" disabled={saving} onClick={handleDelete}>
                  {saving ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;
