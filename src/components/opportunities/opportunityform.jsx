import React, { useState, useEffect } from "react";
import { FiPlus, FiTrash2 } from "react-icons/fi";
import { CustomerSearchSelect } from "../common/CustomerSearchSelect";
import { hasPermission } from "../../utils/auth";
import { PERMISSIONS } from "../../utils/permissions";

export const OpportunityForm = ({
  title,
  initialData,
  initialItems = [],
  customerId,
  customerName,
  contactList = [],
  products = [],
  pipelines = [],
  submitLabel,
  onSave,
  onCancel,
}) => {
  const canEditPrice = hasPermission(PERMISSIONS.OPPORTUNITIES_PRICE_EDIT);
  const today = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

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

  const [selectedCustomerName, setSelectedCustomerName] = useState(customerName || "");

  const [items, setItems] = useState(
    initialItems.length > 0
      ? initialItems.map((item) => ({
          PRODUCT_ID: item.PRODUCT_ID || item.product_id || "",
          ITEM_DESCRIPTION: item.ITEM_DESCRIPTION || item.item_description || "",
          QUANTITY: item.QUANTITY || item.quantity || 1,
          UNIT_PRICE: item.UNIT_PRICE || item.unit_price || 0,
        }))
      : initialData?.ITEMS?.map((item) => ({
          PRODUCT_ID: item.PRODUCT_ID || "",
          ITEM_DESCRIPTION: item.ITEM_DESCRIPTION || "",
          QUANTITY: item.QUANTITY || 1,
          UNIT_PRICE: item.UNIT_PRICE || 0,
        })) || [{ PRODUCT_ID: "", ITEM_DESCRIPTION: "", QUANTITY: 1, UNIT_PRICE: 0 }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Filter contacts by selected customer
  const filteredContacts = contactList.filter(
    (c) => String(c.customer_id || c.CLIENTEID) === String(formData.CUSTOMER_ID)
  );

  // Reset contact when customer changes
  useEffect(() => {
    if (formData.CONTACT_ID && filteredContacts.length > 0) {
      const contactExists = filteredContacts.some(
        (c) => String(c.ID) === String(formData.CONTACT_ID)
      );
      if (!contactExists) {
        setFormData((prev) => ({ ...prev, CONTACT_ID: "" }));
      }
    }
  }, [formData.CUSTOMER_ID, filteredContacts, formData.CONTACT_ID]);

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
              // El precio siempre se auto-completa desde el producto
              UNIT_PRICE: product ? product.UNIT_PRICE : item.UNIT_PRICE,
            }
          : item
      )
    );
  };

  const handleItemChange = (index, field, value) => {
    if (field === "UNIT_PRICE" && !canEditPrice) return;
    if (field === "DISCOUNT_PCT") return;
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { PRODUCT_ID: "", ITEM_DESCRIPTION: "", QUANTITY: 1, UNIT_PRICE: 0 },
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
          {!customerId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <CustomerSearchSelect
                value={formData.CUSTOMER_ID}
                onChange={(id) => setFormData((p) => ({ ...p, CUSTOMER_ID: id }))}
                onCustomerSelect={(customer) => setSelectedCustomerName(customer.name || "")}
                placeholder="Buscar cliente..."
              />
              {selectedCustomerName && (
                <div className="mt-2 p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                  {selectedCustomerName}
                </div>
              )}
            </div>
          )}
          {(customerId || formData.CUSTOMER_ID) && customerName && !selectedCustomerName && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <div className="p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm">
                {customerName}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titulo de la oportunidad</label>
            <input name="TITLE" value={formData.TITLE} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Ej: Venta de equipos industriales" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto estimado ($)</label>
            <input name="AMOUNT" type="number" step="0.01" min="0" value={formData.AMOUNT} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Ej: 25000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de cierre estimada</label>
            <input name="CLOSE_DATE" type="date" min={today} value={formData.CLOSE_DATE} onChange={handleChange} className="border rounded p-2 w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Probabilidad (%)</label>
            <input name="PROBABILITY" type="number" min="0" max="100" value={formData.PROBABILITY} onChange={handleChange} className="border rounded p-2 w-full" placeholder="Ej: 50" />
          </div>
          {filteredContacts.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contacto</label>
              <select name="CONTACT_ID" value={formData.CONTACT_ID} onChange={handleChange} className="border rounded p-2 w-full">
                <option value="">Sin contacto</option>
                {filteredContacts.map((c) => (
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
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">Productos de la oportunidad</span>
            <button type="button" className="flex items-center text-blue-600 text-sm hover:text-blue-800" onClick={addItem}>
              <FiPlus className="mr-1" /> Agregar producto
            </button>
          </div>

          {items.length === 0 && (
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-400 mb-2">Sin productos agregados</p>
              <button type="button" className="text-blue-600 text-sm hover:text-blue-800" onClick={addItem}>
                + Agregar primer producto
              </button>
            </div>
          )}

          {items.length > 0 && (
            <div className="overflow-x-auto">
              <div className="min-w-[600px]">
              <div className="grid grid-cols-12 gap-1 bg-gray-50 p-2 text-xs font-medium text-gray-600 border-b">
                <div className="col-span-3">Producto</div>
                <div className="col-span-4">Descripcion</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right">Precio</div>
                <div className="col-span-1 text-center">Quitar</div>
              </div>
              {items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-1 p-2 border-t items-center">
                  <div className="col-span-3">
                    <select
                      className="w-full border rounded p-1.5 text-sm"
                      value={item.PRODUCT_ID}
                      onChange={(e) => handleProductSelect(index, e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {products.map((p) => (
                        <option key={p.ID} value={p.ID}>{p.NAME}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4">
                    <input
                      className="w-full border rounded p-1.5 text-sm"
                      placeholder="Descripcion del producto"
                      value={item.ITEM_DESCRIPTION}
                      onChange={(e) => handleItemChange(index, "ITEM_DESCRIPTION", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="w-full border rounded p-1.5 text-sm text-center"
                      type="number"
                      min="1"
                      value={item.QUANTITY}
                      onChange={(e) => handleItemChange(index, "QUANTITY", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      className="w-full border rounded p-1.5 text-sm text-right bg-gray-100"
                      type="number"
                      step="0.01"
                      value={item.UNIT_PRICE}
                      readOnly={!canEditPrice}
                      disabled={!canEditPrice}
                    />
                  </div>
                  <div className="col-span-1 text-center">
                    <button type="button" className="text-red-400 hover:text-red-600" onClick={() => removeItem(index)}>
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div className="grid grid-cols-12 gap-1 p-2 bg-gray-50 border-t">
                <div className="col-span-10 text-right text-sm font-semibold text-gray-700">Total de productos:</div>
                <div className="col-span-1 text-right text-sm font-bold text-blue-600">
                  ${items.reduce((sum, item) => sum + item.QUANTITY * item.UNIT_PRICE, 0).toFixed(2)}
                </div>
                <div className="col-span-1"></div>
              </div>
              </div>
            </div>
          )}
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
