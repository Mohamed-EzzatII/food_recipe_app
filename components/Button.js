import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const Button = ({ title, onPress, type = 'primary' }) => {
  return (
    <TouchableOpacity
      style={[styles.button, type === 'primary' ? styles.primary : styles.back]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  primary: {
    backgroundColor: '#FF6347', // Tomato Red
  },
  back: {
    backgroundColor: '#FF6347', // Steel Blue (still works on black background)
  },
  buttonText: {
    color: '#FFFFFF', // White text (already good for black background)
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Button;