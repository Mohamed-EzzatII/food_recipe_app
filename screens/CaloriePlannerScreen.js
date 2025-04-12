import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function CaloriePlannerScreen() {
  const [target, setTarget] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const suggestMeals = () => {
    const val = parseInt(target);
    const newSuggestions = [];

    if (!val || val <= 0) {
      setSuggestions([]);
      return;
    }

    if (val < 400) {
      newSuggestions.push({
        icon: 'food-apple-outline',
        text: 'Smoothie + Nuts',
        description:
          'Blend 1 banana, 1/2 cup almond milk, and 1/2 cup frozen berries to create a quick and refreshing smoothie. Serve it with a handful of almonds or walnuts for a balance of carbs, protein, and healthy fats.',
      });
      newSuggestions.push({
        icon: 'leaf',
        text: 'Yogurt Parfait',
        description:
          'Layer 1 cup of low-fat yogurt with 1/4 cup granola, 1 tbsp chia seeds, and a handful of fresh berries like strawberries or blueberries. A perfect light and refreshing snack or breakfast.',
      });
      newSuggestions.push({
        icon: 'apple',
        text: 'Fruit Bowl',
        description:
          'Dice a mix of seasonal fruits such as apples, oranges, bananas, and berries. Add a squeeze of lemon juice and a pinch of cinnamon for added flavor and freshness.',
      });
    } else if (val < 700) {
      newSuggestions.push({
        icon: 'leaf',
        text: 'Salad + Boiled Eggs',
        description:
          'Toss together fresh spinach, cherry tomatoes, cucumbers, and a light drizzle of olive oil. Add two boiled eggs sliced on top for protein. Optionally sprinkle with black pepper or a dash of lemon juice.',
      });
      newSuggestions.push({
        icon: 'food-steak',
        text: 'Chicken Caesar Salad',
        description:
          'Grill one chicken breast, slice it, and toss with romaine lettuce, croutons, a sprinkle of parmesan cheese, and 2 tbsp of Caesar dressing. Serve chilled or warm.',
      });
      newSuggestions.push({
        icon: 'food-croissant',
        text: 'Turkey Sandwich',
        description:
          'Use whole grain bread and layer with 2 slices of turkey breast, a lettuce leaf, tomato slices, and a thin layer of mustard or light mayo. Serve with a side of sliced cucumbers.',
      });
    } else if (val < 1000) {
      newSuggestions.push({
        icon: 'food-drumstick',
        text: 'Grilled Chicken + Quinoa',
        description:
          'Grill a seasoned chicken breast and serve it with 1 cup cooked quinoa and a mix of steamed vegetables like carrots, peas, and broccoli. A hearty and nutritious plate.',
      });
      newSuggestions.push({
        icon: 'food-fork-drink',
        text: 'Veggie Stir-fry with Rice',
        description:
          'Sauté bell peppers, onions, broccoli, and snap peas in a bit of olive oil and soy sauce. Serve hot over a cup of cooked brown rice. Top with sesame seeds or a sprinkle of chili flakes.',
      });
      newSuggestions.push({
        icon: 'rice',
        text: 'Poke Bowl',
        description:
          'Fill a bowl with sushi rice, then add diced raw tuna or salmon, cucumber slices, avocado chunks, and shredded carrots. Drizzle with soy sauce or spicy mayo and garnish with sesame seeds.',
      });
    } else if (val < 1300) {
      newSuggestions.push({
        icon: 'noodles',
        text: 'Pasta + Veggies',
        description:
          'Cook whole wheat pasta and toss with sautéed zucchini, bell peppers, and onions. Add a tomato-based sauce and top with a sprinkle of parmesan. Serve with a side salad if desired.',
      });
      newSuggestions.push({
        icon: 'food-turkey',
        text: 'Turkey Wrap',
        description:
          'Wrap slices of turkey breast, baby spinach, avocado slices, and hummus in a whole wheat tortilla. Serve with carrot sticks or cucumber rounds on the side.',
      });
      newSuggestions.push({
        icon: 'hamburger',
        text: 'Chicken Burger + Sweet Potato Fries',
        description:
          'Grill a chicken patty and place it in a whole grain bun with lettuce and tomato. Serve with oven-baked sweet potato fries seasoned with paprika and garlic powder.',
      });
    } else if (val < 1600) {
      newSuggestions.push({
        icon: 'hamburger',
        text: 'Burger + Salad + Sweet Potato',
        description:
          'Cook a lean beef patty and place it in a bun with lettuce, tomato, and a light sauce. Serve with a side of mixed green salad and baked sweet potato wedges.',
      });
      newSuggestions.push({
        icon: 'food-variant',
        text: 'Steak + Mashed Potatoes',
        description:
          'Grill a medium-sized steak to your liking. Serve with creamy mashed potatoes and steamed broccoli or green beans. Add herbs or garlic butter for extra flavor.',
      });
      newSuggestions.push({
        icon: 'food-drumstick',
        text: 'Chicken Alfredo',
        description:
          'Cook fettuccine pasta and toss it in a creamy Alfredo sauce with grilled chicken slices. Garnish with parsley and grated parmesan cheese. Best served hot.',
      });
    } else {
      newSuggestions.push({
        icon: 'food-variant',
        text: 'Full Day Meal Plan',
        description:
          'Start your day with oats topped with banana slices and a boiled egg. For lunch, have grilled chicken with rice and vegetables. Snack on yogurt with fruit. End your day with a bowl of soup and whole grain toast.',
      });
      newSuggestions.push({
        icon: 'food-steak',
        text: 'BBQ Ribs + Cornbread',
        description:
          'Slow-cook or grill pork ribs with barbecue sauce. Serve with freshly baked cornbread and a side of baked beans. A filling, southern-inspired meal.',
      });
      newSuggestions.push({
        icon: 'food-croissant',
        text: 'Big Breakfast',
        description:
          'Prepare 2 pancakes, scrambled eggs, 2 strips of bacon, and a side of crispy hash browns. Add a glass of orange juice or a cup of coffee for a full breakfast experience.',
      });
    }

    const withToggle = newSuggestions.map((item) => ({
      ...item,
      showDescription: false,
    }));
    setSuggestions(withToggle);
  };

  const toggleDescription = (index) => {
    const updated = [...suggestions];
    updated[index].showDescription = !updated[index].showDescription;
    setSuggestions(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Calorie Planner</Text>
      <TextInput
        placeholder="Enter target calories"
        placeholderTextColor="#888"
        keyboardType="numeric"
        style={styles.input}
        value={target}
        onChangeText={setTarget}
      />
      <TouchableOpacity style={styles.button} onPress={suggestMeals}>
        <Text style={styles.buttonText}>Get Suggestions</Text>
      </TouchableOpacity>

      <ScrollView style={styles.resultWrapper}>
        {suggestions.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.suggestion}
            onPress={() => toggleDescription(index)}
            activeOpacity={0.8}
          >
            <Icon name={item.icon} size={24} color="#ffcc00" style={styles.icon} />
            <View style={styles.textWrapper}>
              <Text style={styles.suggestionText}>{item.text}</Text>
              {item.showDescription && (
                <Text style={styles.descriptionText} numberOfLines={6}>
                  {item.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    backgroundColor: '#222',
    color: '#fff',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
  },
  resultWrapper: {
    flex: 1,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#222',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333',
  },
  icon: {
    marginRight: 10,
    marginTop: 3,
  },
  textWrapper: {
    flex: 1,
    flexDirection: 'column',
  },
  suggestionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  descriptionText: {
    color: '#bbb',
    fontSize: 14,
    lineHeight: 18,
    flexWrap: 'wrap',
  },
});
