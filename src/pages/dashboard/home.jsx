import React, { useEffect, useMemo, useState } from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/solid";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { chartsConfig } from "@/configs";
import { getDashboardHome, getOverdueActivities } from "../../api/dashboard";

function toCurrency(amount) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));
}

function toPctText(value) {
  const numeric = Number(value || 0);
  const rounded = Math.abs(numeric).toFixed(1);
  return `${numeric >= 0 ? "+" : "-"}${rounded}%`;
}

function relativeDateText(isoDate) {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "Fecha no disponible";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);

  if (hours < 24) return `Hace ${Math.max(hours, 1)}h`;
  if (days < 7) return `Hace ${days}d`;

  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
  });
}

function activityVisual(status, activityType) {
  if (status === "Completada") {
    return { icon: CheckCircleIcon, color: "text-green-500" };
  }
  if (status === "Cancelada") {
    return { icon: ExclamationCircleIcon, color: "text-red-500" };
  }
  if (activityType === "Tarea") {
    return { icon: ClipboardDocumentCheckIcon, color: "text-indigo-500" };
  }
  return { icon: ClockIcon, color: "text-blue-500" };
}

export function Home() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);
  const [overdue, setOverdue] = useState({ count: 0, items: [] });

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [response, overdueData] = await Promise.all([
          getDashboardHome(),
          getOverdueActivities().catch(() => ({ count: 0, items: [] })),
        ]);
        if (mounted) {
          setData(response);
          setOverdue(overdueData);
        }
      } catch (err) {
        if (mounted) setError(err.message || "No se pudo cargar el dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statisticsCardsData = useMemo(() => {
    const cards = data?.cards || {};
    return [
      {
        color: "blue",
        icon: ShoppingBagIcon,
        title: "Ventas Mes Actual",
        value: toCurrency(cards.salesCurrent || 0),
        footer: {
          color: Number(cards.salesPctDelta || 0) >= 0 ? "text-green-500" : "text-red-500",
          value: toPctText(cards.salesPctDelta || 0),
          label: "vs mes anterior",
        },
      },
      {
        color: "orange",
        icon: ChartBarIcon,
        title: "Meta de Ventas",
        value: `${Math.round(Number(cards.salesGoalPct || 0))}%`,
        footer: {
          color: "text-blue-gray-500",
          value: toCurrency(cards.salesGoalRemaining || 0),
          label: "faltante para meta",
        },
      },
      {
        color: "green",
        icon: CheckCircleIcon,
        title: "Oportunidades Ganadas",
        value: String(cards.wonCurrent || 0),
        footer: {
          color: Number(cards.wonDelta || 0) >= 0 ? "text-green-500" : "text-red-500",
          value: `${Number(cards.wonDelta || 0) >= 0 ? "+" : ""}${cards.wonDelta || 0}`,
          label: "vs mes pasado",
        },
      },
      {
        color: "purple",
        icon: UserGroupIcon,
        title: "Clientes Nuevos",
        value: String(cards.newClientsCurrent || 0),
        footer: {
          color: Number(cards.newClientsPctDelta || 0) >= 0 ? "text-green-500" : "text-red-500",
          value: toPctText(cards.newClientsPctDelta || 0),
          label: "variación mensual",
        },
      },
    ];
  }, [data]);

  const statisticsChartsData = useMemo(() => {
    const charts = data?.charts || {};
    return [
      {
        color: "white",
        title: "Tendencia de Ventas",
        description: "Ventas ganadas últimos 6 meses",
        footer: "Actualizado en tiempo real",
        chart: {
          type: "bar",
          height: 220,
          series: [{ name: "Ventas", data: charts.salesTrend?.values || [] }],
          options: {
            ...chartsConfig,
            colors: "#2563EB",
            plotOptions: { bar: { columnWidth: "16%", borderRadius: 5 } },
            xaxis: {
              ...chartsConfig.xaxis,
              categories: charts.salesTrend?.labels || [],
            },
          },
        },
      },
      {
        color: "white",
        title: "Oportunidades por Estatus",
        description: "Abiertas, ganadas y perdidas",
        footer: "Filtrado por tu alcance de datos",
        chart: {
          type: "line",
          height: 220,
          series: [{ name: "Oportunidades", data: charts.opportunitiesStatus?.values || [] }],
          options: {
            ...chartsConfig,
            colors: ["#0EA5E9"],
            stroke: { lineCap: "round" },
            markers: { size: 5 },
            xaxis: {
              ...chartsConfig.xaxis,
              categories: charts.opportunitiesStatus?.labels || [],
            },
          },
        },
      },
      {
        color: "white",
        title: "Actividades por Estatus",
        description: "Pendientes, programadas y completadas",
        footer: "Vista según rutas/sucursales permitidas",
        chart: {
          type: "line",
          height: 220,
          series: [{ name: "Actividades", data: charts.activitiesStatus?.values || [] }],
          options: {
            ...chartsConfig,
            colors: ["#16A34A"],
            stroke: { lineCap: "round" },
            markers: { size: 5 },
            xaxis: {
              ...chartsConfig.xaxis,
              categories: charts.activitiesStatus?.labels || [],
            },
          },
        },
      },
    ];
  }, [data]);

  const opportunities = data?.opportunities || [];
  const recentActivities = data?.recentActivities || [];

  return (
    <div className="mt-12">
      <div className="mb-8">
        <Typography variant="h2" color="blue-gray" className="mb-2">
          Panel de Control
        </Typography>
        <Typography variant="lead" className="text-blue-gray-600">
          Resumen comercial y actividades recientes
        </Typography>
      </div>

      {error && (
        <Card className="mb-6 border border-red-200 bg-red-50 shadow-sm">
          <CardBody>
            <Typography color="red">{error}</Typography>
          </CardBody>
        </Card>
      )}

      {!loading && overdue.count > 0 && (
        <Card className="mb-6 border border-red-200 bg-red-50 shadow-sm">
          <CardBody className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
                <Typography variant="h6" color="red" className="font-bold">
                  {overdue.count} {overdue.count === 1 ? "actividad vencida" : "actividades vencidas"}
                </Typography>
              </div>
              <a
                href="/dashboard/activities?status=VENCIDA"
                className="text-sm text-red-600 font-medium hover:text-red-800 underline"
              >
                Ver todas
              </a>
            </div>
            <div className="space-y-2">
              {overdue.items.slice(0, 5).map((item) => (
                <div
                  key={item.activity_id}
                  className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100"
                >
                  <div>
                    <p className="font-medium text-sm">{item.subject}</p>
                    <p className="text-xs text-gray-500">{item.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                      {item.days_overdue}d vencida
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(item.due_at).toLocaleDateString("es-MX", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
        {(loading ? [] : statisticsCardsData).map(({ icon, title, footer, ...rest }) => (
          <StatisticsCard
            key={title}
            {...rest}
            title={title}
            icon={React.createElement(icon, {
              className: "w-6 h-6 text-white",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600">
                <strong className={footer.color}>{footer.value}</strong>
                &nbsp;{footer.label}
              </Typography>
            }
          />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-y-12 gap-x-6 md:grid-cols-2 xl:grid-cols-3">
        {(loading ? [] : statisticsChartsData).map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography variant="small" className="flex items-center font-normal text-blue-gray-600">
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>

      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 flex items-center justify-between p-6">
            <div>
              <Typography variant="h6" color="blue-gray" className="mb-1">
                Oportunidades
              </Typography>
              <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
                <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
                <strong>{opportunities.length}</strong> visibles para tu alcance
              </Typography>
            </div>
            <Menu placement="left-start">
              <MenuHandler>
                <IconButton size="sm" variant="text" color="blue-gray">
                  <EllipsisVerticalIcon strokeWidth={3} fill="currentColor" className="h-6 w-6" />
                </IconButton>
              </MenuHandler>
              <MenuList>
                <MenuItem>Exportar a Excel</MenuItem>
                <MenuItem>Filtrar por vendedor</MenuItem>
                <MenuItem>Ver todas</MenuItem>
              </MenuList>
            </Menu>
          </CardHeader>
          <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr>
                  {["Cliente", "Producto", "Valor", "Etapa", "Progreso"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-6 text-left">
                      <Typography variant="small" className="text-[11px] font-medium uppercase text-blue-gray-400">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {opportunities.map(({ cliente, producto, valor, etapa, progreso }, key) => {
                  const className = `py-3 px-5 ${
                    key === opportunities.length - 1 ? "" : "border-b border-blue-gray-50"
                  }`;

                  return (
                    <tr key={`${cliente}-${key}`}>
                      <td className={className}>
                        <div className="flex items-center gap-4">
                          <Avatar
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent((cliente || "C").charAt(0))}&background=random`}
                            alt={cliente}
                            size="sm"
                          />
                          <Typography variant="small" color="blue-gray" className="font-bold">
                            {cliente}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                          {producto}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                          {toCurrency(valor)}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-xs font-medium text-blue-gray-600">
                          {etapa}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="w-10/12">
                          <Typography variant="small" className="mb-1 block text-xs font-medium text-blue-gray-600">
                            {progreso}%
                          </Typography>
                          <Progress
                            value={progreso}
                            variant="gradient"
                            color={progreso < 30 ? "red" : progreso < 70 ? "amber" : "green"}
                            className="h-1"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {!loading && opportunities.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 px-5 text-center text-sm text-blue-gray-500">
                      No hay oportunidades para mostrar con tu alcance actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardBody>
        </Card>

        <Card className="border border-blue-gray-100 shadow-sm">
          <CardHeader floated={false} shadow={false} color="transparent" className="m-0 p-6">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Actividades Recientes
            </Typography>
            <Typography variant="small" className="flex items-center gap-1 font-normal text-blue-gray-600">
              <ArrowUpIcon strokeWidth={3} className="h-3.5 w-3.5 text-green-500" />
              <strong>{recentActivities.length}</strong> actividades visibles
            </Typography>
          </CardHeader>
          <CardBody className="pt-0">
            {recentActivities.map((activity, key) => {
              const visual = activityVisual(activity.status, activity.activity_type_code);
              return (
                <div key={`${activity.titulo}-${key}`} className="flex items-start gap-4 py-3">
                  <div
                    className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                      key === recentActivities.length - 1 ? "after:h-0" : "after:h-4/6"
                    }`}
                  >
                    {React.createElement(visual.icon, {
                      className: `!w-5 !h-5 ${visual.color}`,
                    })}
                  </div>
                  <div>
                    <Typography variant="small" color="blue-gray" className="block font-medium">
                      {activity.titulo}
                    </Typography>
                    <Typography as="span" variant="small" className="text-xs font-medium text-blue-gray-500">
                      {activity.descripcion} - {relativeDateText(activity.fecha)}
                    </Typography>
                  </div>
                </div>
              );
            })}

            {!loading && recentActivities.length === 0 && (
              <Typography variant="small" className="text-blue-gray-500">
                No hay actividades recientes para mostrar.
              </Typography>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

export default Home;
