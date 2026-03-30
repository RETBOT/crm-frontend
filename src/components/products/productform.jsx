import React, { useState } from "react";
import { hasPermission } from "../../utils/auth";
import { PERMISSIONS } from "../../utils/permissions";

export const ProductForm = ({
  title,
  initialData,
  submitLabel,
  onSave,
  onCancel,
}) => {
  const canEditPrice = hasPermission(PERMISSIONS.PRODUCTS_PRICE_EDIT);
  const [formData, setFormData] = useState({
    SKU: initialData?.SKU || "",
    PRODUCT_NAME: initialData?.NOMBRE || initialData?.NAME || "",
    DESCRIPTION: initialData?.DESCRIPCION || initialData?.DESCRIPTION || "",
    UNIT_PRICE: initialData?.PRECIO || initialData?.UNIT_PRICE || 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const payload = {
        SKU: formData.SKU,
        PRODUCT_NAME: formData.PRODUCT_NAME,
        DESCRIPTION: formData.DESCRIPTION,
        UNIT_PRICE: canEditPrice ? Number(formData.UNIT_PRICE) || 0 : 0,
      };

      if (initialData?.ID) {
        payload.PRODUCT_ID = initialData.ID;
      }

      await onSave(payload);
    } catch (err) {
      setError(err?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title || "Producto"}</h3>
        <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onCancel}>×</button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
            <input
              name="SKU"
              value={formData.SKU}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Código del producto"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del producto</label>
            <input
              name="PRODUCT_NAME"
              value={formData.PRODUCT_NAME}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Nombre del producto"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio unitario ($)</label>
            <input
              name="UNIT_PRICE"
              type="number"
              step="0.01"
              min="0"
              value={formData.UNIT_PRICE}
              onChange={canEditPrice ? handleChange : undefined}
              readOnly={!canEditPrice}
              disabled={!canEditPrice}
              className={`border rounded p-2 w-full ${canEditPrice ? '' : 'bg-gray-100 cursor-not-allowed'}`}
              placeholder="0.00"
            />
            {!canEditPrice && (
              <p className="text-xs text-gray-500 mt-1">No tiene permisos para editar precios</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              name="DESCRIPTION"
              value={formData.DESCRIPTION}
              onChange={handleChange}
              className="border rounded p-2 w-full"
              placeholder="Descripción del producto"
              rows="2"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" className="px-4 py-2 border rounded text-gray-700" onClick={onCancel}>Cancelar</button>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Guardando..." : submitLabel || "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};