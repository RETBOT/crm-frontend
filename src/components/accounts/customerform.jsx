import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FiMapPin } from "react-icons/fi";

const markerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const DEFAULT_CENTER = [25.5878, -103.3809];
const DEFAULT_ZOOM = 12;

function MapClickHandler({ onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function DraggableMarker({ position, onDragEnd }) {
  const markerRef = useRef(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker) {
          const { lat, lng } = marker.getLatLng();
          onDragEnd(lat, lng);
        }
      },
    }),
    [onDragEnd]
  );

  if (!position) return null;

  return (
    <Marker
      draggable
      position={position}
      icon={markerIcon}
      ref={markerRef}
      eventHandlers={eventHandlers}
    />
  );
}

function CoordinatePicker({ lat, lon, onChange }) {
  const hasCoords = lat !== "" && lat !== null && lon !== "" && lon !== null && Number(lat) !== 0 && Number(lon) !== 0;
  const center = hasCoords ? [Number(lat), Number(lon)] : DEFAULT_CENTER;
  const markerPos = hasCoords ? [Number(lat), Number(lon)] : null;

  const handleLocationChange = useCallback(
    (newLat, newLng) => {
      onChange(newLat.toFixed(6), newLng.toFixed(6));
    },
    [onChange]
  );

  return (
    <div className="md:col-span-2">
      <div className="flex items-center gap-2 mb-2">
        <FiMapPin className="text-gray-400" />
        <span className="text-sm font-medium text-gray-700">Ubicacion en mapa</span>
        <span className="text-xs text-gray-400">(click o arrastra el marcador)</span>
      </div>
      <div className="rounded-lg overflow-hidden border" style={{ height: 280 }}>
        <MapContainer
          center={center}
          zoom={hasCoords ? 15 : DEFAULT_ZOOM}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapClickHandler onLocationChange={handleLocationChange} />
          <DraggableMarker position={markerPos} onDragEnd={handleLocationChange} />
        </MapContainer>
      </div>
      {hasCoords ? (
        <p className="text-xs text-gray-500 mt-1">
          Coordenadas: {Number(lat).toFixed(4)}, {Number(lon).toFixed(4)}
        </p>
      ) : (
        <p className="text-xs text-amber-600 mt-1">
          Haz click en el mapa para seleccionar la ubicacion
        </p>
      )}
    </div>
  );
}

export const CustomerForm = ({
  title,
  customerType,
  sucursales,
  rutas,
  initialData,
  submitLabel,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    NOMBRECLI: initialData?.NOMBRECLI || "",
    GIRO: initialData?.GIRO || "",
    CALLE: initialData?.CALLE || "",
    NUM_EXT: initialData?.NUM_EXT || "",
    COLONIA: initialData?.COLONIA || "",
    CIUDAD: initialData?.CIUDAD || "",
    ESTADO: initialData?.ESTADO || "",
    EMAIL: initialData?.EMAIL || "",
    TEL: initialData?.TEL || "",
    ESTATUS: initialData?.ESTATUS || "ACTIVO",
    SUCURSAL: initialData?.SUCURSALID || initialData?.SUCURSAL || "",
    RUTA: initialData?.RUTAID || initialData?.RUTA || "",
    LAT: initialData?.LAT ?? "",
    LON: initialData?.LON ?? "",
  });

  const availableRoutes = useMemo(() => {
    if (!formData.SUCURSAL) return rutas;
    return rutas.filter((r) => String(r.SUCURSALID) === String(formData.SUCURSAL));
  }, [rutas, formData.SUCURSAL]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCoordinateChange = useCallback((newLat, newLon) => {
    setFormData((prev) => ({ ...prev, LAT: newLat, LON: newLon }));
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave({
      ...formData,
      CLIENTEID: initialData?.CLIENTEID,
      TIPO_CLIENTE: customerType,
      SUCURSAL: formData.SUCURSAL ? Number(formData.SUCURSAL) : null,
      RUTA: formData.RUTA ? Number(formData.RUTA) : null,
      LAT: formData.LAT !== "" ? Number(formData.LAT) : null,
      LON: formData.LON !== "" ? Number(formData.LON) : null,
    });
  };

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button type="button" className="text-gray-500 hover:text-gray-700" onClick={onCancel}>
          Cancelar
        </button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input
          name="NOMBRECLI"
          value={formData.NOMBRECLI}
          onChange={handleChange}
          className="border rounded p-2"
          placeholder="Nombre"
          required
        />
        <input name="GIRO" value={formData.GIRO} onChange={handleChange} className="border rounded p-2" placeholder="Giro" />
        <input name="CALLE" value={formData.CALLE} onChange={handleChange} className="border rounded p-2" placeholder="Calle" />
        <input name="NUM_EXT" value={formData.NUM_EXT} onChange={handleChange} className="border rounded p-2" placeholder="Número exterior" />
        <input name="COLONIA" value={formData.COLONIA} onChange={handleChange} className="border rounded p-2" placeholder="Colonia" />
        <input name="CIUDAD" value={formData.CIUDAD} onChange={handleChange} className="border rounded p-2" placeholder="Ciudad" />
        <input name="ESTADO" value={formData.ESTADO} onChange={handleChange} className="border rounded p-2" placeholder="Estado" />
        <input name="EMAIL" type="email" value={formData.EMAIL} onChange={handleChange} className="border rounded p-2" placeholder="Email" />
        <input name="TEL" value={formData.TEL} onChange={handleChange} className="border rounded p-2" placeholder="Teléfono" />

        <CoordinatePicker
          lat={formData.LAT}
          lon={formData.LON}
          onChange={handleCoordinateChange}
        />

        <select name="ESTATUS" value={formData.ESTATUS} onChange={handleChange} className="border rounded p-2">
          <option value="ACTIVO">ACTIVO</option>
          <option value="INACTIVO">INACTIVO</option>
        </select>

        <select
          name="SUCURSAL"
          value={formData.SUCURSAL}
          onChange={handleChange}
          className="border rounded p-2"
        >
          <option value="">Selecciona sucursal</option>
          {sucursales.map((s) => (
            <option key={s.ID} value={s.ID}>
              {s.DSC}
            </option>
          ))}
        </select>

        <select name="RUTA" value={formData.RUTA} onChange={handleChange} className="border rounded p-2">
          <option value="">Selecciona ruta</option>
          {availableRoutes.map((r) => (
            <option key={r.ID} value={r.ID}>
              {r.DSC}
            </option>
          ))}
        </select>

        <div className="md:col-span-2 flex justify-end gap-2 mt-2">
          <button type="button" className="px-4 py-2 border rounded text-gray-700" onClick={onCancel}>
            Cancelar
          </button>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            {submitLabel || "Guardar"}
          </button>
        </div>
      </form>
    </div>
  );
};
