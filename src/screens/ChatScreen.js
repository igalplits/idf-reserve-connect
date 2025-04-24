// import React, { useEffect, useState, useRef } from 'react';
// import { View, Text, TextInput, Button, FlatList, Image } from 'react-native';
// import io from 'socket.io-client';
// import { useRoute } from '@react-navigation/native';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const ChatScreen = () => {
//   const [message, setMessage] = useState('');
//   const [messages, setMessages] = useState([]);
//   const [userId, setUserId] = useState('');
//   const [user, setUser] = useState(null);
//   const socketRef = useRef(null);

//   const route = useRoute();
//   const { recipientId, recipientImage } = route.params;

//   const storageKey = `chat_${userId}_${recipientId}`;

//   // Load userId from AsyncStorage
//   useEffect(() => {
//     const getUserId = async () => {
//       const id = await AsyncStorage.getItem('user_id');
//       if (id) setUserId(id);
//     };
//     getUserId();
//   }, []);

//   // Fetch user profile
//   useEffect(() => {
//     if (!userId) return;
//     const fetchUser = async () => {
//       try {
//         const res = await fetch(`http://192.168.1.16:5000/api/auth/profile/${userId}`);
//         const data = await res.json();
//         setUser(data);
//       } catch (err) {
//         console.error('Error fetching user:', err);
//       }
//     };
//     fetchUser();
//   }, [userId]);

//   // Load messages from AsyncStorage
//   const loadMessagesFromStorage = async () => {
//     try {
//       const stored = await AsyncStorage.getItem(storageKey);
//       if (stored) {
//         setMessages(JSON.parse(stored));
//       }
//     } catch (err) {
//       console.error('Error loading messages:', err);
//     }
//   };

//   // Save messages to AsyncStorage
//   const saveMessagesToStorage = async (msgs) => {
//     try {
//       await AsyncStorage.setItem(storageKey, JSON.stringify(msgs));
//     } catch (err) {
//       console.error('Error saving messages:', err);
//     }
//   };

//   // Setup socket connection
//   useEffect(() => {
//     if (!userId) return;

//     socketRef.current = io('http://192.168.1.16:5000');
//     socketRef.current.emit('register', userId);

//     loadMessagesFromStorage();

//     // Fetch old messages from server (if any)
//     const fetchMessages = async () => {
//       try {
//         const res = await fetch('http://192.168.1.16:5000/api/messages/fetchAndDelete', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ userId, recipientId }),
//         });

//         const data = await res.json();
//         if (data.length > 0) {
//           const combined = [...messages, ...data];
//           setMessages(combined);
//           saveMessagesToStorage(combined);
//         }
//       } catch (err) {
//         console.error('Failed to fetch messages:', err);
//       }
//     };

//     fetchMessages();

//     // Listen for incoming messages
//     socketRef.current.on('receiveMessage', (data) => {
//       if (data.from === recipientId) {
//         const updated = [...messages, data];
//         setMessages(updated);
//         saveMessagesToStorage(updated);
//       }
//     });

//     return () => {
//       socketRef.current.off('receiveMessage');
//       socketRef.current.disconnect();
//     };
//   }, [userId]);

//   // Mark messages as read if opened
//   useEffect(() => {
//     if (!socketRef.current || !userId) return;

//     messages.forEach((msg) => {
//       if (msg.status === 'delivered' && msg.to === userId) {
//         socketRef.current.emit('markAsRead', { messageId: msg._id });
//       }
//     });
//   }, [messages, userId]);

//   // Handle send
//   const handleSendMessage = () => {
//     if (!socketRef.current) return;

//     const newMessage = {
//       from: userId,
//       to: recipientId,
//       message,
//       timestamp: new Date().toISOString(),
//       status: 'sent',
//     };

//     socketRef.current.emit('sendMessage', newMessage);

//     const updated = [...messages, newMessage];
//     setMessages(updated);
//     saveMessagesToStorage(updated);
//     setMessage('');
//   };

//   return (
//     <View style={{ flex: 1, padding: 20 }}>
//       <FlatList
//         data={messages}
//         keyExtractor={(item, index) => index.toString()}
//         renderItem={({ item }) => {
//           const isOwn = item.from === userId;
//           const profileImage = isOwn && user ? user.profileImage : recipientImage;

//           return (
//             <View
//               style={{
//                 flexDirection: isOwn ? 'row-reverse' : 'row',
//                 marginVertical: 5,
//                 alignItems: 'flex-start',
//               }}
//             >
//               <Image
//                 source={{ uri: profileImage }}
//                 style={{ width: 35, height: 35, borderRadius: 20, marginHorizontal: 5 }}
//               />
//               <View
//                 style={{
//                   backgroundColor: isOwn ? '#cfe9ff' : '#f1f1f1',
//                   padding: 10,
//                   borderRadius: 10,
//                   maxWidth: '75%',
//                 }}
//               >
//                 <Text>{item.message}</Text>
//                 <Text style={{ fontSize: 12, color: 'gray' }}>
//                   {new Date(item.timestamp).toLocaleTimeString()}
//                 </Text>
//                 <Text style={{ fontSize: 10, color: 'blue' }}>{item.status}</Text>
//               </View>
//             </View>
//           );
//         }}
//       />

//       <TextInput
//         value={message}
//         onChangeText={setMessage}
//         placeholder="Type a message"
//         style={{ borderBottomWidth: 1, marginBottom: 10, padding: 5 }}
//       />
//       <Button title="Send" onPress={handleSendMessage} />
//     </View>
//   );
// };

// export default ChatScreen;




// ChatScreen.js
import React, { useEffect, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';

const SERVER_URL = 'http://192.168.1.16:5000';   // ← your backend

function ChatScreen() {
  /* ───────── STATE ───────── */
  const [msgInput, setMsgInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [userId, setUserId]     = useState(null);
  const [user, setUser]         = useState(null);   // self avatar
  const socketRef               = useRef(null);
  const readRef                 = useRef(new Set());
  const messagesRef             = useRef(messages);

  const { recipientId, recipientImage } = useRoute().params;

  /* storageKey *after* userId exists */
  const storageKey = useMemo(
    () => (userId ? `chat_${userId}_${recipientId}` : null),
    [userId, recipientId]
  );

  /* ───────── HELPERS ───────── */
  const mergeMessages = (incoming) => {
    setMessages((prev) => {
      const merged = [...prev, ...incoming].filter(
        (m, i, arr) =>
          i ===
          arr.findIndex((x) =>
            m._id && x._id ? x._id === m._id : x.timestamp === m.timestamp
          )
      );
      messagesRef.current = merged;
      if (storageKey)
        AsyncStorage.setItem(storageKey, JSON.stringify(merged)).catch(() => {});
      return merged;
    });
  };

  /* ───────── FIRST LOAD: get userId & avatar ───────── */
  useEffect(() => {
    (async () => {
      const id = await AsyncStorage.getItem('user_id');
      setUserId(id);
      if (id) {
        fetch(`${SERVER_URL}/api/auth/profile/${id}`)
          .then((r) => r.json())
          .then(setUser)
          .catch(() => {});
      }
    })();
  }, []);

  /* ───────── LOAD LOCAL HISTORY (key depends on userId) ───────── */
  useEffect(() => {
    if (!storageKey) return;
    (async () => {
      const saved = await AsyncStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        messagesRef.current = parsed;
        setMessages(parsed);
      }
    })();
  }, [storageKey]);

  /* ───────── SOCKET & PULL QUEUED ───────── */
  useEffect(() => {
    if (!userId || !storageKey) return;

    socketRef.current = io(SERVER_URL);
    socketRef.current.emit('register', userId);

    /* realtime incoming */
    socketRef.current.on('receiveMessage', (msg) => mergeMessages([msg]));

    /* read receipts from peer */
    socketRef.current.on('messageRead', ({ messageId }) => {
      mergeMessages(
        messagesRef.current.map((m) =>
          m._id === messageId ? { ...m, status: 'read' } : m
        )
      );
    });

    /* queued messages */
    fetch(`${SERVER_URL}/api/messages/fetchAndDelete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, recipientId }),
    })
      .then((r) => r.json())
      .then((queued) => queued.length && mergeMessages(queued))
      .catch(() => {});

    return () => socketRef.current?.disconnect();
  }, [userId, storageKey]);

  /* ───────── READ RECEIPTS ───────── */
  useEffect(() => {
    if (!socketRef.current || !userId) return;

    messages.forEach((m) => {
      if (m.to === userId && m.status !== 'read' && !readRef.current.has(m._id)) {
        socketRef.current.emit('markAsRead', { messageId: m._id });
        readRef.current.add(m._id);
        mergeMessages(
          messagesRef.current.map((x) =>
            x._id === m._id ? { ...x, status: 'read' } : x
          )
        );
      }
    });
  }, [messages, userId]);

  /* ───────── SEND ───────── */
  const handleSend = () => {
    if (!msgInput.trim()) return;
    const newMsg = {
      from: userId,
      to: recipientId,
      message: msgInput.trim(),
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    socketRef.current.emit('sendMessage', newMsg);
    mergeMessages([newMsg]);
    setMsgInput('');
  };

  /* ───────── RENDER ───────── */
  const renderItem = ({ item }) => {
    const own = item.from === userId;
    const avatar = own ? user?.profileImage : recipientImage;
    const statusTxt = own ? (item.status === 'read' ? 'read' : 'sent') : '';

    return (
      <View style={[styles.row, own && styles.rowRev]}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={[styles.bubble, own ? styles.bubbleOwn : styles.bubbleOther]}>
          <Text>{item.message}</Text>
          <View style={styles.meta}>
            <Text style={styles.time}>{new Date(item.timestamp).toLocaleTimeString()}</Text>
            {!!statusTxt && <Text style={styles.status}>{statusTxt}</Text>}
          </View>
        </View>
      </View>
    );
  };

  /* ───────── UI ───────── */
  return (
    <View style={styles.container}>
      <FlatList
        data={[...messages].reverse()}
        keyExtractor={(i) => i._id?.toString() ?? i.timestamp}
        renderItem={renderItem}
        inverted
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={msgInput}
          onChangeText={setMsgInput}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
          <Text style={{ color: '#fff' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ───────── STYLES ───────── */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: '#fff' },
  row:       { flexDirection: 'row', marginVertical: 4 },
  rowRev:    { flexDirection: 'row-reverse' },
  avatar:    { width: 35, height: 35, borderRadius: 18, marginHorizontal: 5 },
  bubble:    { padding: 10, borderRadius: 10, maxWidth: '75%' },
  bubbleOwn:   { backgroundColor: '#cfe9ff' },
  bubbleOther: { backgroundColor: '#f1f1f1' },
  meta:      { flexDirection: 'row', justifyContent: 'space-between' },
  time:      { fontSize: 10, color: 'grey' },
  status:    { fontSize: 10, color: 'blue', marginLeft: 6 },
  inputRow:  { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  input:     { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 20,
               paddingHorizontal: 12, paddingVertical: 6 },
  sendBtn:   { backgroundColor: '#007aff', borderRadius: 20,
               paddingVertical: 8, paddingHorizontal: 16, marginLeft: 6 },
});
export default ChatScreen;