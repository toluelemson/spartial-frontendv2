import {useEffect, useRef, useState} from 'react';
import {requestWithSecureSingleAttackStatus} from '../../api';
import {TODO} from '../../types/types';


interface AttackStatusResponse {
    id: string;
    status: 'SUCCESS' | 'FAILURE' | 'PENDING';
    error?: string;
}

const CheckAttackStatusUtil = (id: string) => {
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
    
    const updateAttackStatus = async () => {
        try {
            console.log(id)
            const statusResponse = await requestWithSecureSingleAttackStatus(id) as TODO;
            console.log(statusResponse);
            await handleAttackStatus(statusResponse);
        } catch (error) {
            console.error("Error checking build status:", error);
            clearPendingInterval();
        }
    };
    const handleAttackStatus = async (statusRes: AttackStatusResponse) => {
        console.log(statusRes);
        const buildId = statusRes.id ?? "";

        if (statusRes.status === 'SUCCESS') {
            alert(`The model ${buildId} was attacked successfully!`);
            clearPendingInterval();
            // onSuccess(buildId);
        } else if (statusRes.status === 'FAILURE') {
            alert(statusRes.error ?? 'An unknown error occurred.');
            clearPendingInterval();
        } else if (statusRes.status === 'PENDING') {
            intervalIdRef.current = setTimeout(updateAttackStatus, 3000);
        }
       
    };

    const clearPendingInterval = () => {
        if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            intervalIdRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            clearPendingInterval();
        };
    }, []);

    return {updateAttackStatus};
};

export default CheckAttackStatusUtil;
