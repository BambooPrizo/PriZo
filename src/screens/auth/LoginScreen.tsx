import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAppDispatch, useAppSelector } from '../../store';
import { login, clearError } from '../../store/authSlice';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = (): boolean => {
    let isValid = true;
    setPhoneError('');
    setPasswordError('');

    if (!phone.trim()) {
      setPhoneError('Le numéro de téléphone est requis');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Le mot de passe est requis');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    dispatch(clearError());

    if (!validateForm()) return;

    const fullPhone = phone.startsWith('+225') ? phone : `+225${phone}`;
    dispatch(login({ phone: fullPhone, password }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="car-sport" size={48} color="#F97316" />
            </View>
            <Text style={styles.appName}>PriZo</Text>
          </View>

          {/* Titre */}
          <Text style={styles.title}>Bon retour 👋</Text>
          <Text style={styles.subtitle}>
            Connectez-vous pour accéder à vos alertes et historique
          </Text>

          {/* Formulaire */}
          <View style={styles.form}>
            <View style={styles.phoneInputContainer}>
              <View style={styles.prefix}>
                <Text style={styles.prefixText}>+225</Text>
              </View>
              <View style={styles.phoneInput}>
                <Input
                  label="Numéro de téléphone"
                  placeholder="07 XX XX XX XX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  icon="call-outline"
                  error={phoneError}
                />
              </View>
            </View>

            <Input
              label="Mot de passe"
              placeholder="Votre mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={passwordError}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              label="Se connecter"
              onPress={handleLogin}
              variant="primary"
              fullWidth
              loading={isLoading}
            />
          </View>

          {/* Lien inscription */}
          <View style={styles.registerLink}>
            <Text style={styles.registerText}>Pas encore de compte ?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLinkText}> S'inscrire</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    color: '#F97316',
    fontSize: 32,
    fontWeight: '800',
  },
  title: {
    color: '#F1F5F9',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  prefix: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginRight: 8,
    marginBottom: 16,
  },
  prefixText: {
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  phoneInput: {
    flex: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  registerLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  registerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  registerLinkText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;
