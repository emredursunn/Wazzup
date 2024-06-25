import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Login from "../screens/Auth/Login"
import Register from "../screens/Auth/Register"

export type AuthStackParams = {
    Register: undefined,
    Login: undefined
}

const AuthStackNav = () => {

    const AuthStack = createNativeStackNavigator<AuthStackParams>()

    return (
            <AuthStack.Navigator screenOptions={{headerTitleAlign:'center',headerStyle:{'backgroundColor':'#065e58'}, headerTitleStyle:{'color':'#fff'}}}>
                <AuthStack.Screen name='Login' component={Login} />
                <AuthStack.Screen name='Register' component={Register} />
            </AuthStack.Navigator>
    )
}

export default AuthStackNav