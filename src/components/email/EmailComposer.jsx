import React, { useState, useEffect } from "react";
import { FiX, FiSend, FiPaperclip, FiLoader, FiFileText } from "react-icons/fi";
import { sendEmail } from "../../api/email";
import { getEmailTemplates } from "../../api/email-advanced";

export function EmailComposer({
  to = "",
  subject = "",
  customerId = null,
  onClose,
  onSent,
}) {
  const [formData, setFormData] = useState({
    to,
    cc: "",
    bcc: "",
    subject,
    body: "",
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [templates, setTemplates] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);

  useEffect(() => {
    getEmailTemplates().then((data) => setTemplates(data.templates || [])).catch(() => {});
  }, []);

  const applyTemplate = (t) => {
    setFormData((prev) => ({
      ...prev,
      subject: t.subject,
      body: t.body,
    }));
    setShowTemplates(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.to.trim()) {
      setError("El destinatario es requerido");
      return;
    }

    if (!formData.subject.trim()) {
      setError("El asunto es requerido");
      return;
    }

    if (!formData.body.trim()) {
      setError("El cuerpo del correo es requerido");
      return;
    }

    setSending(true);
    try {
      const payload = {
        to: formData.to.trim(),
        cc: formData.cc.trim() || null,
        bcc: formData.bcc.trim() || null,
        subject: formData.subject.trim(),
        body: formData.body.trim(),
        customerId,
      };

      await sendEmail(payload);
      onSent?.();
      onClose();
    } catch (err) {
      setError(err.message || "Error al enviar el correo");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            Nuevo correo
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1"
            disabled={sending}
          >
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSend} className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-3 mb-4">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Para *</label>
                <input
                  type="email"
                  name="to"
                  value={formData.to}
                  onChange={handleChange}
                  className="border rounded p-2 w-full text-sm"
                  placeholder="correo@ejemplo.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CC</label>
                  <input
                    type="email"
                    name="cc"
                    value={formData.cc}
                    onChange={handleChange}
                    className="border rounded p-2 w-full text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">CCO</label>
                  <input
                    type="email"
                    name="bcc"
                    value={formData.bcc}
                    onChange={handleChange}
                    className="border rounded p-2 w-full text-sm"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Asunto *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="border rounded p-2 w-full text-sm"
                  placeholder="Asunto del correo"
                  required
                />
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-medium text-gray-600 mb-1">Plantillas</label>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <FiFileText size={14} /> Seleccionar plantilla
              </button>

              {showTemplates && (
                <div className="absolute z-10 mt-1 bg-white border rounded-lg shadow-lg w-72 max-h-60 overflow-y-auto">
                  {templates.length === 0 ? (
                    <p className="p-3 text-sm text-gray-500">No hay plantillas disponibles</p>
                  ) : (
                    templates.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => applyTemplate(t)}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <p className="text-sm font-medium text-gray-800">{t.name}</p>
                        <p className="text-xs text-gray-500 truncate">{t.subject}</p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mensaje *</label>
              <textarea
                name="body"
                value={formData.body}
                onChange={handleChange}
                rows={10}
                className="border rounded p-2 w-full text-sm resize-none"
                placeholder="Escribe tu mensaje aquí..."
                required
              />
            </div>
          </div>
        </form>

        <div className="flex items-center justify-between p-4 border-t">
          <div className="flex gap-2">
            <button
              type="button"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-3 py-2 text-sm border rounded"
              title="Adjuntar archivo (proximamente)"
            >
              <FiPaperclip size={16} />
              Adjuntar
            </button>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50"
              disabled={sending}
            >
              Cancelar
            </button>
            <button
              onClick={handleSend}
              className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
              disabled={sending}
            >
              {sending ? (
                <>
                  <FiLoader className="animate-spin" size={16} />
                  Enviando...
                </>
              ) : (
                <>
                  <FiSend size={16} />
                  Enviar
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailComposer;
