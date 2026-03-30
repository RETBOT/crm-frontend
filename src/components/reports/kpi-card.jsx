import React from "react";
import { Card, CardBody, Typography } from "@material-tailwind/react";
import { FiTrendingUp, FiTrendingDown, FiMinus } from "react-icons/fi";

export function KPICard({
  title,
  value,
  change,
  changeLabel = "vs periodo anterior",
  icon,
  color = "blue",
  loading = false,
  format = "number", // number, currency, percentage
}) {
  const formatValue = (val, fmt) => {
    if (val === null || val === undefined) return "-";

    switch (fmt) {
      case "currency":
        return new Intl.NumberFormat("es-MX", {
          style: "currency",
          currency: "MXN",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case "percentage":
        return `${val.toFixed(1)}%`;
      case "number":
      default:
        return new Intl.NumberFormat("es-MX").format(val);
    }
  };

  const getChangeIcon = () => {
    if (change === 0 || change === null || change === undefined)
      return <FiMinus className="w-4 h-4" />;
    if (change > 0) return <FiTrendingUp className="w-4 h-4" />;
    return <FiTrendingDown className="w-4 h-4" />;
  };

  const getChangeColor = () => {
    if (change === 0 || change === null || change === undefined) return "text-gray-500";
    if (change > 0) return "text-green-600";
    return "text-red-600";
  };

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    red: "bg-red-50 text-red-600",
    teal: "bg-teal-50 text-teal-600",
  };

  if (loading) {
    return (
      <Card className="bg-white">
        <CardBody className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
      <CardBody className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <Typography variant="small" className="font-medium text-gray-500 mb-1">
              {title}
            </Typography>
            <Typography variant="h4" className="font-bold text-gray-800">
              {formatValue(value, format)}
            </Typography>
          </div>
          {icon && (
            <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
              {icon}
            </div>
          )}
        </div>

        {change !== null && change !== undefined && (
          <div className={`flex items-center gap-1 mt-3 ${getChangeColor()}`}>
            {getChangeIcon()}
            <Typography variant="small" className="font-medium">
              {change > 0 ? "+" : ""}
              {change.toFixed(1)}%
            </Typography>
            <Typography variant="small" className="text-gray-500">
              {changeLabel}
            </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

export default KPICard;