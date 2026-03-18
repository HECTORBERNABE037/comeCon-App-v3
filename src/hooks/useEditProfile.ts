import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DataRepository } from '../services/DataRepository';
import { ClientProfileFormData } from '../../types';

export const useEditProfile = (navigation: any) => {
  const { user, refreshUser } = useAuth(); 
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<ClientProfileFormData>({
    fullName: '',
    nickname: '',
    email: '',
    phone: '',
    gender: '',
    country: '',
    address: ''
  });

  // Cargar datos actuales del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.nombre || '',
        nickname: user.nickname || '',
        email: user.email || '', // Email no se actualiza 
        phone: user.phone || '',
        gender: user.gender || '',
        country: user.country || '',
        address: user.address || ''
      });
    }
  }, [user]);

  const handleChange = (key: keyof ClientProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const payload = {
        name: formData.fullName, 
        nickname: formData.nickname,
        phone: formData.phone,
        gender: formData.gender,
        country: formData.country,
        address: formData.address
      };

      const result = await DataRepository.updateProfile(payload);

      if (result.success) {
        await refreshUser(); 
        Alert.alert("¡Éxito!", "Perfil actualizado correctamente.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Error", result.error || "No se pudo actualizar.");
      }
    } catch (error) {
      Alert.alert("Error", "Ocurrió un problema de conexión.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleChange,
    handleSave
  };
};