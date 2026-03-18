import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

import { useAuth } from '../context/AuthContext';
import { DataRepository } from '../services/DataRepository';
import { RootStackParamList, ClientTabParamList } from '../../types';

type ClientProfileNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<ClientTabParamList, 'ClientProfileTab'>,
  StackNavigationProp<RootStackParamList>
>;

export const useProfile = () => {
  const navigation = useNavigation<ClientProfileNavigationProp>();
  const { user, refreshUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  // Refresca la información del usuario al entrar a la pantalla
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [])
  );

  const handleEditProfile = () => {
    navigation.navigate('EditClientProfile');
  };

  // camara 
  const handleCameraPress = async () => {
    Alert.alert(
      "Foto de Perfil",
      "¿Qué deseas hacer?",
      [
        {
          text: "Tomar Foto",
          onPress: async () => await launchCamera()
        },
        {
          text: "Elegir de Galería",
          onPress: async () => await launchGallery()
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const launchCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se requiere acceso a la cámara.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const launchGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permiso denegado", "Se requiere acceso a la galería.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.7,
    });
    if (!result.canceled) uploadImage(result.assets[0].uri);
  };

  const uploadImage = async (uri: string) => {
    setUploading(true);
    const result = await DataRepository.uploadProfileImage(uri);
    setUploading(false);

    if (result.success) {
      await refreshUser(); 
      Alert.alert("¡Éxito!", "Tu foto de perfil se ha actualizado.");
    } else {
      Alert.alert("Error", result.error || "No se pudo subir la imagen.");
    }
  };

  return {
    user,
    uploading,
    handleEditProfile,
    handleCameraPress
  };
};