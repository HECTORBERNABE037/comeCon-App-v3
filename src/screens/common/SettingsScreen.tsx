import React from 'react';
import { 
  View, Text, StyleSheet, Switch, SafeAreaView, StatusBar, Platform 
} from 'react-native';
import { COLORS, FONT_SIZES } from '../../../types';
import { useSettings } from '../../hooks/useSettings'; // Importación del ViewModel

export const SettingsScreen = ({ navigation }: { navigation: any }) => {
  // Consumo de lógica y estado desde el ViewModel (Custom Hook)
  const {
    notificationsEnabled,
    cameraEnabled,
    updating,
    toggleNotifications,
    toggleCamera
  } = useSettings();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F2F2F2" />
      
      {/* HEADER */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <View style={styles.headerUnderline} />
      </View>

      {/* SECCIÓN NOTIFICACIONES */}
      <View style={styles.content}>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Notificaciones Push</Text>
          <Switch
            trackColor={{ false: '#D3D3D3', true: COLORS.primary }}
            thumbColor={COLORS.white}
            ios_backgroundColor="#D3D3D3"
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
            disabled={updating}
          />
        </View>
        <Text style={styles.hint}>Recibe alertas sobre el estado de tus pedidos y promociones.</Text>
      </View>

      {/* SECCIÓN CÁMARA */}
      <View style={styles.content}>
        <View style={styles.settingRow}>
          <Text style={styles.settingText}>Acceso a la Cámara</Text>
          <Switch
            trackColor={{ false: '#D3D3D3', true: COLORS.primary }}
            thumbColor={COLORS.white}
            ios_backgroundColor="#D3D3D3"
            onValueChange={toggleCamera}
            value={cameraEnabled}
            disabled={updating}
          />
        </View>
        <Text style={styles.hint}>Permite usar la cámara para tu foto de perfil.</Text>
      </View>
      
      {updating && <Text style={styles.savingText}>Guardando cambios en la nube...</Text>}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F2F2' },
  headerCard: {
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? 40 : 10,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerUnderline: {
    height: 3,
    width: 100,
    backgroundColor: COLORS.primary,
    marginTop: 5,
  },
  content: { 
    marginTop: 10, 
    padding: 20, 
    backgroundColor: COLORS.white, 
    borderRadius: 15, 
    marginHorizontal: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    marginBottom: 15
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.text,
  },
  hint: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  savingText: {
    textAlign: 'center',
    marginTop: 20,
    color: COLORS.primary,
    fontStyle: 'italic',
    fontSize: FONT_SIZES.small,
  }
});

export default SettingsScreen;