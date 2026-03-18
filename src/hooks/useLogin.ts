import { useState, useContext } from "react";
import { Alert } from "react-native";
import { AuthContext } from "../context/AuthContext";

export const useLogin = () => {
  // Consumimos el contexto 
  const { login, isLoading } = useContext(AuthContext);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa correo y contraseña');
      return;
    }
    const result = await login({ email, password });

    if (!result.success) {
      Alert.alert('Error', result.error || 'Credenciales incorrectas');
    }
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