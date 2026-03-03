import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    if (disabled || loading) {
      baseStyle.opacity = 0.5;
    }

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: '#F97316' };
      case 'secondary':
        return { ...baseStyle, backgroundColor: '#1A1A2E' };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: '#F97316',
        };
      default:
        return { ...baseStyle, backgroundColor: '#F97316' };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
      case 'secondary':
        return { ...baseStyle, color: '#FFFFFF' };
      case 'outline':
        return { ...baseStyle, color: '#F97316' };
      default:
        return { ...baseStyle, color: '#FFFFFF' };
    }
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? '#F97316' : '#FFFFFF'}
          style={styles.loader}
        />
      ) : null}
      <Text style={getTextStyle()}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  loader: {
    marginRight: 8,
  },
});

export default Button;
