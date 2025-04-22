import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';


const getBase64Image = async (uri) => {
  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return `data:image/jpeg;base64,${base64}`;
};

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [image, setImage] = useState(null);

  // Request permissions for camera and media library
  useEffect(() => {
    (async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const updateFormData = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });
  
    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = result.assets[0].base64;
      setImage(base64Image); 
    }
  };

  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const base64Image = await getBase64Image(result.assets[0].uri);
      setImage(base64Image);
    }
  };

  const handleSignUp = async () => {
    const { email, password, confirmPassword, fullName, proficiency, unit, rank, age, militaryId } = formData;
  
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
  
    if (!email) {
      alert("Email is required.");
      return;
    }
  
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('http://192.168.1.16:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          fullName,
          proficiency,
          unit,
          rank,
          age,
          militaryId,
          profileImage: image || '',  // Use the image from state
        }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        alert('Account created successfully!');
        navigation.replace('Main');
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <ScrollView style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
            source={{ uri: image || 'https://via.placeholder.com/150' }}
            style={styles.photo}
          />
          <Button mode="outlined" onPress={pickImage} style={styles.photoButton}>
            Choose from Gallery
          </Button>
          <Button mode="outlined" onPress={takePhoto} style={styles.photoButton}>
            Take Photo
          </Button>
        </View>

        <Button
          mode="contained"
          onPress={handleSignUp}
          style={styles.button}
          disabled={loading}
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
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
    marginTop: 50,
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
    marginTop: 8,
  },
  button: {
    marginTop: 8,
    padding: 4,
  },
  loginButton: {
    marginTop: 16,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default SignUpScreen;
