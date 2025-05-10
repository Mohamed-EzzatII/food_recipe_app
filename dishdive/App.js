import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import GlutenFreeScreen from './screens/GlutenFreeScreen';
import CaloriePlannerScreen from './screens/CaloriePlannerScreen';
import RecipeDetailsScreen from './screens/RecipeDetailsScreen';
import SearchScreen from './screens/SearchScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GlutenFreeScreen" component={GlutenFreeScreen} />
        <Stack.Screen name="CaloriePlannerScreen" component={CaloriePlannerScreen} />
        <Stack.Screen name="RecipeDetailsScreen" component={RecipeDetailsScreen} />
        <Stack.Screen name="SearchScreen" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
