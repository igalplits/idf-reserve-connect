import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { Searchbar, Text, Card, Avatar } from 'react-native-paper';
import { mockPosts, mockUsers } from '../data/mockData';

const HomeScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState(mockPosts);

  useEffect(() => {
    if (searchQuery) {
      const filtered = mockPosts.filter(post => {
        const user = mockUsers.find(u => u.id === post.userId);
        return (
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.text.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilteredPosts(filtered);
    } else {
      setFilteredPosts(mockPosts);
    }
  }, [searchQuery]);

  const renderPost = ({ item }) => {
    const user = mockUsers.find(u => u.id === item.userId);
    
    return (
      <Card style={styles.postCard}>
        <Card.Content>
          <View style={styles.postHeader}>
            <TouchableOpacity
              onPress={() => navigation.navigate('Chat', { 
                userId: user.id,
                userName: user.name
              })}
            >
              <Avatar.Image
                size={40}
                source={{ uri: user.photo }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userDetails}>{user.unit} • {user.rank}</Text>
            </View>
          </View>
          
          <Text style={styles.postText}>{item.text}</Text>
          
          {item.comments.length > 0 && (
            <View style={styles.commentsSection}>
              <Text style={styles.commentsTitle}>Comments:</Text>
              {item.comments.map(comment => {
                const commentUser = mockUsers.find(u => u.id === comment.userId);
                return (
                  <View key={comment.id} style={styles.comment}>
                    <Text style={styles.commentUser}>{commentUser.name}:</Text>
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                );
              })}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search by unit, proficiency, or name"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      <FlatList
        data={filteredPosts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.feed}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    
  },
  searchBar: {
    margin: 16,
    elevation: 4,
    marginTop: 60,
    
  },
  feed: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
  },
  postText: {
    fontSize: 16,
    marginBottom: 12,
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  comment: {
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  commentText: {
    fontSize: 14,
  },
});

export default HomeScreen; 