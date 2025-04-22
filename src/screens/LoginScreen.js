import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.16:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Login Success', `Welcome ${data.user.fullName}`);
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('curr_user', JSON.stringify(data.user));
        await AsyncStorage.setItem('user_id', data.user._id);

        navigation.replace('Main');
      } else {
        Alert.alert('Login Failed', data.message || 'Something went wrong');
      }
    } catch (error) {
      console.log('Login error:', error.message);
      Alert.alert('Login Error', 'Unable to login. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          style={styles.logo}
        />
        <Text style={styles.title}>Military Connect</Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
        >
          Login
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('SignUp')}
          style={styles.signUpButton}
        >
          Don't have an account? Sign up
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    padding: 4,
  },
  signUpButton: {
    marginTop: 16,
  },
});

export default LoginScreen;
