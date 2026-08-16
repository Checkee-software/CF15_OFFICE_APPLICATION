import {StyleSheet} from "react-native";

const ScheduleHarvestStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        position: "relative",
    },
    scrollViewStyle: {
        gap: 10,
        paddingHorizontal: 20,
    },
    mainWorkTitle: {
        color: "#000000",
        fontWeight: 600,
        fontSize: 16,
    },
    mainWorkProgressSection: {
        flexDirection: "row",
        paddingHorizontal: 12,
        paddingVertical: 10,
        gap: 20,
        justifyContent: "center",
        borderBottomWidth: 1.5,
        borderStyle: "dashed",
        borderBottomColor: "#d3d3d3",
        paddingBottom: 10,
    },
    warpMainWork: {
        gap: 12,
        marginBottom: 8,
        alignItems: "center",
    },
    mainWorkSummary: {
        fontSize: 13,
        fontWeight: 400,
        color: "#000000",
    },
    statusText: {
        fontWeight: 500,
        fontSize: 13,
        color: "#2196F3",
        margin: "auto",
    },
    timeWorkEnd: {
        marginTop: 12,
        fontWeight: 600,
        fontStyle: "italic",
        fontSize: 16,
        color: "#212121",
        textAlign: "center",
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
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
    },
    warpLabel: {
        gap: 10,
        width: "50%",
    },
    infoLabel: {
        fontWeight: 400,
        fontSize: 13,
        color: "#212121",
        width: "50%",
    },
    infoValue: {
        color: "#212121",
        fontWeight: 500,
        fontSize: 13,
        textAlign: "right",
        width: "50%",
    },
    jobDescription: {
        gap: 10,
        marginVertical: 10,
    },
    description: {
        color: "#212121",
        fontWeight: 500,
        fontSize: 13,
        textAlign: "center",
    },
    detail: {
        fontWeight: 400,
        fontSize: 13.5,
        color: "#212121",
    },
    attachedFile: {
        marginVertical: 10,
        gap: 10,
    },
    cardDocument: {
        borderRadius: 8,
        padding: 10,
        flex: 1,
        backgroundColor: "rgba(128, 128, 128, 0.15)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    leftCardDocument: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        gap: 10,
    },
    infoDocument: {
        width: "85%",
    },
    infoDocumentText: {
        fontSize: 11,
    },
    infoDocumentSizeText: {
        fontSize: 11,
        color: "rgba(128, 128, 128, 1)",
    },
    listAccordion: {
        gap: 10,
        marginHorizontal: -12,
        marginVertical: 15,
    },
    boxAccordion: {
        paddingRight: 6,
        paddingVertical: 0,
        backgroundColor: "#fff",
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
    listWorkerMargin2: {
        marginVertical: 8,
        marginHorizontal: 15,
        gap: 4,
    },
    workerCard: {
        marginHorizontal: 15,
        flexDirection: "row",
        alignItems: "center",
    },
    leftWorkerCard: {
        flexDirection: "row",
        gap: 16,
        alignItems: "center",
        width: "98%",
    },
    workerAvatar: {
        backgroundColor: "rgba(211, 211, 211, 1)",
        borderRadius: "50%",
        width: 48,
        height: 48,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 24,
        margin: "auto",
    },
    workerNameAndUnit: {
        gap: 2,
        width: "70%",
    },
    workerName: {
        color: "rgba(76, 175, 80, 1)",
        fontWeight: 600,
        fontSize: 15,
        textTransform: "capitalize",
    },
    workerUnit: {
        textTransform: "capitalize",
        fontSize: 13,
        fontWeight: 400,
        color: "rgba(0, 0, 0, 1)",
    },
    workerOrder: {
        color: "rgba(128, 128, 128, 1)",
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
        width: "100%",
        backgroundColor: "#2196F31A",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 2,
    },
    historyInfoLabel: {
        fontWeight: 600,
        fontSize: 14,
        color: "#212121",
    },
    historyInfoValue: {
        color: "#212121",
        fontWeight: 400,
        fontSize: 13,
        width: "50%",
        flexShrink: 1,
    },
    childTaskInfo: {
        gap: 12,
        justifyContent: "center",
        marginVertical: 10,
    },
    childTaskInfo2: {
        gap: 12,
        justifyContent: "center",
        marginVertical: 10,
        backgroundColor: "#F5F5F5",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 15,
        boxShadow: "0 1 2 0 #00000040",
    },
    taskTitle: {
        color: "#212121",
        fontWeight: 600,
        fontSize: 14,
    },
    listProcesses: {
        paddingVertical: 5,
        marginBottom: 5,
        borderTopWidth: 1,
        borderTopColor: "black",
    },
    taskEndIn: {
        fontSize: 12,
        fontStyle: "italic",
        fontWeight: 400,
        flexShrink: 1,
        textAlign: "right",
    },
    participant: {
        flexDirection: "row",
        alignItems: "center",
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
        fontSize: 13.5,
        fontWeight: 400,
    },
    participantStatus: {
        fontSize: 13,
        fontWeight: 400,
    },
    participantStatus1: {
        color: "#808080", //chưa làm
    },
    participantStatus2: {
        color: "#2196F3", //đang làm
    },
    participantStatus3: {
        color: "#FF4E45", //đã hủy
    },
    participantStatus4: {
        color: "#4CAF50", //đã xong
    },
    workerProgressModal: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 15,
    },
    btnCloseModal: {
        flexDirection: "row",
        gap: 10,
        alignItems: "center",
    },
    btnCloseText: {
        color: "#AB47BC",
        fontWeight: 500,
    },
});

export default ScheduleHarvestStyles;
