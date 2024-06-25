import { View, Text, FlatList, TextInput, TouchableOpacity, Dimensions, RefreshControl } from 'react-native'
import React, { useEffect, useState } from 'react'
import { User } from '../utils/types'
import { createNewChat, getAllUsers, getMyFriendsId } from '../utils/util'
import UserComponent from '../components/UserComponent'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { AntDesign } from '@expo/vector-icons';
import colors from '../utils/colors'

const Explore = () => {
    const [allUsers, setAllUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const uid = useSelector((state: RootState) => state.auth.uid)
    const dimensions = Dimensions.get("screen")
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState<Date>(new Date())
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const users = await getAllUsers();
                const myFriends = await getMyFriendsId(uid!)
                const filteredUsers = users.filter((usr) => usr.userId !== uid && !myFriends?.includes(usr.userId));
                setAllUsers(filteredUsers);
                setFilteredUsers(filteredUsers);
            } catch (error) {
                console.log("Fetch users error:", error);
            }
        };
        fetchUsers();
    }, [refresh]);

    const handleSearch = () => {
        const users = allUsers.filter((usr) => usr.phone.toString().includes(search.toString()))
        setFilteredUsers(users)
    }

    const onRefresh = () => {
        setRefreshing(true);
        setRefresh(new Date());
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const renderItem = ({ item, index }: { item: User, index: number }) => (
        <UserComponent key={index} userId={item.userId} />
    )

    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 30, fontWeight: 'bold', alignSelf: 'flex-start', margin: 20 }}>Get Contacts</Text>
            <View style={{ marginVertical: 20, width: dimensions.width / 1.1, flexDirection: 'row', alignSelf: 'center', borderColor: colors.PRIMARY_COLOR, borderWidth: 2, borderRadius: 12 }}>
                <TextInput
                    value={search}
                    onChangeText={(text) => setSearch(text)}
                    placeholder='Search phone number...'
                    style={{ flex: 1, backgroundColor: 'white', padding: 10, borderTopLeftRadius: 10, borderBottomLeftRadius: 10 }}
                />
                <TouchableOpacity onPress={handleSearch} style={{ backgroundColor: colors.PRIMARY_COLOR, padding: 12, borderTopEndRadius: 10, borderBottomRightRadius: 10, shadowOffset: { height: 2, width: 2 }, shadowColor: 'white', shadowOpacity: 0.8 }}>
                    <AntDesign name="search1" size={24} color="#fff" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={filteredUsers}
                renderItem={renderItem}
                keyExtractor={item => item.userId}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    )
}

export default Explore
