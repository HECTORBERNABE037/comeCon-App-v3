import { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DataRepository } from '../services/DataRepository';
import { CardFormData } from '../../types';

export const useAddCard = (navigation: any) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<CardFormData>({
    number: '', expiryDate: '', cvv: '', country: '', holderName: ''
  });

  const handleSave = async () => {
    if (formData.number.length < 16 || !formData.holderName || !formData.cvv || !user) {
      Alert.alert("Error", "Por favor completa los datos correctamente.");
      return;
    }

    setLoading(true);
    try {
      // ENVIAR A DJANGO
      const result = await DataRepository.addCard({
        user: Number(user.id), // Enviamos ID de usuario
        last_four: formData.number.slice(-4), // guardar solo últimos 4 digitos por seguridad
        holder_name: formData.holderName,
        expiry_date: formData.expiryDate, 
        type: 'visa' // Nota: En un futuro aquí podrías agregar lógica para inferir si es Visa o MasterCard según el 1er dígito
      });
      
      if (result.success) {
        Alert.alert("Éxito", "Tarjeta guardada en tu cuenta.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", result.error || "No se pudo guardar.");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    setFormData,
    loading,
    handleSave
  };
};