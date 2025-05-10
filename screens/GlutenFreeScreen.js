import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions, Platform, Alert } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { db, auth } from '../firebase';
import {
  collection, getDocs, query, where, doc, updateDoc, setDoc, getDoc, onSnapshot,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import Button from '../components/Button';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const navigationRef = { current: null };

const setNavigationRef = (navigation) => {
  navigationRef.current = navigation;
};

const navigateFromNotification = (screen, params) => {
  if (navigationRef.current) {
    navigationRef.current.navigate(screen, params);
  }
};

const requestNotificationPermission = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

const fetchRecipes = async (category) => {
  const q = query(collection(db, 'recipes'), where('category', '==', category));
  const querySnapshot = await getDocs(q);
  const imageMap = {
    '1': require('../assets/grilled_chicken_salad.png'),
    '2': require('../assets/Quinoa_Bowl.png'),
    '3': require('../assets/Rice_Noodle_Stir-Fry.jpeg'),
  };
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      image: imageMap[doc.id] || null,
    };
  });
};

const fetchUserFavorites = (userId, dishes, setState) => {
  if (!userId) return;
  const userFavoritesRef = doc(db, 'users', userId);
  return onSnapshot(userFavoritesRef, (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      const favoriteIds = userData.favorites || [];
      setState(prev => ({
        ...prev,
        dishes: prev.dishes.map(dish => ({
          ...dish,
          isFavorite: favoriteIds.includes(dish.id),
        })),
      }));
    }
  });
};

const GlutenFree = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [user, setUser] = useState(null);
  const [state, setState] = useState({
    screenWidth: Dimensions.get('window').width,
    selectedDishId: null,
    dishes: [],
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    const loadRecipes = async () => {
      try {
        const recipes = await fetchRecipes('Gluten Free');
        setState(prev => ({
          ...prev,
          dishes: recipes.map(dish => ({ ...dish, isFavorite: false })),
        }));
      } catch (error) {
        console.error('Error fetching recipes:', error);
        Alert.alert('Error', 'Failed to load recipes.');
      }
    };
    loadRecipes();

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeFavorites = fetchUserFavorites(user.uid, state.dishes, setState);
      return () => unsubscribeFavorites();
    }
  }, [user, state.dishes.length]);

  useEffect(() => {
    setNavigationRef(navigation);
  }, [navigation]);

  useEffect(() => {
    const updateDimensions = () => {
      setState(prev => ({ ...prev, screenWidth: Dimensions.get('window').width }));
    };
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  const toggleDishDetails = (dishId) => {
    setState(prev => ({
      ...prev,
      selectedDishId: prev.selectedDishId === dishId ? null : dishId,
    }));
  };

  const toggleFavorite = async (dishId, dishName) => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in to favorite dishes.');
      return;
    }

    try {
      // Optimistically update UI
      setState(prev => ({
        ...prev,
        dishes: prev.dishes.map(dish =>
          dish.id === dishId ? { ...dish, isFavorite: !dish.isFavorite } : dish
        ),
      }));

      const userFavoritesRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userFavoritesRef);
      const currentFavorites = docSnap.exists() ? docSnap.data().favorites || [] : [];
      const isFavorited = !currentFavorites.includes(dishId);
      
      const updatedFavorites = isFavorited
        ? [...currentFavorites, dishId]
        : currentFavorites.filter(id => id !== dishId);

      if (docSnap.exists()) {
        await updateDoc(userFavoritesRef, { favorites: updatedFavorites });
      } else {
        await setDoc(userFavoritesRef, { favorites: updatedFavorites });
      }

      // Show notification if favorited
      if (isFavorited) {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: 'Dish Favorited',
              body: `${dishName} added to favorites!`,
              data: { dishId },
            },
            trigger: null,
          });
        } else {
          Alert.alert('Favorited', `${dishName} added to favorites!`);
        }
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      // Revert UI if update fails
      setState(prev => ({
        ...prev,
        dishes: prev.dishes.map(dish =>
          dish.id === dishId ? { ...dish, isFavorite: !dish.isFavorite } : dish
        ),
      }));
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  const renderDish = ({ item }) => (
    <DishCard
      item={item}
      isExpanded={state.selectedDishId === item.id}
      toggleDishDetails={toggleDishDetails}
      toggleFavorite={toggleFavorite}
      screenWidth={state.screenWidth}
    />
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gluten-Free Dishes</Text>
      <FlatList
        data={state.dishes}
        renderItem={renderDish}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
      <Button title="Back to Home" type="back" onPress={() => navigation.navigate('Home')} />
    </View>
  );
};

// DishCard component with local image support
const DishCard = ({ item, isExpanded, toggleDishDetails, toggleFavorite, screenWidth }) => {
  const animation = useSharedValue(isExpanded ? 1 : 0);

  useEffect(() => {
    animation.value = withTiming(isExpanded ? 1 : 0, { duration: 300 });
  }, [isExpanded]);

  const animatedStyle = useAnimatedStyle(() => ({
    maxHeight: animation.value * 1000,
    opacity: animation.value,
  }));

  return (
    <TouchableOpacity style={[styles.card, styles.cardShadow]} onPress={() => toggleDishDetails(item.id)}>
      <View style={[styles.imagePlaceholder, { height: screenWidth * 0.6 }]}>
        {item.image ? (
          <Image
            source={item.image} // Use the require() result directly
            style={[styles.dishImage, { height: screenWidth * 0.6 }]}
            onError={(e) => console.log(`Image load error for ${item.name}:`, e.nativeEvent.error)}
          />
        ) : (
          <Text style={styles.placeholderText}>Dish Image</Text>
        )}
        <View style={styles.badge}><Text style={styles.badgeText}>GF</Text></View>
      </View>
      <View style={styles.titleContainer}>
        <View style={styles.titleTextContainer}>
          <Text style={styles.dishName}>{item.name}</Text>
          {!isExpanded && <Text style={styles.descriptionText}>{item.description}</Text>}
        </View>
        <TouchableOpacity onPress={() => toggleFavorite(item.id, item.name)}>
          <Icon name={item.isFavorite ? 'heart' : 'heart-outline'} size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {isExpanded && (
        <Animated.View style={[styles.infoContainer, animatedStyle]}>
          <Text style={styles.calories}>Calories: {item.calories}</Text>
          <Text style={styles.ingredientsLabel}>Ingredients:</Text>
          <Text style={styles.ingredients}>{item.ingredients}</Text>
          <Text style={styles.preparationLabel}>Preparation:</Text>
          <Text style={styles.preparation}>{item.preparation}</Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  header: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 20, textAlign: 'center' },
  listContainer: { paddingBottom: 20 },
  card: { backgroundColor: '#000000', borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#333333', overflow: 'hidden' },
  cardShadow: { shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  imagePlaceholder: { width: '100%', backgroundColor: '#333333', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  dishImage: { width: '100%', resizeMode: 'cover' },
  placeholderText: { fontSize: 16, color: '#CCCCCC', fontWeight: 'normal' },
  badge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#FF6347', borderRadius: 12, padding: 5 },
  badgeText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  titleContainer: { backgroundColor: '#FF6347', padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titleTextContainer: { flex: 1, marginRight: 10 },
  dishName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  descriptionText: { fontSize: 14, color: '#FFFFFF'},
  infoContainer: { padding: 15 },
  calories: { fontSize: 16, fontWeight: 'normal', color: '#FFFFFF', marginBottom: 10 },
  ingredientsLabel: { fontSize: 16, fontWeight: 'bold', color: '#FF6347', marginBottom: 5 },
  ingredients: { fontSize: 16, fontWeight: 'normal', color: '#FFFFFF', flexWrap: 'wrap', marginBottom: 10 },
  preparationLabel: { fontSize: 16, fontWeight: 'bold', color: '#FF6347', marginBottom: 5 },
  preparation: { fontSize: 16, fontWeight: 'normal', color: '#FFFFFF', flexWrap: 'wrap' },
});

export default GlutenFree;