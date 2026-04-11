import React, { useEffect, useMemo, useState } from "react";
import {
  FiSearch, FiUser, FiPhone, FiMail, FiFileText, FiCalendar,
  FiDollarSign, FiTrendingUp, FiCheckCircle, FiCheck, FiX, FiXCircle, FiPlus,
  FiChevronsLeft, FiChevronLeft, FiChevronRight, FiChevronsRight, FiFilter, FiTrash2,
  FiArrowUp, FiArrowDown, FiMinus, FiEdit2,
} from "react-icons/fi";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  getOpportunities, getOpportunityItems, getPipelines,
  createOpportunity, updateOpportunity, advanceStage,
  setOpportunityStatus, reopenOpportunity, deleteOpportunity,
} from "../../api/opportunities";
import { getContactos } from "../../api/accounts";
import { getProducts } from "../../api/products";
import { OpportunityForm, Notification, CustomerSearchSelect } from "../../components";
import { hasPermission } from "../../utils/auth";
import { logger } from "../../utils/logger";

const statusStyles = {
  abierta: "bg-blue-100 text-blue-800",
  ganada: "bg-green-100 text-green-800",
  perdida: "bg-red-100 text-red-800",
};

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function SortIcon({ sortBy, sortDir, column }) {
  if (sortBy !== column) return <FiMinus className="ml-1 text-gray-300" size={12} />;
  return sortDir === "ASC" ? <FiArrowUp className="ml-1 text-blue-600" size={12} /> : <FiArrowDown className="ml-1 text-blue-600" size={12} />;
}

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
  const [oppFormCustomerName, setOppFormCustomerName] = useState("");
  const [products, setProducts] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });
  const [opLoading, setOpLoading] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [lostReason, setLostReason] = useState("");
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Phase 4: Filters & Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegs, setTotalRegs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOwner, setFilterOwner] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");
  const [sortBy, setSortBy] = useState("stage_order");
  const [sortDir, setSortDir] = useState("ASC");

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => window.clearTimeout(id);
  }, [searchTerm]);

  useEffect(() => { setPage(1); }, [debouncedSearch, filterCustomer, filterStatus, filterOwner, filterDateFrom, filterDateTo, pageSize]);

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const oppRes = await getOpportunities({
        SEARCH: debouncedSearch,
        CUSTOMER_ID: filterCustomer || null,
        STATUS: filterStatus || null,
        OWNER_USER_ID: filterOwner || null,
        CLOSE_DATE_FROM: filterDateFrom || null,
        CLOSE_DATE_TO: filterDateTo || null,
        NPAG: page,
        TPAG: pageSize,
        SORT_BY: sortBy,
        SORT_DIR: sortDir,
      });
      setOpportunities(oppRes.data || []);
      setTotalPaginas(oppRes.tot_pags || 1);
      setTotalRegs(oppRes.total_regs || 0);
    } catch (err) {
      setError(err?.message || "Error al cargar oportunidades");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadStaticData = async () => {
      try {
        const [pipeRes, prodRes] = await Promise.all([
          getPipelines(),
          getProducts(),
        ]);
        setPipelines(Array.isArray(pipeRes) ? pipeRes : (pipeRes?.data || []));
        setProducts(prodRes?.data || prodRes || []);
      } catch (err) {
        logger.error("Error loading static data:", err);
      }
    };
    loadStaticData();
  }, []);

  useEffect(() => { loadData(); }, [debouncedSearch, page, pageSize, filterCustomer, filterStatus, filterOwner, filterDateFrom, filterDateTo, sortBy, sortDir]);

  const loadItems = async (oppId) => {
    try {
      const items = await getOpportunityItems(oppId);
      setOppItems(Array.isArray(items) ? items : []);
    } catch { setOppItems([]); }
  };

  const loadContacts = async (customerId) => {
    try {
      const res = await getContactos(customerId, 1, 100);
      setContacts(res.data || res);
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

  const opportunitiesByStage = useMemo(() => {
    const grouped = {};
    openStageIds.forEach((id) => { grouped[id] = []; });
    opportunities.forEach((opp) => {
      if (grouped[opp.STAGE_ID]) grouped[opp.STAGE_ID].push(opp);
    });
    return grouped;
  }, [opportunities, openStageIds]);

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
    setShowForm(false);
    showNotification("Oportunidad actualizada correctamente");
    loadData();
  };

  const handleDelete = async () => {
    if (!selectedOpp) return;
    setOpLoading(true);
    try {
      await deleteOpportunity(selectedOpp.OPPORTUNITYID);
      showNotification("Oportunidad eliminada");
      loadData();
      setSelectedOpp(null);
    } catch (err) { showNotification(err?.message, "error"); }
    finally { setOpLoading(false); setConfirmModal(null); }
  };

  const handleAdvanceStage = async () => {
    if (!selectedOpp) return;
    setOpLoading(true);
    try {
      const currentOrder = selectedOpp.STAGE_ORDER || 0;
      const nextStage = pipelines
        .filter((p) => !p.IS_CLOSED && p.STAGE_ORDER > currentOrder)
        .sort((a, b) => a.STAGE_ORDER - b.STAGE_ORDER)[0];
      if (!nextStage) { showNotification("Ya esta en la ultima etapa", "error"); setOpLoading(false); return; }
      await advanceStage(selectedOpp.OPPORTUNITYID, nextStage.ID);
      showNotification("Etapa avanzada");
      loadData();
      setSelectedOpp(null);
    } catch (err) { showNotification(err?.message, "error"); }
    finally { setOpLoading(false); }
  };

  const handleSetStatus = async (status, reason) => {
    if (!selectedOpp) return;
    setOpLoading(true);
    try {
      await setOpportunityStatus(selectedOpp.OPPORTUNITYID, status, reason || "");
      showNotification(status === "ganada" ? "Oportunidad ganada!" : "Oportunidad marcada como perdida");
      loadData();
      setSelectedOpp(null);
    } catch (err) { showNotification(err?.message, "error"); }
    finally { setOpLoading(false); setConfirmModal(null); }
  };

  const handleSetStatusWithReason = (status) => {
    if (status === "perdida") {
      setLostReason("");
      setConfirmModal({ type: "lost" });
    } else {
      setConfirmModal({ type: "won" });
    }
  };

  const confirmAction = async () => {
    if (confirmModal?.type === "lost") {
      await handleSetStatus("perdida", lostReason);
    } else if (confirmModal?.type === "won") {
      await handleSetStatus("ganada");
    } else if (confirmModal?.type === "delete") {
      await handleDelete();
    }
  };

  const handleReopen = async () => {
    if (!selectedOpp) return;
    setOpLoading(true);
    try {
      await reopenOpportunity(selectedOpp.OPPORTUNITYID);
      showNotification("Oportunidad reabierta");
      loadData();
      setSelectedOpp(null);
    } catch (err) { showNotification(err?.message, "error"); }
    finally { setOpLoading(false); }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDir(prev => prev === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortDir("ASC");
    }
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

  const clearFilters = () => {
    setFilterCustomer("");
    setFilterStatus("");
    setFilterOwner("");
    setFilterDateFrom("");
    setFilterDateTo("");
    setSortBy("stage_order");
    setSortDir("ASC");
  };

  const hasActiveFilters = filterCustomer || filterStatus || filterOwner || filterDateFrom || filterDateTo || sortBy !== "stage_order";

  const startRow = totalRegs > 0 ? (page - 1) * pageSize + 1 : 0;
  const endRow = Math.min(page * pageSize, totalRegs);

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800">Oportunidades</h1>
            <p className="text-gray-600">Seguimiento de oportunidades comerciales</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className={`px-4 py-2 rounded-lg text-sm ${viewMode === "list" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setViewMode("list")}>Lista</button>
            <button className={`px-4 py-2 rounded-lg text-sm ${viewMode === "kanban" ? "bg-blue-600 text-white" : "bg-gray-200"}`} onClick={() => setViewMode("kanban")}>Kanban</button>
            {hasPermission("opportunities.create") && (
              <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm" onClick={() => { setShowForm(true); setEditingOpp(null); setSelectedOpp(null); }}>
                <FiPlus className="mr-1" /> Nueva Oportunidad
              </button>
            )}
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Buscar por titulo o cliente..." className="pl-10 pr-4 py-2 w-full border rounded-lg" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 px-3 py-2 border rounded-lg text-sm transition-colors ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            <FiFilter size={14} /> Filtros
            {hasActiveFilters && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
                <CustomerSearchSelect
                  value={filterCustomer}
                  onChange={(id) => setFilterCustomer(id)}
                  placeholder="Buscar cliente..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Estatus</label>
                <select className="w-full border rounded-lg px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">Todos</option>
                  <option value="abierta">Abierta</option>
                  <option value="ganada">Ganada</option>
                  <option value="perdida">Perdida</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha desde</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha hasta</label>
                <input type="date" className="w-full border rounded-lg px-3 py-2 text-sm" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)} />
              </div>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                <FiX size={12} /> Limpiar filtros
              </button>
            )}
          </div>
        )}

        {notification.show && <Notification message={notification.message} type={notification.type} onClose={() => setNotification({ ...notification, show: false })} />}

        {showForm && (
          <OpportunityForm
            title={editingOpp ? "Editar Oportunidad" : "Nueva Oportunidad"}
            initialData={editingOpp}
            initialItems={editingOpp ? oppItems : []}
            contactList={contacts}
            products={products}
            pipelines={pipelines}
            customerName={editingOpp ? editingOpp.NOMBRECLI : oppFormCustomerName}
            submitLabel={editingOpp ? "Actualizar" : "Crear"}
            onSave={editingOpp ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditingOpp(null); setOppFormCustomerName(""); }}
          />
        )}

        {error && !loading && <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

        {loading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div></div>
        ) : viewMode === "list" ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {isMobileView ? (
              <div className="divide-y">
                {opportunities.map((opp) => (
                  <div
                    key={opp.OPPORTUNITYID}
                    className="p-4 hover:bg-blue-50 cursor-pointer"
                    onClick={() => selectOpp(opp)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-base truncate">{opp.TITLE}</div>
                        <div className="text-sm text-gray-500 mt-0.5">{opp.NOMBRECLI}</div>
                        {opp.CONTACT_NAME && (
                          <div className="text-xs text-gray-400 mt-0.5">{opp.CONTACT_NAME}</div>
                        )}
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${statusStyles[opp.STATUS] || (stageMap[opp.STAGE_ID]?.color || "bg-gray-100")}`}>
                        {opp.STATUS === "abierta" ? (stageMap[opp.STAGE_ID]?.NAME || opp.STAGE_NAME || "Abierta") : opp.STATUS === "ganada" ? "Ganada" : "Perdida"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <div className="font-bold text-blue-600">{formatAmount(opp.AMOUNT)}</div>
                      <div className="text-gray-500">{formatDate(opp.CLOSE_DATE)}</div>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2"><div className="bg-blue-600 h-2 rounded-full" style={{ width: `${opp.PROBABILITY || 0}%` }}></div></div>
                      <span className="text-xs text-gray-500">{opp.PROBABILITY || 0}% prob.</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="px-4 py-3">Oportunidad</th>
                    <th className="px-4 py-3">Cliente</th>
                    <th className="px-4 py-3">Etapa</th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort("amount")}>
                      <span className="flex items-center">Valor <SortIcon sortBy={sortBy} sortDir={sortDir} column="amount" /></span>
                    </th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort("close_date")}>
                      <span className="flex items-center">Cierre <SortIcon sortBy={sortBy} sortDir={sortDir} column="close_date" /></span>
                    </th>
                    <th className="px-4 py-3 cursor-pointer select-none hover:bg-gray-200" onClick={() => handleSort("probability")}>
                      <span className="flex items-center">Prob. <SortIcon sortBy={sortBy} sortDir={sortDir} column="probability" /></span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {opportunities.map((opp) => (
                    <tr key={opp.OPPORTUNITYID} className="border-t hover:bg-blue-50 cursor-pointer" onClick={() => selectOpp(opp)}>
                      <td className="px-4 py-3 font-medium">{opp.TITLE}</td>
                      <td className="px-4 py-3"><div className="font-medium">{opp.NOMBRECLI}</div><div className="text-sm text-gray-500">{opp.CONTACT_NAME}</div></td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[opp.STATUS] || (stageMap[opp.STAGE_ID]?.color || "bg-gray-100")}`}>
                          {opp.STATUS === "abierta" ? (stageMap[opp.STAGE_ID]?.NAME || opp.STAGE_NAME || "Abierta") : opp.STATUS === "ganada" ? "Ganada" : "Perdida"}
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
            )}
            {totalRegs > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center p-3 border-t gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <span>Mostrando {startRow}-{endRow} de {totalRegs}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500">Filas:</span>
                    <select className="border rounded px-2 py-1 text-sm" value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                      {PAGE_SIZE_OPTIONS.map((size) => (<option key={size} value={size}>{size}</option>))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(1)} disabled={page === 1}><FiChevronsLeft size={16} /></button>
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}><FiChevronLeft size={16} /></button>
                  <span className="px-3 text-sm text-gray-600">Pag. {page} / {totalPaginas}</span>
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(p => p + 1)} disabled={page >= totalPaginas}><FiChevronRight size={16} /></button>
                  <button className="p-1.5 rounded border hover:bg-gray-50 disabled:opacity-30" onClick={() => setPage(totalPaginas)} disabled={page >= totalPaginas}><FiChevronsRight size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="text-xs text-gray-400 mb-2 text-center">Arrastra las tarjetas entre etapas para cambiar su estado</div>
            <DragDropContext onDragEnd={onDragEnd}>
              <div className="overflow-x-auto">
                <div className="grid gap-3 sm:gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${Math.max(openStageIds.length, 2)}, minmax(280px, 1fr))` }}>
                {openStageIds.map((stageId) => {
                  const stage = stageMap[stageId];
                  return (
                    <Droppable key={stageId} droppableId={String(stageId)}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.droppableProps} className="bg-gray-100 rounded-lg p-3 sm:p-4">
                          <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-sm">{stage.name}</h3>
                            <span className="bg-white px-2 py-1 rounded-full text-xs">{opportunitiesByStage[stageId]?.length || 0}</span>
                          </div>
                          <div className="space-y-2 sm:space-y-3 min-h-[100px]">
                            {(opportunitiesByStage[stageId] || []).map((opp, index) => (
                              <Draggable key={opp.OPPORTUNITYID} draggableId={String(opp.OPPORTUNITYID)} index={index}>
                                {(provided) => (
                                  <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}
                                    className="bg-white p-2.5 sm:p-3 rounded-lg shadow-sm hover:shadow-md cursor-pointer" onClick={() => selectOpp(opp)}>
                                    <div className="font-medium text-sm mb-1">{opp.TITLE}</div>
                                    <div className="text-xs text-gray-500 mb-1">{opp.NOMBRECLI}</div>
                                    <div className="flex justify-between items-center">
                                      <span className="font-bold text-blue-600 text-sm">{formatAmount(opp.AMOUNT)}</span>
                                      <span className="text-xs text-gray-500">{formatDate(opp.CLOSE_DATE)}</span>
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">{opp.PROBABILITY || 0}% prob.</div>
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
              </div>
            </DragDropContext>
          </div>
        )}

        {selectedOpp && !showForm && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 sm:p-6 border-b flex justify-between items-center">
              <h2 className="text-base sm:text-xl font-bold text-gray-800">Detalle de Oportunidad</h2>
              <button className="text-gray-500 hover:text-gray-700 text-sm" onClick={() => setSelectedOpp(null)}>Cerrar</button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="md:col-span-2">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">{selectedOpp.TITLE}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{selectedOpp.DESCRIPTION}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <div><label className="block text-sm font-medium text-gray-500">Cliente</label><p className="mt-1 font-medium text-sm">{selectedOpp.NOMBRECLI}</p></div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Etapa</label>
                      <p className="mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[selectedOpp.STATUS] || (stageMap[selectedOpp.STAGE_ID]?.color || "bg-gray-100")}`}>
                          {selectedOpp.STATUS === "abierta" ? (stageMap[selectedOpp.STAGE_ID]?.NAME || selectedOpp.STAGE_NAME || "Abierta") : selectedOpp.STATUS === "ganada" ? "Ganada" : "Perdida"}
                        </span>
                      </p>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-500">Valor Estimado</label><p className="mt-1 font-medium text-lg sm:text-xl">{formatAmount(selectedOpp.AMOUNT)}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500">Fecha de Cierre</label><p className="mt-1 font-medium text-sm">{formatDate(selectedOpp.CLOSE_DATE)}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500">Ingreso Esperado</label><p className="mt-1 font-medium text-lg sm:text-xl text-green-600">{formatAmount((selectedOpp.AMOUNT || 0) * (selectedOpp.PROBABILITY || 0) / 100)}</p></div>
                    <div><label className="block text-sm font-medium text-gray-500">Responsable</label><p className="mt-1 font-medium text-sm">{selectedOpp.OWNER_NAME || "Sin asignar"}</p></div>
                  </div>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-medium mb-3 text-sm">Probabilidad</h4>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2"><div className="bg-blue-600 h-3 rounded-full" style={{ width: `${selectedOpp.PROBABILITY || 0}%` }}></div></div>
                  <div className="text-right text-base sm:text-lg font-bold">{selectedOpp.PROBABILITY || 0}%</div>
                  {selectedOpp.STATUS !== "abierta" && (
                    <div className={`mt-4 p-3 rounded-lg ${selectedOpp.STATUS === "ganada" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      <div className="flex items-center font-medium text-sm">
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

              <div className="flex flex-wrap justify-end gap-2">
                {selectedOpp.STATUS === "abierta" && (
                  <>
                    {hasPermission("opportunities.update") && (
                      <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled={opLoading} onClick={() => { setEditingOpp(selectedOpp); setShowForm(true); setSelectedOpp(null); loadContacts(selectedOpp.CUSTOMER_ID); }}>Editar</button>
                    )}
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={opLoading} onClick={handleAdvanceStage}>Avanzar Etapa</button>
                    <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50" disabled={opLoading} onClick={() => handleSetStatusWithReason("perdida")}>Marcar Perdida</button>
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50" disabled={opLoading} onClick={() => handleSetStatusWithReason("ganada")}>Marcar Ganada</button>
                    {hasPermission("opportunities.delete") && (
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50" disabled={opLoading} onClick={() => setConfirmModal({ type: "delete" })}>
                        <FiTrash2 className="inline mr-1" size={14} /> Eliminar
                      </button>
                    )}
                  </>
                )}
                {selectedOpp.STATUS !== "abierta" && (
                  <>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50" disabled={opLoading} onClick={handleReopen}>Reabrir</button>
                    {hasPermission("opportunities.delete") && (
                      <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50" disabled={opLoading} onClick={() => setConfirmModal({ type: "delete" })}>
                        <FiTrash2 className="inline mr-1" size={14} /> Eliminar
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
              <h3 className="text-lg font-bold mb-2">
                {confirmModal.type === "lost" ? "Marcar como Perdida" : confirmModal.type === "delete" ? "Eliminar Oportunidad" : "Marcar como Ganada"}
              </h3>
              {confirmModal.type === "lost" && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Razon de la perdida</label>
                  <textarea value={lostReason} onChange={(e) => setLostReason(e.target.value)} placeholder="Describe brevemente la razon..." rows={3} className="w-full border rounded-lg p-2 text-sm resize-none" />
                </div>
              )}
              {confirmModal.type === "delete" && (
                <p className="text-sm text-gray-600 mb-4">
                  ¿Estas seguro de eliminar <strong>{selectedOpp?.TITLE}</strong>? Esta accion no se puede deshacer.
                </p>
              )}
              <div className="flex gap-2 justify-end">
                <button className="px-4 py-2 border rounded-lg hover:bg-gray-50" onClick={() => { setConfirmModal(null); setLostReason(""); }}>Cancelar</button>
                <button className={`px-4 py-2 text-white rounded-lg ${confirmModal.type === "delete" ? "bg-red-600 hover:bg-red-700" : confirmModal.type === "lost" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`} onClick={confirmAction}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Opportunities;
