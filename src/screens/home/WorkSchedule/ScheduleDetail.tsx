/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
} from 'react-native';
import React, {useEffect} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';
import {List} from 'react-native-paper';
import moment from 'moment';
import {
    EScheduleStatus,
    ETaskStatus,
} from '@/shared-types/Response/ScheduleResponse/ScheduleResponse';
import images from '../../../assets/images';
import {useWorkScheduleStore} from '@/stores/workScheduleStore';
import {useAuthStore} from '@/stores/authStore';
import Loading from '@/screens/subscreen/Loading';
import ENV from '@/config/ENV';
import {EOrganization} from '@/shared-types/common/Permissions/Permissions';

const ScheduleDetail = ({route}: any) => {
    const {userInfo} = useAuthStore();
    const {isLoadingGet, scheduleDetail, getScheduleDetail} =
        useWorkScheduleStore();

    type AttachedFiles = {
        destination: string;
        encoding: string;
        fieldname: string;
        mimetype: string;
        originalname: string;
        filename: string;
        path: string;
        size: number;
    };

    const processesTitle = [
        {name: 'Loại'},
        {name: 'Tên'},
        {name: 'Định mức'},
        {name: 'Đơn giá (vnđ)'},
        {name: 'Thành tiền (vnđ)'},
    ];

    const formatFileSize = (size: number) => {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else if (size >= 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${size} Bytes`;
        }
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const formattedGardenArea =
        Number(scheduleDetail?.gardenArea) % 1 === 0
            ? formatNumber(scheduleDetail?.gardenArea ?? 0) // số nguyên
            : formatNumber(
                  Number(Number(scheduleDetail?.gardenArea ?? 0).toFixed(5)),
              ); // số thực

    const downloadFile = async (fileUrl: string, fileName: string) => {
        const updatedFileUrl = fixFilePath(fileUrl);
        try {
            const downloadDest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
            const options = {
                fromUrl: updatedFileUrl,
                toFile: downloadDest,
            };
            const result = await RNFS.downloadFile(options).promise;
            if (result.statusCode === 200) {
                Snackbar.show({
                    text: 'Đã tải tập tin về điện thoại của bạn!',
                    duration: Snackbar.LENGTH_LONG,
                });
            } else {
                Snackbar.show({
                    text: 'Tải file không thành công!',
                    duration: Snackbar.LENGTH_LONG,
                });
            }
        } catch (error) {
            Snackbar.show({
                text: 'Có lỗi xảy ra khi tải file.',
                duration: Snackbar.LENGTH_LONG,
            });
        }
    };

    const fixFilePath = (path: string) => {
        const updatedPath = path.replace(/\\/g, '/');
        return `${ENV.BACKEND_URL}${updatedPath}`;
    };

    const renderScheduleRemain = (finishedDate: string) => {
        if (scheduleDetail?.status === EScheduleStatus.COMPLETED) {
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

    const renderTaskEndIn = (finishedDate: string) => {
        const day = moment(finishedDate).format('L');
        const hour = moment(finishedDate).format('LT');
        return `${hour} ${day}`;
    };

    const renderItemAttachedFiles = (itemAttachedFiles: AttachedFiles) => (
        <View style={ScheduleDetailStyles.cardDocument}>
            <View style={ScheduleDetailStyles.leftCardDocument}>
                <MaterialCommunityIcons
                    name='text-box'
                    color={'rgba(255, 78, 69, 1)'}
                    size={28}
                />
                <View style={ScheduleDetailStyles.infoDocument}>
                    <Text style={ScheduleDetailStyles.infoDocumentText}>
                        {itemAttachedFiles.originalname}
                    </Text>
                    <Text style={ScheduleDetailStyles.infoDocumentSizeText}>
                        Kích cỡ: {formatFileSize(itemAttachedFiles.size)}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() =>
                    downloadFile(
                        itemAttachedFiles.path,
                        itemAttachedFiles.filename,
                    )
                }>
                <Feather
                    name='download'
                    color={'rgba(33, 150, 243, 1)'}
                    size={22}
                />
            </TouchableOpacity>
        </View>
    );

    const renderStaff = (itemStaff: any, index: number) => (
        <View style={ScheduleDetailStyles.listWorkerMargin}>
            <View style={ScheduleDetailStyles.workerCard}>
                <View style={ScheduleDetailStyles.leftWorkerCard}>
                    <View style={ScheduleDetailStyles.workerAvatar}>
                        <Image
                            source={
                                itemStaff.avatar
                                    ? {
                                          uri: itemStaff.avatar,
                                      }
                                    : images.avatar
                            }
                            style={ScheduleDetailStyles.avatar}
                        />
                    </View>

                    <View style={ScheduleDetailStyles.workerNameAndUnit}>
                        <Text style={ScheduleDetailStyles.workerName}>
                            {itemStaff.fullName}
                        </Text>
                        <Text style={ScheduleDetailStyles.workerUnit}>
                            {itemStaff.group}
                        </Text>
                    </View>
                </View>

                <View>
                    <Text style={ScheduleDetailStyles.workerOrder}>
                        {index + 1}
                    </Text>
                </View>
            </View>
        </View>
    );

    const renderMachinesHistory = (itemMachinesHistory: any) => (
        <View style={ScheduleDetailStyles.historyInfo}>
            <Text style={ScheduleDetailStyles.historyInfoLabel}>
                {itemMachinesHistory.name}
            </Text>

            {itemMachinesHistory.history ? (
                <View style={{gap: 20}}>
                    {itemMachinesHistory.history.map((item: any) => (
                        <View
                            key={item._id}
                            style={{
                                gap: 4,
                            }}>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    width: '100%',
                                    marginTop: 5,
                                }}>
                                <Text style={{flex: 1, textAlign: 'center'}}>
                                    Bắt đầu
                                </Text>
                                <Text style={{flex: 1, textAlign: 'center'}}>
                                    Kết thúc
                                </Text>
                            </View>
                            <Text style={{textAlign: 'center'}}>
                                {moment(item.startAt).format(
                                    'HH:mm DD/MM/YYYY',
                                )}{' '}
                                -{' '}
                                {item.endAt
                                    ? moment(item.endAt).format(
                                          'HH:mm DD/MM/YYYY',
                                      )
                                    : ''}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text
                    style={[
                        ScheduleDetailStyles.historyInfoValue,
                        {width: '100%'},
                    ]}>
                    Không có lịch sử hoạt động
                </Text>
            )}
        </View>
    );

    const renderChildTask = (itemChildTask: any) => (
        <View style={ScheduleDetailStyles.childTaskInfo}>
            <Text style={ScheduleDetailStyles.taskTitle}>
                {itemChildTask.name}
            </Text>

            {itemChildTask.labour &&
                userInfo.userType.level !== EOrganization.WORKER && (
                    <View style={ScheduleDetailStyles.listProcesses}>
                        <View
                            style={{
                                marginBottom: 15,
                            }}>
                            <FlatList
                                horizontal
                                data={processesTitle}
                                keyExtractor={item => item.name}
                                renderItem={({item, index}) => (
                                    <View
                                        style={{
                                            width: 108,
                                            alignItems: 'flex-start',
                                            justifyContent: 'flex-start',
                                        }}>
                                        <View>
                                            <Text
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 500,
                                                    textAlign:
                                                        index === 4 ||
                                                        index === 5
                                                            ? 'right'
                                                            : 'left',
                                                }}>
                                                {item.name}
                                            </Text>

                                            <View style={{marginVertical: 5}}>
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: 400,
                                                        textAlign:
                                                            index === 0 ||
                                                            index === 1
                                                                ? 'left'
                                                                : index === 3 ||
                                                                  index === 4
                                                                ? 'right'
                                                                : 'center',
                                                        color:
                                                            index === 0
                                                                ? '#2196F3'
                                                                : 'black',
                                                    }}>
                                                    {index === 0
                                                        ? 'Nhân công'
                                                        : index === 1
                                                        ? itemChildTask.labour
                                                              .name
                                                        : index === 2
                                                        ? itemChildTask.labour
                                                              .value
                                                        : index === 3
                                                        ? formatNumber(
                                                              itemChildTask
                                                                  .labour.cost,
                                                          )
                                                        : formatNumber(
                                                              itemChildTask
                                                                  .labour.cost *
                                                                  itemChildTask
                                                                      .labour
                                                                      .value,
                                                          )}
                                                </Text>
                                            </View>

                                            {itemChildTask.materials.length !==
                                                0 && (
                                                <View
                                                    style={{marginVertical: 5}}>
                                                    {itemChildTask.materials.map(
                                                        (
                                                            itemMaterials: any,
                                                        ) => (
                                                            <Text
                                                                key={
                                                                    itemMaterials._id
                                                                }
                                                                style={{
                                                                    fontSize: 12,
                                                                    fontWeight: 400,
                                                                    textAlign:
                                                                        index ===
                                                                            0 ||
                                                                        index ===
                                                                            1
                                                                            ? 'left'
                                                                            : index ===
                                                                                  3 ||
                                                                              index ===
                                                                                  4
                                                                            ? 'right'
                                                                            : 'center',
                                                                }}>
                                                                {index === 0
                                                                    ? 'Vật tư'
                                                                    : index ===
                                                                      1
                                                                    ? itemMaterials.name
                                                                    : index ===
                                                                      2
                                                                    ? itemMaterials.value
                                                                    : index ===
                                                                      3
                                                                    ? formatNumber(
                                                                          itemMaterials.cost,
                                                                      )
                                                                    : formatNumber(
                                                                          itemMaterials.cost *
                                                                              itemMaterials.value,
                                                                      )}
                                                            </Text>
                                                        ),
                                                    )}
                                                </View>
                                            )}

                                            {itemChildTask.machines.length !==
                                                0 && (
                                                <View
                                                    style={{marginVertical: 5}}>
                                                    {itemChildTask.machines.map(
                                                        (itemMachines: any) => (
                                                            <Text
                                                                key={
                                                                    itemMachines._id
                                                                }
                                                                style={{
                                                                    fontSize: 12,
                                                                    fontWeight: 400,
                                                                    textAlign:
                                                                        index ===
                                                                            0 ||
                                                                        index ===
                                                                            1
                                                                            ? 'left'
                                                                            : index ===
                                                                                  3 ||
                                                                              index ===
                                                                                  4
                                                                            ? 'right'
                                                                            : 'center',
                                                                    color:
                                                                        index ===
                                                                        0
                                                                            ? '#2196F3'
                                                                            : 'black',
                                                                }}>
                                                                {index === 0
                                                                    ? 'Ca máy'
                                                                    : index ===
                                                                      1
                                                                    ? itemMachines.name
                                                                    : index ===
                                                                      2
                                                                    ? itemMachines.value
                                                                    : index ===
                                                                      3
                                                                    ? formatNumber(
                                                                          itemMachines.cost,
                                                                      )
                                                                    : formatNumber(
                                                                          itemMachines.cost *
                                                                              itemMachines.value,
                                                                      )}
                                                            </Text>
                                                        ),
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )}
                            />
                        </View>
                    </View>
                )}

            {/* <Text style={ScheduleDetailStyles.taskEndIn}>
                {`Kết thúc vào ${renderTaskEndIn(itemChildTask.finishedTime)}`}
            </Text> */}

            <FlatList
                scrollEnabled={false}
                data={itemChildTask.staff}
                keyExtractor={item => item.userId}
                renderItem={(itemStaff: any) => (
                    <View style={ScheduleDetailStyles.participant}>
                        <View style={ScheduleDetailStyles.statusTask}>
                            <MaterialIcons
                                name='check-circle'
                                size={20}
                                color={
                                    itemStaff.item.status ===
                                    ETaskStatus.WAITING
                                        ? '#808080'
                                        : itemStaff.item.status ===
                                          ETaskStatus.PROCESSING
                                        ? '#2196F3'
                                        : itemStaff.item.status ===
                                          ETaskStatus.COMPLETED
                                        ? '#4CAF50'
                                        : '#FF4E45'
                                }
                            />
                        </View>
                        <View style={ScheduleDetailStyles.warpParticipant}>
                            <Text style={ScheduleDetailStyles.participantName}>
                                {itemStaff.item.name}
                            </Text>
                            <Text
                                style={[
                                    ScheduleDetailStyles.participantStatus,
                                    itemStaff.item.status ===
                                    ETaskStatus.WAITING
                                        ? ScheduleDetailStyles.participantStatus1
                                        : itemStaff.item.status ===
                                          ETaskStatus.CANCELED
                                        ? ScheduleDetailStyles.participantStatus3
                                        : ETaskStatus.PROCESSING
                                        ? ScheduleDetailStyles.participantStatus2
                                        : ScheduleDetailStyles.participantStatus4,
                                ]}>
                                {itemStaff.item.status === ETaskStatus.CANCELED
                                    ? `(${moment(
                                          itemStaff.item.canceledTime,
                                      ).format('L')}) Lý do: ${
                                          itemStaff.item.canceledNote
                                      }`
                                    : 'Đã làm ' +
                                      formatNumber(
                                          itemStaff.item.processingRate,
                                      ) +
                                      '/' +
                                      formattedGardenArea +
                                      ' (' +
                                      scheduleDetail?.gardenAreaType +
                                      ') ' +
                                      (itemStaff.item.completedTime === null
                                          ? ''
                                          : `${moment(
                                                itemStaff.item.completedTime,
                                            ).format('L')}`)}
                            </Text>
                        </View>
                    </View>
                )}
            />
        </View>
    );

    useEffect(() => {
        getScheduleDetail(route.params._id);
    }, []);

    if (isLoadingGet) return <Loading />;

    return (
        <View style={ScheduleDetailStyles.container}>
            <ScrollView
                contentContainerStyle={ScheduleDetailStyles.scrollViewStyle}>
                <Text style={ScheduleDetailStyles.mainWorkTitle}>
                    {scheduleDetail?.title}
                </Text>

                <View style={ScheduleDetailStyles.mainWorkProgressSection}>
                    <View style={ScheduleDetailStyles.warpMainWork}>
                        <Text style={ScheduleDetailStyles.mainWorkSummary}>
                            Số CBQL/NLĐ
                        </Text>
                        <Text style={ScheduleDetailStyles.statusText}>
                            {`${scheduleDetail?.followers?.length ?? 0}/${
                                scheduleDetail?.employees?.length ?? 0
                            }`}
                        </Text>
                    </View>

                    <View style={ScheduleDetailStyles.warpMainWork}>
                        <Text style={ScheduleDetailStyles.mainWorkSummary}>
                            Tổng số quy trình làm việc
                        </Text>
                        <Text style={ScheduleDetailStyles.statusText}>
                            {scheduleDetail?.childTasks.length}
                        </Text>
                    </View>
                </View>

                <Text style={ScheduleDetailStyles.timeWorkEnd}>
                    {renderScheduleRemain(
                        moment(scheduleDetail?.finishedDate).format('L'),
                    )}
                </Text>

                <View style={ScheduleDetailStyles.workInfoSection}>
                    <View style={ScheduleDetailStyles.generalInfo}>
                        <Text style={ScheduleDetailStyles.generalInfoText}>
                            Thông tin chung
                        </Text>
                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Ngày bắt đầu
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                {moment(scheduleDetail?.startedDate).format(
                                    'L',
                                )}
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Ngày kết thúc
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                {moment(scheduleDetail?.finishedDate).format(
                                    'L',
                                )}
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Người tạo việc
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                {scheduleDetail?.createdUser}
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Khu vườn
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                {scheduleDetail?.gardenName}
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Loại cây trồng
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                {scheduleDetail?.productName}
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Cây trồng
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                {scheduleDetail?.gardenName}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={ScheduleDetailStyles.jobDescription}>
                    <Text style={ScheduleDetailStyles.description}>
                        Mô tả công việc
                    </Text>

                    <Text style={ScheduleDetailStyles.detail}>
                        {scheduleDetail?.description}
                    </Text>
                </View>

                {scheduleDetail?.files.length !== 0 ? (
                    <View style={ScheduleDetailStyles.attachedFile}>
                        <Text
                            style={
                                ScheduleDetailStyles.description
                            }>{`Tệp đính kèm (${scheduleDetail?.files.length})`}</Text>
                        <FlatList
                            scrollEnabled={false}
                            data={scheduleDetail?.files}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) =>
                                renderItemAttachedFiles(item)
                            }
                        />
                    </View>
                ) : null}

                <View style={ScheduleDetailStyles.listAccordion}>
                    <List.Accordion
                        titleStyle={ScheduleDetailStyles.titleAccordion1}
                        title={`Cán bộ quản lý (${scheduleDetail?.followers?.length})`}
                        style={ScheduleDetailStyles.boxAccordion}
                        id='1'>
                        <FlatList
                            scrollEnabled={false}
                            data={scheduleDetail?.followers as any}
                            renderItem={({item, index}) =>
                                renderStaff(item, index)
                            }
                            keyExtractor={item => item._id}
                        />
                    </List.Accordion>

                    <List.Accordion
                        titleStyle={ScheduleDetailStyles.titleAccordion1}
                        title={`Người lao động (${scheduleDetail?.employees?.length})`}
                        style={ScheduleDetailStyles.boxAccordion}
                        id='2'>
                        <FlatList
                            scrollEnabled={false}
                            data={scheduleDetail?.employees as any}
                            renderItem={({item, index}) =>
                                renderStaff(item, index)
                            }
                            keyExtractor={item => item._id}
                        />
                    </List.Accordion>

                    {/* <List.Accordion
                        titleStyle={ScheduleDetailStyles.titleAccordion1}
                        title={`Lịch sử ca máy (${scheduleDetail?.machines.length})`}
                        style={ScheduleDetailStyles.boxAccordion}
                        id='3'>
                        <View style={ScheduleDetailStyles.historyInfoContainer}>
                            <FlatList
                                scrollEnabled={false}
                                data={scheduleDetail?.machines as any}
                                renderItem={({item}) =>
                                    renderMachinesHistory(item)
                                }
                                keyExtractor={item => item._id}
                            />
                        </View>
                    </List.Accordion> */}

                    <List.Accordion
                        titleStyle={ScheduleDetailStyles.titleAccordion2}
                        title={`Danh sách quy trình (${scheduleDetail?.childTasks.length})`}
                        style={ScheduleDetailStyles.boxAccordion}
                        id='3'>
                        <View style={ScheduleDetailStyles.listChildTasks}>
                            <FlatList
                                scrollEnabled={false}
                                data={scheduleDetail?.childTasks as any}
                                renderItem={({item}) => renderChildTask(item)}
                                keyExtractor={item => item._id}
                            />
                        </View>
                    </List.Accordion>
                </View>
            </ScrollView>
        </View>
    );
};

const ScheduleDetailStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        position: 'relative',
    },
    scrollViewStyle: {
        gap: 10,
        paddingHorizontal: 20,
    },
    mainWorkTitle: {
        color: '#000000',
        fontWeight: 600,
        fontSize: 16,
    },
    mainWorkProgressSection: {
        flexDirection: 'row',
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 20,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        justifyContent: 'space-between',
    },
    warpMainWork: {
        gap: 12,
        marginBottom: 8,
        alignItems: 'center',
    },
    mainWorkSummary: {
        fontSize: 13,
        fontWeight: 400,
        color: '#000000',
    },
    statusText: {
        fontWeight: 500,
        fontSize: 13,
        color: '#2196F3',
        margin: 'auto',
    },
    timeWorkEnd: {
        marginTop: 12,
        fontWeight: 600,
        fontStyle: 'italic',
        fontSize: 16,
        color: '#212121',
        textAlign: 'center',
    },
    workInfoSection: {
        marginVertical: 10,
        gap: 20,
    },
    generalInfo: {
        gap: 2,
    },
    generalInfoText: {
        fontWeight: 600,
        fontSize: 13,
        marginBottom: 4,
    },
    warpLabelValue: {
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
    },
    warpLabel: {
        gap: 10,
        width: '50%',
    },
    infoLabel: {
        fontWeight: 400,
        fontSize: 13,
        color: '#212121',
        width: '50%',
    },
    infoValue: {
        color: '#212121',
        fontWeight: 500,
        fontSize: 13,
        textAlign: 'right',
        width: '50%',
    },
    jobDescription: {
        gap: 10,
        marginVertical: 10,
    },
    description: {
        color: '#212121',
        fontWeight: 500,
        fontSize: 13,
        textAlign: 'center',
    },
    detail: {
        fontWeight: 400,
        fontSize: 13,
        color: '#212121',
    },
    attachedFile: {
        marginVertical: 10,
        gap: 10,
    },
    cardDocument: {
        borderRadius: 8,
        padding: 10,
        flex: 1,
        backgroundColor: 'rgba(128, 128, 128, 0.15)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    leftCardDocument: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 10,
    },
    infoDocument: {
        width: '85%',
    },
    infoDocumentText: {
        fontSize: 11,
    },
    infoDocumentSizeText: {
        fontSize: 11,
        color: 'rgba(128, 128, 128, 1)',
    },
    listAccordion: {
        gap: 10,
        marginHorizontal: -12,
        marginVertical: 15,
    },
    boxAccordion: {
        paddingRight: 6,
        paddingVertical: 0,
        backgroundColor: '#fff',
    },
    titleAccordion1: {
        marginLeft: -4,
        fontSize: 14,
        fontWeight: 700,
    },
    titleAccordion2: {
        marginLeft: -4,
        fontSize: 14,
        fontWeight: 600,
    },
    listWorkerMargin: {
        marginVertical: 8,
    },
    workerCard: {
        marginHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftWorkerCard: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        width: '98%',
    },
    workerAvatar: {
        backgroundColor: 'rgba(211, 211, 211, 1)',
        borderRadius: '50%',
        width: 48,
        height: 48,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 24,
        margin: 'auto',
    },
    workerNameAndUnit: {
        gap: 2,
        width: '70%',
    },
    workerName: {
        color: 'rgba(76, 175, 80, 1)',
        fontWeight: 600,
        fontSize: 15,
        textTransform: 'capitalize',
    },
    workerUnit: {
        textTransform: 'capitalize',
        fontSize: 13,
        fontWeight: 400,
        color: 'rgba(0, 0, 0, 1)',
    },
    workerOrder: {
        color: 'rgba(128, 128, 128, 1)',
        fontWeight: 400,
        fontSize: 13,
    },
    listChildTasks: {
        paddingHorizontal: 15,
    },
    historyInfoContainer: {
        paddingHorizontal: 5,
    },
    historyInfo: {
        marginVertical: 8,
        width: '100%',
        backgroundColor: '#2196F31A',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 2,
    },
    historyInfoLabel: {
        fontWeight: 600,
        fontSize: 14,
        color: '#212121',
    },
    historyInfoValue: {
        color: '#212121',
        fontWeight: 400,
        fontSize: 13,
        width: '50%',
        flexShrink: 1,
    },
    childTaskInfo: {
        gap: 12,
        justifyContent: 'center',
        marginVertical: 10,
    },
    taskTitle: {
        color: '#212121',
        fontWeight: 600,
        fontSize: 14,
    },
    listProcesses: {
        paddingVertical: 5,
        borderStyle: 'dashed',
        borderBottomWidth: 1,
        borderBottomColor: '#808080',
        marginBottom: 5,
    },
    taskEndIn: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: 400,
        flexShrink: 1,
        textAlign: 'right',
    },
    participant: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 5,
    },
    statusTask: {
        flex: 1,
    },
    warpParticipant: {
        flex: 8,
        gap: 5,
        marginVertical: 5,
    },
    participantName: {
        fontSize: 13,
        fontWeight: 500,
    },
    participantStatus: {
        fontSize: 13,
        fontWeight: 400,
    },
    participantStatus1: {
        color: '#808080', //chưa làm
    },
    participantStatus2: {
        color: '#2196F3', //đang làm
    },
    participantStatus3: {
        color: '#FF4E45', //đã hủy
    },
    participantStatus4: {
        color: '#4CAF50', //đã xong
    },
});

export default ScheduleDetail;
