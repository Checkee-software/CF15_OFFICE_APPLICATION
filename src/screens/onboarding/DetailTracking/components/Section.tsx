import colors from "@/assets/colors";
import React from "react";
import {View, Text, StyleSheet} from "react-native";

interface ISectionProps {
    title: string;
    children: React.ReactNode;
}

const Section = ({title, children}: ISectionProps) => (
    <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {children}
    </View>
);

const styles = StyleSheet.create({
    container: {
        gap: 20,
        // flex: 1,
        flexDirection: "column",
    },
    title: {
        fontSize: 16,
        fontWeight: 500,
        color: colors.primary,
    },
});

export default Section;
