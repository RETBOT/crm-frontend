import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import L from 'leaflet';
import { FiMapPin, FiSearch, FiNavigation, FiX, FiCheck, FiMinus, FiMap, FiTrash2, FiLoader } from 'react-icons/fi';
import { getClientes, getRutas, getSucursales } from '../../api/accounts';
import { getActividadesCheckins } from '../../api/activities';

const STATUS_COLORS = {
  ACTIVO: '#22c55e',
  INACTIVO: '#9ca3af',
};

function createCustomIcon(estatus) {
  const color = STATUS_COLORS[estatus] || '#3b82f6';

  return L.divIcon({
    html: `<svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5s12.5-19.1 12.5-28.5C25 5.6 19.4 0 12.5 0z" fill="${color}"/>
      <circle cx="12.5" cy="12.5" r="5" fill="white"/>
    </svg>`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    className: ''
  });
}

function createNumberedIcon(number) {
  return L.divIcon({
    html: `<svg width="28" height="28" viewBox="0 0 28 28">
      <circle cx="14" cy="14" r="14" fill="#2563eb"/>
      <text x="14" y="14" text-anchor="middle" dominant-baseline="central" fill="white" font-size="13" font-weight="bold" font-family="sans-serif">${number}</text>
    </svg>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    className: ''
  });
}

function createCheckinIcon() {
  return L.divIcon({
    html: `<svg width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="12" fill="#7c3aed"/>
      <path d="M7 12l3 3 7-7" stroke="white" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    className: ''
  });
}

function CheckinsLayer({ checkins }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    if (!checkins?.length) return;

    checkins.forEach((ci) => {
      const marker = L.marker([ci.CHECK_IN_LAT, ci.CHECK_IN_LON], { icon: createCheckinIcon(), zIndexOffset: 1500 })
        .bindPopup(`
          <div style="min-width:200px">
            <strong>📌 ${ci.TYPE_NAME || ci.TYPE}</strong><br/>
            <span style="font-size:13px">${ci.SUBJECT}</span><br/>
            <span style="font-size:12px;color:#6b7280">Cliente: ${ci.NOMBRECLI}</span><br/>
            <span style="font-size:12px;color:#6b7280">Usuario: ${ci.OWNER_NAME || 'N/A'}</span><br/>
            <span style="font-size:12px;color:#6b7280">Fecha: ${ci.COMPLETED_AT ? new Date(ci.COMPLETED_AT).toLocaleString('es-MX') : 'N/A'}</span>
          </div>
        `)
        .addTo(map);
      layersRef.current.push(marker);
    });

    return () => {
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];
    };
  }, [checkins, map]);

  return null;
}

const normalizeId = (value) => (value === undefined || value === null ? '' : String(value));

function createPopupContent(cliente, rutas) {
  const container = document.createElement('div');

  const title = document.createElement('h3');
  title.className = 'font-bold text-base mb-1';
  title.textContent = cliente.NOMBRECLI;
  container.appendChild(title);

  if (cliente.GIRO) {
    const giro = document.createElement('p');
    giro.className = 'text-sm text-gray-600 mb-1';
    giro.textContent = cliente.GIRO;
    container.appendChild(giro);
  }

  if (cliente.SUCURSAL) {
    const sucursal = document.createElement('p');
    sucursal.className = 'text-xs text-gray-500 mt-1';
    sucursal.textContent = '\u{1F4CD} ' + cliente.SUCURSAL;
    container.appendChild(sucursal);
  }

  if (cliente.RUTA) {
    const rutaDsc = rutas.find((r) => normalizeId(r.ID) === normalizeId(cliente.RUTA))?.DSC || cliente.RUTA;
    const ruta = document.createElement('p');
    ruta.className = 'text-xs';
    ruta.textContent = 'Ruta: ' + rutaDsc;
    container.appendChild(ruta);
  }

  if (cliente.TEL) {
    const tel = document.createElement('p');
    tel.className = 'text-xs';
    tel.textContent = '\u{1F4DE} ' + cliente.TEL;
    container.appendChild(tel);
  }

  const statusBadge = document.createElement('span');
  statusBadge.className = `inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
    cliente.ESTATUS === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
  }`;
  statusBadge.textContent = cliente.ESTATUS || 'DESCONOCIDO';
  container.appendChild(statusBadge);

  return container;
}

function LocateControl({ onLocationFound }) {
  const map = useMap();
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');

  const handleClick = () => {
    setLocating(true);
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocalización no soportada');
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.flyTo([latitude, longitude], 16, { duration: 0.8 });
        onLocationFound([latitude, longitude]);
        setLocating(false);
      },
      () => {
        setError('No se pudo obtener tu ubicación');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end gap-2">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg shadow flex items-center gap-2">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">
            <FiX size={12} />
          </button>
        </div>
      )}
      <button
        onClick={handleClick}
        disabled={locating}
        className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-lg border border-gray-200 text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        title="Centrar en mi ubicación"
      >
        <FiNavigation className={locating ? 'animate-spin' : ''} size={16} />
        {locating ? 'Ubicando...' : 'Mi ubicación'}
      </button>
    </div>
  );
}

async function geocodeAddress(query) {
  const url = `https://nominatim.openstreetmap.org/search?${new URLSearchParams({
    q: query,
    format: 'json',
    limit: 1,
    addressdetails: 1,
  })}`;
  const response = await fetch(url, {
    headers: { 'User-Agent': 'RETFlow-CRM/1.0' },
  });
  const data = await response.json();
  if (data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

function UserLocationMarker({ location }) {
  const map = useMap();
  useEffect(() => {
    if (!location) return;
    const icon = L.divIcon({
      html: `<svg width="20" height="20" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="10" fill="#3b82f6" opacity="0.3"/>
        <circle cx="10" cy="10" r="6" fill="#3b82f6"/>
        <circle cx="10" cy="10" r="3" fill="white"/>
      </svg>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: ''
    });
    const marker = L.marker(location, { icon, zIndexOffset: 1000 })
      .bindPopup('<strong>Tu ubicación</strong>')
      .addTo(map);
    return () => map.removeLayer(marker);
  }, [location, map]);
  return null;
}

function MapSearchBar() {
  const map = useMap();
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    try {
      const result = await geocodeAddress(query);
      if (result) {
        map.flyTo([result.lat, result.lng], 16, { duration: 0.8 });
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="absolute top-4 right-4 z-[800] flex flex-col gap-2">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2">
        <FiSearch className="text-gray-400 self-center ml-1" size={16} />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setNotFound(false); }}
          onKeyDown={handleKeyDown}
          placeholder="Buscar dirección..."
          className="px-2 py-1.5 border-0 outline-none text-sm w-56 focus:ring-0"
        />
        <button
          onClick={handleSearch}
          disabled={searching || !query.trim()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {searching ? '...' : 'Buscar'}
        </button>
      </div>
      {notFound && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-lg shadow flex items-center gap-2">
          <span>No se encontró la dirección</span>
          <button onClick={() => setNotFound(false)} className="text-red-400 hover:text-red-600">
            <FiX size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

function RouteLayer({ routeResult }) {
  const map = useMap();
  const layersRef = useRef([]);

  useEffect(() => {
    layersRef.current.forEach((layer) => map.removeLayer(layer));
    layersRef.current = [];

    if (!routeResult) return;

    if (routeResult.type === 'osrm' && routeResult.geometry) {
      const polyline = L.geoJSON(routeResult.geometry, {
        style: { color: '#2563eb', weight: 5, opacity: 0.8 },
      }).addTo(map);
      layersRef.current.push(polyline);
    } else if (routeResult.type === 'fallback') {
      routeResult.coords.forEach((pair, i) => {
        if (i < routeResult.coords.length - 1) {
          const line = L.polyline([pair, routeResult.coords[i + 1]], {
            color: '#9ca3af',
            weight: 3,
            dashArray: '8, 8',
            opacity: 0.7,
          }).addTo(map);
          layersRef.current.push(line);
        }
      });
    }

    if (routeResult.markers) {
      routeResult.markers.forEach(({ coord, number, label }) => {
        const marker = L.marker(coord, { icon: createNumberedIcon(number), zIndexOffset: 2000 })
          .bindPopup(`<strong>${label || `Parada ${number}`}</strong>`)
          .addTo(map);
        layersRef.current.push(marker);
      });
    }

    return () => {
      layersRef.current.forEach((layer) => map.removeLayer(layer));
      layersRef.current = [];
    };
  }, [routeResult, map]);

  return null;
}

function MapStatePersister({ onMapStateChange }) {
  const map = useMap();

  useEffect(() => {
    const handleMove = () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      onMapStateChange({ lat: center.lat, lng: center.lng, zoom });
    };

    map.on('moveend zoomend', handleMove);
    return () => {
      map.off('moveend zoomend', handleMove);
    };
  }, [map, onMapStateChange]);

  return null;
}

function CheckinFlyTo({ selected }) {
  const map = useMap();

  useEffect(() => {
    if (selected?.CLIENTEID?.startsWith('checkin-') && selected?.LAT && selected?.LON) {
      map.flyTo([selected.LAT, selected.LON], 17, { duration: 0.8 });
    }
  }, [selected, map]);

  return null;
}

function MarkerClusterLayer({ clientesConCoordenadas, rutas, markersRef, clienteSeleccionado }) {
  const map = useMap();
  const clusterRef = useRef(null);

  useEffect(() => {
    clusterRef.current = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50,
      disableClusteringAtZoom: 17
    });

    map.addLayer(clusterRef.current);

    return () => {
      map.removeLayer(clusterRef.current);
      clusterRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    markersRef.current = {};

    clientesConCoordenadas.forEach((cliente) => {
      const lat = parseFloat(cliente.LAT);
      const lng = parseFloat(cliente.LON);

      if (Number.isNaN(lat) || Number.isNaN(lng)) return;

      const icon = createCustomIcon(cliente.ESTATUS);
      const marker = L.marker([lat, lng], { icon });
      const popupContent = createPopupContent(cliente, rutas);

      marker.bindPopup(L.popup({ maxWidth: 300, minWidth: 200 }).setContent(popupContent));

      markersRef.current[cliente.CLIENTEID] = marker;
      cluster.addLayer(marker);
    });
  }, [clientesConCoordenadas, rutas, markersRef]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster || !clienteSeleccionado) return;

    const clientId = normalizeId(clienteSeleccionado.CLIENTEID);
    const marker = markersRef.current[clientId];

    if (marker) {
      cluster.zoomToShowLayer(marker, () => {
        map.flyTo(marker.getLatLng(), 17, { duration: 0.8 });
        marker.openPopup();
      });
    }
  }, [clienteSeleccionado, map, markersRef]);

  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster || !clientesConCoordenadas.length || clienteSeleccionado) return;

    const bounds = L.latLngBounds(
      clientesConCoordenadas.map((item) => [Number(item.LAT), Number(item.LON)])
    );

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
  }, [clientesConCoordenadas, clienteSeleccionado, map]);

  return null;
}

async function calculateOptimalRoute(selectedClients, userLocation) {
  let allPoints = [...selectedClients];

  if (userLocation) {
    allPoints = [
      { NOMBRECLI: 'Tu ubicación', LAT: userLocation[0], LON: userLocation[1], _isUser: true },
      ...selectedClients,
    ];
  }

  const coords = allPoints
    .filter(hasCoordinates)
    .map((c) => [parseFloat(c.LON), parseFloat(c.LAT)]);

  if (coords.length < 2) return null;

  const coordString = coords.map(([lon, lat]) => `${lon},${lat}`).join(';');
  const url = `http://router.project-osrm.org/trip/v1/driving/${coordString}?overview=full&geometries=geojson&steps=true&source=first`;

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error('OSRM error');
    const data = await response.json();

    if (data.code !== 'Ok' || !data.trips?.[0]) throw new Error('No route found');

    const trip = data.trips[0];
    const waypoints = data.waypoints || [];

    const markers = waypoints.map((wp, i) => ({
      coord: [wp.location[1], wp.location[0]],
      number: i + 1,
      label: allPoints[i]?._isUser ? 'Tu ubicación' : `Parada ${i + 1}`,
    }));

    const legs = trip.legs || [];
    const segments = legs.map((leg, i) => ({
      from: allPoints[i]?.NOMBRECLI || `Punto ${i + 1}`,
      to: allPoints[i + 1]?.NOMBRECLI || `Punto ${i + 2}`,
      distance: (leg.distance / 1000).toFixed(1),
      duration: Math.round(leg.duration / 60),
    }));

    const totalDistance = (trip.distance / 1000).toFixed(1);
    const totalDuration = Math.round(trip.duration / 60);

    return {
      type: 'osrm',
      geometry: trip.geometry,
      markers,
      segments,
      totalDistance,
      totalDuration,
    };
  } catch {
    const fallbackCoords = coords.map(([lon, lat]) => [lat, lon]);
    const markers = fallbackCoords.map((coord, i) => ({
      coord,
      number: i + 1,
      label: allPoints[i]?._isUser ? 'Tu ubicación' : `Parada ${i + 1}`,
    }));

    return {
      type: 'fallback',
      coords: fallbackCoords,
      markers,
      segments: allPoints.slice(0, -1).map((c, i) => ({
        from: c.NOMBRECLI,
        to: allPoints[i + 1]?.NOMBRECLI || 'Final',
        distance: 'N/A',
        duration: 'N/A',
      })),
      totalDistance: 'N/A',
      totalDuration: 'N/A',
    };
  }
}

function hasCoordinates(cliente) {
  const lat = Number(cliente?.LAT);
  const lon = Number(cliente?.LON);
  return Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;
}

function getAddressText(cliente) {
  return [cliente?.CALLE, cliente?.NUM_EXT, cliente?.COLONIA, cliente?.CIUDAD, cliente?.ESTADO]
    .filter(Boolean)
    .join(', ');
}

function openGoogleMapsByAddress(cliente) {
  const address = getAddressText(cliente) || cliente?.NOMBRECLI;
  const query = encodeURIComponent(address);
  window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
}

function readUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    lat: params.get('lat') ? parseFloat(params.get('lat')) : null,
    lng: params.get('lng') ? parseFloat(params.get('lng')) : null,
    zoom: params.get('z') ? parseInt(params.get('z')) : null,
    search: params.get('search') || '',
    sucursal: params.get('sucursal') || '',
    ruta: params.get('ruta') || '',
    status: params.get('status') || '',
    page: params.get('page') ? parseInt(params.get('page')) : 1,
  };
}

function writeUrlParams(params) {
  const searchParams = new URLSearchParams();
  if (params.lat) searchParams.set('lat', params.lat.toFixed(6));
  if (params.lng) searchParams.set('lng', params.lng.toFixed(6));
  if (params.zoom) searchParams.set('z', params.zoom);
  if (params.search) searchParams.set('search', params.search);
  if (params.sucursal) searchParams.set('sucursal', params.sucursal);
  if (params.ruta) searchParams.set('ruta', params.ruta);
  if (params.status) searchParams.set('status', params.status);
  if (params.page && params.page > 1) searchParams.set('page', params.page);

  const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
  window.history.replaceState({}, '', newUrl);
}

export function Maps() {
  const urlParams = readUrlParams();

  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(urlParams.page);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegs, setTotalRegs] = useState(0);
  const [sucursales, setSucursales] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [selectedClients, setSelectedClients] = useState(new Set());
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [checkins, setCheckins] = useState([]);
  const [activeMapTab, setActiveMapTab] = useState('clientes');
  const [checkinDateFrom, setCheckinDateFrom] = useState('');
  const [checkinDateTo, setCheckinDateTo] = useState('');
  const [checkinType, setCheckinType] = useState('');
  const [checkinsLoading, setCheckinsLoading] = useState(false);
  const [checkinsPage, setCheckinsPage] = useState(1);
  const [checkinsTotal, setCheckinsTotal] = useState(0);
  const [filters, setFilters] = useState({
    searchTerm: urlParams.search,
    status: urlParams.status,
    sucursal: urlParams.sucursal,
    salesRep: urlParams.ruta,
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(urlParams.search);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialCenter] = useState([
    urlParams.lat || 25.5878,
    urlParams.lng || -103.3809,
  ]);
  const [initialZoom] = useState(urlParams.zoom || 13);
  const [userLocation, setUserLocation] = useState(null);
  const markersRef = useRef({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchTerm(filters.searchTerm);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [filters.searchTerm]);

  useEffect(() => {
    const fetchClientes = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await getClientes(
          0,
          debouncedSearchTerm,
          filters.sucursal,
          filters.status,
          filters.salesRep,
          page,
          0,
          'MAPA'
        );
        const clientesData = res.data || res;
        const totalPaginasData = res.tot_pags || 1;
        const totalRegsData = res.total_regs || 0;
        const formattedData = Array.isArray(clientesData) ? clientesData : [clientesData];

        setClientes(formattedData);
        setTotalPaginas(totalPaginasData);
        setTotalRegs(totalRegsData);
      } catch (fetchError) {
        console.error('Error al cargar clientes:', fetchError);
        setError(fetchError?.message || 'No se pudieron cargar los clientes');
        setClientes([]);
        setTotalPaginas(1);
        setTotalRegs(0);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [page, debouncedSearchTerm, filters.sucursal, filters.status, filters.salesRep]);

  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await getSucursales('');
        setSucursales(Array.isArray(res) ? res : res.data || []);
      } catch (fetchError) {
        console.error('Error al cargar sucursales:', fetchError);
      }
    };

    fetchSucursales();
  }, []);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const res = await getRutas(filters.sucursal);
        const rutasData = Array.isArray(res) ? res : res.data || [];
        setRutas(rutasData);

        if (
          filters.salesRep &&
          !rutasData.some((ruta) => normalizeId(ruta.ID) === normalizeId(filters.salesRep))
        ) {
          setFilters((prev) => ({ ...prev, salesRep: '' }));
        }
      } catch (fetchError) {
        console.error('Error al cargar rutas:', fetchError);
        setRutas([]);
      }
    };

    fetchRutas();
  }, [filters.sucursal]);

  useEffect(() => {
    if (activeMapTab !== 'checkins') {
      setCheckins([]);
      return;
    }
    setCheckinsLoading(true);
    const fetchCheckins = async () => {
      try {
        const res = await getActividadesCheckins({
          FROM_DATE: checkinDateFrom || null,
          TO_DATE: checkinDateTo || null,
          TYPE: checkinType || null,
        });
        const data = Array.isArray(res) ? res : (res.data || []);
        setCheckins(data);
        setCheckinsTotal(data.length);
      } catch {
        setCheckins([]);
        setCheckinsTotal(0);
      } finally {
        setCheckinsLoading(false);
      }
    };
    fetchCheckins();
  }, [activeMapTab, checkinDateFrom, checkinDateTo, checkinType]);

  useEffect(() => {
    if (!clienteSeleccionado) return;
    if (clienteSeleccionado.CLIENTEID?.startsWith('checkin-')) return;

    const existsInCurrentList = clientes.some(
      (cliente) => normalizeId(cliente.CLIENTEID) === normalizeId(clienteSeleccionado.CLIENTEID)
    );

    if (!existsInCurrentList) {
      setClienteSeleccionado(null);
    }
  }, [clientes, clienteSeleccionado]);

  useEffect(() => {
    writeUrlParams({
      lat: initialCenter[0],
      lng: initialCenter[1],
      zoom: initialZoom,
      search: filters.searchTerm,
      sucursal: filters.sucursal,
      ruta: filters.salesRep,
      status: filters.status,
      page,
    });
  }, [initialCenter, initialZoom, filters, page]);

  const handleFilterChange = useCallback((key, value) => {
    const normalizedValue = value === 'all' ? '' : value;

    setPage(1);
    setFilters((prev) => {
      const nextFilters = {
        ...prev,
        [key]: normalizedValue
      };

      if (key === 'sucursal') {
        nextFilters.salesRep = '';
      }

      return nextFilters;
    });
  }, []);

  const handleMapStateChange = useCallback((state) => {
    writeUrlParams({
      lat: state.lat,
      lng: state.lng,
      zoom: state.zoom,
      search: filters.searchTerm,
      sucursal: filters.sucursal,
      ruta: filters.salesRep,
      status: filters.status,
      page,
    });
  }, [filters, page]);

  const toggleClientSelection = useCallback((clientId) => {
    setSelectedClients((prev) => {
      const next = new Set(prev);
      if (next.has(clientId)) {
        next.delete(clientId);
      } else {
        next.add(clientId);
      }
      return next;
    });
    setRouteResult(null);
  }, []);

  const handleCalculateRoute = async () => {
    const selected = clientes.filter((c) => selectedClients.has(c.CLIENTEID) && hasCoordinates(c));
    const minClients = userLocation ? 1 : 2;
    if (selected.length < minClients) return;

    setRouteLoading(true);
    setRouteResult(null);
    try {
      const result = await calculateOptimalRoute(selected, userLocation);
      setRouteResult(result);
    } catch {
      setRouteResult(null);
    } finally {
      setRouteLoading(false);
    }
  };

  const handleClearRoute = () => {
    setSelectedClients(new Set());
    setRouteResult(null);
  };

  const clientesConCoordenadas = useMemo(
    () => clientes.filter((cliente) => hasCoordinates(cliente)),
    [clientes]
  );

  const selectedClientsCount = selectedClients.size;
  const selectedClientsWithCoords = clientes.filter(
    (c) => selectedClients.has(c.CLIENTEID) && hasCoordinates(c)
  );

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/3 bg-white shadow-lg overflow-y-auto h-1/2 md:h-auto">
        {/* Tabs */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeMapTab === 'clientes'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveMapTab('clientes')}
          >
            📍 Clientes
          </button>
          <button
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeMapTab === 'checkins'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveMapTab('checkins')}
          >
            📌 Check-ins
          </button>
        </div>

        {activeMapTab === 'clientes' ? (
          <>
            <div className="p-4 border-b">
              <div className="flex items-center mb-4 relative">
                <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  className="pl-10 pr-4 py-2 w-full border rounded-lg"
                  placeholder="Buscar clientes..."
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                <select
                  className="border rounded p-2 text-sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">Todos los estatus</option>
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="INACTIVO">INACTIVO</option>
                </select>

                <select
                  className="border rounded p-2 text-sm"
                  value={filters.sucursal}
                  onChange={(e) => handleFilterChange('sucursal', e.target.value)}
                >
                  <option value="">Todas las sucursales</option>
                  {sucursales.map((sucursal) => (
                    <option key={sucursal.ID} value={normalizeId(sucursal.ID)}>
                      {sucursal.DSC}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <select
                  className="border rounded p-2 text-sm w-full"
                  value={filters.salesRep}
                  onChange={(e) => handleFilterChange('salesRep', e.target.value)}
                >
                  <option value="">
                    Todas las rutas
                    {filters.sucursal
                      ? ` de ${sucursales.find((sucursal) => normalizeId(sucursal.ID) === normalizeId(filters.sucursal))?.DSC || ''}`
                      : ''}
                  </option>
                  {rutas.map((ruta) => (
                    <option key={ruta.ID} value={normalizeId(ruta.ID)}>
                      {ruta.DSC}
                    </option>
                  ))}
                </select>
              </div>

              {selectedClientsCount >= (userLocation ? 1 : 2) && (
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={handleCalculateRoute}
                    disabled={routeLoading || selectedClientsWithCoords.length < (userLocation ? 1 : 2)}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {routeLoading ? (
                      <FiLoader className="animate-spin" size={16} />
                    ) : (
                      <FiMap size={16} />
                    )}
                    {routeLoading ? 'Calculando...' : userLocation ? 'Calcular ruta desde mi ubicación' : 'Calcular ruta óptima'}
                  </button>
                  <button
                    onClick={handleClearRoute}
                    className="flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm transition-colors"
                    title="Limpiar selección"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="p-4">
              {error && !loading && (
                <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {totalRegs > 0 && (
                <p className="text-xs text-gray-500 mb-3">
                  Mostrando {clientes.length} de {totalRegs} clientes
                  {selectedClientsCount > 0 && ` · ${selectedClientsCount} seleccionados`}
                </p>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              ) : clientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No se encontraron clientes</div>
              ) : (
                <ul className="space-y-2">
                  {clientes.map((cliente) => {
                    const isSelected = selectedClients.has(cliente.CLIENTEID);
                    const hasCoords = hasCoordinates(cliente);

                    return (
                      <li
                        key={cliente.CLIENTEID}
                        className={`p-3 mb-2 border rounded transition-colors ${
                          normalizeId(clienteSeleccionado?.CLIENTEID) === normalizeId(cliente.CLIENTEID)
                            ? 'bg-blue-50 border-blue-300'
                            : isSelected
                              ? 'bg-green-50 border-green-300'
                              : 'hover:bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (hasCoords) toggleClientSelection(cliente.CLIENTEID);
                            }}
                            disabled={!hasCoords}
                            className={`mt-0.5 flex-shrink-0 ${!hasCoords ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={hasCoords ? (isSelected ? 'Deseleccionar' : 'Seleccionar para ruta') : 'Sin coordenadas'}
                          >
                            {isSelected ? (
                              <FiCheck size={18} className="text-green-600" />
                            ) : (
                              <FiMinus size={18} className="text-gray-400" />
                            )}
                          </button>

                          <div
                            className="flex-1 cursor-pointer"
                            onClick={() => {
                              if (hasCoords) {
                                setClienteSeleccionado(cliente);
                              } else {
                                openGoogleMapsByAddress(cliente);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold">{cliente.NOMBRECLI}</h3>
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                cliente.ESTATUS === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {cliente.ESTATUS || 'DESCONOCIDO'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">{cliente.GIRO}</p>
                            {hasCoords ? (
                              <p className="text-xs text-gray-500 mt-1">
                                <FiMapPin className="inline mr-1" />
                                {parseFloat(cliente.LAT).toFixed(4)}, {parseFloat(cliente.LON).toFixed(4)}
                              </p>
                            ) : (
                              <p className="text-xs text-amber-600 mt-1">Sin coordenadas, se abre por dirección</p>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="flex justify-between items-center p-3 border-t">
              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={page === 1}
              >
                Anterior
              </button>
              <span className="text-gray-600 text-sm">Pag. {page} / {totalPaginas}</span>
              <button
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm disabled:opacity-50"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPaginas}
              >
                Siguiente
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="p-4 border-b">
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Desde</label>
                  <input
                    type="date"
                    value={checkinDateFrom}
                    onChange={(e) => setCheckinDateFrom(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Hasta</label>
                  <input
                    type="date"
                    value={checkinDateTo}
                    onChange={(e) => setCheckinDateTo(e.target.value)}
                    className="w-full border rounded px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              <div className="mb-3">
                <select
                  className="border rounded p-2 text-sm w-full"
                  value={checkinType}
                  onChange={(e) => setCheckinType(e.target.value)}
                >
                  <option value="">Todos los tipos</option>
                  <option value="Visita">Visita</option>
                  <option value="Reunion">Reunión</option>
                  <option value="Llamada">Llamada</option>
                  <option value="Correo">Correo</option>
                  <option value="Tarea">Tarea</option>
                </select>
              </div>
            </div>

            <div className="p-4">
              {checkinsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              ) : checkins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No se encontraron check-ins</div>
              ) : (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    {checkinsTotal} check-in(s) encontrados
                  </p>
                  <ul className="space-y-2">
                    {checkins.map((ci, idx) => (
                      <li
                        key={ci.ACTIVITYID || idx}
                        className="p-3 mb-2 border rounded hover:bg-purple-50 transition-colors cursor-pointer"
                        onClick={() => {
                          if (ci.CHECK_IN_LAT && ci.CHECK_IN_LON) {
                            setClienteSeleccionado({
                              CLIENTEID: `checkin-${ci.ACTIVITYID}`,
                              NOMBRECLI: ci.NOMBRECLI,
                              GIRO: `${ci.TYPE_NAME || ci.TYPE} - ${ci.SUBJECT}`,
                              LAT: ci.CHECK_IN_LAT,
                              LON: ci.CHECK_IN_LON,
                            });
                          }
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-sm">{ci.NOMBRECLI}</h3>
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {ci.TYPE_NAME || ci.TYPE}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">{ci.SUBJECT}</p>
                        {ci.NOTES && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ci.NOTES}</p>
                        )}
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>{ci.OWNER_NAME || 'N/A'}</span>
                          <span>{ci.COMPLETED_AT ? new Date(ci.COMPLETED_AT).toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}

        {routeResult && activeMapTab === 'clientes' && (
          <div className="p-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-blue-800 flex items-center gap-1">
                <FiMap size={14} /> Ruta calculada
                {routeResult.type === 'fallback' && (
                  <span className="text-xs text-amber-600 font-normal">(directa)</span>
                )}
              </h4>
              <button onClick={() => setRouteResult(null)} className="text-gray-400 hover:text-gray-600">
                <FiX size={14} />
              </button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {routeResult.segments.map((seg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-blue-700 w-5">{i + 1}.</span>
                  <span className="flex-1 truncate">{seg.from}</span>
                  {seg.distance !== 'N/A' && (
                    <span className="text-gray-500 whitespace-nowrap">{seg.distance} km · {seg.duration} min</span>
                  )}
                </div>
              ))}
              {routeResult.segments.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-bold text-blue-700 w-5">{routeResult.segments.length + 1}.</span>
                  <span className="flex-1 truncate">{routeResult.segments[routeResult.segments.length - 1]?.to}</span>
                </div>
              )}
            </div>
            <div className="text-xs text-blue-600 mt-2 font-medium">
              {routeResult.totalDistance !== 'N/A' ? `${routeResult.totalDistance} km` : ''}
              {routeResult.totalDuration !== 'N/A' ? ` · ${routeResult.totalDuration} min` : ''}
            </div>
          </div>
        )}
      </div>

      <div className="w-full md:w-2/3 h-1/2 md:h-full relative">
        <MapContainer center={initialCenter} zoom={initialZoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          <MapStatePersister onMapStateChange={handleMapStateChange} />
          <CheckinFlyTo selected={clienteSeleccionado} />
          <MapSearchBar />
          <LocateControl onLocationFound={setUserLocation} />
          <UserLocationMarker location={userLocation} />
          <RouteLayer routeResult={routeResult} />
          {activeMapTab === 'checkins' && <CheckinsLayer checkins={checkins} />}

          <MarkerClusterLayer
            clientesConCoordenadas={clientesConCoordenadas}
            rutas={rutas}
            markersRef={markersRef}
            clienteSeleccionado={clienteSeleccionado}
          />
        </MapContainer>
      </div>
    </div>
  );
}

export default Maps;
