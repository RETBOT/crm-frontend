import React, { useState } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";

export const OpportunityForm = ({
  title,
  initialData,
  customerId,
  customerList = [],
  contactList = [],
  products = [],
  pipelines = [],
  submitLabel,
  onSave,
  onCancel,
}) => {
  const needsCustomerSelector = customerList.length > 0 && !customerId;

  const [formData, setFormData] = useState({
    TITLE: initialData?.TITLE || "",
    DESCRIPTION: initialData?.DESCRIPTION || "",
    AMOUNT: initialData?.AMOUNT || 0,
    CLOSE_DATE: initialData?.CLOSE_DATE
      ? new Date(initialData.CLOSE_DATE).toISOString().slice(0, 10)
      : "",
    PROBABILITY: initialData?.PROBABILITY || 0,
    CUSTOMER_ID: customerId || initialData?.CUSTOMER_ID || "",
    CONTACT_ID: initialData?.CONTACT_ID || "",
    PIPELINE_ID: initialData?.PIPELINE_ID || (pipelines.length > 0 ? pipelines[0].PIPELINE_ID : 1),
  });

  const [items, setItems] = useState(
    initialData?.ITEMS?.map((item) => ({
      PRODUCT_ID: item.PRODUCT_ID || "",
      ITEM_DESCRIPTION: item.ITEM_DESCRIPTION || "",
      QUANTITY: item.QUANTITY || 1,
      UNIT_PRICE: item.UNIT_PRICE || 0,
      DISCOUNT_PCT: item.DISCOUNT_PCT || 0,
    })) || []
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleProductSelect = (index, productId) => {
    const product = products.find((p) => String(p.ID) === String(productId));
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              PRODUCT_ID: productId,
              ITEM_DESCRIPTION: product ? product.NAME : item.ITEM_DESCRIPTION,
              UNIT_PRICE: product ? product.UNIT_PRICE : item.UNIT_PRICE,
            }
          : item
      )
    );
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { PRODUCT_ID: "", ITEM_DESCRIPTION: "", QUANTITY: 1, UNIT_PRICE: 0, DISCOUNT_PCT: 0 },
    ]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const effectiveCustomerId = customerId || formData.CUSTOMER_ID;
      if (!effectiveCustomerId) {
        setError("Debe seleccionar un cliente");
        setSaving(false);
        return;
      }

      const payload = {
        CUSTOMER_ID: Number(effectiveCustomerId),
        CONTACT_ID: formData.CONTACT_ID ? Number(formData.CONTACT_ID) : null,
        PIPELINE_ID: Number(formData.PIPELINE_ID),
        TITLE: formData.TITLE,
        DESCRIPTION: formData.DESCRIPTION,
        AMOUNT: Number(formData.AMOUNT) || 0,
        CLOSE_DATE: formData.CLOSE_DATE || null,
        PROBABILITY: Number(formData.PROBABILITY) || 0,
        ITEMS: items
          .filter((item) => item.ITEM_DESCRIPTION || item.PRODUCT_ID)
          .map((item) => ({
            PRODUCT_ID: item.PRODUCT_ID ? Number(item.PRODUCT_ID) : null,
            ITEM_DESCRIPTION: item.ITEM_DESCRIPTION,
            QUANTITY: Number(item.QUANTITY) || 1,
            UNIT_PRICE: Number(item.UNIT_PRICE) || 0,
            DISCOUNT_PCT: Number(item.DISCOUNT_PCT) || 0,
          })),
      };

      if (initialData?.OPPORTUNITYID) {
        payload.OPPORTUNITY_ID = initialData.OPPORTUNITYID;
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
        <h3 className="text-lg font-semibold">{title || "Oportunidad"}</h3>
        <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onCancel}>Cancelar</button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {needsCustomerSelector && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select name="CUSTOMER_ID" value={formData.CUSTOMER_ID} onChange={handleChange} className="border rounded p-2 w-full" required>
                <option value="">Selecciona cliente</option>
                {customerList.map((c) => (
                  <option key={c.CLIENTEID || c.customer_id} value={c.customer_id || c.CLIENTEID}>
                    {c.NOMBRECLI || c.customer_name}
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titulo de la oportunidad</label>
            <input name="TITLE" value={formData.TITLE} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Ej: Venta de equipos industriales" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto estimado ($)</label>
            <input name="AMOUNT" type="number" step="0.01" value={formData.AMOUNT} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Ej: 25000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cierre estimada</label>
            <input name="CLOSE_DATE" type="date" value={formData.CLOSE_DATE} onChange={handleChange} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Probabilidad (%)</label>
            <input name="PROBABILITY" type="number" min="0" max="100" value={formData.PROBABILITY} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Ej: 50" />
          </div>
          {contactList.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
              <select name="CONTACT_ID" value={formData.CONTACT_ID} onChange={handleChange} className="border rounded p-2 w-full">
                <option value="">Sin contacto</option>
                {contactList.map((c) => (
                  <option key={c.ID} value={c.ID}>{c.NOMBRE} {c.APATERNO}</option>
                ))}
              </select>
            </div>
          )}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripcion</label>
            <textarea name="DESCRIPTION" value={formData.DESCRIPTION} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Detalles de la oportunidad..." rows={2} />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Productos / Items</span>
            <button type="button" className="text-blue-600 text-sm flex items-center" onClick={addItem}>
              <FiPlus className="mr-1" /> Agregar
            </button>
          </div>
          {items.length === 0 && (
            <p className="text-xs text-gray-400 mb-2">Sin items. Haz click en "Agregar" para anadir productos.</p>
          )}
          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <select
                className="col-span-3 border rounded p-1.5 text-sm"
                value={item.PRODUCT_ID}
                onChange={(e) => handleProductSelect(index, e.target.value)}
              >
                <option value="">Producto</option>
                {products.map((p) => (
                  <option key={p.ID} value={p.ID}>{p.SKU} - {p.NAME}</option>
                ))}
              </select>
              <input className="col-span-3 border rounded p-1.5 text-sm" placeholder="Descripcion" value={item.ITEM_DESCRIPTION} onChange={(e) => handleItemChange(index, "ITEM_DESCRIPTION", e.target.value)} />
              <input className="col-span-1 border rounded p-1.5 text-sm" type="number" min="1" value={item.QUANTITY} onChange={(e) => handleItemChange(index, "QUANTITY", e.target.value)} placeholder="Cant" />
              <input className="col-span-2 border rounded p-1.5 text-sm" type="number" step="0.01" value={item.UNIT_PRICE} onChange={(e) => handleItemChange(index, "UNIT_PRICE", e.target.value)} placeholder="Precio" />
              <input className="col-span-1 border rounded p-1.5 text-sm" type="number" min="0" max="100" value={item.DISCOUNT_PCT} onChange={(e) => handleItemChange(index, "DISCOUNT_PCT", e.target.value)} placeholder="Desc%" />
              <button type="button" className="col-span-1 text-red-500 hover:text-red-700" onClick={() => removeItem(index)}>
                <FiTrash2 size={14} />
              </button>
              <div className="col-span-1 text-xs text-gray-500 text-right">
                ${(item.QUANTITY * item.UNIT_PRICE * (1 - item.DISCOUNT_PCT / 100)).toFixed(2)}
              </div>
            </div>
          ))}
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
