import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { DataRepository } from '../services/DataRepository';

export const useOrderTracking = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // ordenes
  const loadOrders = async () => {
    if (!refreshing) setLoading(true);
    try {
      const result = await DataRepository.getOrders();
      if (result.success) {
        setOrders((result as any).data);
      }
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
      setRefreshing(false); 
    }
  };

  useFocusEffect(
    useCallback(() => { loadOrders(); }, [])
  );

  const onRefresh = () => { 
    setRefreshing(true); 
    loadOrders(); 
  };

  // acciones de las ordenes
  const handleUpdateOrder = async (orderId: string, data: any) => {
    const res = await DataRepository.updateOrder(Number(orderId), {
      status: data.status,
      deliveryTime: data.estimatedTime,
      notes: data.comment
    });
    if (res.success) {
      setIsModalVisible(false); 
      setSelectedOrder(null); 
      loadOrders();
      Alert.alert("Éxito", "Orden actualizada.");
    } else { 
      Alert.alert("Error", res.error); 
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    Alert.alert("Confirmar", "¿Marcar como entregada?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sí", onPress: async () => {
          const res = await DataRepository.updateOrder(Number(orderId), { status: 'completado' });
          if (res.success) { setIsModalVisible(false); loadOrders(); }
      }}
    ]);
  };

  const handleCancelOrder = async (orderId: string) => {
    Alert.alert("Confirmar", "¿Cancelar orden?", [
      { text: "No", style: "cancel" },
      { text: "Sí", style: 'destructive', onPress: async () => {
          const res = await DataRepository.updateOrder(Number(orderId), { status: 'cancelado' });
          if (res.success) { setIsModalVisible(false); loadOrders(); }
      }}
    ]);
  };

  // control del modal
  const openActionModal = (order: any) => {
    setSelectedOrder(order);
    setIsModalVisible(true);
  };

  const closeActionModal = () => {
    setIsModalVisible(false);
    setSelectedOrder(null);
  };
  const activeOrders = orders.filter(o => o.status === 'Pendiente' || o.status === 'En proceso');
  const historyOrders = orders.filter(o => o.status?.toLowerCase() === 'completado' || o.status?.toLowerCase() === 'cancelado');

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pendiente': return '#FF9800'; 
      case 'en proceso': return '#2196F3';
      case 'completado': return '#4CAF50';
      case 'cancelado': return '#F44336';
      default: return '#999';
    }
  };

  return {
    loading,
    refreshing,
    selectedOrder,
    isModalVisible,
    activeOrders,
    historyOrders,
    onRefresh,
    handleUpdateOrder,
    handleCompleteOrder,
    handleCancelOrder,
    openActionModal,
    closeActionModal,
    getStatusColor
  };
};