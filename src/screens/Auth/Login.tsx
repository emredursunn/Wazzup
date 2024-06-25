import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, ScrollView, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native'
import React, { useState } from 'react'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { AuthStackParams } from '../../navigation/AuthStackNav'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { app } from '../../../firebaseConfig'
import { saveUserIdToAsyncStorage } from '../../utils/util'
import { useDispatch } from 'react-redux'
import { setUid } from '../../redux/authSlice'
import colors from '../../utils/colors'
import Feather from '@expo/vector-icons/Feather';

type Props = NativeStackScreenProps<AuthStackParams>

const Login = ({ navigation }: Props) => {

    const [email, setEmail] = useState("test@gmail.com")
    const [password, setPassword] = useState("123456")
    const [isLoading, setIsLoading] = useState(false)
    const [isSecureText, setIsSecureText] = useState(true)
    const dispatch = useDispatch()


    const handleLogin = async () => {
        setIsLoading(true)
        const auth = getAuth(app);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('Giriş başarılı:', user.uid);
            await saveUserIdToAsyncStorage(user.uid);
            dispatch(setUid(user.uid))
            console.log('Kullanıcı kimliği AsyncStorage\'e kaydedildi:', user.uid);
            return user.uid;
        } catch (error) {
            console.log('Giriş hatası:', error);
            Alert.alert(`Wrong email or password`)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: colors.PRIMARY_COLOR, fontSize: 60, fontWeight: 'bold', shadowOffset: { height: 5, width: 5 }, shadowColor: 'gray', shadowOpacity: 1, }}>Wazzup</Text>
                </View>
                <View style={{ flex: 3, justifyContent: 'center', alignItems: 'center' }}>
                    <TextInput value={email} onChangeText={setEmail} placeholder='E-mail' style={{ width: '70%', borderWidth: 1, borderRadius: 20, shadowOffset: { height: 2, width: 0 }, shadowColor: 'gray', shadowOpacity: 1, padding: 20, marginBottom: 20 }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', width: '70%', borderWidth: 1, borderRadius: 20, padding: 20, shadowOffset: { height: 2, width: 0 }, shadowColor: 'gray', shadowOpacity: 1, marginBottom: 15 }}>
                        <TextInput
                            onChangeText={(text) => setPassword(text)}
                            value={password}
                            placeholder='Password'
                            secureTextEntry={isSecureText}
                            style={{ flex: 1 }}
                        />
                        {isSecureText ? (
                            <Feather name="eye-off" size={24} color={colors.PRIMARY_COLOR} onPress={() => setIsSecureText(false)} />
                        ) : (
                            <Feather name="eye" size={24} color={colors.PRIMARY_COLOR} onPress={() => setIsSecureText(true)} />
                        )}
                    </View>
                    {isLoading ?
                        <ActivityIndicator style={{ marginTop: 50 }} size={24} color={"blue"} />
                        :
                        <TouchableOpacity onPress={handleLogin} style={{ marginTop: 30, borderRadius: 20, borderWidth: 1, padding: 10, paddingHorizontal: 50, backgroundColor: colors.PRIMARY_COLOR }}>
                            <Text style={{ color: '#fff' }}>
                                Sign in
                            </Text>
                        </TouchableOpacity>
                    }
                </View>
                <View style={{ flex: 1, alignItems: 'center' }}>
                    <TouchableOpacity style={{ marginVertical: 25 }}>
                        <Text style={{ paddingHorizontal: 10 }}>Forgot your password?</Text>
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                        <Text>
                            Don't have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={{ color: colors.PRIMARY_COLOR, fontWeight: 'bold', textDecorationLine: 'underline', fontStyle: 'italic' }}>
                                Create
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </TouchableWithoutFeedback>
    )
}

export default Login