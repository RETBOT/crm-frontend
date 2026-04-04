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
      setSavedViews(Array.isArray(res) ? res : []);
    } catch { setSavedViews([]); }
  }, []);

  useEffect(() => { loadSavedViews(); }, [loadSavedViews]);

  const handleSaveView = async () => {
    if (!viewName.trim()) return;
    try {
      await createSavedView({
        view_name: viewName.trim(),
        report_type: activeTab,
        filters: JSON.stringify(filters),
      });
      setViewName("");
      setShowSaveModal(false);
      loadSavedViews();
    } catch (err) {
      setError(err?.message || "Error al guardar vista");
    }
  };

  const handleLoadView = async (view) => {
    try {
      const parsedFilters = typeof view.filters === "string" ? JSON.parse(view.filters) : view.filters;
      setFilters({ ...DEFAULT_FILTERS, ...parsedFilters });
      if (view.report_type) setActiveTab(view.report_type);
      setShowViewsDropdown(false);
    } catch (err) {
      setError(err?.message || "Error al cargar vista");
    }
  };

  const handleDeleteView = async (viewId) => {
    try {
      await deleteSavedView(viewId);
      loadSavedViews();
    } catch (err) {
      setError(err?.message || "Error al eliminar vista");
    }
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
            {savedViews.length > 0 && (
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                  onClick={() => setShowViewsDropdown(!showViewsDropdown)}
                >
                  <FiFolder size={14} /> Vistas guardadas
                </button>
                {showViewsDropdown && (
                  <div className="absolute right-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-50 min-w-64">
                    <div className="p-2 max-h-64 overflow-y-auto">
                      {savedViews.map((view) => (
                        <div key={view.view_id} className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded">
                          <button
                            className="flex-1 text-left text-sm"
                            onClick={() => handleLoadView(view)}
                          >
                            <div className="font-medium">{view.view_name}</div>
                            <div className="text-xs text-gray-500">{view.report_type}</div>
                          </button>
                          <button
                            className="text-red-400 hover:text-red-600 ml-2"
                            onClick={() => handleDeleteView(view.view_id)}
                          >
                            <FiTrash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {/* Save current view */}
            <button
              className="flex items-center gap-1 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              onClick={() => setShowSaveModal(true)}
            >
              <FiSave size={14} /> Guardar vista
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