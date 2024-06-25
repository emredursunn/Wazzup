import { View, Text, ScrollView, TextInput, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native'
import React, { useState } from 'react'
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { app } from '../../../firebaseConfig';
import { createUser, saveUserIdToAsyncStorage } from '../../utils/util';
import Feather from '@expo/vector-icons/Feather';
import { AntDesign } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setUid } from '../../redux/authSlice';
import colors from '../../utils/colors';

const Register = () => {

    const [isSecureText, setIsSecureText] = useState(true)
    const [isLoading, setIsLoading] = useState(false);
    const [formState, setFormState] = useState({
        firstname: "",
        lastname: "",
        email: "test@gmail.com",
        password: "123456",
        phone: 555555555,
    });

    const dispatch = useDispatch()


    const handleInputChange = (name: string, value: any) => {
        setFormState({ ...formState, [name]: value });
    };

    const handleRegister = async () => {
        setIsLoading(true)
        const auth = getAuth(app);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, formState.email, formState.password);
            const user = userCredential.user;
            console.log('Kayıt başarılı:', user.uid);

            // Kullanıcı kayıt olduktan sonra AsyncStorage'e kullanıcı kimliğini kaydet
            await saveUserIdToAsyncStorage(user.uid);
            createUser({ userName: formState.firstname + " " + formState.lastname, uid: user.uid, phone: formState.phone })
            dispatch(setUid(user.uid))
            return user.uid; // Başarılı kayıt yapıldığında kullanıcı kimliğini döndür
        } catch (error) {
            console.log('Kayıt hatası:', error);
            throw error; // Hata durumunda hatayı yeniden fırlat
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

            <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center' }}>
                <TextInput
                    onChangeText={(text) => handleInputChange('firstname', text)}
                    value={formState.firstname}
                    placeholder='Firstname'
                    style={{ marginTop:20,width: '80%', borderWidth: 1, borderRadius: 20, padding: 20, shadowOffset: { height: 2, width: 0 }, shadowColor: 'gray', shadowOpacity: 1, marginBottom: 15 }}
                />
                <TextInput
                    onChangeText={(text) => handleInputChange('lastname', text)}
                    value={formState.lastname}
                    placeholder='Lastname'
                    style={{ width: '80%', borderWidth: 1, borderRadius: 20, padding: 20, shadowOffset: { height: 2, width: 0 }, shadowColor: 'gray', shadowOpacity: 1, marginBottom: 15 }}
                />
                <TextInput
                    onChangeText={(text) => handleInputChange('email', text)}
                    value={formState.email}
                    placeholder='E-mail Address'
                    style={{ width: '80%', borderWidth: 1, borderRadius: 20, padding: 20, shadowOffset: { height: 2, width: 0 }, shadowColor: 'gray', shadowOpacity: 1, marginBottom: 15 }}
                />
                <View style={{ flexDirection: 'row',  alignItems: 'center', width: '80%', borderWidth: 1, borderRadius: 20, padding: 20, shadowOffset: { height: 2, width: 0 }, shadowColor: 'gray', shadowOpacity: 1, marginBottom: 15 }}>
                    <TextInput
                        onChangeText={(text) => handleInputChange('password', text)}
                        value={formState.password}
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

                <View style={{ flexDirection: 'row', alignItems: 'center', width: '80%', borderWidth: 1, borderRadius: 20, padding: 20, shadowOffset: { height: 2, width: 0 }, shadowColor: 'gray', shadowOpacity: 1, marginBottom: 15 }}>
                    <TextInput
                        style={{ flex: 1 }}
                        onChangeText={(text) => handleInputChange('phone', text)}
                        value={formState.phone.toString()}
                        placeholder='Phone'
                    />
                </View>

                {isLoading ? (
                    <ActivityIndicator style={{ marginTop: 50 }} size={24} color={"blue"} />
                ) : (
                    <TouchableOpacity onPress={handleRegister} style={{ marginTop: 50, marginBottom: 25, borderRadius: 20, borderWidth: 2, padding: 10, paddingHorizontal: 50, backgroundColor: colors.PRIMARY_COLOR }}>
                        <Text style={{color:'#fff'}}>Sign Up</Text>
                    </TouchableOpacity>
                )}
                <Text>Or create account using Google</Text>
                <TouchableOpacity style={{ borderWidth: 1, borderRadius: 10, marginVertical: 15, padding: 10 }}>
                    <AntDesign name="google" size={24} color={colors.PRIMARY_COLOR} />
                </TouchableOpacity>
            </ScrollView>
        </TouchableWithoutFeedback>
    );
}

export default Register