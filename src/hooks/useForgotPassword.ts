import { useState } from "react";
import { Alert } from "react-native";
import { useForm } from "./useForm";
import { validateForgotPassword } from "../utils/validationRules";
import { DataRepository } from "../services/DataRepository";
import { ForgotPasswordFormData } from "../../types";

export const useForgotPassword = (navigation: any) => {
  const { formData, errors, updateFormData, validate } = useForm<ForgotPasswordFormData>(
    { emailOrPhone: "" },
    validateForgotPassword
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSendCode = async (): Promise<void> => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      // verificar si existe el email en el back
      const userExists = await DataRepository.checkUserExists(formData.emailOrPhone.trim());

      setIsLoading(false);

      if (userExists) {
        Alert.alert(
          "Código Enviado",
          "Se envio un código de verificación: 1234",
          [
            { 
              text: "Continuar", 
              onPress: () => navigation.navigate('ResetCode', { emailOrPhone: formData.emailOrPhone })
            }
          ]
        );
      } else {
        Alert.alert("Error", "No existe ninguna cuenta con este correo.");
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Ocurrió un problema de conexión.");
    }
  };

  return {
    formData,
    errors,
    updateFormData,
    isLoading,
    handleSendCode
  };
};