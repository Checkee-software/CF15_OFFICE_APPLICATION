import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    Linking,
    ViewStyle,
    TextInput,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import {
    Camera,
    useCameraDevice,
    useCodeScanner,
    CameraPermissionRequestResult,
} from "react-native-vision-camera";
// import images from '../../../assets/images';
import colors from "@/assets/colors";
import Snackbar from "react-native-snackbar";
import SCREEN_INFO from "@/config/SCREEN_CONFIG/screenInfo";

const AutomaticTracing = ({navigation}: any) => {
    /** create state */
    const [codeInput, setCodeInput] = useState<string>("");
    const [hasScanned, setHasScanned] = useState<boolean>(false);
    const [cameraStyles, setCameraStyles] = useState<ViewStyle>({
        width: 0,
        height: 0,
    });
    const [permissionState, setPermissionState] =
        useState<CameraPermissionRequestResult>("denied");

    /** use camera */
    const device = useCameraDevice("back");
    const getPermission = async () => {
        const permission = await Camera.requestCameraPermission();
        setPermissionState(permission);
    };

    console.log("navigation: ", navigation);

    useEffect(() => {
        getPermission();
    }, []);

    const handleSearch = async (code: string) => {
        if (code !== "efab158e-8167-456b-bbe5-04760c820e49") {
            return Snackbar.show({
                text: "Không tìm thấy thông tin mã này!",
                duration: Snackbar.LENGTH_LONG,
            });
        }

        return navigation.navigate(SCREEN_INFO.DETAIL_TRACKING.key, {
            code: "efab158e-8167-456b-bbe5-04760c820e49",
        });

        // //console.log('[SEARCH] Searching for garden with code:', code);
        // await searchGardens(code, userInfo._id);

        // const updatedGardens = useGardenStore.getState().gardens;
        // //console.log('[RESULT] Garden found:', updatedGardens);

        // if (updatedGardens) {
        //     setNotFound(false);
        //     navigation.navigate(navigateNext, {
        //         garden: updatedGardens,
        //     });
        // } else {
        //     setNotFound(true);
        //     setHasScanned(false);
        // }
    };

    const codeScanner = useCodeScanner({
        codeTypes: ["qr"],
        onCodeScanned: async codes => {
            if (hasScanned) {
                return;
            }

            const scannedCode = codes[0]?.value?.trim();
            if (!scannedCode) {
                return;
            }

            setHasScanned(true);
            setCodeInput(scannedCode);
            if (scannedCode !== "efab158e-8167-456b-bbe5-04760c820e49") {
                return Snackbar.show({
                    text: "Không tìm thấy thông tin trên mã QR này",
                    duration: Snackbar.LENGTH_LONG,
                });
            }

            setHasScanned(false);
            navigation.navigate(SCREEN_INFO.DETAIL_TRACKING.key, {
                code: "efab158e-8167-456b-bbe5-04760c820e49",
            });
            // await handleSearch(scannedCode);
        },
    });

    const handleConfirm = async () => {
        const code = codeInput.trim();
        if (!code.length) {
            return Snackbar.show({
                text: "Vui lòng nhập mã!",
                duration: Snackbar.LENGTH_LONG,
            });
        }

        setHasScanned(true);
        await handleSearch(code);
    };

    if (!device) {
        return (
            <View style={styles.noDeivce__container}>
                <Text>Camera không khả dụng trên thiết bị này</Text>
            </View>
        );
    }

    return (
        <>
            {permissionState === "granted" ? (
                <View style={styles.container}>
                    <Camera
                        codeScanner={codeScanner}
                        device={device}
                        isActive={true}
                        style={cameraStyles}
                        onLayout={() => {
                            setCameraStyles(styles.camera);
                        }}
                    />

                    <View style={styles.inputView}>
                        <TextInput
                            placeholder="Nhập mã khu vườn"
                            placeholderTextColor={"#808080"}
                            style={styles.inputManualSearch}
                            value={codeInput}
                            onChangeText={setCodeInput}
                        />

                        <TouchableOpacity
                            style={styles.confirmManualSearchBtn}
                            onPress={handleConfirm}>
                            <Text style={styles.confirmManualSearchText}>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <View style={styles.denied__container}>
                    <Text style={styles.denied__text}>
                        Vui lòng cấp phép camera của bạn để sử dụng chức năng
                        này
                    </Text>
                    <Text
                        style={styles.denied__pressed_text}
                        onPress={() => Linking.openSettings()}>
                        Cấp quyền ngay
                    </Text>
                </View>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    noDeivce__container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F5F5F5",
    },
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: "#F5F5F5",
    },
    denied__container: {
        flex: 1,
        gap: 12,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F5F5F5",
    },
    denied__text: {
        color: colors.black,
    },
    denied__pressed_text: {
        color: colors.blue,
        fontSize: 16,
        fontWeight: "500",
    },
    camera: {
        flex: 1,
        borderRadius: 8,
    },
    inputView: {
        flex: 1,
        alignItems: "center",
        gap: 14,
    },
    inputManualSearch: {
        textAlignVertical: "center",
        textAlign: "center",
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderColor: "#D3D3D3",
        borderWidth: 1,
        padding: 12,
        borderRadius: 8,
        marginTop: 22,
        color: "#212121",
        fontWeight: 500,
        fontSize: 14,
    },
    confirmManualSearchBtn: {
        backgroundColor: "#4CAF50",
        borderRadius: 24,
        borderColor: "#D3D3D3",
        borderWidth: 1,
        paddingVertical: 12,
        paddingHorizontal: 24,
    },
    confirmManualSearchText: {
        color: "#F5F5F5",
        fontWeight: 500,
        fontSize: 16,
    },
    viewRequestCameraPermission: {
        backgroundColor: "#fff",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    notHavePermission: {
        backgroundColor: "black",
    },
    requestPermissionContainer: {
        paddingHorizontal: 20,
        backgroundColor: "black",
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        gap: 20,
    },
    requestPermissionText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },

    notFoundContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
    },
    notFoundText: {
        fontSize: 16,
        color: "#333",
        textAlign: "center",
        marginBottom: 16,
    },
    goBackButton: {
        borderColor: "#4CAF50",
        borderWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    goBackText: {
        color: "#4CAF50",
        fontSize: 16,
        fontWeight: "500",
    },
    headerText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 12,
    },
});

export default AutomaticTracing;
