import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';

const SignUpScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    proficiency: '',
    unit: '',
    rank: '',
    age: '',
    militaryId: '',
  });

  const handleSignUp = () => {
    // For now, just navigate back to Login screen
    navigation.navigate('Login');
  };

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>

        <TextInput
          label="Email"
          value={formData.email}
          onChangeText={(value) => updateFormData('email', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          label="Password"
          value={formData.password}
          onChangeText={(value) => updateFormData('password', value)}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          label="Confirm Password"
          value={formData.confirmPassword}
          onChangeText={(value) => updateFormData('confirmPassword', value)}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <TextInput
          label="Full Name"
          value={formData.fullName}
          onChangeText={(value) => updateFormData('fullName', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Proficiency"
          value={formData.proficiency}
          onChangeText={(value) => updateFormData('proficiency', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Unit"
          value={formData.unit}
          onChangeText={(value) => updateFormData('unit', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Rank"
          value={formData.rank}
          onChangeText={(value) => updateFormData('rank', value)}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Age"
          value={formData.age}
          onChangeText={(value) => updateFormData('age', value)}
          mode="outlined"
          style={styles.input}
          keyboardType="numeric"
        />

        <TextInput
          label="Military ID Number"
          value={formData.militaryId}
          onChangeText={(value) => updateFormData('militaryId', value)}
          mode="outlined"
          style={styles.input}
          secureTextEntry
        />

        <View style={styles.photoContainer}>
          <Image
            source={{ uri: 'https://via.placeholder.com/150' }}
            style={styles.photo}
          />
          <Button
            mode="outlined"
            onPress={() => {}}
            style={styles.photoButton}
          >
            Upload Photo
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={handleSignUp}
          style={styles.button}
        >
          Sign Up
        </Button>

        <Button
          mode="text"
          onPress={() => navigation.navigate('Login')}
          style={styles.loginButton}
        >
          Already have an account? Login
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  photoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  photo: {
    width: 150,
    height: 150,
    marginBottom: 10,
    borderRadius: 75,
  },
  photoButton: {
    marginTop: 10,
  },
  button: {
    marginTop: 8,
    padding: 4,
  },
  loginButton: {
    marginTop: 16,
  },
});

export default SignUpScreen; 