import React, {useState} from "react";
import {View, Text, StyleSheet, TouchableOpacity} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const CollapsibleTaskBlock = ({
    title,
    children,
    backgroundColor = "white",
    noPadding = false,
    noWrapperPadding = false,
}: {
    title: string;
    children: React.ReactNode;
    backgroundColor?: string;
    noPadding?: boolean;
    noWrapperPadding?: boolean;
}) => {
    const [collapsed, setCollapsed] = useState(true);

    return (
        <View
            style={[
                styles.wrapper,
                {backgroundColor},
                noWrapperPadding && {padding: 0},
            ]}>
            <TouchableOpacity
                style={styles.header}
                onPress={() => setCollapsed(!collapsed)}>
                <Text style={styles.title}>{title}</Text>
                <Icon
                    name={
                        collapsed ? "keyboard-arrow-down" : "keyboard-arrow-up"
                    }
                    size={24}
                />
            </TouchableOpacity>
            {!collapsed && (
                <View style={[styles.body, noPadding && {padding: 0}]}>
                    {children}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "#e6f3ff",
        borderRadius: 12,
        marginBottom: 8,
        padding: 10,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    title: {
        fontWeight: "600",
        fontSize: 16,
        width: "90%",
    },
    body: {
        gap: 12,
    },
});

export default CollapsibleTaskBlock;
