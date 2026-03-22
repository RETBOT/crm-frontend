import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster/dist/leaflet.markercluster.js';
import L from 'leaflet';
import { FiMapPin, FiSearch } from 'react-icons/fi';
import { getClientes, getRutas, getSucursales } from '../../api/accounts';

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

  return container;
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

      const marker = L.marker([lat, lng], { icon: customIcon });
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

export function Maps() {
  const [clientes, setClientes] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [sucursales, setSucursales] = useState([]);
  const [rutas, setRutas] = useState([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: '',
    sucursal: '',
    salesRep: ''
  });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialCenter] = useState([25.5878, -103.3809]);
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
        const formattedData = Array.isArray(clientesData) ? clientesData : [clientesData];

        setClientes(formattedData);
        setTotalPaginas(totalPaginasData);
      } catch (fetchError) {
        console.error('Error al cargar clientes:', fetchError);
        setError(fetchError?.message || 'No se pudieron cargar los clientes');
        setClientes([]);
        setTotalPaginas(1);
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
    if (!clienteSeleccionado) return;

    const existsInCurrentList = clientes.some(
      (cliente) => normalizeId(cliente.CLIENTEID) === normalizeId(clienteSeleccionado.CLIENTEID)
    );

    if (!existsInCurrentList) {
      setClienteSeleccionado(null);
    }
  }, [clientes, clienteSeleccionado]);

  const handleFilterChange = (key, value) => {
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
  };

  const hasCoordinates = (cliente) => {
    const lat = Number(cliente?.LAT);
    const lon = Number(cliente?.LON);
    return Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;
  };

  const getAddressText = (cliente) =>
    [cliente?.CALLE, cliente?.NUM_EXT, cliente?.COLONIA, cliente?.CIUDAD, cliente?.ESTADO]
      .filter(Boolean)
      .join(', ');

  const openGoogleMapsByAddress = (cliente) => {
    const address = getAddressText(cliente) || cliente?.NOMBRECLI;
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const clientesConCoordenadas = useMemo(
    () => clientes.filter((cliente) => hasCoordinates(cliente)),
    [clientes]
  );

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <div className="w-full md:w-1/3 bg-white shadow-lg overflow-y-auto h-1/2 md:h-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Filtros de Clientes</h2>

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
        </div>

        <div className="p-4">
          {error && !loading && (
            <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No se encontraron clientes</div>
          ) : (
            <ul className="space-y-2">
              {clientes.map((cliente) => (
                <li
                  key={cliente.CLIENTEID}
                  className="p-3 mb-2 border rounded hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => {
                    if (hasCoordinates(cliente)) {
                      setClienteSeleccionado(cliente);
                      return;
                    }

                    openGoogleMapsByAddress(cliente);
                  }}
                >
                  <h3 className="font-bold">{cliente.NOMBRECLI}</h3>
                  <p className="text-sm text-gray-600">{cliente.GIRO}</p>
                  {hasCoordinates(cliente) ? (
                    <p className="text-xs text-gray-500 mt-1">
                      <FiMapPin className="inline mr-1" />
                      {parseFloat(cliente.LAT).toFixed(4)}, {parseFloat(cliente.LON).toFixed(4)}
                    </p>
                  ) : (
                    <p className="text-xs text-amber-600 mt-1">Sin coordenadas, se abre por direccion</p>
                  )}
                </li>
              ))}
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
      </div>

      <div className="w-full md:w-2/3 h-1/2 md:h-full">
        <MapContainer center={initialCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

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
