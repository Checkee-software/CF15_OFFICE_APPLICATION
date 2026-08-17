/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useMemo, useState} from "react";
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
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
        if (notification?.message) {
            setAnnouncement(notification.message);
        } else {
            setAnnouncement("");
        }
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

    const newsPreview = news.slice(0, 2);
    const renderNewsItem = ({item}: any) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.88}
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
                <Text numberOfLines={2} style={styles.newsExcerpt}>
                    {item.content}
                </Text>
                <Text style={styles.newsAuthor}>Tác giả: CF15 Office</Text>
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
                {announcement && isFocused ? (
                    <View style={styles.announcementContainer}>
                        <View style={styles.announcementRow}>
                            <MaterialCommunityIcons
                                name="lightbulb-on-outline"
                                size={17}
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

                <View style={styles.welcomeUser}>
                    <View style={styles.helloTime}>
                        <Text style={styles.helloTimeText}>
                            {greetingValue}
                        </Text>
                        <Text style={styles.helloUserText}>
                            {userInfo.fullName}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.avatarUser}
                        onPress={() =>
                            navigation.navigate(SCREEN_INFO.PROFILE.key)
                        }>
                        <Image
                            source={avatarSource}
                            style={styles.avatar}
                            onError={() => setAvatarLoadFailed(true)}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.heroStack}>
                    <TouchableOpacity
                        style={styles.heroCard}
                        activeOpacity={0.92}
                        onPress={() =>
                            navigation.navigate(
                                SCREEN_INFO.PRODUCTION_PORTAL.key,
                                {category: "production"},
                            )
                        }>
                        <Image
                            source={images.cultivationArea}
                            style={styles.heroIllustration}
                            resizeMode="contain"
                        />
                        <View style={styles.heroContent}>
                            <Text
                                style={styles.heroTitle}
                                numberOfLines={1}
                                adjustsFontSizeToFit>
                                Quản trị{" "}
                                <Text style={styles.heroAccent}>sản xuất</Text>
                            </Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.heroCard}
                        activeOpacity={0.92}
                        onPress={() =>
                            navigation.navigate(SCREEN_INFO.OFFICE_PORTAL.key, {
                                category: "office",
                            })
                        }>
                        <View style={styles.heroContent}>
                            <Text
                                style={styles.heroTitle}
                                numberOfLines={1}
                                adjustsFontSizeToFit>
                                Văn phòng{" "}
                                <Text style={styles.heroAccent}>điện tử</Text>
                            </Text>
                        </View>
                        <Image
                            source={images.workplaceIcon}
                            style={styles.heroIllustration}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.newsSection}>
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
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: "#FFFFFF"},
    content: {paddingHorizontal: 14, paddingTop: 12, paddingBottom: 24},
    announcementContainer: {
        backgroundColor: "#4CAF50",
        borderRadius: 4,
        overflow: "hidden",
        marginHorizontal: -14,
        marginBottom: 16,
    },
    announcementRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    announcementDivider: {
        width: 1,
        height: 15,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        marginHorizontal: 8,
    },
    marqueeWrap: {flex: 1},
    announcementText: {color: "#FFFFFF", fontWeight: "500", fontSize: 14},
    welcomeUser: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 18,
    },
    helloTime: {flex: 1},
    helloTimeText: {fontSize: 14, color: "#7B7B7B", marginBottom: 2},
    helloUserText: {fontWeight: "700", fontSize: 32, color: "#1B1B1B"},
    avatarUser: {
        borderRadius: 28,
        backgroundColor: "#ECECEC",
        width: 56,
        height: 56,
        padding: 3,
        overflow: "hidden",
    },
    avatar: {width: "100%", height: "100%", borderRadius: 40},
    heroStack: {gap: 18, marginBottom: 18},
    heroCard: {
        minHeight: 118,
        backgroundColor: "#FFFFFF",
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        paddingHorizontal: 18,
        paddingVertical: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    heroContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingRight: 10,
    },
    heroIllustration: {width: 108, height: 84, marginHorizontal: 8},
    heroTitle: {color: "#1F1F1F", fontSize: 24, fontWeight: "700"},
    heroAccent: {color: "#59B75F"},
    newsSection: {marginBottom: 12},
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    sectionTitleWrap: {flexDirection: "row", alignItems: "center", gap: 6},
    sectionTitle: {fontSize: 22, fontWeight: "700", color: "#1B1B1B"},
    sectionLink: {fontSize: 13, color: "#4A86FF", fontWeight: "500"},
    newsCard: {flexDirection: "row", marginBottom: 12},
    newsImage: {
        width: 96,
        height: 74,
        borderRadius: 10,
        backgroundColor: "#EFEFEF",
    },
    newsContent: {flex: 1, marginLeft: 10},
    newsType: {fontSize: 12, color: "#A0A0A0"},
    newsTitle: {
        fontSize: 20,
        color: "#222",
        fontWeight: "700",
        marginTop: 2,
        marginBottom: 2,
    },
    newsExcerpt: {fontSize: 14, color: "#878787", lineHeight: 20},
    newsAuthor: {
        marginTop: 4,
        fontSize: 13,
        color: "#4A86FF",
        fontWeight: "500",
    },
    emptyNewsBox: {backgroundColor: "#F7F7F7", borderRadius: 10, padding: 12},
    emptyNewsText: {color: "#767676"},
});
