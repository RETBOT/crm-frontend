import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  MapIcon,
  Cog6ToothIcon,
  CubeIcon,

} from "@heroicons/react/24/solid";
import { Home, Accounts, Prospects, Activities, Contacts, Opportunities, Reports, Maps, Admin, Products } from "@/pages/dashboard";
import { SignIn, SignUp, ForgotPassword } from "@/pages/auth";


const icon = {
  className: "w-5 h-5 text-inherit",
};

export const rSidenavoutes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "Inicio",
        path: "/home",
        element: <Home />,
      },
      //import { Home, Accounts, Activities, Contacts, Opportunities, Reports ,
      // cuentas
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Clientes",
        path: "/accounts",
        element: <Accounts />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Prospectos",
        path: "/prospects",
        element: <Prospects />,
      },
      // Maps
      {
        icon: <MapIcon {...icon} />,
        name: "Mapa",
        path: "/map",
        element: <Maps />,
      },
      // actividades
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "Actividades",
        path: "/activities",
        element: <Activities />,
      },
      // contactos
      {
        icon: <UserCircleIcon  {...icon} />,
        name: "Contactos",
        path: "/contacts",
        element: <Contacts />,
      },
      // oportunidades
      {
        icon: <ServerStackIcon  {...icon} />,
        name: "Oportunidades",
        path: "/opportunities",
        element: <Opportunities />,
      },
      // productos
      {
        icon: <CubeIcon {...icon} />,
        name: "Productos",
        path: "/products",
        element: <Products />,
      },
      // reports
      {
        icon: <TableCellsIcon  {...icon} />,
        name: "Reportes",
        path: "/reports",
        element: <Reports />,
        requiredPermissions: ["reports.view"],
      },
      {
        icon: <Cog6ToothIcon {...icon} />,
        name: "Administracion",
        path: "/admin",
        element: <Admin />,
        requiredPermissions: ["users.manage", "roles.manage", "scope.manage"],
      },
    ],
  },
];


export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      // cuentas
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "accounts",
        path: "/accounts",
        element: <Accounts />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "Prospectos",
        path: "/prospects",
        element: <Prospects />,
      },
      // Maps
      {
        icon: <MapIcon {...icon} />,
        name: "Mapa",
        path: "/map",
        element: <Maps />,
      },
      // actividades
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "activities",
        path: "/activities",
        element: <Activities />,
      },
      // contactos
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "contacts",
        path: "/contacts",
        element: <Contacts />,
      },
      // oportunidades
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "opportunities",
        path: "/opportunities",
        element: <Opportunities />,
      },
      // productos
      {
        icon: <CubeIcon {...icon} />,
        name: "products",
        path: "/products",
        element: <Products />,
      },
      // reports
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "reports",
        path: "/reports",
        element: <Reports />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "admin",
        path: "/admin",
        element: <Admin />,
        requiredPermissions: ["users.manage", "roles.manage", "scope.manage"],
      },
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "profile",
      //   path: "/profile",
      //   element: <Profile />,
      // },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "forgot password",
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
    ],
  },

];

export default routes;
