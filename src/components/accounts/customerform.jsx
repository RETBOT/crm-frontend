import React, { useMemo, useState } from "react";

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
        <input name="LAT" type="number" step="0.000001" value={formData.LAT} onChange={handleChange} className="border rounded p-2" placeholder="Latitud" />
        <input name="LON" type="number" step="0.000001" value={formData.LON} onChange={handleChange} className="border rounded p-2" placeholder="Longitud" />
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
