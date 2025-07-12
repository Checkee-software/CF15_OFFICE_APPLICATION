import AsyncStorage from '@react-native-async-storage/async-storage';

interface garden {
    gardenId: string;
    gardenNickname: string;
}

interface userGardenNickname {
    userId: string;
    garden: garden[];
}

interface IClientStorage {
    token?: string;
    userGardenNickname: userGardenNickname[];
}

const STORAGE_KEY = 'checkee';

export default class LocalStorageHelper {
    private static _instance?: LocalStorageHelper;
    public static get instance() {
        if (!this._instance) this._instance = new LocalStorageHelper();
        return this._instance;
    }

    private _isLoad: boolean = true;
    public get isLoad() {
        return this._isLoad;
    }

    // ☣️ Khai báo field cần lưu ở đây
    private data: IClientStorage = {
        token: '',
        userGardenNickname: [],
    };

    protected constructor() {
        this.load();
    }

    private save = async () => {
        try {
            const data = JSON.stringify(this.data);
            console.log('token-data: ', data);
            await AsyncStorage.setItem(STORAGE_KEY, data);
            console.log('💾 LocalStorageHelper saved');
        } catch (e) {
            console.log(e);
        }
    };

    public awaitLoaded = async (): Promise<boolean> => {
        const MAX_COUNT: number = 100;
        let count = 0;

        return new Promise((resolve, reject) => {
            const timerId = setInterval(() => {
                if (!this._isLoad) {
                    clearInterval(timerId);
                    return resolve(true);
                }

                if (count >= MAX_COUNT) {
                    clearInterval(timerId);
                    return reject(false);
                }

                count++;
            }, 100);
        });
    };

    private load = async () => {
        console.log('💾 LocalStorageHelper loading');
        this._isLoad = true;
        const strData = await AsyncStorage.getItem(STORAGE_KEY);

        if (typeof strData !== 'string') {
            this._isLoad = false;
            this.save();
            return;
        }

        try {
            const _data = JSON.parse(strData);

            this.data = _data;
            this._isLoad = false;
            console.log('💾 LocalStorageHelper loaded');
            return;
        } catch {
            this._isLoad = false;
            this.save();
            return;
        } finally {
            this._isLoad = false;
        }
    };

    // token ========================

    public get token() {
        return this.data.token;
    }

    public set token(v: string | undefined) {
        this.data.token = v;
        this.save();
    }

    public async clearToken() {
        this.data.token = '';
        await this.save();
    }

    public get userGardenNickname() {
        return this.data.userGardenNickname;
    }

    public setStorageUserGardens(
        userId: string,
        gardenId: string,
        newGardenName: string,
    ) {
        // Tìm user có userId tương ứng

        const user = this.data.userGardenNickname.find(
            u => u.userId === userId,
        );

        if (user) {
            // Nếu có user, tìm garden theo gardenId
            const garden = user.garden.find(g => g.gardenId === gardenId);

            if (garden) {
                // Nếu có garden → cập nhật tên
                garden.gardenNickname = newGardenName;
            } else {
                // Nếu không có garden → thêm mới
                user.garden.push({
                    gardenId,
                    gardenNickname: newGardenName,
                });
            }
        } else {
            // Nếu không có user → thêm mới
            this.data.userGardenNickname.push({
                userId,
                garden: [
                    {
                        gardenId,
                        gardenNickname: newGardenName,
                    },
                ],
            });
        }

        this.save();
    }
}
