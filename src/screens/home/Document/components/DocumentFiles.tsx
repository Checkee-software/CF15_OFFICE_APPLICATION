import React from 'react';
import {FlatList, Text, View} from 'react-native';
import styles from '../styles/styles';
import {AttachedFiles} from '../utils/types';
import FileItem from './FileItem';

type TDocumentFilesProps = {
    variant: 'incoming' | 'outgoing';
    filesList: AttachedFiles[];
    mainFiles: AttachedFiles[];
    attachedOnlyFiles: AttachedFiles[];
    checkedIndex: number | null;
    setCheckedIndex: React.Dispatch<React.SetStateAction<number | null>>;
    openPdfPreview: (file: AttachedFiles) => void;
    downloadFile: (file: AttachedFiles) => void;
    canProcess: boolean;
    getIsCheckboxDisabled?: (file: AttachedFiles) => boolean;
};

const fileKeyExtractor = (item: AttachedFiles, i: number) =>
    `${item.filename || item.path || item.originalname}-${i}`;

const DocumentFiles = ({
    variant,
    filesList,
    mainFiles,
    attachedOnlyFiles,
    checkedIndex,
    setCheckedIndex,
    openPdfPreview,
    downloadFile,
    canProcess,
    getIsCheckboxDisabled,
}: TDocumentFilesProps) => {
    const isIncoming = variant === 'incoming';

    if (isIncoming) {
        return (
            <>
                <View style={styles.attachedDocuments}>
                    <Text style={styles.attachedDocumentsText}>
                        Văn bản trình ký{' '}
                        <Text style={styles.requiredStar}>*</Text>
                    </Text>
                    {mainFiles.length > 0 ? (
                        <FlatList
                            scrollEnabled={false}
                            data={mainFiles}
                            keyExtractor={fileKeyExtractor}
                            renderItem={({item}) => (
                                <FileItem
                                    file={item}
                                    checkedIndex={checkedIndex}
                                    setCheckedIndex={setCheckedIndex}
                                    openPdfPreview={openPdfPreview}
                                    downloadFile={downloadFile}
                                />
                            )}
                        />
                    ) : (
                        <Text style={styles.emptyText}>
                            Chưa có văn bản trình ký
                        </Text>
                    )}
                </View>

                {attachedOnlyFiles.length > 0 && (
                    <View style={styles.attachedDocuments}>
                        <Text style={styles.attachedDocumentsText}>
                            Tài liệu đính kèm
                        </Text>
                        <FlatList
                            scrollEnabled={false}
                            data={attachedOnlyFiles}
                            keyExtractor={fileKeyExtractor}
                            renderItem={({item}) => (
                                <FileItem
                                    file={item}
                                    checkedIndex={checkedIndex}
                                    setCheckedIndex={setCheckedIndex}
                                    openPdfPreview={openPdfPreview}
                                    downloadFile={downloadFile}
                                />
                            )}
                        />
                    </View>
                )}
            </>
        );
    }

    return (
        <>
            <View style={styles.attachedDocuments}>
                <Text style={styles.signingSectionTitle}>
                    Văn bản trình ký <Text style={styles.requiredStar}>*</Text>
                </Text>
                {mainFiles.length > 0 ? (
                    <FlatList
                        scrollEnabled={false}
                        data={mainFiles}
                        keyExtractor={fileKeyExtractor}
                        renderItem={({item, index}) => (
                            <FileItem
                                file={item}
                                isMain
                                index={index}
                                checkedIndex={checkedIndex}
                                setCheckedIndex={setCheckedIndex}
                                openPdfPreview={openPdfPreview}
                                downloadFile={downloadFile}
                                isCheckboxDisabled={
                                    getIsCheckboxDisabled?.(item) || false
                                }
                                canProcess={canProcess}
                            />
                        )}
                    />
                ) : (
                    <Text style={styles.emptyText}></Text>
                )}
            </View>
            <View style={styles.attachedDocuments}>
                <Text style={styles.attachedDocumentsText}>
                    Tài liệu đính kèm <Text style={styles.requiredStar}>*</Text>
                </Text>
                {attachedOnlyFiles.length > 0 ? (
                    <FlatList
                        scrollEnabled={false}
                        data={attachedOnlyFiles}
                        keyExtractor={fileKeyExtractor}
                        renderItem={({item}) => (
                            <FileItem
                                file={item}
                                checkedIndex={checkedIndex}
                                setCheckedIndex={setCheckedIndex}
                                openPdfPreview={openPdfPreview}
                                downloadFile={downloadFile}
                            />
                        )}
                    />
                ) : (
                    <Text style={styles.emptyText}>
                        Chưa có tài liệu đính kèm
                    </Text>
                )}
            </View>
            {filesList.length === 0 && (
                <View style={styles.attachedDocuments}>
                    <Text style={styles.emptyText}>
                        Chưa có file đính kèm trong bản ghi này.
                    </Text>
                </View>
            )}
        </>
    );
};

export default DocumentFiles;
