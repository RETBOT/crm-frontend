import React from "react";
import {
  FiActivity,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
} from "react-icons/fi";
import { Typography } from "@material-tailwind/react";
import { KPICard } from "../../../components/reports/kpi-card";
import { ChartContainer } from "../../../components/reports/chart-container";
import { ExportButton } from "../../../components/reports/export-button";

export function ActivitiesReport({ data, filters }) {
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const { byStatus = [], bySeller = [], overdue = [], dailyTrend = [], summary = {} } = data;

  // Preparar datos para gráficos
  const statusData = byStatus.reduce((acc, item) => {
    const existing = acc.find((a) => a.name === item.status);
    if (existing) {
      existing.value += item.count;
    } else {
      acc.push({ name: item.status, value: item.count });
    }
    return acc;
  }, []);

  const typeData = byStatus.reduce((acc, item) => {
    const existing = acc.find((a) => a.name === item.type);
    if (existing) {
      existing.value += item.count;
    } else {
      acc.push({ name: item.type || "Sin tipo", value: item.count });
    }
    return acc;
  }, []);

  const trendData = dailyTrend.slice(0, 30).map((item) => ({
    name: new Date(item.date).toLocaleDateString("es-MX", { day: "2-digit", month: "short" }),
    value: item.count,
    type: item.type,
  }));

  // Agrupar por vendedor
  const sellerMap = bySeller.reduce((acc, item) => {
    const seller = item.sellerName || "Sin asignar";
    if (!acc[seller]) {
      acc[seller] = { name: seller };
    }
    acc[seller][item.status] = item.count;
    return acc;
  }, {});

  const sellerData = Object.values(sellerMap);

  return (
    <div className="p-6">
      {/* Header con exportación */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="h5" className="font-bold text-gray-800">
            Reporte de Actividades
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Seguimiento de actividades por tipo, estado y vendedor
          </Typography>
        </div>
        <ExportButton
          reportType="activities"
          filters={filters}
          filename="reporte-actividades"
        />
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Total Actividades"
          value={summary.total || 0}
          icon={<FiActivity className="w-6 h-6" />}
          color="blue"
          format="number"
        />
        <KPICard
          title="Completadas"
          value={summary.completed || 0}
          change={summary.completionRate || 0}
          changeLabel="tasa de completado"
          icon={<FiCheckCircle className="w-6 h-6" />}
          color="green"
          format="number"
        />
        <KPICard
          title="Pendientes"
          value={(summary.total || 0) - (summary.completed || 0)}
          icon={<FiClock className="w-6 h-6" />}
          color="orange"
          format="number"
        />
        <KPICard
          title="Vencidas"
          value={summary.overdueCount || overdue.length}
          icon={<FiAlertTriangle className="w-6 h-6" />}
          color="red"
          format="number"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Actividades por estado */}
        <ChartContainer
          title="Actividades por Estado"
          subtitle="Distribución actual de actividades"
          chartType="donut"
          library="recharts"
          data={statusData}
          height={300}
        />

        {/* Actividades por tipo */}
        <ChartContainer
          title="Actividades por Tipo"
          subtitle="Distribución por tipo de actividad"
          chartType="pie"
          library="recharts"
          data={typeData}
          height={300}
        />
      </div>

      {/* Tendencia diaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer
          title="Tendencia Diaria"
          subtitle="Actividades creadas por día"
          chartType="area"
          library="apexcharts"
          data={[
            {
              name: "Actividades",
              data: trendData.map((d) => d.value),
            },
          ]}
          options={{
            xaxis: {
              categories: trendData.map((d) => d.name),
            },
          }}
          height={300}
        />

        {/* Tabla por vendedor */}
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-gray-800">
            Por Vendedor
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Completadas
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Pendientes
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {sellerData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.name}</td>
                    <td className="px-4 py-3 text-center text-green-600">
                      {row["Completada"] || 0}
                    </td>
                    <td className="px-4 py-3 text-center text-orange-600">
                      {(row["Pendiente"] || 0) + (row["Programada"] || 0)}
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {Object.values(row)
                        .filter((v) => typeof v === "number")
                        .reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Actividades vencidas */}
      {overdue.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-red-600 flex items-center gap-2">
            <FiAlertTriangle className="w-5 h-5" />
            Actividades Vencidas ({overdue.length})
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Asunto
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Asignado a
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Días Vencida
                  </th>
                </tr>
              </thead>
              <tbody>
                {overdue.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-red-50">
                    <td className="px-4 py-3 font-medium">
                      {row.subject || "-"}
                    </td>
                    <td className="px-4 py-3">{row.customerName || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {row.type || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.assignedTo || "Sin asignar"}</td>
                    <td className="px-4 py-3 text-right text-red-600 font-bold">
                      {row.daysOverdue} días
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-6 text-right text-sm text-gray-500">
        Tasa de completado: {(summary.completionRate || 0).toFixed(1)}% |{" "}
        Vencidas: {summary.overdueCount || overdue.length}
      </div>
    </div>
  );
}

export default ActivitiesReport;