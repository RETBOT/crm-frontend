import React from "react";
import {
  FiDollarSign,
  FiUsers,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import { Typography } from "@material-tailwind/react";
import { KPICard } from "../../../components/reports/kpi-card";
import { ChartContainer } from "../../../components/reports/chart-container";
import { ExportButton } from "../../../components/reports/export-button";

export function DashboardReport({ data, filters }) {
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const { kpi, charts } = data;

  // Preparar datos para gráficos
  const salesTrendData = charts?.salesTrend?.map((item) => ({
    name: item.month,
    Ventas: item.sales,
  })) || [];

  const opportunitiesData = charts?.opportunitiesStatus?.map((item) => ({
    name: item.stage,
    value: item.count,
  })) || [];

  const topSellersData = charts?.topSellers?.map((item) => ({
    name: item.name,
    Ventas: item.totalSales,
    "Ventas ganadas": item.wonCount,
  })) || [];

  const activitiesData = Object.entries(charts?.activitiesStatus || {}).map(
    ([key, value]) => ({
      name: key,
      value: value,
    })
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header con exportación */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <Typography variant="h5" className="font-bold text-gray-800">
            Dashboard Ejecutivo
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Resumen de KPIs y métricas principales
          </Typography>
        </div>
        <ExportButton
          reportType="dashboard"
          filters={filters}
          filename="dashboard-ejecutivo"
        />
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard
          title="Ventas del periodo"
          value={kpi?.sales?.current || 0}
          change={kpi?.sales?.change || 0}
          changeLabel="vs periodo anterior"
          icon={<FiDollarSign className="w-6 h-6" />}
          color="blue"
          format="currency"
        />
        <KPICard
          title="Oportunidades ganadas"
          value={kpi?.won?.current || 0}
          change={kpi?.won?.change || 0}
          changeLabel="vs periodo anterior"
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="green"
          format="number"
        />
        <KPICard
          title="Clientes nuevos"
          value={kpi?.newCustomers?.current || 0}
          change={kpi?.newCustomers?.change || 0}
          changeLabel="vs periodo anterior"
          icon={<FiUsers className="w-6 h-6" />}
          color="purple"
          format="number"
        />
        <KPICard
          title="Actividades completadas"
          value={kpi?.activities?.current || 0}
          change={kpi?.activities?.change || 0}
          changeLabel="vs periodo anterior"
          icon={<FiActivity className="w-6 h-6" />}
          color="orange"
          format="number"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia de ventas */}
        <ChartContainer
          title="Tendencia de Ventas"
          subtitle="Ventas de los últimos 6 meses"
          chartType="area"
          library="apexcharts"
          data={[
            {
              name: "Ventas",
              data: salesTrendData.map((d) => d.Ventas),
            },
          ]}
          options={{
            xaxis: {
              categories: salesTrendData.map((d) => d.name),
            },
          }}
          height={300}
        />

        {/* Oportunidades por etapa */}
        <ChartContainer
          title="Oportunidades por Etapa"
          subtitle="Distribución actual del pipeline"
          chartType="donut"
          library="recharts"
          data={opportunitiesData}
          height={300}
        />

        {/* Top vendedores */}
        <ChartContainer
          title="Top Vendedores"
          subtitle="Vendedores con más ventas"
          chartType="bar"
          library="apexcharts"
          data={topSellersData.map((d) => ({
            x: d.name,
            y: d.Ventas,
          }))}
          options={{
            plotOptions: {
              bar: {
                horizontal: true,
              },
            },
          }}
          height={300}
        />

        {/* Actividades por estado */}
        <ChartContainer
          title="Actividades por Estado"
          subtitle="Distribución de actividades"
          chartType="pie"
          library="recharts"
          data={activitiesData}
          height={300}
        />
      </div>

      {/* Footer con timestamp */}
      <div className="mt-6 text-right text-sm text-gray-500">
        Última actualización:{" "}
        {data.generated_at
          ? new Date(data.generated_at).toLocaleString("es-MX")
          : "N/A"}
      </div>
    </div>
  );
}

export default DashboardReport;