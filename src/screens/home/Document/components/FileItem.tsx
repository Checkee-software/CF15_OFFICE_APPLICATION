import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/styles';
import {AttachedFiles} from '../utils/types';
import {
    formatFileSize,
    getSignatureDotsForFile,
} from '../utils/documentHelpers';

type TFileItemProps = {
    file: AttachedFiles;
    isMain?: boolean;
    index?: number;
    checkedIndex: number | null;
    setCheckedIndex: React.Dispatch<React.SetStateAction<number | null>>;
    openPdfPreview: (file: AttachedFiles) => void;
    downloadFile: (file: AttachedFiles) => void;
    isCheckboxDisabled?: boolean;
    canProcess?: boolean;
    hasSignatureDots?: boolean;
};

const SIGNATURE_DOT_CONFIG = {
    '#FF4B4B': {
        dotStyle: styles.signatureDotRed,
        iconColor: '#FF4B4B',
    },
    '#FF9500': {
        dotStyle: styles.signatureDotYellow,
        iconColor: '#FF9500',
    },
    '#4CAF50': {
        dotStyle: styles.signatureDotGreen,
        iconColor: '#FFFFFF',
    },
} as const;

const renderSignatureDot = (color: string, key: string) => {
    const config =
        SIGNATURE_DOT_CONFIG[color as keyof typeof SIGNATURE_DOT_CONFIG] ||
        SIGNATURE_DOT_CONFIG['#4CAF50'];

    return (
        <View key={key} style={[styles.signatureDot, config.dotStyle]}>
            <MaterialCommunityIcons
                name='check-bold'
                size={10}
                color={config.iconColor}
            />
        </View>
    );
};

const FileItem = ({
    file,
    isMain = false,
    index,
    checkedIndex,
    setCheckedIndex,
    openPdfPreview,
    downloadFile,
    isCheckboxDisabled = false,
    canProcess = false,
    hasSignatureDots,
}: TFileItemProps) => {
    const dots = getSignatureDotsForFile(file);
    const isChecked = checkedIndex === index;
    const showSignatureDots = hasSignatureDots ?? dots.length > 0;
    const showSigningStateColumn = isMain && (canProcess || showSignatureDots);
    const handleToggleChecked = () =>
        setCheckedIndex(prev => (prev === index ? null : index ?? null));

    const signedStatusCheckbox = (
        <View style={styles.signedStatusCheckbox}>
            <MaterialCommunityIcons
                name='check-bold'
                size={12}
                color='#FFFFFF'
            />
        </View>
    );

    const fileRow = (
        <View style={isMain ? styles.signingFileInner : styles.fileCard}>
            <View style={styles.fileLeft}>
                {showSigningStateColumn ? (
                    <View style={styles.signingCheckboxColumn}>
                        {showSignatureDots ? (
                            canProcess && !isCheckboxDisabled ? (
                                <TouchableOpacity
                                    onPress={handleToggleChecked}
                                    style={styles.checkboxWrap}
                                    activeOpacity={0.75}>
                                    {signedStatusCheckbox}
                                </TouchableOpacity>
                            ) : (
                                <View style={styles.checkboxWrap}>
                                    {signedStatusCheckbox}
                                </View>
                            )
                        ) : canProcess ? (
                            <TouchableOpacity
                                disabled={isCheckboxDisabled}
                                onPress={handleToggleChecked}
                                style={styles.checkboxWrap}>
                                <MaterialCommunityIcons
                                    name={
                                        isChecked
                                            ? 'checkbox-marked'
                                            : 'checkbox-blank-outline'
                                    }
                                    size={21}
                                    color={
                                        isChecked
                                            ? isCheckboxDisabled
                                                ? '#9E9E9E'
                                                : '#1E88E5'
                                            : '#707070'
                                    }
                                />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.signingCheckboxPlaceholder} />
                        )}
                        {showSignatureDots ? (
                            <View style={styles.signatureRowUnderCheckbox}>
                                {dots.map((color, idx) =>
                                    renderSignatureDot(
                                        color,
                                        `${color}-${idx}`,
                                    ),
                                )}
                            </View>
                        ) : null}
                    </View>
                ) : null}

                <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => openPdfPreview(file)}
                    style={styles.filePreviewButton}>
                    <MaterialCommunityIcons
                        name='file-pdf-box'
                        color='#FF5B57'
                        size={24}
                    />

                    <View style={styles.fileNameWrap}>
                        <Text style={styles.fileName} numberOfLines={1}>
                            {file.originalname}
                        </Text>
                        {!isMain && showSignatureDots ? (
                            <View style={styles.signatureRow}>
                                {dots.map((color, idx) =>
                                    renderSignatureDot(
                                        color,
                                        `${color}-${idx}`,
                                    ),
                                )}
                            </View>
                        ) : null}
                    </View>
                </TouchableOpacity>
            </View>

            <View
                style={
                    isMain ? styles.signingFileMetaColumn : styles.fileRight
                }>
                <Text
                    style={[
                        styles.fileSize,
                        !isMain && styles.fileRightFileSize,
                    ]}>
                    {formatFileSize(file.size)}
                </Text>
                {isMain ? <View style={styles.signingMetaSpacer} /> : null}
                <TouchableOpacity
                    onPress={() => downloadFile(file)}
                    style={isMain ? styles.signingDownloadBtn : undefined}>
                    <MaterialCommunityIcons
                        name='download'
                        color='#1E88E5'
                        size={20}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (!isMain) {
        return fileRow;
    }

    return <View style={styles.signingFileCardOuter}>{fileRow}</View>;
};

export default FileItem;
