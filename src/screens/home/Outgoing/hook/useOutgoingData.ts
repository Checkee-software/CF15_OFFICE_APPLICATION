import { useState, useCallback, useRef, useEffect } from 'react';
import axiosClient from '@/utils/axiosClient';
import ENV from '@/config/ENV';
import { ESignDepartment } from '../components/constants';
import { IDepartmentSelection } from '@/shared-types/Response/DepartmentResponse/DepartmentResponse';

export type TSignerUser = { _id: string; fullName: string };

export const useOutgoingData = (
    userDepartmentId: string,
    signedDepartmentValue: ESignDepartment | '',
    selectedSignerUserId: string,
    selectedApproverUserId: string,
    setSelectedSignerUserId: (id: string) => void,
    setSelectedSignerUserName: (name: string) => void,
    setSelectedApproverUserId: (id: string) => void,
    setSelectedApproverUserName: (name: string) => void
) => {
    const [departmentList, setDepartmentList] = useState<IDepartmentSelection[]>([]);
    const [isFetchingDepartments, setIsFetchingDepartments] = useState(false);

    const [signerUserList, setSignerUserList] = useState<TSignerUser[]>([]);
    const [approverUserList, setApproverUserList] = useState<TSignerUser[]>([]);
    const [isFetchingSigners, setIsFetchingSigners] = useState(false);

    const lastFetchedParamsRef = useRef({ deptId: '', dept: '' });

    const fetchDepartments = useCallback(async () => {
        setIsFetchingDepartments(true);
        try {
            const res = await axiosClient.get(`${ENV.BACKEND_URL}/resources/departments/selection`);
            const list: IDepartmentSelection[] = (res.data?.data || []).map((d: any) => ({
                _id: d._id || '',
                name: d.name || '',
                code: d.code || '',
            }));
            setDepartmentList(list);
            return list;
        } catch (e) {
            console.log('[useOutgoingData] fetchDepartments error', e);
            setDepartmentList([]);
            return [];
        } finally {
            setIsFetchingDepartments(false);
        }
    }, []);

    const fetchSignerUsers = useCallback(async (
        deptId: string,
        dept: ESignDepartment,
        currentSignerId?: string,
        currentApproverId?: string
    ) => {
        if (!deptId) { return []; }
        setIsFetchingSigners(true);
        try {
            const res = await axiosClient.get(
                `${ENV.BACKEND_URL}/resources/users/selection-user-by-department`,
                { params: { departmentId: deptId, signedDepartment: dept } },
            );
            const payload = res.data?.data?.data;

            lastFetchedParamsRef.current = { deptId, dept };

            if (dept === ESignDepartment.MANAGEMENT) {
                const initialSigners: TSignerUser[] = (payload?.initialSigners || []).map((u: any) => ({
                    _id: u._id || '',
                    fullName: u.fullName || u.username || '',
                }));
                const approvers: TSignerUser[] = (payload?.approvers || []).map((u: any) => ({
                    _id: u._id || '',
                    fullName: u.fullName || u.username || '',
                }));

                setSignerUserList(initialSigners);
                setApproverUserList(approvers);

                if (currentSignerId) {
                    const found = initialSigners.find(u => u._id === currentSignerId);
                    if (found) {
                        setSelectedSignerUserName(found.fullName);
                    } else {
                        setSelectedSignerUserId('');
                        setSelectedSignerUserName('');
                    }
                }
                if (currentApproverId) {
                    const found = approvers.find(u => u._id === currentApproverId);
                    if (found) {
                        setSelectedApproverUserName(found.fullName);
                    } else {
                        setSelectedApproverUserId('');
                        setSelectedApproverUserName('');
                    }
                }
                return { initialSigners, approvers };
            } else {
                const approvers: TSignerUser[] = (payload?.approvers || []).map((u: any) => ({
                    _id: u._id || '',
                    fullName: u.fullName || u.username || '',
                }));

                setSignerUserList(approvers);
                setApproverUserList([]);

                if (currentSignerId) {
                    const found = approvers.find(u => u._id === currentSignerId);
                    if (found) {
                        setSelectedSignerUserName(found.fullName);
                    } else {
                        setSelectedSignerUserId('');
                        setSelectedSignerUserName('');
                    }
                }
                setSelectedApproverUserId('');
                setSelectedApproverUserName('');
                return { approvers };
            }
        } catch (e) {
            console.log('[useOutgoingData] fetchSignerUsers error', e);
            setSignerUserList([]);
            setApproverUserList([]);
            return [];
        } finally {
            setIsFetchingSigners(false);
        }
    }, [setSelectedSignerUserId, setSelectedSignerUserName, setSelectedApproverUserId, setSelectedApproverUserName]);

    useEffect(() => {
        if (!signedDepartmentValue || !userDepartmentId) { return; }

        if (
            lastFetchedParamsRef.current.deptId !== userDepartmentId ||
            lastFetchedParamsRef.current.dept !== signedDepartmentValue
        ) {
            fetchSignerUsers(
                userDepartmentId,
                signedDepartmentValue as ESignDepartment,
                selectedSignerUserId,
                selectedApproverUserId
            );
        }
    }, [
        signedDepartmentValue,
        userDepartmentId,
        fetchSignerUsers,
        selectedSignerUserId,
        selectedApproverUserId,
    ]);

    const resetData = useCallback(() => {
        setSignerUserList([]);
        setApproverUserList([]);
    }, []);

    return {
        departmentList,
        isFetchingDepartments,
        signerUserList,
        approverUserList,
        isFetchingSigners,
        fetchDepartments,
        fetchSignerUsers,
        setSignerUserList,
        setApproverUserList,
        resetData,
    };
};
