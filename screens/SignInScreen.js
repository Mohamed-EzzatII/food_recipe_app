import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Video } from 'expo-av';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import CustomInput from '../components/CustomInput';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);

  const validateAndLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    const isEmailValid = emailRegex.test(email);
    const isPasswordValid = passwordRegex.test(password);

    setValidEmail(isEmailValid);
    setValidPassword(isPasswordValid);

    if (!isEmailValid) {
      Alert.alert('Invalid Email', 'Use a valid email like example@domain.com.');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters with numbers, letters, and a special character.'
      );
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
        <Video
          source={{ uri: 'https://cdn.pixabay.com/video/2022/07/20/124831-732633121_large.mp4' }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
          shouldPlay
          isLooping
          isMuted
        />
      )}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.header}>Welcome Back 👋</Text>

          <CustomInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setValidEmail(true);
            }}
            placeholder="Email"
            isValid={validEmail}
          />
          <CustomInput
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setValidPassword(true);
            }}
            placeholder="Password"
            secureTextEntry
            isValid={validPassword}
          />

          <TouchableOpacity style={styles.button} onPress={validateAndLogin}>
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.link} onPress={() => navigation.navigate('SignUpScreen')}>
            Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  header: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#FF6347',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: '#ccc',
    textAlign: 'center',
    marginTop: 20,
  },
  linkBold: {
    color: '#ff6666',
    fontWeight: 'bold',
  },
});
