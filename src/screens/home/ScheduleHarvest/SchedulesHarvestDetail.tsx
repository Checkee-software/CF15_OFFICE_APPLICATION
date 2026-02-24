/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {View, Text, ScrollView, FlatList, Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {
    TypeDetailScheduleHarvest,
    TypeGroupProgress,
    useHarvestStore,
    fixAvatarPath,
} from '@/stores/harvestStore';
import {useAuthStore} from '@/stores/authStore';
import styles from './ScheduleHarvestStyle';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';
import {EHarvestStatus} from '@/shared-types/Response/HarvestResponse/HarvestResponse';
import moment from 'moment';
import {List} from 'react-native-paper';
import images from '@/assets/images';
import Loading from '@/screens/subscreen/Loading';

const SchedulesHarvestDetail = ({route}: any) => {
    const {userInfo} = useAuthStore();
    const {schedulesHarvestDetail, getDetailScheduleHarvest} =
        useHarvestStore();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const renderScheduleRemain = (finishedDate: string) => {
        if (schedulesHarvestDetail?.status === EHarvestStatus.COMPLETED) {
            return 'Hoàn thành';
        }

        const now = moment();

        const deadline = moment(finishedDate, 'DD/MM/YYYY'); // Chuyển string thành moment object với đúng định dạng

        // Tính khoảng cách
        const duration = moment.duration(deadline.diff(now));

        // Nếu thời gian đã trễ
        if (duration.asMilliseconds() < 0) {
            return 'Trễ hạn';
        }

        // Tính số ngày, giờ, phút
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();

        return `Còn ${days} ngày, ${hours} giờ ${minutes} phút`;
    };

    const renderStaff = (
        itemStaff: TypeDetailScheduleHarvest['followerIds'][number],
        index: number,
    ) => (
        <View style={styles.listWorkerMargin}>
            <View style={styles.workerCard}>
                <View style={styles.leftWorkerCard}>
                    <View style={styles.workerAvatar}>
                        <Image
                            source={
                                itemStaff?.avatar?.path
                                    ? {
                                          uri: fixAvatarPath(
                                              itemStaff.avatar.path,
                                          ),
                                      }
                                    : images.avatar
                            }
                            style={styles.avatar}
                        />
                    </View>

                    <View style={styles.workerNameAndUnit}>
                        <Text style={styles.workerName}>
                            {itemStaff?.fullName}
                        </Text>
                        <Text style={styles.workerUnit}>
                            {itemStaff?.groupId.name}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={styles.workerOrder}>{index + 1}</Text>
                </View>
            </View>
        </View>
    );

    const renderHarvestProgressForLeader = (
        itemProgress: TypeGroupProgress['users'][number],
    ) => {
        return (
            <View style={styles.listWorkerMargin2}>
                <Text style={styles.participantName}>
                    {itemProgress.userId.fullName}
                </Text>

                <Text
                    style={[
                        styles.participantName,
                        itemProgress.gardens.some(g => g.quantity > 0)
                            ? styles.participantStatus4
                            : styles.participantStatus1,
                    ]}>
                    {itemProgress.gardens
                        .map(
                            g =>
                                `${
                                    g.gardenId.code
                                }: ${g.quantity.toLocaleString('vi-VN')} (KG)`,
                        )
                        .join(', ')}
                </Text>
            </View>
        );
    };

    const renderHarvestProgressForOther = (itemProgress: TypeGroupProgress) => {
        return (
            <View style={styles.childTaskInfo2}>
                <Text style={styles.taskTitle}>
                    {`${itemProgress.name}: ${itemProgress.users.reduce(
                        (sumUser, user) =>
                            sumUser +
                            user.gardens.reduce(
                                (sumGarden, g) => sumGarden + g.quantity,
                                0,
                            ),
                        0,
                    )} (KG)`}
                </Text>
            </View>
        );
    };

    useEffect(() => {
        const handleGetDetailScheduleHarvest = async () => {
            setIsLoading(true);
            await getDetailScheduleHarvest(route.params._id);
            setIsLoading(false);
        };

        handleGetDetailScheduleHarvest();
    }, [route.params._id]);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <View style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                bounces={false}
                overScrollMode='never'
                contentContainerStyle={styles.scrollViewStyle}>
                <Text style={styles.mainWorkTitle}>
                    {schedulesHarvestDetail?.title}
                </Text>

                {userInfo.userType.level === EOrganization.LEADER && (
                    <View style={styles.mainWorkProgressSection}>
                        <View style={styles.warpMainWork}>
                            <Text style={styles.mainWorkSummary}>
                                Số CBQL/NLĐ
                            </Text>
                            <Text style={styles.statusText}>
                                {`${
                                    schedulesHarvestDetail?.followerIds
                                        ?.length ?? 0
                                }/${
                                    schedulesHarvestDetail?.employeeIds
                                        ?.length ?? 0
                                }`}
                            </Text>
                        </View>
                    </View>
                )}

                <Text
                    style={[
                        styles.timeWorkEnd,
                        {marginTop: 8, marginBottom: 4},
                    ]}>
                    {renderScheduleRemain(
                        moment(schedulesHarvestDetail?.finishedDate).format(
                            'L',
                        ),
                    )}
                </Text>

                <View style={styles.workInfoSection}>
                    <View style={styles.generalInfo}>
                        <Text style={styles.generalInfoText}>
                            Thông tin chung
                        </Text>

                        <View style={styles.warpLabelValue}>
                            <Text style={styles.infoLabel}>Cây trồng</Text>

                            <Text style={styles.infoValue}>
                                {schedulesHarvestDetail?.productTypeId.name}
                            </Text>
                        </View>

                        <View style={styles.warpLabelValue}>
                            <Text style={styles.infoLabel}>Khu vườn</Text>

                            <Text style={styles.infoValue}>
                                {schedulesHarvestDetail?.productId.name}
                            </Text>
                        </View>

                        <View style={styles.warpLabelValue}>
                            <Text style={styles.infoLabel}>Ngày bắt đầu</Text>

                            <Text style={styles.infoValue}>
                                {moment(
                                    schedulesHarvestDetail?.startedDate,
                                ).format('L')}
                            </Text>
                        </View>

                        <View style={styles.warpLabelValue}>
                            <Text style={styles.infoLabel}>Ngày kết thúc</Text>

                            <Text style={styles.infoValue}>
                                {moment(
                                    schedulesHarvestDetail?.finishedDate,
                                ).format('L')}
                            </Text>
                        </View>

                        <View style={styles.warpLabelValue}>
                            <Text style={styles.infoLabel}>Người tạo việc</Text>

                            <Text style={styles.infoValue}>
                                {schedulesHarvestDetail?.createdBy.fullName}
                            </Text>
                        </View>

                        <View style={styles.jobDescription}>
                            <Text style={styles.description}>
                                Mô tả công việc
                            </Text>

                            <Text style={styles.detail}>
                                {schedulesHarvestDetail?.description}
                            </Text>
                        </View>

                        <View style={styles.listAccordion}>
                            <List.Accordion
                                titleStyle={styles.titleAccordion1}
                                title={`Cán bộ quản lý (${schedulesHarvestDetail?.followerIds?.length})`}
                                style={styles.boxAccordion}
                                id='1'>
                                <FlatList
                                    scrollEnabled={false}
                                    data={schedulesHarvestDetail?.followerIds}
                                    renderItem={({item, index}) =>
                                        renderStaff(item, index)
                                    }
                                    keyExtractor={follower => follower._id}
                                />
                            </List.Accordion>

                            {userInfo.userType.level !==
                                EOrganization.LEADER && (
                                <List.Accordion
                                    titleStyle={styles.titleAccordion1}
                                    title='Tiến trình thu hoạch'
                                    style={styles.boxAccordion}
                                    id='2'>
                                    <View style={styles.listChildTasks}>
                                        <FlatList
                                            scrollEnabled={false}
                                            data={
                                                schedulesHarvestDetail?.groupProgress
                                            }
                                            renderItem={({item}) =>
                                                renderHarvestProgressForOther(
                                                    item,
                                                )
                                            }
                                            keyExtractor={item => item.groupId}
                                        />
                                    </View>
                                </List.Accordion>
                            )}

                            {userInfo.userType.level === EOrganization.LEADER &&
                                schedulesHarvestDetail?.groupProgress && (
                                    <>
                                        {schedulesHarvestDetail.groupProgress.map(
                                            item => (
                                                <List.Accordion
                                                    key={item.groupId}
                                                    titleStyle={
                                                        styles.titleAccordion1
                                                    }
                                                    title={`${
                                                        item.name
                                                    }: ${item.users
                                                        .reduce(
                                                            (sumUser, user) =>
                                                                sumUser +
                                                                user.gardens.reduce(
                                                                    (
                                                                        sumGarden,
                                                                        g,
                                                                    ) =>
                                                                        sumGarden +
                                                                        g.quantity,
                                                                    0,
                                                                ),
                                                            0,
                                                        )
                                                        .toLocaleString(
                                                            'vi-VN',
                                                        )} (KG)`}
                                                    style={styles.boxAccordion}
                                                    id='3'>
                                                    <FlatList
                                                        scrollEnabled={false}
                                                        data={item.users}
                                                        renderItem={({item}) =>
                                                            renderHarvestProgressForLeader(
                                                                item,
                                                            )
                                                        }
                                                        keyExtractor={item =>
                                                            item.userId._id
                                                        }
                                                    />
                                                </List.Accordion>
                                            ),
                                        )}

                                        <List.Accordion
                                            titleStyle={styles.titleAccordion1}
                                            title={`Người lao động (${schedulesHarvestDetail?.employeeIds?.length})`}
                                            style={styles.boxAccordion}
                                            id='4'>
                                            <FlatList
                                                scrollEnabled={false}
                                                data={
                                                    schedulesHarvestDetail?.employeeIds
                                                }
                                                renderItem={({item, index}) =>
                                                    renderStaff(item, index)
                                                }
                                                keyExtractor={item => item._id}
                                            />
                                        </List.Accordion>
                                    </>
                                )}
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
};

export default SchedulesHarvestDetail;
