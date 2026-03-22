import React, { useState } from "react";
import { FiCalendar, FiClock, FiUser, FiPhone, FiMail, FiCheckCircle, FiAlertCircle, FiPlus } from "react-icons/fi";

const activities = [
  {
    id: 1,
    type: "Llamada",
    subject: "Seguimiento con SUMITOMO - Pedido de película stretch",
    relatedTo: "SUMITOMO ELECTRIC, INC",
    contact: "FRANCISCO FAVELA",
    date: "2025-07-15",
    time: "10:00",
    status: "Pendiente",
    priority: "Alta",
    notes: "Confirmar cantidad y especificaciones del pedido de película stretch",
    responsible: "1 LAGUNA"
  },
  {
    id: 2,
    type: "Reunión",
    subject: "Demostración de nueva máquina flejadora",
    relatedTo: "WHIRLPOOL INTERNACIONAL",
    contact: "LUISSANA MARROQUÍN",
    date: "2025-07-16",
    time: "14:00",
    status: "Programada",
    priority: "Media",
    notes: "Llevar muestras de fleje de poliéster y PP",
    responsible: "1 SALTILLO"
  },
  {
    id: 3,
    type: "Correo",
    subject: "Envío de cotización de cajas de cartón corrugado",
    relatedTo: "NIPPON STEEL PIPE MEXICO",
    contact: "TAMARA BEJARANO",
    date: "2025-07-17",
    time: "09:00",
    status: "Completada",
    priority: "Alta",
    notes: "Incluir descuento por volumen en pedidos mayores a 1000 piezas",
    responsible: "DISPONIBLE QUERETARO"
  },
  {
    id: 4,
    type: "Visita",
    subject: "Evaluación de necesidades de empaque en planta",
    relatedTo: "BADAFI",
    contact: "JESUS SANTIBANEZ",
    date: "2025-07-18",
    time: "11:30",
    status: "Pendiente",
    priority: "Alta",
    notes: "Analizar requerimientos de protección para exportación",
    responsible: "3 MONTERREY"
  }
];

const statusStyles = {
  "Pendiente": "bg-yellow-100 text-yellow-800",
  "Programada": "bg-blue-100 text-blue-800",
  "Completada": "bg-green-100 text-green-800",
  "Cancelada": "bg-red-100 text-red-800"
};

const priorityStyles = {
  "Alta": "text-red-600",
  "Media": "text-yellow-600",
  "Baja": "text-gray-600"
};

export function Activities() {
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = activeFilter === "Todas" || activity.status === activeFilter;
    const matchesSearch = activity.subject.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         activity.relatedTo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const statusOptions = ["Todas", "Pendiente", "Programada", "Completada", "Cancelada"];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Actividades </h1>
        <p className="text-gray-600 mb-6">Gestión de tareas, llamadas, correos y reuniones relacionadas con clientes</p>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar actividades por asunto o cliente..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0">
              {statusOptions.map(option => (
                <button
                  key={option}
                  className={`px-3 py-1 rounded-full text-sm whitespace-nowrap ${
                    activeFilter === option 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  onClick={() => setActiveFilter(option)}
                >
                  {option}
                </button>
              ))}
            </div>
            
            <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap">
              <FiPlus className="mr-1" /> Nueva Actividad
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3 min-w-[120px]">Tipo</th>
                  <th className="px-4 py-3 min-w-[250px]">Asunto</th>
                  <th className="px-4 py-3 min-w-[150px]">Relacionado con</th>
                  <th className="px-4 py-3 min-w-[120px]">Fecha/Hora</th>
                  <th className="px-4 py-3 min-w-[120px]">Responsable</th>
                  <th className="px-4 py-3 min-w-[120px]">Prioridad</th>
                  <th className="px-4 py-3 min-w-[120px]">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivities.map((activity) => (
                  <tr 
                    key={activity.id} 
                    className={`border-t hover:bg-blue-50 cursor-pointer ${
                      selectedActivity?.id === activity.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedActivity(activity)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {activity.type === "Llamada" && <FiPhone className="mr-2 text-blue-500" />}
                        {activity.type === "Reunión" && <FiUser className="mr-2 text-green-500" />}
                        {activity.type === "Correo" && <FiMail className="mr-2 text-purple-500" />}
                        {activity.type === "Visita" && <FiUser className="mr-2 text-orange-500" />}
                        {activity.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{activity.subject}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{activity.relatedTo}</div>
                      <div className="text-sm text-gray-500">{activity.contact}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <FiCalendar className="mr-1 text-gray-400" />
                        <span className="mr-2">{activity.date}</span>
                        <FiClock className="mr-1 text-gray-400" />
                        <span>{activity.time}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{activity.responsible}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${priorityStyles[activity.priority]}`}>
                        {activity.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[activity.status]}`}>
                        {activity.status === "Completada" && <FiCheckCircle className="mr-1" />}
                        {activity.status === "Pendiente" && <FiAlertCircle className="mr-1" />}
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {selectedActivity && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Detalles de la Actividad
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedActivity(null)}
              >
                Cerrar
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Información Principal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tipo</label>
                    <p className="mt-1 font-medium">{selectedActivity.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Asunto</label>
                    <p className="mt-1 font-medium">{selectedActivity.subject}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Relacionado con</label>
                    <p className="mt-1">{selectedActivity.relatedTo}</p>
                    <p className="text-sm text-gray-500">{selectedActivity.contact}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Detalles</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Fecha</label>
                      <p className="mt-1">{selectedActivity.date}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Hora</label>
                      <p className="mt-1">{selectedActivity.time}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Responsable</label>
                    <p className="mt-1">{selectedActivity.responsible}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Prioridad</label>
                      <p className={`mt-1 font-medium ${priorityStyles[selectedActivity.priority]}`}>
                        {selectedActivity.priority}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Estado</label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyles[selectedActivity.status]}`}>
                          {selectedActivity.status}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Notas</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-line">{selectedActivity.notes}</p>
                </div>
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-3">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Editar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {selectedActivity.status === "Completada" ? "Reabrir" : "Marcar como completada"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Activities;