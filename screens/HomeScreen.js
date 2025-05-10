import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Image,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
} from 'react-native';
import { Video } from 'expo-av';

export default function HomeScreen({ navigation }) {
  const openURL = (url) => {
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Unable to open link')
    );
  };

  return (
    <View style={styles.container}>
      {/* Background Video */}
      {Platform.OS !== 'web' ? (
        <Video
          source={{
            uri: 'https://cdn.pixabay.com/video/2022/07/20/124831-732633121_large.mp4',
          }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          shouldPlay
          isLooping
          isMuted
        />
      ) : (
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            zIndex: -1,
          }}
          src="https://cdn.pixabay.com/video/2022/07/20/124831-732633121_large.mp4"
        />
      )}

      {/* Top Taskbar (Scrollable) */}
      <View style={styles.taskbarWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.taskbar}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate('GlutenFreeScreen')}
            onLongPress={() =>
              Alert.alert('Gluten-Free Picks', 'Curated gluten-free food suggestions')
            }
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>Gluten-Free</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CaloriePlannerScreen')}
            onLongPress={() =>
              Alert.alert('Calorie Match', 'Enter your calorie goal and get recipe matches')
            }
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>Calorie Match</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('RecipeDetailsScreen')}
            onLongPress={() =>
              Alert.alert('Chef’s Choice', 'General food suggestions and featured meals')
            }
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>Chef’s Choice</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('SearchScreen')}
            onLongPress={() =>
              Alert.alert(
                'Type & Taste',
                "Type the name of a dish like 'chicken with lemon' and we’ll serve you its recipe instantly."
              )
            }
            style={styles.tabButton}
          >
            <Text style={styles.tabText}>Type & Taste</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Centered Logo */}
      <View style={styles.overlay}>
        <Image
          source={require('../assets/page_logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Bottom Left Social Icons */}
      <View style={styles.socialBar}>
        <TouchableOpacity onPress={() => openURL('https://facebook.com')}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733547.png' }}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openURL('https://twitter.com')}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733579.png' }}
            style={styles.icon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openURL('https://instagram.com')}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/733/733558.png' }}
            style={styles.icon}
          />
        </TouchableOpacity>
      </View>

      {/* Sign In / Sign Up Buttons */}
      <View style={styles.authButtons}>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('SignInScreen')}
        >
          <Text style={styles.authButtonText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.authButton}
          onPress={() => navigation.navigate('SignUpScreen')}
        >
          <Text style={styles.authButtonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  taskbarWrapper: {
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingTop: 50,
    paddingBottom: 10,
  },

  taskbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#444', // Darker background for taskbar buttons
    borderRadius: 8,
    marginHorizontal: 5,
  },

  tabText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },

  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dark overlay for logo
  },

  logo: {
    width: 260,
    height: 260,
    marginBottom: 20,
  },

  socialBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
  },

  icon: {
    width: 28,
    height: 28,
    marginRight: 10,
  },

  authButtons: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'flex-end',
  },

  authButton: {
    backgroundColor: '#222', // Dark background for the buttons
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginVertical: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    width: 160,
  },

  authButtonText: {
    color: '#fff', // White text on dark background
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});
