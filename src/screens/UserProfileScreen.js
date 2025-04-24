import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, ScrollView } from 'react-native';
import { Text, Button, ActivityIndicator, Divider } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';

const UserProfileScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://192.168.1.16:5000/api/auth/profile/${userId}`);
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Error fetching user:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <ActivityIndicator style={{ marginTop: 40 }} />;
  }

  if (!user) {
    return <Text style={styles.errorText}>User not found</Text>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: user.profileImage }} style={styles.avatar} />
      <Text variant="titleLarge" style={styles.name}>{user.fullName}</Text>

      <Divider style={styles.divider} />
      <Text style={styles.label}>Rank:</Text>
      <Text style={styles.info}>{user.rank}</Text>

      <Text style={styles.label}>Unit:</Text>
      <Text style={styles.info}>{user.unit}</Text>

      <Text style={styles.label}>Proficiency:</Text>
      <Text style={styles.info}>{user.proficiency}</Text>

      <Text style={styles.label}>Email:</Text>
      <Text style={styles.info}>{user.email}</Text>

      <Text style={styles.label}>Age:</Text>
      <Text style={styles.info}>{user.age}</Text>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate('ChatScreen', {recipientId: userId,recipientImage: user.profileImage, })}
      >
        Start Chat
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingBottom : 100,
    paddingTop:60,
  },
  avatar: {
    width: 170,
    height: 170,
    borderRadius: 70,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 22,
    marginTop:10,
    marginBottom: 10,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  info: {
    fontSize: 18,
    color: '#000',
    marginBottom: 6,
  },
  button: {
    marginTop: 30,
    width: '80%',
    borderRadius: 8,
  },
  divider: {
    width: '100%',
    marginVertical: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 40,
    color: 'red',
  },
});

export default UserProfileScreen;
