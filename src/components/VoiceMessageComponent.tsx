import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Audio } from 'expo-av';
import { Message } from '../utils/types';
import { FontAwesome5, Entypo } from '@expo/vector-icons';
import { RootState } from '../redux/store';
import { useSelector } from 'react-redux';

type Props = {
    message: Message
}

const VoiceMessageComponent = ({ message }: Props) => {


    const MIN_HEIGHT = Dimensions.get("screen").height / 17
    const MAX_WIDTH = Dimensions.get("screen").width / 1.3

    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false)

    const uid = useSelector((state: RootState) => state.auth.uid)
    const isMine = message.fromUserId === uid

    useEffect(() => {
        return () => {
            if (sound) {
                console.log('Unloading sound..');
                sound.unloadAsync();
            }
        };
    }, [sound]);

    async function playSound() {
        console.log('Loading Sound');
        setIsPlaying(true)
        const { sound } = await Audio.Sound.createAsync(
            { uri: message.content },
            { shouldPlay: true })
        setSound(sound);
        console.log('Playing Sound');
        await sound.playAsync();
    }

    async function stopSound() {
        setIsPlaying(false)
        if (sound) {
            console.log('Stopping sound..');
            await sound.stopAsync();
            setSound(null); // Reset the sound state to null
        }
    }

    return (
        <View style={{ minHeight: MIN_HEIGHT, maxWidth: MAX_WIDTH, minWidth: '50%', flexDirection: 'row', alignSelf: isMine ? 'flex-end' : 'flex-start', backgroundColor: isMine ? 'lightgreen' : 'lightgray', justifyContent: 'space-around', alignItems: 'center', marginHorizontal: 10, marginVertical: 5, paddingHorizontal: 15, paddingVertical: 5, borderRadius: 5 }}>
            <Text>{message.duration}</Text>
            <TouchableOpacity onPress={isPlaying ? stopSound : playSound}>
                {isPlaying ? <Entypo name="controller-stop" size={24} color="black" />
                    : <FontAwesome5 name="play" size={24} color="black" />}
            </TouchableOpacity>
            <Text style={{ alignSelf: 'flex-end', fontSize: 12 }}>{message.sentTime.substring(11, 16)}</Text>
        </View>
    )

}

export default VoiceMessageComponent