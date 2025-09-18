import colors from "@/assets/colors";
import React from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import FeatherIcon from "react-native-vector-icons/Feather";

interface ICollapsibleRowProps {
    label: string;
    value: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode
}

const CollapsibleRow = ({ label, value, expanded, onToggle, children }: ICollapsibleRowProps) => (
    <>
        <TouchableOpacity onPress={onToggle} style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.value_with_icon}>
                <Text style={styles.value}>{value}</Text>
                <FeatherIcon
                    size={20}
                    color={colors.primary}
                    name={ expanded ? "chevron-up" : "chevron-down" }
                />
            </View>
        </TouchableOpacity>
        {expanded && <View style={styles.indented_content}>{children}</View>}
    </>
);

const styles = StyleSheet.create({
    container: {
        gap: 8,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    label: {
        color: colors.black
    },
    value_with_icon: {
        gap: 4,
        flexDirection: "row",
        alignItems: "center",
    },
    value: {
        fontWeight: 500,
        color: colors.black,
    },
    indented_content: {
        gap: 16,
        marginLeft: 20,
        display: "flex",
        flexDirection: "column",
    },
});

export default CollapsibleRow;
