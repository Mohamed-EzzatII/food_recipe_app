import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Text, ImageBackground, Image, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

// Use correct image paths (verify these exist in your project)
const backgroundImage = require('../assets/fire_background.png');
const recipeImages = {
  'Beef Burger': require('../assets/beef_burger.png'),
  'Caesar Salad': require('../assets/caesar_salad.png'),
  'Grilled Salmon': require('../assets/fish_dish.png')
};

export default function SearchRecipes({ navigation }) {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(false);
  const [imageSize, setImageSize] = useState(Dimensions.get('window').width * 0.8);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'SearchRecipes'));
        const recipesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          recipesData.push({
            id: doc.id,
            name: data.name,
            calories: data.calories,
            ingredients: data.ingredients,
            localImage: recipeImages[data.name]
          });
        });
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();

    const updateImageSize = () => {
      setImageSize(Dimensions.get('window').width * 0.8);
    };

    const dimensionsListener = Dimensions.addEventListener('change', updateImageSize);
    return () => dimensionsListener.remove();
  }, []);

  const handleSearch = () => {
    if (loading || !query.trim()) return;

    let bestMatch = null;
    let lowestDistance = Infinity;

    recipes.forEach((recipe) => {
      const distance = levenshteinDistance(query, recipe.name);
      if (distance < lowestDistance) {
        lowestDistance = distance;
        bestMatch = recipe;
      }
    });

    setResult(lowestDistance <= 3 ? bestMatch : null);
    setSearched(true);
  };

  const levenshteinDistance = (a, b) => {
    if (!a || !b) return Infinity;
    const matrix = Array(a.length + 1).fill().map(() => Array(b.length + 1).fill(0));
    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i-1].toLowerCase() === b[j-1].toLowerCase() ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i-1][j] + 1,
          matrix[i][j-1] + 1,
          matrix[i-1][j-1] + cost
        );
      }
    }
    return matrix[a.length][b.length];
  };

  const formatIngredients = (ingredients) => {
    if (!ingredients) return null;
    return ingredients.split(/[\n,]/)
      .filter(item => item.trim())
      .map((item, index) => (
        <Text key={index} style={styles.ingredient}>{`• ${item.trim()}`}</Text>
      ));
  };

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={backgroundImage} 
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>🔥 Find Your Recipe 🔥</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search recipes..."
              placeholderTextColor="#aaa"
              value={query}
              onChangeText={setQuery}
            />
            <Button
              title="Search"
              onPress={handleSearch}
              color="#ff5722"
            />
          </View>

          {loading && <Text style={styles.loadingText}>Loading recipes...</Text>}

          {searched && !result && (
            <Text style={styles.noResults}>No recipes found. Try another search!</Text>
          )}

          {result && (
            <View style={styles.recipeCard}>
              <Text style={styles.recipeName}>{result.name}</Text>
              <Image
                source={result.localImage}
                style={[styles.recipeImage, { width: imageSize, height: imageSize }]}
                resizeMode="contain"
              />
              <Text style={styles.calories}>{result.calories} calories</Text>
              <Text style={styles.subheader}>Ingredients:</Text>
              <View style={styles.ingredients}>
                {formatIngredients(result.ingredients)}
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginVertical: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  recipeCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  recipeName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  recipeImage: {
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
  },
  calories: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  subheader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  ingredients: {
    marginLeft: 10,
  },
  ingredient: {
    fontSize: 16,
    color: '#444',
    marginBottom: 3,
  },
  loadingText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
  },
  noResults: {
    color: 'white',
    textAlign: 'center',
    fontSize: 18,
    marginVertical: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff5722',
    padding: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});