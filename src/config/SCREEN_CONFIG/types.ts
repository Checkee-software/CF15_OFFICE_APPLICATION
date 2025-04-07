export interface ScreenInformation {
    key: string;
    icon?: string;
    headerTitle?: string;
    buttonLabel?: string;
    keyContinue?:string,
    isOpenQRCamera: boolean,
    contentDescription?: string
}

export type ScreenRegistry = {
    name: string,
    component: any,
    options: any
};
