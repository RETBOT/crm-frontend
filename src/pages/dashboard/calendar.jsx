import React, { useEffect, useState, useCallback } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FiCalendar, FiRefreshCw, FiPlus, FiX, FiCheck, FiLoader } from "react-icons/fi";
import { syncCalendar, getCalendarEvents, createActivityFromEvent } from "../../api/calendar";
import { Notification } from "../../components/index";

const localizer = momentLocalizer(moment);

export function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState({ google: false, microsoft: false });
  const [error, setError] = useState("");
  const [view, setView] = useState("month");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateActivity, setShowCreateActivity] = useState(false);
  const [activityType, setActivityType] = useState("Visita");
  const [creating, setCreating] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  const showNotification = (msg, type = "success") => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification((n) => ({ ...n, show: false })), 3000);
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCalendarEvents();
      const allEvents = [];

      (data.externalEvents || []).forEach((e) => {
        allEvents.push({
          id: `ext-${e.id}`,
          title: e.title,
          start: new Date(e.start_time),
          end: new Date(e.end_time),
          allDay: e.is_all_day,
          source: e.provider === "google" ? "Gmail" : "Outlook",
          description: e.description,
          location: e.location,
          isExternal: true,
          eventId: e.id,
          linkedActivityId: e.linked_activity_id,
        });
      });

      (data.crmActivities || []).forEach((a) => {
        allEvents.push({
          id: `crm-${a.id}`,
          title: a.title || "Actividad",
          start: new Date(a.start_time),
          end: new Date(a.end_time),
          allDay: false,
          source: "CRM",
          description: a.description,
          location: a.location,
          isExternal: false,
          activityId: a.activity_id,
          activityType: a.activity_type,
          activityStatus: a.activity_status,
          customerName: a.customer_name,
        });
      });

      setEvents(allEvents);
    } catch (err) {
      setError(err.message || "Error al cargar eventos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSync = async (provider) => {
    setSyncing((prev) => ({ ...prev, [provider]: true }));
    try {
      const result = await syncCalendar(provider);
      showNotification(`${result.eventsSynced} eventos sincronizados de ${provider === "google" ? "Google" : "Outlook"}`);
      loadEvents();
    } catch (err) {
      showNotification(err.message || "Error al sincronizar", "error");
    } finally {
      setSyncing((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleCreateActivity = async () => {
    if (!selectedEvent?.eventId) return;
    setCreating(true);
    try {
      await createActivityFromEvent(selectedEvent.eventId, activityType);
      showNotification("Actividad creada exitosamente");
      setShowCreateActivity(false);
      setCreating(false);
      loadEvents();
    } catch (err) {
      showNotification(err.message || "Error al crear actividad", "error");
      setCreating(false);
    }
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = "#3b82f6";
    if (event.source === "Gmail") backgroundColor = "#ef4444";
    else if (event.source === "Outlook") backgroundColor = "#0ea5e9";
    else if (event.activityStatus === "Completada") backgroundColor = "#22c55e";
    else if (event.activityStatus === "Vencida") backgroundColor = "#f97316";

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.85,
        color: "white",
        border: "0px",
        display: "block",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  const formatDate = (date) => {
    return moment(date).format("DD/MM/YYYY HH:mm");
  };

  const activityTypes = ["Visita", "Llamada", "Reunion", "Tarea", "Email"];

  if (loading && events.length === 0) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
              <FiCalendar /> Calendario
            </h1>
            <p className="text-gray-600 text-sm">Gestiona tus actividades y eventos del calendario</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleSync("google")}
              disabled={syncing.google}
              className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 disabled:opacity-50"
            >
              {syncing.google ? <FiLoader className="animate-spin" size={14} /> : <FiRefreshCw size={14} />}
              Sync Google
            </button>
            <button
              onClick={() => handleSync("microsoft")}
              disabled={syncing.microsoft}
              className="flex items-center gap-1 bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {syncing.microsoft ? <FiLoader className="animate-spin" size={14} /> : <FiRefreshCw size={14} />}
              Sync Outlook
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex items-center gap-2 mb-4 text-xs">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Google</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Outlook</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-600 inline-block"></span> CRM</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span> Completada</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block"></span> Vencida</span>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            titleAccessor="title"
            allDayAccessor="allDay"
            style={{ height: 650 }}
            views={["month", "week", "day", "agenda"]}
            view={view}
            onView={(v) => setView(v)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            messages={{
              next: "Siguiente",
              previous: "Anterior",
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día",
              agenda: "Agenda",
              date: "Fecha",
              time: "Hora",
              event: "Evento",
              noEventsInRange: "No hay eventos en este rango",
              showMore: (total) => `+${total} más`,
            }}
          />
        </div>

        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-800">Detalle del evento</h3>
                <button onClick={() => { setSelectedEvent(null); setShowCreateActivity(false); }} className="text-gray-400 hover:text-gray-600">
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-4 space-y-3">
                {!showCreateActivity ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500">Título</p>
                      <p className="text-sm font-medium text-gray-800">{selectedEvent.title}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Inicio</p>
                      <p className="text-sm text-gray-700">{formatDate(selectedEvent.start)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Fin</p>
                      <p className="text-sm text-gray-700">{formatDate(selectedEvent.end)}</p>
                    </div>
                    {selectedEvent.location && (
                      <div>
                        <p className="text-xs text-gray-500">Ubicación</p>
                        <p className="text-sm text-gray-700">{selectedEvent.location}</p>
                      </div>
                    )}
                    {selectedEvent.description && (
                      <div>
                        <p className="text-xs text-gray-500">Descripción</p>
                        <p className="text-sm text-gray-700">{selectedEvent.description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Fuente</p>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedEvent.source === "Gmail" ? "bg-red-100 text-red-700" :
                        selectedEvent.source === "Outlook" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }`}>
                        {selectedEvent.source}
                      </span>
                    </div>
                    {selectedEvent.customerName && (
                      <div>
                        <p className="text-xs text-gray-500">Cliente</p>
                        <p className="text-sm text-gray-700">{selectedEvent.customerName}</p>
                      </div>
                    )}
                    {selectedEvent.isExternal && !selectedEvent.linkedActivityId && (
                      <button
                        onClick={() => setShowCreateActivity(true)}
                        className="w-full flex items-center justify-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                      >
                        <FiPlus size={14} /> Crear actividad desde este evento
                      </button>
                    )}
                    {selectedEvent.linkedActivityId && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <FiCheck size={14} /> Ya tiene actividad vinculada
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <h4 className="font-medium text-gray-800">Crear actividad</h4>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de actividad</label>
                      <select
                        value={activityType}
                        onChange={(e) => setActivityType(e.target.value)}
                        className="border rounded p-2 w-full text-sm"
                      >
                        {activityTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCreateActivity(false)}
                        className="flex-1 px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleCreateActivity}
                        disabled={creating}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        {creating ? <FiLoader className="animate-spin" size={14} /> : <FiCheck size={14} />}
                        {creating ? "Creando..." : "Crear"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification((n) => ({ ...n, show: false }))}
        />
      )}
    </div>
  );
}

export default CalendarPage;
