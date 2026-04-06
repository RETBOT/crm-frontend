import React, { useEffect, useState } from "react";
import { FiX, FiExternalLink } from "react-icons/fi";
import { getOAuthStatus } from "../../api/email";

export function ConnectEmailModal({ provider, onClose }) {
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(false);
  const [error, setError] = useState("");

  const isGoogle = provider === "google";
  const providerName = isGoogle ? "Google" : "Microsoft";

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const status = await getOAuthStatus();
        setConfigured(status[provider]?.configured || false);
      } catch (err) {
        setError("No se pudo verificar la configuración");
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, [provider]);

  const redirectUri = `${window.location.origin}/email/callback/${provider}`;

  const authUrl = isGoogle
    ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email")}&access_type=offline&prompt=consent`
    : `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${import.meta.env.VITE_MICROSOFT_CLIENT_ID || ""}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent("https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/Calendars.Read https://graph.microsoft.com/Calendars.ReadWrite https://graph.microsoft.com/User.Read offline_access")}`;

  const handleConnect = () => {
    window.location.href = authUrl;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Conectar {providerName}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <FiX size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">
              <p className="font-medium mb-1">Credenciales no configuradas</p>
              <p>
                Las credenciales OAuth de {providerName} no están configuradas en el servidor.
                Contacta al administrador del sistema.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-gray-800">Pasos para el administrador:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                {isGoogle ? (
                  <>
                    <li>Ir a <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                    <li>Crear proyecto o seleccionar uno existente</li>
                    <li>Habilitar la API de Gmail</li>
                    <li>Crear credenciales OAuth 2.0 tipo "Aplicación web"</li>
                    <li>Agregar URI de redirección: <code className="bg-gray-100 px-1 rounded text-xs break-all">{redirectUri}</code></li>
                    <li>Agregar al <code className="bg-gray-100 px-1 rounded">.env</code> del backend:
                      <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-x-auto">
GOOGLE_CLIENT_ID=tu-client-id<br/>
GOOGLE_CLIENT_SECRET=tu-client-secret
                      </pre>
                    </li>
                  </>
                ) : (
                  <>
                    <li>Ir a <a href="https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Azure Portal</a></li>
                    <li>Registrar una nueva aplicación</li>
                    <li>Agregar permisos delegados: Mail.Send y User.Read</li>
                    <li>Agregar URI de redirección: <code className="bg-gray-100 px-1 rounded text-xs break-all">{redirectUri}</code></li>
                    <li>Agregar al <code className="bg-gray-100 px-1 rounded">.env</code> del backend:
                      <pre className="bg-gray-50 p-2 rounded mt-1 text-xs overflow-x-auto">
MICROSOFT_CLIENT_ID=tu-client-id<br/>
MICROSOFT_CLIENT_SECRET=tu-client-secret<br/>
MICROSOFT_TENANT=common
                      </pre>
                    </li>
                  </>
                )}
              </ol>
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t">
            <button onClick={onClose} className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Conectar {providerName}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Autorizar acceso a tu correo</p>
            <p>
              Serás redirigido a {providerName} para autorizar el acceso.
              Solo se solicitará permiso para enviar correos y leer tu dirección de email.
            </p>
          </div>

          <button
            onClick={handleConnect}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {isGoogle ? (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="white" d="M1.157 10.655v5.73h5.73V10.655z" />
                <path fill="white" d="M7.052 10.655v5.73h5.73V10.655z" />
                <path fill="white" d="M1.157 4.76v5.73h5.73V4.76z" />
                <path fill="white" d="M7.052 4.76v5.73h5.73V4.76z" />
              </svg>
            )}
            Conectar con {providerName}
            <FiExternalLink size={14} />
          </button>

          <p className="text-xs text-gray-400 text-center">
            Redirect URI: <code className="bg-gray-100 px-1 rounded">{redirectUri}</code>
          </p>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t">
          <button onClick={onClose} className="px-4 py-2 text-sm border rounded text-gray-600 hover:bg-gray-50">
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConnectEmailModal;
