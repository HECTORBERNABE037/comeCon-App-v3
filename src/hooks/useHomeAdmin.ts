import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DataRepository } from '../services/DataRepository';
import { advancedSearch } from '../utils/searchHelper';
import { Platillo } from '../../types'; // Ajusta la ruta si 'types' está en otro nivel

// Función movida aquí para procesar los datos antes de enviarlos a la vista
const resolveImage = (imageName: string | any) => {
  if (imageName?.uri) return { uri: imageName.uri };
  if (typeof imageName === 'string' && (imageName.startsWith('http') || imageName.startsWith('file'))) {
    return { uri: imageName };
  }
  // Ajuste de ruta relativo a la carpeta hooks
  return require('../../assets/logoApp.png'); 
};

export const useHomeAdmin = () => {
  const [productList, setProductList] = useState<Platillo[]>([]); 
  const [searchQuery, setSearchQuery] = useState(""); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados de Modales
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProductEdit, setSelectedProductEdit] = useState<Platillo | null>(null);
  const [isPromoteModalVisible, setIsPromoteModalVisible] = useState(false);
  const [selectedProductPromote, setSelectedProductPromote] = useState<Platillo | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  // CARGAR PRODUCTOS
  const loadProducts = async () => {
    if (!refreshing) setLoading(true);
    try {
      const productsFromDB = await DataRepository.getAdminProducts();
      
      const formattedProducts: Platillo[] = productsFromDB.map((p:any) => ({
        id: p.id.toString(),
        title: p.title,
        subtitle: p.subtitle || '', 
        category: p.category || 'General', 
        price: p.price.toString(),
        description: p.description || '',
        image: resolveImage(p.image),
        originalImageString: p.image, 
        promotionalPrice: p.promotionalPrice ? p.promotionalPrice.toString() : undefined,
        promotionId: p.promoId ? p.promoId.toString() : undefined,
        visible: p.visible 
      }));

      setProductList(formattedProducts);
    } catch (error) {
      console.error("Error cargando productos:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => { loadProducts(); }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadProducts();
  };

  const filteredProducts = advancedSearch(productList, searchQuery, ['title', 'category']);

  // HANDLERS DE ACCIONES
  const handleAddProduct = async (newProductData: any) => {
    const res = await DataRepository.saveProduct({
      ...newProductData,
      category: newProductData.category || 'General',
      visible: true
    });
    
    if (res.success) {
      setIsAddModalVisible(false);
      loadProducts();
      Alert.alert("Éxito", "Producto añadido.");
    } else {
      Alert.alert("Error", res.error || "No se pudo crear.");
    }
  };

  const handleSaveProduct = async (updatedProduct: any) => {
    let imageToSave = updatedProduct.image;

    if (updatedProduct.image?.uri && typeof updatedProduct.image.uri === 'string') {
        imageToSave = updatedProduct.image.uri;
    }
    if (typeof imageToSave === 'number' && updatedProduct.originalImageString) {
        imageToSave = updatedProduct.originalImageString;
    }

    const cleanProduct = { ...updatedProduct, image: imageToSave };
    const res = await DataRepository.saveProduct(cleanProduct, Number(updatedProduct.id));
    
    if (res.success) {
      setIsEditModalVisible(false);
      setSelectedProductEdit(null);
      loadProducts(); 
      Alert.alert("Éxito", "Producto actualizado.");
    } else {
      Alert.alert("Error", res.error || "No se pudo actualizar.");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    const res = await DataRepository.deleteProductAdmin(Number(productId));
    if (res.success) {
      setIsEditModalVisible(false);
      setSelectedProductEdit(null);
      loadProducts();
    } else {
      Alert.alert("Error", res.error);
    }
  };

  const handleSavePromotion = async (productId: string, promoData: any, existingPromoId?: number) => {
    const res = await DataRepository.savePromotion(Number(productId), promoData, existingPromoId);
    if (res.success) {
      setIsPromoteModalVisible(false);
      loadProducts(); 
      Alert.alert("Éxito", existingPromoId ? "Promoción actualizada." : "Promoción creada.");
    } else {
      Alert.alert("Error", res.error || "No se pudo guardar la promoción.");
    }
  };

  const handleDeletePromotion = async (promoId: string) => {
    Alert.alert("Eliminar Promoción", "¿Quitar la oferta de este producto?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", onPress: async () => {
          const res = await DataRepository.deletePromotion(Number(promoId));
          if (res.success) {
            setIsPromoteModalVisible(false);
            loadProducts();
          } else {
            Alert.alert("Error", res.error);
          }
      }}
    ]);
  };

  return {
    searchQuery,
    setSearchQuery,
    loading,
    refreshing,
    filteredProducts,
    isAddModalVisible,
    setIsAddModalVisible,
    isEditModalVisible,
    setIsEditModalVisible,
    selectedProductEdit,
    setSelectedProductEdit,
    isPromoteModalVisible,
    setIsPromoteModalVisible,
    selectedProductPromote,
    setSelectedProductPromote,
    onRefresh,
    handleAddProduct,
    handleSaveProduct,
    handleDeleteProduct,
    handleSavePromotion,
    handleDeletePromotion
  };
};