/* eslint-disable react-hooks/exhaustive-deps */
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Image,
    SectionList,
} from "react-native";
import React, {useEffect, useState} from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SCREEN_INFO from "../../../config/SCREEN_CONFIG/screenInfo";
import images from "../../../assets/images";
import {useWorkerStore} from "../../../stores/workerStore";
import Loading from "@/screens/subscreen/Loading";
import {useAuthStore} from "../../../stores/authStore";
import {
    EOrganization,
    organizations,
} from "@/shared-types/common/Permissions/Permissions";
import Snackbar from "react-native-snackbar";

const Woker = ({navigation}: any) => {
    const {
        listWorker,
        listWorkerFilterByRole,
        getListWorkerByDepartment,
        isLoading,
        groupedGarden,
    } = useWorkerStore();

    const {userInfo} = useAuthStore();

    const [searchWorker, setSearchWorker] = useState("");
    const [selectedUnitCard, setSelectedUnitCard] = useState<string>("");

    const filterWorkerBySearch = listWorker.filter(user =>
        user?.fullName.toLowerCase().includes(searchWorker.toLowerCase()),
    );

    const handleNavigate = (itemListWorker: any) => {
        if (
            userInfo.functions.some(
                (item: any) => item._id === "EMPLOYEES" && item.detail,
            )
        ) {
            navigation.navigate(SCREEN_INFO.WORKERINFO.key, {
                itemListWorker,
            });
        } else {
            Snackbar.show({
                text: "Bạn không có quyền xem chi tiết nhân sự",
                duration: Snackbar.LENGTH_SHORT,
            });
        }
    };

    const handleReFetch = () => {
        setSelectedUnitCard("");
        setSearchWorker("");
        getListWorkerByDepartment(userInfo._id, userInfo.userType.level);
    };

    const renderWorkerBySearch = (itemWorkerBySearch: any) => (
        <View style={WokerStyles.listWorkerMargin}>
            <TouchableOpacity
                style={WokerStyles.workerCard}
                onPress={() => handleNavigate(itemWorkerBySearch)}>
                <View style={WokerStyles.leftWorkerCard}>
                    <View style={WokerStyles.workerAvatar}>
                        <Image
                            source={
                                itemWorkerBySearch.avatar
                                    ? {
                                          uri: itemWorkerBySearch.avatar,
                                      }
                                    : images.avatar
                            }
                            style={WokerStyles.avatar}
                        />
                    </View>

                    <View style={WokerStyles.workerNameAndUnit}>
                        <Text style={WokerStyles.workerName}>
                            {itemWorkerBySearch.fullName}
                        </Text>
                        <Text style={WokerStyles.workerUnit}>
                            {itemWorkerBySearch.roleName}
                            {itemWorkerBySearch.userType.level ===
                            EOrganization.DEPARTMENT
                                ? ` - ${itemWorkerBySearch.departmentName}`
                                : itemWorkerBySearch?.groupName &&
                                  ` - ${itemWorkerBySearch.groupName}`}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderWorkersUnit = (itemListWorkerUnit: any) => (
        <View style={WokerStyles.listWorkerMargin}>
            <TouchableOpacity
                style={WokerStyles.workerCard}
                onPress={() => handleNavigate(itemListWorkerUnit)}>
                <View style={WokerStyles.leftWorkerCard}>
                    <View style={WokerStyles.workerAvatar}>
                        <Image
                            source={
                                itemListWorkerUnit.avatar
                                    ? {
                                          uri: itemListWorkerUnit.avatar,
                                      }
                                    : images.avatar
                            }
                            style={WokerStyles.avatar}
                        />
                    </View>

                    <View style={WokerStyles.workerNameAndUnit}>
                        <Text style={WokerStyles.workerName}>
                            {itemListWorkerUnit.fullName}
                        </Text>
                        <Text style={WokerStyles.workerUnit}>
                            {itemListWorkerUnit.roleName
                                ? itemListWorkerUnit.roleName
                                : organizations.find(
                                      org =>
                                          org.code ===
                                          itemListWorkerUnit.userType.level,
                                  )?.label}
                            {itemListWorkerUnit?.groupName &&
                                ` - ${itemListWorkerUnit.groupName}`}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
    );

    const renderListWorker = (itemListWorker: any) => {
        if (itemListWorker?.isUnit) {
            const unitWorker = groupedGarden.find(
                item => item.groupId === itemListWorker.groupId,
            );
            return (
                <View>
                    <TouchableOpacity
                        style={WokerStyles.workerUnitCard}
                        onPress={() =>
                            setSelectedUnitCard(itemListWorker.groupId)
                        }>
                        <Text>
                            {itemListWorker?.groupName || "Đội này chưa có tên"}
                            {` (${itemListWorker?.quantity})`}
                        </Text>
                        <MaterialIcons
                            name={
                                itemListWorker.groupId === selectedUnitCard
                                    ? "arrow-drop-up"
                                    : "arrow-drop-down"
                            }
                            color={"rgba(128, 128, 128, 1)"}
                            size={25}
                        />
                    </TouchableOpacity>

                    {selectedUnitCard === itemListWorker.groupId && (
                        <FlatList
                            data={unitWorker?.workers || []}
                            renderItem={({item}) => renderWorkersUnit(item)}
                            keyExtractor={(item, index) => item._id + index}
                            //initialNumToRender={12} // render ít ban đầu
                            //maxToRenderPerBatch={10}
                            //windowSize={5} // viewport buffer nhỏ để đỡ lag
                            //removeClippedSubviews={true}
                            //updateCellsBatchingPeriod={50}
                            ListEmptyComponent={
                                <Text style={WokerStyles.workerUnit}>
                                    Đội này chưa có nguời lao động
                                </Text>
                            }
                        />
                    )}
                </View>
            );
        }

        return (
            <View style={WokerStyles.listWorkerMargin}>
                <TouchableOpacity
                    style={WokerStyles.workerCard}
                    onPress={() => handleNavigate(itemListWorker)}>
                    <View style={WokerStyles.leftWorkerCard}>
                        <View style={WokerStyles.workerAvatar}>
                            <Image
                                source={
                                    itemListWorker.avatar
                                        ? {
                                              uri: itemListWorker.avatar,
                                          }
                                        : images.avatar
                                }
                                style={WokerStyles.avatar}
                            />
                        </View>

                        <View style={WokerStyles.workerNameAndUnit}>
                            <Text style={WokerStyles.workerName}>
                                {itemListWorker.fullName}
                            </Text>
                            <Text style={WokerStyles.workerUnit}>
                                {itemListWorker.roleName}
                                {itemListWorker.userType.level ===
                                EOrganization.DEPARTMENT
                                    ? ` - ${itemListWorker.departmentName}`
                                    : itemListWorker?.groupName &&
                                      ` - ${itemListWorker.groupName}`}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    useEffect(() => {
        getListWorkerByDepartment(userInfo._id, userInfo.userType.level);
    }, []);

    if (isLoading) {
        return <Loading />;
    }

    return (
        <View style={WokerStyles.container}>
            <View style={WokerStyles.searchInput}>
                <MaterialIcons
                    name="search"
                    color={"rgba(128, 128, 128, 1)"}
                    size={22}
                />
                <TextInput
                    value={searchWorker}
                    placeholder="Tìm kiếm nhân sự"
                    placeholderTextColor={"rgba(128, 128, 128, 1)"}
                    style={WokerStyles.input}
                    onChangeText={setSearchWorker}
                />
            </View>

            {searchWorker !== "" ? (
                <View style={WokerStyles.searchListWorker}>
                    <FlatList
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={WokerStyles.sectionListWorker}
                        data={filterWorkerBySearch}
                        renderItem={({item}) => renderWorkerBySearch(item)}
                        keyExtractor={(item, index) => index.toString()}
                        onRefresh={handleReFetch}
                        refreshing={isLoading}
                        ListEmptyComponent={
                            <View style={WokerStyles.workerEmpty}>
                                <Image
                                    source={images.emptyWorkerList}
                                    style={WokerStyles.emptyWorkerImg}
                                    resizeMode="contain"
                                />
                                <Text style={WokerStyles.emptyWorkerText}>
                                    {`Không tìm thấy nhân sự phù hợp với \n “${searchWorker}"`}
                                </Text>
                            </View>
                        }
                    />
                </View>
            ) : (
                <View style={WokerStyles.listWorker}>
                    <SectionList
                        keyboardShouldPersistTaps="handled"
                        contentContainerStyle={WokerStyles.sectionListWorker}
                        sections={listWorkerFilterByRole}
                        keyExtractor={(item, index) => index.toString()}
                        onRefresh={handleReFetch}
                        refreshing={isLoading}
                        renderItem={({item}) => renderListWorker(item)}
                        renderSectionHeader={({section}) => (
                            <Text style={WokerStyles.workerRole}>
                                {section.title === "Người lao động"
                                    ? `${section.title} (${section.data.reduce(
                                          (total, item) =>
                                              total + item.quantity,
                                          0,
                                      )})`
                                    : `${section.title} (${section.data.length})`}
                            </Text>
                        )}
                        ListEmptyComponent={
                            <View style={WokerStyles.workerEmpty}>
                                <Image
                                    source={images.emptyWorkerList}
                                    style={WokerStyles.emptyWorkerImg}
                                    resizeMode="contain"
                                />
                                <Text style={WokerStyles.emptyWorkerText}>
                                    Không tìm thấy danh sách nhân sự!
                                </Text>
                            </View>
                        }
                    />
                </View>
            )}
        </View>
    );
};

const WokerStyles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: "#fff",
    },
    searchInput: {
        flexDirection: "row",
        justifyContent: "flex-start",
        alignItems: "center",
        borderBottomWidth: 1,
        borderBottomColor: "rgba(211, 211, 211, 1)",
        gap: 4,
    },
    input: {
        color: "black",
        width: "92%",
    },
    listWorker: {
        marginTop: 10,
        flex: 1,
    },
    sectionListWorker: {
        flexGrow: 1,
    },
    workerByRoleSection: {
        gap: 15,
    },
    workerRole: {
        marginTop: 10,
        fontWeight: 500,
        fontSize: 14,
        color: "rgba(0, 0, 0, 1)",
    },
    listWorkerMargin: {
        marginVertical: 12,
    },
    workerUnitCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        //boxShadow: '0px 0px 2px 0px rgba(0, 0, 0, 0.25)',
        boxShadow: "0 1 3 0 rgba(0, 0, 0, 0.25)",
        padding: 12,
        marginVertical: 6,
    },
    workerCard: {
        paddingHorizontal: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    leftWorkerCard: {
        flexDirection: "row",
        gap: 13,
        alignItems: "center",
        flex: 1,
    },
    workerAvatar: {
        backgroundColor: "rgba(211, 211, 211, 1)",
        borderRadius: "50%",
        width: 56,
        height: 56,
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 24,
        margin: "auto",
    },
    workerNameAndUnit: {
        gap: 2,
        width: "80%",
    },
    workerName: {
        color: "rgba(76, 175, 80, 1)",
        fontWeight: 600,
        fontSize: 15,
        textTransform: "capitalize",
    },
    workerUnit: {
        textTransform: "capitalize",
        fontSize: 13,
        fontWeight: 400,
        color: "rgba(0, 0, 0, 1)",
    },
    workerOrder: {
        color: "rgba(128, 128, 128, 1)",
        fontWeight: 400,
        fontSize: 14,
        textTransform: "uppercase",
    },
    workerEmpty: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyWorkerImg: {
        height: 200,
    },
    emptyWorkerText: {
        textAlign: "center",
        fontWeight: 400,
        fontSize: 14,
        color: "rgba(128, 128, 128, 1)",
    },
    searchListWorker: {
        paddingVertical: 10,
        flex: 1,
    },
});

export default Woker;
