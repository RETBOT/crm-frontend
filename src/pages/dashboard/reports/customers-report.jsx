import React from "react";
import {
  FiUsers,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
} from "react-icons/fi";
import { Typography } from "@material-tailwind/react";
import { KPICard } from "../../../components/reports/kpi-card";
import { ChartContainer } from "../../../components/reports/chart-container";
import { ExportButton } from "../../../components/reports/export-button";

export function CustomersReport({ data, filters }) {
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const { newCustomers = [], recurrentCustomers = [], inactiveCustomers = [], summary = {} } = data;

  // Preparar datos para gráficos
  const newCustomersChartData = newCustomers.map((item) => ({
    name: item.period,
    value: item.count,
  }));

  const customerTypeData = [
    { name: "Activos", value: summary.activeLast3Months || 0 },
    { name: "Inactivos", value: (summary.totalCustomers || 0) - (summary.activeLast3Months || 0) },
  ].filter((item) => item.value > 0);

  const recurrentData = recurrentCustomers.slice(0, 10).map((item) => ({
    name: item.customerName?.length > 15 ? item.customerName.substring(0, 15) + "..." : (item.customerName || "Cliente"),
    Compras: item.purchaseCount,
    Total: item.totalPurchases,
  }));

  return (
    <div className="p-4 sm:p-6">
      {/* Header con exportación */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <Typography variant="h5" className="font-bold text-gray-800">
            Reporte de Clientes
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Análisis de base de clientes: nuevos, recurrentes e inactivos
          </Typography>
        </div>
        <ExportButton
          reportType="customers"
          filters={filters}
          filename="reporte-clientes"
        />
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard
          title="Total Clientes"
          value={summary.totalCustomers || 0}
          icon={<FiUsers className="w-6 h-6" />}
          color="blue"
          format="number"
        />
        <KPICard
          title="Clientes Activos"
          value={summary.activeLast3Months || 0}
          icon={<FiUserCheck className="w-6 h-6" />}
          color="green"
          format="number"
        />
        <KPICard
          title="Clientes Nuevos"
          value={newCustomers.reduce((sum, item) => sum + item.count, 0)}
          icon={<FiUserPlus className="w-6 h-6" />}
          color="purple"
          format="number"
        />
        <KPICard
          title="Clientes Inactivos"
          value={inactiveCustomers.length}
          icon={<FiUserX className="w-6 h-6" />}
          color="red"
          format="number"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Clientes nuevos por periodo */}
        <ChartContainer
          title="Clientes Nuevos por Periodo"
          subtitle="Evolución de captación de clientes"
          chartType="bar"
          library="apexcharts"
          data={[
            {
              name: "Clientes nuevos",
              data: newCustomersChartData.map((d) => d.value),
            },
          ]}
          options={{
            xaxis: {
              categories: newCustomersChartData.map((d) => d.name),
            },
          }}
          height={300}
        />

        {/* Clientes activos vs inactivos */}
        <ChartContainer
          title="Clientes Activos vs Inactivos"
          subtitle="Distribución de estado de clientes"
          chartType="donut"
          library="recharts"
          data={customerTypeData}
          height={300}
        />
      </div>

      {/* Clientes recurrentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer
          title="Top Clientes Recurrentes"
          subtitle="Clientes con más compras"
          chartType="bar"
          library="recharts"
          data={recurrentData.map((d) => ({
            name: d.name,
            value: d.Compras,
          }))}
          height={300}
        />

        {/* Tabla de clientes recurrentes */}
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-gray-800">
            Clientes Recurrentes
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Compras
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {recurrentCustomers.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {row.customerName || "-"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.purchaseCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${row.totalPurchases?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clientes inactivos */}
      {inactiveCustomers.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-gray-800">
            Clientes Inactivos (Sin compras en 90+ días)
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Última Compra
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Días Inactivo
                  </th>
                </tr>
              </thead>
              <tbody>
                {inactiveCustomers.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {row.customerName || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {row.lastPurchaseDate
                        ? new Date(row.lastPurchaseDate).toLocaleDateString("es-MX")
                        : "Nunca"}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600 font-medium">
                      {row.daysInactive} días
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
        <div className="mt-6 text-center sm:text-right text-sm text-gray-500">
        Total de clientes: {summary.totalCustomers || 0} | Prospects:{" "}
        {summary.totalProspects || 0}
      </div>
    </div>
  );
}

export default CustomersReport;