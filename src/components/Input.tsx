import React, { useState } from 'react';
import {
  TextInput,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  isPassword?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  isPassword = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          {...props}
          style={[
            styles.input,
            error && styles.inputError,
            isPassword && { paddingRight: 40 },
          ]}
          secureTextEntry={isPassword && !showPassword}
          placeholderTextColor="#9CA3AF"
        />
        {isPassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <Ionicons name="eye-off" size={20} color="#6B7280" />
            ) : (
              <Ionicons name="eye" size={20} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -10,
  },
  error: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
  },
});
