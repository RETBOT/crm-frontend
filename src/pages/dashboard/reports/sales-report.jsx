import React from "react";
import { FiDollarSign, FiShoppingCart, FiTrendingUp } from "react-icons/fi";
import { Typography } from "@material-tailwind/react";
import { KPICard } from "../../../components/reports/kpi-card";
import { ChartContainer } from "../../../components/reports/chart-container";
import { ExportButton } from "../../../components/reports/export-button";

export function SalesReport({ data, filters }) {
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const { data: salesData = [], totals = {} } = data;

  // Preparar datos para gráficos
  const chartData = salesData.map((item) => ({
    name: item.period,
    Ventas: item.totalSales,
    "Cantidad": item.wonCount,
  }));

  // Agrupar por vendedor
  const bySeller = salesData.reduce((acc, item) => {
    const seller = item.sellerName || "Sin vendedor";
    if (!acc[seller]) {
      acc[seller] = { name: seller, totalSales: 0, wonCount: 0 };
    }
    acc[seller].totalSales += item.totalSales;
    acc[seller].wonCount += item.wonCount;
    return acc;
  }, {});

  const sellerData = Object.values(bySeller).sort(
    (a, b) => b.totalSales - a.totalSales
  );

  // Agrupar por sucursal
  const byBranch = salesData.reduce((acc, item) => {
    const branch = item.branchName || "Sin sucursal";
    if (!acc[branch]) {
      acc[branch] = { name: branch, totalSales: 0, wonCount: 0 };
    }
    acc[branch].totalSales += item.totalSales;
    acc[branch].wonCount += item.wonCount;
    return acc;
  }, {});

  const branchData = Object.values(byBranch).sort(
    (a, b) => b.totalSales - a.totalSales
  );

  return (
    <div className="p-4 sm:p-6">
      {/* Header con exportación */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <Typography variant="h5" className="font-bold text-gray-800">
            Reporte de Ventas
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Análisis detallado de ventas por periodo, vendedor y sucursal
          </Typography>
        </div>
        <ExportButton
          reportType="sales"
          filters={filters}
          filename="reporte-ventas"
        />
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <KPICard
          title="Ventas Totales"
          value={totals.totalSales || 0}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="blue"
          format="currency"
        />
        <KPICard
          title="Cantidad de Ventas"
          value={totals.totalWon || 0}
          icon={<FiShoppingCart className="w-6 h-6" />}
          color="green"
          format="number"
        />
        <KPICard
          title="Promedio por Venta"
          value={totals.avgSaleAmount || 0}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="purple"
          format="currency"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tendencia de ventas */}
        <ChartContainer
          title="Tendencia de Ventas por Periodo"
          subtitle="Evolución temporal de las ventas"
          chartType="area"
          library="apexcharts"
          data={[
            {
              name: "Ventas",
              data: chartData.map((d) => d.Ventas),
            },
          ]}
          options={{
            xaxis: {
              categories: chartData.map((d) => d.name),
            },
          }}
          height={300}
        />

        {/* Ventas por vendedor */}
        <ChartContainer
          title="Ventas por Vendedor"
          subtitle="Top vendedores del periodo"
          chartType="bar"
          library="recharts"
          data={sellerData.slice(0, 10)}
          height={300}
        />
      </div>

      {/* Ventas por sucursal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer
          title="Ventas por Sucursal"
          subtitle="Distribución geográfica de ventas"
          chartType="donut"
          library="recharts"
          data={branchData}
          height={300}
        />

        {/* Tabla de ventas */}
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-gray-800">
            Detalle por Periodo
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Periodo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Vendedor
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Ventas
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Cantidad
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesData.slice(0, 10).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.period}</td>
                    <td className="px-4 py-3">{row.sellerName || "-"}</td>
                    <td className="px-4 py-3 text-right">
                      ${(row.totalSales || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">{row.wonCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center sm:text-right text-sm text-gray-500">
        Mostrando {salesData.length} registros
      </div>
    </div>
  );
}

export default SalesReport;