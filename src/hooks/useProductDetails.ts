import { useState, useEffect } from 'react';
//import { Alert } from 'react'; 
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Platillo } from '../../types';

// Función movida aquí para procesar los datos antes de enviarlos a la vista
const resolveImage = (imageSource: string | any) => {
  if (!imageSource) return require('../../assets/logoApp.png');
  if (typeof imageSource === 'string' && (imageSource.startsWith('http') || imageSource.startsWith('file://'))) {
    return { uri: imageSource };
  }
  switch (imageSource) {
    case 'bowlFrutas': return require('../../assets/bowlFrutas.png');
    case 'tostadaAguacate': return require('../../assets/tostadaAguacate.png');
    case 'Panques': return require('../../assets/Panques.png');
    case 'cafePanda': return require('../../assets/cafePanda.png');
    default: return require('../../assets/logoApp.png');
  }
};

interface UseProductDetailsProps {
  platillo: Platillo;
  onSuccessAddToCart: () => void;
}

export const useProductDetails = ({ platillo, onSuccessAddToCart }: UseProductDetailsProps) => {
  const { user } = useAuth();
  const { addToCart } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);

  const activePrice = platillo.promotionalPrice || platillo.price;
  const hasPromo = !!platillo.promotionalPrice;
  const imageSource = resolveImage(platillo.image);

  useEffect(() => {
    if (platillo.title.includes('Cafe') || platillo.title.includes('Bebida')) {
      setAvailableSizes(['M', 'G']); setSelectedSize('M');
    } else if (platillo.title.includes('Bowl') || platillo.title.includes('Ensalada')) {
      setAvailableSizes(['CH', 'M', 'G']); setSelectedSize('M');
    } else {
      setAvailableSizes(['Único']); setSelectedSize('Único');
    }
  }, [platillo]);

  const increaseQuantity = () => setQuantity(q => q + 1);
  const decreaseQuantity = () => setQuantity(q => Math.max(1, q - 1));

  const handleAddToCart = async (alertFunction: (title: string, message: string) => void) => {
    if (!user) {
      alertFunction("Error", "Inicia sesión primero.");
      return;
    }
    const success = await addToCart(Number(platillo.id), quantity);
    
    if (success) {
      alertFunction('¡Listo!', 'Producto agregado al carrito.');
      onSuccessAddToCart();
    }
  };

  return {
    quantity,
    increaseQuantity,
    decreaseQuantity,
    selectedSize,
    setSelectedSize,
    availableSizes,
    activePrice,
    hasPromo,
    imageSource,
    handleAddToCart
  };
};