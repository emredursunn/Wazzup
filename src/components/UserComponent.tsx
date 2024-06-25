import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { User } from '../utils/types'
import { MaterialIcons, Foundation } from '@expo/vector-icons';
import { checkFriend, createNewChat, getUser } from '../utils/util'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import colors from '../utils/colors';

type Props = {
    userId: string,
}

const UserComponent = ({ userId }: Props) => {
    const [user, setUser] = useState<User | null>(null);
    const uid = useSelector((state: RootState) => state.auth.uid)
    const [isMyFriend, setIsMyFriend] = useState(false)
    const dimensions = Dimensions.get("screen")

    useEffect(() => {
        getUser(userId).then((usr) => {
            setUser(usr);
        }).catch(() => {
            console.log("user alınırken hata olustu.");
        });
    }, [userId]);

    useEffect(() => {
        if (user) {
            checkFriend(uid!, user.userId).then((bool) =>
                setIsMyFriend(bool)
            )
        }
    }, [user])

    const addFriend = async (userId: string) => {
        try {
            if (uid) {
                await createNewChat(uid, userId)
                setIsMyFriend(true)
                console.log("Friend is added and chat is created...")
            }
        } catch (error) {
            console.log("friend could not be added.", error)
            throw error
        }
    }

    const handleAddFriend = () => {
        if (!isMyFriend) {
            addFriend(user!.userId)
        }
    }

    return (
        <View style={{ width: dimensions.width / 1.1, height: dimensions.height / 7, alignSelf: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: 'lightgray', borderRadius: 20 }}>
            <View style={{ width: '20%', aspectRatio: 1, borderRadius: 100, overflow: 'hidden', borderWidth: 2, marginLeft: 10, borderColor: colors.PRIMARY_COLOR }}>
                <Image source={{ uri: user ? user.avatar : undefined }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
            </View>

            <View style={{ padding: 10 }}>
                {user && <Text style={{ fontSize: 24, fontWeight: 'bold', paddingBottom: 20 }}>{user.name}</Text>}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Foundation name="telephone" size={24} color={colors.PRIMARY_COLOR} />
                    <Text style={{ fontSize: 18, fontWeight: "700", marginHorizontal: 10 }}>{user?.phone}</Text>
                </View>
            </View>

            <TouchableOpacity style={{ position: 'absolute', right: 10 }} onPress={handleAddFriend}>
                {!isMyFriend && <MaterialIcons name="person-add" size={40} color={colors.PRIMARY_COLOR} />}
            </TouchableOpacity>
        </View>
    )
}

export default UserComponent
