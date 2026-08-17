import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { ESignDepartment } from './constants';

type OutgoingSignSectionProps = {
    errors: Record<string, any>;
    setErrors: React.Dispatch<React.SetStateAction<any>>;
    signedDepartmentValue: string;
    setSignedDepartmentValue: (val: string) => void;
    isDirectorLevel: boolean;
    departmentList: any[];
    selectedReceiveDeptId: string;
    setSelectedReceiveDeptId: (val: string) => void;
    setSelectedReceiveDeptName: (val: string) => void;
    isFetchingDepartments: boolean;
    signerUserList: any[];
    selectedSignerUserId: string;
    setSelectedSignerUserId: (val: string) => void;
    setSelectedSignerUserName: (val: string) => void;
    isFetchingSigners: boolean;
    approverUserList: any[];
    selectedApproverUserId: string;
    setSelectedApproverUserId: (val: string) => void;
    setSelectedApproverUserName: (val: string) => void;
};

const OutgoingSignSection = React.memo(({
    errors,
    setErrors,
    signedDepartmentValue,
    setSignedDepartmentValue,
    isDirectorLevel,
    departmentList,
    selectedReceiveDeptId,
    setSelectedReceiveDeptId,
    setSelectedReceiveDeptName,
    isFetchingDepartments,
    signerUserList,
    selectedSignerUserId,
    setSelectedSignerUserId,
    setSelectedSignerUserName,
    isFetchingSigners,
    approverUserList,
    selectedApproverUserId,
    setSelectedApproverUserId,
    setSelectedApproverUserName,
}: OutgoingSignSectionProps) => (
    <>
        <Text style={[styles.fieldLabel, { marginTop: 10 }]}>
            Bộ phận ký duyệt <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.radioRow}>
            <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                    setSignedDepartmentValue(ESignDepartment.DEPARTMENT);
                    setErrors((prev: any) => ({ ...prev, signedDepartment: undefined }));
                }}
            >
                <View style={[styles.radioOuter, signedDepartmentValue === ESignDepartment.DEPARTMENT && styles.radioOuterActive]}>
                    {signedDepartmentValue === ESignDepartment.DEPARTMENT && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Phòng ban</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.radioOption}
                onPress={() => {
                    setSignedDepartmentValue(ESignDepartment.MANAGEMENT);
                    setErrors((prev: any) => ({ ...prev, signedDepartment: undefined }));
                }}
            >
                <View style={[styles.radioOuter, signedDepartmentValue === ESignDepartment.MANAGEMENT && styles.radioOuterActive]}>
                    {signedDepartmentValue === ESignDepartment.MANAGEMENT && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.radioLabel}>Ban giám đốc</Text>
            </TouchableOpacity>
        </View>
        {!!errors.signedDepartment && <Text style={styles.fieldErrorLeft}>{errors.signedDepartment}</Text>}

        <View style={styles.row}>
            <View style={styles.half}>
                <Text style={styles.fieldLabel}>
                    {isDirectorLevel ? 'Phòng ban tiếp nhận' : 'Bộ phận tiếp nhận'}
                    {' '}<Text style={styles.required}>*</Text>
                </Text>
                <Dropdown
                    style={styles.select}
                    placeholderStyle={styles.selectText}
                    selectedTextStyle={[styles.selectText, { color: '#222' }]}
                    containerStyle={styles.dropdownMenuContainer}
                    activeColor="#EBF3FC"
                    data={departmentList}
                    labelField="name"
                    valueField="_id"
                    placeholder="Chọn bộ phận"
                    value={selectedReceiveDeptId}
                    onChange={item => {
                        setSelectedReceiveDeptId(item._id);
                        setSelectedReceiveDeptName(item.name);
                    }}
                    renderItem={item => (
                        <View style={styles.dropdownItem}>
                            <Text style={styles.dropdownItemText}>{item.name}</Text>
                        </View>
                    )}
                    maxHeight={220}
                    flatListProps={{
                        ListEmptyComponent: isFetchingDepartments ? (
                            <ActivityIndicator size="small" color="#1E88E5" style={{ padding: 12 }} />
                        ) : (
                            <Text style={[styles.dropdownItemText, { paddingHorizontal: 12, paddingVertical: 10, color: '#A0A0A0' }]}>Chưa có dữ liệu</Text>
                        ),
                    }}
                />
            </View>
            <View style={styles.half}>
                <Text style={styles.fieldLabel}>
                    {isDirectorLevel ? 'Người ký nháy' : 'Người ký'}
                    {' '}<Text style={styles.required}>*</Text>
                </Text>
                <Dropdown
                    style={styles.select}
                    placeholderStyle={styles.selectText}
                    selectedTextStyle={[styles.selectText, { color: '#222' }]}
                    containerStyle={styles.dropdownMenuContainer}
                    activeColor="#EBF3FC"
                    data={signerUserList}
                    labelField="fullName"
                    valueField="_id"
                    placeholder="Chọn người ký"
                    value={selectedSignerUserId}
                    onChange={item => {
                        setSelectedSignerUserId(item._id);
                        setSelectedSignerUserName(item.fullName);
                    }}
                    renderItem={item => (
                        <View style={styles.dropdownItem}>
                            <Text style={styles.dropdownItemText}>{item.fullName}</Text>
                        </View>
                    )}
                    maxHeight={220}
                    flatListProps={{
                        ListEmptyComponent: isFetchingSigners ? (
                            <ActivityIndicator size="small" color="#4CAF50" style={{ padding: 12 }} />
                        ) : (
                            <Text style={[styles.dropdownItemText, { paddingHorizontal: 12, paddingVertical: 10, color: '#A0A0A0' }]}>Chưa có dữ liệu</Text>
                        ),
                    }}
                />
            </View>
        </View>

        {isDirectorLevel && (
            <View style={[styles.fullDropdownWrap, { marginTop: 4 }]}>
                <Text style={styles.fieldLabel}>Ban giám đốc ký duyệt <Text style={styles.required}>*</Text></Text>
                <Dropdown
                    style={styles.select}
                    placeholderStyle={styles.selectText}
                    selectedTextStyle={[styles.selectText, { color: '#222' }]}
                    containerStyle={styles.dropdownMenuContainer}
                    activeColor="#EBF3FC"
                    data={approverUserList}
                    labelField="fullName"
                    valueField="_id"
                    placeholder="Chọn ban giám đốc ký duyệt"
                    value={selectedApproverUserId}
                    onChange={item => {
                        setSelectedApproverUserId(item._id);
                        setSelectedApproverUserName(item.fullName);
                    }}
                    renderItem={item => (
                        <View style={styles.dropdownItem}>
                            <Text style={styles.dropdownItemText}>{item.fullName}</Text>
                        </View>
                    )}
                    maxHeight={220}
                    flatListProps={{
                        ListEmptyComponent: isFetchingSigners ? (
                            <ActivityIndicator size="small" color="#4CAF50" style={{ padding: 12 }} />
                        ) : (
                            <Text style={[styles.dropdownItemText, { paddingHorizontal: 12, paddingVertical: 10, color: '#A0A0A0' }]}>Chưa có dữ liệu</Text>
                        ),
                    }}
                />
            </View>
        )}
    </>
));

OutgoingSignSection.displayName = 'OutgoingSignSection';

const styles = StyleSheet.create({
    fieldLabel: { fontSize: 13, color: '#333', marginBottom: 6, fontWeight: '500' },
    required: { color: '#FF4D4F' },
    radioRow: { flexDirection: 'row', gap: 20, marginBottom: 10 },
    radioOption: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    radioOuter: {
        width: 18,
        height: 18,
        borderRadius: 9,
        borderWidth: 2,
        borderColor: '#9E9E9E',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterActive: { borderColor: '#4CAF50' },
    radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#4CAF50' },
    radioLabel: { fontSize: 14, color: '#333' },
    fieldErrorLeft: { color: '#FF4D4F', fontSize: 12, marginTop: -6, marginBottom: 10, textAlign: 'left' },
    row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
    half: { flex: 1 },
    select: {
        height: 44,
        borderWidth: 1,
        borderColor: '#E2E2E2',
        borderRadius: 6,
        paddingHorizontal: 10,
        backgroundColor: '#FFF',
    },
    selectText: { fontSize: 13, color: '#A0A0A0' },
    dropdownMenuContainer: { borderRadius: 8, overflow: 'hidden' },
    dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    dropdownItemText: { fontSize: 14, color: '#333' },
    fullDropdownWrap: { marginBottom: 10 },
});

export default OutgoingSignSection;
