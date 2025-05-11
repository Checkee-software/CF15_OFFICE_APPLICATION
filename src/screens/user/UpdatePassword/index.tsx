'use client';

import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Animated,
} from 'react-native';
import Backdrop from '../../subscreen/Loading/index2';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {useAuthStore} from '../../../stores/authStore';

export default function UpdatePassword() {
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showSuccess, setShowSuccess] = React.useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    const successAnimation = React.useRef(new Animated.Value(0)).current;

    const {userInfo, updatePassword, isLoading} = useAuthStore();

    const isMinLength = newPassword.length >= 8;
    const hasCurrentPassword = currentPassword.length > 0;
    const hasNumber = /[0-9]/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword);
    const isMatch = newPassword === confirmPassword;

    const isFormValid =
        isMinLength &&
        hasCurrentPassword &&
        hasNumber &&
        hasUppercase &&
        hasSpecialChar &&
        isMatch;

    const handleConfirm = async () => {
        const updateUserAccount = {
            username: userInfo.username,
            password: currentPassword,
            newPassword: newPassword,
        };

        const resultUpdatePassword = await updatePassword(updateUserAccount);

        if (resultUpdatePassword) {
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowCurrentPassword(false);
            setShowNewPassword(false);
            setShowConfirmPassword(false);

            setShowSuccess(true);
            Animated.timing(successAnimation, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            setTimeout(() => {
                Animated.timing(successAnimation, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => setShowSuccess(false));
            }, 3000);
        }
    };

    const dismissSuccess = () => {
        Animated.timing(successAnimation, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => setShowSuccess(false));
    };

    const toggleCurrentPasswordVisibility = () => {
        setShowCurrentPassword(!showCurrentPassword);
    };

    const toggleNewPasswordVisibility = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.section}>
                    <Text style={styles.label}>
                        Tài khoản <Text style={styles.required}>*</Text>
                    </Text>
                    <Text style={styles.accountText}>{userInfo.username}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>
                        Mật khẩu hiện tại <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputContainerCurrentPassword}>
                        <TextInput
                            style={styles.inputWithIcon}
                            secureTextEntry={!showCurrentPassword}
                            value={currentPassword}
                            onChangeText={setCurrentPassword}
                        />
                        {currentPassword.length > 0 && (
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={toggleCurrentPasswordVisibility}>
                                <AntDesign
                                    name={showCurrentPassword ? 'eye' : 'eyeo'}
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                        )}
                    </View>

                    <Text style={styles.label}>
                        Mật khẩu mới <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputWithIcon}
                            placeholder='Nhập mật khẩu mới'
                            secureTextEntry={!showNewPassword}
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        {newPassword.length > 0 && (
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={toggleNewPasswordVisibility}>
                                <AntDesign
                                    name={showNewPassword ? 'eye' : 'eyeo'}
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.passwordRules}>
                        <Text
                            style={[
                                styles.ruleText,
                                isMinLength && styles.ruleValid,
                            ]}>
                            - Độ dài mật khẩu ít nhất là 8 chữ số
                        </Text>
                        <Text
                            style={[
                                styles.ruleText,
                                hasNumber && styles.ruleValid,
                            ]}>
                            - Có chứa ít nhất một chữ số
                        </Text>
                        <Text
                            style={[
                                styles.ruleText,
                                hasUppercase && styles.ruleValid,
                            ]}>
                            - Có chứa ít nhất một chữ cái viết hoa
                        </Text>
                        <Text
                            style={[
                                styles.ruleText,
                                hasSpecialChar && styles.ruleValid,
                            ]}>
                            - Có chứa ký tự đặc biệt (ví dụ *88k@l...)
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.label}>
                        Xác nhận mật khẩu mới{' '}
                        <Text style={styles.required}>*</Text>
                    </Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputWithIcon}
                            placeholder='Xác nhận mật khẩu mới'
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                        />
                        {confirmPassword.length > 0 && (
                            <TouchableOpacity
                                style={styles.eyeIcon}
                                onPress={toggleConfirmPasswordVisibility}>
                                <AntDesign
                                    name={showConfirmPassword ? 'eye' : 'eyeo'}
                                    size={20}
                                    color='#666'
                                />
                            </TouchableOpacity>
                        )}
                    </View>
                    {!isMatch && confirmPassword.length > 0 && (
                        <Text style={styles.errorText}>
                            Mật khẩu xác nhận không khớp
                        </Text>
                    )}

                    {newPassword.length !== 0 &&
                        confirmPassword.length !== 0 &&
                        newPassword === confirmPassword &&
                        currentPassword.length === 0 && (
                            <Text style={styles.errorText}>
                                Bạn chưa nhập mật khẩu hiện tại
                            </Text>
                        )}
                </View>

                <TouchableOpacity
                    style={[
                        styles.confirmButton,
                        !isFormValid && styles.confirmButtonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!isFormValid}>
                    <Text style={styles.confirmButtonText}>Xác nhận</Text>
                </TouchableOpacity>
            </ScrollView>

            {showSuccess && (
                <Animated.View
                    style={[
                        styles.successNotification,
                        {
                            opacity: successAnimation,
                            transform: [
                                {
                                    translateY: successAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [50, 0],
                                    }),
                                },
                            ],
                        },
                    ]}>
                    <Text style={styles.successText}>
                        Đổi mật khẩu thành công!
                    </Text>
                    <TouchableOpacity
                        onPress={dismissSuccess}
                        style={styles.closeButton}>
                        <AntDesign name='close' size={20} color='#fff' />
                    </TouchableOpacity>
                </Animated.View>
            )}

            <Backdrop open={isLoading} />
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flexGrow: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    section: {
        marginBottom: 25,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#000',
    },
    required: {
        color: 'red',
    },
    accountText: {
        fontSize: 16,
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
        borderWidth: 2,
        borderColor: '#ccc',
        color: '#555',
    },
    inputContainerCurrentPassword: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    inputContainer: {
        position: 'relative',
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputWithIcon: {
        flex: 1,
        fontSize: 16,
        padding: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
        color: '#000',
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        padding: 5,
    },
    input: {
        fontSize: 16,
        padding: 12,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 5,
        backgroundColor: '#fff',
        color: '#000',
    },
    passwordRules: {
        marginTop: 10,
        paddingLeft: 10,
    },
    ruleText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3,
    },
    ruleValid: {
        color: '#4CAF50',
    },
    confirmButton: {
        backgroundColor: '#4CAF50',
        // width: 372,
        height: 44,
        justifyContent: 'center',
        borderRadius: 22,
        alignItems: 'center',
    },
    confirmButtonDisabled: {
        backgroundColor: '#ccc',
    },
    confirmButtonText: {
        color: '#fff',
        fontSize: 18,
    },
    errorText: {
        color: 'red',
        marginTop: 6,
        fontSize: 14,
    },
    successNotification: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#4CAF50',
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    successText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
});
