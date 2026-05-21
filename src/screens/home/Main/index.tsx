/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react';
import {
    FlatList,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import 'moment/locale/vi';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Marquee } from '@animatereactnative/marquee';
import { useIsFocused } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import images from '@/assets/images';
import SCREEN_INFO from '@/config/SCREEN_CONFIG/screenInfo';
import { useAuthStore } from '@/stores/authStore';
import useNotificationStore from '@/stores/notificationStore';
import useNewsStore from '@/stores/newsStore';
import { filterMenuByRole } from './menuConfig';

export default function Main({ navigation }: any) {
    const { userInfo } = useAuthStore();
    const { notification, fetchActiveNotification } = useNotificationStore();
    const { news, fetchNews, getFullAvatarUrl } = useNewsStore();
    const [announcement, setAnnouncement] = useState('');
    const isFocused = useIsFocused();

    useEffect(() => {
        fetchActiveNotification();
        fetchNews();
    }, []);

    useEffect(() => {
        if (notification?.message) {
            setAnnouncement(notification.message);
        } else {
            setAnnouncement('');
        }
    }, [notification]);

    const greetingValue = useMemo(() => {
        const hour = new Date().getHours();

        if (hour >= 5 && hour < 13) {
            return {
                greetingText: 'Chào buổi sáng',
                colorGreetingText: '#6EBE63',
            };
        }

        if (hour >= 13 && hour < 18) {
            return {
                greetingText: 'Chào buổi chiều',
                colorGreetingText: '#F59A23',
            };
        }

        if (hour >= 18 && hour < 22) {
            return {
                greetingText: 'Chào buổi tối',
                colorGreetingText: '#377DFF',
            };
        }

        return {
            greetingText: 'Chúc ngủ ngon!',
            colorGreetingText: '#422119',
        };
    }, []);

    const menuList = useMemo(() => filterMenuByRole(userInfo), [userInfo]);
    const officeItems = menuList.filter(item => item.category === 'office');
    const newsPreview = news.slice(0, 2);

    const renderNewsItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.newsCard}
            activeOpacity={0.88}
            onPress={() => navigation.navigate(SCREEN_INFO.NEWS1.key, { id: item._id })}>
            <Image
                source={
                    item.imagePath
                        ? { uri: getFullAvatarUrl(item.imagePath) }
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
                        <GestureHandlerRootView>
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
                ) : null}

                <View style={styles.welcomeUser}>
                    <View style={styles.helloTime}>
                        <Text style={styles.helloTimeText}>
                            {greetingValue.greetingText}
                        </Text>
                        <Text
                            style={[
                                styles.helloUserText,
                                { color: greetingValue.colorGreetingText },
                            ]}>
                            {userInfo.fullName}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.avatarUser}
                        onPress={() => navigation.navigate('Hồ sơ')}>
                        <Image
                            source={
                                userInfo.avatar ? { uri: userInfo.avatar } : images.avatar
                            }
                            style={styles.avatar}
                        />
                    </TouchableOpacity>
                </View>

                <View style={styles.heroStack}>
                    <TouchableOpacity
                        style={styles.heroCard}
                        activeOpacity={0.92}
                        onPress={() =>
                            navigation.navigate(SCREEN_INFO.PRODUCTION_PORTAL.key, {
                                category: 'production',
                            })
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
                                Quản trị <Text style={styles.heroAccent}>sản xuất</Text>
                            </Text>
                            
                        </View>
                    </TouchableOpacity>

                    {officeItems.length > 0 ? (
                        <TouchableOpacity
                            style={styles.heroCard}
                            activeOpacity={0.92}
                            onPress={() =>
                                navigation.navigate(SCREEN_INFO.OFFICE_PORTAL.key, {
                                    category: 'office',
                                })
                            }>
                            <View style={styles.heroContent}>
                                <Text
                                    style={styles.heroTitle}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit>
                                    Văn phòng <Text style={styles.heroAccent}>điện tử</Text>
                                </Text>
                            </View>
                            <Image
                                source={images.workplaceIcon}
                                style={styles.heroIllustration}
                                resizeMode="contain"
                            />
                        </TouchableOpacity>
                    ) : null}
                </View>

                <View style={styles.newsSection}>
                    <View style={styles.sectionHeader}>
                        <View style={styles.sectionTitleWrap}>
                            <MaterialCommunityIcons
                                name="newspaper-variant-outline"
                                size={20}
                                color="#1B1B1B"
                            />
                            <Text style={styles.sectionTitle}>Tin tức mới nhất</Text>
                        </View>

                        <TouchableOpacity
                            onPress={() => navigation.navigate(SCREEN_INFO.NEWS.key)}>
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
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 24,
    },
    announcementContainer: {
        backgroundColor: '#4CAF50',
        borderRadius: 4,
        paddingVertical: 9,
        overflow: 'hidden',
        marginBottom: 14,
    },
    announcementText: {
        color: '#FFFFFF',
        fontWeight: '500',
        fontSize: 14,
        marginLeft: 8,
    },
    welcomeUser: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 18,
    },
    helloTime: {
        flex: 1,
    },
    helloTimeText: {
        fontSize: 14,
        color: '#7B7B7B',
        marginBottom: 2,
    },
    helloUserText: {
        fontWeight: '700',
        fontSize: 28,
    },
    avatarUser: {
        borderRadius: 28,
        backgroundColor: '#F1F1F1',
        width: 56,
        height: 56,
        overflow: 'hidden',
    },
    avatar: {
        width: '100%',
        height: '100%',
    },
    heroStack: {
        gap: 18,
        marginBottom: 18,
    },
    heroCard: {
        minHeight: 118,
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: '#D9D9D9',
        paddingHorizontal: 18,
        paddingVertical: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    heroContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingRight: 10,
    },
    heroIllustration: {
        width: 108,
        height: 84,
        marginHorizontal: 8,
    },
    heroTitle: {
        color: '#1F1F1F',
        fontWeight: '700',
        fontSize: 24,
        lineHeight: 30,
        textAlign: 'left',
    },
    heroAccent: {
        color: '#6EBE63',
    },
    heroMeta: {
        color: '#8A8A8A',
        fontSize: 13,
    },
    newsSection: {
        marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionTitle: {
        color: '#1B1B1B',
        fontSize: 22,
        fontWeight: '700',
    },
    sectionLink: {
        color: '#3C87FF',
        fontSize: 13,
    },
    newsCard: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
    },
    newsImage: {
        width: 86,
        height: 86,
        borderRadius: 12,
        backgroundColor: '#EAEAEA',
    },
    newsContent: {
        flex: 1,
    },
    newsType: {
        color: '#8B8B8B',
        fontSize: 12,
        marginBottom: 2,
    },
    newsTitle: {
        fontSize: 15,
        lineHeight: 20,
        fontWeight: '600',
        color: '#232323',
        marginBottom: 4,
    },
    newsExcerpt: {
        color: '#969696',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 4,
    },
    newsAuthor: {
        color: '#3C87FF',
        fontSize: 12,
    },
    emptyNewsBox: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    emptyNewsText: {
        color: '#7A7A7A',
        fontSize: 14,
    },
    infoBox: {
        backgroundColor: '#E4F5DF',
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    infoBoxText: {
        color: '#4A6950',
        fontSize: 13,
        lineHeight: 20,
    },
});
