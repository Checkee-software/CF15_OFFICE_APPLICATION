import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
    useCameraPermission,
    useCameraDevice,
    Camera,
} from 'react-native-vision-camera';

const GardenScan = ({navigation, route}) => {
    const {navigateNext} = route.params || {};

    const [isReady, setIsReady] = useState(false);

    const {hasPermission, requestPermission} = useCameraPermission();

    // doesnt show first render
    const [cameraStyles, setCameraStyles] = useState<ViewStyle>({
        width: 0,
        height: 0,
    });

    const device = useCameraDevice('back');

    useEffect(() => {
        if (!hasPermission) {
            requestPermission();
        }
    }, [hasPermission]);

    useEffect(() => {
        if (device) {
            setTimeout(() => setIsReady(true), 100); // Chờ Camera mount xong
        }
    }, [device]);

    return (
        <View style={CameraScannerStyles.container}>
            {isReady ? (
                hasPermission ? (
                    <>
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
                                style={
                                    CameraScannerStyles.confirmManualSearchBtn
                                }
                                onPress={() =>
                                    navigation.navigate(navigateNext)
                                }>
                                <Text
                                    style={
                                        CameraScannerStyles.confirmManualSearchText
                                    }>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </>
                ) : (
                    <View
                        style={CameraScannerStyles.viewRequestCameraPermission}>
                        <TouchableOpacity onPress={() => requestPermission()}>
                            <Text>Cấp quyền camera</Text>
                        </TouchableOpacity>
                    </View>
                )
            ) : null}
        </View>
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
});

export default GardenScan;
