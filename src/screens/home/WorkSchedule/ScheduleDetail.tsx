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
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import Snackbar from 'react-native-snackbar';
import {List} from 'react-native-paper';
import moment from 'moment';

const ScheduleDetail = ({route}: any) => {
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

    const scheduleDetail = route.params.itemWorkSchedule;

    console.log(route.params.itemWorkSchedule);

    const formatFileSize = (size: number) => {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else if (size >= 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${size} Bytes`;
        }
    };

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
        return `http://cf15officeservice.checkee.vn${updatedPath}`;
    };

    const renderScheduleRemain = (finishedDate: string) => {
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
                        {formatFileSize(itemAttachedFiles.size)}
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
                            source={{
                                uri: itemStaff.avatar,
                            }}
                            style={ScheduleDetailStyles.avatar}
                        />
                    </View>

                    <View style={ScheduleDetailStyles.workerNameAndUnit}>
                        <Text style={ScheduleDetailStyles.workerName}>
                            {itemStaff.fullName}
                        </Text>
                        <Text style={ScheduleDetailStyles.workerUnit}>
                            {/* {itemStaff.userType.unit} */}
                            Đội sản xuất phía Tây
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

    const renderChildTask = (itemChildTask: any) => (
        <View style={ScheduleDetailStyles.childTaskInfo}>
            <Text style={ScheduleDetailStyles.taskTitle}>
                {itemChildTask.name}
            </Text>

            <Text style={ScheduleDetailStyles.taskEndIn}>
                {`Kết thúc vào ${renderTaskEndIn(itemChildTask.finishedTime)}`}
            </Text>

            <View style={ScheduleDetailStyles.participant}>
                <View style={ScheduleDetailStyles.statusTask}>
                    <MaterialIcons
                        name='check-circle'
                        size={20}
                        color='#4CAF50'
                    />
                </View>
                <View style={ScheduleDetailStyles.warpParticipant}>
                    <Text style={ScheduleDetailStyles.participantName}>
                        Hà Hoàng A
                    </Text>
                    <Text
                        style={[
                            ScheduleDetailStyles.participantStatus,
                            ScheduleDetailStyles.participantStatus2,
                        ]}>
                        Đã làm 800/2500 (m2) 15:33 25/05/2025
                    </Text>
                </View>
            </View>

            <View style={ScheduleDetailStyles.participant}>
                <View style={ScheduleDetailStyles.statusTask}>
                    <MaterialIcons
                        name='check-circle'
                        size={20}
                        color='#FF4E45'
                    />
                </View>

                <View style={ScheduleDetailStyles.warpParticipant}>
                    <Text style={ScheduleDetailStyles.participantName}>
                        Hà Hoàng B
                    </Text>
                    <Text
                        style={[
                            ScheduleDetailStyles.participantStatus,
                            ScheduleDetailStyles.participantStatus3,
                        ]}>
                        (15:37 23/06/2025) Lý do: Sai yêu cầu
                    </Text>
                </View>
            </View>

            <View style={ScheduleDetailStyles.participant}>
                <View style={ScheduleDetailStyles.statusTask}>
                    <MaterialIcons
                        name='check-circle'
                        size={20}
                        color='#2196F3'
                    />
                </View>
                <View style={ScheduleDetailStyles.warpParticipant}>
                    <Text
                        style={[
                            ScheduleDetailStyles.participantName,
                            ScheduleDetailStyles.participantStatus2,
                        ]}>
                        Hà Hoàng C
                    </Text>
                    <Text
                        style={[
                            ScheduleDetailStyles.participantStatus,
                            ScheduleDetailStyles.participantStatus2,
                        ]}>
                        Đã làm 2500/2500 (m2) 15:33 25/05/2025
                    </Text>
                </View>
            </View>

            <View style={ScheduleDetailStyles.participant}>
                <View style={ScheduleDetailStyles.statusTask}>
                    <MaterialIcons
                        name='check-circle'
                        size={20}
                        color='#808080'
                    />
                </View>
                <View style={ScheduleDetailStyles.warpParticipant}>
                    <Text style={ScheduleDetailStyles.participantName}>
                        Hà Hoàng D
                    </Text>
                    <Text
                        style={[
                            ScheduleDetailStyles.participantStatus,
                            ScheduleDetailStyles.participantStatus1,
                        ]}>
                        Đã làm 0/2500 (m2)
                    </Text>
                </View>
            </View>
        </View>
    );

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
                            {`${scheduleDetail.employees.length}/${scheduleDetail.employees.length}`}
                        </Text>
                    </View>

                    <View style={ScheduleDetailStyles.warpMainWork}>
                        <Text style={ScheduleDetailStyles.mainWorkSummary}>
                            Tổng số công việc con
                        </Text>
                        <Text style={ScheduleDetailStyles.statusText}>
                            {scheduleDetail.childTasks.tasks.length}
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
                                Lâm Đình Phú
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Khu vườn
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                Khu vườn cà phê khoán
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Sản phẩm
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                Cà phê khoán
                            </Text>
                        </View>
                    </View>

                    <View style={ScheduleDetailStyles.generalInfo}>
                        <Text style={ScheduleDetailStyles.generalInfoText}>
                            Định mức
                        </Text>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Định mức nhân công
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                Công:{' '}
                                {new Intl.NumberFormat('vi-VN', {
                                    currency: 'VND',
                                }).format(500000)}
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Định mức vật tư
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                Bón phân Kali, phun thuốc trừ sâu
                            </Text>
                        </View>

                        <View style={ScheduleDetailStyles.warpLabelValue}>
                            <Text style={ScheduleDetailStyles.infoLabel}>
                                Định mức ca máy
                            </Text>

                            <Text style={ScheduleDetailStyles.infoValue}>
                                Ca phun nước
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
                        title='Cán bộ quản lý'
                        style={ScheduleDetailStyles.boxAccordion}
                        id='1'>
                        <FlatList
                            scrollEnabled={false}
                            data={scheduleDetail?.employees as any}
                            renderItem={({item, index}) =>
                                renderStaff(item, index)
                            }
                            keyExtractor={item => item._id}
                        />
                    </List.Accordion>

                    <List.Accordion
                        titleStyle={ScheduleDetailStyles.titleAccordion1}
                        title={`Người lao động (${scheduleDetail.employees.length})`}
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

                    <List.Accordion
                        titleStyle={ScheduleDetailStyles.titleAccordion2}
                        title={`Danh sách công việc con (${scheduleDetail.childTasks.tasks.length})`}
                        style={ScheduleDetailStyles.boxAccordion}
                        id='3'>
                        <View style={ScheduleDetailStyles.listChildTasks}>
                            <FlatList
                                scrollEnabled={false}
                                data={scheduleDetail?.childTasks.tasks as any}
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
        marginVertical: 5,
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
    childTaskInfo: {
        gap: 10,
        justifyContent: 'center',
        marginVertical: 10,
    },
    taskTitle: {
        color: '#212121',
        fontWeight: 600,
        fontSize: 14,
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
    },
    statusTask: {
        flex: 1,
    },
    warpParticipant: {
        flex: 9,
        gap: 4,
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
        color: '#808080',
    },
    participantStatus2: {
        color: '#2196F3',
    },
    participantStatus3: {
        color: '#FF4E45',
    },
});

export default ScheduleDetail;
