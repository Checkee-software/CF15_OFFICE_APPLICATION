import colors from "@/assets/colors";
import images from "@/assets/images";
import React, {useEffect, useState} from "react";
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Platform,
    Linking,
    Image,
    StyleSheet,
} from "react-native";
import VersionCheck from "react-native-version-check";
import Feather from "react-native-vector-icons/Feather";

interface Props {
    visible: boolean;
    onClose: () => void;
}

const UpdateRequiredModal: React.FC<Props> = ({visible, onClose}) => {
    const [version, setVersion] = useState<string>("0");
    useEffect(() => {
        const fetchLatestVersion = async () => {
            const latest = await VersionCheck.getLatestVersion();
            setVersion(latest);
        };

        fetchLatestVersion();
    }, []);
    const handleUpdatePress = async () => {
        try {
            const storeUrl =
                Platform.OS === "ios"
                    ? await VersionCheck.getAppStoreUrl({appID: "6749193435"})
                    : await VersionCheck.getPlayStoreUrl({
                          packageName: VersionCheck.getPackageName(),
                      });
            Linking.openURL(storeUrl);
        } catch (error) {
            console.log("Lỗi mở App Store:", error);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType={"fade"}
            statusBarTranslucent>
            <View style={styles.container}>
                <View style={styles.content}>
                    <View style={styles.logo_view}>
                        <Image
                            style={styles.store_logo}
                            resizeMode={"cover"}
                            source={
                                Platform.OS === "android"
                                    ? images.play_store
                                    : images.app_store
                            }
                        />
                        <Text style={styles.store_logo_title}>
                            {Platform.OS === "android"
                                ? "Google Play"
                                : "Apple store"}
                        </Text>
                        <Feather
                            name={"x"}
                            size={24}
                            color={colors.black}
                            onPress={onClose}
                        />
                    </View>
                    <View style={styles.line} />
                    <View style={styles.information}>
                        <Text style={styles.infor_title}>
                            Có bản cập nhật mới
                        </Text>
                        <Text style={styles.infor_description}>
                            Để sử dụng ứng dụng này, hãy tải xuống phiên bản mới
                            nhất. Bạn chỉ có thể tiếp tục sử dụng ứng dụng này
                            trong khi tải bản cập nhật mới của CF15 OFFICE.
                        </Text>
                    </View>
                    <View style={styles.logo_wrapper}>
                        <Image
                            style={styles.app_logo}
                            resizeMode={"cover"}
                            source={images.logoCF15}
                        />
                        <View style={styles.logo_title_and_version}>
                            <Text style={styles.logo_title}>CF15 OFFICE</Text>
                            <Text style={styles.logo_version}>
                                Phiên bản mới: {version}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        onPress={handleUpdatePress}
                        style={styles.button}>
                        <Text style={styles.button_text}>Cập nhật ngay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    content: {
        gap: 20,
        width: "100%",
        padding: 20,
        borderRadius: 12,
        paddingBottom: 40,
        backgroundColor: colors.white,
    },
    logo_view: {
        gap: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    store_logo: {
        width: 32,
        height: 32,
        aspectRatio: 1,
    },
    store_logo_title: {
        flex: 1,
        fontSize: 16,
        fontWeight: 600,
        color: colors.black,
    },
    line: {
        width: "100%",
        borderColor: colors.gray,
        borderWidth: StyleSheet.hairlineWidth,
    },
    information: {
        gap: 8,
    },
    infor_title: {
        fontSize: 18,
        letterSpacing: 0.4,
        fontWeight: "700",
        color: colors.black,
    },
    infor_description: {
        fontSize: 15,
        lineHeight: 20,
        color: colors.black,
        textAlign: "justify",
    },
    app_logo: {
        width: 52,
        height: 52,
        aspectRatio: 1,
    },
    logo_wrapper: {
        gap: 12,
        flexDirection: "row",
        alignItems: "center",
    },
    logo_title_and_version: {
        gap: 6,
    },
    logo_title: {
        fontSize: 16,
        fontWeight: 600,
        color: colors.black,
    },
    logo_version: {
        color: colors.gray,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 16,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.primary,
    },
    button_text: {
        fontSize: 16,
        width: "100%",
        fontWeight: "600",
        textAlign: "center",
        color: colors.white,
        textTransform: "uppercase",
    },
});

export default UpdateRequiredModal;
