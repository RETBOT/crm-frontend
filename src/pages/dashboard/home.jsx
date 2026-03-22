import React from "react";
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
  Tooltip,
  Progress,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  ArrowUpIcon,
  
} from "@heroicons/react/24/outline";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import {
  statisticsCardsData,
  statisticsChartsData,
  projectsTableData,
  oportunidadesComerciales,
  actividadesRecientes,
} from "@/data";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

export function Home() {
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

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
       
        {statisticsCardsData.map(({ icon, title, footer, ...rest }) => (
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
        {statisticsChartsData.map((props) => (
          <StatisticsChart
            key={props.title}
            {...props}
            footer={
              <Typography
                variant="small"
                className="flex items-center font-normal text-blue-gray-600"
              >
                <ClockIcon strokeWidth={2} className="h-4 w-4 text-blue-gray-400" />
                &nbsp;{props.footer}
              </Typography>
            }
          />
        ))}
      </div>
      <div className="mb-4 grid grid-cols-1 gap-6 xl:grid-cols-3">
  {/* Tarjeta de Oportunidades Comerciales */}
  <Card className="overflow-hidden xl:col-span-2 border border-blue-gray-100 shadow-sm">
    <CardHeader
      floated={false}
      shadow={false}
      color="transparent"
      className="m-0 flex items-center justify-between p-6"
    >
      <div>
        <Typography variant="h6" color="blue-gray" className="mb-1">
          Oportunidades
        </Typography>
        <Typography
          variant="small"
          className="flex items-center gap-1 font-normal text-blue-gray-600"
        >
          <CheckCircleIcon strokeWidth={3} className="h-4 w-4 text-blue-gray-200" />
          <strong>12 cerradas</strong> este mes
        </Typography>
      </div>
      <Menu placement="left-start">
        <MenuHandler>
          <IconButton size="sm" variant="text" color="blue-gray">
            <EllipsisVerticalIcon
              strokeWidth={3}
              fill="currentColor"
              className="h-6 w-6"
            />
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
            {["Cliente", "Producto", "Valor", "Etapa", "Progreso"].map(
              (el) => (
                <th
                  key={el}
                  className="border-b border-blue-gray-50 py-3 px-6 text-left"
                >
                  <Typography
                    variant="small"
                    className="text-[11px] font-medium uppercase text-blue-gray-400"
                  >
                    {el}
                  </Typography>
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {oportunidadesComerciales.map(
            ({ cliente, producto, valor, etapa, progreso }, key) => {
              const className = `py-3 px-5 ${
                key === oportunidadesComerciales.length - 1
                  ? ""
                  : "border-b border-blue-gray-50"
              }`;

              return (
                <tr key={cliente}>
                  <td className={className}>
                    <div className="flex items-center gap-4">
                      <Avatar 
                        src={`https://ui-avatars.com/api/?name=${cliente.charAt(0)}&background=random`} 
                        alt={cliente} 
                        size="sm" 
                      />
                      <Typography
                        variant="small"
                        color="blue-gray"
                        className="font-bold"
                      >
                        {cliente}
                      </Typography>
                    </div>
                  </td>
                  <td className={className}>
                    <Typography
                      variant="small"
                      className="text-xs font-medium text-blue-gray-600"
                    >
                      {producto}
                    </Typography>
                  </td>
                  <td className={className}>
                    <Typography
                      variant="small"
                      className="text-xs font-medium text-blue-gray-600"
                    >
                      {valor}
                    </Typography>
                  </td>
                  <td className={className}>
                    <Typography
                      variant="small"
                      className="text-xs font-medium text-blue-gray-600"
                    >
                      {etapa}
                    </Typography>
                  </td>
                  <td className={className}>
                    <div className="w-10/12">
                      <Typography
                        variant="small"
                        className="mb-1 block text-xs font-medium text-blue-gray-600"
                      >
                        {progreso}%
                      </Typography>
                      <Progress
                        value={progreso}
                        variant="gradient"
                        color={
                          progreso < 30 ? "red" : 
                          progreso < 70 ? "amber" : "green"
                        }
                        className="h-1"
                      />
                    </div>
                  </td>
                </tr>
              );
            }
          )}
        </tbody>
      </table>
    </CardBody>
  </Card>

  {/* Tarjeta de Resumen de Actividades */}
  <Card className="border border-blue-gray-100 shadow-sm">
    <CardHeader
      floated={false}
      shadow={false}
      color="transparent"
      className="m-0 p-6"
    >
      <Typography variant="h6" color="blue-gray" className="mb-2">
        Actividades Recientes
      </Typography>
      <Typography
        variant="small"
        className="flex items-center gap-1 font-normal text-blue-gray-600"
      >
        <ArrowUpIcon
          strokeWidth={3}
          className="h-3.5 w-3.5 text-green-500"
        />
        <strong>18%</strong> más que el mes pasado
      </Typography>
    </CardHeader>
    <CardBody className="pt-0">
      {actividadesRecientes.map(
        ({ icon, color, titulo, descripcion }, key) => (
          <div key={titulo} className="flex items-start gap-4 py-3">
            <div
              className={`relative p-1 after:absolute after:-bottom-6 after:left-2/4 after:w-0.5 after:-translate-x-2/4 after:bg-blue-gray-50 after:content-[''] ${
                key === actividadesRecientes.length - 1
                  ? "after:h-0"
                  : "after:h-4/6"
              }`}
            >
              {React.createElement(icon, {
                className: `!w-5 !h-5 ${color}`,
              })}
            </div>
            <div>
              <Typography
                variant="small"
                color="blue-gray"
                className="block font-medium"
              >
                {titulo}
              </Typography>
              <Typography
                as="span"
                variant="small"
                className="text-xs font-medium text-blue-gray-500"
              >
                {descripcion}
              </Typography>
            </div>
          </div>
        )
      )}
    </CardBody>
  </Card>
</div>
    </div>
  );
}

export default Home;
