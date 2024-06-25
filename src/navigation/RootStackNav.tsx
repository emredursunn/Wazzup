import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import UserStackNav from './HomeStackNav';
import AuthStackNav from './AuthStackNav';
import { getUserIdFromAsyncStorage } from '../utils/util';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { setUid } from '../redux/authSlice';
import { StatusBar } from 'react-native';
import { UserTabNav } from './UserTabNav';


const RootStackNav = () => {

    const isAuth = useSelector((state: RootState) => state.auth.uid)
    const dispatch = useDispatch()

    useEffect(() => {
        const checkAuth = async () => {
            const userId = await getUserIdFromAsyncStorage();
            dispatch(setUid((userId)));
        };
        checkAuth();
    }, []);

    return (
        <NavigationContainer>
            <StatusBar backgroundColor={'#065e58'} />
            {isAuth ? <UserTabNav /> : <AuthStackNav />}
        </NavigationContainer>
    );
};


export default RootStackNav;
