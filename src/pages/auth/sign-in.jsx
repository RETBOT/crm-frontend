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
import banner from "/img/banner.png";
import { EyeIcon, EyeOffIcon } from "lucide-react"; 
import { login } from  "../../utils/auth";
import { loginUser } from "../../api/auth"; // Asegúrate de que esta ruta sea correcta

const rutaServer = import.meta.env.VITE_RUTA_SERVER;

export function SignIn() {
  const navigate = useNavigate(); // Hook para redirigir al usuario

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [recordarme, setRecordarme] = useState(false);


  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null); // Limpia el error anterior
    setLoading(true); // Activa estado de carga

    try {
      if (!usuario || !password) {
        throw new Error("Por favor, completa todos los campos");
      }
      const response = await loginUser(usuario, password);

      if (!response) throw new Error("Token no recibido");

      if (response.data.regresa < 0) { // Manejo de error
        setError(response.data.mensaje);
        setLoading(false); // Desactiva el estado de carga
        return;
      } else {
        login(response.data, password, recordarme);  // Guardar en localStorage
        navigate(rutaServer+"/dashboard/home"); // Redirigir al dashboard
      }

      
    } catch (err) {
      setError(err.message); // Muestra el mensaje de error en la UI
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };


  useEffect(() => {
    if (localStorage.getItem("recordarme") === "true") {
      setUsuario(localStorage.getItem("usr") || "");
      setRecordarme(true);
    } else {
      setUsuario("");
      setRecordarme(false);
    }
  }, []);


  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Formulario */}
      <div className="flex flex-col justify-center items-center flex-1 px-6 py-12">
        <Card className="w-full max-w-md p-8 rounded-xl shadow-lg bg-white">
          <Typography variant="h4" className="text-center font-extrabold mb-2 text-gray-900">
            Iniciar sesión
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-center text-sm mb-8 text-gray-600"
          >
            Ingresa tu usuario y contraseña para continuar
          </Typography>

          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <Input
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
               type={showPassword ? "text" : "password"} // Alterna entre "text" y "password"
               value={password}
                label="Contraseña"
                required
                size="lg"
                onChange={(e) => setPassword(e.target.value)}
              />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)} // Alterna la visibilidad de la contraseña
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <EyeIcon className="w-5 h-5 text-gray-500" />
                  )}
                </button>
               </div>
            </div>

            <div className="flex justify-between items-center mb-6 text-sm">
              <Checkbox
                label={
                  <Typography variant="small" color="gray" className="font-medium">
                    Recordarme
                  </Typography>
                }
                containerProps={{ className: "-ml-2.5" }}
                checked={recordarme}
                onChange={(e) => setRecordarme(e.target.checked)}
              />
              <Link to="/auth/forgot-password" className="text-blue-600 hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold rounded-lg"
              color="blue"
              ripple={true}
            >
              {loading ? <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                  </svg>  : "Iniciar sesión"}
            </Button>
            {error && (
              <Typography variant="small" color="red" className="mt-4 text-center">
                {error}
              </Typography>
            )}
          </form>
        </Card>
      </div>

      {/* Imagen lado derecho, oculta en móviles */}
  <div className="hidden md:flex flex-1 justify-center items-center bg-white">
  <img
    src={rutaServer + banner}
    alt="Logo CRM"
    className="max-w-full h-auto w-auto p-20"
  />
</div>


    </div>
  );
}

export default SignIn;
