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
import CustomInput from '../components/CustomInput';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [validEmail, setValidEmail] = useState(true);
  const [validPassword, setValidPassword] = useState(true);
  const [validConfirm, setValidConfirm] = useState(true);

  const validate = () => {
    console.log('Validation triggered');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);

    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    const isPasswordValid = passwordRegex.test(password);

    const isConfirmValid = password === confirm;

    setValidEmail(isEmailValid);
    setValidPassword(isPasswordValid);
    setValidConfirm(isConfirmValid);

    console.log('Email valid:', isEmailValid);
    console.log('Password valid:', isPasswordValid);
    console.log('Confirm valid:', isConfirmValid);

    if (!isEmailValid) {
      Alert.alert('Invalid Email', 'Email should be in a valid format like a@example.com.');
      return;
    }

    if (!isPasswordValid) {
      Alert.alert(
        'Weak Password',
        'Password must be at least 8 characters and include numbers, letters, and special characters.'
      );
      return;
    }

    if (!isConfirmValid) {
      Alert.alert('Password Mismatch', 'Confirm password must match the password.');
      return;
    }

    // All validations passed, navigate to Home screen
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      {Platform.OS !== 'web' && (
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
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.header}>Sign Up</Text>

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
          <CustomInput
            value={confirm}
            onChangeText={(text) => {
              setConfirm(text);
              setValidConfirm(true);
            }}
            placeholder="Confirm Password"
            secureTextEntry
            isValid={validConfirm}
          />

          <TouchableOpacity style={styles.button} onPress={validate}>
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <Text style={styles.link} onPress={() => navigation.navigate('SignInScreen')}>
            Already have an account? <Text style={styles.linkBold}>Sign In</Text>
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
    backgroundColor: '#00cc99',
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
    color: '#00ccff',
    fontWeight: 'bold',
  },
});
