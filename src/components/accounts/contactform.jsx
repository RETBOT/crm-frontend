// components/ContactForm.js
import React, { useState } from "react";
import { FiUser, FiPhone, FiMail, FiMessageSquare, FiX, FiSave } from "react-icons/fi";

export const ContactForm = ({ 
  initialData = {}, 
  puestos = [],
  onSave, 
  onCancel,
  isEditing,
  saving = false,
}) => {
  const [formData, setFormData] = useState({
    NOMBRE: initialData.NOMBRE || "",
    APATERNO: initialData.APATERNO || "",
    AMATERNO: initialData.AMATERNO || "",
    TELEFONO: initialData.TELEFONO || "",
    EXTENSION: initialData.EXTENSION || "",
    PUESTOID: initialData.PUESTOID || "",
    COMENTARIOS: initialData.COMENTARIOS || "",
    WHATSAPP: initialData.WHATSAPP || "",
    EMAIL: initialData.EMAIL || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {isEditing ? "Editar Contacto" : "Nuevo Contacto"}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            name="NOMBRE"
            value={formData.NOMBRE}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Apellido Paterno</label>
          <input
            type="text"
            name="APATERNO"
            value={formData.APATERNO}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Apellido Materno</label>
          <input
            type="text"
            name="AMATERNO"
            value={formData.AMATERNO}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Puesto</label>
          <select
            name="PUESTOID"
            className="w-full border rounded p-2"
            value={formData.PUESTOID}
            onChange={handleChange}
          >
            <option value="">Seleccionar una opción</option>
            {puestos.map((puesto) => (
              <option key={puesto.ID} value={puesto.ID}>
                {puesto.DSC}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Teléfono</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiPhone className="text-gray-400" />
            </div>
            <input
              type="tel"
              name="TELEFONO"
              value={formData.TELEFONO}
              onChange={handleChange}
              className="pl-10 w-full border rounded p-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Extensión</label>
          <input
            type="text"
            name="EXTENSION"
            value={formData.EXTENSION}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">WhatsApp</label>
          <input
            type="tel"
            name="WHATSAPP"
            value={formData.WHATSAPP}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="text-gray-400" />
            </div>
            <input
              type="email"
              name="EMAIL"
              value={formData.EMAIL}
              onChange={handleChange}
              className="pl-10 w-full border rounded p-2"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">Comentarios</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
              <FiMessageSquare className="text-gray-400" />
            </div>
            <textarea
              name="COMENTARIOS"
              value={formData.COMENTARIOS}
              onChange={handleChange}
              rows="3"
              className="pl-10 w-full border rounded p-2"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={saving}
        >
          <FiSave className="mr-2" />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </form>
  );
};
