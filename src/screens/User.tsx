import { View, Text, TouchableOpacity, Image, Dimensions, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { checkFriend, createNewChat, deleteChat, getUser } from '../utils/util'
import { User } from '../utils/types'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AntDesign } from '@expo/vector-icons';
import { HomeStackParams } from '../navigation/HomeStackNav'
import { Foundation } from '@expo/vector-icons';
import colors from '../utils/colors'

type Props = NativeStackScreenProps<HomeStackParams, "User">

const UserScreen = ({ navigation, route }: Props) => {

    const uid = useSelector((state: RootState) => state.auth.uid)
    const { userId, chatId } = route.params
    const [user, setUser] = useState<User | null>(null)
    const [isMyFriend, setIsMyFriend] = useState(false)

    const IMAGE_WIDTH = Dimensions.get("screen").width / 1.8
    const IMAGE_HEIGHT = Dimensions.get("screen").height / 3

    useEffect(() => {
        if (userId) {
            getUser(userId).then((usr) => {
                console.log("user:", usr);
                setUser(usr);
            }).catch(() => {
                console.log("user alınırken hata olustu.");
            });
        }
    }, [userId]);

    useEffect(() => {
        checkFriend(uid!, userId).then((isFriend) => {
            setIsMyFriend(isFriend)
            console.log(isFriend)
        })
    }, [userId])

    const setFriend = async () => {
        try {
            if (!isMyFriend) {
                createNewChat(uid!, userId)
                setIsMyFriend(true)
                console.log("Friend is added and chat is created...")
            } else {
                Alert.alert('Emin misiniz?', 'Sohbetiniz kaybolacak',
                    [
                        {
                            text: 'Vazgeç',
                            style: 'cancel',
                        },
                        {
                            text: 'Onayla',
                            onPress: () => {
                                deleteChat(uid!, userId, chatId)
                                setIsMyFriend(false)
                                navigation.popToTop()
                            }
                        }
                    ]
                )

            }
        } catch (error) {
            console.log("friend could not be added.", error)
            throw error
        }
    }


    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    top: 40,
                    right: 20,
                    backgroundColor: colors.PRIMARY_COLOR,
                    padding: 12,
                    borderRadius: 15,
                }}
                onPress={setFriend}>
                {isMyFriend ? <AntDesign name="deleteuser" size={24} color="#fff" /> : <AntDesign name="adduser" size={24} color="#fff" />}
            </TouchableOpacity>
            <View style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT, aspectRatio: 1, borderRadius: 100, overflow: 'hidden' }}>
                <Image
                    source={{ uri: user?.avatar }}
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 100,
                    }} resizeMode='cover' />
            </View>
            <Text style={{ fontSize: 36, fontWeight: 'bold' }}>{user?.name}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Foundation name="telephone" size={24} color={colors.PRIMARY_COLOR} />
                <Text style={{ fontSize: 15, fontWeight: "700", margin: 15 }}>{user?.phone}</Text>
            </View>

            <View style={{ width: '75%', padding: 10, borderWidth: 1, borderColor: 'gray', marginTop: 5, borderRadius: 10, backgroundColor: '#fff' }}>
                <Text style={{ fontSize: 18 }}>{user?.status}</Text>
            </View>
        </View>
    );
}

export default UserScreen