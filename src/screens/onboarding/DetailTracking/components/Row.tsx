import colors from "@/assets/colors";
import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface IRowProps {
    label: string;
    value: string | number;
    valueColor?: string;
}

const Row = ({ label, value, valueColor }: IRowProps) => (
    <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 16,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    label: {
        minWidth: 150,
        textAlign: "left",
        color: colors.black,
    },
    value: {
        fontWeight: 500,
        textAlign: "right",
        color: colors.black,
    },
});

export default Row;
