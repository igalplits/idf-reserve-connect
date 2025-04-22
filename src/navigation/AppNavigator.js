import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import ChatScreen from '../screens/ChatScreen';
import AddPostScreen from '../screens/AddPostScreen';
import PostDetailsScreen from '../screens/PostDetailsScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import TabNavigator from './TabNavigator'; 

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
        />
        <Stack.Screen 
          name="AddPost" 
          component={AddPostScreen}
        />
        <Stack.Screen 
          name="Chat" 
          component={ChatScreen}
          options={({ route }) => ({ 
            title: route.params?.userName || 'Chat',
            headerShown: true 
          })}
        />
        <Stack.Screen name="PostDetails" component={PostDetailsScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 