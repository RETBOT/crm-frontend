import React, { useState, useEffect, useCallback } from "react";
import {
  FiBarChart,
  FiDollarSign,
  FiUsers,
  FiActivity,
  FiTrendingUp,
  FiPackage,
  FiSave,
  FiFolder,
  FiTrash2,
  FiX,
  FiClock,
  FiMail,
  FiEdit2,
  FiCalendar,
} from "react-icons/fi";
import { hasPermission } from "../../../utils/auth";
import { ReportFilters } from "../../../components/reports/report-filters";
import {
  getDashboardReport,
  getSalesReport,
  getCustomersReport,
  getActivitiesReport,
  getOpportunitiesReport,
  getProductsReport,
  getSavedViews,
  createSavedView,
  deleteSavedView,
  getScheduledReports,
  createScheduledReport,
  updateScheduledReport,
  deleteScheduledReport,
} from "../../../api/reports";

import { DashboardReport } from "./dashboard-report";
import { SalesReport } from "./sales-report";
import { CustomersReport } from "./customers-report";
import { ActivitiesReport } from "./activities-report";
import { OpportunitiesReport } from "./opportunities-report";
import { ProductsReport } from "./products-report";

const TABS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: <FiBarChart className="w-4 h-4" />,
    permission: "reports.view",
  },
  {
    id: "sales",
    label: "Ventas",
    icon: <FiDollarSign className="w-4 h-4" />,
    permission: "reports.view",
  },
  {
    id: "customers",
    label: "Clientes",
    icon: <FiUsers className="w-4 h-4" />,
    permission: "reports.view",
  },
  {
    id: "activities",
    label: "Actividades",
    icon: <FiActivity className="w-4 h-4" />,
    permission: "reports.view",
  },
  {
    id: "opportunities",
    label: "Oportunidades",
    icon: <FiTrendingUp className="w-4 h-4" />,
    permission: "reports.view",
  },
  {
    id: "products",
    label: "Productos",
    icon: <FiPackage className="w-4 h-4" />,
    permission: "reports.view",
  },
];

const DEFAULT_FILTERS = {
  datePreset: "this_month",
  startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString()
    .split("T")[0],
  endDate: new Date().toISOString().split("T")[0],
  branchIds: [],
  userIds: [],
  productIds: [],
  stageIds: [],
  status: "",
  minAmount: "",
  maxAmount: "",
  search: "",
};

export function Reports() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [savedViews, setSavedViews] = useState([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [viewName, setViewName] = useState("");
  const [showViewsDropdown, setShowViewsDropdown] = useState(false);
  const [scheduledReports, setScheduledReports] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showScheduleList, setShowScheduleList] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    reportType: "dashboard",
    frequency: "weekly",
    dayOfWeek: 1,
    dayOfMonth: 1,
    recipients: "",
    isActive: true,
  });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const visibleTabs = TABS.filter((tab) => hasPermission(tab.permission));

  // Fallback si el tab activo ya no es visible
  if (visibleTabs.length > 0 && !visibleTabs.find((t) => t.id === activeTab)) {
    setActiveTab(visibleTabs[0].id);
  }

  const loadData = useCallback(async () => {
    if (!hasPermission("reports.view")) return;

    setLoading(true);
    setError("");

    try {
      let result;
      switch (activeTab) {
        case "dashboard":
          result = await getDashboardReport(filters);
          break;
        case "sales":
          result = await getSalesReport(filters);
          break;
        case "customers":
          result = await getCustomersReport(filters);
          break;
        case "activities":
          result = await getActivitiesReport(filters);
          break;
        case "opportunities":
          result = await getOpportunitiesReport(filters);
          break;
        case "products":
          result = await getProductsReport(filters);
          break;
        default:
          result = null;
      }
      setData(result?.data || result);
    } catch (err) {
      console.error("Error cargando reporte:", err);
      setError(err.message || "Error al cargar el reporte");
    } finally {
      setLoading(false);
    }
  }, [activeTab, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // loadData ya se ejecuta via useEffect cuando filters cambia
  };

  const loadSavedViews = useCallback(async () => {
    if (!hasPermission("reports.saved_views")) return;
    try {
      const res = await getSavedViews();
      const data = res?.data || res;
      setSavedViews(Array.isArray(data) ? data : []);
    } catch { setSavedViews([]); }
  }, []);

  useEffect(() => { loadSavedViews(); }, [loadSavedViews]);

  const handleSaveView = async () => {
    if (!viewName.trim()) return;
    try {
      await createSavedView({
        viewName: viewName.trim(),
        reportType: activeTab,
        filters: filters,
      });
      setViewName("");
      setShowSaveModal(false);
      loadSavedViews();
      setNotification({ show: true, message: `Vista "${viewName.trim()}" guardada correctamente`, type: "success" });
    } catch (err) {
      setError(err?.message || "Error al guardar vista");
    }
  };

  const handleLoadView = async (view) => {
    try {
      const parsedFilters = typeof view.filters === "string" ? JSON.parse(view.filters) : view.filters;
      setFilters({ ...DEFAULT_FILTERS, ...parsedFilters });
      if (view.reportType) setActiveTab(view.reportType);
      setShowViewsDropdown(false);
    } catch (err) {
      setError(err?.message || "Error al cargar vista");
    }
  };

  const handleDeleteView = async (viewId) => {
    if (!window.confirm("¿Eliminar esta vista guardada?")) return;
    try {
      await deleteSavedView(viewId);
      loadSavedViews();
    } catch (err) {
      setError(err?.message || "Error al eliminar vista");
    }
  };

  // Scheduled reports functions
  const loadScheduledReports = useCallback(async () => {
    if (!hasPermission("reports.scheduled")) return;
    try {
      const res = await getScheduledReports();
      const data = res?.data || res;
      setScheduledReports(Array.isArray(data) ? data : []);
    } catch { setScheduledReports([]); }
  }, []);

  useEffect(() => { loadScheduledReports(); }, [loadScheduledReports]);

  const handleSaveSchedule = async () => {
    if (!scheduleForm.recipients.trim()) {
      setError("Ingresa al menos un email de destinatario");
      return;
    }
    const recipients = scheduleForm.recipients.split(",").map(e => e.trim()).filter(e => e);
    try {
      if (editingSchedule) {
        await updateScheduledReport(editingSchedule.scheduleId, {
          frequency: scheduleForm.frequency,
          dayOfWeek: scheduleForm.dayOfWeek,
          dayOfMonth: scheduleForm.dayOfMonth,
          recipients,
          filters: { ...filters },
          isActive: scheduleForm.isActive,
        });
        setNotification({ show: true, message: "Reporte programado actualizado", type: "success" });
      } else {
        await createScheduledReport({
          reportType: scheduleForm.reportType,
          frequency: scheduleForm.frequency,
          dayOfWeek: scheduleForm.dayOfWeek,
          dayOfMonth: scheduleForm.dayOfMonth,
          recipients,
          filters: { ...filters },
          isActive: scheduleForm.isActive,
        });
        setNotification({ show: true, message: "Reporte programado creado correctamente", type: "success" });
      }
      setShowScheduleModal(false);
      setEditingSchedule(null);
      setScheduleForm({ reportType: "dashboard", frequency: "weekly", dayOfWeek: 1, dayOfMonth: 1, recipients: "", isActive: true });
      loadScheduledReports();
    } catch (err) {
      setError(err?.message || "Error al programar reporte");
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    const recips = Array.isArray(schedule.recipients) ? schedule.recipients.join(", ") : (schedule.recipients || "");
    setScheduleForm({
      reportType: schedule.reportType || "dashboard",
      frequency: schedule.frequency || "weekly",
      dayOfWeek: schedule.dayOfWeek ?? 1,
      dayOfMonth: schedule.dayOfMonth ?? 1,
      recipients: recips,
      isActive: schedule.isActive !== false,
    });
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm("¿Eliminar este reporte programado?")) return;
    try {
      await deleteScheduledReport(scheduleId);
      loadScheduledReports();
    } catch (err) {
      setError(err?.message || "Error al eliminar reporte programado");
    }
  };

  const handleToggleSchedule = async (schedule) => {
    try {
      await updateScheduledReport(schedule.scheduleId, {
        frequency: schedule.frequency,
        dayOfWeek: schedule.dayOfWeek,
        dayOfMonth: schedule.dayOfMonth,
        recipients: Array.isArray(schedule.recipients) ? schedule.recipients : schedule.recipients.split(","),
        filters: schedule.filters || {},
        isActive: !schedule.isActive,
      });
      loadScheduledReports();
    } catch (err) {
      setError(err?.message || "Error al cambiar estado");
    }
  };

  const formatFrequency = (freq) => {
    const map = { daily: "Diaria", weekly: "Semanal", monthly: "Mensual", hourly: "Cada hora" };
    return map[freq] || freq;
  };

  const formatNextRun = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
    } catch { return "N/A"; }
  };

  if (!hasPermission("reports.view")) {
    return (
      <div className="p-6 text-center text-gray-500">
        No cuenta con permisos para acceder a reportes
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`mb-4 p-4 rounded ${notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"} flex justify-between items-center`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ ...notification, show: false })} className="text-xs underline ml-2">×</button>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reportes</h1>
          <p className="text-gray-600">
            Analiza el rendimiento de tu negocio con reportes detallados
          </p>
        </div>
        {hasPermission("reports.saved_views") && (
          <div className="flex gap-2 relative">
            {/* Load saved views dropdown */}
            <div className="relative">
              <button
                className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                onClick={() => setShowViewsDropdown(!showViewsDropdown)}
              >
                <FiFolder size={14} /> Vistas guardadas
                {savedViews.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full px-1.5">{savedViews.length}</span>
                )}
              </button>
              {showViewsDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-64">
                  <div className="p-2 max-h-64 overflow-y-auto">
                    {savedViews.length === 0 ? (
                      <div className="px-3 py-4 text-center text-sm text-gray-500">
                        <FiFolder className="mx-auto mb-2 text-gray-300" size={24} />
                        <p className="font-medium mb-1">No hay vistas guardadas</p>
                        <p className="text-xs text-gray-400">Configura filtros y guarda tu primera vista</p>
                      </div>
                    ) : (
                      savedViews.map((view) => (
                        <div key={view.viewId} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded">
                          <button
                            className="flex-1 text-left text-sm"
                            onClick={() => handleLoadView(view)}
                          >
                            <div className="font-medium">{view.viewName}</div>
                            <div className="text-xs text-gray-500">{view.reportType}</div>
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 ml-2"
                            onClick={() => handleDeleteView(view.viewId)}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            {/* Save current view */}
            <button
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              onClick={() => setShowSaveModal(true)}
            >
              <FiSave size={14} /> Guardar vista
            </button>
          </div>
        )}
        {hasPermission("reports.scheduled") && (
          <div className="flex gap-2 relative">
            {/* Scheduled reports list */}
            <button
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              onClick={() => setShowScheduleList(!showScheduleList)}
            >
              <FiCalendar size={14} /> Reportes programados
              {scheduledReports.length > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full px-1.5">{scheduledReports.length}</span>
              )}
            </button>
            {/* Schedule new report */}
            <button
              className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
              onClick={() => {
                setEditingSchedule(null);
                setScheduleForm({ reportType: activeTab, frequency: "weekly", dayOfWeek: 1, dayOfMonth: 1, recipients: "", isActive: true });
                setShowScheduleModal(true);
              }}
            >
              <FiClock size={14} /> Programar
            </button>
          </div>
        )}
      </div>

      {/* Save View Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Guardar vista</h3>
              <button onClick={() => { setShowSaveModal(false); setViewName(""); }}>
                <FiX size={18} />
              </button>
            </div>
            <input
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Nombre de la vista"
              value={viewName}
              onChange={(e) => setViewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSaveView()}
            />
            <div className="flex gap-2 justify-end">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => { setShowSaveModal(false); setViewName(""); }}>Cancelar</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={!viewName.trim()} onClick={handleSaveView}>Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close views dropdown */}
      {showViewsDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowViewsDropdown(false)} />
      )}

      {/* Schedule Report Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">{editingSchedule ? "Editar reporte programado" : "Programar reporte"}</h3>
              <button onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }}>
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de reporte</label>
                <select className="w-full border rounded-lg px-3 py-2" value={scheduleForm.reportType} onChange={(e) => setScheduleForm(p => ({ ...p, reportType: e.target.value }))}>
                  <option value="dashboard">Dashboard</option>
                  <option value="sales">Ventas</option>
                  <option value="customers">Clientes</option>
                  <option value="activities">Actividades</option>
                  <option value="opportunities">Oportunidades</option>
                  <option value="products">Productos</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                <select className="w-full border rounded-lg px-3 py-2" value={scheduleForm.frequency} onChange={(e) => setScheduleForm(p => ({ ...p, frequency: e.target.value }))}>
                  <option value="daily">Diaria</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                </select>
              </div>

              {scheduleForm.frequency === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día de la semana</label>
                  <select className="w-full border rounded-lg px-3 py-2" value={scheduleForm.dayOfWeek} onChange={(e) => setScheduleForm(p => ({ ...p, dayOfWeek: Number(e.target.value) }))}>
                    <option value={1}>Lunes</option>
                    <option value={2}>Martes</option>
                    <option value={3}>Miércoles</option>
                    <option value={4}>Jueves</option>
                    <option value={5}>Viernes</option>
                    <option value={6}>Sábado</option>
                    <option value={0}>Domingo</option>
                  </select>
                </div>
              )}

              {scheduleForm.frequency === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día del mes</label>
                  <input type="number" min="1" max="31" className="w-full border rounded-lg px-3 py-2" value={scheduleForm.dayOfMonth} onChange={(e) => setScheduleForm(p => ({ ...p, dayOfMonth: Number(e.target.value) }))} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destinatarios (separados por coma)</label>
                <input className="w-full border rounded-lg px-3 py-2" placeholder="admin@empresa.com, gerente@empresa.com" value={scheduleForm.recipients} onChange={(e) => setScheduleForm(p => ({ ...p, recipients: e.target.value }))} />
              </div>

              <label className="flex items-center gap-2">
                <input type="checkbox" checked={scheduleForm.isActive} onChange={(e) => setScheduleForm(p => ({ ...p, isActive: e.target.checked }))} />
                <span className="text-sm">Activo</span>
              </label>
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => { setShowScheduleModal(false); setEditingSchedule(null); }}>Cancelar</button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50" disabled={!scheduleForm.recipients.trim()} onClick={handleSaveSchedule}>
                {editingSchedule ? "Actualizar" : "Programar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scheduled Reports List Modal */}
      {showScheduleList && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Reportes Programados</h3>
              <button onClick={() => setShowScheduleList(false)}>
                <FiX size={18} />
              </button>
            </div>

            {scheduledReports.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FiCalendar className="mx-auto mb-2 text-gray-300" size={32} />
                <p className="font-medium">No hay reportes programados</p>
                <p className="text-sm text-gray-400 mt-1">Programa tu primer reporte automático</p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-2">Reporte</th>
                    <th className="text-left p-2">Frecuencia</th>
                    <th className="text-left p-2">Destinatarios</th>
                    <th className="text-left p-2">Próximo envío</th>
                    <th className="text-center p-2">Estado</th>
                    <th className="text-center p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledReports.map((s) => (
                    <tr key={s.scheduleId} className="border-t hover:bg-gray-50">
                      <td className="p-2 font-medium">{s.reportType}</td>
                      <td className="p-2">{formatFrequency(s.frequency)}</td>
                      <td className="p-2 text-xs truncate max-w-[150px]" title={Array.isArray(s.recipients) ? s.recipients.join(", ") : s.recipients}>{Array.isArray(s.recipients) ? s.recipients.join(", ") : s.recipients}</td>
                      <td className="p-2 text-xs">{formatNextRun(s.nextRunAt)}</td>
                      <td className="p-2 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={s.isActive} onChange={() => handleToggleSchedule(s)} />
                          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                      </td>
                      <td className="p-2 text-center space-x-1">
                        <button className="text-blue-600 hover:text-blue-800" onClick={() => handleEditSchedule(s)}><FiEdit2 size={14} className="inline" /></button>
                        <button className="text-red-600 hover:text-red-800" onClick={() => handleDeleteSchedule(s.scheduleId)}><FiTrash2 size={14} className="inline" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close schedule list */}
      {showScheduleList && (
        <div className="fixed inset-0 z-40" onClick={() => setShowScheduleList(false)} />
      )}

      {/* Filtros */}
      <ReportFilters
        filters={filters}
        onChange={handleFiltersChange}
        onApply={handleApplyFilters}
        loading={loading}
      />

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b overflow-x-auto">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-blue-500 text-blue-600 bg-blue-50"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Contenido del tab activo */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {activeTab === "dashboard" && (
              <DashboardReport data={data} filters={filters} />
            )}
            {activeTab === "sales" && (
              <SalesReport data={data} filters={filters} />
            )}
            {activeTab === "customers" && (
              <CustomersReport data={data} filters={filters} />
            )}
            {activeTab === "activities" && (
              <ActivitiesReport data={data} filters={filters} />
            )}
            {activeTab === "opportunities" && (
              <OpportunitiesReport data={data} filters={filters} />
            )}
            {activeTab === "products" && (
              <ProductsReport data={data} filters={filters} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Reports;