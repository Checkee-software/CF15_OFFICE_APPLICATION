import { create } from "zustand";
import Snackbar from "react-native-snackbar";
import axiosClient from "@/utils/axiosClient";
import {
    IRequestStartMachine,
    IRequestStopMachine,
} from "@/shared-types/form-data/ScheduleFormData/ScheduleFormData";
import ENV from "@/config/ENV";

interface IActiveMachineItem {
    _id: string;
    name: string;
    createdBy: string;
    title: string;
    totalTime: number;
}

interface IActiveMachineResponse {
    data: IActiveMachineItem[];
}

interface MachineStore {
    isStarting: boolean;
    startMachine: (data: IRequestStartMachine) => Promise<void>;
    stopMachine: (data: IRequestStopMachine) => Promise<void>;
    getActiveMachine: (scheduleId: string) => Promise<IActiveMachineItem[]>;
}

export const useMachineStore = create<MachineStore>((set) => ({
    isStarting: false,

    startMachine: async ({ scheduleId, machineId, startAt }) => {
        set({ isStarting: true });

        try {
            const url = `${ENV.BACKEND_URL}/resources/schedules/machine-start/${scheduleId}`;
            const payload = {
                machineId,
                startAt: startAt.toISOString(),
            };

            await axiosClient.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            Snackbar.show({
                text: "Bắt đầu ca máy thành công!",
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            console.error(
                " Error starting machine:",
                error.response?.data || error.message,
            );
            Snackbar.show({
                text: "Bắt đầu ca máy thất bại!",
                duration: Snackbar.LENGTH_LONG,
            });
        } finally {
            set({ isStarting: false });
        }
    },

    stopMachine: async ({ scheduleId, machineId, endAt }) => {
        set({ isStarting: true });

        try {
            const url = `${ENV.BACKEND_URL}/resources/schedules/machine-end/${scheduleId}`;
            const payload = {
                machineId,
                endAt: endAt.toISOString(),
            };

            await axiosClient.post(url, payload, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            Snackbar.show({
                text: "Kết thúc ca máy thành công!",
                duration: Snackbar.LENGTH_SHORT,
            });
        } catch (error: any) {
            console.error(
                "Error stopping machine:",
                error.response?.data || error.message,
            );
            Snackbar.show({
                text: "Kết thúc ca máy thất bại!",
                duration: Snackbar.LENGTH_LONG,
            });
        } finally {
            set({ isStarting: false });
        }
    },

    getActiveMachine: async (scheduleId: string) => {
        try {
            const url = `${ENV.BACKEND_URL}/resources/schedules/machine-active/${scheduleId}`;

            const response = await axiosClient.get<IActiveMachineResponse>(
                url,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            return response.data.data;
        } catch (error: any) {
            console.error(
                "Error getting active machine:",
                error.response?.data || error.message,
            );
            Snackbar.show({
                text: "Lấy thông tin ca máy thất bại!",
                duration: Snackbar.LENGTH_LONG,
            });
            return [];
        }
    },
}));
