import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FiSearch, FiFilter, FiUser, FiMapPin, FiPhone, FiFileText, FiCalendar, FiDollarSign, FiCheckCircle, FiXCircle, FiPlus, FiMenu, FiChevronDown, FiChevronUp, FiEdit } from "react-icons/fi";
import { getClientes, getContactos, getSucursales, getRutas, getPuestos, contactos_ABC, clientes_ABC } from "../../api/accounts";
import { getOpportunitiesByCustomer } from "../../api/opportunities";
import { ContactForm, CustomerForm, ActivityList, Notification } from "../../components/index";
import { hasPermission } from "../../utils/auth";

export function Accounts() {
  /********************ESTADOS****************************************************************************************************************** */
  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filters, setFilters] = useState({ searchTerm: "", status: "ACTIVO", sucursal: "", salesRep: "" });
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [activeTab, setActiveTab] = useState("Detalles");
  const [loadingTab, setLoadingTab] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [savingContact, setSavingContact] = useState(false);
  const [savingCustomer, setSavingCustomer] = useState(false);

  const [showContactForm, setShowContactForm] = useState(false);
  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success"
  });

  /********************DEBOUNCE BÚSQUEDA****************************************************************************************************************** */
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== filters.searchTerm) {
      setPage(1);
      setFilters(prev => ({ ...prev, searchTerm: debouncedSearch }));
    }
  }, [debouncedSearch]);

  /********************PETICIONES****************************************************************************************************************** */
  useEffect(() => { fetchClientes(); }, [filters, page]);
  useEffect(() => { fetchRutas(); }, [filters.sucursal]);
  useEffect(() => { fetchSucursales(); fetchRutas(); fetchPuestos(); }, []);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchClientes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getClientes(0, filters.searchTerm, filters.sucursal, filters.status, filters.salesRep, page, 0, 'CLIENTE');
      const clientesData = res.data || res;
      const total_paginas = res.tot_pags || 1;
      const dataArray = Array.isArray(clientesData) ? clientesData : [clientesData];
      setClientes(dataArray);
      setTotalPaginas(total_paginas);
    } catch (e) {
      console.error("Error al obtener clientes:", e);
      setError("Error al cargar los clientes. Intente nuevamente.");
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContactos = async (CLIENTEID) => {
    try {
      const res = await getContactos(CLIENTEID);
      const data = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
      return data;
    } catch (e) {
      console.error("Error al obtener contactos:", e);
      return [];
    }
  };

  const fetchSucursales = async () => {
    try {
      const res = await getSucursales("");
      const sucursalesData = Array.isArray(res) ? res : (res.data || []);
      setSucursales(sucursalesData);
    } catch (e) {
      console.error("Error al obtener las sucursales: ", e);
      setSucursales([]);
    }
  };

  const fetchRutas = async () => {
    try {
      const res = await getRutas(filters.sucursal);
      const rutasData = Array.isArray(res) ? res : (res.data || []);
      setRutas(rutasData);
    } catch (e) {
      console.error("Error al obtener las rutas: ", e);
      setRutas([]);
    }
  };

  const fetchPuestos = async () => {
    try {
      const res = await getPuestos("");
      const puestosData = Array.isArray(res) ? res : (res.data || []);
      setPuestos(puestosData);
    } catch (e) {
      console.error("Error al obtener los puestos: ", e);
      setPuestos([]);
    }
  };

  /********************FUNCIONES****************************************************************************************************************** */
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  const handleFilterChange = (k, v) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [k]: v === "all" ? "" : v }));
  };

  const loadTabData = async (cliente, tab) => {
    setLoadingTab(true);
    try {
      let data;
      if (tab === "Contactos") data = await fetchContactos(cliente.CLIENTEID);
      if (tab === "Oportunidades") data = await getOpportunitiesByCustomer(cliente.customer_id || cliente.CLIENTEID);
      if (tab !== "Actividades" && tab !== "Detalles") setSelectedAccount(prev => ({ ...prev, [tab]: data }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTab(false);
    }
  };

  const handleSelect = account => {
    setSelectedAccount({ ...account, Contactos: [], Oportunidades: [], Actividades: [] });
    setActiveTab("Detalles");
    loadTabData(account, "Detalles");
  };

  const handleCreateCustomer = async (customerData) => {
    if (!hasPermission("customers.create")) {
      showNotification("No cuenta con permisos para crear clientes", "error");
      return;
    }

    setSavingCustomer(true);
    try {
      const response = await clientes_ABC({
        ...customerData,
        TIPO_CLIENTE: "CLIENTE",
        TIPO: "A",
      });

      if (response.resultado === 1) {
        showNotification(response.msg || "Cliente creado correctamente");
        setShowCustomerForm(false);
        setPage(1);
        await fetchClientes();
        return;
      }

      showNotification(response.msg || "No se pudo crear el cliente", "error");
    } catch (error) {
      showNotification(error.message || "Ocurrió un error al crear el cliente", "error");
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleUpdateCustomer = async (customerData) => {
    if (!editingCustomer?.CLIENTEID) return;
    if (!hasPermission("customers.update")) {
      showNotification("No cuenta con permisos para editar clientes", "error");
      return;
    }

    setSavingCustomer(true);
    try {
      const response = await clientes_ABC({
        ...customerData,
        CLIENTEID: editingCustomer.CLIENTEID,
        TIPO_CLIENTE: "CLIENTE",
        TIPO: "C",
      });

      if (response.resultado === 1) {
        showNotification(response.msg || "Cliente actualizado correctamente");
        setEditingCustomer(null);
        setSelectedAccount(null);
        await fetchClientes();
        return;
      }

      showNotification(response.msg || "No se pudo actualizar el cliente", "error");
    } catch (error) {
      showNotification(error.message || "Ocurrió un error al actualizar el cliente", "error");
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleDeleteCustomer = async (customer) => {
    if (!hasPermission("customers.delete")) {
      showNotification("No cuenta con permisos para eliminar clientes", "error");
      return;
    }

    if (!window.confirm(`¿Desea inactivar el cliente ${customer.NOMBRECLI}?`)) return;

    try {
      const response = await clientes_ABC({
        CLIENTEID: customer.CLIENTEID,
        NOMBRECLI: customer.NOMBRECLI || "N/A",
        TIPO_CLIENTE: "CLIENTE",
        TIPO: "B",
      });

      if (response.resultado === 1) {
        showNotification(response.msg || "Cliente inactivado correctamente");
        setSelectedAccount(null);
        await fetchClientes();
        return;
      }

      showNotification(response.msg || "No se pudo inactivar el cliente", "error");
    } catch (error) {
      showNotification(error.message || "Ocurrió un error al inactivar el cliente", "error");
    }
  };

  const handleSaveContact = useCallback(async (contactData) => {
    if (!selectedAccount?.CLIENTEID) return;
    setSavingContact(true);
    try {
      const tipo = editingContact ? "C" : "A";
      const ID = editingContact ? editingContact.ID : 0;

      const response = await contactos_ABC(
        selectedAccount.CLIENTEID,
        ID,
        contactData.NOMBRE,
        contactData.APATERNO,
        contactData.AMATERNO,
        contactData.TELEFONO,
        contactData.EXTENSION,
        contactData.PUESTOID,
        contactData.COMENTARIOS,
        contactData.WHATSAPP,
        contactData.EMAIL,
        tipo
      );

      if (response.resultado === 1) {
        const updatedContacts = await fetchContactos(selectedAccount.CLIENTEID);
        setSelectedAccount(prev => ({ ...prev, Contactos: updatedContacts }));
        setShowContactForm(false);
        setEditingContact(null);
        showNotification(
          editingContact ? "Contacto actualizado correctamente" : "Contacto creado correctamente"
        );
      } else {
        showNotification(response.msg || "Operación no completada", "error");
      }
    } catch (error) {
      console.error("Error al guardar contacto:", error);
      showNotification(error.message || "Ocurrió un error al guardar el contacto", "error");
    } finally {
      setSavingContact(false);
    }
  }, [selectedAccount, editingContact]);

  const handleDeleteContact = useCallback(async (contact) => {
    if (!selectedAccount?.CLIENTEID) return;
    if (!window.confirm(`¿Estás seguro de eliminar a ${contact.NOMBRE}?`)) return;

    try {
      const response = await contactos_ABC(
        selectedAccount.CLIENTEID,
        contact.ID,
        contact.NOMBRE,
        contact.APATERNO,
        contact.AMATERNO,
        contact.TELEFONO,
        contact.EXTENSION,
        contact.PUESTOID,
        contact.COMENTARIOS,
        contact.WHATSAPP,
        contact.EMAIL,
        "B"
      );

      if (response.resultado === 1) {
        const updatedContacts = await fetchContactos(selectedAccount.CLIENTEID);
        setSelectedAccount(prev => ({ ...prev, Contactos: updatedContacts }));
        showNotification(response.msg || "Contacto eliminado correctamente");
      } else {
        showNotification(response.msg || "No se pudo eliminar el contacto", "error");
      }
    } catch (error) {
      console.error("Error al eliminar contacto:", error);
      showNotification(error.message || "Ocurrió un error al eliminar el contacto", "error");
    }
  }, [selectedAccount]);

  const renderTabContent = () => {
    if (loadingTab) return <LoadingSpinner />;

    const acc = selectedAccount;
    if (!acc) return <EmptyState message="Seleccione un cliente" />;

    switch (activeTab) {
      case "Detalles":
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Información General</h3>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre</label>
                <p className="text-gray-800 font-medium">{acc.CLIENTEID} - {acc.NOMBRECLI}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Giro</label>
                <p className="text-gray-800">{acc.GIRO || 'No especificado'}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Dirección</label>
                <p className="text-gray-800">
                  {[acc.CALLE, acc.NUM_EXT, acc.COLONIA, acc.CIUDAD, acc.ESTADO]
                  .filter(Boolean)
                  .join(', ') || 'Dirección no registrada'}
                </p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                <p className="text-gray-800 break-all">
                  {acc.EMAIL ? (
                    <a href={`mailto:${acc.EMAIL}`} className="text-blue-600 hover:underline">
                      {acc.EMAIL}
                    </a>
                  ) : 'No disponible'}
                </p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Teléfono</label>
                <p className="text-gray-800">
                  {acc.TEL ? (
                    <a href={`tel:${acc.TEL}`} className="hover:text-blue-600">
                      {formatPhoneNumber(acc.TEL)}
                    </a>
                  ) : 'No disponible'}
                </p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Estatus</label>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  acc.ESTATUS === "ACTIVO"
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {acc.ESTATUS || 'DESCONOCIDO'}
                </span>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Sucursal</label>
                <p className="text-gray-800">{acc.SUCURSAL || 'No asignada'}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Ruta</label>
                <p className="text-gray-800">{acc.RUTAID ? `${acc.RUTAID} - ${acc.RUTA}` : (acc.RUTA || 'No asignada')}</p>
              </div>
              {selectedAccount.LAT !== 0 && selectedAccount.LON !== 0 && (
                <div className="pt-2">
                  <button
                    onClick={() => abrirGoogleMaps(selectedAccount.LAT, selectedAccount.LON)}
                    className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <FiMapPin className="mr-2" />
                    Ver dirección en mapa
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case "Análisis de Cliente":
        return (
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Análisis de Cliente (Últimos 3 meses)</h3>
            <div className="space-y-4">
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Venta Neta</label>
                <p className="text-gray-800 font-medium">{formatCurrency(Number(acc.VENTA_NETA) || 0)}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Margen</label>
                <p className="text-gray-800">{formatPercent(Number(acc.MARGEN) || 0)}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Línea de Crédito</label>
                <p className="text-gray-800 font-medium">{formatCurrency(Number(acc.LINEA_CREDITO) || 0)}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Monto Ejercido</label>
                <p className="text-gray-800">{formatCurrency(Number(acc.MONTO_EJERCIDO) || 0)}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Cartera Vencida</label>
                <p className={`font-medium ${(Number(acc.CARTERA_VENCIDA) || 0) > 0 ? 'text-red-600' : 'text-gray-800'}`}>
                  {formatCurrency(Number(acc.CARTERA_VENCIDA) || 0)}
                </p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Prom. Días Vencidos</label>
                <p className={`font-medium ${(Number(acc.PROMEDIO_DIAS_VENCIDOS) || 0) > 30 ? 'text-yellow-600' : 'text-gray-800'}`}>
                  {Number(acc.PROMEDIO_DIAS_VENCIDOS) || 0} días
                </p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Inactivo C/V</label>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  acc.INACTIVOCV === "NO" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                }`}>
                  {acc.INACTIVOCV || 'N/A'}
                </span>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Retención de Pedido</label>
                <p className="text-gray-800">{acc.RETENCION_PEDIDOS || 'N/A'}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Razón de Retención</label>
                <p className="text-gray-800">{acc.RAZON_RETENCION || 'N/A'}</p>
              </div>
              <div className="border-b pb-2">
                <label className="block text-sm font-medium text-gray-500 mb-1">Aseguranza</label>
                <p className="text-gray-800">{acc.ASEGURANZA || 'N/A'}</p>
              </div>
            </div>
          </div>
        );
      case "Contactos":
        return (
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Contactos</h3>
            {!showContactForm && hasPermission("customers.update") && (
              <button
                onClick={() => {
                  setEditingContact(null);
                  setShowContactForm(true);
                }}
                className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors"
              >
                <FiPlus className="mr-1" /> Nuevo
              </button>
            )}
          </div>

          {showContactForm ? (
            <ContactForm
              initialData={editingContact || {}}
              puestos={puestos}
              onSave={handleSaveContact}
              onCancel={() => {
                setShowContactForm(false);
                setEditingContact(null);
              }}
              isEditing={!!editingContact}
              saving={savingContact}
            />
          ) : (
            <>
              {acc.Contactos?.length > 0 ? (
                <div className="space-y-4">
                  {acc.Contactos.map((contacto, idx) => (
                    <div key={contacto.ID || idx} className="border rounded-lg p-4 shadow-sm relative">
                      <div className="absolute top-2 right-2 flex space-x-2">
                        {hasPermission("customers.update") && (
                          <button
                            onClick={() => {
                              setEditingContact(contacto);
                              setShowContactForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                            </svg>
                          </button>
                        )}
                        {hasPermission("customers.delete") && (
                          <button
                            onClick={() => handleDeleteContact(contacto)}
                            className="text-red-600 hover:text-red-800 p-1"
                            title="Eliminar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
                        <p className="text-gray-800 font-semibold text-base flex items-center">
                          <FiUser className="mr-2" />
                          {contacto.NOMBRE || "Sin nombre"}
                          {contacto.APATERNO && ` ${contacto.APATERNO}`}
                          {contacto.AMATERNO && ` ${contacto.AMATERNO}`}
                          {contacto.PUESTO && (
                            <span className="ml-2 text-sm text-gray-500">({contacto.PUESTO})</span>
                          )}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        {contacto.TELEFONO && (
                          <div>
                            <span className="font-medium text-gray-500">Teléfono:</span> {contacto.TELEFONO}
                          </div>
                        )}
                        {contacto.EXTENSION && (
                          <div>
                            <span className="font-medium text-gray-500">Extensión:</span> {contacto.EXTENSION}
                          </div>
                        )}
                        {contacto.EMAIL && (
                          <div className="break-all">
                            <span className="font-medium text-gray-500">Email:</span>{" "}
                            <a href={`mailto:${contacto.EMAIL}`} className="text-blue-600 hover:underline">
                              {contacto.EMAIL}
                            </a>
                          </div>
                        )}
                        {contacto.WHATSAPP && (
                          <div>
                            <span className="font-medium text-gray-500">WhatsApp:</span>{" "}
                            <a
                              href={`https://wa.me/${contacto.WHATSAPP.replace(/\D/g, "")}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-600 hover:underline"
                            >
                              {contacto.WHATSAPP}
                            </a>
                          </div>
                        )}
                        {contacto.COMENTARIOS && (
                          <div className="sm:col-span-2">
                            <span className="font-medium text-gray-500">Comentarios:</span>{" "}
                            {contacto.COMENTARIOS}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No hay contactos registrados" />
              )}
            </>
          )}
        </div>
      );
      case "Oportunidades":
        return (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Oportunidades</h3>
            </div>
            {acc.Oportunidades?.length > 0 ? acc.Oportunidades.map((o) => (
              <div key={o.OPPORTUNITYID} className="border rounded p-3 mb-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium flex items-center">
                    <FiDollarSign className="mr-1" /> {o.TITLE}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    o.STATUS === "ganada" ? "bg-green-100 text-green-800" :
                    o.STATUS === "perdida" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {o.STATUS === "abierta" ? (o.STAGE_NAME || "Abierta") : o.STATUS}
                  </span>
                </div>
                <div className="mt-2 text-sm flex flex-col sm:flex-row sm:space-x-4">
                  <span className="font-medium text-blue-600">
                    {o.AMOUNT ? new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(o.AMOUNT) : "$0"}
                  </span>
                  <span>Etapa: {o.STAGE_NAME || "N/A"}</span>
                  <span>Probabilidad: {o.PROBABILITY || 0}%</span>
                  <span>Cierre: {o.CLOSE_DATE ? new Date(o.CLOSE_DATE).toLocaleDateString("es-MX") : "N/A"}</span>
                </div>
              </div>
            )) : <EmptyState message="No hay oportunidades registradas" />}
          </div>
        );
      case "Actividades":
        return <ActivityList clienteId={acc.customer_id || acc.CLIENTEID} contacts={acc.Contactos || []} customerData={acc} />;
      default:
        return null;
    }
  };

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin fill-gray-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
      </svg>
      <span className="sr-only">Cargando...</span>
    </div>
  );

  const EmptyState = ({ message = "No se encontraron clientes" }) => (
    <div className="text-center py-12">
      <div className="mx-auto w-24 h-24 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
      <p className="mt-1 text-sm text-gray-500">Intente cambiar los filtros de búsqueda</p>
    </div>
  );

  const formatCurrency = (value, currency = 'MXN') => {
    if (value === null || value === undefined || typeof value !== 'number') return 'N/A';
    const options = {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };
    return new Intl.NumberFormat('es-MX', options).format(value);
  };

  const formatPercent = (value) => {
    if (value === null || value === undefined || typeof value !== 'number') return 'N/A';
    return `${value.toFixed(2)}%`
  }

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'No disponible';
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10
      ? cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
      : phone;
  };

  const abrirGoogleMaps = (latitud, longitud) => {
    const url = `https://www.google.com/maps?q=${latitud},${longitud}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {notification.show && (
        <Notification message={notification.message} type={notification.type} onClose={closeNotification} />
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Clientes</h1>
        {hasPermission("customers.create") && (
          <button
            className="flex items-center bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
            onClick={() => setShowCustomerForm((prev) => !prev)}
          >
            <FiPlus className="mr-1" /> {showCustomerForm ? "Ocultar formulario" : "Nuevo cliente"}
          </button>
        )}
      </div>

      {showCustomerForm && (
        <CustomerForm
          title="Nuevo cliente"
          customerType="CLIENTE"
          sucursales={sucursales}
          rutas={rutas}
          onSave={handleCreateCustomer}
          onCancel={() => setShowCustomerForm(false)}
          saving={savingCustomer}
        />
      )}

      {editingCustomer && (
        <CustomerForm
          key={editingCustomer.CLIENTEID}
          title={`Editar cliente: ${editingCustomer.NOMBRECLI}`}
          customerType="CLIENTE"
          sucursales={sucursales}
          rutas={rutas}
          initialData={editingCustomer}
          submitLabel="Actualizar"
          onSave={handleUpdateCustomer}
          onCancel={() => setEditingCustomer(null)}
          saving={savingCustomer}
        />
      )}

      {/* Vista móvil */}
      {isMobileView ? (
        selectedAccount ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <button
                onClick={() => setSelectedAccount(null)}
                className="text-gray-600 hover:text-gray-800"
              >
                <FiChevronDown size={24} className="transform rotate-90"/>
              </button>
              <h2 className="text-base font-bold flex-1 text-center truncate px-2">{selectedAccount.CLIENTEID} - {selectedAccount.NOMBRECLI}</h2>
              <div className="flex items-center gap-1">
                {hasPermission("customers.update") && (
                  <button
                    className="text-blue-600 hover:text-blue-800 p-1.5 rounded hover:bg-blue-50"
                    onClick={() => setEditingCustomer(selectedAccount)}
                    title="Editar cliente"
                  >
                    <FiEdit size={18} />
                  </button>
                )}
                {hasPermission("customers.delete") && (
                  <button
                    className="text-gray-500 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100"
                    onClick={() => handleDeleteCustomer(selectedAccount)}
                    title="Inactivar cliente"
                  >
                    <FiXCircle size={18} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex border-b overflow-x-auto">
              {["Detalles","Análisis","Contactos","Oportunidades","Actividades"].map(tab => (
                <button
                  key={tab}
                  className={`px-3 py-3 font-medium text-sm whitespace-nowrap ${activeTab.startsWith(tab) ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => { setActiveTab(tab === "Análisis" ? "Análisis de Cliente" : tab); loadTabData(selectedAccount, tab); }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
              {renderTabContent()}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="p-3 border-b">
              <div className="flex items-center mb-3">
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-3 text-gray-400"/>
                  <input
                    className="pl-10 pr-4 py-2 w-full border rounded-lg"
                    placeholder="Buscar clientes..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter/>
                </button>
              </div>

              {showFilters && (
                <div className="grid grid-cols-1 gap-2 mt-2">
                  <select
                    className="border rounded p-2 text-sm"
                    value={filters.status}
                    onChange={e => handleFilterChange("status", e.target.value)}
                  >
                    <option value="">Todos los estatus</option>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                  <select
                    className="border rounded p-2 text-sm"
                    value={filters.sucursal}
                    onChange={e => handleFilterChange("sucursal", e.target.value)}
                  >
                    <option value="">Todas las sucursales</option>
                    {sucursales.map(s => (
                      <option key={s.ID} value={s.ID}>
                        {s.DSC}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded p-2 text-sm"
                    value={filters.salesRep}
                    onChange={e => handleFilterChange("salesRep", e.target.value)}
                  >
                    <option value="">Todos las rutas</option>
                    {rutas.map(s => (
                      <option key={s.ID} value={s.ID}>
                        {s.DSC}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 180px)" }}>
              {loading ? (
                <div className="py-8"><LoadingSpinner /></div>
              ) : error ? (
                <div className="py-4 text-center text-red-500">{error}</div>
              ) : clientes.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="divide-y">
                  {clientes.map(acc => (
                    <div
                      key={acc.CLIENTEID}
                      className="p-3 hover:bg-blue-50 cursor-pointer"
                      onClick={() => handleSelect(acc)}
                    >
                      <div className="font-medium">{acc.NOMBRECLI}</div>
                      <div className="text-sm text-gray-500 mb-1">{acc.GIRO}</div>
                      <div className="flex justify-between items-center text-sm">
                        <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${acc.ESTATUS === "ACTIVO" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                          {acc.ESTATUS}
                        </span>
                        <span className="text-gray-600">{acc.RUTAID ? `${acc.RUTAID}-` : ''}{acc.RUTA || ''}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center p-3 border-t">
              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span className="text-gray-600 text-sm">Pág. {page} / {totalPaginas}</span>
              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                onClick={() => setPage(prev => prev + 1)}
                disabled={page >= totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>
        )
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 flex-grow">
          {/* Lista */}
          <div className={`${selectedAccount ? "lg:w-1/3" : "w-full"} bg-white rounded-lg shadow`}>
            <div className="p-4 border-b">
              <div className="relative flex items-center mb-4">
                <FiSearch className="absolute left-5 text-gray-400"/>
                <input
                  className="pl-10 pr-4 py-2 w-full border rounded-lg"
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
                <button
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter/>
                </button>
              </div>
              {showFilters && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                  <select
                    className="border rounded p-2 text-sm"
                    value={filters.status}
                    onChange={e => handleFilterChange("status", e.target.value)}
                  >
                    <option value="">Todos los estatus</option>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                  <select
                    className="border rounded p-2 text-sm"
                    value={filters.sucursal}
                    onChange={e => handleFilterChange("sucursal", e.target.value)}
                  >
                    <option value="">Todas las sucursales</option>
                    {sucursales.map(s => (
                      <option key={s.ID} value={s.ID}>
                        {s.DSC}
                      </option>
                    ))}
                  </select>
                  <select
                    className="border rounded p-2 text-sm"
                    value={filters.salesRep}
                    onChange={e => handleFilterChange("salesRep", e.target.value)}
                  >
                    <option value="">Todos las rutas</option>
                    {rutas.map(s => (
                      <option key={s.ID} value={s.ID}>
                        {s.DSC}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Nombre</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Estatus</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ruta</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="3" className="py-8"><LoadingSpinner /></td></tr>
                  ) : error ? (
                    <tr><td colSpan="3" className="py-4 text-center text-red-500">{error}</td></tr>
                  ) : clientes.length === 0 ? (
                    <tr><td colSpan="3" className="py-4"><EmptyState /></td></tr>
                  ) : (
                    clientes.map(acc => (
                      <tr
                        key={acc.CLIENTEID}
                        className={`border-t hover:bg-blue-50 cursor-pointer ${selectedAccount?.CLIENTEID === acc.CLIENTEID ? "bg-blue-50" : ""}`}
                        onClick={() => handleSelect(acc)}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">{acc.NOMBRECLI}</div>
                          <div className="text-sm text-gray-500">{acc.GIRO}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs rounded-full ${acc.ESTATUS === "ACTIVO" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {acc.ESTATUS}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{acc.RUTA || ''}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between items-center p-4 border-t">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span className="text-gray-600">Página {page} / {totalPaginas}</span>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
                onClick={() => setPage(prev => prev + 1)}
                disabled={page >= totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </div>

          {/* Detalle */}
          {selectedAccount && (
            <div className="lg:w-2/3 bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">{selectedAccount.NOMBRECLI}</h2>
                  <div className="flex flex-wrap gap-x-4 text-gray-600 mt-1 text-sm">
                    <span className="flex items-center"><FiUser className="mr-1"/>{selectedAccount.GIRO}</span>
                    <span className="flex items-center"><FiMapPin className="mr-1"/>{selectedAccount.CALLE}</span>
                    {selectedAccount.TEL && (
                      <span className="flex items-center"><FiPhone className="mr-1"/>{formatPhoneNumber(selectedAccount.TEL)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasPermission("customers.update") && (
                    <button
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                      onClick={() => setEditingCustomer(selectedAccount)}
                    >
                      Editar
                    </button>
                  )}
                  {hasPermission("customers.delete") && (
                    <button
                      className="bg-gray-700 text-white px-3 py-2 rounded text-sm hover:bg-gray-800"
                      onClick={() => handleDeleteCustomer(selectedAccount)}
                    >
                      Inactivar
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedAccount(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiXCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="flex border-b overflow-x-auto">
                {["Detalles","Análisis de Cliente", "Contactos","Oportunidades","Actividades"].map(tab => (
                  <button
                    key={tab}
                    className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${activeTab === tab ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => { setActiveTab(tab); loadTabData(selectedAccount, tab); }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 250px)" }}>
                {renderTabContent()}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Accounts;
