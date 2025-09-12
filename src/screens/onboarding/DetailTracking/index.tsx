import React, { use, useEffect, useState } from "react";
import { Text, View, ScrollView, StyleSheet, ActivityIndicator } from "react-native";

/* components */
import Row from "./components/Row";
import Section from "./components/Section";
import CollapsibleRow from "./components/CollapsibleRow";

/* configs */
import colors from "@/assets/colors";

/* packages */
import QRCode from "react-native-qrcode-svg";

interface IShow {
    area: boolean;
    location: boolean;
    manager: boolean;
    realArea: boolean;
}

interface IPlant {
    year: string;
    quantity: number;
    data: string[]
}

type TPlant = IPlant[];

const DetailTracking = ({ route }: any) => {
    const { code } = route.params;
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [shows, setShows] = useState<IShow>({
        area: false,
        location: false,
        manager: false,
        realArea: false,
    });
    const [plants] = useState<TPlant>([
        {
            year: "2023",
            quantity: 150,
            data: ["A: 75", "B: 32", "C: 28", "D: 15"]
        },
        {
            year: "2024",
            quantity: 50,
            data: ["A: 40", "B: 10", "C: 0", "D: 0"]
        },
    ])

    useEffect(() => {
        setIsLoading(true);

        setTimeout(() => {
            setIsLoading(false);
        }, Math.random() * 1500);
    }, [])

    const handleShowChange = (key: keyof IShow) =>
        setShows({ ...shows, [key]: !shows[key] });

    if (isLoading) {
        return (
            <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
                <ActivityIndicator size={"large"} color={colors.primary} />
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll_wrapper}>
                <View style={styles.qr_container}>
                    <QRCode value={code} size={256} />
                </View>

                <Section title="Thông tin khu vườn">
                    <Row label="Tên khu vườn" value={"Cà phê khoán K012-01"} />
                    <Row label="Mã khu vườn" valueColor={colors.primary} value={"K012-01"} />

                    <CollapsibleRow
                        label="Diện tích (m2)"
                        value="10.000"
                        expanded={shows.area}
                        onToggle={() => handleShowChange("area")}>
                        <Row label="Chiều dài" value={String(500) + " m"} />
                        <Row label="Chiều rộng" value={String(200) + " m"} />
                    </CollapsibleRow>

                    <CollapsibleRow
                        label="Vị trí khu vườn"
                        value=""
                        expanded={shows.location}
                        onToggle={() => handleShowChange("location")}>
                        <Row label="Kinh độ" value={"10.831310898716058"} />
                        <Row label="Vĩ độ" value={"106.65026300358063"} />
                    </CollapsibleRow>

                    <CollapsibleRow
                        label="Người quản lý"
                        value="Trần Thị Ngọc Nga"
                        expanded={shows.manager}
                        onToggle={() => handleShowChange("manager")}>
                        <Row label="Tổ" value={"Tổ 3"} />
                        <Row label="Hợp đồng" valueColor={colors.gray} value={"Không"} />

                        <CollapsibleRow
                            label="Diện tích giao khoán (m2)"
                            value="7.000"
                            expanded={shows.realArea}
                            onToggle={() => handleShowChange("realArea")}>
                            <Row label="Chiều dài" value={String(350) + " m"} />
                            <Row label="Chiều rộng" value={String(200) + " m"} />
                        </CollapsibleRow>
                    </CollapsibleRow>
                </Section>

                <Section title="Thông tin cây trồng">
                    <Row label="Tên giống cây" value={"Cà phê khoán"} />
                    <Row label="Số lượng giống cây" value={"200 cây"} />
                    {
                        plants.map((item: IPlant) => (
                            <View style={styles.plant_container}>
                                <View style={styles.plant_row}>
                                    <Text style={styles.plant_text}>{item.year}</Text>
                                    <Text style={styles.plant_text}>{String("Trồng " + item.quantity + " cây")}</Text>
                                </View>
                                <View style={styles.plant__data_container}>
                                {
                                    item.data.map((d: string, index: number) => (
                                            <Text key={String(index)} style={styles.plant__data_text}>{d}</Text>
                                        ))
                                    }
                                </View>
                            </View>
                        ))
                    }
                </Section>

                <Section title="Thông tin cây trồng xen">
                    <Row label="Số loại cây trồng xen" value={"2"} />
                    <Row label="Kèn hồng" value={"200 cây"} />
                    <Row label="Muồng đen" value={"300 cây"} />
                </Section>
            </ScrollView>
        </View>
    );
};

export default DetailTracking;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    scroll_wrapper: {
        gap: 20,
    },
    qr_container: {
        alignItems: "center",
    },
    plant_container: {
        gap: 12,
        padding: 12,
        display: "flex",
        borderBottomWidth: 1,
        flexDirection: "column",
        borderBottomColor: colors.light_gray
    },
    plant_row: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-around"
    },
    plant_text: {
        fontWeight: 500,
        color: colors.black,
    },
    plant__data_container: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly"
    },
    plant__data_text: {
        flexGrow: 1,
        textAlign: "center",
        color: colors.gray,
    }
});
