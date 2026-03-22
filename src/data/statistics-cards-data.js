import {
  ShoppingBagIcon,
  ChartBarIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";

export const statisticsCardsData = [
  {
    color: "blue",
    icon: ShoppingBagIcon,
    title: "Ventas Mes Actual",
    value: "$124,850.00",
    footer: {
      color: "text-green-500",
      value: "+12%",
      label: "vs mes anterior",
    },
  },
  {
    color: "orange",
    icon: ChartBarIcon,
    title: "Meta de Ventas",
    value: "78%",
    footer: {
      color: "text-green-500",
      value: "8% faltante",
      label: "para cumplir meta",
    },
  },
  {
    color: "green",
    icon: CheckCircleIcon,
    title: "Oportunidades Ganadas",
    value: "24",
    footer: {
      color: "text-red-500",
      value: "+3",
      label: "vs mes pasado",
    },
  },
  {
    color: "purple",
    icon: UserGroupIcon,
    title: "Clientes Nuevos",
    value: "9",
    footer: {
      color: "text-green-500",
      value: "15%",
      label: "tasa de crecimiento",
    },
  },
];

export default statisticsCardsData;
