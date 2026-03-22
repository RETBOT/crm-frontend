import { useLocation, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Breadcrumbs,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  BellIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import {
  useMaterialTailwindController,
  setOpenSidenav,
} from "@/context";
import { useNotifications } from "@/context/notifications";
import { logout } from "@/utils/auth";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar, openSidenav } = controller;
  const { pathname } = useLocation();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");
  const name = localStorage.getItem("dsc") || "Invitado";
  const notifications = useNotifications();

  const nCount = notifications?.count || 0;
  const nItems = notifications?.items || [];
  const nOpen = notifications?.open || false;

  const typeStyles = {
    assigned: { color: "border-l-blue-500", icon: <BellIcon className="h-4 w-4 text-blue-500" /> },
    due_soon: { color: "border-l-yellow-500", icon: <ClockIcon className="h-4 w-4 text-yellow-500" /> },
    overdue: { color: "border-l-red-500", icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-500" /> },
  };

  function relativeTime(dateStr) {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Ahora";
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
  }

  
  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`rounded-xl transition-all ${
        fixedNavbar
          ? "sticky top-4 z-40 py-3 shadow-md shadow-blue-gray-500/5"
          : "px-0 py-1"
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex flex-col-reverse justify-between gap-6 md:flex-row md:items-center">
        <div className="capitalize">
          <Breadcrumbs
            className={`bg-transparent p-0 transition-all ${
              fixedNavbar ? "mt-1" : ""
            }`}
          >
            <Link to={`/${layout}`}>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal opacity-50 transition-all hover:text-blue-500 hover:opacity-100"
              >
                {layout}
              </Typography>
            </Link>
            <Typography
              variant="small"
              color="blue-gray"
              className="font-normal"
            >
              {page}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h6" color="blue-gray">
            {page}
          </Typography>
        </div>
        <div className="flex items-center">
          <div className="mr-auto md:mr-4 md:w-56">
          </div>
          <IconButton
            variant="text"
            color="blue-gray"
            className="grid xl:hidden"
            onClick={() => setOpenSidenav(dispatch, !openSidenav)}
          >
            <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
          </IconButton>
          <Menu>
            <MenuHandler>
              <Button
              variant="text"
              color="blue-gray"
              className="hidden items-center gap-1 px-4 xl:flex normal-case"
              >
              <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
              <span className="text-sm font-normal">{name}</span>
            </Button>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3">
                 {/** Cerrar sesión */}
                <Button
                  variant="text"
                  color="blue"
                  className="w-full"
                  onClick={() => {
                    logout();
                    window.location.href = "/auth/sign-in"; // Redirige a la página de inicio
                  }}
                >
                  <div className="flex items-center gap-2">
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-normal">Cerrar sesión</span>
                  </div>
                </Button>
              </MenuItem>
            </MenuList>
          </Menu>

          <div className="relative">
            <IconButton
              variant="text"
              color="blue-gray"
              onClick={notifications?.toggle}
            >
              <BellIcon className="h-5 w-5 text-blue-gray-500" />
              {nCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {nCount > 9 ? "9+" : nCount}
                </span>
              )}
            </IconButton>

            {nOpen && (
              <div className="absolute right-0 top-12 z-50 w-80 max-h-96 overflow-y-auto rounded-lg border bg-white shadow-xl">
                <div className="flex items-center justify-between border-b p-3">
                  <span className="text-sm font-semibold">Notificaciones</span>
                  {nCount > 0 && (
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={notifications?.markAll}
                    >
                      Marcar todas como leidas
                    </button>
                  )}
                </div>

                {nItems.length === 0 ? (
                  <div className="p-4 text-center text-sm text-gray-400">
                    No tienes notificaciones
                  </div>
                ) : (
                  nItems.map((n) => {
                    const style = typeStyles[n.type] || typeStyles.assigned;
                    return (
                      <div
                        key={n.notification_id}
                        className={`border-b border-l-4 ${style.color} ${
                          n.is_read ? "bg-white" : "bg-blue-50"
                        } cursor-pointer p-3 hover:bg-gray-50`}
                        onClick={() => {
                          if (!n.is_read) notifications?.markRead(n.notification_id);
                        }}
                      >
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5">{style.icon}</div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${n.is_read ? "font-normal" : "font-semibold"}`}>
                              {n.title}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{n.message}</p>
                            {n.subject && (
                              <p className="text-xs text-gray-400 mt-0.5 truncate">
                                {n.customer_name && `${n.customer_name} - `}{n.subject}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">{relativeTime(n.created_at)}</p>
                          </div>
                          {!n.is_read && (
                            <span className="mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Navbar>
  );
}

DashboardNavbar.displayName = "/src/widgets/layout/dashboard-navbar.jsx";

export default DashboardNavbar;
