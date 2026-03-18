import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { DataRepository } from '../services/DataRepository';
import { useAuth } from '../context/AuthContext';

export const useClientOrderTracking = () => {
  const { user } = useAuth();
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Cargar ordenes del Back
  const loadOrders = async () => {
    if (!user) return;
    
    try {
      const result = await DataRepository.getOrders();
      
      if (result.success) {
        setOrders((result as any).data);
      } else {
        console.log(result.error); 
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadOrders();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

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
    orders,
    loading,
    refreshing,
    onRefresh,
    getStatusColor
  };
};