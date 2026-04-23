import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DatabaseService from '../services/DatabaseService';
import { DataRepository } from '../services/DataRepository';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CartItem } from '../../types';

export const useCheckout = (navigation: any) => {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedCards, setSavedCards] = useState<any[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>('cash');

  // Cargar datos (Carrito offline + Tarjetas online)
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        if (user) {
          // 1. Carrito viene de SQLite (Offline-First persistence)
          const items = await DatabaseService.getCartItems(Number(user.id));
          setCartItems(items);
          
          // 2. Tarjetas vienen de la API 
          const cards = await DataRepository.getCards(Number(user.id));
          setSavedCards(cards);
        }
      };
      loadData();
    }, [user])
  );

  // Cálculos matemáticos
  const subtotal = cartItems.reduce((sum, item) => {
     const price = item.promotionalPrice ? parseFloat(item.promotionalPrice) : parseFloat(item.price);
     return sum + (price * item.quantity);
  }, 0);
  const shipping = 20.00;
  const total = subtotal + shipping;

  // HANDLERS
  const handleDeleteCard = (cardId: number) => {
    Alert.alert("Eliminar", "¿Borrar esta tarjeta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: async () => {
          await DataRepository.deleteCard(cardId); // Online delete
          const cards = await DataRepository.getCards(Number(user?.id)); // Refresh online
          setSavedCards(cards);
          if (selectedPaymentId === cardId.toString()) setSelectedPaymentId('cash');
      }}
    ]);
  };

  const handlePay = async () => {
    if (!user) return;
    setLoading(true);

    try {
      let paymentMethod = 'Efectivo';
      if (selectedPaymentId !== 'cash') {
        const card = savedCards.find(c => c.id.toString() === selectedPaymentId);
        paymentMethod = card ? `Tarjeta ${card.type} •••• ${card.lastFour}` : 'Tarjeta';
      }
      
      // PROCESAR ORDEN ONLINE 
      const result = await DataRepository.createOrder({
        userId: user.id,
        items: cartItems,
        total: total,
        paymentMethod: paymentMethod,
        address: user.address || "Dirección registrada"
      });

      if (result.success) {
        // Limpiar carrito local solo si el servidor confirmó la orden
        await DatabaseService.clearCart(Number(user.id));
        await refreshCart();

        Alert.alert("¡Pedido Exitoso!", "Tu orden ha sido enviada a cocina.", [
          { 
            text: "Ver Estado", 
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'ClientRoot' }] // Te lleva al inicio limpio
            })
          } 
        ]);
      } else {
        Alert.alert("Error", result.error || "No se pudo crear la orden.");
      }
    } catch (error) {
      Alert.alert("Error", "Fallo de conexión crítico.");
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    cartItems,
    savedCards,
    selectedPaymentId,
    setSelectedPaymentId,
    subtotal,
    shipping,
    total,
    handleDeleteCard,
    handlePay
  };
};