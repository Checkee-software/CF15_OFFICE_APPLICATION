import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    ImageBackground,
    Platform,
    KeyboardAvoidingView,
    ActivityIndicator,
} from 'react-native';
import deviceInfo from 'react-native-device-info';
import images from '../../../assets/images';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import Feather from 'react-native-vector-icons/Feather';
import {useAuthStore} from '../../../stores/authStore';
import {Dimensions} from 'react-native';
// import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import colors from '@/assets/colors';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';

import LicenseModal from './Components/LicenseModal';
import AsyncStorage from '@react-native-async-storage/async-storage';

const {width} = Dimensions.get('window');

export default function Login({navigation}: any) {
    /* store */
    const {login, isLoading} = useAuthStore();

    /* create storage */

    /* create state */
    const [showPassword, setShowPassword] = useState(false);
    const [showLoginForm, setShowLoginForm] = useState(false);
    const [isChecked, setIsChecked] = useState<boolean>(false);
    const [isShowLicense, setIsShowLicense] = useState<boolean>(false);
    const [isLicenseLoading, setIsLicenseLoading] = useState<boolean>(false);
    const [license, setLicense] = useState<string>('');
    const [userAccount, setUserAccount] = useState({
        username: 'nguyenvanhoai', //cf15office lamphucf15
        phoneNumber: '',
        password: '00000000', //CF15@FFICE2025 123456789A@
    });

    // useEffect(() => {
    //     const clear = async () => await AsyncStorage.removeItem("LICENSE");
    //     clear();
    // }, [])

    useEffect(() => {
        const makeLicense = async (): Promise<void> => {
            const isAccept = await AsyncStorage.getItem('LICENSE');
            if (!isAccept) {
                setLicense('');
                onShowLicense();
                return;
            }

            setLicense(isAccept);
        };

        makeLicense();
    }, [license]);

    const onShowLicense = () => setIsShowLicense(true);

    const onHideLicense = () => setIsShowLicense(false);

    const onChecked = () => setIsChecked(!isChecked);

    const onSubmitLicense = async () => {
        try {
            setIsLicenseLoading(true);

            await AsyncStorage.setItem('LICENSE', '1');
            setTimeout(() => {
                setLicense('1');
                setIsLicenseLoading(false);
                setIsChecked(false);
                onHideLicense();
            }, 1000);
        } catch (error) {
            console.log('submit-license-error: ', error);
        }
    };

    const onChangeUserName = (value: string) => {
        setUserAccount({...userAccount, username: value});
    };

    const onChangePassword = (value: string) => {
        setUserAccount({...userAccount, password: value});
    };

    const handleLogin = async () => {
        if (!userAccount.username || !userAccount.password) {
            Alert.alert('Thông báo', 'Bạn chưa nhập tài khoản hoặc mật khẩu!', [
                {text: 'OK'},
            ]);
        } else {
            const isPhone = /^[0-9]{9,11}$/.test(userAccount.username);

            const _userAccount = {
                username: isPhone ? '' : userAccount.username,
                phoneNumber: isPhone ? userAccount.username : '',
                password: userAccount.password,
            };

            login(_userAccount);
        }
    };

    const navigateToTracking = () => {
        return navigation.navigate(SCREEN_INFO.AUTOMATIC_TRACING.key);
    };

    return (
        <View style={LoginStyles.container}>
            <ImageBackground
                source={images.backgroundLogin}
                style={LoginStyles.welcomeSceenBackground}>
                <KeyboardAvoidingView
                    style={LoginStyles.warpwelcomeSceenAndBlurImage}
                    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
                    behavior='padding'>
                    <ImageBackground
                        source={images.backgroundLogin}
                        style={LoginStyles.blurImageStyle}
                        blurRadius={Platform.OS === 'ios' ? 10 : 6}>
                        <View style={LoginStyles.welcomeSceen}>
                            <Image
                                source={images.logoCF15}
                                resizeMode='contain'
                                style={LoginStyles.logo}
                            />

                            <Text style={LoginStyles.labelBrand}>
                                CF15 OFFICE
                            </Text>

                            {showLoginForm ? (
                                <View style={LoginStyles.loginForm}>
                                    <Text style={LoginStyles.loginText}>
                                        ĐĂNG NHẬP
                                    </Text>

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
                                                name={
                                                    showPassword
                                                        ? 'eye-off'
                                                        : 'eye'
                                                }
                                                color='white'
                                                size={20}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        disabled={isLoading}
                                        style={LoginStyles.btnLogin}
                                        onPress={handleLogin}>
                                        {isLoading ? (
                                            <ActivityIndicator color='#fff' />
                                        ) : (
                                            <Text style={LoginStyles.btnText}>
                                                BẮT ĐẦU
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <>
                                    <View style={LoginStyles.welcomeContainer}>
                                        <Text style={LoginStyles.welcomeTitle}>
                                            XIN CHÀO!
                                        </Text>
                                        <Text
                                            style={LoginStyles.welcomeContent}>
                                            Chào mừng bạn quay trở lại hệ thống
                                            quản lý CF15 Office.
                                        </Text>
                                    </View>

                                    <View style={LoginStyles.welcomeWarpButton}>
                                        <TouchableOpacity
                                            style={LoginStyles.btnLogin}
                                            onPress={() => {
                                                if (!license) {
                                                    onShowLicense();
                                                    return;
                                                }
                                                setShowLoginForm(
                                                    !showLoginForm,
                                                );
                                            }}>
                                            <Text style={LoginStyles.btnText}>
                                                ĐĂNG NHẬP
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            onPress={navigateToTracking}
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
                    </ImageBackground>
                </KeyboardAvoidingView>
            </ImageBackground>

            <View style={LoginStyles.version}>
                <Text style={LoginStyles.textVersion}>
                    Version {deviceInfo.getVersion()}
                </Text>
            </View>

            {isShowLicense && (
                <LicenseModal
                    visible
                    onClose={onHideLicense}
                    onShow={onShowLicense}
                    onChecked={onChecked}
                    isChecked={isChecked}
                    onSubmit={onSubmitLicense}
                    isLoading={isLicenseLoading}
                />
            )}
        </View>
    );
}

const LoginStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    welcomeSceenBackground: {
        flex: 1,
        justifyContent: 'center',
    },
    warpwelcomeSceenAndBlurImage: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    welcomeSceen: {
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(245, 245, 245, 1)',
        backgroundColor: 'rgba(245, 245, 245, 0.25)',
        borderRadius: 16,
        alignItems: 'center',
    },
    blurImageStyle: {
        overflow: 'hidden',
        borderRadius: 16,
        width: width - 48,
        resizeMode: 'contain',
        justifyContent: 'center',
    },
    logo: {
        width: 92,
        height: 92,
        aspectRatio: 1,
    },
    labelBrand: {
        marginTop: 6,
        color: 'rgba(255, 255, 255, 1)',
        fontWeight: 'bold',
        fontSize: 24,
    },
    welcomeContainer: {
        marginTop: 20,
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
        marginTop: 5,
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
        marginVertical: 35,
        width: '100%',
    },
    loginText: {
        marginBottom: 10,
        color: 'rgba(255, 255, 255, 1)',
        fontWeight: '500',
        textAlign: 'center',
    },
    warpInputAndIcon: {
        borderBottomColor: 'rgba(245, 245, 245, 1)',
        borderBottomWidth: 1,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 0,
        gap: 8,
        position: 'relative',
        minHeight: 44,
    },
    loginInput: {
        flex: 1,
        color: '#fff',
    },
    hidePasswordIcon: {
        position: 'absolute',
        right: 0,
    },
    manual: {
        // flex: 1,
        marginTop: 24,
        textAlign: 'center',
        color: colors.background,
        textDecorationLine: 'underline',
    },
});
