import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

import { forgotpwd } from "../../api/auth"; // Asegúrate de que esta ruta sea correcta
import banner from "/img/banner.png";


const rutaServer = import.meta.env.VITE_RUTA_SERVER;

export function ForgotPassword() {
   const navigate = useNavigate(); // Hook para redirigir al usuario

  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(""); // Limpia el error anterior
    setLoading(true); // Activa estado de carga

    try {
    // Aquí puedes agregar la lógica de la recuperación de contraseña
    if (usuario && email) {
      const response = await forgotpwd(usuario, email);
      if (!response) throw new Error("Error al enviar la contraseña");
      setSuccessMessage(response.data);
      setError(""); // Limpiar el error si es exitoso
    } else {
      setError("Por favor, completa todos los campos.");
      setSuccessMessage(""); // Limpiar mensaje de éxito
    }
    }
    catch (err) {
      setError(err.message); // Muestra el mensaje de error en la UI
    } finally {
      setLoading(false); // Desactiva el estado de carga
    }
  };

  return (
   <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-md sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl p-6 bg-white rounded-lg shadow-lg">
        <header className="text-center mb-8">
          <img
            src={rutaServer + banner}
            alt="logo"
            className="mx-auto mb-4 w-32 sm:w-40 md:w-48 lg:w-52 xl:w-64"
          />
          <Typography variant="h4" className="font-extrabold text-gray-900 mb-2">
            Recuperar Contraseña
          </Typography>
          <Typography variant="paragraph" className="text-gray-600">
            Ingresa tu usuario y correo electrónico para recuperar tu contraseña.
          </Typography>
          <form onSubmit={handlePasswordReset} className="mt-6">
            <div className="mb-4">
              <Input
                type="text"
                label="Usuario"
                required
                size="lg"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value.toUpperCase())}
              />
            </div>
            <div className="mb-4">
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
              <Typography variant="paragraph" color="red" className="mb-4">
                {error}
              </Typography>
            )}
            {successMessage && (
              <Typography variant="paragraph" color="green" className="mb-4">
                {successMessage}
              </Typography>
            )}
            <Button
              type="submit"
              className="w-full py-3 text-base font-semibold rounded-lg"
              color="blue"
              ripple={true}
              disabled={loading} // Deshabilita el botón mientras se carga
            >
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </form>

          
          <Button
            className="mt-4 w-full py-3 text-base font-semibold rounded-lg"
            color="blue"
            ripple={true}
            onClick={() => navigate("/auth/sign-in")} // Redirige al inicio de sesión
          >
            Volver a inicio de sesión
          </Button>
        </header>
      </div>
   </div>
  );
}

export default ForgotPassword;


