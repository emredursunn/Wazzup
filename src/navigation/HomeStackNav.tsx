import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import ChatList from '../screens/ChatList'
import Chat from '../screens/Chat'

import UserScreen from '../screens/User'


export type HomeStackParams = {
    Chats: undefined,
    Chat: {
        chatId: string
    },
    User: {
        userId: string,
        chatId: string
    }
}

const HomeStackNav = () => {

    const UserStack = createNativeStackNavigator<HomeStackParams>()

    return (
        <UserStack.Navigator>
            <UserStack.Screen name='Chats' component={ChatList} options={{ headerShown:false, headerTitle: 'WazzUp', headerTitleAlign:'center' }} />
            <UserStack.Screen name='Chat' component={Chat} options={{ headerShown: false }} />
            <UserStack.Screen name='User' component={UserScreen} options={{ headerTitle: '' }} />
        </UserStack.Navigator>
    )
}

export default HomeStackNav