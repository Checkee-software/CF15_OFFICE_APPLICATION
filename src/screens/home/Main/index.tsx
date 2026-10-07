/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Animated,
    Easing,
    FlatList,
    Image,
    Pressable,
    ScrollView,
    StyleProp,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from "react-native";
import "moment/locale/vi";
import {GestureHandlerRootView} from "react-native-gesture-handler";
import {Marquee} from "@animatereactnative/marquee";
import {useIsFocused} from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import images from "@/assets/images";
import SCREEN_INFO from "@/config/SCREEN_CONFIG/screenInfo";
import {useAuthStore} from "@/stores/authStore";
import useNotificationStore from "@/stores/notificationStore";
import useNewsStore from "@/stores/newsStore";
import {filterMenuByRole} from "./menuConfig";

const GREEN = "#4CAF50";
const DARK_GREEN = "#0F3D1A";

/** Card với hiệu ứng nhấn (scale) mượt mà */
const PressableCard = ({
    onPress,
    style,
    children,
}: {
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
}) => {
    const scale = useRef(new Animated.Value(1)).current;
    const animateTo = (value: number) =>
        Animated.spring(scale, {
            toValue: value,
            useNativeDriver: true,
            speed: 40,
            bounciness: 4,
        }).start();

    return (
        <Animated.View style={[style, {transform: [{scale}]}]}>
            <Pressable
                style={styles.cardPressable}
                onPress={onPress}
                onPressIn={() => animateTo(0.96)}
                onPressOut={() => animateTo(1)}>
                {children}
            </Pressable>
        </Animated.View>
    );
};

/** Hiệu ứng xuất hiện: fade + trượt lên, có delay theo thứ tự */
const FadeInView = ({
    delay = 0,
    style,
    children,
}: {
    delay?: number;
    style?: StyleProp<ViewStyle>;
    children: React.ReactNode;
}) => {
    const anim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 420,
            delay,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View
            style={[
                style,
                {
                    opacity: anim,
                    transform: [
                        {
                            translateY: anim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [16, 0],
                            }),
                        },
                    ],
                },
            ]}>
            {children}
        </Animated.View>
    );
};

export default function Main({navigation}: any) {
    const {userInfo} = useAuthStore();
    const {notification, fetchActiveNotification} = useNotificationStore();
    const {news, fetchNews, getFullAvatarUrl} = useNewsStore();
    const [announcement, setAnnouncement] = useState("");
    const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);
    const isFocused = useIsFocused();

    useEffect(() => {
        fetchActiveNotification();
        fetchNews();
    }, []);

    useEffect(() => {
        setAnnouncement(notification?.message || "");
    }, [notification]);

    useEffect(() => {
        setAvatarLoadFailed(false);
    }, [userInfo.avatar]);

    const greetingValue = useMemo(() => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 13) {
            return "Chào buổi sáng";
        }
        if (hour >= 13 && hour < 18) {
            return "Chào buổi chiều";
        }
        if (hour >= 18 && hour < 22) {
            return "Chào buổi tối";
        }
        return "Chúc ngủ ngon!";
    }, []);

    const avatarSource =
        userInfo.avatar && !avatarLoadFailed
            ? {uri: userInfo.avatar}
            : images.avatar;

    const newsPreview = news.slice(0, 3);

    const goProduction = () =>
        navigation.navigate(SCREEN_INFO.PRODUCTION_PORTAL.key, {
            category: "production",
        });
    const goStatistic = () =>
        navigation.navigate(SCREEN_INFO.STATISTIC.key, {
            navigateNext: null,
            menuKey: "statistic",
        });
    const goDocumentStatistic = () =>
        navigation.navigate(SCREEN_INFO.DOCUMENT.key, {
            navigateNext: null,
            menuKey: "documentStatistic",
        });

    // Cùng quy tắc phân quyền với các menu chức năng hiện tại
    const allowedKeys = useMemo(
        () => filterMenuByRole(userInfo).map(item => item.key),
        [userInfo],
    );
    const canViewProductionStatistic = allowedKeys.includes("statistic");
    const canViewOfficeStatistic = allowedKeys.includes("documentStatistic");
    const goOffice = () =>
        navigation.navigate(SCREEN_INFO.OFFICE_PORTAL.key, {
            category: "office",
        });

    const renderNewsItem = ({item}: any) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.8}
            onPress={() =>
                navigation.navigate(SCREEN_INFO.NEWS1.key, {id: item._id})
            }>
            <Image
                source={
                    item.imagePath
                        ? {uri: getFullAvatarUrl(item.imagePath)}
                        : images.plant1
                }
                style={styles.newsImage}
            />
            <View style={styles.newsContent}>
                <Text style={styles.newsType}>Loại tin tức</Text>
                <Text numberOfLines={2} style={styles.newsTitle}>
                    {item.title}
                </Text>
                <Text numberOfLines={1} style={styles.newsExcerpt}>
                    {item.content}
                </Text>
                <Text style={styles.newsAuthor}>
                    Tác giả: <Text style={styles.newsAuthorName}>CF15 Office</Text>
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode="never">
                {/* Thanh thông báo chạy chữ */}
                {announcement && isFocused ? (
                    <View style={styles.announcementContainer}>
                        <View style={styles.announcementRow}>
                            <MaterialCommunityIcons
                                name="lightbulb-on-outline"
                                size={20}
                                color="#FFFFFF"
                            />
                            <View style={styles.announcementDivider} />

                            <GestureHandlerRootView style={styles.marqueeWrap}>
                                <Marquee
                                    frameRate={30}
                                    spacing={120}
                                    speed={1.1}
                                    withGesture={false}>
                                    <Text style={styles.announcementText}>
                                        {announcement}
                                    </Text>
                                </Marquee>
                            </GestureHandlerRootView>
                        </View>
                    </View>
                ) : null}

                {/* Header */}
                <FadeInView style={styles.welcomeUser}>
                    <View style={styles.helloTime}>
                        <Text style={styles.helloTimeText}>
                            {greetingValue}
                        </Text>
                        <Text style={styles.helloUserText} numberOfLines={1}>
                            {userInfo.fullName}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.avatarUser}
                        activeOpacity={0.8}
                        onPress={() =>
                            navigation.navigate(SCREEN_INFO.PROFILE.key)
                        }>
                        <Image
                            source={avatarSource}
                            style={styles.avatar}
                            onError={() => setAvatarLoadFailed(true)}
                        />
                    </TouchableOpacity>
                </FadeInView>

                {/* Khối chức năng 2 cột */}
                <View style={styles.heroGrid}>
                    <View style={styles.heroCol}>
                        <FadeInView delay={80} style={styles.brandBlock}>
                            <Text style={styles.brandTop}>CF 15</Text>
                            <Text style={styles.brandBottom}>OFFICE</Text>
                        </FadeInView>

                        <FadeInView delay={160} style={styles.flex1}>
                            <PressableCard
                                style={[styles.greenCard, styles.productionCard]}
                                onPress={goProduction}>
                                <Text style={styles.cardTitle}>
                                    Quản trị{"\n"}sản xuất
                                </Text>
                                <Text style={styles.cardDesc} numberOfLines={2}>
                                    Vườn, nhân sự, quy trình
                                </Text>
                                <View style={styles.cardImageWrap}>
                                    <Image
                                        source={images.planting}
                                        style={styles.cardImage}
                                        resizeMode="contain"
                                    />
                                    <View
                                        style={[
                                            styles.cardLine,
                                            styles.cardLineLeft,
                                        ]}
                                    />
                                </View>
                            </PressableCard>
                        </FadeInView>
                    </View>

                    <View style={styles.heroCol}>
                        <FadeInView delay={120} style={styles.flex1}>
                            <PressableCard
                                style={[styles.greenCard, styles.officeCard]}
                                onPress={goOffice}>
                                <Text style={styles.cardTitle}>
                                    Văn phòng{"\n"}điện tử
                                </Text>
                                <Text style={styles.cardDesc} numberOfLines={2}>
                                    Văn bản, hồ sơ, tài liệu
                                </Text>
                                <View style={styles.cardImageWrap}>
                                    <Image
                                        source={images.workplace}
                                        style={styles.cardImage}
                                        resizeMode="contain"
                                    />
                                    <View
                                        style={[
                                            styles.cardLine,
                                            styles.cardLineRight,
                                        ]}
                                    />
                                </View>
                            </PressableCard>
                        </FadeInView>

                        <FadeInView delay={200}>
                            <View style={styles.statCard}>
                                <Text style={styles.statTitle}>
                                    Báo cáo{"\n"}thống kê
                                </Text>
                                <View style={styles.statLinks}>
                                    {canViewProductionStatistic ? (
                                        <TouchableOpacity
                                            hitSlop={8}
                                            activeOpacity={0.6}
                                            onPress={goStatistic}>
                                            <Text style={styles.statLink}>
                                                Sản xuất
                                            </Text>
                                        </TouchableOpacity>
                                    ) : null}
                                    {canViewProductionStatistic &&
                                    canViewOfficeStatistic ? (
                                        <View style={styles.statDivider} />
                                    ) : null}
                                    {canViewOfficeStatistic ? (
                                        <TouchableOpacity
                                            hitSlop={8}
                                            activeOpacity={0.6}
                                            onPress={goDocumentStatistic}>
                                            <Text style={styles.statLink}>
                                                Văn phòng
                                            </Text>
                                        </TouchableOpacity>
                                    ) : null}
                                </View>
                            </View>
                        </FadeInView>
                    </View>
                </View>

                {/* Tin tức */}
                <FadeInView delay={260} style={styles.newsSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleWrap}>
                            <MaterialCommunityIcons
                                name="newspaper-variant-outline"
                                size={20}
                                color="#1B1B1B"
                            />
                            <Text style={styles.sectionTitle}>
                                Tin tức mới nhất
                            </Text>
                        </View>
                        <TouchableOpacity
                            hitSlop={8}
                            onPress={() =>
                                navigation.navigate(SCREEN_INFO.NEWS.key)
                            }>
                            <Text style={styles.sectionLink}>Xem tất cả</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={newsPreview}
                        renderItem={renderNewsItem}
                        keyExtractor={item => item._id}
                        scrollEnabled={false}
                        ListEmptyComponent={
                            <View style={styles.emptyNewsBox}>
                                <Text style={styles.emptyNewsText}>
                                    Chưa có tin tức hiển thị.
                                </Text>
                            </View>
                        }
                    />
                </FadeInView>

                {/* Khung thông báo cuối trang */}
                {announcement ? (
                    <FadeInView delay={320} style={styles.noticeBox}>
                        <MaterialCommunityIcons
                            name="lightbulb-on-outline"
                            size={20}
                            color={GREEN}
                            style={styles.noticeIcon}
                        />
                        <Text style={styles.noticeText}>{announcement}</Text>
                    </FadeInView>
                ) : null}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#FFFFFF"},
    content: {paddingHorizontal: 16, paddingTop: 14, paddingBottom: 28},
    announcementContainer: {
        backgroundColor: GREEN,
        borderRadius: 4,
        overflow: "hidden",
        marginHorizontal: -16,
        marginTop: -14,
        marginBottom: 16,
    },
    announcementRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    announcementDivider: {
        width: 1,
        height: 16,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        marginHorizontal: 8,
    },
    marqueeWrap: {flex: 1},
    announcementText: {color: "#FFFFFF", fontWeight: "500", fontSize: 16},
    flex1: {flex: 1},
    cardPressable: {flex: 1},

    welcomeUser: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    helloTime: {flex: 1, paddingRight: 12},
    helloTimeText: {fontSize: 15, color: "#4A4A4A", marginBottom: 2},
    helloUserText: {fontWeight: "700", fontSize: 20, color: "#1B1B1B"},
    avatarUser: {
        borderRadius: 26,
        backgroundColor: "#ECECEC",
        width: 52,
        height: 52,
        overflow: "hidden",
    },
    avatar: {width: "100%", height: "100%"},

    heroGrid: {flexDirection: "row", gap: 12, marginBottom: 22},
    heroCol: {flex: 1, gap: 12},
    brandBlock: {
        borderLeftWidth: 2,
        borderLeftColor: GREEN,
        paddingLeft: 12,
        justifyContent: "center",
        height: 84,
    },
    brandTop: {
        color: GREEN,
        fontSize: 22,
        fontWeight: "700",
        letterSpacing: 1,
    },
    brandBottom: {
        color: "#0F3D1A",
        fontSize: 28,
        fontWeight: "800",
        letterSpacing: 1.5,
    },

    greenCard: {
        flex: 1,
        backgroundColor: GREEN,
        borderRadius: 16,
        padding: 14,
        overflow: "hidden",
        shadowColor: "#2E7D32",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 3,
    },
    productionCard: {minHeight: 225},
    officeCard: {minHeight: 265},
    cardTitle: {
        color: "#FFFFFF",
        fontSize: 19,
        fontWeight: "700",
        lineHeight: 26,
    },
    cardDesc: {
        color: "rgba(255,255,255,0.9)",
        fontSize: 14,
        lineHeight: 20,
        marginTop: 8,
    },
    cardImageWrap: {flex: 1, justifyContent: "flex-end", marginTop: 8},
    cardImage: {width: "100%", height: 96},
    cardLine: {
        width: "50%",
        height: 1.5,
        backgroundColor: "rgba(255,255,255,0.85)",
        marginTop: 6,
    },
    cardLineLeft: {alignSelf: "flex-start", marginLeft: 6},
    cardLineRight: {alignSelf: "flex-end", marginRight: 6},

    statCard: {
        backgroundColor: DARK_GREEN,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 10,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    statTitle: {
        color: "#FFFFFF",
        fontSize: 18,
        fontWeight: "700",
        textAlign: "center",
        lineHeight: 24,
    },
    statLinks: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        gap: 10,
    },
    statLink: {color: "#7ED87F", fontSize: 14, fontWeight: "600"},
    statDivider: {width: 1, height: 12, backgroundColor: "#7ED87F"},

    newsSection: {marginBottom: 16},
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 14,
    },
    sectionTitleWrap: {flexDirection: "row", alignItems: "center", gap: 8},
    sectionTitle: {fontSize: 18, fontWeight: "700", color: "#1B1B1B"},
    sectionLink: {fontSize: 15, color: "#2196F3", fontWeight: "500"},
    newsCard: {flexDirection: "row", marginBottom: 16},
    newsImage: {
        width: 88,
        height: 88,
        borderRadius: 4,
        backgroundColor: "#EFEFEF",
    },
    newsContent: {flex: 1, marginLeft: 12},
    newsType: {fontSize: 13, color: "#7B7B7B", fontWeight: "500"},
    newsTitle: {
        fontSize: 17,
        color: "#111",
        fontWeight: "700",
        marginTop: 2,
        lineHeight: 23,
    },
    newsExcerpt: {fontSize: 14, color: "#9A9A9A", marginTop: 2},
    newsAuthor: {marginTop: 4, fontSize: 14, color: "#4A4A4A"},
    newsAuthorName: {color: "#2196F3", fontWeight: "500"},
    emptyNewsBox: {backgroundColor: "#F7F7F7", borderRadius: 10, padding: 12},
    emptyNewsText: {color: "#767676"},

    noticeBox: {
        flexDirection: "row",
        backgroundColor: "#E8F5E9",
        borderRadius: 12,
        padding: 14,
    },
    noticeIcon: {marginRight: 10, marginTop: 1},
    noticeText: {flex: 1, color: "#2E5E32", fontSize: 15, lineHeight: 22},
});
