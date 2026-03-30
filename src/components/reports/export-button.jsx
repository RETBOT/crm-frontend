import React, { useState } from "react";
import { FiDownload, FiFile, FiFileText, FiChevronDown } from "react-icons/fi";
import { Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { exportReport } from "../../api/reports";
import { Notification } from "../notifications/notification";

export function ExportButton({
  reportType,
  filters,
  filename = "reporte",
  onExportStart,
  onExportComplete,
}) {
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ ...notification, show: false }), 3000);
  };

  const handleExport = async (format) => {
    setLoading(true);
    if (onExportStart) onExportStart();

    try {
      const data = await exportReport(reportType, format, filters);

      // Crear blob y descargar
      const blob = new Blob([data], {
        type:
          format === "excel"
            ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            : "application/pdf",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split("T")[0]}.${
        format === "excel" ? "xlsx" : "pdf"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showNotification(`Reporte exportado correctamente en formato ${format}`);
      if (onExportComplete) onExportComplete({ success: true, format });
    } catch (error) {
      console.error("Error al exportar:", error);
      showNotification(error.message || "Error al exportar reporte", "error");
      if (onExportComplete) onExportComplete({ success: false, error });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Menu>
        <MenuHandler>
          <Button
            variant="outlined"
            size="sm"
            className="flex items-center gap-2"
            disabled={loading}
          >
            <FiDownload className={`w-4 h-4 ${loading ? "animate-bounce" : ""}`} />
            {loading ? "Exportando..." : "Exportar"}
            <FiChevronDown className="w-4 h-4" />
          </Button>
        </MenuHandler>
        <MenuList>
          <MenuItem
            className="flex items-center gap-2"
            onClick={() => handleExport("excel")}
            disabled={loading}
          >
            <FiFile className="w-4 h-4 text-green-600" />
            Exportar a Excel
          </MenuItem>
          <MenuItem
            className="flex items-center gap-2"
            onClick={() => handleExport("pdf")}
            disabled={loading}
          >
            <FiFileText className="w-4 h-4 text-red-600" />
            Exportar a PDF
          </MenuItem>
        </MenuList>
      </Menu>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, show: false })}
        />
      )}
    </>
  );
}

export default ExportButton;