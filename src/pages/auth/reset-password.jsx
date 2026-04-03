import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import logoIcon from "/img/RETEX Icon.png";
import { EyeIcon, EyeOffIcon, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { resetPassword } from "../../api/auth";

const rutaServer = import.meta.env.VITE_RUTA_SERVER;

export function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!token) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center px-6">
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/20 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <Typography variant="h4" className="font-extrabold mb-2 text-gray-900">
            Enlace inválido
          </Typography>
          <Typography className="text-gray-500 mb-6">
            No se encontró el token de recuperación. Solicita un nuevo enlace.
          </Typography>
          <Link to="/auth/forgot-password">
            <Button className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25">
              Solicitar nuevo enlace
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => navigate("/auth/sign-in"), 3000);
    } catch (err) {
      setError(err.message || "Error al restablecer la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center px-6">
        <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Card className="p-8 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/20 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <Typography variant="h4" className="font-extrabold mb-2 text-gray-900">
              ¡Contraseña actualizada!
            </Typography>
            <Typography className="text-gray-500 mb-6">
              Tu contraseña ha sido restablecida correctamente. Serás redirigido al login.
            </Typography>
            <Link to="/auth/sign-in">
              <Button className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25">
                Ir al login
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 items-center justify-center px-6 py-12">
      <div className={`w-full max-w-md transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Card className="p-8 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/20">
          <div className="flex justify-center mb-4">
            <img
              src={rutaServer + logoIcon}
              alt="RETEX"
              className="w-16 h-16 object-contain"
            />
          </div>

          <Typography variant="h4" className="text-center font-extrabold mb-2 text-gray-900 tracking-tight">
            Nueva contraseña
          </Typography>
          <Typography className="text-center text-sm mb-8 text-gray-500">
            Ingresa tu nueva contraseña para restablecer tu cuenta
          </Typography>

          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <div className="relative w-full">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  label="Nueva contraseña"
                  required
                  size="lg"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative w-full">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  label="Confirmar contraseña"
                  required
                  size="lg"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? (
                    <EyeOffIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <Typography variant="small" className="text-gray-400 mb-6 block">
              Mínimo 8 caracteres
            </Typography>

            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200"
              ripple={true}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Restableciendo...</span>
                </div>
              ) : (
                "Restablecer contraseña"
              )}
            </Button>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <Typography variant="small" className="text-red-700 leading-relaxed flex-1">
                  {error}
                </Typography>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link to="/auth/sign-in" className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors">
              Volver al inicio de sesión
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default ResetPassword;
