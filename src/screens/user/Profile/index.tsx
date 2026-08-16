/* eslint-disable @typescript-eslint/no-shadow */
import React, {useEffect, useState} from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ScrollView,
    Modal,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/Feather";
import SCREEN_INFO from "../../../config/SCREEN_CONFIG/screenInfo";
import {useAuthStore} from "../../../stores/authStore";
import {useWorkerStore} from "@/stores/workerStore";
import moment from "moment";
import images from "../../../assets/images";
import {OneSignal} from "react-native-onesignal";
import {
    EOrganization,
    organizations,
} from "@/shared-types/common/Permissions/Permissions";
import {launchImageLibrary} from "react-native-image-picker";
import Permissions from "@/shared-types/common/Permissions";

export default function Profile({navigation}: any) {
    const {userInfo, logout, updateAvatar, getScheduleCollection} =
        useAuthStore();
    const {resetStateWhenLogout} = useWorkerStore();

    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [showAccountInfo, setShowAccountInfo] = useState(false);

    const [isUploading, setIsUploading] = useState(false);
    const [tasks, setTasks] = useState<{
        total: string;
        compeleted: string;
        processing: string;
        expired: string;
    }>({total: "...", compeleted: "...", processing: "...", expired: "..."});

    useEffect(() => {
        const organizationArray = [
            Permissions.EOrganization.DEPARTMENT,
            Permissions.EOrganization.LEADER,
            Permissions.EOrganization.WORKER,
        ];

        if (!userInfo || !userInfo.userType) {
            return;
        }

        const fetchTasks = async () => {
            try {
                if (
                    organizationArray.includes(
                        userInfo.userType.level as Permissions.EOrganization,
                    )
                ) {
                    const tasks = await getScheduleCollection();
                    console.log("tasks: ", tasks);
                    setTasks({
                        total: String(tasks?.total || 0),
                        compeleted: String(tasks?.compeleted || 0),
                        processing: String(tasks?.processing || 0),
                        expired: String(tasks?.expired || 0),
                    });
                }
            } catch (error) {
                console.error("Error fetching schedule collection", error);
            }
        };

        fetchTasks();
    }, [userInfo, getScheduleCollection]);

    const handleSelectAvatar = async () => {
        const result = await launchImageLibrary({
            mediaType: "photo",
            quality: 0.8,
        });

        if (result.didCancel) {
            return;
        }

        const uri = result.assets?.[0]?.uri;
        if (uri && userInfo._id) {
            setIsUploading(true);
            await updateAvatar(userInfo._id, uri);
            setIsUploading(false);
        }
    };

    const renderProtectedInfo = (info: string) => {
        const stars = "*".repeat(info.length);
        return userInfo?.canViewSensitiveInfo ||
            userInfo?.userType?.level === EOrganization.ADMIN
            ? info
            : stars;
    };

    return (
        <View style={styles.wrapper}>
            <ScrollView
                contentContainerStyle={styles.scrollViewStyle}
                showsVerticalScrollIndicator={false}>
                <View style={styles.container}>
                    <View style={styles.avatarWrapper}>
                        <TouchableOpacity onPress={handleSelectAvatar}>
                            <Image
                                source={
                                    userInfo.avatar
                                        ? {uri: userInfo.avatar}
                                        : images.avatar
                                }
                                style={styles.avatar}
                            />
                            <View style={styles.cameraIcon}>
                                <Icon name="camera" size={18} color="#4CAF50" />
                            </View>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.name}>{userInfo.fullName}</Text>
                    <Text style={styles.email}>{userInfo.username}</Text>

                    <View style={styles.card}>
                        <Text style={styles.dateValue}>
                            {moment().format(
                                "ddd, [ngày] D [tháng] M [năm] YYYY",
                            )}
                        </Text>

                        {userInfo.userType.level !== EOrganization.ADMIN &&
                            userInfo.userType.level !==
                                EOrganization.MANAGEMENT && (
                                <>
                                    <View style={styles.divider} />

                                    <Text style={styles.sectionLabel}>
                                        Công việc
                                    </Text>

                                    <View style={styles.jobStats}>
                                        {renderStat(
                                            "Tổng",
                                            tasks?.total || "-",
                                        )}
                                        {renderStat(
                                            "Hoàn thành",
                                            tasks?.compeleted || "-",
                                        )}
                                        {renderStat(
                                            "Đang làm",
                                            tasks?.processing || "-",
                                        )}
                                        {renderStat(
                                            "Thất bại",
                                            tasks?.expired || "-",
                                        )}
                                    </View>
                                </>
                            )}
                    </View>

                    <View style={styles.buttonGroup}>
                        <View>
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    showAccountInfo && styles.optionExpanded,
                                ]}
                                onPress={() =>
                                    setShowAccountInfo(!showAccountInfo)
                                }>
                                <Text style={styles.optionText}>
                                    Thông tin tài khoản
                                </Text>
                                <Icon
                                    name={
                                        showAccountInfo
                                            ? "chevron-down"
                                            : "chevron-right"
                                    }
                                    size={18}
                                    color="#fff"
                                />
                            </TouchableOpacity>

                            {showAccountInfo && (
                                <View style={styles.accountInfoCard}>
                                    {renderInfoRow(
                                        "Dân tộc",
                                        `${userInfo.nation}`,
                                    )}
                                    {userInfo.userType.level !==
                                    EOrganization.WORKER
                                        ? renderInfoRow(
                                              "Cấp đơn vị",
                                              `${
                                                  organizations.find(
                                                      (item: any) =>
                                                          item.code ===
                                                          userInfo.userType
                                                              .level,
                                                  )?.label || "Chưa cập nhật"
                                              }`,
                                          )
                                        : null}

                                    {userInfo.userType.level ===
                                        EOrganization.LEADER ||
                                    userInfo.userType.level ===
                                        EOrganization.WORKER
                                        ? renderInfoRow(
                                              "Đội sản xuất",
                                              //{userInfo.userType.unit}
                                              `${
                                                  userInfo.groupName === ""
                                                      ? "Chưa cập nhật"
                                                      : userInfo.groupName
                                              }`,
                                          )
                                        : null}

                                    {userInfo.userType.level ===
                                        EOrganization.LEADER ||
                                    userInfo.userType.level ===
                                        EOrganization.WORKER
                                        ? renderInfoRow(
                                              "Tổ",
                                              //{userInfo.userType.unit}
                                              `${
                                                  userInfo.userType.unit === ""
                                                      ? "Chưa cập nhật"
                                                      : userInfo.userType.unit
                                              }`,
                                          )
                                        : null}

                                    {renderInfoRow(
                                        "Ngày sinh",
                                        `${renderProtectedInfo(
                                            moment(userInfo.dateOfBirth).format(
                                                "L",
                                            ),
                                        )}`,
                                    )}
                                    {renderInfoRow(
                                        "Số điện thoại",
                                        `${renderProtectedInfo(
                                            userInfo.phoneNumber,
                                        )}`,
                                    )}
                                    {renderInfoRow(
                                        "CCCD",
                                        `${renderProtectedInfo(userInfo.ID)}`,
                                    )}
                                    {renderInfoRow(
                                        "Ngày tuyển dụng",
                                        `${moment(
                                            userInfo.recruimentDate,
                                        ).format("L")}`,
                                    )}
                                    {renderInfoRow(
                                        "Loại hợp đồng",
                                        `${userInfo.contract}`,
                                    )}
                                </View>
                            )}
                        </View>

                        {renderOption("Đổi mật khẩu", false, () =>
                            navigation.navigate(
                                SCREEN_INFO.UPDATE_PASSWORD.key,
                            ),
                        )}
                        {renderOption("Quản lý thông báo", false, () =>
                            navigation.navigate(SCREEN_INFO.NOTIFICATION.key),
                        )}
                        {renderOption("Đăng xuất tài khoản", true, () =>
                            setShowLogoutModal(true),
                        )}
                    </View>
                </View>
            </ScrollView>
            <Modal
                animationType="fade"
                transparent={true}
                visible={showLogoutModal}
                onRequestClose={() => setShowLogoutModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Đăng xuất</Text>
                        <Text style={styles.modalMessage}>
                            Xác nhận đăng xuất khỏi ứng dụng?
                        </Text>
                        <View style={styles.divider} />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={() => setShowLogoutModal(false)}>
                                <Text style={styles.cancelButton}>Huỷ bỏ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={async () => {
                                    resetStateWhenLogout();
                                    OneSignal.logout();
                                    await logout();
                                    setShowLogoutModal(false);
                                    // TODO: Handle logout logic here
                                }}>
                                <Text style={styles.confirmButton}>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            {isUploading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>
                        Đang cập nhật ảnh đại diện...
                    </Text>
                </View>
            )}
        </View>
    );
}

const renderStat = (label: string, value: string) => (
    <View style={styles.statItem}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const renderOption = (
    label: string,
    isLogout = false,
    onPress?: () => void,
) => (
    <TouchableOpacity style={styles.option} onPress={onPress}>
        <Text style={styles.optionText}>{label}</Text>
        <Icon
            name={isLogout ? "log-out" : "chevron-right"}
            size={18}
            color="#fff"
        />
    </TouchableOpacity>
);
const renderInfoRow = (label: string, value: string) => (
    <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <View style={styles.infoValueContainer}>
            <Text style={styles.infoValue}>{value}</Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    infoValueContainer: {
        flexDirection: "row",
        alignItems: "center",
        width: "90%",
        justifyContent: "flex-start",
    },

    optionExpanded: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    wrapper: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    scrollViewStyle: {
        alignItems: "center",
        paddingBottom: 50,
    },
    container: {
        width: 372,
        //height: 653,
        backgroundColor: "#4CAF50",
        alignItems: "center",
        marginTop: 112,
        paddingTop: 56,
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    avatarWrapper: {
        position: "absolute",
        top: -60,
        zIndex: 2,
        borderWidth: 6,
        borderColor: "#4CAF50",
        borderRadius: 60,
        backgroundColor: "#4CAF50",
        padding: 3,
    },
    avatar: {
        width: 96,
        height: 96,
        borderRadius: 100,
    },
    name: {
        fontWeight: "bold",
        color: "#fff",
        fontSize: 16,
        marginTop: 10,
    },
    email: {
        color: "#fff",
        fontSize: 13,
        marginBottom: 15,
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        width: 324,
        alignItems: "center",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: {width: 0, height: 1},
        shadowRadius: 4,
    },
    dateLabel: {
        color: "#888",
        fontSize: 13,
    },
    dateValue: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 4,
    },
    divider: {
        width: "100%",
        height: 1,
        backgroundColor: "#ddd",
        marginVertical: 12,
    },
    sectionLabel: {
        fontSize: 13,
        color: "#666",
        marginBottom: 12,
    },
    jobStats: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    statItem: {
        alignItems: "center",
        flex: 1,
    },
    statValue: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#000",
        backgroundColor: "#F1F1F1",
        paddingVertical: 10,
        paddingHorizontal: 0,
        borderRadius: 50,
        width: 40,
        height: 40,
        textAlign: "center",
        textAlignVertical: "center",
        marginBottom: 5,
    },
    statLabel: {
        fontSize: 12,
        color: "#666",
        textAlign: "center",
    },

    buttonGroup: {
        marginTop: 20,
        width: "100%",
        gap: 15,
    },
    option: {
        backgroundColor: "rgba(245, 245, 245, 0.15)",
        padding: 12,
        width: 332,
        borderRadius: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    optionText: {
        fontSize: 16,
        color: "white",
    },

    accountInfoCard: {
        backgroundColor: "rgba(245, 245, 245, 0.15)",
        padding: 12,
        width: 332,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 15,
    },

    infoLabel: {
        color: "#fff",
        fontSize: 14,
        width: "40%",
    },

    infoValue: {
        color: "#fff",
        fontSize: 14,
        width: "60%",
        textAlign: "left",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 8,
        width: 312,
        height: 220,
        padding: 16,
        alignItems: "flex-start",
    },
    modalTitle: {
        fontSize: 22,
        marginBottom: 16,
        textAlign: "left",
    },
    modalMessage: {
        fontSize: 16,
        color: "#555",
        marginBottom: 10,
        textAlign: "left",
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginTop: 15,
    },
    modalButton: {
        flex: 1,
        alignItems: "flex-end",
        paddingVertical: 8,
    },
    cancelButton: {
        fontSize: 16,
        color: "#888",
    },
    confirmButton: {
        fontSize: 16,
        color: "#E53935",
        fontWeight: "bold",
    },
    cameraIcon: {
        position: "absolute",
        bottom: 0,
        right: 0,
        backgroundColor: "white",
        borderRadius: 15,
        padding: 6,
    },
    loadingOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99,
    },
    loadingText: {
        color: "#fff",
        marginTop: 10,
        fontSize: 16,
    },
});
