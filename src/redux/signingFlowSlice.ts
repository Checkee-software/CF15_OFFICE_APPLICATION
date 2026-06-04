import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type TSigningSessionStatus =
    | 'IDLE'
    | 'WAITING_EXTERNAL'
    | 'POLLING'
    | 'SUCCESS'
    | 'FAILED';

export type TSigningSession = {
    id: string;
    documentId: string;
    documentTitle: string;
    selectedFileName: string;
    selectedFilePath: string;
    comment: string;
    status: TSigningSessionStatus;
    pollCount: number;
    errorMessage: string;
    createdAt: string;
    updatedAt: string;
};

type TStartSigningPayload = {
    documentId: string;
    documentTitle?: string;
    selectedFileName: string;
    selectedFilePath?: string;
    comment?: string;
};

type SigningFlowState = {
    currentSession: TSigningSession | null;
};

const initialState: SigningFlowState = {
    currentSession: null,
};

const now = () => new Date().toISOString();

const signingFlowSlice = createSlice({
    name: 'signingFlow',
    initialState,
    reducers: {
        startSigningSession: (
            state,
            action: PayloadAction<TStartSigningPayload>,
        ) => {
            state.currentSession = {
                id: `${Date.now()}-${action.payload.documentId}`,
                documentId: action.payload.documentId,
                documentTitle: action.payload.documentTitle || '',
                selectedFileName: action.payload.selectedFileName,
                selectedFilePath: action.payload.selectedFilePath || '',
                comment: action.payload.comment || '',
                status: 'WAITING_EXTERNAL',
                pollCount: 0,
                errorMessage: '',
                createdAt: now(),
                updatedAt: now(),
            };
        },
        markSigningAsPolling: state => {
            if (!state.currentSession) {
                return;
            }
            state.currentSession.status = 'POLLING';
            state.currentSession.updatedAt = now();
        },
        incrementSigningPollCount: state => {
            if (!state.currentSession) {
                return;
            }
            state.currentSession.pollCount += 1;
            state.currentSession.updatedAt = now();
        },
        completeSigningSuccess: state => {
            if (!state.currentSession) {
                return;
            }
            state.currentSession.status = 'SUCCESS';
            state.currentSession.errorMessage = '';
            state.currentSession.updatedAt = now();
        },
        completeSigningFailed: (
            state,
            action: PayloadAction<string | undefined>,
        ) => {
            if (!state.currentSession) {
                return;
            }
            state.currentSession.status = 'FAILED';
            state.currentSession.errorMessage =
                action.payload || 'Ký thật thất bại';
            state.currentSession.updatedAt = now();
        },
        clearSigningSession: state => {
            state.currentSession = null;
        },
    },
});

export const {
    startSigningSession,
    markSigningAsPolling,
    incrementSigningPollCount,
    completeSigningSuccess,
    completeSigningFailed,
    clearSigningSession,
} = signingFlowSlice.actions;

export default signingFlowSlice.reducer;
