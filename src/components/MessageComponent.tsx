import { View, Text, Dimensions } from 'react-native'
import React from 'react'
import { Message } from '../utils/types'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

type Props = {
    message: Message
}

const MessageComponent = ({ message }: Props) => {

    const MIN_HEIGHT = Dimensions.get("screen").height / 17
    const MAX_WIDTH = Dimensions.get("screen").width / 1.3

    const uid = useSelector((state: RootState) => state.auth.uid)
    const isMine = message.fromUserId === uid

    return (
        <View style={{ minHeight: MIN_HEIGHT, maxWidth:MAX_WIDTH, alignSelf: isMine ? 'flex-end' : 'flex-start', backgroundColor: isMine ? 'lightgreen' : 'lightgray', justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, marginVertical: 5, paddingHorizontal: 15, paddingVertical:5, borderRadius: 5 }}>
            <Text style={{ fontSize: 18,alignSelf:'flex-start' }}>{message.content}</Text>
            <Text style={{ alignSelf: 'flex-end', fontSize: 12 }}>{message.sentTime.substring(11, 16)}</Text>
        </View>
    )
}

export default MessageComponent