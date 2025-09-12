/* eslint-disable react/no-unstable-nested-components */
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Loading from "../screens/subscreen/Loading";
import SCREEN_INFO from "../config/SCREEN_CONFIG/screenInfo";
import { UNAUTHENTICATION_SCREENS } from "../config/SCREEN_CONFIG/unauthentication";
import { AUTHENTICATION_SCREENS } from "../config/SCREEN_CONFIG/authentication";
import BottomTabsNavigator from "./BottomTabsNavigator";
import { useAuthStore } from "../stores/authStore";
import Feather from "react-native-vector-icons/Feather";
import { TouchableOpacity } from "react-native";

const Stack = createNativeStackNavigator();

export default function Router() {
    const { isLogin } = useAuthStore();

    const isLoggedIn: unknown = isLogin;

    const renderStackScreenGroup = () => {
        switch (isLoggedIn) {
            case undefined:
                // 🕵🏼‍♀️ Màn đang kiểm tra xem user đã login hay
                return (
                    <Stack.Screen
                        name={SCREEN_INFO.LOADING.key}
                        component={Loading}
                        options={{
                            headerShown: false,
                        }}
                    />
                );
            case false:
                // 💥 Trường hợp user chưa đăng nhập
                return (
                    <Stack.Group>
                        {UNAUTHENTICATION_SCREENS.map((screen, index) => (
                            <Stack.Screen
                                key={index}
                                name={screen.name}
                                component={screen.component}
                                options={screen.options}
                            />
                        ))}
                    </Stack.Group>
                );

            case true:
                // 🌈 MAIN FLOW : user đã đăng nhập. Áp dụng tất cả các role
                return (
                    <>
                        <Stack.Screen
                            name="Home"
                            component={BottomTabsNavigator}
                            options={{ headerShown: false }}
                        />

                        <Stack.Group>
                            {AUTHENTICATION_SCREENS.map((screen, index) => (
                                <Stack.Screen
                                    key={index}
                                    name={screen.name}
                                    component={screen.component}
                                    options={(navigation) => ({
                                        ...screen.options,
                                        headerLeft: () => (
                                            <TouchableOpacity
                                                onPress={() =>
                                                    navigation.navigation.goBack()
                                                }>
                                                <Feather
                                                    name="chevron-left"
                                                    size={24}
                                                />
                                            </TouchableOpacity>
                                        ),
                                    })}
                                />
                            ))}
                        </Stack.Group>
                    </>
                );

            default:
                return null;
        }
    };

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: "white",
                    },
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: 700,
                        color: "rgba(0, 0, 0, 1)",
                    },
                    headerTitleAlign: "center",
                    headerTintColor: "black",
                    headerShadowVisible: false,
                }}>
                {renderStackScreenGroup()}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
