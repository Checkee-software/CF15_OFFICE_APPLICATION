import {create} from 'zustand';
import UserResponse from '@/shared-types/Response/UserResponse';

interface AuthState {
    user: UserResponse.IUser | null;
    getUser: (userData: UserResponse.IUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
    user: null,

    getUser: userData => {
        // localStorageClient.userInfo = userData;
        set({user: userData});
    },

    logout: () => {
        set({user: null});
    },
}));
