import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import banner from "/img/RETEX.png";
import logoIcon from "/img/RETEX Icon.png";
import { EyeIcon, EyeOffIcon, AlertCircle, Loader2, X, ShieldCheck } from "lucide-react";
import { login } from  "../../utils/auth";
import { loginUser } from "../../api/auth";

const rutaServer = import.meta.env.VITE_RUTA_SERVER;

export function SignIn() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useState(null);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem("recordarme") === "true") {
      setUsuario(localStorage.getItem("usr") || "");
      setRecordarme(true);
    } else {
      setUsuario("");
      setRecordarme(false);
    }
  }, []);

  useEffect(() => {
    const input = document.getElementById("usuario-input");
    if (input && !usuario) input.focus();
  }, [mounted]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!usuario || !password) {
        throw new Error("Por favor, completa todos los campos");
      }
      if (usuario.length > 50) {
        throw new Error("El usuario no puede tener mas de 50 caracteres");
      }
      if (password.length > 100) {
        throw new Error("La contraseña no puede tener mas de 100 caracteres");
      }
      const response = await loginUser(usuario, password);

      if (!response) throw new Error("Token no recibido");

      if (response.data.regresa < 0) {
        setError(response.data.mensaje);
        setLoading(false);
        return;
      } else {
        login(response.data, recordarme);
        navigate(rutaServer + "/dashboard/home");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Formulario */}
      <div className={`flex flex-col justify-center items-center flex-1 px-6 py-12 transition-all duration-700 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <Card className="w-full max-w-md p-8 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-sm border border-white/20">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img
              src={rutaServer + logoIcon}
              alt="RETEX"
              className="w-16 h-16 object-contain"
            />
          </div>

          <Typography variant="h4" className="text-center font-extrabold mb-2 text-gray-900 tracking-tight">
            Bienvenido
          </Typography>
          <Typography
            variant="paragraph"
            className="text-center text-sm mb-8 text-gray-500"
          >
            Inicia sesión para acceder a la plataforma
          </Typography>

          <form onSubmit={handleLogin}>
            <div className="mb-5">
              <Input
                id="usuario-input"
                type="text"
                label="Usuario"
                required
                size="lg"
                className="uppercase"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.toUpperCase())}
              />
            </div>
            <div className="mb-6">
              <div className="relative w-full">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  label="Contraseña"
                  required
                  size="lg"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 gap-1">
                  <ShieldCheck className="w-4 h-4 text-green-500" title="Conexión segura" />
                  <button
                    type="button"
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
            </div>

            <div className="flex justify-between items-center mb-6 text-sm">
              <Checkbox
                label={
                  <Typography variant="small" className="font-medium text-gray-600">
                    Recordarme
                  </Typography>
                }
                containerProps={{ className: "-ml-2.5" }}
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
              />
              <Link to="/auth/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200"
              ripple={true}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                "Iniciar sesión"
              )}
            </Button>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <Typography variant="small" className="text-red-700 leading-relaxed flex-1">
                  {error}
                </Typography>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </form>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500">
          &copy; {new Date().getFullYear()} RETFlow CRM v1.0. Todos los derechos reservados.
        </p>
      </div>

      {/* Panel derecho con imagen */}
      <div className={`hidden md:flex flex-1 justify-center items-center relative overflow-hidden transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
        {/* Overlay gradiente */}
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

export default SignIn;
