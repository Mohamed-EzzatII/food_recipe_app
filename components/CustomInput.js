import React from 'react';
import { TextInput, StyleSheet } from 'react-native';

export default function CustomInput({ value, onChangeText, placeholder, secureTextEntry, isValid }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#ccc"
      secureTextEntry={secureTextEntry}
      style={[styles.input, !isValid && styles.invalidInput]}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    width: '90%',
  },
  invalidInput: {
    borderColor: 'red',
  },
});
