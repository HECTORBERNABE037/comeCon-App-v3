import { useState } from "react";
import { Alert } from "react-native";
import { useForm } from "./useForm";
import { validateResetCode } from "../utils/validationRules";
import { ResetCodeFormData } from "../../types";

export const useResetCode = (navigation: any, route: any) => {
  const { emailOrPhone } = route.params;

  const { formData, errors, updateFormData, validate } = useForm<ResetCodeFormData>(
    { code: "" },
    validateResetCode
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleVerifyCode = (): void => {
    if (validate()) {
      setIsLoading(true);
      
      console.log(`Código ingresado: ${formData.code}`);

      setTimeout(() => {
        setIsLoading(false);
        
        // Validación simulada (1234)
        if (formData.code === "1234") {
          Alert.alert("Éxito", "Código verificado correctamente.");
          navigation.navigate('SetNewPassword', { emailOrPhone });
        } else {
          Alert.alert("Error", "El código ingresado no es válido.");
        }
      }, 1500);
    }
  };

  return {
    formData,
    errors,
    updateFormData,
    isLoading,
    handleVerifyCode
  };
};