import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { DataRepository } from '../services/DataRepository';
import DatabaseService from '../services/DatabaseService';

export const useHomeData = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    if (!refreshing) setLoading(true);
    try {
      // 1. Traer Productos desde el repositorio
      const prodData = await DataRepository.getProducts();
      // 2. Traer Promociones desde SQLite
      const promoData = await DatabaseService.getPromotionsWithProduct();

      setProducts(prodData);
      setFilteredProducts(prodData);
      setPromotions(promoData);
    } catch (error) {
      console.error("Error cargando datos en useHomeData:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  // búsqueda y filtrado
  const handleSearch = (text: string) => {
    setSearchText(text);
    if (!text) {
      setFilteredProducts(products);
      return;
    }
    const lower = text.toLowerCase();
    const filtered = products.filter(p => 
      p.title.toLowerCase().includes(lower) || 
      (p.description && p.description.toLowerCase().includes(lower))
    );
    setFilteredProducts(filtered);
  };

  return {
    promotions,
    filteredProducts,
    loading,
    refreshing,
    searchText,
    onRefresh,
    handleSearch
  };
};