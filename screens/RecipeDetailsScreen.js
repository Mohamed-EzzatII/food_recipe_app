import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
  Dimensions,
  Alert,
  ActivityIndicator
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase'; // Make sure this is properly configured

// Navigation helper
const navigationRef = React.createRef();

const setNavigationRef = (ref) => {
  navigationRef.current = ref;
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

// Configure notifications
const configureNotifications = async () => {
  if (Platform.OS === 'web') return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  const foregroundSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received in foreground:', notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    const { dishId } = response.notification.request.content.data || {};
    console.log('Notification tapped, dishId:', dishId);
    if (dishId) {
      navigateFromNotification('RecipeDetails', { highlightDishId: dishId });
    }
  });

  return () => {
    foregroundSubscription.remove();
    responseSubscription.remove();
  };
};

export default function RecipeDetailsScreen({ navigation, route }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const flatListRef = useRef(null);

  // Fetch recipes from Firebase
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const querySnapshot = await getDocs(collection(db, 'chiefChoice'));
        const recipesData = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          recipesData.push({
            id: doc.id,
            name: data.name,
            calories: data.calories,
            isFavorite: data.isFavorite || false,
            image: getLocalImage(data.name), // Get local image based on name
            description: data.description,
            ingredients: data.ingredients,
            preparation: data.preparation
          });
        });
        
        setRecipes(recipesData);
      } catch (error) {
        console.error('Error fetching recipes:', error);
        Alert.alert('Error', 'Failed to load recipes');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  // Helper function to get local images
  const getLocalImage = (recipeName) => {
    const imageMap = {
      'Spicy Chicken Shawarma': require('../assets/shawarma.png'),
      'Beef Kofta with Rice': require('../assets/kofta.png'),
      'Grilled Lamb Chops': require('../assets/lamb_chops.png'),
      'Creamy Chicken Mushroom Pasta': require('../assets/chicken_pasta.png'),
      'Spicy Shakshuka': require('../assets/shakshuka.png'),
      'Stuffed Bell Peppers': require('../assets/stuffed_peppers.png')
    };
    return imageMap[recipeName];
  };

  useEffect(() => {
    setNavigationRef(navigation);
    const setupNotifications = async () => {
      const hasPermission = await requestNotificationPermission();
      if (hasPermission) {
        await configureNotifications();
      }
    };
    setupNotifications();
  }, []);

  useEffect(() => {
    const updateDimensions = () => {
      setScreenWidth(Dimensions.get('window').width);
    };
    const subscription = Dimensions.addEventListener('change', updateDimensions);
    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    if (route?.params?.highlightDishId && recipes.length > 0) {
      const index = recipes.findIndex((dish) => dish.id === route.params.highlightDishId);
      if (index !== -1 && flatListRef.current) {
        flatListRef.current.scrollToIndex({ index, animated: true });
      }
    }
  }, [route?.params?.highlightDishId, recipes]);

  const toggleFavorite = async (id, name) => {
    try {
      // Update local state first for immediate UI feedback
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      ));

      // Update in Firebase
      const recipeRef = doc(db, 'chiefChoice', id);
      await updateDoc(recipeRef, {
        isFavorite: !recipes.find(r => r.id === id).isFavorite
      });

      // Show notification if favorited
      if (!recipes.find(r => r.id === id).isFavorite) {
        await showFavoriteNotification(name, id);
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      // Revert local state if Firebase update fails
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
      ));
      Alert.alert('Error', 'Failed to update favorite status');
    }
  };

  const showFavoriteNotification = async (name, id) => {
    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Dish Favorited', {
          body: `${name} added to favorites!`,
          data: { dishId: id },
        });
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
        });
      }
    }
  };

  const renderDish = ({ item }) => (
    <View style={[styles.card, styles.cardShadow, { width: Math.min(screenWidth * 0.95, 600) }]}>
      <View style={[styles.imageContainer, { height: screenWidth * 0.6 }]}>
        <Image source={item.image} style={styles.image} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={[styles.name, { fontSize: Math.min(screenWidth * 0.045, 18) }]}>{item.name}</Text>
        <TouchableOpacity onPress={() => toggleFavorite(item.id, item.name)}>
          <Icon
            name={item.isFavorite ? 'heart' : 'heart-outline'}
            size={Math.min(screenWidth * 0.06, 24)}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>Calories</Text>
        <Text style={[styles.sectionText, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>{item.calories} kcal</Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>Description</Text>
        <Text style={[styles.sectionText, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>{item.description}</Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>Ingredients</Text>
        <Text style={[styles.sectionText, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>{item.ingredients}</Text>
      </View>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>Preparation</Text>
        <Text style={[styles.sectionText, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>{item.preparation}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.screen, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6347" />
        <Text style={styles.loadingText}>Loading recipes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.headerButton, { fontSize: Math.min(screenWidth * 0.04, 16) }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontSize: Math.min(screenWidth * 0.05, 20) }]}>All Recipes</Text>
        <View style={{ width: screenWidth * 0.1 }} />
      </View>
      <FlatList
        ref={flatListRef}
        data={recipes}
        renderItem={renderDish}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No recipes found. Please try again later.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? 35 : 0,
  },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FF6347',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerButton: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: '#000000',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
    marginBottom: 15,
    alignSelf: 'center',
  },
  cardShadow: {
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  imageContainer: {
    width: '100%',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleContainer: {
    backgroundColor: '#FF6347',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 5,
  },
  sectionText: {
    color: '#FFFFFF',
    lineHeight: 22,
  },
});