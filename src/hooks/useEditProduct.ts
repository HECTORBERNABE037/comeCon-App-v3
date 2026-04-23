import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useForm } from './useForm';
import { validateProductForm } from '../utils/validationRules';
import { showImageOptions } from '../utils/ImagePickerHelper';
import { useAuth } from '../context/AuthContext';
import { Platillo, ProductFormData } from '../../types';

interface UseEditProductProps {
  product: Platillo | null;
  onSave: (updatedProduct: Platillo) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export const useEditProduct = ({ product, onSave, onDelete, onClose }: UseEditProductProps) => {
  const { user } = useAuth();
  const [newImageUri, setNewImageUri] = useState<string | null>(null);
  
  // Estado local para visibilidad
  const [isVisible, setIsVisible] = useState(true);

  const { formData, updateFormData, setFormData } = useForm<ProductFormData>(
    { title: '', subtitle: '', price: '', description: '', category: '' },
    validateProductForm
  );

  // Rellenar formulario cuando cambia el producto
  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title,
        subtitle: product.subtitle || '', 
        price: product.price,
        description: product.description || '',
        category: product.category || 'General' 
      });
      setIsVisible(!!product.visible);
      setNewImageUri(null);
    }
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    
    // Validar campos obligatorios
    if (!formData.title || !formData.price) {
      Alert.alert("Campos requeridos", "Por favor ingresa al menos el Nombre y el Precio.");
      return;
    }

    const updatedProduct: Platillo = {
      ...product,
      title: formData.title,
      subtitle: formData.subtitle,
      price: formData.price,
      description: formData.description,
      category: formData.category,
      visible: isVisible, // estado del Switch
      image: newImageUri || product.image 
    };

    onSave(updatedProduct);
  };

  const handleDelete = () => {
    if (product) onDelete(product.id.toString());
  };

  const handleImagePick = () => {
    if (!user?.allowCamera) {
      Alert.alert("Permiso", "Habilita la cámara en configuración.");
      return;
    }
    showImageOptions(setNewImageUri);
  };

  const displayImage = newImageUri ? { uri: newImageUri } : product?.image;

  return {
    formData,
    updateFormData,
    isVisible,
    setIsVisible,
    displayImage,
    handleSave,
    handleDelete,
    handleImagePick,
    onClose
  };
};