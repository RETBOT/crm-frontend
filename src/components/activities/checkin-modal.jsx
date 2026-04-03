import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiMapPin, FiX, FiNavigation } from 'react-icons/fi';

function createCheckinIcon(isUser) {
  return L.divIcon({
    html: isUser
      ? `<svg width="20" height="20" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="10" fill="#3b82f6" opacity="0.3"/>
          <circle cx="10" cy="10" r="6" fill="#3b82f6"/>
          <circle cx="10" cy="10" r="3" fill="white"/>
        </svg>`
      : `<svg width="25" height="25" viewBox="0 0 25 25">
          <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5s12.5-19.1 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="#22c55e"/>
          <circle cx="12.5" cy="12.5" r="5" fill="white"/>
        </svg>`,
    iconSize: isUser ? [20, 20] : [25, 25],
    iconAnchor: isUser ? [10, 10] : [12, 25],
    className: ''
  });
}

function DistanceCircle({ userPos, customerPos, maxRadius = 200 }) {
  const map = useMap();

  useEffect(() => {
    if (!userPos) return;

    const circle = L.circle(userPos, {
      radius: maxRadius,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.05,
      weight: 1,
      dashArray: '4, 4',
    }).addTo(map);

    return () => map.removeLayer(circle);
  }, [userPos, map, maxRadius]);

  return null;
}

function DraggableMarker({ position, onPositionChange, customerPos }) {
  const markerRef = useRef(null);
  const [pos, setPos] = useState(position);

  useEffect(() => {
    setPos(position);
  }, [position]);

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (!marker) return;
    const newPos = marker.getLatLng();
    setPos([newPos.lat, newPos.lng]);

    if (customerPos) {
      const dist = getDistance(newPos.lat, newPos.lng, customerPos[0], customerPos[1]);
      if (dist > 200) {
        marker.setLatLng(position);
        setPos(position);
        return;
      }
    }

    onPositionChange([newPos.lat, newPos.lng]);
  };

  return (
    <Marker
      position={pos}
      icon={createCheckinIcon(true)}
      draggable={true}
      ref={markerRef}
      eventHandlers={{ dragend: handleDragEnd }}
    />
  );
}

function getDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function CheckinModal({ activity, customer, onClose, onConfirm }) {
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
        setLocating(false);
      },
      () => {
        setError('No se pudo obtener tu ubicación. Verifica los permisos de ubicación.');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const customerPos = customer?.LAT && customer?.LON
    ? [parseFloat(customer.LAT), parseFloat(customer.LON)]
    : null;

  const distance = userPos && customerPos
    ? getDistance(userPos[0], userPos[1], customerPos[0], customerPos[1])
    : null;

  const centerPos = userPos || customerPos || [25.5878, -103.3809];

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <FiMapPin className="text-blue-600" />
            Confirmar check-in
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-4">
          <p className="text-sm text-gray-600 mb-3">
            <strong>{activity?.SUBJECT}</strong>
          </p>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-3">
              {error}
            </div>
          ) : locating ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">Obteniendo ubicación...</span>
            </div>
          ) : (
            <>
              <div className="rounded-lg overflow-hidden border border-gray-200 mb-3" style={{ height: '250px' }}>
                <MapContainer center={centerPos} zoom={16} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <DraggableMarker
                    position={userPos}
                    onPositionChange={setUserPos}
                    customerPos={customerPos}
                  />
                  {customerPos && (
                    <Marker position={customerPos} icon={createCheckinIcon(false)} />
                  )}
                  <DistanceCircle userPos={userPos} customerPos={customerPos} />
                </MapContainer>
              </div>

              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-gray-500">Distancia al cliente:</span>
                <span className={`font-medium ${distance > 200 ? 'text-red-600' : 'text-green-600'}`}>
                  {distance !== null ? `${Math.round(distance)}m` : 'N/A'}
                </span>
              </div>

              {distance > 200 && (
                <p className="text-xs text-amber-600 mb-3 bg-amber-50 p-2 rounded">
                  Estás a más de 200m del cliente. Puedes arrastrar el marcador azul para ajustar.
                </p>
              )}
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => userPos && onConfirm(userPos[0], userPos[1])}
              disabled={!userPos || locating}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FiNavigation size={14} />
              Confirmar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
