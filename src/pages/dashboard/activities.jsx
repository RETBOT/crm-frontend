import React, { useEffect, useState, useCallback } from "react";
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
  FiChevronsLeft,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsRight,
  FiFilter,
  FiX,
  FiArrowUp,
  FiArrowDown,
  FiMinus,
} from "react-icons/fi";
import {
  actualizarActividad,
  completarActividad,
  crearActividad,
  getActividades,
  getActivityUsers,
  getTiposActividad,
} from "../../api/activities";
import { getClientes, getContactos } from "../../api/accounts";
import { ActivityForm } from "../../components";
import { CheckinModal } from "../../components/activities/checkin-modal";
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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export function Activities() {
  const [activities, setActivities] = useState([]);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeFilter, setActiveFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegs, setTotalRegs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [activityTypes, setActivityTypes] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [assignees, setAssignees] = useState([]);
  const [formContacts, setFormContacts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [checkinActivity, setCheckinActivity] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterDueFrom, setFilterDueFrom] = useState("");
  const [filterDueTo, setFilterDueTo] = useState("");
  const [sortBy, setSortBy] = useState("status");
  const [sortDir, setSortDir] = useState("ASC");
  const [showDrawer, setShowDrawer] = useState(false);
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

  const priorityOptions = [
    { value: "", label: "Todas" },
    { value: "Alta", label: "Alta" },
    { value: "Media", label: "Media" },
    { value: "Baja", label: "Baja" },
  ];

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
        TPAG: pageSize,
        TYPE: filterType || null,
        CUSTOMER_ID: filterCustomer || null,
        PRIORITY: filterPriority || null,
        OWNER_USER_ID: filterOwner || null,
        DUE_FROM: filterDueFrom || null,
        DUE_TO: filterDueTo || null,
        SORT_BY: sortBy,
        SORT_DIR: sortDir,
      });
      const data = res.data || res;
      setActivities(Array.isArray(data) ? data : []);
      setTotalPaginas(res.tot_pags || 1);
      setTotalRegs(res.total_regs || 0);
    } catch (err) {
      setError(err?.message || "Error al cargar actividades");
      setActivities([]);
      setTotalPaginas(1);
      setTotalRegs(0);
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
    try {
      const res = await getActivityUsers();
      const data = Array.isArray(res) ? res : (res.data || []);
      setAssignees(data);
    } catch (err) {
      console.error('Error fetching assignees:', err);
      setAssignees([]);
    }
  };

  const fetchFormContacts = async (clienteId) => {
    if (!clienteId || clienteId === 0) {
      setFormContacts([]);
      return;
    }
    try {
      const res = await getContactos(clienteId);
      const data = Array.isArray(res) ? res : (res.data || []);
      setFormContacts(data);
    } catch {
      setFormContacts([]);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, [activeFilter, debouncedSearch, page, pageSize, filterType, filterCustomer, filterPriority, filterOwner, filterDueFrom, filterDueTo, sortBy, sortDir]);

  useEffect(() => {
    fetchTipos();
    fetchCustomersLight();
    fetchAssignees();
  }, []);

  useEffect(() => {
    if (editingActivity?.CUSTOMER_ID) {
      fetchFormContacts(editingActivity.CUSTOMER_ID);
    } else {
      setFormContacts([]);
    }
  }, [editingActivity]);

  useEffect(() => {
    setPage(1);
  }, [activeFilter, debouncedSearch, filterType, filterCustomer, filterPriority, filterOwner, filterDueFrom, filterDueTo, pageSize]);

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
      setShowDrawer(false);
      fetchActivities();
    } catch (err) {
      alert(err?.message || "Error al actualizar");
    }
  };

  const handleCompleteWithCheckin = async (activityId, lat, lon, notes) => {
    try {
      await completarActividad(activityId, "Completada", lat, lon, notes);
      setCheckinActivity(null);
      setSelectedActivity(null);
      setShowDrawer(false);
      fetchActivities();
    } catch (err) {
      alert(err?.message || "Error al completar actividad");
    }
  };

  const handleCompleteWithoutLocation = async (activityId, notes) => {
    try {
      await completarActividad(activityId, "Completada", null, null, notes);
      setCheckinActivity(null);
      setSelectedActivity(null);
      setShowDrawer(false);
      fetchActivities();
    } catch (err) {
      alert(err?.message || "Error al completar actividad");
    }
  };

  const handleStatusChange = async (activityId, newStatus) => {
    try {
      await actualizarActividad({
        ACTIVITY_ID: activityId,
        TYPE: selectedActivity.TYPE,
        SUBJECT: selectedActivity.SUBJECT,
        NOTES: selectedActivity.NOTES || "",
        DUE_AT: selectedActivity.DUE_AT || null,
        PRIORITY: selectedActivity.PRIORITY,
        CUSTOMER_ID: selectedActivity.CUSTOMER_ID,
        CONTACT_ID: selectedActivity.CONTACT_ID || null,
        OPPORTUNITY_ID: selectedActivity.OPPORTUNITY_ID || null,
      });
      setSelectedActivity(prev => ({ ...prev, STATUS: newStatus }));
      fetchActivities();
    } catch (err) {
      alert(err?.message || "Error al cambiar estado");
    }
  };

  const openEdit = useCallback((activity) => {
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
    setShowDrawer(false);
  }, []);

  useEffect(() => {
    if (!selectedActivity?.CUSTOMER_ID) {
      setSelectedCustomer(null);
      return;
    }
    const fetchCustomerData = async () => {
      try {
        const res = await getClientes(
          selectedActivity.CUSTOMER_ID,
          "",
          "",
          "",
          "",
          1,
          1,
          ""
        );
        const data = res.data || res;
        const customer = Array.isArray(data) ? data[0] : data;
        if (customer) {
          setSelectedCustomer({
            NOMBRECLI: customer.NOMBRECLI || customer.customer_name,
            LAT: customer.LAT || customer.latitude,
            LON: customer.LON || customer.longitude,
          });
        } else {
          setSelectedCustomer(null);
        }
      } catch {
        setSelectedCustomer(null);
      }
    };
    fetchCustomerData();
  }, [selectedActivity?.CUSTOMER_ID]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setShowDrawer(false);
        setSelectedActivity(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

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

  const startRow = totalRegs > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRow = Math.min(page * pageSize, totalRegs);

  const clearFilters = () => {
    setFilterType("");
    setFilterCustomer("");
    setFilterPriority("");
    setFilterOwner("");
    setFilterDueFrom("");
    setFilterDueTo("");
    setSortBy("status");
    setSortDir("ASC");
  };

  const hasActiveFilters = filterType || filterCustomer || filterPriority || filterOwner || filterDueFrom || filterDueTo || sortBy !== "status";

  return (
    <div className="p-3 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">Actividades</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
          Gestion de tareas, llamadas, correos y reuniones relacionadas con clientes
        </p>

        {(showForm || editingActivity) && (
          <div className="mb-4 sm:mb-6">
          <ActivityForm
            title={editingActivity ? "Editar Actividad" : "Nueva Actividad"}
            activityTypes={activityTypes}
            contacts={formContacts}
            customerList={customers}
            assigneeList={canAssign ? assignees : []}
            onCustomerChange={fetchFormContacts}
            initialData={editingActivity}
            customerId={editingActivity?.CUSTOMER_ID || 0}
            submitLabel={editingActivity ? "Actualizar" : "Crear"}
            onSave={editingActivity ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingActivity(null);
              setFormContacts([]);
            }}
          />
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden mb-4 sm:mb-6">
          <div className="p-3 sm:p-4 border-b">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por asunto o notas..."
                    className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 border rounded-lg transition-colors relative flex-shrink-0 ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
                  title="Filtros avanzados"
                >
                  <FiFilter size={18} />
                  {hasActiveFilters && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full" />
                  )}
                </button>
                {!showForm && !editingActivity && hasPermission("activities.create") && (
                  <button
                    className="flex items-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap flex-shrink-0 text-sm"
                    onClick={() => setShowForm(true)}
                  >
                    <FiPlus className="mr-1" /> Nueva
                  </button>
                )}
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {statusOptions.map((option) => (
                  <button
                    key={option}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 ${
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
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Tipo de actividad</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                    >
                      <option value="">Todos los tipos</option>
                      {activityTypes.map((t) => (
                        <option key={t.CODE} value={t.CODE}>{t.NAME}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={filterCustomer}
                      onChange={(e) => setFilterCustomer(e.target.value)}
                    >
                      <option value="">Todos los clientes</option>
                      {customers.map((c) => (
                        <option key={c.customer_id || c.CLIENTEID} value={c.customer_id || c.CLIENTEID}>
                          {c.NOMBRECLI || c.customer_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Prioridad</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                    >
                      {priorityOptions.map((p) => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Responsable</label>
                    <select
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={filterOwner}
                      onChange={(e) => setFilterOwner(e.target.value)}
                    >
                      <option value="">Todos</option>
                      {assignees.map((u) => (
                        <option key={u.user_id} value={u.user_id}>{u.display_name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={filterDueFrom}
                      onChange={(e) => setFilterDueFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2 text-sm"
                      value={filterDueTo}
                      onChange={(e) => setFilterDueTo(e.target.value)}
                    />
                  </div>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <FiX size={12} /> Limpiar todos los filtros
                  </button>
                )}
              </div>
            )}
          </div>

          {error && !loading && (
            <div className="m-3 sm:m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
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
                <thead className="bg-gray-100 text-left sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 min-w-[120px]">Tipo</th>
                    <th className="px-4 py-3 min-w-[250px]">Asunto</th>
                    <th className="px-4 py-3 min-w-[150px]">Relacionado con</th>
                    <th
                      className="px-4 py-3 min-w-[120px] cursor-pointer select-none hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort("due_at")}
                    >
                      <span className="flex items-center">Fecha/Hora <SortIcon column="due_at" /></span>
                    </th>
                    <th className="px-4 py-3 min-w-[120px]">Responsable</th>
                    <th
                      className="px-4 py-3 min-w-[120px] cursor-pointer select-none hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort("priority")}
                    >
                      <span className="flex items-center">Prioridad <SortIcon column="priority" /></span>
                    </th>
                    <th
                      className="px-4 py-3 min-w-[120px] cursor-pointer select-none hover:bg-gray-200 transition-colors"
                      onClick={() => handleSort("status")}
                    >
                      <span className="flex items-center">Estado <SortIcon column="status" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                   {activities.map((activity) => {
                    const isSelected = selectedActivity?.ACTIVITYID === activity.ACTIVITYID;
                    const overdue = isOverdue(activity);
                    return (
                      <tr
                        key={activity.ACTIVITYID}
                        className={`border-t cursor-pointer transition-colors ${
                          overdue
                            ? isSelected
                              ? 'bg-blue-50 border-l-4 border-l-red-400'
                              : 'bg-red-50 border-l-4 border-l-red-400 hover:bg-red-100'
                            : isSelected
                              ? 'bg-blue-50'
                              : 'hover:bg-blue-50'
                        }`}
                        onClick={() => { setSelectedActivity(activity); setShowDrawer(true); }}
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
                          <div className={`flex items-center ${overdue ? "text-red-600 font-semibold" : ""}`}>
                            <FiCalendar className={`mr-1 ${overdue ? "text-red-400" : "text-gray-400"}`} />
                            <span className="mr-2">{formatDate(activity.DUE_AT)}</span>
                            <FiClock className={`mr-1 ${overdue ? "text-red-400" : "text-gray-400"}`} />
                            <span>{formatTime(activity.DUE_AT)}</span>
                            {overdue && (
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
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              {totalRegs > 0 && (
                <span>Mostrando {startRow}-{endRow} de {totalRegs} registros</span>
              )}
              <div className="flex items-center gap-1">
                <span className="text-xs text-gray-500">Filas:</span>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPage(1)}
                disabled={page === 1}
                title="Primera página"
              >
                <FiChevronsLeft size={16} />
              </button>
              <button
                className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
                title="Página anterior"
              >
                <FiChevronLeft size={16} />
              </button>
              <span className="px-3 text-sm text-gray-600">
                Pag. {page} / {totalPaginas}
              </span>
              <button
                className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPaginas}
                title="Página siguiente"
              >
                <FiChevronRight size={16} />
              </button>
              <button
                className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                onClick={() => setPage(totalPaginas)}
                disabled={page >= totalPaginas}
                title="Última página"
              >
                <FiChevronsRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer de detalle */}
      {showDrawer && selectedActivity && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 transition-opacity"
            onClick={() => { setShowDrawer(false); setSelectedActivity(null); }}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
            <div className="sticky top-0 bg-white z-10 p-3 sm:p-4 border-b flex justify-between items-center">
              <h2 className="text-base sm:text-lg font-bold text-gray-800">Detalles de la Actividad</h2>
              <button
                className="text-gray-500 hover:text-gray-700 p-1"
                onClick={() => { setShowDrawer(false); setSelectedActivity(null); }}
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Informacion Principal</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    {typeIcons[selectedActivity.TYPE] || <FiClock className="mr-2 text-gray-400" />}
                    <span className="font-medium">{selectedActivity.TYPE_NAME || selectedActivity.TYPE}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Asunto</span>
                    <p className="font-medium">{selectedActivity.SUBJECT}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Relacionado con</span>
                    <p className="font-medium">{selectedActivity.NOMBRECLI}</p>
                    {selectedActivity.CONTACT_NAME && (
                      <p className="text-sm text-gray-500">{selectedActivity.CONTACT_NAME}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Detalles</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Fecha</span>
                    <p className="font-medium">{formatDate(selectedActivity.DUE_AT)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Hora</span>
                    <p className="font-medium">{formatTime(selectedActivity.DUE_AT)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Responsable</span>
                    <p className="font-medium">{selectedActivity.OWNER_NAME || "Sin asignar"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Prioridad</span>
                    <p className={`font-medium ${priorityStyles[selectedActivity.PRIORITY] || ""}`}>
                      {selectedActivity.PRIORITY_NAME || selectedActivity.PRIORITY}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Estado</span>
                    {(selectedActivity.STATUS === "Pendiente" || selectedActivity.STATUS === "Programada") && hasPermission("activities.update") ? (
                      <select
                        value={selectedActivity.STATUS}
                        onChange={(e) => handleStatusChange(selectedActivity.ACTIVITYID, e.target.value)}
                        className="mt-1 border rounded px-2 py-1 text-sm w-full"
                      >
                        <option value="Pendiente">Pendiente</option>
                        <option value="Programada">Programada</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          statusStyles[selectedActivity.STATUS] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedActivity.STATUS}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Notas</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-line text-sm">
                    {selectedActivity.NOTES || "Sin notas"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {selectedActivity.STATUS !== "Completada" && selectedActivity.STATUS !== "Cancelada" && hasPermission("activities.complete") && (
                  <>
                    {hasPermission("activities.update") && (
                      <button
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                        onClick={() => openEdit(selectedActivity)}
                      >
                        Editar
                      </button>
                    )}
                    <button
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 text-sm flex items-center"
                      onClick={() => handleComplete(selectedActivity.ACTIVITYID, "Cancelada")}
                    >
                      <FiXCircle className="mr-1" size={14} />
                      Cancelar
                    </button>
                    {(selectedActivity.TYPE === "Visita" || selectedActivity.TYPE === "Reunion") ? (
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
                        onClick={() => setCheckinActivity(selectedActivity)}
                      >
                        <FiCheckCircle className="mr-1" size={14} />
                        Completar con check-in
                      </button>
                    ) : (
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
                        onClick={() => handleComplete(selectedActivity.ACTIVITYID, "Completada")}
                      >
                        <FiCheckCircle className="mr-1" size={14} />
                        Marcar como completada
                      </button>
                    )}
                  </>
                )}
                {(selectedActivity.STATUS === "Completada" || selectedActivity.STATUS === "Cancelada") && hasPermission("activities.update") && (
                  <button
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm"
                    onClick={() => openEdit(selectedActivity)}
                  >
                    Editar
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {checkinActivity && (
        <CheckinModal
          activity={checkinActivity}
          customer={selectedCustomer}
          onClose={() => setCheckinActivity(null)}
          onConfirm={(lat, lon, notes) => handleCompleteWithCheckin(checkinActivity.ACTIVITYID, lat, lon, notes)}
          onCompleteWithoutLocation={(notes) => handleCompleteWithoutLocation(checkinActivity.ACTIVITYID, notes)}
        />
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default Activities;
