import React from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { COLORS, FONT_SIZES, RootStackParamList } from '../../../types';
import { useCheckout } from '../../hooks/useCheckout'; // Importación del ViewModel

type Props = StackScreenProps<RootStackParamList, 'Checkout'>;

const CheckoutScreen: React.FC<Props> = ({ navigation }) => {
  // Consumo de lógica y estado desde el ViewModel
  const {
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
  } = useCheckout(navigation);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="arrow-back" size={28} color={COLORS.text} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Resumen</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Dirección */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Dirección de entrega</Text>
          <View style={styles.row}>
            <Ionicons name="location-outline" size={24} color={COLORS.primary} />
            <Text style={styles.addressText}>{user?.address || "Sin dirección registrada"}</Text>
          </View>
        </View>

        {/* Método de Pago */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Método de Pago</Text>
          
          {savedCards.map((card) => (
            <TouchableOpacity 
              key={card.id}
              style={[styles.paymentOption, selectedPaymentId === card.id.toString() && styles.activeOption]}
              onPress={() => setSelectedPaymentId(card.id.toString())}
            >
              <View style={{flexDirection:'row', alignItems:'center', flex:1}}>
                <Ionicons name="card" size={24} color={COLORS.text} />
                <View style={{marginLeft: 10}}>
                  <Text style={styles.optionText}>{card.type} •••• {card.lastFour}</Text>
                  <Text style={{fontSize:10, color:'#888'}}>{card.holderName}</Text>
                </View>
              </View>
              
              <View style={{flexDirection:'row', alignItems:'center'}}>
                {selectedPaymentId === card.id.toString() && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} style={{marginRight:10}}/>}
                <TouchableOpacity onPress={() => handleDeleteCard(card.id)}>
                  <Ionicons name="trash-outline" size={20} color="#D50000" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}

          {savedCards.length < 3 && (
            <TouchableOpacity style={styles.addCardButton} onPress={() => navigation.navigate('AddCard')}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
              <Text style={{marginLeft: 10, color: COLORS.primary, fontWeight:'600'}}>Nueva Tarjeta</Text>
            </TouchableOpacity>
          )}

          <View style={styles.divider} />

          {/* Opción Efectivo */}
          <TouchableOpacity 
            style={[styles.paymentOption, selectedPaymentId === 'cash' && styles.activeOption]}
            onPress={() => setSelectedPaymentId('cash')}
          >
            <View style={{flexDirection:'row', alignItems:'center'}}>
              <Ionicons name="cash-outline" size={24} color={COLORS.text} />
              <Text style={styles.optionText}>Efectivo</Text>
            </View>
            {selectedPaymentId === 'cash' && <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />}
          </TouchableOpacity>
        </View>

        {/* Resumen Productos */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Productos ({cartItems.length})</Text>
          {cartItems.map((item, index) => {
             const itemPrice = item.promotionalPrice ? parseFloat(item.promotionalPrice) : parseFloat(item.price);
             return (
              <View key={index} style={styles.miniItemRow}>
                <Text style={styles.miniQty}>{item.quantity}x</Text>
                <Text style={styles.miniTitle}>{item.title}</Text>
                <Text style={styles.miniPrice}>${(itemPrice * item.quantity).toFixed(2)}</Text>
              </View>
             );
          })}
        </View>

      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.calcRow}><Text style={styles.calcLabel}>Subtotal</Text><Text style={styles.calcValue}>${subtotal.toFixed(2)}</Text></View>
        <View style={styles.calcRow}><Text style={styles.calcLabel}>Envío</Text><Text style={styles.calcValue}>${shipping.toFixed(2)}</Text></View>
        <View style={styles.divider} />
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>${total.toFixed(2)}</Text></View>

        <TouchableOpacity style={[styles.payButton, loading && {opacity: 0.7}]} onPress={handlePay} disabled={loading}>
          {loading ? <ActivityIndicator color="white"/> : <Text style={styles.payText}>CONFIRMAR PEDIDO</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 30 },
  headerTitle: { fontSize: FONT_SIZES.large, fontWeight: 'bold' },
  content: { paddingHorizontal: 20, paddingBottom: 220 },
  sectionCard: { backgroundColor: COLORS.white, borderRadius: 15, padding: 15, marginBottom: 15 },
  sectionTitle: { fontSize: FONT_SIZES.medium, fontWeight: 'bold', marginBottom: 10, color: COLORS.text },
  row: { flexDirection: 'row', alignItems: 'center' },
  addressText: { marginLeft: 10, color: '#666', flex: 1 },
  
  paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  activeOption: { backgroundColor: '#FFF3E0', borderRadius: 10, paddingHorizontal: 5, borderBottomWidth: 0 },
  optionText: { marginLeft: 10, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  addCardButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },

  miniItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  miniQty: { fontWeight: 'bold', color: COLORS.primary, width: 30 },
  miniTitle: { flex: 1, color: '#555' },
  miniPrice: { fontWeight: 'bold', color: '#333' },

  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: COLORS.white, padding: 20, borderTopLeftRadius: 25, borderTopRightRadius: 25, elevation: 15 },
  calcRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  calcLabel: { color: '#888' },
  calcValue: { color: '#333', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  totalLabel: { fontSize: 18, fontWeight: 'bold' },
  totalValue: { fontSize: 18, fontWeight: 'bold', color: COLORS.primary },
  payButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 12, alignItems: 'center' },
  payText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});

export default CheckoutScreen;