import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from './useForm'; 
import { validateProductForm } from '../utils/validationRules';
import { showImageOptions } from '../utils/ImagePickerHelper';
import { useAuth } from '../context/AuthContext';
import { ProductFormData } from '../../types'; 

interface UseAddProductProps {
  onSave: (data: any) => void;
  onClose: () => void;
}

export const useAddProduct = ({ onSave, onClose }: UseAddProductProps) => {
  const { user } = useAuth();
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Inicializamos el formulario
  const { formData, updateFormData, setFormData } = useForm<ProductFormData>(
    { title: '', subtitle: '', price: '', description: '', category: '' },
    validateProductForm
  );

  const resetForm = () => {
    setFormData({ title: '', subtitle: '', price: '', description: '', category: '' });
    setImageUri(null);
  };

  const handleSave = () => {
    // Validamos campos obligatorios
    if (!formData.title || !formData.price) {
      Alert.alert("Faltan datos", "El título y el precio son obligatorios.");
      return;
    }

    const newProduct = {
      ...formData,
      image: imageUri,
      category: formData.category || 'General', 
      visible: true
    };

    onSave(newProduct);
    resetForm();
  };

  const handleClose = () => {
    resetForm(); // Limpiamos el formulario por si el usuario cancela
    onClose();
  };

  const handleImagePick = () => {
    if (!user?.allowCamera) {
      Alert.alert("Permiso", "Habilita la cámara en configuración.");
      return;
    }
    showImageOptions(setImageUri);
  };

  return {
    formData,
    imageUri,
    updateFormData,
    handleSave,
    handleClose,
    handleImagePick
  };
};