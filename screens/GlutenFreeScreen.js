import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Button from '../components/Button';

const glutenFreeDishes = [
  {
    id: '1',
    name: 'Grilled Chicken Salad',
    calories: '350 kcal',
    ingredients: 'Chicken, lettuce, tomatoes, olive oil',
    image: require('../assets/grilled_chicken_salad.png'), // Placeholder for image
  },
  {
    id: '2',
    name: 'Quinoa Bowl',
    calories: '400 kcal',
    ingredients: 'Quinoa, avocado, black beans, lime',
    image: require('../assets/Quinoa_Bowl.png'), // Placeholder for image
  },
  {
    id: '3',
    name: 'Rice Noodle Stir-Fry',
    calories: '450 kcal',
    ingredients: 'Rice noodles, shrimp, soy sauce, veggies',
    image: require('../assets/Rice_Noodle_Stir-Fry.jpeg'), // Placeholder for image
  },
];

const GlutenFree = () => {
  const navigation = useNavigation();

  // Set navigation options
  useEffect(() => {
    navigation.setOptions({
      title: 'Gluten-Free Dishes',
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Home</Text>
        </TouchableOpacity>
      ),
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginLeft: 15 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderDish = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('DishDetails', { dish: item })}
    >
      {/* Placeholder for Dish Image */}
      <View style={styles.imagePlaceholder}>
        {item.image ? (
          <Image source={item.image} style={styles.dishImage} />
        ) : (
          <Text style={styles.placeholderText}>Dish Image</Text>
        )}
      </View>

      {/* Dish Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.dishName}>{item.name}</Text>
      </View>

      {/* Calories and Ingredients */}
      <View style={styles.infoContainer}>
        <Text style={styles.calories}>Calories: {item.calories}</Text>
        <Text style={styles.ingredientsLabel}>Ingredients:</Text>
        <Text style={styles.ingredients}>{item.ingredients}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gluten-Free Dishes</Text>
      <FlatList
        data={glutenFreeDishes}
        renderItem={renderDish}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <Button
        title="Back to Home"
        type="back"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Black background
    padding: 20,
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF', // White for contrast on black background
    marginBottom: 20,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#000000', // Black background for cards
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333333', // Slightly lighter border for visibility
    overflow: 'hidden',
  },
  imagePlaceholder: {
    width: '100%',
    height: 300,
    backgroundColor: '#333333', // Darker placeholder background
    justifyContent: 'center',
    alignItems: 'center',
  },
  dishImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderText: {
    fontSize: 16,
    color: '#CCCCCC', // Light gray for placeholder text
    fontWeight: 'normal',
  },
  titleContainer: {
    backgroundColor: '#FF6347', // Keeping the primary color for contrast
    padding: 10,
    alignItems: 'center',
  },
  dishName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF', // White text on colored background
  },
  infoContainer: {
    padding: 15,
  },
  calories: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#FFFFFF', // White for contrast on black background
    marginBottom: 5,
  },
  ingredientsLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6347', // Primary color for emphasis
    marginBottom: 5,
  },
  ingredients: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#FFFFFF', // White for contrast on black background
  },
});

export default GlutenFree;