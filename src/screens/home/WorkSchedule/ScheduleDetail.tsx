/* eslint-disable react-native/no-inline-styles */
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
    Image,
    TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import * as Progress from 'react-native-progress';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Feather from 'react-native-vector-icons/Feather';
import RNFS from 'react-native-fs';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Snackbar from 'react-native-snackbar';
import CheckBox from 'react-native-check-box';
import {EScheduleStatus} from '@/shared-types/Response/ScheduleResponse/ScheduleResponse';
import moment from 'moment';

const ScheduleDetail = ({route}: any) => {
    const scheduleDetail = route.params.itemWorkSchedule;

    const [showListRadioButton, setShowListRadioButton] = useState(false);
    const [radioSelectedType, setRadioSelectedType] = useState(0);
    const [currentSelectedChildTask, setCurrentSelectedChildTask] =
        useState('');
    const [currentSelectedStaff, setCurrentSelectedStaff] = useState('');
    const [cancelReason, setCancelReason] = useState('');

    const [isCheckList, setIsCheckList] = useState([]);

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

    const formatFileSize = (size: number) => {
        if (size >= 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        } else if (size >= 1024) {
            return `${(size / 1024).toFixed(2)} KB`;
        } else {
            return `${size} Bytes`;
        }
    };

    const renderStatusText = (status: string) => {
        if (status === EScheduleStatus.PENDING) {
            return 'Đang chờ';
        } else if (status === EScheduleStatus.PROCESSING) {
            return 'Đang thực hiện';
        } else if (status === EScheduleStatus.ALMOST_EXPIRE) {
            return 'Sắp hết hạn';
        } else if (status === EScheduleStatus.COMPLETED) {
            return 'Hoàn thành';
        } else if (status === EScheduleStatus.EXPIRED) {
            return 'Trễ hạn';
        } else {
            return 'Đã huỷ';
        }
    };

    const renderScheduleRemain = (finishedDate: string) => {
        const targetTime = moment(finishedDate);
        const now = moment();

        // Tính khoảng cách
        const duration = moment.duration(targetTime.diff(now));

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
                            Trưởng đơn vị 1
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

    const renderChildTaskJustSeen = (itemChildTask: any) => (
        <View style={ScheduleDetailStyles.warpChildTask}>
            <View
                style={[ScheduleDetailStyles.rightChildTask, {width: '100%'}]}>
                <Text
                    style={
                        itemChildTask.staff.every(
                            item => item.status === 'COMPLETED',
                        )
                            ? ScheduleDetailStyles.taskTitleIsDone
                            : ScheduleDetailStyles.taskTitleNotDone
                    }>
                    {itemChildTask.name}
                </Text>

                <View style={ScheduleDetailStyles.progressTask}>
                    <Text
                        style={
                            itemChildTask.staff.every(
                                item => item.status === 'COMPLETED',
                            )
                                ? ScheduleDetailStyles.taskTitleIsDone
                                : ScheduleDetailStyles.taskTitleNotDone
                        }>
                        {`${itemChildTask.completedPercent}%`}
                    </Text>
                    <Text style={ScheduleDetailStyles.taskEndIn}>
                        {`Kết thúc vào ${renderTaskEndIn(
                            itemChildTask.finishedTime,
                        )}`}
                    </Text>
                </View>

                <View style={ScheduleDetailStyles.taskParticipant}>
                    {itemChildTask.staff.map((itemStaff: any) => (
                        <View
                            style={ScheduleDetailStyles.warpParticipant}
                            key={itemStaff.userId}>
                            {itemStaff.completedTime !== null ? (
                                <>
                                    <MaterialIcons
                                        name='check-circle'
                                        size={20}
                                        color='#4CAF50'
                                    />

                                    <View
                                        style={
                                            ScheduleDetailStyles.warpInfoParticipant
                                        }>
                                        <Text
                                            style={
                                                ScheduleDetailStyles.staffName
                                            }>
                                            {itemStaff.name}
                                        </Text>
                                        <Text
                                            style={
                                                ScheduleDetailStyles.taskDoneWhen
                                            }>
                                            {`Hoàn thành lúc ${renderTaskEndIn(
                                                itemStaff.completedTime,
                                            )}`}
                                        </Text>
                                    </View>
                                </>
                            ) : itemStaff.status === 'CANCELED' ? (
                                <>
                                    <>
                                        <AntDesign
                                            name='closecircle'
                                            size={20}
                                            color='#FF4E45'
                                        />

                                        <View
                                            style={
                                                ScheduleDetailStyles.warpInfoParticipant
                                            }>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.cancelStaffName
                                                }>
                                                {itemStaff.name}
                                            </Text>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.taskCancelWhen
                                                }>
                                                {`Đã hủy lúc ${renderTaskEndIn(
                                                    itemStaff.canceledTime,
                                                )}`}
                                            </Text>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.taskCancelReason
                                                }>
                                                {`Lý do: ${itemStaff.canceledNote}`}
                                            </Text>
                                        </View>
                                    </>
                                </>
                            ) : itemStaff.workingPercent === 100 &&
                              itemStaff.status === 'COMPLETED' ? (
                                <>
                                    <CheckBox
                                        isChecked={itemStaff.staffComfirmCheck}
                                        onClick={() =>
                                            handleToggleStaffCheck(
                                                itemChildTask._id,
                                                itemStaff.userId,
                                            )
                                        }
                                    />

                                    <View
                                        style={
                                            ScheduleDetailStyles.warpInfoParticipant
                                        }>
                                        <Text
                                            style={
                                                ScheduleDetailStyles.staffName
                                            }>
                                            {itemStaff.name}
                                        </Text>
                                        <Text
                                            style={
                                                ScheduleDetailStyles.taskWaitingBrowse
                                            }>
                                            {`Đã xong lúc ${itemStaff.subCompletedTime}`}
                                        </Text>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View
                                        style={
                                            ScheduleDetailStyles.warpInfoParticipant
                                        }>
                                        <Text
                                            style={
                                                ScheduleDetailStyles.staffName
                                            }>
                                            {itemStaff.name}
                                        </Text>
                                        <Text
                                            style={
                                                ScheduleDetailStyles.taskIsProcessing
                                            }>
                                            Tiến độ {itemStaff.workingPercent}%
                                        </Text>
                                    </View>
                                </>
                            )}
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderChildTask = (itemChildTask: any) => {
        const itemCheck = isCheckList.find(
            (checkItem: any) => checkItem.taskId === itemChildTask._id,
        );

        if (!itemCheck) return null;

        return (
            <View style={ScheduleDetailStyles.warpChildTask}>
                {scheduleDetail.status === 'COMPLETED' ? (
                    <MaterialIcons
                        name='check-circle'
                        size={20}
                        color='#4CAF50'
                    />
                ) : (
                    <CheckBox
                        onClick={() =>
                            handleToggleMainTaskClick(scheduleDetail._id)
                        }
                        checkedCheckBoxColor='rgb(255, 166, 33)'
                        isChecked={itemCheck.taskComfirmCheck}
                        disabled={
                            itemCheck.staff.every(
                                (item: any) => item.staffComfirmCheck,
                            )
                                ? false
                                : true
                        }
                        checkBoxColor={
                            itemCheck.status === 'WAITING' ? '#B0B0B0' : '#000'
                        }
                    />
                )}
                <View style={ScheduleDetailStyles.rightChildTask}>
                    <Text
                        style={
                            itemCheck.staff.every(
                                (item: any) => item.staffComfirmCheck,
                            )
                                ? ScheduleDetailStyles.taskTitleIsDone
                                : itemCheck.isStepByStep &&
                                  itemCheck.status === 'WAITING'
                                ? ScheduleDetailStyles.stepByStepTaskTitleNotDone
                                : ScheduleDetailStyles.taskTitleNotDone
                        }>
                        {itemChildTask.name}
                    </Text>

                    <View style={ScheduleDetailStyles.progressTask}>
                        <Text
                            style={
                                itemCheck.staff.every(
                                    (item: any) => item.staffComfirmCheck,
                                )
                                    ? ScheduleDetailStyles.taskTitleIsDone
                                    : itemCheck.isStepByStep &&
                                      itemCheck.status === 'WAITING'
                                    ? ScheduleDetailStyles.stepByStepTaskTitleNotDone
                                    : ScheduleDetailStyles.taskTitleNotDone
                            }>
                            {`${itemChildTask.completedPercent}%`}
                        </Text>

                        <Text
                            style={
                                itemCheck.isStepByStep &&
                                itemCheck.status === 'WAITING'
                                    ? ScheduleDetailStyles.stepByStepTaskEndIn
                                    : ScheduleDetailStyles.taskEndIn
                            }>
                            {`Kết thúc vào ${renderTaskEndIn(
                                itemChildTask.finishedTime,
                            )}`}
                        </Text>
                    </View>

                    <View style={ScheduleDetailStyles.taskParticipant}>
                        {itemCheck.staff.map((itemStaff: any) => (
                            <View
                                style={ScheduleDetailStyles.warpParticipant}
                                key={itemStaff.userId}>
                                {itemStaff.completedTime !== null ? (
                                    <>
                                        <MaterialIcons
                                            name='check-circle'
                                            size={20}
                                            color='#4CAF50'
                                        />

                                        <View
                                            style={
                                                ScheduleDetailStyles.warpInfoParticipant
                                            }>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.staffName
                                                }>
                                                {itemStaff.name}
                                            </Text>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.taskDoneWhen
                                                }>
                                                {`Hoàn thành lúc ${renderTaskEndIn(
                                                    itemStaff.completedTime,
                                                )}`}
                                            </Text>
                                        </View>
                                    </>
                                ) : itemStaff.status === 'CANCELED' ? (
                                    <>
                                        <>
                                            <AntDesign
                                                name='closecircle'
                                                size={20}
                                                color='#FF4E45'
                                            />

                                            <View
                                                style={
                                                    ScheduleDetailStyles.warpInfoParticipant
                                                }>
                                                <Text
                                                    style={
                                                        ScheduleDetailStyles.cancelStaffName
                                                    }>
                                                    {itemStaff.name}
                                                </Text>
                                                <Text
                                                    style={
                                                        ScheduleDetailStyles.taskCancelWhen
                                                    }>
                                                    {`Đã hủy lúc ${renderTaskEndIn(
                                                        itemStaff.canceledTime,
                                                    )}`}
                                                </Text>
                                                <Text
                                                    style={
                                                        ScheduleDetailStyles.taskCancelReason
                                                    }>
                                                    {`Lý do: ${itemStaff.canceledNote}`}
                                                </Text>
                                            </View>
                                        </>
                                    </>
                                ) : itemStaff.workingPercent === 100 &&
                                  itemStaff.status === 'COMPLETED' ? (
                                    <>
                                        <CheckBox
                                            isChecked={
                                                itemStaff.staffComfirmCheck
                                            }
                                            onClick={() =>
                                                handleToggleStaffCheck(
                                                    itemChildTask._id,
                                                    itemStaff.userId,
                                                )
                                            }
                                        />

                                        <View
                                            style={
                                                ScheduleDetailStyles.warpInfoParticipant
                                            }>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.staffName
                                                }>
                                                {itemStaff.name}
                                            </Text>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.taskWaitingBrowse
                                                }>
                                                {`Đã xong lúc ${itemStaff.subCompletedTime}`}
                                            </Text>
                                        </View>
                                    </>
                                ) : (
                                    <>
                                        <CheckBox
                                            isChecked={
                                                itemStaff.staffComfirmCheck
                                            }
                                            onClick={() =>
                                                handleToggleStaffCheck(
                                                    itemChildTask._id,
                                                    itemStaff.userId,
                                                )
                                            }
                                            disabled={
                                                itemCheck.status === 'WAITING'
                                                    ? true
                                                    : false
                                            }
                                            checkBoxColor={
                                                itemCheck.status === 'WAITING'
                                                    ? '#B0B0B0'
                                                    : '#000'
                                            }
                                        />
                                        <View
                                            style={
                                                ScheduleDetailStyles.warpInfoParticipant
                                            }>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.staffName
                                                }>
                                                {itemStaff.name}
                                            </Text>
                                            <Text
                                                style={
                                                    ScheduleDetailStyles.taskIsProcessing
                                                }>
                                                Tiến độ{' '}
                                                {itemStaff.workingPercent}%
                                            </Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        );
    };

    const renderComfirmView = () => {
        if (radioSelectedType === 1) {
            return (
                <View style={ScheduleDetailStyles.comfirmView}>
                    <Text style={ScheduleDetailStyles.comfirmViewText}>
                        Chắc chắn muốn xác nhận công việc của nhân sự này?
                    </Text>

                    <View style={ScheduleDetailStyles.listComfirmBtn}>
                        <TouchableOpacity
                            style={ScheduleDetailStyles.cancelBtnBrowseTask}
                            onPress={() => setRadioSelectedType(0)}>
                            <Text
                                style={
                                    ScheduleDetailStyles.cancelBtnTextBrowseTask
                                }>
                                Hủy bỏ
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleComfirmSelectedRadio}
                            style={ScheduleDetailStyles.comfirmBtnBrowseTask}>
                            <Text
                                style={
                                    ScheduleDetailStyles.comfirmBtnTextBrowseTask
                                }>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else if (radioSelectedType === 2) {
            return (
                <View style={ScheduleDetailStyles.comfirmView}>
                    <Text style={ScheduleDetailStyles.comfirmViewText}>
                        Chắc chắn muốn khởi tạo lại tiến độ công việc của nhân
                        sự này?
                    </Text>

                    <View style={ScheduleDetailStyles.listComfirmBtn}>
                        <TouchableOpacity
                            style={ScheduleDetailStyles.comfirmBtnBrowseTask}
                            onPress={() => setRadioSelectedType(0)}>
                            <Text
                                style={
                                    ScheduleDetailStyles.comfirmBtnTextBrowseTask
                                }>
                                Hủy bỏ
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleComfirmSelectedRadio}
                            style={ScheduleDetailStyles.comfirmBtnRedoTask}>
                            <Text
                                style={
                                    ScheduleDetailStyles.comfirmBtnTextRedoTask
                                }>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={ScheduleDetailStyles.comfirmView}>
                    <Text style={ScheduleDetailStyles.comfirmViewText}>
                        Chắc chắn muốn huỷ bỏ tiến độ công việc của nhân sự này?
                    </Text>

                    <TextInput
                        style={ScheduleDetailStyles.cancelProgressInput}
                        placeholder='Nhập lý do huỷ...'
                        placeholderTextColor={'#808080'}
                        multiline
                        numberOfLines={5}
                        onChangeText={setCancelReason}
                    />

                    <View style={ScheduleDetailStyles.listComfirmBtn}>
                        <TouchableOpacity
                            style={
                                ScheduleDetailStyles.cancelBtnCanelProgressTask
                            }
                            onPress={() => setRadioSelectedType(0)}>
                            <Text
                                style={
                                    ScheduleDetailStyles.cancelBtnTextCanelProgressTask
                                }>
                                Hủy bỏ
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleComfirmSelectedRadio}
                            style={
                                ScheduleDetailStyles.comfirmBtnCanelProgressTask
                            }>
                            <Text
                                style={
                                    ScheduleDetailStyles.comfirmBtnTextCanelProgressTask
                                }>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    };

    const renderComfirmBrowseMainTask = () => {
        return (
            <View style={ScheduleDetailStyles.comfirmViewMainTask}>
                <Text style={ScheduleDetailStyles.comfirmMainTaskText}>
                    Có chắc chắn hoàn thành công việc con này không?
                </Text>

                <View>
                    <View style={ScheduleDetailStyles.listComfirmBtn}>
                        <TouchableOpacity
                            style={ScheduleDetailStyles.cancelBtnBrowseTask}
                            onPress={() => setCurrentSelectedChildTask('')}>
                            <Text
                                style={
                                    ScheduleDetailStyles.cancelBtnTextBrowseTask
                                }>
                                Hủy bỏ
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={ScheduleDetailStyles.comfirmBtnBrowseTask}>
                            <Text
                                style={
                                    ScheduleDetailStyles.comfirmBtnTextBrowseTask
                                }>
                                Xác nhận
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const handleToggleStaffCheck = (taskId: string, userId: string) => {
        const _isCheckList = isCheckList.map(taskItem => {
            if (taskItem.taskId !== taskId) return taskItem;

            const updatedStaff = taskItem.staff.map(staffItem => {
                if (staffItem.userId === userId) {
                    return {
                        ...staffItem,
                        staffComfirmCheck: !staffItem.staffComfirmCheck,
                    };
                } else if (!staffItem.staffCheck) {
                    return {
                        ...staffItem,
                        staffComfirmCheck: false,
                    };
                }

                return staffItem;
            });

            return {
                ...taskItem,
                staff: updatedStaff,
            };
        });

        setIsCheckList(_isCheckList);

        if (currentSelectedStaff === userId) {
            setCurrentSelectedStaff('');
            setShowListRadioButton(false);
        } else {
            setCurrentSelectedStaff(userId);
            if (showListRadioButton === false) {
                setShowListRadioButton(true);
            }
        }
    };

    const handleToggleMainTaskClick = (mainTaskId: string) => {
        //console.log(mainTaskId);
    };

    const handleComfirmSelectedRadio = () => {
        if (radioSelectedType === 1) {
            //console.log(radioSelectedType, currentSelectedStaff);
        } else if (radioSelectedType === 2) {
            //console.log(radioSelectedType, currentSelectedStaff);
        } else {
            //console.log(radioSelectedType, currentSelectedStaff, cancelReason);
        }
    };

    useEffect(() => {
        if (scheduleDetail && scheduleDetail.status === 'PROCESSING') {
            setIsCheckList(() =>
                scheduleDetail.childTasks.tasks.map((taskItem: any) => {
                    // const allStaffCompleted = taskItem.staff.every(
                    //     (staffItem: any) => staffItem.completedTime !== null,
                    // );

                    return {
                        isStepByStep: scheduleDetail.childTasks.isStepByStep,
                        taskComfirmCheck: false,
                        taskId: taskItem._id,
                        name: taskItem.name,
                        status: taskItem.status,
                        staff: taskItem.staff.map((staffItem: any) => {
                            const isCompleted =
                                staffItem.completedTime !== null ||
                                staffItem.canceledTime !== null;
                            return {
                                userId: staffItem.userId,
                                name: staffItem.name,
                                status: staffItem.status,
                                workingPercent: staffItem.workingPercent,
                                subCompletedTime: staffItem.subCompletedTime,
                                completedTime: staffItem.completedTime,
                                canceledTime: staffItem.canceledTime,
                                canceledNote: staffItem.canceledNote,
                                staffCheck: isCompleted,
                                staffComfirmCheck: isCompleted,
                            };
                        }),
                    };
                }),
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <View style={ScheduleDetailStyles.container}>
            <ScrollView
                contentContainerStyle={ScheduleDetailStyles.scrollViewStyle}>
                <Text style={ScheduleDetailStyles.mainWorkTitle}>
                    {scheduleDetail.title}
                </Text>

                <View style={ScheduleDetailStyles.mainWorkProgressSection}>
                    <View style={ScheduleDetailStyles.warpMainWork}>
                        <Text
                            style={ScheduleDetailStyles.mainWorkProgressLabel}>
                            Tiến độ hoàn thành
                        </Text>
                        <Progress.Circle
                            size={40}
                            color={'#2196F3'}
                            progress={0} // Từ 0.0 đến 1.0
                            showsText={true}
                            textStyle={
                                ScheduleDetailStyles.mainWorkProgressValue
                            }
                            unfilledColor={'rgba(211, 211, 211, 1)'}
                            borderWidth={0}
                        />
                    </View>

                    <View style={ScheduleDetailStyles.warpMainWork}>
                        <Text
                            style={ScheduleDetailStyles.mainWorkProgressLabel}>
                            Trạng thái công việc
                        </Text>
                        <Text style={ScheduleDetailStyles.statusText}>
                            {renderStatusText(scheduleDetail.status)}
                        </Text>
                    </View>
                </View>

                <Text style={ScheduleDetailStyles.timeWorkEnd}>
                    {renderScheduleRemain(scheduleDetail.finishedDate)}
                </Text>

                <View style={ScheduleDetailStyles.workInfoSection}>
                    <View style={ScheduleDetailStyles.warpLabelValue}>
                        <Text style={ScheduleDetailStyles.infoLabel}>
                            Ngày bắt đầu
                        </Text>

                        <Text style={ScheduleDetailStyles.infoValue}>
                            {moment(scheduleDetail.startedDate).format('L')}
                        </Text>
                    </View>

                    <View style={ScheduleDetailStyles.warpLabelValue}>
                        <Text style={ScheduleDetailStyles.infoLabel}>
                            Ngày kết thúc
                        </Text>

                        <Text style={ScheduleDetailStyles.infoValue}>
                            {moment(scheduleDetail.finishedDate).format('L')}
                        </Text>
                    </View>

                    <View style={ScheduleDetailStyles.warpLabelValue}>
                        <Text style={ScheduleDetailStyles.infoLabel}>
                            Người quản lý
                        </Text>

                        <Text style={ScheduleDetailStyles.infoValue}>
                            {scheduleDetail.followerName}
                        </Text>
                    </View>

                    <View style={ScheduleDetailStyles.warpLabelValue}>
                        <Text style={ScheduleDetailStyles.infoLabel}>
                            Đối tượng nhận việc
                        </Text>

                        <Text style={ScheduleDetailStyles.infoValue}>
                            {scheduleDetail.receivedObject}
                        </Text>
                    </View>

                    <View style={ScheduleDetailStyles.warpLabelValue}>
                        <Text style={ScheduleDetailStyles.infoLabel}>
                            Kế hoạch sản xuất
                        </Text>

                        <Text style={ScheduleDetailStyles.infoValue}>
                            {scheduleDetail.producingPlan}
                        </Text>
                    </View>
                </View>

                <View style={ScheduleDetailStyles.jobDescription}>
                    <Text style={ScheduleDetailStyles.description}>
                        Mô tả công việc
                    </Text>

                    <Text style={ScheduleDetailStyles.detail}>
                        {scheduleDetail.description}
                    </Text>
                </View>

                {scheduleDetail.files.length !== 0 ? (
                    <View style={ScheduleDetailStyles.attachedFile}>
                        <Text
                            style={
                                ScheduleDetailStyles.description
                            }>{`Tệp đính kèm (${scheduleDetail.files.length})`}</Text>
                        <FlatList
                            scrollEnabled={false}
                            data={scheduleDetail.files}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({item}) =>
                                renderItemAttachedFiles(item)
                            }
                        />
                    </View>
                ) : null}

                <View style={ScheduleDetailStyles.staffJoin}>
                    <Text style={ScheduleDetailStyles.staffQuantity}>
                        {`Nhân sự tham gia (${scheduleDetail.employees.length})`}
                    </Text>

                    <FlatList
                        scrollEnabled={false}
                        data={scheduleDetail.employees}
                        renderItem={({item, index}) => renderStaff(item, index)}
                        keyExtractor={item => item._id}
                    />
                </View>

                <View style={ScheduleDetailStyles.childTask}>
                    <Text style={ScheduleDetailStyles.childTaskQuantity}>
                        {`Danh sách công việc con (${scheduleDetail.childTasks.tasks.length})`}
                    </Text>

                    <View style={ScheduleDetailStyles.childTaskInfo}>
                        <FlatList
                            scrollEnabled={false}
                            data={scheduleDetail.childTasks.tasks}
                            renderItem={({item}) =>
                                isCheckList.length !== 0
                                    ? renderChildTask(item)
                                    : renderChildTaskJustSeen(item)
                            }
                            keyExtractor={item => item._id}
                        />
                    </View>
                </View>
            </ScrollView>

            {showListRadioButton ? (
                <View style={ScheduleDetailStyles.listRaidoButton}>
                    <View style={ScheduleDetailStyles.radioBtnSection}>
                        <TouchableOpacity
                            style={ScheduleDetailStyles.warpRadioText}
                            onPress={() => setRadioSelectedType(1)}>
                            <MaterialIcons
                                name={
                                    radioSelectedType === 1
                                        ? 'radio-button-checked'
                                        : 'radio-button-off'
                                }
                                color={
                                    radioSelectedType === 1
                                        ? '#4CAF50'
                                        : '#49454f'
                                }
                                size={20}
                            />
                            <Text style={ScheduleDetailStyles.radioBtnText}>
                                Duyệt
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={ScheduleDetailStyles.warpRadioText}
                            onPress={() => setRadioSelectedType(2)}>
                            <MaterialIcons
                                name={
                                    radioSelectedType === 2
                                        ? 'radio-button-checked'
                                        : 'radio-button-off'
                                }
                                color={
                                    radioSelectedType === 2
                                        ? '#4CAF50'
                                        : '#49454f'
                                }
                                size={20}
                            />
                            <Text style={ScheduleDetailStyles.radioBtnText}>
                                Làm lại
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={ScheduleDetailStyles.warpRadioText}
                            onPress={() => setRadioSelectedType(3)}>
                            <MaterialIcons
                                name={
                                    radioSelectedType === 3
                                        ? 'radio-button-checked'
                                        : 'radio-button-off'
                                }
                                color={
                                    radioSelectedType === 3
                                        ? '#4CAF50'
                                        : '#49454f'
                                }
                                size={20}
                            />
                            <Text style={ScheduleDetailStyles.radioBtnText}>
                                Hủy bỏ
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {radioSelectedType !== 0 ? renderComfirmView() : null}
                </View>
            ) : currentSelectedChildTask !== '' ? (
                renderComfirmBrowseMainTask()
            ) : null}
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
    },
    warpMainWork: {
        gap: 8,
        alignItems: 'center',
    },
    mainWorkProgressLabel: {
        fontSize: 13,
        fontWeight: 400,
        color: '#000000',
    },
    mainWorkProgressValue: {
        color: '#000000',
        fontWeight: 400,
        fontSize: 11,
    },
    statusText: {
        fontWeight: 500,
        fontSize: 14,
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
        marginVertical: 15,
        gap: 4,
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
        fontSize: 14,
        color: '#212121',
        width: '50%',
    },
    warpValue: {
        margin: 'auto',
        gap: 10,
        width: '50%',
    },
    infoValue: {
        color: '#212121',
        fontWeight: 500,
        fontSize: 14,
        textAlign: 'right',
        width: '50%',
    },
    jobDescription: {
        gap: 10,
        marginTop: 12,
        marginBottom: 15,
    },
    description: {
        color: '#212121',
        fontWeight: 500,
        fontSize: 14,
        textAlign: 'center',
    },
    detail: {
        fontWeight: 400,
        fontSize: 14,
        color: '#212121',
    },
    attachedFile: {
        marginVertical: 10,
        gap: 10,
    },
    attachedFileText: {
        color: '#212121',
        fontWeight: 500,
        fontSize: 14,
        textAlign: 'center',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: 'black',
    },
    staffJoin: {
        marginVertical: 10,
        gap: 12,
    },
    staffQuantity: {
        color: '#212121',
        fontSize: 14,
        fontWeight: 500,
        textAlign: 'center',
    },
    listWorkerMargin: {
        marginVertical: 10,
    },
    workerCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftWorkerCard: {
        flexDirection: 'row',
        gap: 16,
        alignItems: 'center',
        flex: 1,
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
        width: '80%',
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
        fontSize: 14,
        textTransform: 'uppercase',
    },
    childTask: {
        gap: 16,
        paddingVertical: 12,
        paddingBottom: 200,
    },
    childTaskQuantity: {
        color: '#212121',
        fontWeight: 500,
        fontSize: 14,
    },
    childTaskInfo: {
        gap: 8,
    },
    warpChildTask: {
        marginLeft: 12,
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        marginBottom: 25,
    },
    rightChildTask: {
        width: '88%',
        gap: 10,
    },
    taskTitleNotDone: {
        color: '#212121',
        fontWeight: 600,
        fontSize: 14,
    },
    stepByStepTaskTitleNotDone: {
        color: '#808080',
        fontWeight: 600,
        fontSize: 14,
    },
    taskTitleIsDone: {
        color: '#FF9800',
        fontWeight: 600,
        fontSize: 14,
    },
    progressTask: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    taskEndIn: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: 400,
        flexShrink: 1,
        textAlign: 'right',
    },
    stepByStepTaskEndIn: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: 400,
        flexShrink: 1,
        textAlign: 'right',
        color: '#808080',
    },
    taskParticipant: {
        marginLeft: 10,
        marginTop: 5,
        gap: 12,
        alignItems: 'center',
    },
    warpParticipant: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    warpInfoParticipant: {
        gap: 4,
        width: '88%',
    },
    staffName: {
        color: '#000000',
        fontWeight: 500,
        fontSize: 13,
    },
    taskWaitingBrowse: {
        fontWeight: 400,
        fontSize: 13,
        flexShrink: 1,
        color: '#FF9800',
    },
    taskIsProcessing: {
        fontWeight: 400,
        fontSize: 13,
        flexShrink: 1,
        color: '#808080',
    },
    taskDoneWhen: {
        fontWeight: 400,
        fontSize: 13,
        flexShrink: 1,
        color: '#4CAF50',
    },
    cancelStaffName: {
        color: '#000000',
        fontWeight: 500,
        fontSize: 13,
        textDecorationLine: 'line-through',
    },
    taskCancelWhen: {
        fontWeight: 400,
        fontSize: 13,
        flexShrink: 1,
        color: '#FF4E45',
    },
    taskCancelReason: {
        fontWeight: 400,
        fontSize: 12,
        flexShrink: 1,
        color: '#FF4E45',
        fontStyle: 'italic',
    },
    listRaidoButton: {
        width: '100%',
        flex: 1,
        position: 'absolute',
        bottom: 0,
        padding: 20,
        backgroundColor: '#F5F5F5',
        boxShadow: '0 -1.5 1.5 #00000040',
    },
    radioBtnSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    warpRadioText: {
        flexDirection: 'row',
        gap: 5,
        alignItems: 'center',
    },
    radioBtnText: {
        fontWeight: 500,
        fontSize: 13,
    },
    comfirmView: {
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: '#ccc',
        borderStyle: 'dashed',
        marginVertical: 10,
        gap: 10,
    },
    comfirmViewText: {
        color: '#808080',
        fontWeight: 500,
        fontSize: 13,
        marginTop: 15,
        textAlign: 'center',
    },
    listComfirmBtn: {
        flexDirection: 'row',
        marginTop: 10,
        justifyContent: 'space-between',
    },
    cancelBtnBrowseTask: {
        borderColor: '#808080',
        borderWidth: 1,
        width: '48%',
        backgroundColor: 'rgb(245, 245, 245)',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    cancelBtnTextBrowseTask: {
        color: '#808080',
        fontWeight: 600,
        fontSize: 14,
    },
    //dùng chung cho radio duyệt + làm lại
    comfirmBtnBrowseTask: {
        width: '48%',
        backgroundColor: '#4CAF50',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    comfirmBtnTextBrowseTask: {
        color: '#F5F5F5',
        fontWeight: 600,
        fontSize: 14,
    },
    comfirmBtnRedoTask: {
        borderColor: '#4CAF50',
        borderWidth: 1,
        width: '48%',
        backgroundColor: 'rgb(245, 245, 245)',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    comfirmBtnTextRedoTask: {
        color: '#4CAF50',
        fontWeight: 600,
        fontSize: 14,
    },
    cancelBtnCanelProgressTask: {
        width: '48%',
        backgroundColor: '#FF4E45',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    cancelBtnTextCanelProgressTask: {
        color: '#F5F5F5',
        fontWeight: 600,
        fontSize: 14,
    },
    comfirmBtnCanelProgressTask: {
        borderColor: '#FF4E45',
        borderWidth: 1,
        width: '48%',
        backgroundColor: 'rgb(245, 245, 245)',
        borderRadius: 20,
        padding: 10,
        alignItems: 'center',
    },
    comfirmBtnTextCanelProgressTask: {
        color: '#FF4E45',
        fontWeight: 600,
        fontSize: 14,
    },
    cancelProgressInput: {
        fontSize: 13,
        color: '#808080',
        textAlignVertical: 'top',
        borderColor: '#FF4E45',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#FF4E4526',
        paddingHorizontal: 15,
        minHeight: 120,
    },
    comfirmViewMainTask: {
        width: '100%',
        flex: 1,
        position: 'absolute',
        bottom: 0,
        gap: 10,
        backgroundColor: '#F5F5F5',
        boxShadow: '0 -1.5 1.5 #00000040',
        padding: 20,
    },
    comfirmMainTaskText: {
        color: '#808080',
        fontWeight: 500,
        fontSize: 13,
        textAlign: 'center',
    },
});

export default ScheduleDetail;
