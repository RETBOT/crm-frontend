import React from "react";
import {
  FiPackage,
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";
import { Typography } from "@material-tailwind/react";
import { KPICard } from "../../../components/reports/kpi-card";
import { ChartContainer } from "../../../components/reports/chart-container";
import { ExportButton } from "../../../components/reports/export-button";

export function ProductsReport({ data, filters }) {
  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        No hay datos disponibles
      </div>
    );
  }

  const { salesByProduct = [], salesByCategory = [], topByQuantity = [], summary = {} } = data;

  // Preparar datos para gráficos
  const productChartData = salesByProduct.slice(0, 10).map((item) => ({
    name: item.productName?.substring(0, 20) || "Producto",
    Ventas: item.totalSales,
    Cantidad: item.totalQuantity,
  }));

  const categoryChartData = salesByCategory.map((item) => ({
    name: item.category || "Sin categoría",
    value: item.totalSales,
  }));

  const topByQuantityData = topByQuantity.map((item) => ({
    name: item.productName?.substring(0, 20) || "Producto",
    value: item.totalQuantity,
  }));

  // Calcular totales por categoría para tabla
  const categoryTotal = salesByCategory.reduce((sum, cat) => sum + cat.totalSales, 0);

  return (
    <div className="p-4 sm:p-6">
      {/* Header con exportación */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div>
          <Typography variant="h5" className="font-bold text-gray-800">
            Reporte de Productos
          </Typography>
          <Typography variant="small" className="text-gray-500">
            Análisis de ventas por producto y categoría
          </Typography>
        </div>
        <ExportButton
          reportType="products"
          filters={filters}
          filename="reporte-productos"
        />
      </div>

      {/* KPIs Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <KPICard
          title="Ventas Totales"
          value={summary.totalSales || 0}
          icon={<FiDollarSign className="w-6 h-6" />}
          color="blue"
          format="currency"
        />
        <KPICard
          title="Unidades Vendidas"
          value={summary.totalQuantity || 0}
          icon={<FiPackage className="w-6 h-6" />}
          color="green"
          format="number"
        />
        <KPICard
          title="Productos Activos"
          value={summary.totalProducts || 0}
          icon={<FiShoppingCart className="w-6 h-6" />}
          color="purple"
          format="number"
        />
        <KPICard
          title="Promedio por Producto"
          value={summary.avgSalePerProduct || 0}
          icon={<FiTrendingUp className="w-6 h-6" />}
          color="orange"
          format="currency"
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top productos por ventas */}
        <ChartContainer
          title="Top Productos por Ventas"
          subtitle="Productos con mayor ingreso"
          chartType="bar"
          library="recharts"
          data={productChartData.map((d) => ({
            name: d.name,
            value: d.Ventas,
          }))}
          height={300}
        />

        {/* Ventas por categoría */}
        <ChartContainer
          title="Ventas por Categoría"
          subtitle="Distribución de ventas por categoría"
          chartType="donut"
          library="recharts"
          data={categoryChartData}
          height={300}
        />
      </div>

      {/* Top por cantidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartContainer
          title="Top Productos por Cantidad"
          subtitle="Productos más vendidos en unidades"
          chartType="bar"
          library="apexcharts"
          data={[
            {
              name: "Unidades",
              data: topByQuantityData.map((d) => d.value),
            },
          ]}
          options={{
            xaxis: {
              categories: topByQuantityData.map((d) => d.name),
            },
            plotOptions: {
              bar: {
                horizontal: true,
              },
            },
          }}
          height={300}
        />

        {/* Tabla de productos */}
        <div className="bg-white rounded-lg shadow p-4">
          <Typography variant="h6" className="mb-4 text-gray-800">
            Detalle por Producto
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Producto
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Unidades
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    Ventas
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">
                    % del Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {salesByProduct.slice(0, 15).map((row, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {row.productName || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                        {row.category || "Sin categoría"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {row.totalQuantity?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${row.totalSales?.toLocaleString() || 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(row.percentage || 0, 100)}%` }}
                          ></div>
                        </div>
                        <span>{(row.percentage || 0).toFixed(1)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Tabla de categorías */}
      <div className="bg-white rounded-lg shadow p-4">
        <Typography variant="h6" className="mb-4 text-gray-800">
          Resumen por Categoría
        </Typography>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">
                  Categoría
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  Productos
                </th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">
                  Oportunidades
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  Ventas
                </th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">
                  % del Total
                </th>
              </tr>
            </thead>
            <tbody>
              {salesByCategory.map((row, index) => (
                <tr key={index} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">
                    {row.category || "Sin categoría"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.productCount || 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {row.opportunityCount || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    ${row.totalSales?.toLocaleString() || 0}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {categoryTotal > 0
                      ? ((row.totalSales / categoryTotal) * 100).toFixed(1)
                      : 0}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center sm:text-right text-sm text-gray-500">
        {salesByProduct.length} productos vendidos | {salesByCategory.length}{" "}
        categorías activas
      </div>
    </div>
  );
}

export default ProductsReport;