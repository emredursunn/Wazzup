import { View, Text, TouchableOpacity, FlatList, TextInput, Keyboard, TouchableWithoutFeedback, Image, Modal, KeyboardAvoidingView, Platform, Dimensions, Button } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { app } from '../../firebaseConfig';
import { addMessage, getUser, getDurationFormatted, clearChat } from '../utils/util';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { child, get, getDatabase, off, onValue, ref } from 'firebase/database';
import { Message, User } from '../utils/types';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import MessageComponent from '../components/MessageComponent';
import { Ionicons, Feather, Entypo, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import * as GoogleGenerativeAI from "@google/generative-ai";
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import VoiceMessageComponent from '../components/VoiceMessageComponent';
import { HomeStackParams } from '../navigation/HomeStackNav';
import colors from '../utils/colors';
import { SimpleLineIcons } from '@expo/vector-icons';

type Props = NativeStackScreenProps<HomeStackParams, 'Chat'>

const Chat = ({ navigation, route }: Props) => {

    const dimensions = Dimensions.get("screen")
    const db = getDatabase(app);
    const { chatId } = route.params
    const uid = useSelector((state: RootState) => state.auth.uid)
    const [messageList, setMessageList] = useState<Message[]>([])
    const [message, setMessage] = useState('');
    let scrollRef = useRef<FlatList>(null)
    const [user, setUser] = useState<User | null>(null)
    const [AIResponses, setAIResponses] = useState("...")
    const [AIModalVisible, setAIModalVisible] = useState(false);
    const [visible, setVisible] = useState(false);

    const [recording, setRecording] = useState<Audio.Recording | undefined>();
    const [permissionResponse, requestPermission] = Audio.usePermissions();

    const API_KEY = "YOUR_API_KEY"
    const defaultPrompt = "I use you as an auto reply generator on messaging app, I will give you the talk. You will produce an answer appropriate to the topic. Keep it in the mood for daily conversation. If the conversation is empty, you can start the conversation with hello etc. When the conversation gets stuck, you can open new topics. Generally focus on recent posts. I separated the messages with this sign '\'. Answers must be a maximum of 70 characters. Speech: "

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const chatRef = ref(db)
                const snapshot = await get(child(chatRef, 'chat/' + chatId))
                const userId = snapshot.val().toUserId === uid ? snapshot.val().fromUserId : snapshot.val().toUserId
                const usr = await getUser(userId)
                setUser(usr)
            } catch (error) {
                console.log(error)
                throw error
            }
        }
        fetchUser()
    }, [])

    useEffect(() => {
        const messagesRef = ref(db, 'chat/' + chatId + '/messageList')
        onValue(messagesRef, (snapshot) => {
            try {
                const data: Message[] = snapshot.val()
                if (data) {
                    const messageListArray = Object.values(data)
                    setMessageList(messageListArray)
                } else {
                    setMessageList([])
                }
            } catch (error) {
                console.log("Chathata:", error)
                throw error
            }
        });

        // Cleanup function to unsubscribe from the database listener
        return () => {
            // Unsubscribe from the database listener to avoid memory leaks
            off(messagesRef);
        };
    }, []);

    const handleSend = () => {
        if (message.trim().length > 0) {
            addMessage(
                {
                    message: message.trim(),
                    chatId: chatId,
                    fromUserId: uid!,
                    type: 'text'
                })
            setMessage(''); // Mesaj gönderildikten sonra giriş alanını temizle
        }
    };

    const createResponseWithAI = async () => {
        cancelRecording()
        setAIModalVisible(true)
        try {
            const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            let prompt = defaultPrompt
            const lastMessages = messageList.slice(-5);
            for (let msg of lastMessages) {
                prompt += msg.content + "\\"
            }
            const result = await model.generateContent(prompt);
            const response = result.response;
            console.log("response:", response)
            const text = response.text();
            setAIResponses(text)
        } catch (error) {
            console.log(error)
            throw error
        }
    }

    const useAIResponse = () => {
        setMessage(AIResponses)
        setAIModalVisible(false)
        setAIResponses("...")
    }


    async function startRecording() {
        try {
            if (!permissionResponse || permissionResponse.status !== 'granted') {
                console.log('Requesting permission..');
                await requestPermission();
            }
            if (!permissionResponse || permissionResponse.status === 'granted') {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: true,
                    playsInSilentModeIOS: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
                    interruptionModeIOS: InterruptionModeIOS.DoNotMix,
                });

                console.log('Starting recording..');
                const { recording } = await Audio.Recording.createAsync(
                    Audio.RecordingOptionsPresets.HIGH_QUALITY
                );
                setRecording(recording);
                console.log('Recording started');
            }
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    }

    async function stopRecording() {
        setRecording(undefined)
        try {
            if (recording) {
                console.log('Stopping recording..');
                await recording.stopAndUnloadAsync();
                const { sound, status } = await recording.createNewLoadedSoundAsync()
                console.log("ses", sound)
                const uri = recording.getURI();

                if (uri && uid) {
                    addMessage({
                        message: uri,
                        chatId: chatId,
                        fromUserId: uid,
                        type: 'mp3',
                        duration: getDurationFormatted(status.durationMillis)
                    });
                }
                console.log('Recording stopped and stored at', uri);
            }
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    }

    const cancelRecording = async () => {
        setRecording(undefined)
        try {
            if (recording) {
                console.log('Stopping recording..');
                await recording.stopAndUnloadAsync();
            }
        } catch (error) {
            console.error(error)
        }
    }

    const goUserProfile = () => {
        if (user) {
            cancelRecording()
            navigation.navigate('User', { userId: user.userId, chatId: chatId })
        }
    }


    const goBack = () => {
        cancelRecording()
        navigation.goBack()
    }


    const clearChatPress = () => {
        clearChat(chatId)
        setVisible(false)
    }

    const renderItem = ({ item, index }: { item: Message, index: number }) => {
        return (
            item.type === 'text' ?
                <MessageComponent message={item} key={index} />
                :
                <VoiceMessageComponent message={item} key={index} />
        )
    }

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity onPress={goUserProfile} style={{ flexDirection: 'row', backgroundColor: '#065e58', width: dimensions.width, height: dimensions.height / 8.5, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 15 }}>
                <TouchableOpacity style={{ height: '100%', width: '20%', alignItems: 'center', justifyContent: 'center' }} onPress={goBack}>
                    <Ionicons name="arrow-back-outline" size={34} color="#fff" style={{ paddingHorizontal: 10, alignSelf: 'center' }} />
                </TouchableOpacity>
                <View style={{ width: '12%', aspectRatio: 1, borderRadius: 100, overflow: 'hidden' }}>
                    <Image
                        source={{ uri: user ? user.avatar : undefined }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode='cover'
                    />
                </View>
                <Text style={{ color: '#fff', fontSize: 20, marginHorizontal: 10 }}>{user?.name}</Text>
                <TouchableOpacity onPress={() => setVisible(true)} style={{ position: 'absolute', right: 10, paddingTop: 10 }}>
                    <SimpleLineIcons name="options-vertical" size={24} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                    <FlatList data={messageList}
                        renderItem={renderItem}
                        ref={scrollRef}
                        onContentSizeChange={() =>
                            scrollRef.current?.scrollToEnd({ animated: true })
                        }
                    />
                </TouchableWithoutFeedback>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 25, padding: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 }}>
                    <TextInput
                        multiline
                        style={{ flex: 1, paddingHorizontal: 10, fontSize: 16 }}
                        placeholder="Text here..."
                        value={message}
                        onChangeText={setMessage} />

                    <TouchableOpacity
                        style={{ backgroundColor: colors.PRIMARY_COLOR, borderRadius: 50, padding: 10 }}
                        onPress={createResponseWithAI}>
                        <FontAwesome5 name="robot" size={24} color="black" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ backgroundColor: colors.PRIMARY_COLOR, borderRadius: 50, padding: 10, marginHorizontal: 5 }}
                        onPress={recording ? stopRecording : startRecording}>
                        {recording ? <Entypo name="controller-stop" size={24} color="black" />
                            : <FontAwesome name="microphone" size={24} color="black" />}
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{ backgroundColor: colors.PRIMARY_COLOR, borderRadius: 50, padding: 10 }}
                        onPress={handleSend}>
                        <Ionicons name="send" size={24} color="black" />
                    </TouchableOpacity>
                </View>
                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={AIModalVisible}
                    onRequestClose={() => {
                        setAIModalVisible(false);
                    }}>
                    <TouchableWithoutFeedback onPress={() => setAIModalVisible(false)}>
                        <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0)', marginBottom: '15%' }}>
                            <View style={{ width: '100%', backgroundColor: 'rgba(255,255,255,0)', padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                <TouchableOpacity onPress={useAIResponse}
                                    style={{ padding: 10, backgroundColor: colors.PRIMARY_COLOR, borderRadius: 10 }}>
                                    <Text style={{ color: 'white', fontSize: 16 }}>{AIResponses}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            </KeyboardAvoidingView>

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
        </View>
    )
}

export default Chat
