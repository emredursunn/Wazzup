import { child, get, getDatabase, onValue, push, ref, remove, set, update } from "firebase/database";
import { getDownloadURL, getStorage, ref as storageRef, uploadBytes } from "firebase/storage";
import { app } from "../../firebaseConfig";
import { Chat, Message, Story, User } from "./types";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from "react-native";

export const db = getDatabase(app);
const storage = getStorage(app);

export function createUser({ userName, uid, phone }: { userName: string, uid: string, phone: number }) {

    const newUser: User = {
        userId: uid,
        name: userName,
        avatar: "data:image/jpeg;base64,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",
        phone: phone,
        status: "Hey I'm using WazzUp"
    }

    set(ref(db, 'users/' + uid), newUser);
}

export async function getAllUsers() {
    const dbRef = ref(db);
    try {
        const snapshot = await get(child(dbRef, 'users'));
        if (snapshot.exists()) {
            const users: User[] = Object.values(snapshot.val());
            return users;
        } else {
            console.log("No data available");
            return [];
        }
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
}

export async function getUser(userId: string): Promise<User | null> {
    const dbRef = ref(db)
    try {
        const snapshot = await get(child(dbRef, `users/` + userId))
        if (snapshot.exists()) {
            const user = snapshot.val();
            return user
        } else {
            console.log("No data available");
            return null
        }
    } catch (error) {
        console.log(error)
        throw error
    }
}

export async function getMyFriendsId(userId: string) {
    const dbRef = ref(db)
    try {
        const snapshot = await get(child(dbRef, `users/` + userId + '/friends/'))
        if (snapshot.exists()) {
            const friends: string[] = Object.values(snapshot.val());
            return friends
        } else {
            console.log("No data available");
            return null
        }
    } catch (error) {
        console.log(error)
        return null
    }
}

export const checkFriend = async (uid: string, userId: string) => {
    try {
        const friends = await getMyFriendsId(uid);
        return friends?.includes(userId) || false;
    } catch {
        return false;
    }
}


export async function updateUser(user: User) {
    try {
        const updates: { [key: string]: any } = {};

        // Prepare storage reference and upload URI
        const storagePath = `images/${user.userId}.jpg`;
        const refStorage = storageRef(storage, storagePath);
        const uploadAvatarUri = Platform.OS === "ios" ? user.avatar.replace("file://", "") : user.avatar;

        // Convert URI to Blob
        const blob = await fetch(uploadAvatarUri).then((response) => response.blob());

        // Upload blob to Firebase Storage
        await uploadBytes(refStorage, blob);

        // Get download URL after upload
        const downloadURL = await getDownloadURL(refStorage);

        // Prepare user data updates
        updates['users/' + user.userId] = {
            name: user.name,
            avatar: downloadURL,
            userId: user.userId,
            status: user.status,
            phone: user.phone,
            ...(user.chats !== undefined && { chats: user.chats }),
            ...(user.friends !== undefined && { friends: user.friends })
        };

        // Update user data in Firebase Realtime Database
        await update(ref(db), updates);

        console.log('User updated successfully');
    } catch (error) {
        console.error('Failed to update user:', error);
        throw error; // Propagate the error to the caller
    }
}

export async function createNewChat(fromUserId: string, toUserId: string) {
    const chatKey = push(child(ref(db), 'chat/')).key;
    if (chatKey) {
        const newChat: Chat = {
            chatId: chatKey,
            fromUserId,
            toUserId,
            lastMessage: "",
            messageList: []
        };

        set(ref(db, 'chat/' + chatKey), newChat).then(() => {
            push(child(ref(db), 'users/' + fromUserId + '/chats/'), chatKey).then(() => {
                push(child(ref(db), 'users/' + toUserId + '/chats/'), chatKey).then(() => {
                    push(child(ref(db), 'users/' + fromUserId + '/friends/'), toUserId).then(() => {
                        push(child(ref(db), 'users/' + toUserId + '/friends/'), fromUserId).then(() => {
                            console.log("chat created.")
                        })
                    })
                })
            })
        }).catch((error) => {
            console.error('Error creating chat:', error);
        });
    } else {
        console.error('Failed to generate chat key');
    }
}

export function deleteChat(fromUserId: string, toUserId: string, chatId: string) {

    const updates: { [key: string]: any } = {};

    // Delete the chat from the 'chat/' node
    updates['/chat/' + chatId] = null;

    // Remove chat ID from both users' 'chats/' lists
    get(ref(db, 'users/' + fromUserId + '/chats')).then((snapshot) => {
        if (snapshot.exists()) {
            const userChats = snapshot.val();
            for (let key in userChats) {
                if (userChats[key] === chatId) {
                    updates['/users/' + fromUserId + '/chats/' + key] = null;
                }
            }
        }
    }).catch((error) => {
        console.error('Error removing chat from user chats:', error);
    });

    get(ref(db, 'users/' + toUserId + '/chats')).then((snapshot) => {
        if (snapshot.exists()) {
            const userChats = snapshot.val();
            for (let key in userChats) {
                if (userChats[key] === chatId) {
                    updates['/users/' + toUserId + '/chats/' + key] = null;
                }
            }
        }
    }).catch((error) => {
        console.error('Error removing chat from user chats:', error);
    });

    // Remove each user from each other's 'friends/' lists
    get(ref(db, 'users/' + fromUserId + '/friends')).then((snapshot) => {
        if (snapshot.exists()) {
            const userFriends = snapshot.val();
            for (let key in userFriends) {
                if (userFriends[key] === toUserId) {
                    updates['/users/' + fromUserId + '/friends/' + key] = null;
                }
            }
        }
    }).catch((error) => {
        console.error('Error removing friend from user friends:', error);
    });

    get(ref(db, 'users/' + toUserId + '/friends')).then((snapshot) => {
        if (snapshot.exists()) {
            const userFriends = snapshot.val();
            for (let key in userFriends) {
                if (userFriends[key] === fromUserId) {
                    updates['/users/' + toUserId + '/friends/' + key] = null;
                }
            }
        }
    }).catch((error) => {
        console.error('Error removing friend from user friends:', error);
    });

    // Apply all updates in a single call
    remove(child(ref(db), 'chat/' + chatId)).then(() => {
        console.log('Chat removed from chat list');
        return update(ref(db), updates);
    }).then(() => {
        console.log('Chat removed from user chats and friends list');
    }).catch((error) => {
        console.error('Error applying updates:', error);
    });
}

export async function clearChat(chatId: string) {
    const updates: { [key: string]: any } = {};

    // Delete the chat from the 'chat/' node
    updates['/chat/' + chatId + '/messageList'] = [];
    updates['/chat/' + chatId + '/lastMessage'] = ""

    update(ref(db), updates).then(() => {
        console.log("sohbet silindi")
    }).catch((error) => {
        console.log(error)
    })
}

export async function addMessage({ message, chatId, fromUserId, type, duration }: { message: string, chatId: string, fromUserId: string, type: string, duration?: string }) {
    const messageRef = push(child(ref(db), 'chat/' + chatId + '/messageList'));
    const messageKey = messageRef.key;

    const newMessage: Message = {
        messageId: messageKey ? messageKey : "undefined",
        content: message,
        fromUserId,
        sentTime: (new Date()).toISOString(),
        type,
    }

    if (duration) {
        newMessage['duration'] = duration
    }

    if (type !== 'text') {
        const uploadVoiceUri = Platform.OS === "ios" ? message.replace("file://", "") : message;
        const storagePath = `voices/${messageKey}.m4a`;
        const refStorage = storageRef(storage, storagePath);
        try {
            const blob = await fetch(uploadVoiceUri).then((response) => response.blob());
            // Upload blob to Firebase Storage
            await uploadBytes(refStorage, blob);
            // Get download URL after upload
            const downloadURL = await getDownloadURL(refStorage);
            // Save story metadata to the database
            newMessage.content = downloadURL
        } catch (error) {
            console.log(error)
        }
    }

    if (messageKey) {
        set(messageRef, newMessage)
            .then(() => {
                const updates: { [key: string]: any } = {};
                if (newMessage.type === 'text') {
                    updates['chat/' + chatId + '/lastMessage'] = newMessage.content;
                } else {
                    updates['chat/' + chatId + '/lastMessage'] = "Voice";
                }
                update(ref(db), updates);
                console.log('Message added successfully');
            })
            .catch((error) => {
                console.error('Error adding message:', error);
            });
    } else {
        console.error('Failed to generate message key');
    }
}


export async function saveUserIdToAsyncStorage(userId: string) {
    try {
        await AsyncStorage.setItem('userId', userId);
        console.log('Kullanıcı kimliği başarıyla kaydedildi:', userId);
    } catch (error) {
        console.error('Kullanıcı kimliğini kaydederken bir hata oluştu:', error);
        throw error;
    }
}

export async function deleteUserIdFromAsyncStorage() {
    try {
        await AsyncStorage.clear();
        console.log('Kullanıcı kimliği başarıyla silindi:');
    } catch (error) {
        console.error('Kullanıcı kimliğini silinirken bir hata oluştu:', error);
        throw error;
    }
}

export async function getUserIdFromAsyncStorage() {
    try {
        const userId = await AsyncStorage.getItem('userId');
        if (userId !== null) {
            console.log('Kullanıcı kimliği başarıyla alındı:', userId);
            return userId;
        } else {
            console.log('Kullanıcı kimliği bulunamadı');
            return null;
        }
    } catch (error) {
        console.error('Kullanıcı kimliğini alırken bir hata oluştu:', error);
        return null
    }
}

export const getStories = async (userId: string) => {
    const dbRef = ref(db)
    try {
        const snapshot = await get(child(dbRef, `/story/` + userId))
        if (snapshot.exists()) {
            const stories: Story[] = Object.values(snapshot.val()) //Object.values(snapshot.val());
            console.log("story:", stories)
            return stories
        } else {
            console.log("No data available");
            return null
        }
    } catch (error) {
        console.log(error)
        return null
    }
}

export async function addStory(userId: string, uri: string) {

    const storyKey = push(child(ref(db), 'story/' + userId)).key;
    const storagePath = `images/${storyKey}.jpg`;
    const refStorage = storageRef(storage, storagePath);
    const uploadUri = Platform.OS === "ios" ? uri.replace("file://", "") : uri;
    if (storyKey) {
        try {
            const blob = await fetch(uploadUri).then((response) => response.blob());
            // Upload blob to Firebase Storage
            await uploadBytes(refStorage, blob);
            // Get download URL after upload
            const downloadURL = await getDownloadURL(refStorage);
            // Save story metadata to the database
            const story: Story = {
                storyId: storyKey,
                userId,
                uri: downloadURL,
                uploadTime: (new Date()).toISOString()
            };
            // Save story metadata to the database
            set(ref(db, 'story/' + userId + '/' + storyKey), story).then(() => {
                push(child(ref(db), 'users/' + userId + '/stories/'), storyKey).then(() => {
                    console.log("story olusturuldu")
                }).catch((error) => {
                    console.error('Error creating chat:', error);
                })
            })
        } catch (error) {
            console.log(error)
        }
    }
};

export const setTimeOutAsync = (milliseconds: number) => new Promise(resolve => {
    setTimeout(() => { resolve(true) }, milliseconds)
})

export const getDurationFormatted = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const secondsDisplay = seconds < 10 ? `0${seconds}` : seconds;
    return `${minutes}:${secondsDisplay}`;
}
