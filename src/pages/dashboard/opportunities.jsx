import React, { useState } from "react";
import { FiSearch, FiFilter, FiUser, FiMapPin, FiPhone, FiMail, FiFileText, FiCalendar, FiDollarSign, FiTrendingUp, FiCheckCircle,  FiCheck, FiX, FiXCircle, FiPlus } from "react-icons/fi";

import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

// Datos de ejemplo para oportunidades
const initialOpportunities = [
  {
    id: 1,
    name: "Pedido anual de película stretch",
    account: "SUMITOMO ELECTRIC WIRING SYSTEMS, INC.",
    contact: "FRANCISCO FAVELA",
    stage: "negociacion",
    amount: "$450,000",
    closeDate: "2025-08-15",
    probability: "75%",
    description: "Suministro de película stretch para sus 3 plantas durante 1 año",
    salesRep: "1 LAGUNA",
    activities: [
      { id: 1, type: "Llamada", date: "2025-07-10", notes: "Presentación de propuesta técnica" },
      { id: 2, type: "Visita", date: "2025-07-18", notes: "Pruebas en planta" }
    ],
    documents: [
      { name: "Cotización_SUMITOMO_2025.pdf", date: "2025-07-05" },
      { name: "Especificaciones_Técnicas.docx", date: "2025-07-08" }
    ]
  },
  {
    id: 2,
    name: "Flejadoras automáticas",
    account: "WHIRLPOOL INTERNACIONAL",
    contact: "LUISSANA MARROQUÍN",
    stage: "propuesta",
    amount: "$280,000",
    closeDate: "2025-08-30",
    probability: "50%",
    description: "3 máquinas flejadoras para línea de empaque",
    salesRep: "1 SALTILLO",
    activities: [
      { id: 3, type: "Reunión", date: "2025-07-05", notes: "Demostración de equipo" }
    ],
    documents: [
      { name: "Catalogo_Flejadoras.pdf", date: "2025-07-01" }
    ]
  },
  {
    id: 3,
    name: "Cartón corrugado personalizado",
    account: "NIPPON STEEL PIPE MEXICO S.A DE C.V",
    contact: "TAMARA BEJARANO",
    stage: "contacto",
    amount: "$120,000",
    closeDate: "2025-09-10",
    probability: "30%",
    salesRep: "DISPONIBLE QUERETARO",
    description: "Desarrollo de empaque especial para nuevo producto",
    activities: [],
    documents: []
  },
  {
    id: 4,
    name: "Contrato de suministro de cintas",
    account: "BADAFI",
    contact: "JESUS SANTIBANEZ",
    stage: "cerrada",
    amount: "$95,000",
    closeDate: "2025-06-20",
    probability: "100%",
    status: "won",
    salesRep: "3 MONTERREY",
    description: "Suministro mensual de cintas adhesivas industriales",
    activities: [
      { id: 4, type: "Correo", date: "2025-06-18", notes: "Envío de contrato firmado" }
    ],
    documents: [
      { name: "Contrato_BADAFI.pdf", date: "2025-06-15" }
    ]
  }
];

const stages = {
  contacto: { name: "Contacto Inicial", color: "bg-blue-100 text-blue-800" },
  cotizacion: { name: "Cotización", color: "bg-purple-100 text-purple-800" },
  propuesta: { name: "Propuesta", color: "bg-yellow-100 text-yellow-800" },
  negociacion: { name: "Negociación", color: "bg-orange-100 text-orange-800" },
  cerrada: { name: "Cerrada", color: "bg-green-100 text-green-800" }
};

export function Opportunities() {
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [viewMode, setViewMode] = useState("kanban"); // 'kanban' or 'list'
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOpps = opportunities.filter(opp => 
    opp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opp.account.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const opportunitiesByStage = {
    contacto: filteredOpps.filter(opp => opp.stage === "contacto"),
    cotizacion: filteredOpps.filter(opp => opp.stage === "cotizacion"),
    propuesta: filteredOpps.filter(opp => opp.stage === "propuesta"),
    negociacion: filteredOpps.filter(opp => opp.stage === "negociacion"),
    cerrada: filteredOpps.filter(opp => opp.stage === "cerrada")
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const oppId = parseInt(result.draggableId);
    const newStage = destination.droppableId;

    setOpportunities(prev => 
      prev.map(opp => 
        opp.id === oppId ? { ...opp, stage: newStage } : opp
      )
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Oportunidades / Ventas</h1>
            <p className="text-gray-600">Seguimiento de oportunidades comerciales</p>
          </div>
          <div className="flex space-x-3">
            <button 
              className={`px-4 py-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('list')}
            >
              Vista de Lista
            </button>
            <button 
              className={`px-4 py-2 rounded-lg ${viewMode === 'kanban' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setViewMode('kanban')}
            >
              Vista Kanban
            </button>
            <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <FiPlus className="mr-1" /> Nueva Oportunidad
            </button>
          </div>
        </div>

        <div className="mb-6 relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar oportunidades por nombre o cliente..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {viewMode === 'list' ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Oportunidad</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Fecha Cierre</th>
                  <th className="px-4 py-3">Probabilidad</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpps.map((opp) => (
                  <tr 
                    key={opp.id} 
                    className="border-t hover:bg-blue-50 cursor-pointer"
                    onClick={() => setSelectedOpp(opp)}
                  >
                    <td className="px-4 py-3 font-medium">{opp.name}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{opp.account}</div>
                      <div className="text-sm text-gray-500">{opp.contact}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stages[opp.stage].color}`}>
                        {stages[opp.stage].name}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{opp.amount}</td>
                    <td className="px-4 py-3">{opp.closeDate}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ width: opp.probability }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-500">{opp.probability}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              {Object.entries(stages).map(([stageId, stage]) => (
                <Droppable key={stageId} droppableId={stageId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="bg-gray-100 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">{stage.name}</h3>
                        <span className="bg-white px-2 py-1 rounded-full text-xs">
                          {opportunitiesByStage[stageId].length}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {opportunitiesByStage[stageId].map((opp, index) => (
                          <Draggable key={opp.id} draggableId={opp.id.toString()} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer"
                                onClick={() => setSelectedOpp(opp)}
                              >
                                <div className="font-medium mb-1">{opp.name}</div>
                                <div className="text-sm text-gray-500 mb-1">{opp.account}</div>
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-blue-600">{opp.amount}</span>
                                  <span className="text-xs text-gray-500">{opp.closeDate}</span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}

        {selectedOpp && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Detalle de Oportunidad
              </h2>
              <button 
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedOpp(null)}
              >
                Cerrar
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">{selectedOpp.name}</h3>
                  <p className="text-gray-600 mb-4">{selectedOpp.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Cliente</label>
                      <p className="mt-1 font-medium">{selectedOpp.account}</p>
                      <p className="text-sm text-gray-500">{selectedOpp.contact}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Etapa</label>
                      <p className="mt-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stages[selectedOpp.stage].color}`}>
                          {stages[selectedOpp.stage].name}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Valor Estimado</label>
                      <p className="mt-1 font-medium text-xl">{selectedOpp.amount}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Fecha de Cierre</label>
                      <p className="mt-1 font-medium">{selectedOpp.closeDate}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Probabilidad de Cierre</h4>
                  <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: selectedOpp.probability }}
                      ></div>
                    </div>
                    <div className="text-right text-sm font-medium mt-1">{selectedOpp.probability}</div>
                  </div>
                  
                  {selectedOpp.stage === "cerrada" && (
                    <div className={`mt-4 p-3 rounded-lg ${selectedOpp.status === "won" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      <div className="flex items-center font-medium">
                        {selectedOpp.status === "won" ? (
                          <>
                            <FiCheck className="mr-1" /> Ganada
                          </>
                        ) : (
                          <>
                            <FiX className="mr-1" /> Perdida
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FiTrendingUp className="mr-2" /> Actividades
                  </h3>
                  {selectedOpp.activities.length > 0 ? (
                    <div className="space-y-3">
                      {selectedOpp.activities.map(act => (
                        <div key={act.id} className="border-l-2 border-blue-500 pl-3 py-1">
                          <div className="flex justify-between">
                            <div className="font-medium">{act.type}</div>
                            <div className="text-sm text-gray-500">{act.date}</div>
                          </div>
                          <p className="text-sm text-gray-700">{act.notes}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay actividades registradas</p>
                  )}
                  <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    + Agregar actividad
                  </button>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FiFileText className="mr-2" /> Documentos
                  </h3>
                  {selectedOpp.documents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedOpp.documents.map((doc, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 hover:bg-gray-50 rounded">
                          <div className="flex items-center">
                            <FiFileText className="mr-2 text-gray-400" />
                            <span>{doc.name}</span>
                          </div>
                          <div className="text-sm text-gray-500">{doc.date}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No hay documentos adjuntos</p>
                  )}
                  <button className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium">
                    + Subir documento
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                  Editar
                </button>
                {selectedOpp.stage !== "cerrada" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Avanzar Etapa
                  </button>
                )}
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  {selectedOpp.stage === "cerrada" ? "Reabrir" : "Marcar como Perdida"}
                </button>
                {selectedOpp.stage !== "cerrada" && (
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Marcar como Ganada
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Opportunities;