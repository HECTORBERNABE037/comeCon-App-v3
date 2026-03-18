import { useState } from "react";
import { Alert } from "react-native";
import { useForm } from "./useForm";
import { validateSetNewPassword } from "../utils/validationRules";
import { DataRepository } from "../services/DataRepository";
import { SetNewPasswordFormData } from "../../types";

export const useSetNewPassword = (navigation: any, route: any) => {
  const { emailOrPhone } = route.params;

  const { formData, errors, updateFormData, validate } = useForm<SetNewPasswordFormData>(
    { newPassword: "", confirmPassword: "" },
    validateSetNewPassword
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSetPassword = async (): Promise<void> => {
    if (!validate()) return;

    setIsLoading(true);

    try {
      // actualizacion en el BACK
      const result = await DataRepository.updatePassword(emailOrPhone, formData.newPassword);
      
      setIsLoading(false);

      if (result.success) {
        Alert.alert(
          "Éxito",
          "Tu contraseña ha sido actualizada en el servidor.",
          [{ 
              text: "Ir al Login", 
              onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Login' }] }) 
          }]
        );
      } else {
        Alert.alert("Error", result.error || "No se pudo actualizar.");
      }

    } catch (error) {
      setIsLoading(false);
      Alert.alert("Error", "Ocurrió un error inesperado.");
    }
  };

  return {
    emailOrPhone,
    formData,
    errors,
    updateFormData,
    isLoading,
    handleSetPassword
  };
};