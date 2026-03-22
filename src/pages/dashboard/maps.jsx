import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FiSearch, FiFilter, FiMapPin, FiUser, FiPhone } from 'react-icons/fi';
import { getClientes, getSucursales, getRutas } from "../../api/accounts";

const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function MoverMapa({ cliente }) {
  const map = useMap();

  useEffect(() => {
    if (!cliente?.LAT || !cliente?.LON) return;

    const lat = parseFloat(cliente.LAT);
    const lng = parseFloat(cliente.LON);

    if (!isNaN(lat) && !isNaN(lng)) {
      map.flyTo([lat, lng], 15, { duration: 1 });
    }
  }, [cliente]);

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
    searchTerm: "",
    status: "",
    sucursal: "",
    salesRep: ""
  });
  const [loading, setLoading] = useState(true);
  const [initialCenter] = useState([25.5878, -103.3809]);
  const markersRef = useRef({});

  useEffect(() => { setPage(1); fetchClientes();}, [filters]);
  useEffect(() => { fetchClientes(); }, [page]);

  const fetchClientes = async () => {
      setLoading(true);
      try {
        const res = await getClientes(0, filters.searchTerm, filters.sucursal, filters.status, filters.salesRep, page, 0, 'MAPA');
        const clientesData = res.data || res;
        const total_paginas = res.tot_pags || 1;
        const formattedData = Array.isArray(clientesData) ? clientesData : [clientesData];
        setClientes(formattedData);
        setTotalPaginas(total_paginas);
      } catch (error) {
        console.error("Error al cargar clientes:", error);
        setClientes([]);
        setTotalPaginas(1);
      } finally {
        setLoading(false);
      }
  };

  
  useEffect(() => {
    const fetchSucursales = async () => {
      try {
        const res = await getSucursales("");
        setSucursales(Array.isArray(res) ? res : (res.data || []));
      } catch (error) {
        console.error("Error al cargar sucursales:", error);
      }
    };
    fetchSucursales();
  }, []);

  useEffect(() => {
    const fetchRutas = async () => {
      try {
        const res = await getRutas(filters.sucursal);
        const rutasData = Array.isArray(res) ? res : (res.data || []);
        setRutas(rutasData);

        if (filters.salesRep && !rutasData.some(r => r.ID === filters.salesRep)) {
          setFilters(prev => ({ ...prev, salesRep: "" }));
        }
      } catch (error) {
        console.error("Error al cargar rutas:", error);
        setRutas([]);
      }
    };
    fetchRutas();
  }, [filters.sucursal]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? "" : value
    }));
  };

  const hasCoordinates = (cliente) => {
    const lat = Number(cliente?.LAT);
    const lon = Number(cliente?.LON);
    return Number.isFinite(lat) && Number.isFinite(lon) && lat !== 0 && lon !== 0;
  };

  const getAddressText = (cliente) => {
    return [cliente?.CALLE, cliente?.NUM_EXT, cliente?.COLONIA, cliente?.CIUDAD, cliente?.ESTADO]
      .filter(Boolean)
      .join(", ");
  };

  const openGoogleMapsByAddress = (cliente) => {
    const address = getAddressText(cliente) || cliente?.NOMBRECLI;
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Panel lateral */}
      <div className="w-full md:w-1/3 bg-white shadow-lg overflow-y-auto h-1/2 md:h-auto">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Filtros de Clientes</h2>

          <div className="flex items-center mb-4 relative">
            <FiSearch className="absolute left-3 top-2.5 text-gray-400" />
            <input
              className="pl-10 pr-4 py-2 w-full border rounded-lg"
              placeholder="Buscar clientes..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange("searchTerm", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
            <select
              className="border rounded p-2 text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">Todos los estatus</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="INACTIVO">INACTIVO</option>
            </select>

            <select
              className="border rounded p-2 text-sm"
              value={filters.sucursal}
              onChange={(e) => handleFilterChange("sucursal", e.target.value)}
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.ID} value={sucursal.ID}>
                  {sucursal.DSC}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <select
              className="border rounded p-2 text-sm w-full"
              value={filters.salesRep}
              onChange={(e) => handleFilterChange("salesRep", e.target.value)}
            >
              <option value="">Todas las rutas{filters.sucursal ? ` de ${sucursales.find(s => s.ID === filters.sucursal)?.DSC}` : ''}</option>
              {rutas.map(ruta => (
                <option key={ruta.ID} value={ruta.ID}>
                  {ruta.DSC}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : clientes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No se encontraron clientes
            </div>
          ) : (
            <ul className="space-y-2">
              {clientes.map(cliente => (
                <div
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
                    <p className="text-xs text-amber-600 mt-1">Sin coordenadas, se abre por dirección</p>
                  )}
                </div>
              ))}
            </ul>
          )}
        </div>
         {/* BOTONES PAGINACION */}
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

      {/* Mapa */}
      <div className="w-full md:w-2/3 h-1/2 md:h-full">
        <MapContainer
          center={initialCenter}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {clienteSeleccionado && <MoverMapa cliente={clienteSeleccionado} />}

          {clientes.map(cliente => {
            if (!hasCoordinates(cliente)) return null;

            const lat = parseFloat(cliente.LAT);
            const lng = parseFloat(cliente.LON);

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={cliente.CLIENTEID}
                position={[lat, lng]}
                icon={customIcon}
                ref={(ref) => {
                  if (ref) {
                    markersRef.current[cliente.CLIENTEID] = ref;
                  } else {
                    delete markersRef.current[cliente.CLIENTEID];
                  }
                }}
              >
                <Popup>
                  <div>
                    <h3 className="font-bold">{cliente.NOMBRECLI}</h3>
                    <p className="text-sm">{cliente.GIRO}</p>
                    {cliente.SUCURSAL && (
                      <p className="text-xs mt-1">
                        <FiMapPin className="inline mr-1" />
                        {cliente.SUCURSAL}
                      </p>
                    )}
                    {cliente.RUTA && (
                      <p className="text-xs">
                        Ruta: {rutas.find(r => r.ID === cliente.RUTA)?.DSC || cliente.RUTA}
                      </p>
                    )}
                    {cliente.TEL && (
                      <p className="text-xs">
                        <FiPhone className="inline mr-1" />
                        {cliente.TEL}
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

export default Maps;
