import { useState, useContext } from "react";
import { Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

export const useLogin = () => {
  // Consumimos el contexto de autenticación
  const { login, isLoading } = useContext(AuthContext);
  
  // Estados locales para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Lógica de inicio de sesión
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }

    // Llamamos al AuthContext (maneja Online/Offline internamente)
    const result = await login({ email, password });

    if (!result.success) {
      Alert.alert('Error', result.error || 'Credenciales incorrectas');
    }
    // Si es exitoso, el AuthContext actualiza el estado 'user' y la App navega sola.
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    handleLogin,
    isLoading
  };
};