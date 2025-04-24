
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  TouchableWithoutFeedback
} from 'react-native';
import {
  Text,
  Button,
  Card,
  ActivityIndicator,
  Divider
} from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons';

const PostDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { postId } = route.params;

  const [post, setPost] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);
  const [userId, setUserId] = useState('');
  const [commentImage, setCommentImage] = useState(null);

  useEffect(() => {
    const getCurrentUserInfo = async () => {
      const storedUserId = await AsyncStorage.getItem('user_id');
      if (storedUserId) setUserId(storedUserId);
      setUserLoaded(true);
    };
    getCurrentUserInfo();
  }, []);

  const fetchPostDetails = async () => {
    try {
      const res = await fetch(`http://192.168.1.16:5000/api/posts/${postId}/details`);
      const data = await res.json();
      setPost(data.post);
      setComments(data.comments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, []);

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`http://192.168.1.16:5000/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          userId,
          text: newComment,
          image: commentImage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setComments((prev) => [
          ...prev,
          {
            _id: data.comment?._id || Date.now().toString(),
            userName: 'You',
            userImage: null,
            text: newComment,
            image: commentImage,
          },
        ]);
        setNewComment('');
        setCommentImage(null);
        fetchPostDetails();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      setCommentImage(`data:image/jpeg;base64,${base64}`);
    }
  };

  if (loading || !post || !userLoaded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90} // adjust if your header overlaps
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <ScrollView style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 150 }}
              keyboardShouldPersistTaps="handled">
            <Card style={styles.postCard}>
              <Card.Title
                title={post.authorName}
                subtitle={`${post.rank} | ${post.unit} | ${post.proficiency}`}
                left={() =>
                  post.authorImage && (
                    <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: post.user_id })}>
                      <Image source={{ uri: post.authorImage }} style={styles.avatar} />
                    </TouchableOpacity>
                  )
                }
              />
              <Card.Content>
                <Text style={styles.postText}>{post.text}</Text>
              </Card.Content>
            </Card>

            <Text style={styles.commentsHeader}>Comments</Text>

            {comments.map((item) => (
              <View key={item._id} style={styles.commentItem}>
                {item.userImage && (
                  <TouchableOpacity onPress={() => navigation.navigate('UserProfile', { userId: item.userId })}>
                    <Image source={{ uri: item.userImage }} style={styles.commentAvatar} />
                  </TouchableOpacity>
                )}
                <View style={styles.commentContent}>
                  <Text style={styles.commentAuthor}>{item.userName}</Text>
                  <Text style={styles.commentText}>{item.text}</Text>
                  {item.image && (
                    <Image source={{ uri: item.image }} style={styles.commentImage} />
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.commentInputWrapper}>
            <View style={styles.commentRow}>
              <TextInput
                style={styles.input}
                placeholder="Write a comment..."
                value={newComment}
                onChangeText={setNewComment}
                multiline
              />
              <TouchableOpacity onPress={pickImage} style={styles.attachButton}>
                <Feather name="image" size={24} color="#555" />
              </TouchableOpacity>
              <Button
                mode="contained"
                onPress={handlePostComment}
                disabled={!newComment.trim()}
                style={styles.sendButton}
              >
                Send
              </Button>
            </View>

            {commentImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: commentImage }} style={styles.imagePreview} />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setCommentImage(null)}
                >
                  <Text style={{ color: 'white', fontSize: 12 }}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  postCard: {
    margin: 12,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    elevation: 3,
    padding: 10,
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  postText: { fontSize: 17, marginTop: 10, lineHeight: 24 },
  commentsHeader: {
    marginTop: 10,
    marginLeft: 15,
    fontWeight: 'bold',
    fontSize: 20,
    color: '#333',
  },
  commentItem: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    marginTop: 5,
  },
  commentContent: { flex: 1 },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
  },
  commentText: { fontSize: 14, color: '#444', marginBottom: 5 },
  commentImage: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginTop: 5,
  },
  commentInputWrapper: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  input: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  attachButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sendButton: {
    alignSelf: 'flex-end',
    height: 40,
    justifyContent: 'center',
  },
  imagePreviewContainer: {
    marginTop: 8,
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  removeImageButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
});

export default PostDetailsScreen;







