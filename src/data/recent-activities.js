import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, ClipboardDocumentCheckIcon} from "@heroicons/react/24/solid";

export const actividadesRecientes = [
  {
    icon: CheckCircleIcon,
    color: "text-green-500",
    titulo: "Pedido confirmado",
    descripcion: "SUMITOMO - $15,200 (Película Stretch)",
    fecha: "Hoy 09:30"
  },
  {
    icon: ClockIcon,
    color: "text-blue-500",
    titulo: "Seguimiento programado",
    descripcion: "WHIRLPOOL - Mañana 11:00",
    fecha: "Hoy 14:15"
  },
  {
    icon: ExclamationCircleIcon,
    color: "text-red-500",
    titulo: "Cotización vencida",
    descripcion: "BADAFI- $8,750 (Burbuja de Aire)",
    fecha: "Ayer 16:45"
  },
  {
    icon: CheckCircleIcon,
    color: "text-green-500",
    titulo: "Cliente nuevo registrado",
    descripcion: "ARNECOM",
    fecha: "Ayer 10:20"
  },
  {
    icon: ClipboardDocumentCheckIcon,
    color: "text-purple-500",
    titulo: "Reunión de seguimiento",
    descripcion: "KAWASAKI - Resultados positivos",
    fecha: "15 Jun 13:00"
  }
];

export default actividadesRecientes;