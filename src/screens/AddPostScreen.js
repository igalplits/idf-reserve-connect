import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddPostScreen = ({ navigation }) => {
  const [newPostText, setNewPostText] = useState('');
  const [unit, setUnit] = useState('');
  const [proficiency, setProficiency] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(false);
  const [userLoaded, setUserLoaded] = useState(false); // ⬅️ this was missing


  // Get user email from AsyncStorage or your auth context

  useEffect(() => {
    const getCurrentUserInfo = async () => {
      try {
        const userJson = await AsyncStorage.getItem('curr_user');
        const storedUserId = await AsyncStorage.getItem('user_id');

        if (userJson && storedUserId) {
          const user = JSON.parse(userJson);
          setEmail(user.email);
          setUserId(storedUserId);
        }
      } catch (err) {
        console.error('Failed to get user info:', err);
      } finally {
        setUserLoaded(true);
      }
    };

    getCurrentUserInfo();
  }, []);
  
  
  

  const handleAddPost = async () => {
    if (!email || !newPostText.trim() || !userId) {
      setError("Email or post content is missing or user ID is missing.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://192.168.1.16:5000/api/posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          text: newPostText,
          unit,
          proficiency,
          user_id: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setNewPostText('');
        setUnit('');
        setProficiency('');
        alert('Post added successfully!');
        navigation.goBack();
      } else {
        throw new Error(data.message || 'Failed to add post');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create a New Post</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        label="What’s on your mind?"
        value={newPostText}
        onChangeText={setNewPostText}
        mode="outlined"
        multiline
        style={styles.input}
      />

      <TextInput
        label="Unit"
        value={unit}
        onChangeText={setUnit}
        mode="outlined"
        style={styles.input}
      />

      <TextInput
        label="Proficiency"
        value={proficiency}
        onChangeText={setProficiency}
        mode="outlined"
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleAddPost}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Add Post
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
    backgroundColor: '#fff',
    flexGrow: 1,
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
  button: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default AddPostScreen;
