import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    FlatList,
} from "react-native";
import React, {useState} from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import moment from "moment";
import AutoHeightWebView from "react-native-autoheight-webview";
import ENV from "@/config/ENV";
import {Dimensions} from "react-native";
import ModalPdfView from "../../../utils/Modals/ModalPdfView";

const DetailDocuments = ({route}: any) => {
    const [showModalPdf, setShowModalPdf] = useState<boolean>(false);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);

    const fixEncoding = (input: string): string => {
        try {
            return decodeURIComponent(escape(input));
        } catch (error) {
            return input;
        }
    };

    const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-size: 16px;
            line-height: 1.5;
            padding: 10px;
            margin: 0;
          }
          img {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        ${route.params.itemDocument.content}
      </body>
    </html>
  `;

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

    const handleOpenPdf = (path: string) => {
        const fixedPath = path.replace(/\\/g, "/");
        setSelectedPdf(`${ENV.BACKEND_URL}${fixedPath}`);
        setShowModalPdf(true);
    };

    const renderItemAttachedFiles = (itemAttachedFiles: AttachedFiles) => (
        <View style={DetailDocumentsStyles.cardDocument}>
            <View style={DetailDocumentsStyles.leftCardDocument}>
                <MaterialCommunityIcons
                    name="text-box"
                    color={"rgba(255, 78, 69, 1)"}
                    size={28}
                />
                <View style={DetailDocumentsStyles.infoDocument}>
                    <Text style={DetailDocumentsStyles.infoDocumentText}>
                        {fixEncoding(itemAttachedFiles.originalname)}
                    </Text>
                    <Text style={DetailDocumentsStyles.infoDocumentSizeText}>
                        {formatFileSize(itemAttachedFiles.size)}
                    </Text>
                </View>
            </View>

            <TouchableOpacity
                onPress={() => handleOpenPdf(itemAttachedFiles.path)}>
                <FontAwesome
                    name="eye"
                    color={"rgba(33, 150, 243, 1)"}
                    size={22}
                />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={DetailDocumentsStyles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={DetailDocumentsStyles.header}>
                    <Text style={DetailDocumentsStyles.headerTitle}>
                        {route.params.itemDocument.title}
                    </Text>

                    <Text style={DetailDocumentsStyles.creator}>
                        Người tạo: {route.params.itemDocument.createdBy}
                    </Text>
                </View>

                <View style={DetailDocumentsStyles.body}>
                    <View style={DetailDocumentsStyles.warpCreateAndPromulgate}>
                        <Text style={DetailDocumentsStyles.dateTimeCreate}>
                            Tạo lúc:{" "}
                            {moment(route.params.itemDocument.createdAt).format(
                                "HH:mm DD/MM/YYYY",
                            )}
                        </Text>
                        <Text style={DetailDocumentsStyles.dateTimePromulgate}>
                            Ngày BH:{" "}
                            {moment(
                                route.params.itemDocument.dateOfIssue,
                            ).format("HH:mm DD/MM/YYYY")}
                        </Text>
                    </View>

                    <AutoHeightWebView
                        customStyle={`
                            * { font-size: 16px; word-break: break-word; }
                            img { max-width: 100%; height: auto; }
                        `}
                        originWhitelist={["*"]}
                        source={{html: htmlContent}}
                        style={DetailDocumentsStyles.documentContent}
                        scrollEnabled={false}
                    />

                    {route.params.itemDocument.files.length !== 0 && (
                        <View style={DetailDocumentsStyles.attachedDocuments}>
                            <Text
                                style={
                                    DetailDocumentsStyles.attachedDocumentsText
                                }>
                                Tài liệu đính kèm
                            </Text>
                            <View
                                style={
                                    DetailDocumentsStyles.listAttachedDocuments
                                }>
                                <FlatList
                                    scrollEnabled={false}
                                    data={route.params.itemDocument.files}
                                    keyExtractor={(item, index) =>
                                        index.toString()
                                    }
                                    renderItem={({item}) =>
                                        renderItemAttachedFiles(item)
                                    }
                                />
                            </View>
                        </View>
                    )}
                </View>
            </ScrollView>

            <ModalPdfView
                visible={showModalPdf}
                pdfFilePath={selectedPdf || ""}
                onClose={() => setShowModalPdf(false)}
            />
        </View>
    );
};

export default DetailDocuments;

const DetailDocumentsStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 12,
    },
    header: {
        gap: 6,
        borderColor: "gray",
        borderBottomWidth: 0.2,
    },
    headerTitle: {
        fontWeight: "500",
        fontSize: 15,
    },
    creator: {
        color: "rgba(33, 150, 243, 1)",
        fontSize: 13,
        fontWeight: 300,
        marginBottom: 6,
    },
    body: {
        marginBottom: 14,
        flexShrink: 1,
    },
    warpCreateAndPromulgate: {
        marginTop: 6,
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
    },
    dateTimeCreate: {
        fontSize: 11,
        color: "rgba(128, 128, 128, 1)",
        fontWeight: "400",
    },
    dateTimePromulgate: {
        fontSize: 11,
        color: "rgba(33, 150, 243, 1)",
        textAlign: "right",
    },
    documentContent: {
        marginVertical: 10,
        width: Dimensions.get("window").width - 15,
    },
    attachedDocuments: {
        //marginBottom: 15,
    },
    attachedDocumentsText: {
        borderTopColor: "rgba(211, 211, 211, 1)",
        borderBottomWidth: 0.5,
        color: "rgba(128, 128, 128, 1)",
        fontSize: 13,
        paddingVertical: 10,
    },
    listAttachedDocuments: {
        marginVertical: 10,
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
        gap: 4,
        width: "85%",
    },
    infoDocumentText: {
        fontSize: 11,
    },
    infoDocumentSizeText: {
        fontSize: 11,
        color: "rgba(128, 128, 128, 1)",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 15,
        color: "black",
    },
});
