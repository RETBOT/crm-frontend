import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch, FiUser, FiPhone, FiMail, FiFileText, FiCalendar,
  FiDollarSign, FiTrendingUp, FiCheckCircle, FiCheck, FiX, FiXCircle, FiPlus,
} from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  getOpportunities, getOpportunityItems, getPipelines,
  createOpportunity, updateOpportunity, advanceStage,
  setOpportunityStatus, reopenOpportunity,
} from "../../api/opportunities";
import { getClientes, getContactos } from "../../api/accounts";
import { getProducts } from "../../api/products";
import { OpportunityForm, Notification } from "../../components";
import { hasPermission } from "../../utils/auth";

const statusStyles = {
  abierta: "bg-blue-100 text-blue-800",
  ganada: "bg-green-100 text-green-800",
  perdida: "bg-red-100 text-red-800",
};

export function Opportunities() {
  const [opportunities, setOpportunities] = useState([]);
  const [pipelines, setPipelines] = useState([]);
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [oppItems, setOppItems] = useState([]);
  const [viewMode, setViewMode] = useState("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingOpp, setEditingOpp] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [oppRes, pipeRes, custRes, prodRes] = await Promise.all([
        getOpportunities({ SEARCH: debouncedSearch, TPAG: 100 }),
        getPipelines(),
        getClientes(0, "", "", "ACTIVO", "", 1, 0, ""),
        getProducts(),
      ]);
      setOpportunities(oppRes.data || []);
      setPipelines(Array.isArray(pipeRes) ? pipeRes : []);
      const custData = custRes.data || custRes;
      setCustomers(Array.isArray(custData) ? custData : []);
      setProducts(Array.isArray(prodRes) ? prodRes : []);
    } catch (err) {
      setError(err?.message || "Error al cargar oportunidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [debouncedSearch]);

  const loadItems = async (oppId) => {
    try {
      const items = await getOpportunityItems(oppId);
      setOppItems(Array.isArray(items) ? items : []);
    } catch { setOppItems([]); }
  };

  const loadContacts = async (customerId) => {
    try {
      const res = await getContactos(customerId);
      setContacts(Array.isArray(res) ? res : []);
    } catch { setContacts([]); }
  };

  const selectOpp = (opp) => {
    setSelectedOpp(opp);
    loadItems(opp.OPPORTUNITYID);
    if (opp.CUSTOMER_ID) loadContacts(opp.CUSTOMER_ID);
  };

  const stageMap = useMemo(() => {
    const map = {};
    const colors = {
      open: ["bg-blue-100 text-blue-800", "bg-purple-100 text-purple-800", "bg-yellow-100 text-yellow-800", "bg-orange-100 text-orange-800", "bg-teal-100 text-teal-800"],
      closed: { ganada: "bg-green-100 text-green-800", perdida: "bg-red-100 text-red-800" },
    };
    let openIndex = 0;
    pipelines.sort((a, b) => a.STAGE_ORDER - b.STAGE_ORDER).forEach((s) => {
      if (s.IS_CLOSED) {
        map[s.ID] = {
          name: s.IS_WON ? "Cerrada Ganada" : "Cerrada Perdida",
          color: s.IS_WON ? colors.closed.ganada : colors.closed.perdida,
          stage_order: s.STAGE_ORDER,
          is_closed: true,
          is_won: s.IS_WON,
        };
      } else {
        map[s.ID] = { name: s.NAME, color: colors.open[openIndex % colors.open.length], stage_order: s.STAGE_ORDER, is_closed: false };
        openIndex++;
      }
    });
    return map;
  }, [pipelines]);

  const openStageIds = useMemo(() => Object.keys(stageMap).map(Number).filter((id) => !stageMap[id]?.is_closed), [stageMap]);

  const filteredOpps = opportunities.filter((opp) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return (opp.TITLE || "").toLowerCase().includes(s) || (opp.NOMBRECLI || "").toLowerCase().includes(s);
  });

  const opportunitiesByStage = useMemo(() => {
    const grouped = {};
    openStageIds.forEach((id) => { grouped[id] = []; });
    filteredOpps.forEach((opp) => {
      if (grouped[opp.STAGE_ID]) grouped[opp.STAGE_ID].push(opp);
    });
    return grouped;
  }, [filteredOpps, openStageIds]);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const { source, destination } = result;
    if (source.droppableId === destination.droppableId) return;

    const oppId = parseInt(result.draggableId);
    const newStageId = parseInt(destination.droppableId);

    setOpportunities((prev) =>
      prev.map((opp) => opp.OPPORTUNITYID === oppId ? { ...opp, STAGE_ID: newStageId } : opp)
    );

    try {
      await advanceStage(oppId, newStageId);
      showNotification("Etapa actualizada");
    } catch (err) {
      showNotification(err?.message || "Error al cambiar etapa", "error");
      loadData();
    }
  };

  const handleCreate = async (payload) => {
    await createOpportunity(payload);
    setShowForm(false);
    showNotification("Oportunidad creada correctamente");
    loadData();
  };

  const handleUpdate = async (payload) => {
    await updateOpportunity(payload);
    setEditingOpp(null);
    showNotification("Oportunidad actualizada correctamente");
    loadData();
  };

  const handleAdvanceStage = async () => {
    if (!selectedOpp) return;
    const currentOrder = selectedOpp.STAGE_ORDER || 0;
    const nextStage = pipelines
      .filter((p) => !p.IS_CLOSED && p.STAGE_ORDER > currentOrder)
      .sort((a, b) => a.STAGE_ORDER - b.STAGE_ORDER)[0];
    if (!nextStage) { showNotification("Ya esta en la ultima etapa", "error"); return; }
    try {
      await advanceStage(selectedOpp.OPPORTUNITYID, nextStage.ID);
      showNotification("Etapa avanzada");
      loadData();
      setSelectedOpp(null);
    } catch (err) { showNotification(err?.message, "error"); }
  };

  const handleSetStatus = async (status) => {
    if (!selectedOpp) return;
    const reason = status === "perdida" ? window.prompt("Razon de la perdida:") : "";
    if (status === "perdida" && reason === null) return;
    try {
      await setOpportunityStatus(selectedOpp.OPPORTUNITYID, status, reason || "");
      showNotification(status === "ganada" ? "Oportunidad ganada!" : "Oportunidad marcada como perdida");
      loadData();
      setSelectedOpp(null);
    } catch (err) { showNotification(err?.message, "error"); }
  };

  const handleReopen = async () => {
    if (!selectedOpp) return;
    try {
      await reopenOpportunity(selectedOpp.OPPORTURITYID || selectedOpp.OPPORTUNITYID);
      showNotification("Oportunidad reabierta");
      loadData();
      setSelectedOpp(null);
    } catch (err) { showNotification(err?.message, "error"); }
  };

  const formatAmount = (amount) => {
    if (!amount) return "$0";
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(amount);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try { return new Date(dateStr).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" }); }
    catch { return dateStr; }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Oportunidades</h1>
            <p className="text-gray-600">Seguimiento de oportunidades comerciales</p>
          </div>
          <div className="flex space-x-3">
            <button className={`px-4 py-2 rounded-lg ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setViewMode("list")}>Lista</button>
            <button className={`px-4 py-2 rounded-lg ${viewMode === "kanban" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setViewMode("kanban")}>Kanban</button>
            {hasPermission("customers.create") && (
              <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={() => { setShowForm(true); setEditingOpp(null); setSelectedOpp(null); }}>
                <FiPlus className="mr-1" /> Nueva Oportunidad
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Buscar por titulo o cliente..." className="pl-10 pr-4 py-2 w-full border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>

        {notification.show && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}

        {showForm && (
          <OpportunityForm
            title={editingOpp ? "Editar Oportunidad" : "Nueva Oportunidad"}
            initialData={editingOpp}
            customerList={customers}
            contactList={contacts}
            products={products}
            pipelines={pipelines}
            submitLabel={editingOpp ? "Actualizar" : "Crear"}
            onSave={editingOpp ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingOpp(null); }}
          />
        )}

        {error && !loading && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
        ) : viewMode === "list" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-3">Oportunidad</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Etapa</th>
                  <th className="px-4 py-3">Valor</th>
                  <th className="px-4 py-3">Cierre</th>
                  <th className="px-4 py-3">Probabilidad</th>
                </tr>
              </thead>
              <tbody>
                {filteredOpps.map((opp) => (
                  <tr key={opp.OPPORTUNITYID} className="border-t hover:bg-blue-50 cursor-pointer" onClick={() => selectOpp(opp)}>
                    <td className="px-4 py-3 font-medium">{opp.TITLE}</td>
                    <td className="px-4 py-3"><div className="font-medium">{opp.NOMBRECLI}</div><div className="text-sm text-gray-500">{opp.CONTACT_NAME}</div></td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[opp.STATUS] || (stageMap[opp.STAGE_ID]?.color || "bg-gray-100")}`}>
                        {opp.STATUS === "abierta"
                          ? (stageMap[opp.STAGE_ID]?.NAME || opp.STAGE_NAME || "Abierta")
                          : opp.STATUS === "ganada" ? "Ganada" : "Perdida"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatAmount(opp.AMOUNT)}</td>
                    <td className="px-4 py-3">{formatDate(opp.CLOSE_DATE)}</td>
                    <td className="px-4 py-3">
                      <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${opp.PROBABILITY || 0}%` }}></div></div>
                      <span className="text-sm text-gray-500">{opp.PROBABILITY || 0}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-400 mb-2 text-center">
              Arrastra las tarjetas entre etapas para cambiar su estado
            </div>
            <DragDropContext onDragEnd={onDragEnd}>
              <div
                className="grid gap-4 mb-6"
                style={{ gridTemplateColumns: `repeat(${Math.max(openStageIds.length, 2)}, minmax(0, 1fr))` }}
              >
                {openStageIds.map((stageId) => {
                const stage = stageMap[stageId];
                return (
                  <Droppable key={stageId} droppableId={String(stageId)}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium text-sm">{stage.name}</h3>
                          <span className="bg-white px-2 py-1 rounded-full text-xs">{opportunitiesByStage[stageId]?.length || 0}</span>
                        </div>
                        <div className="space-y-3 min-h-[100px]">
                          {(opportunitiesByStage[stageId] || []).map((opp, index) => (
                            <Draggable key={opp.OPPORTUNITYID} draggableId={String(opp.OPPORTUNITYID)} index={index}>
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                  className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer" onClick={() => selectOpp(opp)}>
                                  <div className="font-medium text-sm mb-1">{opp.TITLE}</div>
                                  <div className="text-xs text-gray-500 mb-1">{opp.NOMBRECLI}</div>
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-blue-600 text-sm">{formatAmount(opp.AMOUNT)}</span>
                                    <span className="text-xs text-gray-500">{formatDate(opp.CLOSE_DATE)}</span>
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
                );
              })}
              </div>
            </DragDropContext>
          </div>
        )}

        {selectedOpp && !showForm && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Detalle de Oportunidad</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setSelectedOpp(null)}>Cerrar</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">{selectedOpp.TITLE}</h3>
                  <p className="text-gray-600 mb-4">{selectedOpp.DESCRIPTION}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><label className="block text-sm font-medium text-gray-500">Cliente</label><p className="mt-1 font-medium">{selectedOpp.NOMBRECLI}</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Etapa</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[selectedOpp.STATUS] || (stageMap[selectedOpp.STAGE_ID]?.color || "bg-gray-100")}`}>
                          {selectedOpp.STATUS === "abierta"
                            ? (stageMap[selectedOpp.STAGE_ID]?.NAME || selectedOpp.STAGE_NAME || "Abierta")
                            : selectedOpp.STATUS === "ganada" ? "Ganada" : "Perdida"}
                        </span>
                      </p>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-500">Valor Estimado</label><p className="mt-1 font-medium text-xl">{formatAmount(selectedOpp.AMOUNT)}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500">Fecha de Cierre</label><p className="mt-1 font-medium">{formatDate(selectedOpp.CLOSE_DATE)}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Probabilidad</h4>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${selectedOpp.PROBABILITY || 0}%` }}></div></div>
                  <div className="text-right text-lg font-bold">{selectedOpp.PROBABILITY || 0}%</div>
                  {selectedOpp.STATUS !== "abierta" && (
                    <div className={`mt-4 p-3 rounded-lg ${selectedOpp.STATUS === "ganada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      <div className="flex items-center font-medium">
                        {selectedOpp.STATUS === "ganada" ? <><FiCheck className="mr-1" /> Ganada</> : <><FiX className="mr-1" /> Perdida</>}
                      </div>
                      {selectedOpp.LOST_REASON && <p className="text-sm mt-1">{selectedOpp.LOST_REASON}</p>}
                    </div>
                  )}
                </div>
              </div>

              {oppItems.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Productos / Items</h3>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50"><tr><th className="text-left p-2">Producto</th><th className="text-right p-2">Cant</th><th className="text-right p-2">Precio</th><th className="text-right p-2">Desc</th><th className="text-right p-2">Total</th></tr></thead>
                    <tbody>
                      {oppItems.map((item) => (
                        <tr key={item.ITEM_ID} className="border-t">
                          <td className="p-2">{item.PRODUCT_NAME || item.ITEM_DESCRIPTION}</td>
                          <td className="p-2 text-right">{item.QUANTITY}</td>
                          <td className="p-2 text-right">{formatAmount(item.UNIT_PRICE)}</td>
                          <td className="p-2 text-right">{item.DISCOUNT_PCT}%</td>
                          <td className="p-2 text-right font-medium">{formatAmount(item.LINE_TOTAL)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end space-x-3">
                {selectedOpp.STATUS === "abierta" && (
                  <>
                    <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => { setEditingOpp(selectedOpp); setShowForm(true); setSelectedOpp(null); loadContacts(selectedOpp.CUSTOMER_ID); }}>Editar</button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleAdvanceStage}>Avanzar Etapa</button>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50" onClick={() => handleSetStatus("perdida")}>Marcar Perdida</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" onClick={() => handleSetStatus("ganada")}>Marcar Ganada</button>
                  </>
                )}
                {selectedOpp.STATUS !== "abierta" && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handleReopen}>Reabrir</button>
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
