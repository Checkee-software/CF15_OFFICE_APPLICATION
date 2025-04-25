import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Linking,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useCameraDevice, Camera} from 'react-native-vision-camera';

const GardenScan = ({navigation, route}) => {
    const {navigateNext} = route.params || {};

    const [permissionState, setPermissionState] = useState();

    // doesnt show first render
    const [cameraStyles, setCameraStyles] = useState<ViewStyle>({
        width: 0,
        height: 0,
    });

    const device = useCameraDevice('back');

    const getPermission = async () => {
        const permission = await Camera.requestCameraPermission();

        if (permission === 'denied') {
            await Linking.openSettings();
        }

        setPermissionState(permission);
    };

    useEffect(() => {
        getPermission();
    }, []);

    return (
        <>
            {permissionState === 'granted' && device != null ? (
                <View style={CameraScannerStyles.container}>
                    <Camera
                        device={device}
                        isActive={true}
                        style={cameraStyles}
                        onLayout={() => {
                            setCameraStyles(CameraScannerStyles.camera);
                        }}
                    />

                    <View style={CameraScannerStyles.inputView}>
                        <TextInput
                            placeholder='Nhập mã khu vườn'
                            placeholderTextColor={'#808080'}
                            style={CameraScannerStyles.inputManualSearch}
                        />

                        <TouchableOpacity
                            style={CameraScannerStyles.confirmManualSearchBtn}
                            onPress={() => navigation.navigate(navigateNext)}>
                            <Text
                                style={
                                    CameraScannerStyles.confirmManualSearchText
                                }>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={CameraScannerStyles.requestPermissionContainer}>
                    <Text style={CameraScannerStyles.requestPermissionText}>
                        {permissionState !== 'granted'
                            ? 'Bạn cần cấp quyền truy cập camera để có thể sử dụng chức năng này'
                            : 'Đang tải camera...'}
                    </Text>
                </View>
            )}
        </>
    );
};

const CameraScannerStyles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    camera: {
        flex: 1,
        borderRadius: 8,
    },
    inputView: {
        flex: 1,
        alignItems: 'center',
        gap: 14,
    },
    inputManualSearch: {
        textAlignVertical: 'center',
        textAlign: 'center',
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderColor: '#D3D3D3',
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginTop: 22,
        color: '#212121',
        fontWeight: 500,
        fontSize: 14,
    },
    confirmManualSearchBtn: {
        backgroundColor: '#4CAF50',
        borderRadius: 24,
        borderColor: '#D3D3D3',
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    confirmManualSearchText: {
        color: '#F5F5F5',
        fontWeight: 500,
        fontSize: 16,
    },
    viewRequestCameraPermission: {
        backgroundColor: '#fff',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    notHavePermission: {
        backgroundColor: 'black',
    },
    requestPermissionContainer: {
        paddingHorizontal: 20,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    requestPermissionText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default GardenScan;
