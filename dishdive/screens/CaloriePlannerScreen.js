import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function CaloriePlannerScreen() {
  const [target, setTarget] = useState('');
  const [suggestion, setSuggestion] = useState('');

  const suggestMeals = () => {
    const val = parseInt(target);
    if (val < 600) setSuggestion('Try a smoothie and a salad');
    else if (val < 1200) setSuggestion('Try chicken, rice, and veggies');
    else setSuggestion('Breakfast, lunch, snack, and light dinner');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calorie Planner</Text>
      <TextInput
        placeholder="Enter target calories"
        keyboardType="numeric"
        style={styles.input}
        value={target}
        onChangeText={setTarget}
      />
      <Button title="Get Suggestions" onPress={suggestMeals} />
      {suggestion ? <Text style={styles.result}>{suggestion}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
  result: { marginTop: 20, fontSize: 16, color: 'green' },
});
