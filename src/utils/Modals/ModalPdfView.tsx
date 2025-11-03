import {View, Text, Modal, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import Pdf from 'react-native-pdf';

const ModalPdfView = (props: {
    visible: boolean;
    pdfFilePath: string;
    onClose: () => void;
}) => {
    const {visible, pdfFilePath, onClose} = props;

    return (
        <Modal visible={visible} animationType='fade'>
            <View style={styles.modalContent}>
                <TouchableOpacity
                    style={styles.button2}
                    onPress={() => onClose()}>
                    <Text style={styles.buttonText2}>Đóng</Text>
                </TouchableOpacity>
                <Pdf
                    trustAllCerts={false}
                    source={{uri: pdfFilePath, cache: false}}
                    style={styles.modalContent}
                    onError={error => {
                        console.log('PDF error:', error);
                    }}
                />
            </View>
        </Modal>
    );
};

export default ModalPdfView;

const styles = StyleSheet.create({
    modalContent: {
        flex: 1,
    },
    button2: {
        alignSelf: 'flex-end',
        marginRight: 10,
        paddingVertical: 8,
    },
    buttonText2: {
        color: 'red',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
