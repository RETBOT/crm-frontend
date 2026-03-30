import React, { useState } from "react";
import { Card, CardHeader, CardBody, Typography, Button } from "@material-tailwind/react";
import { FiDownload, FiMaximize2, FiMinimize2 } from "react-icons/fi";
import Chart from "react-apexcharts";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"];

export function ChartContainer({
  title,
  subtitle,
  chartType = "area",
  library = "apexcharts",
  data = [],
  options = {},
  height = 300,
  exportable = false,
  onExport,
  loading = false,
  className = "",
}) {
  const [expanded, setExpanded] = useState(false);

  const handleExport = () => {
    if (onExport) {
      onExport();
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardBody>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  // Configuración por defecto para ApexCharts
  const apexOptions = {
    chart: {
      type: chartType,
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: COLORS,
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.2 },
    },
    legend: { position: "bottom" },
    xaxis: { type: "category" },
    yaxis: { beginAtZero: true },
    ...options,
  };

  const renderApexChart = () => {
    const series = data.length > 0 && data[0].name ? data : [{ name: "Valor", data }];

    return (
      <Chart
        options={apexOptions}
        series={series}
        type={chartType}
        height={expanded ? height * 1.5 : height}
      />
    );
  };

  const renderRecharts = () => {
    const chartHeight = expanded ? height * 1.5 : height;

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0] || {})
                .filter((key) => key !== "name")
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    name={key}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0] || {})
                .filter((key) => key !== "name")
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={COLORS[index % COLORS.length]}
                    name={key}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <AreaChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(data[0] || {})
                .filter((key) => key !== "name")
                .map((key, index) => (
                  <Area
                    key={key}
                    type="monotone"
                    dataKey={key}
                    fill={COLORS[index % COLORS.length]}
                    stroke={COLORS[index % COLORS.length]}
                    name={key}
                  />
                ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
      case "donut":
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className={`${className} ${expanded ? "col-span-2" : ""}`}>
      <CardHeader floated={false} shadow={false} className="m-0 p-4 pb-0">
        <div className="flex items-center justify-between">
          <div>
            <Typography variant="h6" color="blue-gray">
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="small" className="font-normal text-blue-gray-500">
                {subtitle}
              </Typography>
            )}
          </div>
          <div className="flex gap-2">
            {exportable && (
              <Button
                variant="text"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleExport}
              >
                <FiDownload className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="text"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <FiMinimize2 className="w-4 h-4" />
              ) : (
                <FiMaximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody className="pt-4">
        {library === "apexcharts" ? renderApexChart() : renderRecharts()}
      </CardBody>
    </Card>
  );
}

export default ChartContainer;