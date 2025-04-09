import React, {useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import SCREEN_INFO from '../../../config/SCREEN_CONFIG/screenInfo';
export default function Feedback1() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [errorTitle, setErrorTitle] = useState('');
    const [errorContent, setErrorContent] = useState('');
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const handleSubmit = () => {
        let hasError = false;

        if (title.trim() === '') {
            setErrorTitle('Tiêu đề không được để trống');
            hasError = true;
        } else {
            setErrorTitle('');
        }

        if (content.trim() === '') {
            setErrorContent('Nội dung không được để trống');
            hasError = true;
        } else {
            setErrorContent('');
        }

        if (hasError) return;

        setLoading(true);

        setTimeout(() => {
            const newFeedback = {
                id: Date.now().toString(),
                name: 'Kim Ngân',
                role: 'Nhân viên',
                content,
                title,
                avatar: 'https://i.pravatar.cc/150?img=2',
                time: new Date().toLocaleString('vi-VN'),
            };

            navigation.navigate(SCREEN_INFO.FEEDBACK.key, {newFeedback});
        }, 1500);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>
                    Tiêu đề <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        errorTitle ? styles.inputError : null,
                    ]}
                    placeholder='Nhập tiêu đề'
                    value={title}
                    onChangeText={text => {
                        setTitle(text);
                        if (text.trim()) setErrorTitle('');
                    }}
                />
                {errorTitle ? (
                    <Text style={styles.errorText}>{errorTitle}</Text>
                ) : null}

                <Text style={styles.label}>
                    Nội dung góp ý <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={[
                        styles.textArea,
                        errorContent ? styles.inputError : null,
                    ]}
                    placeholder='Nhập nội dung'
                    value={content}
                    onChangeText={text => {
                        setContent(text);
                        if (text.trim()) setErrorContent('');
                    }}
                    multiline
                    numberOfLines={4}
                />
                {errorContent ? (
                    <Text style={styles.errorText}>{errorContent}</Text>
                ) : null}
            </View>

            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={loading}>
                {loading ? (
                    <ActivityIndicator color='#fff' />
                ) : (
                    <Text style={styles.buttonText}>Xác nhận</Text>
                )}
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
        justifyContent: 'space-between',
    },
    form: {
        flex: 1,
        marginTop: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 4,
    },
    required: {
        color: 'red',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        height: 120,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    inputError: {
        borderColor: 'red',
    },
    errorText: {
        color: 'red',
        marginBottom: 8,
        fontSize: 13,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 16,
        borderRadius: 6,
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
    },
});