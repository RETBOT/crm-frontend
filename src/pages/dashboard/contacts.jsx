import React, { useState } from "react";
import { FiUser, FiPhone, FiMail, FiBriefcase, FiSearch, FiFilter, FiPlus } from "react-icons/fi";

const contacts = [
  {
    id: 1,
    name: "FRANCISCO FAVELA",
    position: "Gerente de Compras",
    email: "francisco.favela@sewsus.com.mx",
    phone: "871 730-79-40 Ext.1312",
    mobile: "N/A",
    company: "SUMITOMO ELECTRIC WIRING SYSTEMS, INC.",
    department: "COMPRAS",
    clientSince: "2018",
    notes: "Prefiere contacto por las mañanas. Interesado en soluciones de flejado automático."
  },
  {
    id: 2,
    name: "LUISSANA MARROQUÍN",
    position: "Sourcing Operations Buyer",
    email: "luissana_marroquin_jinzai@whirlpool.com",
    phone: "8448664585",
    mobile: "N/A",
    company: "WHIRLPOOL INTERNACIONAL",
    department: "COMPRAS",
    clientSince: "2020",
    notes: "Contacto clave para negociaciones de volumen. Preguntar por nuevos proyectos de exportación."
  },
  {
    id: 3,
    name: "TAMARA BEJARANO",
    position: "Supervisor de Almacén",
    email: "bejarano.tamara@npm.com.mx",
    phone: "01472 7489052",
    mobile: "55 7654 3210",
    company: "NIPPON STEEL PIPE MEXICO S.A DE C.V",
    department: "OPERACIONES",
    clientSince: "2019",
    notes: "Encargado de recepción de materiales. Buen contacto para feedback sobre productos."
  },
  {
    id: 4,
    name: "JESUS SANTIBANEZ",
    position: "Ingeniera de Empaque",
    email: "jesus.santibanez@badafi.com",
    phone: "55 4567 8901",
    mobile: "55 6543 2109",
    company: "BADAFI",
    department: "INGENIERÍA",
    clientSince: "2021",
    notes: "Especialista en diseño de empaques. Consultar sobre requerimientos técnicos."
  }
];

export function Contacts() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [activeFilter, setActiveFilter] = useState("Todos");
  const [companyFilter, setCompanyFilter] = useState("Todos");

  const companyOptions = ["Todos", ...new Set(contacts.map(c => c.company))];

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         contact.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCompany = companyFilter === "Todos" || contact.company === companyFilter;
    return matchesSearch && matchesCompany;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Contactos</h1>
        <p className="text-gray-600 mb-6">Relación detallada de contactos registrados para los diferentes clientes</p>
        
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar contactos por nombre o empresa..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                >
                  {companyOptions.map(company => (
                    <option key={company} value={company}>{company}</option>
                  ))}
                </select>
              </div>
              
              <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 whitespace-nowrap">
                <FiPlus className="mr-1" /> Nuevo Contacto
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3 min-w-[180px]">Nombre</th>
                  <th className="px-4 py-3 min-w-[150px]">Cargo/Departamento</th>
                  <th className="px-4 py-3 min-w-[200px]">Contacto</th>
                  <th className="px-4 py-3 min-w-[180px]">Empresa</th>
                  <th className="px-4 py-3 min-w-[100px]">Cliente desde</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id} 
                    className={`border-t hover:bg-blue-50 cursor-pointer ${
                      selectedContact?.id === contact.id ? "bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <FiUser className="mr-2 text-blue-500" />
                        <div>
                          <div className="font-medium">{contact.name}</div>
                          <div className="text-sm text-gray-500">{contact.position}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{contact.position}</div>
                      <div className="text-sm text-gray-500">{contact.department}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <FiPhone className="mr-2 text-green-500" />
                        <span className="mr-3">{contact.phone}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <FiMail className="mr-2 text-purple-500" />
                        <span className="text-sm">{contact.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <FiBriefcase className="mr-2 text-orange-500" />
                        <span>{contact.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{contact.clientSince}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {selectedContact && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Detalles del Contacto
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedContact(null)}
              >
                Cerrar
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre completo</label>
                    <p className="mt-1 font-medium">{selectedContact.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cargo</label>
                    <p className="mt-1">{selectedContact.position}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Departamento</label>
                    <p className="mt-1">{selectedContact.department}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Información de Contacto</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Teléfono Oficina</label>
                    <p className="mt-1">{selectedContact.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Teléfono Móvil</label>
                    <p className="mt-1">{selectedContact.mobile}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Correo Electrónico</label>
                    <p className="mt-1">{selectedContact.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Información de la Empresa</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Empresa</label>
                    <p className="mt-1 font-medium">{selectedContact.company}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Cliente desde</label>
                    <p className="mt-1">{selectedContact.clientSince}</p>
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Notas y Observaciones</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="whitespace-pre-line">{selectedContact.notes || "No hay notas registradas para este contacto."}</p>
                </div>
              </div>
              
              <div className="md:col-span-2 flex justify-end space-x-3">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Editar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Crear Actividad
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Contacts;