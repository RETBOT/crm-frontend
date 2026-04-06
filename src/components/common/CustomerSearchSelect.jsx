import React, { useCallback, useEffect, useRef, useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import { getClientes } from "../../api/accounts";

export const CustomerSearchSelect = ({
  value,
  onChange,
  placeholder = "Buscar cliente...",
  className = "",
  tipoCliente = "ACTIVO",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCustomers = useCallback(async (term) => {
    if (!term || term.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await getClientes(0, term, "", tipoCliente, "", 1, 50, "");
      const data = res.data || res;
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [tipoCliente]);

  useEffect(() => {
    searchCustomers(debouncedSearch);
    setSelectedIndex(-1);
  }, [debouncedSearch, searchCustomers]);

  const selectedCustomer = results.find(
    (c) => String(c.customer_id || c.CLIENTEID) === String(value)
  );

  const handleSelect = (customer) => {
    const id = customer.customer_id || customer.CLIENTEID;
    onChange(id);
    setSearchTerm("");
    setOpen(false);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    onChange("");
    setSearchTerm("");
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const displayValue = selectedCustomer
    ? selectedCustomer.NOMBRECLI || selectedCustomer.customer_name
    : "";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          ref={inputRef}
          type="text"
          className="w-full border rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={displayValue || placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {displayValue && (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {open && (searchTerm.length >= 2 || loading || results.length > 0) && (
        <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {loading && (
            <div className="p-3 text-sm text-gray-500 text-center">
              Buscando...
            </div>
          )}
          {!loading && results.length === 0 && searchTerm.length >= 2 && (
            <div className="p-3 text-sm text-gray-500 text-center">
              No se encontraron clientes
            </div>
          )}
          {!loading &&
            results.map((c, i) => {
              const id = c.customer_id || c.CLIENTEID;
              const name = c.NOMBRECLI || c.customer_name;
              const isSelected = String(id) === String(value);
              return (
                <button
                  key={id}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors ${
                    i === selectedIndex ? "bg-blue-50" : ""
                  } ${isSelected ? "bg-blue-100 font-medium" : ""}`}
                  onClick={() => handleSelect(c)}
                >
                  {name}
                </button>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default CustomerSearchSelect;
