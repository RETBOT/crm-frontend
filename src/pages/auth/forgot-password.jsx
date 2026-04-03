import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import banner from "/img/RETEX.png";
import logoIcon from "/img/RETEX Icon.png";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { forgotpwd } from "../../api/auth";

const rutaServer = import.meta.env.VITE_RUTA_SERVER;

export function ForgotPassword() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setLoading(true);

    try {
      if (!usuario || !email) {
        throw new Error("Por favor, completa todos los campos");
      }
      const response = await forgotpwd(usuario, email);
      if (!response) throw new Error("Error al enviar la solicitud");
      setSuccessMessage(response.data.message || response.data);
      setError("");
    } catch (err) {
      setError(err.message);
      setSuccessMessage("");
    } finally {
      setLoading(false);
    }
  };

  if (successMessage) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center px-6">
        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="p-8 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/20 text-center">
            <div className="flex justify-center mb-4">
              <img
                src={rutaServer + logoIcon}
                alt="RETEX"
                className="w-16 h-16 object-contain"
              />
            </div>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <Typography variant="h4" className="font-extrabold mb-2 text-gray-900">
              Revisa tu correo
            </Typography>
            <Typography className="text-gray-500 mb-4">
              {successMessage}
            </Typography>
            <Typography className="text-gray-400 text-sm mb-6">
              Haz clic en el enlace del correo para crear una nueva contraseña. El enlace expira en 1 hora.
            </Typography>
            <Button
              onClick={() => navigate("/auth/sign-in")}
              className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25"
            >
              Volver al inicio de sesión
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      <div className={`flex flex-col justify-center items-center flex-1 px-6 py-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/20">
          <div className="flex justify-center mb-4">
            <img
              src={rutaServer + logoIcon}
              alt="RETEX"
              className="w-16 h-16 object-contain"
            />
          </div>

          <Typography variant="h4" className="text-center font-extrabold mb-2 text-gray-900 tracking-tight">
            Recuperar contraseña
          </Typography>
          <Typography className="text-center text-sm mb-8 text-gray-500">
            Ingresa tu usuario y correo para recibir un enlace de recuperación
          </Typography>

          <form onSubmit={handlePasswordReset}>
            <div className="mb-5">
              <Input
                type="text"
                label="Usuario"
                required
                size="lg"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.toUpperCase())}
              />
            </div>
            <div className="mb-6">
              <Input
                type="email"
                label="Correo Electrónico"
                required
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <Typography variant="small" className="text-red-700 leading-relaxed flex-1">
                  {error}
                </Typography>
              </div>
            )}

            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200"
              ripple={true}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Enviando...</span>
                </div>
              ) : (
                "Enviar enlace"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/auth/sign-in" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>
        </Card>

        <p className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} RETFlow CRM v1.0. Todos los derechos reservados.
        </p>
      </div>

      <div className={`hidden md:flex flex-1 justify-center items-center relative overflow-hidden transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-slate-800/30 z-10" />
        <img
          src={rutaServer + banner}
          alt="RETEX"
          className="max-w-full h-auto w-auto p-16 relative z-0"
        />
      </div>
    </div>
  );
}

export default ForgotPassword;
