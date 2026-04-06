import React, { useState, useEffect } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSave, FiLoader } from "react-icons/fi";
import { getEmailTemplates, createEmailTemplate, updateEmailTemplate, deleteEmailTemplate } from "../../api/email-advanced";
import { Notification } from "../../components/index";

export function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", body: "", variables: "" });
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification((n) => ({ ...n, show: false })), 3000);
  };

  useEffect(() => { loadTemplates(); }, []);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getEmailTemplates();
      setTemplates(data.templates || []);
    } catch (err) {
      showNotification(err.message || "Error al cargar plantillas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name || !form.subject || !form.body) {
      showNotification("Todos los campos son requeridos", "error");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        await updateEmailTemplate(editing, form);
        showNotification("Plantilla actualizada");
      } else {
        await createEmailTemplate(form);
        showNotification("Plantilla creada");
      }
      setForm({ name: "", subject: "", body: "", variables: "" });
      setEditing(null);
      setShowForm(false);
      loadTemplates();
    } catch (err) {
      showNotification(err.message || "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, isSystem) => {
    if (isSystem) {
      showNotification("No se pueden eliminar plantillas del sistema", "error");
      return;
    }
    if (!window.confirm("¿Eliminar esta plantilla?")) return;
    try {
      await deleteEmailTemplate(id);
      showNotification("Plantilla eliminada");
      loadTemplates();
    } catch (err) {
      showNotification(err.message || "Error al eliminar", "error");
    }
  };

  const handleEdit = (t) => {
    setEditing(t.id);
    setForm({ name: t.name, subject: t.subject, body: t.body, variables: t.variables || "" });
    setShowForm(true);
  };

  if (loading) {
    return <div className="p-6 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>;
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Plantillas de correo</h1>
            <p className="text-gray-600 text-sm">Crea y gestiona plantillas para enviar correos rapidos</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditing(null); setForm({ name: "", subject: "", body: "", variables: "" }); }}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
          >
            <FiPlus size={14} /> Nueva plantilla
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{editing ? "Editar plantilla" : "Nueva plantilla"}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
                <input className="border rounded p-2 w-full text-sm" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Ej: Seguimiento semanal" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Asunto</label>
                <input className="border rounded p-2 w-full text-sm" value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} placeholder="Asunto: {{nombre}}" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Variables (separadas por coma)</label>
                <input className="border rounded p-2 w-full text-sm" value={form.variables} onChange={(e) => setForm((p) => ({ ...p, variables: e.target.value }))} placeholder="nombre, empresa, monto" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Cuerpo del correo</label>
                <textarea className="border rounded p-2 w-full text-sm resize-none" rows={8} value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Estimado/a {{nombre}}, ..." />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSubmit} disabled={saving} className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50">
                  {saving ? <FiLoader className="animate-spin" size={14} /> : <FiSave size={14} />}
                  {saving ? "Guardando..." : "Guardar"}
                </button>
                <button onClick={() => { setShowForm(false); setEditing(null); }} className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {templates.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay plantillas creadas</p>
          ) : (
            templates.map((t) => (
              <div key={t.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-800">{t.name}</h4>
                    {t.is_system && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Sistema</span>}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{t.subject}</p>
                  {t.variables && <p className="text-xs text-gray-400 mt-1">Variables: {t.variables}</p>}
                </div>
                <div className="flex gap-2 ml-4">
                  {!t.is_system && (
                    <>
                      <button onClick={() => handleEdit(t)} className="text-blue-600 hover:text-blue-800 p-1"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(t.id, t.is_system)} className="text-red-500 hover:text-red-700 p-1"><FiTrash2 size={16} /></button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {notification.show && (
        <Notification message={notification.message} type={notification.type} onClose={() => setNotification((n) => ({ ...n, show: false }))} />
      )}
    </div>
  );
}

export default EmailTemplates;
