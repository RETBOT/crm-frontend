import React from "react";
import {
  FiTrendingUp,
  FiDollarSign,
  FiTarget,
  FiClock,
} from "react-icons/fi";
import { Typography } from "@material-tailwind/react";
import { KPICard } from "../../../components/reports/kpi-card";
import { ChartContainer } from "../../../components/reports/chart-container";
import { ExportButton } from "../../../components/reports/export-button";

export function OpportunitiesReport({ data, filters }) {
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const { funnel = [], conversion = [], bySeller = [], byProduct = [], summary = {} } = data;

  // Preparar datos para gráficos
  const funnelData = funnel.map((item) => ({
    name: item.stage,
    value: item.count,
    amount: item.totalAmount,
  }));

  const conversionData = conversion.map((item) => ({
    name: item.stage,
    value: item.stagePercentage,
  }));

  const sellerData = bySeller.slice(0, 10).map((item) => ({
    name: item.sellerName || "Sin vendedor",
    Ganadas: item.wonCount,
    Abiertas: item.openCount,
    Perdidas: item.lostCount,
  }));

  const pipelineByStage = funnel.reduce((acc, item) => {
    acc.push({
      name: item.stage,
      value: item.totalAmount,
    });
    return acc;
  }, []);

  return (
    <div className="p-4 sm:p-6">
      {/* Header con exportación */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <Typography variant="h5" className="font-bold text-gray-800">
            Reporte de Oportunidades
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Análisis del pipeline de ventas y embudo de conversión
          </Typography>
        </div>
        <ExportButton
          reportType="opportunities"
          filters={filters}
          filename="reporte-oportunidades"
        />
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard
          title="Total Oportunidades"
          value={summary.totalOpportunities || 0}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="blue"
          format="number"
        />
        <KPICard
          title="Pipeline Total"
          value={(summary.wonAmount || 0) + (summary.pipelineAmount || 0)}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="green"
          format="currency"
        />
        <KPICard
          title="Tasa de Conversión"
          value={summary.winRate || 0}
          icon={<FiTarget className="w-6 h-6" />}
          color="purple"
          format="percentage"
        />
        <KPICard
          title="Tiempo Promedio de Cierre"
          value={summary.avgDaysToClose || 0}
          icon={<FiClock className="w-6 h-6" />}
          color="orange"
          format="number"
        />
      </div>

      {/* Gráficos del embudo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Embudo de ventas */}
        <ChartContainer
          title="Embudo de Ventas"
          subtitle="Oportunidades por etapa del pipeline"
          chartType="bar"
          library="recharts"
          data={funnelData}
          height={300}
        />

        {/* Tasa de conversión */}
        <ChartContainer
          title="Tasa de Conversión por Etapa"
          subtitle="Porcentaje de conversión acumulado"
          chartType="area"
          library="apexcharts"
          data={[
            {
              name: "Conversión %",
              data: conversionData.map((d) => d.value),
            },
          ]}
          options={{
            xaxis: {
              categories: conversionData.map((d) => d.name),
            },
            yaxis: {
              max: 100,
            },
          }}
          height={300}
        />
      </div>

      {/* Por vendedor y producto */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Oportunidades por vendedor */}
        <ChartContainer
          title="Oportunidades por Vendedor"
          subtitle="Distribución de estado por vendedor"
          chartType="bar"
          library="recharts"
          data={sellerData}
          height={300}
        />

        {/* Pipeline por etapa */}
        <ChartContainer
          title="Valor del Pipeline por Etapa"
          subtitle="Monto total en cada etapa"
          chartType="donut"
          library="recharts"
          data={pipelineByStage}
          height={300}
        />
      </div>

      {/* Tablas detalladas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tabla por vendedor */}
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-gray-800">
            Detalle por Vendedor
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Ganadas
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Abiertas
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Perdidas
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Valor Ganado
                  </th>
                </tr>
              </thead>
              <tbody>
                {bySeller.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {row.sellerName || "-"}
                    </td>
                    <td className="px-4 py-3 text-center text-green-600 font-medium">
                      {row.wonCount}
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600">
                      {row.openCount}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600">
                      {row.lostCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${row.wonAmount?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabla por producto */}
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-gray-800">
            Oportunidades por Producto
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">
                    Oportunidades
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Valor Total
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Valor Ganado
                  </th>
                </tr>
              </thead>
              <tbody>
                {byProduct.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {row.productName || "Sin producto"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.opportunityCount}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${row.totalAmount?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-right text-green-600">
                      ${row.wonAmount?.toLocaleString() || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center sm:text-right text-sm text-gray-500">
        Pipeline activo: ${(summary.pipelineAmount || 0).toLocaleString()} |{" "}
        Ganadas: ${(summary.wonAmount || 0).toLocaleString()} | Win rate:{" "}
        {(summary.winRate || 0).toFixed(1)}%
      </div>
    </div>
  );
}

export default OpportunitiesReport;