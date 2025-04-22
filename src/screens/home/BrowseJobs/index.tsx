import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Alert,
    TextInput,
} from 'react-native';
import CheckBox from 'react-native-check-box';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import React, {useState} from 'react';

const BrowseJobs = () => {
    const currentWorkerCheckDefault = {
        jobsId: '',
        workerId: '',
        workerName: '',
    };

    const [showListButton, setShowListButton] = useState([]);
    const [showCancelInput, setShowCancelInput] = useState([]);

    const [currentWorkerCheck, setCurrentWorkerCheck] = useState(
        currentWorkerCheckDefault,
    );

    const fakeBrowseJobsDataDefault = {
        mainJobTitle: 'Cải tạo đất cho khu vườn cf15',
        jobs: [
            {
                _id: 'j1',
                jobsTitle: 'Di chuyển vật tư',
                isCheck: false,
                participant: [
                    {
                        _id: 'w1',
                        worker: 'Lê Chí Minh',
                        progress: '100%',
                        isCheck: false,
                        checkType: 0,
                    },
                ],
            },
            {
                _id: 'j2',
                jobsTitle: 'Trồng 200 cây cà phê',
                isCheck: false,
                participant: [
                    {
                        _id: 'w2',
                        worker: 'Lê Chí Minh',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                    {
                        _id: 'w3',
                        worker: 'Trần Văn Cường',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                    {
                        _id: 'w4',
                        worker: 'Hồ Trọng Điệp',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                ],
            },
            {
                _id: 'j3',
                jobsTitle: 'Di chuyển vật tư',
                isCheck: false,
                participant: [
                    {
                        _id: 'w5',
                        worker: 'Lê Chí Minh',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                ],
            },
            {
                _id: 'j4',
                jobsTitle: 'Trồng 200 cây cà phê',
                isCheck: false,
                participant: [
                    {
                        _id: 'w6',
                        worker: 'Lê Chí Minh',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                    {
                        _id: 'w7',
                        worker: 'Trần Văn Cường',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                    {
                        _id: 'w8',
                        worker: 'Hồ Trọng Điệp',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                ],
            },
            {
                _id: 'j5',
                jobsTitle: 'Di chuyển vật tư',
                isCheck: false,
                participant: [
                    {
                        _id: 'w9',
                        worker: 'Lê Chí Minh',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                ],
            },
            {
                _id: 'j6',
                jobsTitle: 'Trồng 200 cây cà phê',
                isCheck: false,
                participant: [
                    {
                        _id: 'w10',
                        worker: 'Lê Chí Minh',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                    {
                        _id: 'w11',
                        worker: 'Trần Văn Cường',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                    {
                        _id: 'w12',
                        worker: 'Hồ Trọng Điệp',
                        progress: '0%',
                        isCheck: false,
                        checkType: 0,
                    },
                ],
            },
        ],
    };

    const [fakeBrowseJobsData, setFakeBrowseJobsData] = useState(
        fakeBrowseJobsDataDefault,
    );

    const renderParticipantProgress = (jobsId, progress, checkType) => {
        if (progress === '100%' && checkType === 0) {
            return (
                <Text style={BrowseJobsStyle.jobsParticipantProgress}>
                    Hoàn thành
                </Text>
            );
        } else if (checkType === 1) {
            return (
                <Text
                    style={[
                        BrowseJobsStyle.jobsParticipantProgress,
                        {color: 'rgba(76, 175, 80, 1)'},
                    ]}>
                    Đã duyệt
                </Text>
            );
        } else if (checkType === 2) {
            return (
                <Text
                    style={[
                        BrowseJobsStyle.jobsParticipantProgress,
                        {color: 'rgba(255, 78, 69, 1)'},
                    ]}>
                    Đã hủy
                </Text>
            );
        } else {
            return (
                <Text
                    style={[
                        BrowseJobsStyle.jobsParticipantProgress,
                        showListButton.includes(jobsId)
                            ? {color: 'rgba(128, 128, 128, 1)'}
                            : {color: 'rgba(33, 150, 243, 1)'},
                    ]}>
                    {progress}
                </Text>
            );
        }
    };

    const toggleExpand = jobsId => {
        setShowListButton(prevList =>
            prevList.includes(jobsId)
                ? //prevList.filter(rowJobsId => rowJobsId !== jobsId)
                  [...prevList]
                : [...prevList, jobsId],
        );
    };

    const toggleExpandCancelInput = () => {
        setShowCancelInput(prevList =>
            prevList.includes(currentWorkerCheck.workerId)
                ? [...prevList]
                : [...prevList, currentWorkerCheck.workerId],
        );
    };

    const onChangeCancelReason = value => {
        setCurrentWorkerCheck({...currentWorkerCheck, cancelReason: value});
    };

    const handleComfirmBrowseJobs = () => {
        const updatedJobs = fakeBrowseJobsData.jobs.map(job => {
            const updatedParticipants = job.participant.map(p =>
                p._id === currentWorkerCheck.workerId
                    ? {
                          ...p,
                          checkType: 1,
                      }
                    : p,
            );

            return {
                ...job,
                participant: updatedParticipants,
            };
        });

        const updateFakeBrowseJobsData = {
            mainJobTitle: fakeBrowseJobsData.mainJobTitle,
            jobs: updatedJobs,
        };

        const findJobs = fakeBrowseJobsData.jobs.find(
            item => item._id === currentWorkerCheck.jobsId,
        );
        const isAllCheckTrue = findJobs?.participant.every(
            item => item.isCheck,
        );

        if (isAllCheckTrue) {
            filterToggleExpand(currentWorkerCheck.jobsId);
        }

        setFakeBrowseJobsData(updateFakeBrowseJobsData);
        setCurrentWorkerCheck(currentWorkerCheckDefault);
    };

    const handleComfirmCancelJobs = () => {
        const updatedJobs = fakeBrowseJobsData.jobs.map(job => {
            const updatedParticipants = job.participant.map(p =>
                p._id === currentWorkerCheck.workerId
                    ? {
                          ...p,
                          checkType: 2,
                          cancelReason: currentWorkerCheck.cancelReason,
                      }
                    : p,
            );

            return {
                ...job,
                participant: updatedParticipants,
            };
        });

        const updateFakeBrowseJobsData = {
            mainJobTitle: fakeBrowseJobsData.mainJobTitle,
            jobs: updatedJobs,
        };

        const findJobs = fakeBrowseJobsData.jobs.find(
            item => item._id === currentWorkerCheck.jobsId,
        );
        const isAllCheckTrue = findJobs?.participant.every(
            item => item.isCheck,
        );

        if (isAllCheckTrue) {
            filterToggleExpand(currentWorkerCheck.jobsId);
        }

        setFakeBrowseJobsData(updateFakeBrowseJobsData);
        filterToggleExpandCancelInput();
        setCurrentWorkerCheck(currentWorkerCheckDefault);
    };

    const filterToggleExpand = jobsId => {
        setShowListButton(prevList => prevList.filter(item => item !== jobsId));
    };

    const filterToggleExpandCancelInput = () => {
        setShowCancelInput(prevList =>
            prevList.filter(item => item !== currentWorkerCheck.workerId),
        );
    };

    const handleCheckParticipant = (workerId, workerName, jobsId) => {
        if (
            currentWorkerCheck.workerId === '' ||
            currentWorkerCheck.workerId === workerId
        ) {
            if (currentWorkerCheck.workerId === workerId) {
                setCurrentWorkerCheck(currentWorkerCheckDefault);
            } else {
                setCurrentWorkerCheck({
                    jobsId: jobsId,
                    workerId: workerId,
                    workerName: workerName,
                });
            }

            toggleExpand(jobsId);

            const updatedJobs = fakeBrowseJobsData.jobs.map(job => {
                const updatedParticipants = job.participant.map(p =>
                    p._id === workerId ? {...p, isCheck: !p.isCheck} : p,
                );

                const allChecked = updatedParticipants.every(p => p.isCheck);

                return {
                    ...job,
                    participant: updatedParticipants,
                    isCheck: allChecked,
                };
            });

            const updateFakeBrowseJobsData = {
                mainJobTitle: fakeBrowseJobsData.mainJobTitle,
                jobs: updatedJobs,
            };

            // Tìm job có jobId truyền vào
            const targetJob = updatedJobs.find(job => job._id === jobsId);

            // Kiểm tra nếu tất cả participant của job đó đều được check là false
            const isAllParticipantUnCheck = targetJob.participant.every(
                p => p.isCheck === false,
            );

            //chạy khi tất cả người lao động chưa check thì list button sẽ mất
            if (isAllParticipantUnCheck) {
                filterToggleExpand(jobsId);
            }

            const checkHideCancelInput = showCancelInput.includes(workerId);
            if (checkHideCancelInput) {
                filterToggleExpandCancelInput();
            }

            setFakeBrowseJobsData(updateFakeBrowseJobsData);
        } else {
            Alert.alert(
                'Thông báo',
                `Bạn đang chọn duyệt công việc cho nhân viên ${currentWorkerCheck.workerName}, hãy duyệt cho nhân viên này trước nhé!`,
                [{text: 'OK'}],
            );
        }
    };

    const handleCheckType = (checkType: number) => {
        console.log(checkType);

        if (checkType === 1) {
            handleComfirmBrowseJobs();
        } else if (checkType === 3) {
            toggleExpandCancelInput();
        }
    };

    return (
        <View style={BrowseJobsStyle.container}>
            <ScrollView style={BrowseJobsStyle.scrollViewStyle}>
                <View style={BrowseJobsStyle.cardBrowseJob}>
                    <Text style={BrowseJobsStyle.browseMainJobTitle}>
                        {fakeBrowseJobsData.mainJobTitle}
                    </Text>

                    <FlatList
                        data={fakeBrowseJobsData.jobs}
                        keyExtractor={(item, index) => index.toString()}
                        scrollEnabled={false}
                        renderItem={({item}) => (
                            <>
                                <View style={BrowseJobsStyle.jobs}>
                                    <View style={BrowseJobsStyle.jobsHeader}>
                                        <CheckBox
                                            isChecked={item.isCheck}
                                            checkedCheckBoxColor='rgb(101, 84, 143)'
                                            disabled={true}
                                        />
                                        <Text style={BrowseJobsStyle.jobsTitle}>
                                            {item.jobsTitle}
                                        </Text>
                                    </View>

                                    {item.participant.map(
                                        (participantItem, index) => (
                                            <View
                                                style={
                                                    BrowseJobsStyle.jobsParticipant
                                                }
                                                key={index}>
                                                <View
                                                    style={
                                                        BrowseJobsStyle.jobsParticipantName
                                                    }>
                                                    <View
                                                        style={
                                                            BrowseJobsStyle.warpCheckBoxParticipantName
                                                        }>
                                                        {participantItem.checkType !==
                                                        0 ? (
                                                            participantItem.checkType ===
                                                            1 ? (
                                                                <MaterialCommunityIcons
                                                                    name='check-circle'
                                                                    size={22}
                                                                    color='green'
                                                                />
                                                            ) : (
                                                                <MaterialCommunityIcons
                                                                    name='close-circle'
                                                                    size={22}
                                                                    color='rgba(255, 78, 69, 1)'
                                                                />
                                                            )
                                                        ) : (
                                                            <CheckBox
                                                                checkedCheckBoxColor='rgb(101, 84, 143)'
                                                                onClick={() => {
                                                                    handleCheckParticipant(
                                                                        participantItem._id,
                                                                        participantItem.worker,
                                                                        item._id,
                                                                    );
                                                                }}
                                                                isChecked={
                                                                    participantItem.isCheck
                                                                }
                                                            />
                                                        )}
                                                        <Text
                                                            style={[
                                                                participantItem.checkType ===
                                                                2
                                                                    ? BrowseJobsStyle.jobsCancelParticipantNameText
                                                                    : BrowseJobsStyle.jobsParticipantNameText,
                                                            ]}>
                                                            {
                                                                participantItem.worker
                                                            }
                                                        </Text>
                                                    </View>

                                                    {renderParticipantProgress(
                                                        item._id,
                                                        participantItem.progress,
                                                        participantItem.checkType,
                                                    )}
                                                </View>

                                                {participantItem.checkType ===
                                                2 ? (
                                                    <Text
                                                        style={
                                                            BrowseJobsStyle.cancelReasonText
                                                        }>
                                                        {`Lí do: ${participantItem.cancelReason}`}
                                                    </Text>
                                                ) : null}

                                                {showCancelInput.includes(
                                                    participantItem._id,
                                                ) && (
                                                    <View
                                                        style={
                                                            BrowseJobsStyle.cancelInputView
                                                        }>
                                                        <TextInput
                                                            placeholder='Nhập lý do huỷ...'
                                                            placeholderTextColor={
                                                                '#888'
                                                            }
                                                            multiline
                                                            onChangeText={
                                                                onChangeCancelReason
                                                            }
                                                            style={
                                                                BrowseJobsStyle.cancelInput
                                                            }
                                                        />

                                                        <TouchableOpacity
                                                            onPress={() =>
                                                                handleComfirmCancelJobs()
                                                            }
                                                            style={
                                                                BrowseJobsStyle.confirmReasonBtn
                                                            }>
                                                            <Text
                                                                style={
                                                                    BrowseJobsStyle.confirmReasonText
                                                                }>
                                                                OK
                                                            </Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                )}
                                            </View>
                                        ),
                                    )}

                                    {showListButton.includes(item._id) && (
                                        <View
                                            style={BrowseJobsStyle.listButton}>
                                            <TouchableOpacity
                                                style={
                                                    BrowseJobsStyle.browseButton
                                                }
                                                onPress={() =>
                                                    handleCheckType(1)
                                                }>
                                                <Text
                                                    style={
                                                        BrowseJobsStyle.textButton
                                                    }>
                                                    Duyệt
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={
                                                    BrowseJobsStyle.redoButton
                                                }
                                                onPress={() =>
                                                    handleCheckType(2)
                                                }>
                                                <Text
                                                    style={
                                                        BrowseJobsStyle.textButton
                                                    }>
                                                    Làm lại
                                                </Text>
                                            </TouchableOpacity>

                                            <TouchableOpacity
                                                style={
                                                    BrowseJobsStyle.cancelButton
                                                }
                                                onPress={() =>
                                                    handleCheckType(3)
                                                }>
                                                <Text
                                                    style={
                                                        BrowseJobsStyle.textButton
                                                    }>
                                                    Hủy bỏ
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
                    />
                </View>
            </ScrollView>
        </View>
    );
};

const BrowseJobsStyle = StyleSheet.create({
    container: {
        paddingHorizontal: 15,
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollViewStyle: {
        flex: 1,
    },
    cardBrowseJob: {
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 15,
        backgroundColor: 'rgba(245, 245, 245, 1)',
        boxShadow: '0 1 2 0 rgba(0, 0, 0, 0.25)',
        marginBottom: 10,
    },
    browseMainJobTitle: {
        textTransform: 'uppercase',
        fontWeight: '700',
        fontSize: 16,
        color: 'rgba(76, 175, 80, 1)',
    },
    jobs: {
        marginTop: 6,
        paddingVertical: 10,
        borderBottomColor: 'rgba(186, 192, 202, 1)',
        borderBottomWidth: 1,
    },
    jobsHeader: {
        gap: 15,
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    jobsTitle: {
        color: 'rgba(0, 0, 0, 1)',
        fontWeight: 500,
    },
    jobsParticipant: {
        marginTop: 15,
        marginLeft: 22,
        //gap: 20,
    },
    jobsParticipantName: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    warpCheckBoxParticipantName: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    jobsParticipantNameText: {
        color: 'rgba(128, 128, 128, 1)',
        fontSize: 12,
    },
    jobsCancelParticipantNameText: {
        color: 'rgba(255, 78, 69, 1)',
        textDecorationLine: 'line-through',
        fontSize: 12,
    },
    jobsParticipantProgress: {
        color: 'rgba(33, 150, 243, 1)',
        fontSize: 12,
    },
    jobsParticipantProgressHasBrowse: {
        color: 'rgba(76, 175, 80, 1)',
        fontSize: 12,
    },
    listButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
        gap: 10,
    },
    browseButton: {
        backgroundColor: 'rgba(76, 175, 80, 1)',
        borderRadius: 8,
        width: 95,
        height: 41,
        justifyContent: 'center',
        alignItems: 'center',
    },
    redoButton: {
        backgroundColor: 'rgba(255, 152, 0, 1)',
        borderRadius: 8,
        width: 95,
        height: 41,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: 'rgba(255, 78, 69, 1)',
        borderRadius: 8,
        width: 95,
        height: 41,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textButton: {
        color: '#fff',
        fontWeight: '500',
        textAlign: 'center',
    },
    cancelInputView: {
        marginTop: 10,
        borderColor: '#f44336',
        borderWidth: 1,
        borderRadius: 8,
        backgroundColor: '#fddede',
        paddingHorizontal: 10,
        position: 'relative',
        minHeight: 125,
        justifyContent: 'flex-start',
    },
    cancelInput: {
        fontSize: 14,
        color: '#333',
    },
    confirmReasonBtn: {
        position: 'absolute',
        bottom: 10,
        right: 10,
        backgroundColor: '#4CAF50',
        borderRadius: 5,
        paddingHorizontal: 12,
        paddingVertical: 3,
    },
    confirmReasonText: {
        textAlign: 'center',
        color: '#fff',
        fontWeight: 400,
        fontSize: 12,
    },
    cancelReasonText: {
        color: 'rgba(255, 78, 69, 1)',
        fontSize: 12,
        fontWeight: 400,
        fontStyle: 'italic',
        marginTop: 10,
    },
});

export default BrowseJobs;
