import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RecipeDetailsScreen({ route }) {
  const { recipe } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{recipe.name}</Text>
      <Text style={styles.text}>Calories: {recipe.calories}</Text>
      <Text style={styles.text}>Ingredients: Example ingredients list</Text>
      <Text style={styles.text}>Instructions: Example cooking steps</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  text: { fontSize: 16, marginBottom: 8 },
});
