import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FiMapPin, FiX, FiNavigation, FiRefreshCw, FiAlertTriangle } from 'react-icons/fi';

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

function DistanceCircle({ userPos, maxRadius = 200 }) {
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

function MapPositionTracker({ position }) {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, 16, { duration: 0.8 });
    }
  }, [position, map]);

  return null;
}

function getAccuracyColor(accuracy) {
  if (accuracy < 50) return { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: 'Buena' };
  if (accuracy < 150) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: 'Regular' };
  return { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', label: 'Baja' };
}

function DraggableMarker({ position, onPositionChange, customerPos, initialGpsPos }) {
  const markerRef = useRef(null);
  const [pos, setPos] = useState(position);
  const [dragError, setDragError] = useState('');

  useEffect(() => {
    setPos(position);
    setDragError('');
  }, [position]);

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (!marker) return;
    const newPos = marker.getLatLng();
    setDragError('');

    const referencePos = customerPos || initialGpsPos;
    if (referencePos) {
      const dist = getDistance(newPos.lat, newPos.lng, referencePos[0], referencePos[1]);
      if (dist > 200) {
        marker.setLatLng(pos);
        setDragError('No puedes mover el marcador más de 200m de la ubicación original');
        return;
      }
    }

    setPos([newPos.lat, newPos.lng]);
    onPositionChange([newPos.lat, newPos.lng]);
  };

  return (
    <>
      <Marker
        position={pos}
        icon={createCheckinIcon(true)}
        draggable={true}
        ref={markerRef}
        eventHandlers={{ dragend: handleDragEnd }}
      />
      {dragError && (
        <div className="absolute bottom-2 left-2 right-2 bg-red-50 border border-red-200 text-red-700 text-xs px-2 py-1 rounded z-[1000]">
          {dragError}
        </div>
      )}
    </>
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

function fetchLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  });
}

export function CheckinModal({ activity, customer, onClose, onConfirm, onCompleteWithoutLocation }) {
  const [userPos, setUserPos] = useState(null);
  const [initialGpsPos, setInitialGpsPos] = useState(null);
  const [locating, setLocating] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [notes, setNotes] = useState('');
  const [notesError, setNotesError] = useState('');

  const needsNotes = activity?.TYPE === 'Visita' || activity?.TYPE === 'Reunion';

  const getLocation = async (isRecalculate = false) => {
    if (isRecalculate) setRecalculating(true);
    else setLocating(true);
    setError('');
    setGpsAccuracy(null);

    try {
      const pos = await fetchLocation();
      const coords = [pos.coords.latitude, pos.coords.longitude];
      setUserPos(coords);
      if (!isRecalculate) setInitialGpsPos(coords);
      setGpsAccuracy(Math.round(pos.coords.accuracy));
      if (isRecalculate) setRecalculating(false);
      else setLocating(false);
    } catch {
      setError('No se pudo obtener tu ubicación. Verifica los permisos de ubicación.');
      if (isRecalculate) setRecalculating(false);
      else setLocating(false);
    }
  };

  useEffect(() => {
    getLocation(false);
  }, []);

  const customerPos = customer?.LAT && customer?.LON
    ? [parseFloat(customer.LAT), parseFloat(customer.LON)]
    : null;

  const distance = userPos && customerPos
    ? getDistance(userPos[0], userPos[1], customerPos[0], customerPos[1])
    : null;

  const centerPos = userPos || customerPos || [25.5878, -103.3809];

  const accuracyInfo = gpsAccuracy ? getAccuracyColor(gpsAccuracy) : null;

  const handleConfirm = () => {
    if (needsNotes && notes.trim().length < 10) {
      setNotesError('Describe brevemente lo que se hizo (mínimo 10 caracteres)');
      return;
    }
    if (userPos) {
      onConfirm(userPos[0], userPos[1], notes.trim() || null);
    }
  };

  const handleCompleteWithoutLocation = () => {
    if (needsNotes && notes.trim().length < 10) {
      setNotesError('Describe brevemente lo que se hizo (mínimo 10 caracteres)');
      return;
    }
    onCompleteWithoutLocation(notes.trim() || null);
  };

  const isConfirmDisabled = !userPos || locating || recalculating;

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
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

          {needsNotes && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas de la visita <span className="text-red-500">*</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => { setNotes(e.target.value); setNotesError(''); }}
                placeholder="Describe brevemente lo que se hizo en la visita..."
                rows={3}
                className={`w-full border rounded-lg p-2 text-sm resize-none ${notesError ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
              />
              {notesError && (
                <p className="text-xs text-red-600 mt-1">{notesError}</p>
              )}
            </div>
          )}

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg mb-3">
              <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle size={14} />
                <span>{error}</span>
              </div>
              <button
                onClick={() => getLocation(true)}
                disabled={recalculating}
                className="text-xs text-red-600 hover:text-red-800 underline disabled:opacity-50"
              >
                {recalculating ? 'Recalculando...' : 'Intentar de nuevo'}
              </button>
            </div>
          ) : locating ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">Obteniendo ubicación...</span>
            </div>
          ) : (
            <>
              <div className="rounded-lg overflow-hidden border border-gray-200 mb-3 relative h-40 sm:h-[250px]">
                <MapContainer center={centerPos} zoom={16} className="h-full w-full">
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap'
                  />
                  <MapPositionTracker position={userPos} />
                  <DraggableMarker
                    position={userPos}
                    onPositionChange={setUserPos}
                    customerPos={customerPos}
                    initialGpsPos={initialGpsPos}
                  />
                  {customerPos && (
                    <Marker position={customerPos} icon={createCheckinIcon(false)} />
                  )}
                  <DistanceCircle userPos={userPos} />
                </MapContainer>
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Distancia al cliente:</span>
                <span className={`font-medium ${distance > 200 ? 'text-red-600' : 'text-green-600'}`}>
                  {distance !== null ? `${Math.round(distance)}m` : 'N/A'}
                </span>
              </div>

              {gpsAccuracy && (
                <div className={`flex items-center justify-between text-sm mb-2 px-2 py-1 rounded ${accuracyInfo.bg} ${accuracyInfo.border} border`}>
                  <span className="text-gray-600">Precisión GPS:</span>
                  <span className={`font-medium ${accuracyInfo.color}`}>
                    {gpsAccuracy}m ({accuracyInfo.label})
                  </span>
                </div>
              )}

              {gpsAccuracy >= 150 && (
                <div className="flex items-center gap-2 text-xs text-amber-600 mb-2 bg-amber-50 p-2 rounded">
                  <FiAlertTriangle size={12} />
                  Precisión baja ({gpsAccuracy}m). La ubicación registrada puede no ser exacta.
                </div>
              )}

              {distance > 200 && (
                <p className="text-xs text-amber-600 mb-2 bg-amber-50 p-2 rounded">
                  Estás a más de 200m del cliente. Puedes arrastrar el marcador azul para ajustar.
                </p>
              )}

              <div className="flex justify-end mb-3">
                <button
                  onClick={() => getLocation(true)}
                  disabled={recalculating}
                  className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                >
                  <FiRefreshCw size={12} className={recalculating ? 'animate-spin' : ''} />
                  {recalculating ? 'Recalculando...' : 'Recalcular ubicación'}
                </button>
              </div>
            </>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            {error && !locating ? (
              <button
                onClick={handleCompleteWithoutLocation}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
              >
                Completar sin ubicación
              </button>
            ) : (
              <button
                onClick={handleConfirm}
                disabled={isConfirmDisabled}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <FiNavigation size={14} />
                Confirmar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
