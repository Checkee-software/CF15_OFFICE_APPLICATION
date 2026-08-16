import colors from "@/assets/colors";
import React from "react";
import {
    View,
    Text,
    Modal,
    StyleSheet,
    SafeAreaView,
    Pressable,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
} from "react-native";

import FeatherIcon from "react-native-vector-icons/Feather";
import {
    licenses,
    license_title,
    license_right,
    license_footer,
    ILicense,
    IChildTerm,
} from "@/utils/license";
import CheckBox from "react-native-check-box";

interface ILicenseModal {
    visible: boolean;
    onClose: () => void;
    onShow: () => void;
    isChecked: boolean;
    isLoading: boolean;
    onChecked: () => void;
    onSubmit: () => void;
}

const LicenseModal = (props: ILicenseModal) => {
    return (
        <Modal
            key={"license_modal"}
            visible={props.visible}
            transparent
            onRequestClose={props.onClose}
            onShow={props.onShow}
            animationType="slide">
            <SafeAreaView style={{flex: 1, backgroundColor: colors.background}}>
                <View style={styles.container}>
                    <Pressable style={styles.header} onPress={props.onClose}>
                        <FeatherIcon
                            size={20}
                            color={colors.black}
                            name="arrow-left"
                        />
                        <Text style={styles.header_title}>
                            Điều khoản sử dụng
                        </Text>
                    </Pressable>
                    <Text style={styles.title}>{license_title}</Text>
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{gap: 20}}>
                        {licenses.map((item: ILicense, index: number) => (
                            <View key={String(index + 1)} style={{gap: 16}}>
                                <Text style={styles.license_term}>
                                    {item.term}
                                </Text>
                                {!item.isChildTerm
                                    ? item.values.map(
                                          (
                                              value: string,
                                              valueIndex: number,
                                          ) => (
                                              <Text
                                                  key={String(valueIndex)}
                                                  style={styles.license_value}>
                                                  {value}
                                              </Text>
                                          ),
                                      )
                                    : item.childTerms.map(
                                          (
                                              child: IChildTerm,
                                              childIndex: number,
                                          ) => (
                                              <View
                                                  key={String(childIndex + 1)}
                                                  style={
                                                      styles.license_child_term
                                                  }>
                                                  <Text
                                                      style={
                                                          styles.license_child_label
                                                      }>
                                                      {child.label}
                                                  </Text>
                                                  {child.values.map(
                                                      (
                                                          value: string,
                                                          childValueIndex: number,
                                                      ) => (
                                                          <Text
                                                              key={String(
                                                                  childValueIndex +
                                                                      1,
                                                              )}
                                                              style={
                                                                  styles.license_value
                                                              }>
                                                              {value}
                                                          </Text>
                                                      ),
                                                  )}
                                              </View>
                                          ),
                                      )}
                            </View>
                        ))}
                        <View style={styles.submit_wrapper}>
                            <Text style={styles.submit_footer}>
                                {license_footer}
                            </Text>
                            <CheckBox
                                style={{flex: 1, padding: 0}}
                                onClick={props.onChecked}
                                isChecked={props.isChecked}
                                rightText={license_right}
                                checkedCheckBoxColor={colors.blue}
                                rightTextStyle={{fontSize: 16}}
                            />
                            <TouchableOpacity
                                disabled={!props.isChecked}
                                style={[
                                    styles.submit_button,
                                    {
                                        backgroundColor: props.isChecked
                                            ? colors.primary
                                            : colors.gray,
                                    },
                                ]}
                                onPress={props.onSubmit}>
                                {props.isLoading ? (
                                    <ActivityIndicator
                                        color={colors.white}
                                        size={"small"}
                                    />
                                ) : (
                                    <Text style={styles.submit_button_text}>
                                        Đồng ý
                                    </Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 32,
        padding: 20,
        flexDirection: "column",
    },
    header: {
        gap: 8,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
    },
    header_title: {
        fontSize: 16,
        fontWeight: 500,
        color: colors.black,
    },
    title: {
        fontSize: 24,
        fontWeight: 700,
        color: colors.black,
        textTransform: "uppercase",
    },
    license_term: {
        fontSize: 16,
        fontWeight: 700,
        color: colors.brown,
    },
    license_child_term: {
        display: "flex",
        gap: 8,
    },
    license_child_label: {
        fontWeight: 600,
    },
    license_value: {
        fontWeight: 400,
        letterSpacing: 0.2,
    },
    submit_wrapper: {
        gap: 12,
        display: "flex",
        borderTopWidth: 1,
        flexDirection: "column",
        borderTopColor: colors.gray,
        paddingVertical: 16,
    },
    submit_footer: {
        fontSize: 16,
        fontWeight: 700,
        color: colors.black,
    },
    submit_button: {
        minHeight: 48,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors.primary,
    },
    submit_button_text: {
        fontSize: 16,
        fontWeight: 500,
        color: colors.white,
        textTransform: "uppercase",
    },
});

export default LicenseModal;
