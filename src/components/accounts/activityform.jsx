import React, { useState } from "react";

const priorityOptions = [
  { code: "Alta", name: "Alta" },
  { code: "Media", name: "Media" },
  { code: "Baja", name: "Baja" },
];

export const ActivityForm = ({
  title,
  activityTypes,
  contacts,
  initialData,
  customerId,
  customerList = [],
  assigneeList = [],
  submitLabel,
  onSave,
  onCancel,
}) => {
  const needsCustomerSelector = customerList.length > 0 && !customerId && !initialData?.CUSTOMER_ID;
  const needsAssigneeSelector = assigneeList.length > 0 && !initialData?.ACTIVITYID;

  const [formData, setFormData] = useState({
    TYPE: initialData?.TYPE || "",
    SUBJECT: initialData?.SUBJECT || "",
    NOTES: initialData?.NOTES || "",
    DUE_AT: initialData?.DUE_AT
      ? new Date(initialData.DUE_AT).toISOString().slice(0, 16)
      : "",
    PRIORITY: initialData?.PRIORITY || "Media",
    CONTACT_ID: initialData?.CONTACT_ID || "",
    CUSTOMER_ID: customerId || initialData?.CUSTOMER_ID || "",
    OWNER_USER_ID: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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
        OPPORTUNITY_ID: null,
        OWNER_USER_ID: formData.OWNER_USER_ID ? Number(formData.OWNER_USER_ID) : null,
        TYPE: formData.TYPE,
        SUBJECT: formData.SUBJECT,
        NOTES: formData.NOTES,
        DUE_AT: formData.DUE_AT || null,
        PRIORITY: formData.PRIORITY,
      };

      if (initialData?.ACTIVITYID) {
        payload.ACTIVITY_ID = initialData.ACTIVITYID;
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
        <h3 className="text-lg font-semibold text-gray-800">{title || "Actividad"}</h3>
        <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onCancel}>
          Cancelar
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {needsCustomerSelector && (
          <select
            name="CUSTOMER_ID"
            value={formData.CUSTOMER_ID}
            onChange={handleChange}
            className="border rounded p-2 md:col-span-2"
            required
          >
            <option value="">Selecciona cliente</option>
            {customerList.map((c) => (
              <option key={c.CLIENTEID || c.customer_id} value={c.customer_id || c.CLIENTEID}>
                {c.NOMBRECLI || c.customer_name}
              </option>
            ))}
          </select>
        )}

        <select
          name="TYPE"
          value={formData.TYPE}
          onChange={handleChange}
          className="border rounded p-2"
          required
        >
          <option value="">Selecciona tipo</option>
          {activityTypes.map((t) => (
            <option key={t.CODE} value={t.CODE}>
              {t.NAME}
            </option>
          ))}
        </select>

        <input
          name="SUBJECT"
          value={formData.SUBJECT}
          onChange={handleChange}
          className="border rounded p-2"
          placeholder="Asunto"
          required
        />

        <input
          name="DUE_AT"
          type="datetime-local"
          value={formData.DUE_AT}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <select
          name="PRIORITY"
          value={formData.PRIORITY}
          onChange={handleChange}
          className="border rounded p-2"
        >
          {priorityOptions.map((p) => (
            <option key={p.code} value={p.code}>
              {p.name}
            </option>
          ))}
        </select>

        {needsAssigneeSelector && (
          <select
            name="OWNER_USER_ID"
            value={formData.OWNER_USER_ID}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option value="">Asignarme a mi</option>
            {assigneeList.map((u) => (
              <option key={u.user_id} value={u.user_id}>
                {u.display_name} {u.branch_name ? `(${u.branch_name})` : ""}
              </option>
            ))}
          </select>
        )}

        {contacts && contacts.length > 0 && (
          <select
            name="CONTACT_ID"
            value={formData.CONTACT_ID}
            onChange={handleChange}
            className="border rounded p-2"
          >
            <option value="">Sin contacto</option>
            {contacts.map((c) => (
              <option key={c.ID} value={c.ID}>
                {c.NOMBRE} {c.APATERNO}
              </option>
            ))}
          </select>
        )}

        <textarea
          name="NOTES"
          value={formData.NOTES}
          onChange={handleChange}
          className="border rounded p-2 md:col-span-2"
          placeholder="Notas"
          rows={3}
        />

        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" className="px-4 py-2 border rounded text-gray-700" onClick={onCancel}>
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Guardando..." : submitLabel || "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};
