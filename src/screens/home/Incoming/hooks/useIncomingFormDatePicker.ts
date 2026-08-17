import {useState, useCallback} from 'react';
import {Keyboard} from 'react-native';
import {
    formatDate,
    normalizeDateInput,
    todayIsoDate,
    type TFocusableIncomingField,
} from '../utils';

export const useIncomingFormDatePicker = (
    clearEditorFocus: () => void,
    resetMenus: () => void,
    setFocusedField: (field: TFocusableIncomingField | null) => void,
    setErrors: React.Dispatch<React.SetStateAction<any>>,
) => {
    const [createdAtValue, setCreatedAtValue] = useState(todayIsoDate());
    const [finishedAtValue, setFinishedAtValue] = useState('');
    const [finishedAtDisplay, setFinishedAtDisplay] = useState('');

    const [showCreatedDatePicker, setShowCreatedDatePicker] = useState(false);
    const [showFinishedDatePicker, setShowFinishedDatePicker] = useState(false);
    const [datePickerDraft, setDatePickerDraft] = useState('');
    const [datePickerError, setDatePickerError] = useState('');

    const openCreatedDatePicker = useCallback(() => {
        Keyboard.dismiss();
        clearEditorFocus();
        resetMenus();
        setFocusedField('createdAt');
        setDatePickerDraft(formatDate(createdAtValue));
        setDatePickerError('');
        setShowCreatedDatePicker(true);
    }, [clearEditorFocus, resetMenus, setFocusedField, createdAtValue]);

    const openFinishedDatePicker = useCallback(() => {
        Keyboard.dismiss();
        clearEditorFocus();
        resetMenus();
        setFocusedField('finishedAt');
        setDatePickerDraft(
            finishedAtDisplay ||
                (finishedAtValue ? formatDate(finishedAtValue) : ''),
        );
        setDatePickerError('');
        setShowFinishedDatePicker(true);
    }, [
        clearEditorFocus,
        resetMenus,
        setFocusedField,
        finishedAtDisplay,
        finishedAtValue,
    ]);

    const closeDatePicker = useCallback(() => {
        setShowCreatedDatePicker(false);
        setShowFinishedDatePicker(false);
        setDatePickerDraft('');
        setDatePickerError('');
        setFocusedField(null);
    }, [setFocusedField]);

    const applyDateValue = useCallback(
        (iso: string) => {
            if (showCreatedDatePicker) {
                setCreatedAtValue(iso);
            }
            if (showFinishedDatePicker) {
                setFinishedAtValue(iso);
                setFinishedAtDisplay(formatDate(iso));
                setErrors((prev: any) => ({...prev, finishedAt: undefined}));
            }
            closeDatePicker();
        },
        [
            showCreatedDatePicker,
            showFinishedDatePicker,
            closeDatePicker,
            setErrors,
        ],
    );

    const submitDatePickerDraft = useCallback(() => {
        const iso = normalizeDateInput(datePickerDraft);
        if (!iso) {
            setDatePickerError(
                'Ngày không hợp lệ. Vui lòng nhập dạng DD/MM/YYYY.',
            );
            return;
        }
        applyDateValue(iso);
    }, [datePickerDraft, applyDateValue]);

    const applyRelativeDate = useCallback(
        (offsetDays: number) => {
            const d = new Date();
            d.setDate(d.getDate() + offsetDays);
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            applyDateValue(`${yyyy}-${mm}-${dd}`);
        },
        [applyDateValue],
    );

    const resetDatePicker = useCallback(() => {
        setCreatedAtValue(todayIsoDate());
        setFinishedAtValue('');
        setFinishedAtDisplay('');
        setShowCreatedDatePicker(false);
        setShowFinishedDatePicker(false);
    }, []);

    return {
        createdAtValue,
        setCreatedAtValue,
        finishedAtValue,
        setFinishedAtValue,
        finishedAtDisplay,
        setFinishedAtDisplay,
        showCreatedDatePicker,
        setShowCreatedDatePicker,
        showFinishedDatePicker,
        setShowFinishedDatePicker,
        datePickerDraft,
        setDatePickerDraft,
        datePickerError,
        setDatePickerError,
        openCreatedDatePicker,
        openFinishedDatePicker,
        closeDatePicker,
        applyDateValue,
        submitDatePickerDraft,
        applyRelativeDate,
        resetDatePicker,
    };
};
