import React, {useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Alert,
} from 'react-native';
import images from '../../../assets/images';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import {useAuth} from '../../../contexts/AuthContext';
//api
import {signIn} from '../../../service/UserService';

export default function Login() {
    const {login} = useAuth();

    const [showLoginForm, setShowLoginForm] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [userAccount, setUserAccount] = useState({
        username: '', //cf15office
        phoneNumber: '',
        password: '', //CF15@FFICE2025
    });

    const onChangeUserName = value => {
        setUserAccount({...userAccount, username: value});
    };

    const onChangePassword = value => {
        setUserAccount({...userAccount, password: value});
    };

    const handleLogin = async () => {
        if (!userAccount.username || !userAccount.password) {
            Alert.alert('Thông báo', 'Bạn chưa nhập tài khoản hoặc mật khẩu!', [
                {text: 'OK'},
            ]);
        }

        const isPhone = /^[0-9]{9,11}$/.test(userAccount.username);

        const _userAccount = {
            username: isPhone ? '' : userAccount.username,
            phoneNumber: isPhone ? userAccount.username : '',
            password: userAccount.password,
        };

        try {
            const responseSignIn = await signIn(_userAccount);
            console.log(responseSignIn);
            if (responseSignIn.status !== 200) {
                Alert.alert(responseSignIn.data);
            } else {
                const userInfo = {
                    fullName: responseSignIn.data.data.fullName,
                    userType: responseSignIn.data.data.userType,
                };

                login(userInfo);
            }
        } catch (error) {
            //Alert.alert(res)
            console.log(error);
        }
    };

    return (
        <ScrollView
            keyboardShouldPersistTaps='handled'
            contentContainerStyle={{flex: 1}}>
            <View style={LoginStyles.container}>
                <Image
                    source={images.backgroundLogin}
                    style={LoginStyles.welcomeSceenBackground}
                    blurRadius={2}
                    resizeMode='contain'
                />
                <View style={LoginStyles.welcomeSceen}>
                    <Image
                        source={images.logoCF15}
                        resizeMode='contain'
                        style={LoginStyles.logo}
                    />

                    <Text style={LoginStyles.labelBrand}>CF15 OFFICE</Text>

                    {showLoginForm ? (
                        <View style={LoginStyles.loginForm}>
                            <Text style={LoginStyles.loginText}>ĐĂNG NHẬP</Text>

                            <View style={LoginStyles.warpInputAndIcon}>
                                <FontAwesome5
                                    name='user-circle'
                                    color='white'
                                    size={20}
                                />
                                <TextInput
                                    value={userAccount.username}
                                    onChangeText={onChangeUserName}
                                    placeholder='TÀI KHOẢN HOẶC SĐT'
                                    autoCapitalize='none'
                                    style={LoginStyles.loginInput}
                                    placeholderTextColor={
                                        'rgba(245, 245, 245, 1)'
                                    }
                                />
                            </View>

                            <View style={LoginStyles.warpInputAndIcon}>
                                <MaterialIcons
                                    name='key'
                                    color='white'
                                    size={20}
                                />
                                <TextInput
                                    value={userAccount.password}
                                    onChangeText={onChangePassword}
                                    placeholder='MẬT KHẨU'
                                    autoCapitalize='none'
                                    style={LoginStyles.loginInput}
                                    secureTextEntry={
                                        showPassword ? false : true
                                    }
                                    placeholderTextColor={
                                        'rgba(245, 245, 245, 1)'
                                    }
                                />

                                <TouchableOpacity
                                    style={LoginStyles.hidePasswordIcon}
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }>
                                    <Feather
                                        name={showPassword ? 'eye-off' : 'eye'}
                                        color='white'
                                        size={20}
                                    />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={LoginStyles.btnLogin}
                                onPress={handleLogin}>
                                <Text style={LoginStyles.btnText}>BẮT ĐẦU</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={LoginStyles.welcomeContainer}>
                                <Text style={LoginStyles.welcomeTitle}>
                                    XIN CHÀO!
                                </Text>
                                <Text style={LoginStyles.welcomeContent}>
                                    Chào mừng bạn quay trở lại hệ thống quản lý
                                    CF15 Office.
                                </Text>
                            </View>

                            <View style={LoginStyles.welcomeWarpButton}>
                                <TouchableOpacity
                                    style={LoginStyles.btnLogin}
                                    onPress={() =>
                                        setShowLoginForm(!showLoginForm)
                                    }>
                                    <Text style={LoginStyles.btnText}>
                                        ĐĂNG NHẬP
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={LoginStyles.btnRetriveInfo}>
                                    <MaterialIcons
                                        name='qr-code-scanner'
                                        size={22}
                                        color='white'
                                    />
                                    <Text style={LoginStyles.btnText}>
                                        TRUY XUẤT TỰ ĐỘNG
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </>
                    )}
                </View>

                <View style={LoginStyles.version}>
                    <Text style={LoginStyles.textVersion}>Version 1.0.0</Text>
                </View>
            </View>
        </ScrollView>
    );
}

const LoginStyles = StyleSheet.create({
    container: {
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
    },
    welcomeSceenBackground: {
        position: 'absolute',
    },
    welcomeSceen: {
        marginTop: 10,
        marginHorizontal: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: '#fff',
        backgroundColor: 'rgba(245, 245, 245, 0.25)',
        borderRadius: 10,
        alignItems: 'center',
    },
    logo: {
        width: 76,
        height: 76,
        aspectRatio: 1,
    },
    labelBrand: {
        marginTop: 6,
        color: 'rgba(255, 255, 255, 1)',
        fontWeight: 'bold',
        fontSize: 18,
    },
    welcomeContainer: {
        marginTop: 25,
        justifyContent: 'flex-start',
    },
    welcomeTitle: {
        color: 'rgba(255, 255, 255, 1)',
        fontWeight: '500',
        marginBottom: 8,
    },
    welcomeContent: {
        color: 'rgba(255, 255, 255, 1)',
        fontSize: 13,
    },
    welcomeWarpButton: {
        marginVertical: 30,
        width: '100%',
    },
    btnLogin: {
        backgroundColor: 'rgba(76, 175, 80, 1)',
        paddingVertical: 10,
        borderRadius: 25,
    },
    btnText: {
        color: 'rgba(255, 255, 255, 1)',
        fontWeight: '500',
        textAlign: 'center',
        alignItems: 'center',
    },
    btnRetriveInfo: {
        gap: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        marginTop: 20,
        borderRadius: 25,
        paddingVertical: 10,
        borderWidth: 1,
        borderColor: 'rgba(245, 245, 245, 1)',
    },
    version: {
        bottom: 10,
        position: 'absolute',
        left: 0,
        right: 0,
    },
    textVersion: {
        color: '#fff',
        fontSize: 12,
        textAlign: 'center',
    },
    loginForm: {
        marginVertical: 40,
        width: '100%',
    },
    loginText: {
        marginBottom: 6,
        color: 'rgba(255, 255, 255, 1)',
        fontWeight: '500',
        textAlign: 'center',
    },
    warpInputAndIcon: {
        borderBottomColor: 'rgba(245, 245, 245, 1)',
        borderBottomWidth: 1,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        gap: 5,
        position: 'relative',
    },
    loginInput: {
        flex: 1,
        color: '#fff',
    },
    hidePasswordIcon: {
        position: 'absolute',
        right: 10,
    },
});
