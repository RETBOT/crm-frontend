import React, { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiPhone,
  FiPlus,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import {
  completarActividad,
  crearActividad,
  getActividades,
  getActivityUsers,
  getTiposActividad,
} from "../../api/activities";
import { ActivityForm } from "./activityform";
import { CheckinModal } from "../activities/checkin-modal";
import { hasPermission } from "../../utils/auth";

const statusStyles = {
  Pendiente: "bg-yellow-100 text-yellow-800",
  Programada: "bg-blue-100 text-blue-800",
  Completada: "bg-green-100 text-green-800",
  Cancelada: "bg-red-100 text-red-800",
};

const priorityStyles = {
  Alta: "text-red-600",
  Media: "text-yellow-600",
  Baja: "text-gray-600",
};

const typeIcons = {
  Llamada: <FiPhone className="mr-1 text-blue-500" />,
  Reunion: <FiUser className="mr-1 text-green-500" />,
  Correo: <FiMail className="mr-1 text-purple-500" />,
  Visita: <FiUser className="mr-1 text-orange-500" />,
  Tarea: <FiCheckCircle className="mr-1 text-indigo-500" />,
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function isOverdue(activity) {
  if (!activity.DUE_AT) return false;
  if (activity.STATUS === "Completada" || activity.STATUS === "Cancelada") return false;
  return new Date(activity.DUE_AT) < new Date();
}

function daysOverdue(dueAt) {
  const diff = Date.now() - new Date(dueAt).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export const ActivityList = ({ clienteId, contacts = [], customerData = {} }) => {
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activityTypes, setActivityTypes] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [checkinActivity, setCheckinActivity] = useState(null);
  const canAssign = hasPermission("activities.assign");

  const fetchActividades = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getActividades({ CUSTOMER_ID: clienteId, TPAG: 50 });
      const data = res.data || res;
      setActividades(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Error al cargar actividades");
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
    try {
      const res = await getTiposActividad();
      setActivityTypes(Array.isArray(res) ? res : res.data || []);
    } catch {
      // tipos fallback
      setActivityTypes([
        { CODE: "Llamada", NAME: "Llamada" },
        { CODE: "Reunion", NAME: "Reunion" },
        { CODE: "Correo", NAME: "Correo" },
        { CODE: "Visita", NAME: "Visita" },
        { CODE: "Tarea", NAME: "Tarea" },
      ]);
    }
  };

  const fetchAssignees = async () => {
    if (!canAssign) return;
    try {
      const res = await getActivityUsers();
      setAssignees(Array.isArray(res) ? res : []);
    } catch {
      setAssignees([]);
    }
  };

  useEffect(() => {
    if (clienteId) {
      fetchActividades();
      fetchTipos();
      fetchAssignees();
    }
  }, [clienteId]);

  const handleCreate = async (payload) => {
    await crearActividad(payload);
    setShowForm(false);
    fetchActividades();
  };

  const handleComplete = async (activityId, status) => {
    try {
      await completarActividad(activityId, status);
      fetchActividades();
    } catch (err) {
      alert(err?.message || "Error al actualizar");
    }
  };

  const handleCompleteWithCheckin = async (activityId, lat, lon) => {
    try {
      await completarActividad(activityId, "Completada", lat, lon);
      setCheckinActivity(null);
      fetchActividades();
    } catch (err) {
      alert(err?.message || "Error al completar actividad");
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Actividades</h3>
        {!showForm && hasPermission("activities.create") && (
          <button
            className="flex items-center bg-blue-600 text-white px-3 py-2 rounded text-sm"
            onClick={() => setShowForm(true)}
          >
            <FiPlus className="mr-1" />
            Nueva
          </button>
        )}
      </div>

      {showForm && (
        <ActivityForm
          title="Nueva Actividad"
          activityTypes={activityTypes}
          contacts={contacts}
          customerId={clienteId}
          assigneeList={canAssign ? assignees : []}
          submitLabel="Crear"
          onSave={handleCreate}
          onCancel={() => setShowForm(false)}
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
      ) : actividades.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No hay actividades registradas</div>
      ) : (
          actividades.map((act) => (
          <div key={act.ACTIVITYID} className={`border rounded p-3 mb-2 ${isOverdue(act) ? "border-l-4 border-l-red-400 bg-red-50" : ""}`}>
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <div className="mr-3 mt-1">{typeIcons[act.TYPE] || <FiClock className="mr-1 text-gray-400" />}</div>
                <div>
                  <div
                    className={`font-medium ${
                      act.STATUS === "Completada" || act.STATUS === "Cancelada"
                        ? "line-through text-gray-400"
                        : ""
                    }`}
                  >
                    {act.SUBJECT}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <span className={priorityStyles[act.PRIORITY] || ""}>
                      {act.PRIORITY_NAME || act.PRIORITY}
                    </span>
                    {act.DUE_AT && (
                      <span className={`ml-2 ${isOverdue(act) ? "text-red-600 font-semibold" : ""}`}>
                        <FiCalendar className={`inline mr-1 ${isOverdue(act) ? "text-red-400" : ""}`} />
                        {formatDate(act.DUE_AT)}
                        {isOverdue(act) && (
                          <span className="ml-1 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                            Vencida {daysOverdue(act.DUE_AT)}d
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                  {act.NOTES && (
                    <div className="text-sm text-gray-400 mt-1">{act.NOTES}</div>
                  )}
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  statusStyles[act.STATUS] || "bg-gray-100 text-gray-800"
                }`}
              >
                {act.STATUS}
              </span>
            </div>
            {(act.STATUS === "Pendiente" || act.STATUS === "Programada") && hasPermission("activities.complete") ? (
              <div className="mt-2 flex justify-end gap-2">
                <button
                  className="text-gray-500 text-sm hover:text-red-600"
                  onClick={() => handleComplete(act.ACTIVITYID, "Cancelada")}
                >
                  <FiXCircle className="inline mr-1" />
                  Cancelar
                </button>
                {(act.TYPE === "Visita" || act.TYPE === "Reunion") ? (
                  <button
                    className="text-blue-600 text-sm hover:text-blue-800"
                    onClick={() => setCheckinActivity(act)}
                  >
                    <FiCheckCircle className="inline mr-1" />
                    Completar con check-in
                  </button>
                ) : (
                  <button
                    className="text-blue-600 text-sm hover:text-blue-800"
                    onClick={() => handleComplete(act.ACTIVITYID, "Completada")}
                  >
                    <FiCheckCircle className="inline mr-1" />
                    Completar
                  </button>
                )}
              </div>
            ) : null}
          </div>
        ))
      )}

      {checkinActivity && (
        <CheckinModal
          activity={checkinActivity}
          customer={customerData}
          onClose={() => setCheckinActivity(null)}
          onConfirm={(lat, lon) => handleCompleteWithCheckin(checkinActivity.ACTIVITYID, lat, lon)}
        />
      )}
    </div>
  );
};
