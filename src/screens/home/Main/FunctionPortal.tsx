import React, {useEffect, useMemo, useState} from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {useAuthStore} from '@/stores/authStore';
import images from '@/assets/images';
import {HomeMenuItem, filterMenuByRole} from './menuConfig';
import {useDocumentStore} from '@/stores/documentStore';

type Props = {
    navigation: any;
    route: {
        params?: {
            category?: 'production' | 'office';
        };
    };
};

export default function FunctionPortal({navigation, route}: Props) {
    const {userInfo} = useAuthStore();
    const {fetchDocumentListWithTotal} = useDocumentStore();
    const category = route.params?.category || 'production';
    const [outgoingBadge, setOutgoingBadge] = useState(0);
    const [incomingBadge, setIncomingBadge] = useState(0);

    useEffect(() => {
        const loadDocumentBadge = async () => {
            const [outgoingResult, incomingResult] = await Promise.all([
                fetchDocumentListWithTotal({type: 'OUTGOING'}),
                fetchDocumentListWithTotal({type: 'INCOMING'}),
            ]);
            setOutgoingBadge(outgoingResult.total || 0);
            setIncomingBadge(incomingResult.total || 0);
        };

        loadDocumentBadge();
    }, [fetchDocumentListWithTotal]);

    const items = useMemo(
        () =>
            filterMenuByRole(userInfo).filter(
                item => item.category === category,
            ),
        [category, userInfo],
    );
    const itemsWithBadge = useMemo(
        () =>
            items.map(item => {
                if (item.key === 'outgoingDocument') {
                    return {...item, badgeCount: outgoingBadge};
                }
                if (item.key === 'incomingDocument') {
                    return {...item, badgeCount: incomingBadge};
                }
                return item;
            }),
        [incomingBadge, items, outgoingBadge],
    );

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}>

            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Chào buổi sáng</Text>
                    <Text style={styles.userName}>{userInfo.fullName}</Text>
                </View>

                <Image
                    source={
                        userInfo.avatar ? {uri: userInfo.avatar} : images.avatar
                    }
                    style={styles.avatar}
                />
            </View>

            <View style={styles.grid}>
                {itemsWithBadge.map((item: HomeMenuItem) => (
                    <TouchableOpacity
                        key={item.key}
                        style={styles.card}
                        activeOpacity={0.9}
                        onPress={() =>
                            navigation.navigate(item.navigateTo, {
                                navigateNext: item.navigateNext || null,
                                menuKey: item.key,
                            })
                        }>
                        {item.badgeCount ? (
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>
                                    {item.badgeCount}
                                </Text>
                            </View>
                        ) : null}

                        <Image
                            source={item.buttonImage}
                            style={styles.icon}
                            resizeMode="contain"
                        />
                        <Text style={styles.label}>{item.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        paddingHorizontal: 14,
        paddingTop: 8,
        paddingBottom: 24,
    },
    banner: {
        backgroundColor: '#4CAF50',
        borderRadius: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 14,
    },
    bannerText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '500',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    greeting: {
        color: '#7A7A7A',
        fontSize: 13,
        marginBottom: 2,
    },
    userName: {
        color: '#1B1B1B',
        fontSize: 24,
        fontWeight: '700',
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: '#F2F2F2',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    card: {
        width: '30.5%',
        minHeight: 88,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#E4E4E4',
        paddingHorizontal: 8,
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    icon: {
        width: 34,
        height: 34,
        marginBottom: 8,
    },
    label: {
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 16,
        color: '#1B1B1B',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#E24436',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: '700',
    },
});
