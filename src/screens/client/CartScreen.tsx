import React from 'react';
import { 
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../types';
import { useCartScreen } from '../../hooks/useCartScreen'; // Importación del ViewModel

const CartScreen = ({ navigation }: any) => {
  // Consumo de lógica y estado desde el ViewModel
  const {
    cartItems,
    loading,
    handleDelete,
    calculateTotal,
    handleCheckout,
    resolveImage
  } = useCartScreen(navigation);

  if (loading) return <ActivityIndicator style={{marginTop: 50}} color={COLORS.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tu Carrito</Text>
      
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.cartItemId.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>El carrito está vacío ☹️</Text>}
        renderItem={({ item }) => {
            const price = item.promotionalPrice || item.price;
            const subtotal = (price * item.quantity).toFixed(2); 

            return (
              <View style={styles.itemCard}>
                <Image source={resolveImage(item.image)} style={styles.image} />
                <View style={styles.info}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemPrice}>${price} x {item.quantity}</Text>
                  <Text style={styles.itemSubtotal}>Sub: ${subtotal}</Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={24} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            );
        }}
      />

      {cartItems.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
            <Text style={styles.checkoutText}>PAGAR AHORA</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9F9F9', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#888', fontSize: 18 },
  itemCard: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', elevation: 2 },
  image: { width: 60, height: 60, borderRadius: 8, marginRight: 15 },
  info: { flex: 1 },
  itemTitle: { fontWeight: 'bold', fontSize: 16, color: COLORS.text },
  itemPrice: { color: '#666' },
  itemSubtotal: { fontWeight: 'bold', color: COLORS.primary, marginTop: 4 },
  footer: { marginTop: 20, borderTopWidth: 1, borderColor: '#EEE', paddingTop: 20 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 20, fontWeight: 'bold' },
  totalAmount: { fontSize: 24, fontWeight: 'bold', color: COLORS.primary },
  checkoutButton: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 12, alignItems: 'center' },
  checkoutText: { color: 'white', fontWeight: 'bold', fontSize: 18 }
});

export default CartScreen;