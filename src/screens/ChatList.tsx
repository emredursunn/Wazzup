import { View, FlatList, TouchableOpacity, Text, ActivityIndicator, Modal, Button, Dimensions, TouchableWithoutFeedback } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Chat } from '../utils/types';
import ChatComponent from '../components/ChatComponent';
import { getDatabase, off, onValue, ref } from 'firebase/database';
import { app } from '../../firebaseConfig';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { HomeStackParams } from '../navigation/HomeStackNav';
import { clearChat, db } from '../utils/util';
import colors from '../utils/colors';

type Props = NativeStackScreenProps<HomeStackParams, "Chats">;

const ChatList = ({ navigation }: Props) => {
    const userId = useSelector((state: RootState) => state.auth.uid)
    const [chatList, setChatList] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
    const dimensions = Dimensions.get("screen")


    useEffect(() => {
        setLoading(true)
        const chatRefs: { [key: string]: any } = {}; // To keep track of chat listeners
        const getUserChats = async () => {
            try {
                if (userId) {
                    const userChatsRef = ref(db, `users/${userId}/chats`);
                    onValue(userChatsRef, async (snapshot) => {
                        const userChatsData = snapshot.val();
                        if (userChatsData) {
                            const chatIds: string[] = Object.values(userChatsData);
                            const chatPromises = chatIds.map(chatId => getChatData(chatId));
                            const chats = await Promise.all(chatPromises);
                            setChatList(chats.filter(chat => chat !== null) as Chat[]);

                            chatIds.forEach(chatId => {
                                const chatRef = ref(db, `chat/${chatId}/lastMessage`);
                                chatRefs[chatId] = chatRef;
                                onValue(chatRef, (snapshot) => {
                                    const lastMessage = snapshot.val();
                                    setChatList(prevChats => prevChats.map(chat =>
                                        chat.chatId === chatId ? { ...chat, lastMessage } : chat
                                    ));
                                });
                            });
                        } else {
                            setChatList([]);
                        }
                    });
                } else {
                    console.log('Kullanıcı kimliği bulunamadı');
                }
            } catch (error) {
                console.error('Kullanıcı sohbetlerini alırken hata oluştu:', error);
            } finally {
                setLoading(false);
            }
        };

        const getChatData = (chatId: string): Promise<Chat | null> => {
            return new Promise((resolve, reject) => {
                const chatRef = ref(db, `chat/${chatId}`);
                onValue(chatRef, (snapshot) => {
                    const chatData = snapshot.val();
                    if (chatData) {
                        resolve(chatData);
                    } else {
                        resolve(null);
                    }
                }, (error) => {
                    reject(error);
                });
            });
        };

        getUserChats();

        return () => {
            if (userId) {
                off(ref(db, `users/${userId}/chats`));
                Object.values(chatRefs).forEach(chatRef => off(chatRef));
            }
        };
    }, [userId]);

    const renderChatList = ({ item, index }: { item: Chat; index: number }) => (
        <ChatComponent key={index} chat={item} handleOnPress={handleChatOnPress} handleOnLongPress={handleChatOnLongPress} />
    );

    const handleChatOnPress = (chatId: string) => {
        navigation.navigate("Chat", { chatId: chatId });
    };

    const handleChatOnLongPress = (chat: Chat) => {
        if (chat) {
            setSelectedChat(chat)
            setVisible(true)
        }
    }

    const clearChatPress = () => {
        if (selectedChat) {
            clearChat(selectedChat.chatId)
            setVisible(false)
        }
    }

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {loading ?
                <ActivityIndicator size={44} color={'blue'} />
                :
                <>
                    <View style={{ flex: 1, width: '100%' }}>
                        <Text style={{ fontSize: 28, margin: 20, fontWeight: 'bold', alignSelf: 'flex-start' }}>Chats</Text>
                    </View>
                    <View style={{ flex: 7, alignItems: 'center', justifyContent: 'center' }}>
                        {chatList && chatList.length > 0
                            ?
                            <FlatList
                                data={chatList}
                                renderItem={renderChatList}
                                keyExtractor={item => item.chatId}
                            />
                            :
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 24 }}>You have no contact</Text>
                                <Text style={{ fontSize: 24 }}>Get some!</Text>
                            </View>
                        }
                    </View>
                </>
            }

            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setVisible(false)}>
                    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-around', width: dimensions.width, padding: 20, backgroundColor: 'white', borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <Button title="Clear Chat" color={colors.PRIMARY_COLOR} onPress={clearChatPress} />
                            <Button title="Cancel" color={colors.PRIMARY_COLOR} onPress={() => setVisible(false)} />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View >
    );
};

export default ChatList;
