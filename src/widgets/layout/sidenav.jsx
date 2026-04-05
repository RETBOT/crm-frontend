import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, ArrowLeftOnRectangleIcon, UserCircleIcon } from "@heroicons/react/24/outline";

import {
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";

import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import { hasAnyPermission } from "@/utils/auth";
import { logout } from "@/utils/auth";
import banner from "/img/RETFlow.png";

const rutaServer = import.meta.env.VITE_RUTA_SERVER;

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const name = localStorage.getItem("dsc") || "Invitado";

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <>
      {/* Sidenav Panel */}
      <aside
        className={`${sidenavTypes[sidenavType]} ${
          openSidenav ? "translate-x-0" : "-translate-x-80"
        } fixed inset-y-4 left-4 z-[9999] flex flex-col h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
      >
        <div className="relative">
          <Link to="/" className="py-6 px-8 text-center">
            <img
              src={rutaServer + banner}
              alt="logo"
              className="mx-auto mb-4 w-32 sm:w-40 md:w-48 lg:w-52 xl:w-64 p-5"
            />
          </Link>
        </div>

        <div className="m-4 flex-1 overflow-y-auto">
          {routes.map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
                <li className="mx-3.5 mt-4 mb-2">
                  <Typography
                    variant="small"
                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                    className="font-black uppercase opacity-75"
                  >
                    {title}
                  </Typography>
                </li>
              )}

              {pages
                .filter((page) => hasAnyPermission(page.requiredPermissions))
                .map(({ icon, name, path }) => (
                  <li key={name}>
                    <NavLink to={`/${layout}${path}`}>
                      {({ isActive }) => (
                        <Button
                          variant={isActive ? "filled" : "text"}
                          color={isActive ? "blue" : sidenavType === "dark" ? "white" : "blue-gray"}
                          className={`flex items-center gap-4 px-4 capitalize ${
                            isActive ? "bg-blue-600 text-white" : ""
                          }`}
                          fullWidth
                          onClick={() => {
                            if (window.innerWidth < 1280) {
                              setOpenSidenav(dispatch, false);
                            }
                          }}
                        >
                          {icon}
                          <Typography color="inherit" className="font-medium capitalize">
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  </li>
                ))}
            </ul>
          ))}
        </div>

        {/* User section at bottom - visible on mobile, hidden on xl+ */}
        <div className="border-t border-blue-gray-100 p-4 xl:hidden">
          <div className="flex items-center gap-2 mb-3">
            <UserCircleIcon className="h-6 w-6 text-blue-gray-500" />
            <Typography variant="small" className="font-medium text-blue-gray-700 truncate">
              {name}
            </Typography>
          </div>
          <Button
            variant="text"
            color="blue"
            className="w-full justify-start normal-case"
            onClick={() => {
              logout();
              window.location.href = "/auth/sign-in";
            }}
          >
            <div className="flex items-center gap-2">
              <ArrowLeftOnRectangleIcon className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-normal">Cerrar sesión</span>
            </div>
          </Button>
        </div>
      </aside>

      {/* Fixed Close Button */}
      {openSidenav && (
        <IconButton
          variant="text"
          color="blue-gray"
          className="fixed top-6 left-[255px] z-[60] xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
        </IconButton>
      )}
    </>
  );
}


Sidenav.defaultProps = {
  brandImg: "/img/RETFlow.png",
  brandName: "RETFlow",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidenav.jsx";

export default Sidenav;
