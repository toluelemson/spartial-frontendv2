import { useEffect, useRef, useState } from 'react';
import { requestWithSecureSingleAttackStatus } from '../../api';

interface AttackStatusResponse {
    id: string;
    status: 'SUCCESS' | 'FAILURE' | 'PENDING';
    error?: string;
}

const CheckAttackStatusUtil = (id: string) => {
    const [status, setStatus] = useState<string>('');
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

    const updateAttackStatus = async () => {
        try {
            const statusResponse = await requestWithSecureSingleAttackStatus(id) as unknown as AttackStatusResponse;
            await handleAttackStatus(statusResponse);
        } catch (error) {
            console.error('Error checking attack status:', error);
            clearPendingTimeout();
        }
    };

    const handleAttackStatus = async (statusRes: AttackStatusResponse) => {
        if (statusRes.status === 'SUCCESS' || statusRes.status === 'FAILURE') {
            setStatus(statusRes.status);
            clearPendingTimeout();
        } else if (statusRes.status === 'PENDING') {
            intervalIdRef.current = setTimeout(updateAttackStatus, 3000);
        }
    };

    const clearPendingTimeout = () => {
        if (intervalIdRef.current) {
            clearTimeout(intervalIdRef.current);
            intervalIdRef.current = null;
        }
    };

    useEffect(() => {
        return () => {
            clearPendingTimeout();
        };
    }, []);

    return { updateAttackStatus, status };
};

export default CheckAttackStatusUtil;
