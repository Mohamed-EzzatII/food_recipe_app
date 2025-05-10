import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, Text, StyleSheet } from 'react-native';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    const mockRecipes = [
      { id: '1', name: 'Chicken Salad', calories: 350 },
      { id: '2', name: 'Pasta Bolognese', calories: 500 },
    ];
    const filtered = mockRecipes.filter(r => r.name.toLowerCase().includes(query.toLowerCase()));
    setResults(filtered);
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search recipe..."
        style={styles.input}
        value={query}
        onChangeText={setQuery}
      />
      <Button title="Search" onPress={handleSearch} />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text
            style={styles.item}
            onPress={() => navigation.navigate('Details', { recipe: item })}
          >
            {item.name} - {item.calories} kcal
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
  item: { padding: 10, fontSize: 16 },
});
