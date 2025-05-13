import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Linking,
    Image,
    ViewStyle,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
    useCameraDevice,
    Camera,
    CameraPermissionRequestResult,
    useCodeScanner,
} from 'react-native-vision-camera';
import useGardenStore from '@/stores/gardenStore';
import images from '../../../assets/images';

const GardenScan = ({navigation, route}: any) => {
    const [notFound, setNotFound] = useState(false);
    const [codeInput, setCodeInput] = useState('');
    const [hasScanned, setHasScanned] = useState(false);

    const {navigateNext} = route.params || {};
    const {searchGardens} = useGardenStore();

    const handleSearch = async (code: string) => {
        if (!code) return;

        console.log('[SEARCH] Searching for garden with code:', code);
        await searchGardens(code);

        const updatedGardens = useGardenStore.getState().gardens;
        console.log('[RESULT] Garden found:', updatedGardens);

        if (updatedGardens) {
            setNotFound(false);
            navigation.navigate(navigateNext, {
                garden: updatedGardens,
            });
        } else {
            setNotFound(true);
            setHasScanned(false);
        }
    };

    const codeScanner = useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: async codes => {
            if (hasScanned) return;

            const scannedCode = codes[0]?.value?.trim();
            if (!scannedCode) return;

            setHasScanned(true);
            setCodeInput(scannedCode);
            await handleSearch(scannedCode);
        },
    });

    const handleConfirm = async () => {
        const code = codeInput.trim();
        if (!code) return;

        setHasScanned(true);
        await handleSearch(code);
    };

    const [permissionState, setPermissionState] =
        useState<CameraPermissionRequestResult>();
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
            {notFound ? (
                <View style={CameraScannerStyles.notFoundContainer}>
                    <View style={{alignItems: 'center'}}>
                        <Image
                            source={images.emptyGarden}
                            style={{
                                width: 400,
                                height: 400,
                                marginVertical: 24,
                            }}
                            resizeMode='contain'
                        />
                        <Text style={CameraScannerStyles.notFoundText}>
                            Không tìm thấy khu vườn phù hợp!
                        </Text>
                        <TouchableOpacity
                            style={CameraScannerStyles.goBackButton}
                            onPress={() => navigation.goBack()}>
                            <Text style={CameraScannerStyles.goBackText}>
                                Quay về
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : permissionState === 'granted' && device != null ? (
                <View style={CameraScannerStyles.container}>
                    <Camera
                        codeScanner={codeScanner}
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
                            value={codeInput}
                            onChangeText={setCodeInput}
                        />

                        <TouchableOpacity
                            style={CameraScannerStyles.confirmManualSearchBtn}
                            onPress={handleConfirm}>
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

    notFoundContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
    },
    notFoundText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginBottom: 16,
    },
    goBackButton: {
        borderColor: '#4CAF50',
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    goBackText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: '500',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
});

export default GardenScan;
