import React from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Datos de ejemplo para una empresa de insumos industriales
const salesByUser = [
  { user: "1 LAGUNA", totalSales: 42500, dealsClosed: 18, avgTimeToClose: 14 },
  { user: "1 SALTILLO", totalSales: 38500, dealsClosed: 15, avgTimeToClose: 21 },
  { user: "DISPONIBLE QUERETARO", totalSales: 58700, dealsClosed: 24, avgTimeToClose: 18 },
  { user: "3 MONTERREY", totalSales: 32000, dealsClosed: 12, avgTimeToClose: 20 }
];

const salesByStage = [
  { stage: "Contacto inicial", count: 15, fill: "#8884d8" },
  { stage: "Cotización enviada", count: 10, fill: "#83a6ed" },
  { stage: "Negociación", count: 8, fill: "#8dd1e1" },
  { stage: "Pedido confirmado", count: 12, fill: "#82ca9d" },
  { stage: "Venta perdida", count: 5, fill: "#ff8042" },
];

const salesByProduct = [
  { product: "Película stretch", sales: 32000, percentage: 32 },
  { product: "Cinta adhesiva", sales: 28000, percentage: 28 },
  { product: "Burbuja de aire", sales: 19500, percentage: 19.5 },
  { product: "Cartón corrugado", sales: 12500, percentage: 12.5 },
  { product: "Fleje plástico", sales: 8000, percentage: 8 },
];

const newVsExisting = [
  { type: "Clientes nuevos", value: 35, fill: "#00C49F" },
  { type: "Clientes recurrentes", value: 65, fill: "#0088FE" },
];

const timeToCloseData = [
  { name: "Ene", days: 25 },
  { name: "Feb", days: 18 },
  { name: "Mar", days: 22 },
  { name: "Abr", days: 15 },
  { name: "May", days: 20 },
  { name: "Jun", days: 17 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function Reports() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Reportes Comerciales</h2>
      
      {/* Sección de métricas clave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 font-medium">Ventas Totales</h3>
          <p className="text-2xl font-bold text-blue-600">$139,700</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 font-medium">Clientes Nuevos</h3>
          <p className="text-2xl font-bold text-green-600">15</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 font-medium">Tiempo Promedio</h3>
          <p className="text-2xl font-bold text-purple-600">18 días</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 font-medium">Tasa de Cierre</h3>
          <p className="text-2xl font-bold text-orange-600">68%</p>
        </div>
      </div>

      {/* Sección 1: Por vendedor/equipo */}
      <section className="mb-10 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Desempeño por Vendedor</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Vendedor/Equipo</th>
                  <th className="px-4 py-3">Ventas Totales</th>
                  <th className="px-4 py-3">Pedidos</th>
                  <th className="px-4 py-3">Días promedio</th>
                </tr>
              </thead>
              <tbody>
                {salesByUser.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.user}</td>
                    <td className="px-4 py-3">${row.totalSales.toLocaleString()}</td>
                    <td className="px-4 py-3">{row.dealsClosed}</td>
                    <td className="px-4 py-3">{row.avgTimeToClose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByUser}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="user" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Ventas totales"]} />
                <Legend />
                <Bar dataKey="totalSales" name="Ventas totales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Sección 2: Por fase del embudo */}
      <section className="mb-10 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Embudo de Ventas</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByStage}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="stage"
                  label={({ stage, percent }) => `${stage}: ${(percent * 100).toFixed(0)}%`}
                >
                  {salesByStage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Oportunidades"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Fase</th>
                  <th className="px-4 py-3">Oportunidades</th>
                  <th className="px-4 py-3">Tasa de Conversión</th>
                </tr>
              </thead>
              <tbody>
                {salesByStage.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.stage}</td>
                    <td className="px-4 py-3">{row.count}</td>
                    <td className="px-4 py-3">
                      {Math.round((row.count / salesByStage.reduce((acc, curr) => acc + curr.count, 0)) * 100)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sección 3: Por producto o servicio */}
      <section className="mb-10 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Ventas por Producto</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesByProduct}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, "Ventas"]} />
                <Legend />
                <Bar dataKey="sales" name="Ventas ($)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3">Ventas</th>
                  <th className="px-4 py-3">Participación</th>
                </tr>
              </thead>
              <tbody>
                {salesByProduct.map((row, i) => (
                  <tr key={i} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{row.product}</td>
                    <td className="px-4 py-3">${row.sales.toLocaleString()}</td>
                    <td className="px-4 py-3">{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Sección 4: Clientes nuevos vs ventas ganadas */}
      <section className="mb-10 bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Clientes Nuevos vs Recurrentes</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={newVsExisting}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="type"
                  label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                >
                  {newVsExisting.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, "Clientes"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <div className="mb-4">
              <h4 className="font-medium text-gray-700">Clientes Nuevos</h4>
              <p className="text-2xl font-bold text-green-600">15</p>
              <p className="text-sm text-gray-500">+12% vs período anterior</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-700">Clientes Recurrentes</h4>
              <p className="text-2xl font-bold text-blue-600">28</p>
              <p className="text-sm text-gray-500">+5% vs período anterior</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección 5: Tiempo promedio de cierre */}
      <section className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Tiempo Promedio de Cierre</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeToCloseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis label={{ value: 'Días', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value) => [value, "Días promedio"]} />
              <Legend />
              <Bar dataKey="days" name="Días para cerrar venta" fill="#FFBB28" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Reports;