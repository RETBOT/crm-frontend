import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiPackage,
  FiFilter,
  FiRefreshCw,
  FiSave,
} from "react-icons/fi";
import { Button, Select, Option, Input } from "@material-tailwind/react";

const DATE_PRESETS = [
  { label: "Hoy", value: "today" },
  { label: "Ayer", value: "yesterday" },
  { label: "Última semana", value: "last_week" },
  { label: "Último mes", value: "last_month" },
  { label: "Este mes", value: "this_month" },
  { label: "Mes anterior", value: "last_month_full" },
  { label: "Personalizado", value: "custom" },
];

export function ReportFilters({
  filters,
  onChange,
  onApply,
  onClear,
  onSaveView,
  branches = [],
  users = [],
  products = [],
  loading = false,
  showSaveView = false,
}) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const getDateRange = (preset) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

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

  const handleApply = () => {
    onChange(localFilters);
    if (onApply) onApply();
  };

  const handleClear = () => {
    const clearedFilters = { datePreset: "this_month" };
    setLocalFilters(clearedFilters);
    onChange(clearedFilters);
    if (onClear) onClear();
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Selector de rango de fechas */}
        <div className="flex items-center gap-2">
          <FiCalendar className="w-4 h-4 text-gray-500" />
          <Select
            label="Periodo"
            value={localFilters.datePreset || "this_month"}
            onChange={handlePresetChange}
            className="w-40"
          >
            {DATE_PRESETS.map((preset) => (
              <Option key={preset.value} value={preset.value}>
                {preset.label}
              </Option>
            ))}
          </Select>
        </div>

        {/* Fechas personalizadas */}
        {localFilters.datePreset === "custom" && (
          <>
            <Input
              type="date"
              label="Fecha inicio"
              value={localFilters.startDate || ""}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              className="w-36"
            />
            <Input
              type="date"
              label="Fecha fin"
              value={localFilters.endDate || ""}
              onChange={(e) => handleInputChange("endDate", e.target.value)}
              className="w-36"
            />
          </>
        )}

        {/* Botón filtros avanzados */}
        <Button
          variant="outlined"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <FiFilter className="w-4 h-4" />
          Filtros avanzados
        </Button>

        {/* Botones de acción */}
        <div className="flex gap-2 ml-auto">
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

      {/* Filtros avanzados */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Sucursales */}
          {branches.length > 0 && (
            <div className="flex items-center gap-2">
              <FiMapPin className="w-4 h-4 text-gray-500" />
              <Select
                label="Sucursales"
                value={localFilters.branchIds || []}
                onChange={(value) => handleInputChange("branchIds", value)}
                multiple
              >
                {branches.map((branch) => (
                  <Option key={branch.id} value={branch.id}>
                    {branch.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Usuarios/Vendedores */}
          {users.length > 0 && (
            <div className="flex items-center gap-2">
              <FiUsers className="w-4 h-4 text-gray-500" />
              <Select
                label="Vendedores"
                value={localFilters.userIds || []}
                onChange={(value) => handleInputChange("userIds", value)}
                multiple
              >
                {users.map((user) => (
                  <Option key={user.id} value={user.id}>
                    {user.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}

          {/* Productos */}
          {products.length > 0 && (
            <div className="flex items-center gap-2">
              <FiPackage className="w-4 h-4 text-gray-500" />
              <Select
                label="Productos"
                value={localFilters.productIds || []}
                onChange={(value) => handleInputChange("productIds", value)}
                multiple
              >
                {products.map((product) => (
                  <Option key={product.id} value={product.id}>
                    {product.name}
                  </Option>
                ))}
              </Select>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ReportFilters;