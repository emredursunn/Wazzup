import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import HomeStackNav from "./HomeStackNav"
import { Feather, AntDesign, Entypo, MaterialCommunityIcons } from '@expo/vector-icons';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Explore from "../screens/Explore";
import Profile from "../screens/Profile";
import { Route, getFocusedRouteNameFromRoute } from "@react-navigation/native";
import StoryScreen from "../screens/Story";
import colors from "../utils/colors";

export type TabStackParams = {
    HomeStackNav: undefined,
    Explore: undefined,
    Profile: undefined,
    Story: undefined
}

const Tab = createBottomTabNavigator<TabStackParams>()


export const UserTabNav = () => {

    const getTabBarStyle = (route: Partial<Route<string>>) => {
        const routeName = getFocusedRouteNameFromRoute(route) ?? 'HomeStackNav';
        if (routeName === 'Chat') {
            return { display: 'none' };
        }
        return {};
    };
    return (
        <Tab.Navigator initialRouteName="HomeStackNav" screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: getTabBarStyle(route),
        })}
        >
            <Tab.Screen
                name="Story"
                component={StoryScreen}
                options={{
                    tabBarLabel: "Story",
                    tabBarLabelStyle: { fontSize: 14 },
                    tabBarActiveTintColor: colors.PRIMARY_COLOR,
                    tabBarInactiveTintColor: colors.PRIMARY_COLOR,
                    tabBarIcon: ({ focused, size }) => (
                        focused ? <MaterialCommunityIcons name="circle-slice-8" size={size} color= {colors.PRIMARY_COLOR} /> : <MaterialCommunityIcons name="circle-double" size={size} color={colors.PRIMARY_COLOR} />
                    ),
                }}
            />
            <Tab.Screen
                name="HomeStackNav"
                component={HomeStackNav}
                options={{
                    tabBarLabel: "Home",
                    tabBarLabelStyle: { fontSize: 14 },
                    tabBarActiveTintColor: colors.PRIMARY_COLOR,
                    tabBarInactiveTintColor: colors.PRIMARY_COLOR,
                    tabBarIcon: ({ focused, size }) => (
                        focused ? <Entypo name="home" size={size} color={colors.PRIMARY_COLOR} /> : <AntDesign name="home" size={size} color={colors.PRIMARY_COLOR} />
                    ),
                }}
            />
            <Tab.Screen
                name="Explore"
                component={Explore}
                options={{
                    tabBarLabel: "Explore",
                    tabBarLabelStyle: { fontSize: 14 },
                    tabBarActiveTintColor: colors.PRIMARY_COLOR,
                    tabBarInactiveTintColor: colors.PRIMARY_COLOR,
                    tabBarIcon: ({ focused, size }) => (
                        focused
                            ? <FontAwesome5 name="user-friends" size={size} color={colors.PRIMARY_COLOR} />
                            : <Feather name="users" size={size} color={colors.PRIMARY_COLOR} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                    tabBarLabel: "Profile",
                    tabBarLabelStyle: { fontSize: 14 },
                    tabBarActiveTintColor: colors.PRIMARY_COLOR,
                    tabBarInactiveTintColor: colors.PRIMARY_COLOR,
                    tabBarIcon: ({ focused, size }) => (
                        focused
                            ? <FontAwesome5 name="user-alt" size={size} color={colors.PRIMARY_COLOR} />
                            : <FontAwesome5 name="user" size={size} color={colors.PRIMARY_COLOR} />
                    ),
                }}
            />
        </Tab.Navigator>
    );

}