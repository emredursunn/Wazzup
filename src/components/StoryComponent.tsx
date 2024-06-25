import { View, Text, TouchableOpacity, Image } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Story, User } from '../utils/types'
import { addStory, getStories, getUser } from '../utils/util';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../utils/colors';


type Props = {
    userId: string,
    setVisible: React.Dispatch<React.SetStateAction<boolean>>,
    setSelectedStories: React.Dispatch<React.SetStateAction<Story[] | null>>,
}

const StoryComponent = ({ userId, setVisible, setSelectedStories }: Props) => {

    const [user, setUser] = useState<User | null>(null)
    const uid = useSelector((state: RootState) => state.auth.uid)
    const [stories, setStories] = useState<Story[] | null>(null)
    const [refresh, setRefresh] = useState<number>(Date.now());

    useEffect(() => {
        getUser(userId).then((usr) => {
            setUser(usr)
            if (usr) {
                getStories(usr.userId).then((st) => {
                    setStories(st)
                })
            }
        }).catch(() => {
            console.log("story alınırken hata olustu.");
        });
    }, [userId, refresh]);


    const showStory = () => {
        setSelectedStories(stories)
        setVisible(true)
    }

    // Resim seçme işlemi
    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled && uid) {
            const image = result.assets[0].uri
            addStory(uid, image).then(() => {
                setRefresh(Date.now())
                console.log('Hikaye paylaşıldı:', image);
            }
            )
        }
    };

    const launchCamera = async () => {
        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 1,
            aspect: [4, 3],
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            cameraType: ImagePicker.CameraType.front
        })
        if (!result.canceled && uid) {
            const image = result.assets[0].uri
            addStory(uid, image).then(() => {
                setRefresh(Date.now())
                console.log('Hikaye paylaşıldı:', image);
            }
            )
        };
    }

    return (
        user?.userId === uid ?
            <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#fff', marginTop: '5%', borderBottomWidth: 1, borderColor: 'gray', paddingVertical: 10 }}>
                <>
                    <TouchableOpacity onPress={stories ? showStory : undefined} style={{ width: '20%', aspectRatio: 1, borderRadius: 100, overflow: 'hidden', borderWidth: stories ? 4 : 0, marginLeft: 10, borderColor: stories ? colors.PRIMARY_COLOR : undefined }}>
                        <Image source={{ uri: user?.avatar }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ alignSelf: 'center', marginHorizontal: 10, paddingTop: 10, fontSize: 24, fontStyle: 'italic' }}>You</Text>
                        {stories && <Text style={{ marginHorizontal: 10, fontSize: 16, fontStyle: 'italic' }}>{stories[stories.length - 1].uploadTime.slice(11, 16)}</Text>}
                    </View>

                    <TouchableOpacity onPress={pickImage} style={{ marginLeft: '20%', alignSelf: 'center', marginHorizontal: 30 }}>
                        <MaterialIcons name="insert-photo" size={30} color={colors.PRIMARY_COLOR} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={launchCamera} style={{ alignSelf: 'center', marginHorizontal: 20 }}>
                        <MaterialIcons name="enhance-photo-translate" size={30} color={colors.PRIMARY_COLOR} />
                    </TouchableOpacity>
                </>
            </View>
            :
            (stories &&
                <View style={{ width: '100%', flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: 'gray', paddingVertical: 10 }}>
                    <TouchableOpacity onPress={showStory} style={{ width: '20%', aspectRatio: 1, borderRadius: 100, overflow: 'hidden', borderWidth: 4, borderColor: colors.PRIMARY_COLOR, marginLeft: 10 }}>
                        <Image source={{ uri: user?.avatar }} style={{ width: '100%', height: '100%' }} resizeMode='cover' />
                    </TouchableOpacity>
                    <View>
                        <Text style={{ alignSelf: 'center', marginHorizontal: 10, paddingTop: 10, fontSize: 20, fontStyle: 'italic' }}>{user?.name}</Text>
                        {stories && <Text style={{ marginHorizontal: 10, fontSize: 16, fontStyle: 'italic' }}>{stories[stories.length - 1].uploadTime.slice(11, 16)}</Text>}
                    </View>
                </View>
            )
    )
}


export default StoryComponent