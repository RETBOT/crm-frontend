import React, { useState } from "react";
import { logger } from "../../utils/logger";
import { FiDownload, FiFile, FiFileText, FiChevronDown, FiTable } from "react-icons/fi";
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

      const mimeTypes = {
        excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        pdf: "application/pdf",
        csv: "text/csv",
      };
      const extensions = { excel: "xlsx", pdf: "pdf", csv: "csv" };

      const blob = new Blob([data], { type: mimeTypes[format] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split("T")[0]}.${extensions[format]}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      const formatLabels = { excel: "Excel", pdf: "PDF", csv: "CSV" };
      showNotification(`Reporte exportado correctamente en formato ${formatLabels[format]}`);
      if (onExportComplete) onExportComplete({ success: true, format });
    } catch (error) {
      logger.error("Error al exportar:", error);
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
          <MenuItem
            className="flex items-center gap-2"
            onClick={() => handleExport("csv")}
            disabled={loading}
          >
            <FiTable className="w-4 h-4 text-blue-600" />
            Exportar a CSV
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