import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

export default function GlutenFreeScreen() {
  const recipes = [
    { id: '1', name: 'Quinoa Salad' },
    { id: '2', name: 'Grilled Chicken with Veggies' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gluten-Free Recipes</Text>
      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text style={styles.item}>{item.name}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  item: { fontSize: 16, paddingVertical: 8 },
});
