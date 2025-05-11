import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Dimensions, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { db } from '../firebase';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
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

// Request notification permissions
const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      console.log('Notification permission status:', finalStatus);
      handlePermissionResult(finalStatus);
      return finalStatus === 'granted';
    } else if (Platform.OS === 'web') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Web notification permission:', permission);
        return permission === 'granted';
      } else {
        console.log('Notification API not supported in this browser.');
        return false;
      }
    }
    return false;
  } catch (error) {
    console.error('Permission Request Error:', error);
    return false;
  }
};

const handlePermissionResult = (status) => {
  switch (status) {
    case 'granted':
      console.log('Notification permissions granted.');
      break;
    case 'denied':
      Alert.alert('Permission denied', 'Please enable notifications in your device settings.');
      break;
    case 'undetermined':
      Alert.alert('Permission not determined', 'Please grant notification permissions.');
      break;
    default:
      Alert.alert('Permission error', 'Notifications may not be supported on this device.');
      break;
  }
};

// Configure notification listeners
const configureNotifications = () => {
  if (Platform.OS === 'web') {
    console.log('Notifications on web are limited; using browser notifications.');
    return () => {};
  }

  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const { dishId } = response.notification.request.content.data || {};
    console.log('Notification tapped, dishId:', dishId);
    if (dishId) {
      navigateFromNotification('GlutenFree', { highlightDishId: dishId });
    }
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
};

// Show notification (with web fallback)
const showFavoriteNotification = async (name, id) => {
  if (Platform.OS === 'web') {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Dish Favorited', {
        body: `${name} added to favorites!`,
        data: { dishId: id },
      });
      console.log('Web notification triggered:', name);
    } else {
      console.log('Web notifications not supported or permission denied.');
      Alert.alert('Favorited', `${name} added to favorites!`);
    }
  } else {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (status === 'granted') {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Dish Favorited',
          body: `${name} added to favorites!`,
          data: { dishId: id },
          sound: true,
        },
        trigger: null,
      }).then(() => console.log('Notification scheduled for', name))
        .catch(error => console.error('Notification scheduling error:', error));
    } else {
      console.log('Notification permission not granted on mobile.');
      Alert.alert('Favorited', `${name} added to favorites!`);
    }
  }
};

const fetchRecipes = async (category) => {
  try {
    const q = query(collection(db, 'recipes'), where('category', '==', category));
    const querySnapshot = await getDocs(q);
    console.log('Query Snapshot:', querySnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() })));
    const imageMap = {
      '1': require('../assets/grilled_chicken_salad.png'),
      '2': require('../assets/Quinoa_Bowl.png'),
      '3': require('../assets/Rice_Noodle_Stir-Fry.jpeg'),
    };
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Processing doc:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        image: imageMap[doc.id] || null,
      };
    });
  } catch (error) {
    console.error('Fetch Recipes Error:', error);
    throw error;
  }
};

const GlutenFree = ({ route }) => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [state, setState] = useState({
    screenWidth: Dimensions.get('window').width,
    selectedDishId: null,
    dishes: [],
    loading: true,
  });
  const flatListRef = useRef(null);

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        configureNotifications();
      }
    };
    setupNotifications();

    const loadRecipes = async () => {
      try {
        const recipes = await fetchRecipes('Gluten Free');
        console.log('Fetched Recipes:', recipes);
        if (recipes.length === 0) {
          console.log('No recipes found for category "Gluten Free"');
        }
        setState(prev => ({
          ...prev,
          dishes: recipes,
          loading: false,
        }));
      } catch (error) {
        console.error('Error loading recipes:', error);
        Alert.alert('Error', 'Failed to load recipes. Check console for details.');
        setState(prev => ({ ...prev, loading: false }));
      }
    };
    loadRecipes();
  }, []);

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

  useEffect(() => {
    if (route?.params?.highlightDishId && state.dishes.length > 0) {
      const index = state.dishes.findIndex((dish) => dish.id === route.params.highlightDishId);
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [route?.params?.highlightDishId, state.dishes]);

  const toggleFavorite = async (dishId, dishName) => {
    try {
      setState(prev => ({
        ...prev,
        dishes: prev.dishes.map(dish =>
          dish.id === dishId ? { ...dish, isFavorite: !dish.isFavorite } : dish
        ),
      }));

      const recipeRef = doc(db, 'recipes', dishId);
      const isFavorited = !state.dishes.find(dish => dish.id === dishId).isFavorite;
      await updateDoc(recipeRef, { isFavorite: isFavorited });

      if (isFavorited) {
        await showFavoriteNotification(dishName, dishId);
      }
    } catch (error) {
      console.error('Error updating favorites:', error);
      setState(prev => ({
        ...prev,
        dishes: prev.dishes.map(dish =>
          dish.id === dishId ? { ...dish, isFavorite: !dish.isFavorite } : dish
        ),
      }));
      Alert.alert('Error', 'Failed to update favorites. Please try again.');
    }
  };

  const toggleDishDetails = (dishId) => {
    setState(prev => ({
      ...prev,
      selectedDishId: prev.selectedDishId === dishId ? null : dishId,
    }));
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

  if (state.loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gluten-Free Dishes</Text>
      <FlatList
        ref={flatListRef}
        data={state.dishes}
        renderItem={renderDish}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No recipes found. Please check your Firestore data or category.</Text>
        }
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
            source={item.image}
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
          {!isExpanded && <Text style={styles.descriptionText}>{item.description || 'No description'}</Text>}
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
          <Text style={styles.preparation}>{item.preparation || 'No preparation info'}</Text>
        </Animated.View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 20,
    fontSize: 16,
  },
  emptyText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 50,
    fontSize: 18,
  },
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
  descriptionText: { fontSize: 14, color: '#FFFFFF' },
  infoContainer: { padding: 15 },
  calories: { fontSize: 16, fontWeight: 'normal', color: '#FFFFFF', marginBottom: 10 },
  ingredientsLabel: { fontSize: 16, fontWeight: 'bold', color: '#FF6347', marginBottom: 5 },
  ingredients: { fontSize: 16, fontWeight: 'normal', color: '#FFFFFF', flexWrap: 'wrap', marginBottom: 10 },
  preparationLabel: { fontSize: 16, fontWeight: 'bold', color: '#FF6347', marginBottom: 5 },
  preparation: { fontSize: 16, fontWeight: 'normal', color: '#FFFFFF', flexWrap: 'wrap' },
});

export default GlutenFree;