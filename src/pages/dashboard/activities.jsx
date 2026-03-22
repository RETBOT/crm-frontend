import React, { useEffect, useState } from "react";
import {
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiMail,
  FiPhone,
  FiPlus,
  FiSearch,
  FiUser,
  FiXCircle,
} from "react-icons/fi";
import {
  actualizarActividad,
  completarActividad,
  crearActividad,
  getActividades,
  getActivityUsers,
  getTiposActividad,
} from "../../api/activities";
import { getClientes } from "../../api/accounts";
import { ActivityForm } from "../../components";
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
  Llamada: <FiPhone className="mr-2 text-blue-500" />,
  Reunion: <FiUser className="mr-2 text-green-500" />,
  Correo: <FiMail className="mr-2 text-purple-500" />,
  Visita: <FiUser className="mr-2 text-orange-500" />,
  Tarea: <FiCheckCircle className="mr-2 text-indigo-500" />,
};

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
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

export function Activities() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeFilter, setActiveFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const canAssign = hasPermission("activities.assign");

  const statusOptions = ["", "Pendiente", "Programada", "VENCIDA", "Completada", "Cancelada"];
  const statusLabels = {
    "": "Todas",
    Pendiente: "Pendiente",
    Programada: "Programada",
    VENCIDA: "Vencidas",
    Completada: "Completada",
    Cancelada: "Cancelada",
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchActivities = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getActividades({
        STATUS: activeFilter,
        SEARCH: debouncedSearch,
        NPAG: page,
        TPAG: 20,
      });
      const data = res.data || res;
      setActivities(Array.isArray(data) ? data : []);
      setTotalPaginas(res.tot_pags || 1);
    } catch (err) {
      setError(err?.message || "Error al cargar actividades");
      setActivities([]);
      setTotalPaginas(1);
    } finally {
      setLoading(false);
    }
  };

  const fetchTipos = async () => {
    try {
      const res = await getTiposActividad();
      setActivityTypes(Array.isArray(res) ? res : res.data || []);
    } catch {
      setActivityTypes([
        { CODE: "Llamada", NAME: "Llamada" },
        { CODE: "Reunion", NAME: "Reunion" },
        { CODE: "Correo", NAME: "Correo" },
        { CODE: "Visita", NAME: "Visita" },
        { CODE: "Tarea", NAME: "Tarea" },
      ]);
    }
  };

  const fetchCustomersLight = async () => {
    try {
      const res = await getClientes(0, "", "", "ACTIVO", "", 1, 0, "");
      const data = res.data || res;
      setCustomers(Array.isArray(data) ? data : []);
    } catch {
      setCustomers([]);
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
    fetchActivities();
  }, [activeFilter, debouncedSearch, page]);

  useEffect(() => {
    fetchTipos();
    fetchCustomersLight();
    fetchAssignees();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, debouncedSearch]);

  const handleCreate = async (payload) => {
    await crearActividad(payload);
    setShowForm(false);
    fetchActivities();
  };

  const handleUpdate = async (payload) => {
    await actualizarActividad(payload);
    setEditingActivity(null);
    fetchActivities();
  };

  const handleComplete = async (activityId, status) => {
    try {
      await completarActividad(activityId, status);
      setSelectedActivity(null);
      fetchActivities();
    } catch (err) {
      alert(err?.message || "Error al actualizar");
    }
  };

  const openEdit = (activity) => {
    setEditingActivity({
      ACTIVITYID: activity.ACTIVITYID,
      TYPE: activity.TYPE,
      SUBJECT: activity.SUBJECT,
      NOTES: activity.NOTES,
      DUE_AT: activity.DUE_AT,
      PRIORITY: activity.PRIORITY,
      CONTACT_ID: activity.CONTACT_ID,
      CUSTOMER_ID: activity.CUSTOMER_ID,
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Actividades</h1>
        <p className="text-gray-600 mb-6">
          Gestion de tareas, llamadas, correos y reuniones relacionadas con clientes
        </p>

        {(showForm || editingActivity) && (
          <ActivityForm
            title={editingActivity ? "Editar Actividad" : "Nueva Actividad"}
            activityTypes={activityTypes}
            contacts={[]}
            customerList={customers}
            assigneeList={canAssign ? assignees : []}
            initialData={editingActivity}
            customerId={editingActivity?.CUSTOMER_ID || 0}
            submitLabel={editingActivity ? "Actualizar" : "Crear"}
            onSave={editingActivity ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingActivity(null);
            }}
          />
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar actividades por asunto..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    activeFilter === option
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveFilter(option)}
                >
                  {statusLabels[option]}
                </button>
              ))}
            </div>

            {!showForm && !editingActivity && hasPermission("activities.create") && (
              <button
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap"
                onClick={() => setShowForm(true)}
              >
                <FiPlus className="mr-1" /> Nueva Actividad
              </button>
            )}
          </div>

          {error && !loading && (
            <div className="m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : activities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No se encontraron actividades</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3 min-w-[120px]">Tipo</th>
                    <th className="px-4 py-3 min-w-[250px]">Asunto</th>
                    <th className="px-4 py-3 min-w-[150px]">Relacionado con</th>
                    <th className="px-4 py-3 min-w-[120px]">Fecha/Hora</th>
                    <th className="px-4 py-3 min-w-[120px]">Responsable</th>
                    <th className="px-4 py-3 min-w-[120px]">Prioridad</th>
                    <th className="px-4 py-3 min-w-[120px]">Estado</th>
                  </tr>
                </thead>
                <tbody>
                   {activities.map((activity) => (
                    <tr
                      key={activity.ACTIVITYID}
                      className={`border-t hover:bg-blue-50 cursor-pointer ${
                        selectedActivity?.ACTIVITYID === activity.ACTIVITYID ? "bg-blue-50" : ""
                      } ${
                        isOverdue(activity) ? "bg-red-50 border-l-4 border-l-red-400" : ""
                      }`}
                      onClick={() => setSelectedActivity(activity)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {typeIcons[activity.TYPE] || <FiClock className="mr-2 text-gray-400" />}
                          {activity.TYPE_NAME || activity.TYPE}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{activity.SUBJECT}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{activity.NOMBRECLI}</div>
                        {activity.CONTACT_NAME && (
                          <div className="text-sm text-gray-500">{activity.CONTACT_NAME}</div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className={`flex items-center ${isOverdue(activity) ? "text-red-600 font-semibold" : ""}`}>
                          <FiCalendar className={`mr-1 ${isOverdue(activity) ? "text-red-400" : "text-gray-400"}`} />
                          <span className="mr-2">{formatDate(activity.DUE_AT)}</span>
                          <FiClock className={`mr-1 ${isOverdue(activity) ? "text-red-400" : "text-gray-400"}`} />
                          <span>{formatTime(activity.DUE_AT)}</span>
                          {isOverdue(activity) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              {daysOverdue(activity.DUE_AT)}d
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">{activity.OWNER_NAME || ""}</td>
                      <td className="px-4 py-3">
                        <span className={`font-medium ${priorityStyles[activity.PRIORITY] || ""}`}>
                          {activity.PRIORITY_NAME || activity.PRIORITY}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            statusStyles[activity.STATUS] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {activity.STATUS === "Completada" && <FiCheckCircle className="mr-1" />}
                          {activity.STATUS === "Pendiente" && <FiClock className="mr-1" />}
                          {activity.STATUS}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center p-3 border-t">
            <button
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Anterior
            </button>
            <span className="text-gray-600 text-sm">
              Pag. {page} / {totalPaginas}
            </span>
            <button
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPaginas}
            >
              Siguiente
            </button>
          </div>
        </div>

        {selectedActivity && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Detalles de la Actividad</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedActivity(null)}
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informacion Principal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tipo</label>
                    <p className="mt-1 font-medium">
                      {selectedActivity.TYPE_NAME || selectedActivity.TYPE}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Asunto</label>
                    <p className="mt-1 font-medium">{selectedActivity.SUBJECT}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Relacionado con</label>
                    <p className="mt-1">{selectedActivity.NOMBRECLI}</p>
                    {selectedActivity.CONTACT_NAME && (
                      <p className="text-sm text-gray-500">{selectedActivity.CONTACT_NAME}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Fecha</label>
                      <p className="mt-1">{formatDate(selectedActivity.DUE_AT)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Hora</label>
                      <p className="mt-1">{formatTime(selectedActivity.DUE_AT)}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Responsable</label>
                    <p className="mt-1">{selectedActivity.OWNER_NAME || ""}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Prioridad</label>
                      <p className={`mt-1 font-medium ${priorityStyles[selectedActivity.PRIORITY] || ""}`}>
                        {selectedActivity.PRIORITY_NAME || selectedActivity.PRIORITY}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Estado</label>
                      <p className="mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            statusStyles[selectedActivity.STATUS] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedActivity.STATUS}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Notas</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-line">
                    {selectedActivity.NOTES || "Sin notas"}
                  </p>
                </div>
              </div>

              <div className="md:col-span-2 flex justify-end space-x-3">
                {selectedActivity.STATUS !== "Completada" && selectedActivity.STATUS !== "Cancelada" && hasPermission("activities.complete") && (
                  <>
                    {hasPermission("activities.update") && (
                      <button
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        onClick={() => openEdit(selectedActivity)}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
                      onClick={() => handleComplete(selectedActivity.ACTIVITYID, "Cancelada")}
                    >
                      <FiXCircle className="inline mr-1" />
                      Cancelar
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      onClick={() => handleComplete(selectedActivity.ACTIVITYID, "Completada")}
                    >
                      <FiCheckCircle className="inline mr-1" />
                      Marcar como completada
                    </button>
                  </>
                )}
                {(selectedActivity.STATUS === "Completada" || selectedActivity.STATUS === "Cancelada") && hasPermission("activities.update") && (
                  <button
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    onClick={() => openEdit(selectedActivity)}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Activities;
