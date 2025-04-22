import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Image, TextInput } from 'react-native';
import { Card, Text, Button, Searchbar } from 'react-native-paper';
import { FAB } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { TouchableOpacity } from 'react-native-gesture-handler';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation();


  const fetchPosts = async () => {
    try {
      setLoading(true);
  
      const postsResponse = await fetch('http://192.168.1.16:5000/api/posts');
      const postsData = await postsResponse.json();
  
      const userImageCache = {}; // to avoid duplicate fetches
  
      const postsWithProfile = await Promise.all(
        postsData.map(async (post) => {
          let profileImage = null;
  
          if (userImageCache[post.user_id]) {
            profileImage = userImageCache[post.user_id]; // re-use if already fetched
          } else {
            try {
              const userResponse = await fetch(
                `http://192.168.1.16:5000/api/auth/id/${post.user_id}`
              );
              const userData = await userResponse.json();
              profileImage = userData.profileImage;
              userImageCache[post.user_id] = profileImage;
            } catch (err) {
              console.warn(`Failed to fetch user for ID: ${post.user_id}`);
            }
          }
  
          return {
            ...post,
            profileImage,
          };
        })
      );
  
      setPosts(postsWithProfile);
      setFilteredPosts(postsWithProfile);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredPosts(posts);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = posts.filter(
        (post) =>
          post.text.toLowerCase().includes(query) ||
          post.email.toLowerCase().includes(query) ||
          post.unit?.toLowerCase().includes(query) ||
          post.proficiency?.toLowerCase().includes(query)
      );
      setFilteredPosts(filtered);
    }
  }, [searchQuery, posts]);

  const renderPost = ({ item }) => (

    <TouchableOpacity onPress={() => navigation.navigate('PostDetails', { postId: item._id })}>
    <Card style={styles.card}>
      <Card.Title
        title={item.email}
        subtitle={`${item.unit} | ${item.proficiency}`}
        left={() => (
          <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.user_id })}>
          <Image
            source={{ uri: `${item.profileImage}` }}
            style={styles.avatar}
          />
         </TouchableOpacity>
        )}
      />
      <Card.Content style={styles.cardContent}>
        <Text style={styles.postText}>{item.text}</Text>
      </Card.Content>
    </Card>
  </TouchableOpacity>


    // <Card style={styles.card}>
    //   <Card.Title
    //     title={item.email}
    //     subtitle={`${item.unit} | ${item.proficiency}`}
    //     left={() => (
    //         <Image
    //             source={{
    //               uri:`${item.profileImage}`,
    //             }}
    //             style={styles.avatar}
    //           />
    //     )}
    //   />
    //   <Card.Content style={styles.cardContent}>
    //     <Text style={styles.postText}>{item.text}</Text>
    //   </Card.Content>

    //   <View style={styles.commentSection}>
    //     <TextInput
    //       style={styles.commentInput}
    //       placeholder="Write a comment..."
    //       value={commentText[item._id] || ''}
    //       onChangeText={(text) =>
    //         setCommentText((prev) => ({ ...prev, [item._id]: text }))
    //       }
    //     />
    //     <Button
    //       mode="text"
    //       compact
    //       onPress={() => console.log('Send comment:', commentText[item._id])}
    //     >
    //       Post
    //     </Button>
    //   </View>
    // </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <Searchbar
        placeholder="Search posts..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
      />
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item._id}
        renderItem={renderPost}
        contentContainerStyle={styles.container}
        refreshing={loading}
        onRefresh={fetchPosts}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    paddingBottom: 100,
  },
  searchbar: {
    marginHorizontal: 8,
    marginTop: 10,
    marginBottom: 8,
    borderRadius: 12,
  },
  card: {
    marginBottom: 10,
    borderRadius: 12,
  },
  cardContent: {
    paddingBottom: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  postText: {
    fontSize: 14,
    color: '#333',
  },
  commentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    marginTop: 6,
  },
  commentInput: {
    flex: 1,
    borderBottomWidth: 1,
    paddingVertical: 4,
    marginRight: 10,
  },

  fab: {
    position: 'absolute',
    right: 16,
    bottom: 30,
    backgroundColor: '#6200ee',
  },
});

export default HomeScreen;
