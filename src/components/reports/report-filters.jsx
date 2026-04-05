import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiPackage,
  FiFilter,
  FiRefreshCw,
  FiSave,
  FiTrendingUp,
  FiDollarSign,
  FiX,
} from "react-icons/fi";
import { Button, Select, Option, Input } from "@material-tailwind/react";
import { getAdminBranches, getAdminUsers } from "../../api/admin";
import { getProducts } from "../../api/products";
import { getPipelines } from "../../api/opportunities";
import { hasPermission } from "../../utils/auth";

const DATE_PRESETS = [
  { label: "Hoy", value: "today" },
  { label: "Ayer", value: "yesterday" },
  { label: "Última semana", value: "last_week" },
  { label: "Último mes", value: "last_month" },
  { label: "Este mes", value: "this_month" },
  { label: "Mes anterior", value: "last_month_full" },
  { label: "Personalizado", value: "custom" },
];

const OPPORTUNITY_STATUS = [
  { label: "Abierta", value: "abierta" },
  { label: "Ganada", value: "ganada" },
  { label: "Perdida", value: "perdida" },
];

export function ReportFilters({
  filters,
  onChange,
  onApply,
  onClear,
  onSaveView,
  loading = false,
  showSaveView = false,
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [stages, setStages] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      const [branchesRes, usersRes, productsRes, pipelinesRes] = await Promise.all([
        hasPermission("reports.view") ? getAdminBranches() : Promise.resolve({ data: [] }),
        hasPermission("reports.view") ? getAdminUsers() : Promise.resolve({ data: [] }),
        hasPermission("reports.view") ? getProducts() : Promise.resolve({ data: [] }),
        hasPermission("reports.view") ? getPipelines() : Promise.resolve({ data: [] }),
      ]);

      const branchesData = branchesRes?.data || branchesRes || [];
      const usersData = usersRes?.data?.users || usersRes?.data || [];
      const productsData = productsRes?.data || [];
      const pipelinesData = pipelinesRes?.data || [];

      setBranches(branchesData.map(b => ({ id: b.branch_id, name: b.branch_name })));
      setUsers(usersData.map(u => ({ id: u.user_id, name: u.display_name })));
      setProducts(productsData.map(p => ({ id: p.product_id, name: p.product_name })));

      const allStages = [];
      pipelinesData.forEach(pipeline => {
        if (pipeline.stages) {
          pipeline.stages.forEach(stage => {
            allStages.push({ id: stage.stage_id, name: stage.stage_name, pipeline: pipeline.pipeline_name });
          });
        }
      });
      setStages(allStages);

    } catch (error) {
      console.error("Error cargando opciones de filtros:", error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const getDateRange = (preset) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDay = new Date(today);
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);

    switch (preset) {
      case "today":
        return {
          startDate: startOfDay.toISOString().split("T")[0],
          endDate: endOfDay.toISOString().split("T")[0],
        };
      case "yesterday":
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          startDate: yesterday.toISOString().split("T")[0],
          endDate: yesterday.toISOString().split("T")[0],
        };
      case "last_week":
        const lastWeekStart = new Date();
        lastWeekStart.setDate(lastWeekStart.getDate() - 7);
        return {
          startDate: lastWeekStart.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        };
      case "last_month":
        const lastMonthStart = new Date();
        lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
        return {
          startDate: lastMonthStart.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        };
      case "this_month":
        const thisMonthStart = new Date();
        thisMonthStart.setDate(1);
        return {
          startDate: thisMonthStart.toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
        };
      case "last_month_full":
        const lastMonthFullStart = new Date();
        lastMonthFullStart.setMonth(lastMonthFullStart.getMonth() - 1);
        lastMonthFullStart.setDate(1);
        const lastMonthFullEnd = new Date();
        lastMonthFullEnd.setDate(0);
        return {
          startDate: lastMonthFullStart.toISOString().split("T")[0],
          endDate: lastMonthFullEnd.toISOString().split("T")[0],
        };
      default:
        return {};
    }
  };

  const handlePresetChange = (preset) => {
    if (preset === "custom") {
      setLocalFilters({ ...localFilters, datePreset: preset });
    } else {
      const dateRange = getDateRange(preset);
      const newFilters = { ...localFilters, ...dateRange, datePreset: preset };
      setLocalFilters(newFilters);
      onChange(newFilters);
    }
  };

  const handleInputChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value };
    setLocalFilters(newFilters);
  };

  const handleMultiSelectChange = (field, values) => {
    const parsed = Array.isArray(values) ? values : (values ? values.split(",").map(v => parseInt(v.trim())).filter(v => !isNaN(v)) : []);
    const newFilters = { ...localFilters, [field]: parsed };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onChange(localFilters);
    if (onApply) onApply();
  };

  const handleClear = () => {
    const clearedFilters = {
      datePreset: "this_month",
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
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
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
    if (onClear) onClear();
    if (onApply) onApply();
  };

  const formatMultiSelectValue = (arr) => {
    if (!arr || arr.length === 0) return "";
    return arr.join(",");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-500" />
          <Select
            label="Periodo"
            value={localFilters.datePreset || "this_month"}
            onChange={(val) => handlePresetChange(val)}
            className="w-full sm:w-40"
          >
            {DATE_PRESETS.map((preset) => (
              <Option key={preset.value} value={preset.value}>
                {preset.label}
              </Option>
            ))}
          </Select>
        </div>

        {localFilters.datePreset === "custom" && (
          <>
            <Input
              type="date"
              label="Fecha inicio"
              value={localFilters.startDate || ""}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className="w-full sm:w-36"
            />
            <Input
              type="date"
              label="Fecha fin"
              value={localFilters.endDate || ""}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="w-full sm:w-36"
            />
          </>
        )}

        <Button
          variant="outlined"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <FiFilter className="w-4 h-4" />
          Filtros avanzados {showAdvanced ? "(−)" : "(+)"}
        </Button>

        <div className="flex flex-wrap gap-2 ml-auto">
          <Button
            variant="outlined"
            size="sm"
            className="flex items-center gap-2"
            onClick={handleClear}
            disabled={loading}
          >
            <FiRefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Limpiar
          </Button>
          <Button
            size="sm"
            className="flex items-center gap-2 bg-blue-600"
            onClick={handleApply}
            disabled={loading}
          >
            Aplicar filtros
          </Button>
          {showSaveView && (
            <Button
              variant="outlined"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => onSaveView && onSaveView(localFilters)}
            >
              <FiSave className="w-4 h-4" />
              Guardar vista
            </Button>
          )}
        </div>
      </div>

      {showAdvanced && !loadingOptions && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {branches.length > 0 && (
            <div className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-gray-500" />
              <Select
                label="Sucursales"
                value={formatMultiSelectValue(localFilters.branchIds)}
                onChange={(val) => handleMultiSelectChange("branchIds", val)}
                multiple
              >
                {branches.map((branch) => (
                  <Option key={branch.id} value={String(branch.id)}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
              {localFilters.branchIds?.length > 0 && (
                <button
                  onClick={() => handleMultiSelectChange("branchIds", "")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {users.length > 0 && (
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-gray-500" />
              <Select
                label="Vendedores"
                value={formatMultiSelectValue(localFilters.userIds)}
                onChange={(val) => handleMultiSelectChange("userIds", val)}
                multiple
              >
                {users.map((user) => (
                  <Option key={user.id} value={String(user.id)}>
                    {user.name}
                  </Option>
                ))}
              </Select>
              {localFilters.userIds?.length > 0 && (
                <button
                  onClick={() => handleMultiSelectChange("userIds", "")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {products.length > 0 && (
            <div className="flex items-center gap-2">
              <FiPackage className="w-4 h-4 text-gray-500" />
              <Select
                label="Productos"
                value={formatMultiSelectValue(localFilters.productIds)}
                onChange={(val) => handleMultiSelectChange("productIds", val)}
                multiple
              >
                {products.map((product) => (
                  <Option key={product.id} value={String(product.id)}>
                    {product.name}
                  </Option>
                ))}
              </Select>
              {localFilters.productIds?.length > 0 && (
                <button
                  onClick={() => handleMultiSelectChange("productIds", "")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {stages.length > 0 && (
            <div className="flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-gray-500" />
              <Select
                label="Etapas"
                value={formatMultiSelectValue(localFilters.stageIds)}
                onChange={(val) => handleMultiSelectChange("stageIds", val)}
                multiple
              >
                {stages.map((stage) => (
                  <Option key={stage.id} value={String(stage.id)}>
                    {stage.name} ({stage.pipeline})
                  </Option>
                ))}
              </Select>
              {localFilters.stageIds?.length > 0 && (
                <button
                  onClick={() => handleMultiSelectChange("stageIds", "")}
                  className="text-gray-400 hover:text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="flex items-center gap-2">
            <FiTrendingUp className="w-4 h-4 text-gray-500" />
            <Select
              label="Estado"
              value={localFilters.status || ""}
              onChange={(val) => handleInputChange("status", val)}
            >
              <Option value="">Todos</Option>
              {OPPORTUNITY_STATUS.map((status) => (
                <Option key={status.value} value={status.value}>
                  {status.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <FiDollarSign className="w-4 h-4 text-gray-500" />
            <Input
              type="number"
              label="Monto mínimo"
              value={localFilters.minAmount || ""}
              onChange={(e) => handleInputChange("minAmount", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiDollarSign className="w-4 h-4 text-gray-500" />
            <Input
              type="number"
              label="Monto máximo"
              value={localFilters.maxAmount || ""}
              onChange={(e) => handleInputChange("maxAmount", e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-gray-500" />
            <Input
              label="Buscar"
              value={localFilters.search || ""}
              onChange={(e) => handleInputChange("search", e.target.value)}
              className="w-full"
            />
          </div>
        </div>
      )}

      {showAdvanced && loadingOptions && (
        <div className="mt-4 pt-4 border-t flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}

export default ReportFilters;