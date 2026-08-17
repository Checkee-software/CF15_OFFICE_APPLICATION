import React from 'react';
import {View} from 'react-native';
import AutoHeightWebView from 'react-native-autoheight-webview';
import styles from '../styles/styles';

type TDocumentContentProps = {
    htmlContent: string;
};

const DocumentContent = ({htmlContent}: TDocumentContentProps) => (
    <View style={styles.webviewContainer}>
        <AutoHeightWebView
            originWhitelist={['*']}
            source={{html: htmlContent}}
            style={styles.documentContent}
            scrollEnabled={false}
        />
    </View>
);

export default DocumentContent;
