import React from 'react';
import {View, StyleSheet} from 'react-native';
import {List} from 'react-native-paper';
import TaskBlock from './TaskBlock';
import TaskSummary from './TaskSummary';

type Props = {
    title: string;
    itemOptions: any[];
    typeOptions: any[];
    valueOptions: any[];
    dataList: any[];
    onDeclare: (data: any) => void;
    onRemove: (index: number) => void;
};

const CollapsibleTaskBlock = ({
    title,
    itemOptions,
    typeOptions,
    valueOptions,
    dataList,
    onDeclare,
    onRemove,
}: Props) => {
    const [expanded, setExpanded] = React.useState(false);

    const itemMap = Object.fromEntries(
        itemOptions.map(o => [o.value, o.label]),
    );
    const typeMap = Object.fromEntries(
        typeOptions.map(o => [o.value, o.label]),
    );

    return (
        <View style={styles.container}>
            <List.Accordion
                title={title}
                expanded={expanded}
                onPress={() => setExpanded(!expanded)}
                titleStyle={styles.title}
                style={styles.accordion}>
                <View style={styles.content}>
                    <TaskBlock
                        title={title}
                        itemOptions={itemOptions}
                        typeOptions={typeOptions}
                        valueOptions={valueOptions}
                        onDeclare={onDeclare}
                    />
                    {dataList.map((item, index) => (
                        <TaskSummary
                            key={index}
                            title={title}
                            data={item}
                            index={index}
                            onRemove={onRemove}
                            itemMap={itemMap}
                            typeMap={typeMap}
                        />
                    ))}
                </View>
            </List.Accordion>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#E5F1FB',
        borderRadius: 8,
        marginVertical: 8,
        overflow: 'hidden',
    },
    accordion: {
        backgroundColor: '#E5F1FB',
    },
    title: {
        fontWeight: 400,
        color: 'black',
    },
    content: {
        paddingTop: 8,
        backgroundColor: 'white',
    },
});

export default CollapsibleTaskBlock;
