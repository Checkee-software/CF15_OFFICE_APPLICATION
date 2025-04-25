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
import useFeedbackStore from '../../../stores/feedbackStore';
import Icon from 'react-native-vector-icons/MaterialIcons';
export default function Feedback1() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [errorTitle, setErrorTitle] = useState('');
    const [errorContent, setErrorContent] = useState('');
    const [loading, setLoading] = useState(false);

    const {submitFeedback} = useFeedbackStore();
    const navigation = useNavigation();

    const handleSubmit = async () => {
        let hasError = false;

        if (title.trim() === '') {
            setErrorTitle('Bắt buộc!');
            hasError = true;
        } else {
            setErrorTitle('');
        }

        if (content.trim() === '') {
            setErrorContent('Bắt buộc!');
            hasError = true;
        } else {
            setErrorContent('');
        }

        if (hasError) return;

        setLoading(true);
        await submitFeedback({title, content});
        setLoading(false);
        setTitle('');
        setContent('');
        navigation.goBack();
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>
                    Tiêu đề <Text style={styles.required}>*</Text>
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        errorTitle ? styles.inputError : null,
                    ]}>
                    <TextInput
                        style={styles.inputWithIcon}
                        placeholder='Nhập tiêu đề'
                        value={title}
                        onChangeText={text => {
                            setTitle(text);
                            if (text.trim()) setErrorTitle('');
                        }}
                    />
                    {title !== '' && (
                        <TouchableOpacity onPress={() => setTitle('')}>
                            <Icon name='close' size={20} color='gray' />
                        </TouchableOpacity>
                    )}
                </View>
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        marginBottom: 8,
    },

    inputWithIcon: {
        flex: 1,
        height: 40,
    },
});
