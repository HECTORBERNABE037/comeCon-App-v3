import { useState } from "react";
import { Alert } from "react-native";
import { DataRepository } from "../services/DataRepository";

export const useRegister = (navigation: any) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    // Validaciones 
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Todos los campos son obligatorios (excepto teléfono)");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setIsLoading(true);

    const result = await DataRepository.register({
      name,
      email,
      phone,
      password // Django hace lo de hashear
    });

    setIsLoading(false);

    if (result.success) {
      Alert.alert(
        "¡Cuenta Creada!", 
        "Tu registro fue exitoso. Inicia sesión para continuar.",
        [{ text: "Ir al Login", onPress: () => navigation.navigate("Login") }]
      );
    } else {
      Alert.alert("Error de Registro", result.error || "No se pudo crear la cuenta.");
    }
  };

  return {
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isLoading,
    handleRegister
  };
};