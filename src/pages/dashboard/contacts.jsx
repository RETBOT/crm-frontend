import React, { useEffect, useState } from "react";
import {
  FiPhone,
  FiMail,
  FiSearch,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiMessageSquare,
  FiCalendar,
} from "react-icons/fi";
import { getClientes, getContactos, contactos_ABC, getPuestos } from "../../api/accounts";
import { getTiposActividad, crearActividad } from "../../api/activities";
import { ContactForm, ActivityForm, Notification } from "../../components/index";

export function Contacts() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [contacts, setContacts] = useState([]);
  const [puestos, setPuestos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityContact, setActivityContact] = useState(null);
  const [formCustomerId, setFormCustomerId] = useState("");
  const [activityTypes, setActivityTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
  };

  const closeNotification = () => {
    setNotification({ show: false, message: "", type: "success" });
  };

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const res = await getClientes(0, "", "", "ACTIVO", "", 1, 0, "");
        const data = res.data || res;
        setCustomers(Array.isArray(data) ? data : []);
      } catch {
        setCustomers([]);
      }
    };

    const loadPuestos = async () => {
      try {
        const res = await getPuestos("");
        setPuestos(Array.isArray(res) ? res : []);
      } catch {
        setPuestos([]);
      }
    };

    const loadTipos = async () => {
      try {
        const res = await getTiposActividad();
        setActivityTypes(Array.isArray(res) ? res : res.data || []);
      } catch {
        setActivityTypes([
          { CODE: "Llamada", NAME: "Llamada" },
          { CODE: "Reunion", NAME: "Reunion" },
          { CODE: "Correo", NAME: "Correo" },
          { CODE: "Visita", NAME: "Visita" },
          { CODE: "Tarea", NAME: "Tarea" },
        ]);
      }
    };

    loadCustomers();
    loadPuestos();
    loadTipos();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const clienteId = selectedCustomerId ? Number(selectedCustomerId) : "";
      const res = await getContactos(clienteId);
      const data = Array.isArray(res) ? res : res.data || [];
      setContacts(data);
    } catch (err) {
      setError(err?.message || "Error al cargar contactos");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
    setSelectedContact(null);
  }, [selectedCustomerId]);

  useEffect(() => {
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (c.NOMBRE || "").toLowerCase().includes(search) ||
      (c.APATERNO || "").toLowerCase().includes(search) ||
      (c.EMAIL || "").toLowerCase().includes(search) ||
      (c.TELEFONO || "").includes(search)
    );
  });

  const handleCreateContact = async (formData) => {
    const customerId = selectedCustomerId || formCustomerId;
    if (!customerId) {
      showNotification("Selecciona un cliente para crear el contacto", "error");
      return;
    }
    try {
      await contactos_ABC(
        customerId,
        0,
        formData.NOMBRE,
        formData.APATERNO,
        formData.AMATERNO,
        formData.TELEFONO,
        formData.EXTENSION,
        formData.PUESTOID,
        formData.COMENTARIOS,
        formData.WHATSAPP,
        formData.EMAIL,
        "A"
      );
      showNotification("Contacto creado correctamente");
      setShowContactForm(false);
      setEditingContact(null);
      setFormCustomerId("");
      fetchContacts();
    } catch (err) {
      showNotification(err?.message || "Error al crear contacto", "error");
    }
  };

  const handleUpdateContact = async (formData) => {
    try {
      const customerId = editingContact.customer_id || selectedCustomerId;
      await contactos_ABC(
        customerId,
        editingContact.ID || editingContact.contact_id,
        formData.NOMBRE,
        formData.APATERNO,
        formData.AMATERNO,
        formData.TELEFONO,
        formData.EXTENSION,
        formData.PUESTOID,
        formData.COMENTARIOS,
        formData.WHATSAPP,
        formData.EMAIL,
        "C"
      );
      showNotification("Contacto actualizado correctamente");
      setShowContactForm(false);
      setEditingContact(null);
      fetchContacts();
    } catch (err) {
      showNotification(err?.message || "Error al actualizar contacto", "error");
    }
  };

  const handleDeleteContact = async (contact) => {
    if (!window.confirm(`Desea eliminar el contacto ${contact.NOMBRE} ${contact.APATERNO}?`)) return;
    try {
      const customerId = contact.customer_id || selectedCustomerId;
      await contactos_ABC(
        customerId,
        contact.ID || contact.contact_id,
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
      showNotification("Contacto eliminado correctamente");
      if (selectedContact?.ID === contact.ID) setSelectedContact(null);
      fetchContacts();
    } catch (err) {
      showNotification(err?.message || "Error al eliminar contacto", "error");
    }
  };

  const handleCreateActivity = async (payload) => {
    await crearActividad(payload);
    showNotification("Actividad creada correctamente");
    setShowActivityForm(false);
    setActivityContact(null);
  };

  const openEditContact = (contact) => {
    setEditingContact(contact);
    setShowContactForm(true);
    setShowActivityForm(false);
  };

  const openCreateActivity = (contact) => {
    const customerId = contact.customer_id || contact.CLIENTEID;
    setActivityContact(contact);
    setShowActivityForm(true);
    setShowContactForm(false);
  };

  const getActivityCustomerId = () => {
    if (selectedCustomerId) return Number(selectedCustomerId);
    if (activityContact) return Number(activityContact.customer_id);
    return 0;
  };

  const selectedCustomer = customers.find(
    (c) => String(c.customer_id || c.CLIENTEID) === String(selectedCustomerId)
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Contactos</h1>
        <p className="text-gray-600 mb-6">Gestion de contactos por cliente</p>

        {notification.show && (
          <Notification message={notification.message} type={notification.type} onClose={closeNotification} />
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center gap-3">
            <select
              className="border rounded-lg p-2 text-sm flex-1 max-w-xs"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {customers.map((c) => (
                <option key={c.customer_id || c.CLIENTEID} value={c.customer_id || c.CLIENTEID}>
                  {c.customer_name || c.NOMBRECLI}
                </option>
              ))}
            </select>

            <div className="relative flex-1 max-w-md">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o telefono..."
                className="pl-10 pr-4 py-2 w-full border rounded-lg text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
              onClick={() => {
                setEditingContact(null);
                setShowContactForm(true);
                setShowActivityForm(false);
                if (!selectedCustomerId) setFormCustomerId("");
              }}
            >
              <FiPlus className="mr-1" /> Nuevo Contacto
            </button>
          </div>

          {showContactForm && (
            <div className="p-4 border-b">
              {!selectedCustomerId && !editingContact && (
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <select
                    className="border rounded p-2 w-full text-sm"
                    value={formCustomerId}
                    onChange={(e) => setFormCustomerId(e.target.value)}
                  >
                    <option value="">Selecciona un cliente para el contacto</option>
                    {customers.map((c) => (
                      <option key={c.customer_id || c.CLIENTEID} value={c.customer_id || c.CLIENTEID}>
                        {c.customer_name || c.NOMBRECLI}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {(selectedCustomerId || editingContact || formCustomerId) && (
                <ContactForm
                  initialData={editingContact || {}}
                  puestos={puestos}
                  onSave={editingContact ? handleUpdateContact : handleCreateContact}
                  onCancel={() => {
                    setShowContactForm(false);
                    setEditingContact(null);
                    setFormCustomerId("");
                  }}
                  isEditing={!!editingContact}
                />
              )}
            </div>
          )}

          {showActivityForm && activityContact && (
            <div className="p-4 border-b">
              <ActivityForm
                title={`Nueva Actividad para ${activityContact.NOMBRE} ${activityContact.APATERNO}`}
                activityTypes={activityTypes}
                contacts={contacts}
                customerId={getActivityCustomerId()}
                initialData={{ CONTACT_ID: activityContact.ID || activityContact.contact_id }}
                submitLabel="Crear"
                onSave={handleCreateActivity}
                onCancel={() => {
                  setShowActivityForm(false);
                  setActivityContact(null);
                }}
              />
            </div>
          )}

          {error && !loading && (
            <div className="m-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {contacts.length === 0
                ? selectedCustomerId
                  ? "Este cliente no tiene contactos registrados"
                  : "No hay contactos registrados"
                : "No se encontraron contactos con ese filtro"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left p-3">Nombre</th>
                    {!selectedCustomerId && <th className="text-left p-3">Cliente</th>}
                    <th className="text-left p-3">Puesto</th>
                    <th className="text-left p-3">Telefono</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3 w-36">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.ID || contact.contact_id}
                      className={`border-t hover:bg-blue-50 cursor-pointer ${
                        selectedContact?.ID === contact.ID ? "bg-blue-50" : ""
                      }`}
                      onClick={() => setSelectedContact(contact)}
                    >
                      <td className="p-3">
                        <div className="font-medium">
                          {contact.NOMBRE} {contact.APATERNO} {contact.AMATERNO}
                        </div>
                      </td>
                      {!selectedCustomerId && (
                        <td className="p-3 text-gray-500 text-xs">{contact.NOMBRECLI || ""}</td>
                      )}
                      <td className="p-3 text-gray-600">{contact.PUESTO || ""}</td>
                      <td className="p-3">
                        {contact.TELEFONO && (
                          <div className="flex items-center text-gray-600">
                            <FiPhone className="mr-1 text-gray-400" />
                            {contact.TELEFONO}
                            {contact.EXTENSION && ` Ext.${contact.EXTENSION}`}
                          </div>
                        )}
                      </td>
                      <td className="p-3">
                        {contact.EMAIL && (
                          <a href={`mailto:${contact.EMAIL}`} className="text-blue-600 hover:underline">
                            {contact.EMAIL}
                          </a>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-1">
                          <button
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                            title="Editar"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditContact(contact);
                            }}
                          >
                            <FiEdit2 size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-red-100 text-red-500"
                            title="Eliminar"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteContact(contact);
                            }}
                          >
                            <FiTrash2 size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded hover:bg-blue-100 text-blue-500"
                            title="Crear Actividad"
                            onClick={(e) => {
                              e.stopPropagation();
                              openCreateActivity(contact);
                            }}
                          >
                            <FiCalendar size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedContact && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">Detalle del Contacto</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setSelectedContact(null)}
              >
                Cerrar
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Informacion Principal</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nombre</label>
                    <p className="mt-1 font-medium">
                      {selectedContact.NOMBRE} {selectedContact.APATERNO} {selectedContact.AMATERNO}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Puesto</label>
                    <p className="mt-1">{selectedContact.PUESTO || "No especificado"}</p>
                  </div>
                  {selectedContact.NOMBRECLI && (
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Cliente</label>
                      <p className="mt-1">{selectedContact.NOMBRECLI}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contacto</h3>
                <div className="space-y-3">
                  {selectedContact.TELEFONO && (
                    <div className="flex items-center gap-2">
                      <FiPhone className="text-gray-400" />
                      <span>
                        {selectedContact.TELEFONO}
                        {selectedContact.EXTENSION && ` Ext.${selectedContact.EXTENSION}`}
                      </span>
                    </div>
                  )}
                  {selectedContact.WHATSAPP && (
                    <div className="flex items-center gap-2">
                      <FiMessageSquare className="text-green-500" />
                      <a
                        href={`https://wa.me/${selectedContact.WHATSAPP.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        {selectedContact.WHATSAPP}
                      </a>
                    </div>
                  )}
                  {selectedContact.EMAIL && (
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400" />
                      <a href={`mailto:${selectedContact.EMAIL}`} className="text-blue-600 hover:underline">
                        {selectedContact.EMAIL}
                      </a>
                    </div>
                  )}
                </div>
              </div>
              {selectedContact.COMENTARIOS && (
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-2">Comentarios</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="whitespace-pre-line">{selectedContact.COMENTARIOS}</p>
                  </div>
                </div>
              )}
              <div className="md:col-span-2 flex justify-end gap-2">
                <button
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  onClick={() => openEditContact(selectedContact)}
                >
                  <FiEdit2 className="inline mr-1" />
                  Editar
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => openCreateActivity(selectedContact)}
                >
                  <FiCalendar className="inline mr-1" />
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
