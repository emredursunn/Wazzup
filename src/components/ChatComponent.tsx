import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Chat, User } from '../utils/types'
import { child, get, getDatabase, ref } from 'firebase/database'
import { app } from '../../firebaseConfig'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

type Props = {
    chat: Chat,
    handleOnPress: (chatId: string) => void,
    handleOnLongPress: (chat: Chat) => void
}

const ChatComponent = ({ chat, handleOnPress, handleOnLongPress }: Props) => {
    const db = getDatabase(app)
    const uid = useSelector((state: RootState) => state.auth.uid)
    const [user, setUser] = useState<User | null>(null);
    const dimensions = Dimensions.get("screen")

    useEffect(() => {
        const getUser = async (userId: string) => {
            const dbRef = ref(db);
            try {
                const snapshot = await get(child(dbRef, `users/` + userId));
                if (snapshot.exists()) {
                    setUser(snapshot.val());
                } else {
                    console.log("No data available");
                }
            } catch (error) {
                console.error(error);
            }
        };
        if (chat.toUserId === uid) {
            getUser(chat.fromUserId)
        } else {
            getUser(chat.toUserId);
        }
    }, []);


    return (
        <TouchableOpacity onPress={() => handleOnPress(chat.chatId)} onLongPress={() => handleOnLongPress(chat)} style={{ width: dimensions.width, height: dimensions.height / 8, alignSelf: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#8E8E93' }}>
            <View style={{ width: '20%', aspectRatio: 1, borderRadius: 100, overflow: 'hidden', borderWidth: 1, marginLeft: 10 }}>
                <Image
                    source={{ uri: user ? user.avatar : undefined }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode='cover'
                />
            </View>


            <View style={{ padding: 10 }}>
                {user && <Text style={{ fontSize: 24, fontWeight: 'bold', alignSelf: 'flex-start' }}>{user.name}</Text>}
                {chat.lastMessage && <Text numberOfLines={2} style={{ fontSize: 16, color: '#8E8E93' }}>{chat.lastMessage.length > 35 ? chat.lastMessage.substring(0, 34) + "..." : chat.lastMessage}</Text>}
            </View>
        </TouchableOpacity>
    )
}

export default ChatComponent