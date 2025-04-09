import React, {createContext, useState, useContext, ReactNode} from 'react';

interface UserAccount {
    username: string;
    phoneNumber: string;
    password: string;
}

interface AuthContextType {
    token: string | null;
    userInfo: any;
    isLogin: boolean;
    login: (userAccount: UserAccount) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    token: null,
    isLogin: false,
    userInfo: null,
    login: async () => {},
    logout: () => {},
});

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [token, setToken] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [isLogin, setIsLogin] = useState(true);

    const login = (userAccount: UserAccount) => {
        // const data = await signIn(userAccount);
        // setToken(data.tokenDTO?.token);
        setUserInfo(userAccount);
        setIsLogin(true);
    };

    const logout = () => {
        setUserInfo(null);
        setIsLogin(false);
    };

    return (
        <AuthContext.Provider value={{token, isLogin, userInfo, login, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
