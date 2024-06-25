import { View, Text, TouchableOpacity, Image, ImageBackground, Dimensions, TextInput, TouchableWithoutFeedback, Keyboard, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { deleteUserIdFromAsyncStorage, getUser, getUserIdFromAsyncStorage, updateUser } from '../utils/util'
import { User } from '../utils/types'
import { useDispatch, useSelector } from 'react-redux'
import { clearUid } from '../redux/authSlice'
import { RootState } from '../redux/store'
import { CameraType, MediaTypeOptions, launchCameraAsync, launchImageLibraryAsync } from 'expo-image-picker'
import { MaterialCommunityIcons, Foundation } from '@expo/vector-icons';

const Profile = () => {

    const uid = useSelector((state: RootState) => state.auth.uid)
    const [user, setUser] = useState<User | null>(null)
    const [selectedImage, setSelectedImage] = useState<any>()
    const [status, setStatus] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)

    const dimensions = Dimensions.get("screen")
    const IMAGE_WIDTH = dimensions.width / 1.8
    const IMAGE_HEIGHT = dimensions.height / 3

    const dispatch = useDispatch()

    useEffect(() => {
        if (uid) {
            getUser(uid).then((usr) => {
                console.log("user:", usr);
                setUser(usr);
                if (usr) {
                    setStatus(usr.status || '');
                    setName(usr.name || '');
                }
            }).catch(() => {
                console.log("user alınırken hata olustu.");
            });
        }
    }, [uid]);


    const handleLogout = async () => {
        await deleteUserIdFromAsyncStorage().then(() => {
            dispatch(clearUid())
            console.log("Cıkıs basarili")
        }).catch(() => {
            console.log('cikis basarisiz')
        })
    }

    const uploadImage = async () => {
        try {
            let result = await launchImageLibraryAsync({
                mediaTypes: MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if (!result.canceled) {
                if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
                    setSelectedImage(result.assets[0].uri);
                }
            }
        } catch (error) {
            console.log("image is not usable", error);
        }
    };

    const launchCamera = async () => {
        const result = await launchCameraAsync({
            allowsEditing: true,
            quality: 1,
            aspect: [4, 3],
            mediaTypes: MediaTypeOptions.Images,
            cameraType: CameraType.front
        })
        if (result.assets && result.assets.length > 0 && result.assets[0].uri) {
            setSelectedImage(result.assets[0].uri);
        };
    }

    const showImagePickerOptions = () => {
        Alert.alert(
            "Kaynak seçiniz",
            "",
            [
                { text: "Take Photo", onPress: launchCamera },
                { text: "Choose from Gallery", onPress: uploadImage },
                { text: "Cancel", style: "cancel" },
            ],
        );
    };

    const confirmUpdate = async () => {
        setLoading(true)
        try {
            if (user) {
                const updatedUser = { ...user, avatar: selectedImage || user.avatar, status, name };
                setUser(updatedUser);
                await updateUser(JSON.parse(JSON.stringify(updatedUser)));
                console.log("updatedusr:", updatedUser)
                setLoading(false)
            }
        } catch (error) {
            console.error("Update failed", error);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{
                    flexGrow: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <View style={{ width: dimensions.width, alignItems: 'flex-end' }}>
                        <TouchableOpacity
                            style={{ marginRight: 20, backgroundColor: '#25D366', padding: 12, borderRadius: 15 }}
                            onPress={handleLogout}
                        >
                            <Text style={{ color: '#fff', fontSize: 16 }}>Log Out</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: IMAGE_WIDTH, height: IMAGE_HEIGHT, borderRadius: 100, overflow:'hidden', aspectRatio:1 }}>
                        <Image
                            source={{ uri: selectedImage || user?.avatar }}
                            style={{ width: '100%', height: '100%', borderRadius: 100 }}
                            resizeMode='cover' />
                        <TouchableOpacity onPress={showImagePickerOptions} style={{ position: 'absolute', right: 1, bottom: '10%', width: '25%', height: '20%', borderRadius: 20, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', opacity: 0.7 }}>
                            <MaterialCommunityIcons name="image-edit" size={36} color="black" />
                        </TouchableOpacity>
                    </View>

                    <TextInput value={name} onChangeText={(text) => setName(text)} maxLength={25} style={{ fontSize: 36, fontWeight: 'bold' }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Foundation name="telephone" size={24} color="#25D366" />
                        <Text style={{ fontSize: 15, fontWeight: "700", margin: 15 }}>{user?.phone}</Text>
                    </View>

                    <TextInput multiline maxLength={139} value={status} onChangeText={(text) => setStatus(text)} style={{ width: '75%', padding: 10, borderWidth: 1, borderColor: 'gray', marginTop: 5, borderRadius: 10, backgroundColor: '#fff' }} />
                    {loading ?
                        <ActivityIndicator size={24} color={'#25D366'} style={{ marginTop: 10 }} />
                        :
                        <TouchableOpacity
                            onPress={confirmUpdate}
                            style={{
                                backgroundColor: '#25D366',
                                paddingVertical: 10,
                                paddingHorizontal: 20,
                                borderRadius: 15,
                                marginVertical: 20
                            }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Save</Text>
                        </TouchableOpacity>
                    }
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    )
}

export default Profile