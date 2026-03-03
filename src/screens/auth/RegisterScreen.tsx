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
import { register, clearError } from '../../store/authSlice';
import { AuthStackParamList } from '../../navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Le nom est requis';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Le numéro de téléphone est requis';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    dispatch(clearError());

    if (!validateForm()) return;

    const fullPhone = phone.startsWith('+225') ? phone : `+225${phone}`;
    dispatch(register({ phone: fullPhone, password, name }));
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
          {/* Header */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#F1F5F9" />
          </TouchableOpacity>

          {/* Titre */}
          <Text style={styles.title}>Créer un compte</Text>
          <Text style={styles.subtitle}>
            Rejoignez la communauté PriZo et comparez les meilleurs tarifs VTC
          </Text>

          {/* Formulaire */}
          <View style={styles.form}>
            <Input
              label="Nom complet"
              placeholder="Kouamé Konan"
              value={name}
              onChangeText={setName}
              icon="person-outline"
              error={errors.name}
            />

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
                  error={errors.phone}
                />
              </View>
            </View>

            <Input
              label="Mot de passe"
              placeholder="Minimum 6 caractères"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.password}
            />

            <Input
              label="Confirmer le mot de passe"
              placeholder="Confirmez votre mot de passe"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="lock-closed-outline"
              error={errors.confirmPassword}
            />

            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Button
              label="Créer mon compte"
              onPress={handleRegister}
              variant="primary"
              fullWidth
              loading={isLoading}
            />
          </View>

          {/* Lien connexion */}
          <View style={styles.loginLink}>
            <Text style={styles.loginText}>Déjà un compte ?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLinkText}> Se connecter</Text>
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
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
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
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 'auto',
  },
  loginText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default RegisterScreen;
