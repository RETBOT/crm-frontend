import React, { useEffect, useState } from "react";
import { FiMail, FiTrash2, FiExternalLink, FiCheckCircle, FiXCircle, FiAlertCircle } from "react-icons/fi";
import { getEmailHistory } from "../../api/email";

export function EmailHistory({ customerId, customerName }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadHistory();
  }, [customerId, page]);

  const loadHistory = async () => {
    setLoading(true);
    setError("");
    try {
      const params = { limit, offset: (page - 1) * limit };
      if (customerId) params.customerId = customerId;
      const data = await getEmailHistory(params);
      setEmails(data.emails || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError(err.message || "Error al cargar el historial");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusIcon = (status) => {
    switch (status) {
      case "sent":
        return <FiCheckCircle className="text-green-500" size={16} />;
      case "failed":
        return <FiXCircle className="text-red-500" size={16} />;
      default:
        return <FiAlertCircle className="text-gray-400" size={16} />;
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "failed":
        return "Fallido";
      case "draft":
        return "Borrador";
      default:
        return status;
    }
  };

  const providerLabel = (provider) => {
    return provider === "google" ? "Gmail" : "Outlook";
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        <FiAlertCircle className="mx-auto mb-2" size={24} />
        {error}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <FiMail className="mx-auto text-gray-300 mb-3" size={40} />
        <p className="text-gray-500">
          {customerId
            ? `No hay correos enviados a ${customerName || "este cliente"}`
            : "No hay correos enviados"}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-3">
        {emails.map((email) => (
          <div
            key={email.id}
            className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {statusIcon(email.status)}
                  <span className="font-medium text-gray-800 truncate">
                    {email.subject}
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">
                    {providerLabel(email.provider)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">
                  Para: {email.to}
                </p>
                {email.customer_name && (
                  <p className="text-xs text-gray-400 mt-1">
                    Cliente: {email.customer_name}
                  </p>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">{formatDate(email.sent_at)}</p>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full mt-1 ${
                    email.status === "sent"
                      ? "bg-green-100 text-green-700"
                      : email.status === "failed"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {statusLabel(email.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <button
            className="px-4 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {totalPages} ({total} correos)
          </span>
          <button
            className="px-4 py-2 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default EmailHistory;
