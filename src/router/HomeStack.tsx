import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {AUTHENTICATION_SCREENS} from '../config/SCREEN_CONFIG/authentication';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SCREEN_INFO from '../config/SCREEN_CONFIG/screenInfo';
import Feather from 'react-native-vector-icons/Feather';
import {useNavigation} from '@react-navigation/native';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
    const navigation = useNavigation();

    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#fff',
                },
                headerTitleStyle: {
                    fontSize: 16,
                },
                headerTitleAlign: 'center',
                headerTintColor: 'black',
                headerShadowVisible: false,
                headerBackTitleStyle: false,
            }}>
            <Stack.Group>
                {AUTHENTICATION_SCREENS.map((screen, index) => (
                    <Stack.Screen
                        key={index}
                        name={screen.name}
                        component={screen.component}
                        options={{
                            ...screen.options,
                            headerRight:
                                screen.name !== SCREEN_INFO.MAIN.key
                                    ? undefined
                                    : () => (
                                          <TouchableOpacity
                                              style={HomeStackStyles.alertView}
                                              onPress={() =>
                                                  navigation.navigate(
                                                      'Trang chủ',
                                                      {
                                                          screen: SCREEN_INFO
                                                              .LISTNOTIFICATION
                                                              .key,
                                                      },
                                                  )
                                              }>
                                              <View
                                                  style={
                                                      HomeStackStyles.alertDot
                                                  }
                                              />
                                              <FontAwesome
                                                  name='bell'
                                                  size={22}
                                                  color={'rgba(76, 175, 80, 1)'}
                                              />
                                          </TouchableOpacity>
                                      ),
                        }}
                    />
                ))}
            </Stack.Group>
        </Stack.Navigator>
    );
};

export default HomeStack;

const HomeStackStyles = StyleSheet.create({
    alertView: {
        position: 'relative',
        marginRight: 2,
    },
    alertDot: {
        position: 'absolute',
        right: 1,
        height: 10,
        width: 10,
        backgroundColor: 'red',
        borderRadius: 25,
        zIndex: 10,
    },
});
