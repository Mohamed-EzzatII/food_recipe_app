import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from '../components/Button'; // Adjust path to match your project structure
import { db } from '../firebase'; // Adjust path to your firebase.js file
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CaloriePlannerScreen() {
  const navigation = useNavigation();
  const [target, setTarget] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const suggestMeals = async () => {
    const val = parseInt(target);
    if (!val || val <= 0) {
      setSuggestions([]);
      return;
    }

    // Determine the calorie range based on input
    let range;
    if (val < 400) range = '0-400';
    else if (val < 700) range = '401-700';
    else if (val < 1000) range = '701-1000';
    else if (val < 1300) range = '1001-1300';
    else if (val < 1600) range = '1301-1600';
    else range = '1601+';

    // Query Firestore for suggestions in the calorie range
    try {
      const q = query(
        collection(db, 'caloriePlans'),
        where('calorieRange', '==', range)
      );
      const querySnapshot = await getDocs(q);
      const newSuggestions = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        showDescription: false,
      }));
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error('Error fetching calorie plans:', error);
      setSuggestions([]);
    }
  };

  const toggleDescription = (index) => {
    const updated = [...suggestions];
    updated[index].showDescription = !updated[index].showDescription;
    setSuggestions(updated);
  };

  // Set navigation options with back button in header
  useEffect(() => {
    navigation.setOptions({
      title: 'Calorie Planner',
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎯 Calorie Planner</Text>
      <TextInput
        placeholder="Enter target calories"
        placeholderTextColor="#FFFFFF"
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
            <Icon name={item.icon} size={24} color="#FF6347" style={styles.icon} />
            <View style={styles.textWrapper}>
              <Text style={styles.suggestionText}>{item.name}</Text>
              {item.showDescription && (
                <Text style={styles.descriptionText} numberOfLines={6}>
                  {item.description}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Back Button to match Gluten-Free page */}
      <Button
        title="Back to Home"
        type="back"
        onPress={() => navigation.navigate('Home')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Matches Gluten-Free page
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600', // Matches Gluten-Free header font weight
    color: '#FFFFFF', // Matches Gluten-Free text color
    marginBottom: 10,
    textAlign: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold', // Matches Gluten-Free header button style
    color: '#FFFFFF', // Matches Gluten-Free text color
  },
  input: {
    borderWidth: 1,
    borderColor: '#333333', // Darker border to match Gluten-Free card style
    backgroundColor: '#222222', // Slightly lighter than Gluten-Free for contrast
    color: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#FF6347', // Matches Gluten-Free badge and title container color
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF', // Matches Gluten-Free text on buttons
    fontWeight: 'bold', // Matches Gluten-Free button text
  },
  resultWrapper: {
    flex: 1,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#000000', // Matches Gluten-Free card background
    padding: 12,
    borderRadius: 10, // Matches Gluten-Free card radius
    marginBottom: 15, // Matches Gluten-Free card spacing
    borderWidth: 1,
    borderColor: '#333333', // Matches Gluten-Free card border
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
    color: '#FFFFFF', // Matches Gluten-Free dish name
    fontSize: 18, // Matches Gluten-Free dish name size
    fontWeight: 'bold', // Matches Gluten-Free dish name weight
    marginBottom: 4,
  },
  descriptionText: {
    color: '#CCCCCC', // Matches Gluten-Free description text
    fontSize: 16, // Matches Gluten-Free info text size
    lineHeight: 18,
    flexWrap: 'wrap',
  },
});