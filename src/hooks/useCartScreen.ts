import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';

import DatabaseService from '../services/DatabaseService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

// Helper de imagen movido aquí
export const resolveImage = (imageSource: string | any) => {
  if (!imageSource) return require('../../assets/logoApp.png');
  if (typeof imageSource === 'string' && imageSource.startsWith('http')) return { uri: imageSource };
  return require('../../assets/logoApp.png'); 
};

export const useCartScreen = (navigation: any) => {
  const { user } = useAuth();
  const { refreshCart } = useCart(); 
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    if (!user) return;
    setLoading(true);
    const items = await DatabaseService.getCartItems(Number(user.id));
    setCartItems(items);
    setLoading(false);
  };

  useFocusEffect(useCallback(() => { loadCart(); }, [user]));

  const handleDelete = async (productId: number) => {
    if (!user) return;
    await DatabaseService.removeFromCart(Number(user.id), productId);
    await loadCart();
    await refreshCart(); // Actualiza badge global
  };

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = item.promotionalPrice || item.price;
      return sum + (price * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    // 1. VALIDACIÓN DE INTERNET (Corta el flujo Offline)
    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      Alert.alert(
        "Sin Conexión", 
        "Necesitas internet para procesar el pago. Tu carrito está guardado."
      );
      return;
    }
    // 2. Si hay internet -> Ir a Checkout
    navigation.navigate('Checkout', { 
      items: cartItems, 
      total: calculateTotal() 
    });
  };

  return {
    cartItems,
    loading,
    handleDelete,
    calculateTotal,
    handleCheckout,
    resolveImage
  };
};