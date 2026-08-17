import React from "react";
import {StyleSheet, Text, TextInput, View} from "react-native";
import {Dropdown} from "react-native-element-dropdown";

type OutgoingBaseFieldsProps = {
    titleValue: string;
    setTitleValue: (val: string) => void;
    categoryId: string;
    categories: any[];
    onCategoryChange: (item: any) => void;
    priorityValue: string | number;
    priorityData: {label: string; value: string | number}[];
    onPriorityChange: (item: any) => void;
    codeValue: string;
    setCodeValue: (val: string) => void;
    errors: Record<string, any>;
};

const OutgoingBaseFields = React.memo(
    ({
        titleValue,
        setTitleValue,
        categoryId,
        categories,
        onCategoryChange,
        priorityValue,
        priorityData,
        onPriorityChange,
        codeValue,
        setCodeValue,
        errors,
    }: OutgoingBaseFieldsProps) => (
        <>
            <Text style={styles.fieldLabel}>
                Tiêu đề tài liệu <Text style={styles.required}>*</Text>
            </Text>
            <View
                style={[
                    styles.inputWrap,
                    errors.title && styles.inputWrapError,
                ]}>
                <TextInput
                    style={styles.input}
                    placeholder="Nhập nội dung"
                    placeholderTextColor="#A0A0A0"
                    value={titleValue}
                    onChangeText={setTitleValue}
                />
            </View>
            {!!errors.title && <Text style={styles.fieldError}>Bắt buộc!</Text>}

            <View style={styles.row}>
                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Loại tài liệu <Text style={styles.required}>*</Text>
                    </Text>
                    <Dropdown
                        style={[
                            styles.select,
                            errors.categoryId && styles.inputWrapError,
                        ]}
                        placeholderStyle={styles.selectText}
                        selectedTextStyle={[styles.selectText, {color: "#222"}]}
                        containerStyle={styles.dropdownMenuContainer}
                        activeColor="#EBF3FC"
                        data={categories}
                        labelField="name"
                        valueField="_id"
                        placeholder="Chọn loại"
                        value={categoryId}
                        onChange={onCategoryChange}
                        renderItem={item => (
                            <View style={styles.dropdownItem}>
                                <Text style={styles.dropdownItemText}>
                                    {item.name} ({item.code})
                                </Text>
                            </View>
                        )}
                        maxHeight={220}
                    />
                    {!!errors.categoryId && (
                        <Text style={styles.fieldError}>Vui lòng chọn!</Text>
                    )}
                </View>
                <View style={styles.half}>
                    <Text style={styles.fieldLabel}>
                        Mức độ ưu tiên <Text style={styles.required}>*</Text>
                    </Text>
                    <Dropdown
                        style={[
                            styles.select,
                            errors.priority && styles.inputWrapError,
                        ]}
                        placeholderStyle={styles.selectText}
                        selectedTextStyle={[styles.selectText, {color: "#222"}]}
                        containerStyle={styles.dropdownMenuContainer}
                        activeColor="#EBF3FC"
                        data={priorityData}
                        labelField="label"
                        valueField="value"
                        placeholder="Chọn mức độ"
                        value={priorityValue}
                        onChange={onPriorityChange}
                        renderItem={item => (
                            <View style={styles.dropdownItem}>
                                <Text style={styles.dropdownItemText}>
                                    {item.label}
                                </Text>
                            </View>
                        )}
                        maxHeight={220}
                    />
                    {!!errors.priority && (
                        <Text style={styles.fieldError}>{errors.priority}</Text>
                    )}
                </View>
            </View>

            <Text style={styles.fieldLabel}>
                Số hiệu văn bản <Text style={styles.required}>*</Text>
            </Text>
            <View
                style={[
                    styles.inputWrapMultiline,
                    errors.registeredNumber && styles.inputWrapError,
                ]}>
                <TextInput
                    style={styles.inputMultiline}
                    placeholder={
                        'Số thứ tự (số thứ tự theo năm) + loại tài liệu "-" hoặc "/" + cơ quan soạn thảo vb'
                    }
                    placeholderTextColor="#A0A0A0"
                    value={codeValue}
                    onChangeText={setCodeValue}
                    multiline
                    numberOfLines={3}
                />
            </View>
            {!!errors.registeredNumber && (
                <Text style={styles.fieldError}>Bắt buộc!</Text>
            )}
        </>
    ),
);

OutgoingBaseFields.displayName = "OutgoingBaseFields";

const styles = StyleSheet.create({
    fieldLabel: {
        fontSize: 13,
        color: "#333",
        marginBottom: 6,
        fontWeight: "500",
    },
    required: {color: "#FF4D4F"},
    inputWrap: {
        height: 44,
        borderWidth: 1,
        borderColor: "#E2E2E2",
        borderRadius: 6,
        paddingHorizontal: 10,
        justifyContent: "center",
        marginBottom: 10,
        backgroundColor: "#FFF",
    },
    inputWrapError: {borderColor: "#FF4D4F"},
    input: {fontSize: 14, color: "#333", padding: 0},
    fieldError: {
        color: "#FF4D4F",
        fontSize: 12,
        marginTop: -6,
        marginBottom: 10,
        textAlign: "right",
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 10,
    },
    half: {flex: 1},
    select: {
        height: 44,
        borderWidth: 1,
        borderColor: "#E2E2E2",
        borderRadius: 6,
        paddingHorizontal: 10,
        backgroundColor: "#FFF",
    },
    selectText: {fontSize: 13, color: "#A0A0A0"},
    dropdownMenuContainer: {borderRadius: 8, overflow: "hidden"},
    dropdownItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    dropdownItemText: {fontSize: 14, color: "#333"},
    inputWrapMultiline: {
        minHeight: 80,
        borderWidth: 1,
        borderColor: "#E2E2E2",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 10,
        backgroundColor: "#FFF",
    },
    inputMultiline: {
        fontSize: 14,
        color: "#333",
        padding: 0,
        textAlignVertical: "top",
    },
});

export default OutgoingBaseFields;
