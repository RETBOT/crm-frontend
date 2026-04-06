import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import { connectEmail } from "../api/email";

export function EmailCallback() {
  const { provider } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");

      if (error) {
        setStatus("error");
        setMessage(params.get("error_description") || "Autorización cancelada");
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No se recibió código de autorización");
        return;
      }

      const redirectUri = `${window.location.origin}/email/callback/${provider}`;

      try {
        await connectEmail(provider, code, redirectUri);
        setStatus("success");
        setMessage("Cuenta de correo conectada exitosamente");
        setTimeout(() => navigate("/profile"), 2000);
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "Error al conectar la cuenta de correo");
        setTimeout(() => navigate("/profile"), 4000);
      }
    };

    handleCallback();
  }, [provider, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <FiLoader className="animate-spin mx-auto text-blue-600 mb-4" size={40} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Conectando cuenta...</h2>
            <p className="text-gray-600">Estamos configurando tu cuenta de correo.</p>
          </>
        )}

        {status === "success" && (
          <>
            <FiCheckCircle className="mx-auto text-green-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">¡Conectado!</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <p className="text-sm text-gray-400">Redirigiendo a Mi Perfil...</p>
          </>
        )}

        {status === "error" && (
          <>
            <FiXCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Error de conexión</h2>
            <p className="text-gray-600 mb-4">{message}</p>
            <button
              onClick={() => navigate("/profile")}
              className="text-blue-600 hover:underline text-sm"
            >
              Volver a Mi Perfil
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default EmailCallback;
