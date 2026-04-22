import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { DataRepository } from '../services/DataRepository';

export const useSettings = () => {
  const { user, refreshUser } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(!!user?.allowNotifications);
  const [cameraEnabled, setCameraEnabled] = useState(!!user?.allowCamera);
  const [updating, setUpdating] = useState(false);

  // Sincronizar al entrar para asegurar que tenemos lo último del servidor
  useEffect(() => {
    refreshUser();
  }, []);

  // Actualizar switches si el contexto del usuario cambia
  useEffect(() => {
    if (user) {
      setNotificationsEnabled(!!user.allowNotifications);
      setCameraEnabled(!!user.allowCamera);
    }
  }, [user]);

  const toggleNotifications = async () => {
    const previousValue = notificationsEnabled;
    const newValue = !previousValue;
    
    // Actualización optimista en la UI
    setNotificationsEnabled(newValue); 
    setUpdating(true);
    
    const result = await DataRepository.updateSetting({ allow_notifications: newValue });
    setUpdating(false);

    if (result.success) {
      await refreshUser();
    } else {
      // Revertir si hubo error
      setNotificationsEnabled(previousValue);
      Alert.alert("Error", result.error || "No se pudo actualizar la configuración.");
    }
  };

  const toggleCamera = async () => {
    const previousValue = cameraEnabled;
    const newValue = !previousValue;
    
    // Actualización optimista en la UI
    setCameraEnabled(newValue); 
    setUpdating(true);
    
    const result = await DataRepository.updateSetting({ allow_camera: newValue });
    setUpdating(false);

    if (result.success) {
      await refreshUser();
    } else {
      // Revertir si hubo error
      setCameraEnabled(previousValue);
      Alert.alert("Error", result.error || "No se pudo actualizar la configuración.");
    }
  };

  return {
    user,
    notificationsEnabled,
    cameraEnabled,
    updating,
    toggleNotifications,
    toggleCamera
  };
};