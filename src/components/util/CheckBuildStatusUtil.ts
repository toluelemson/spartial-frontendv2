import {useEffect, useRef, useState} from 'react';
import {requestBuildStatusAC} from '../../api';
import {BuildStatusType, TODO} from '../../types/types';

const CheckBuildStatusUtil = (onSuccess: (buildId: string | number) => void)  => {
    const [isRunning, setIsRunning] = useState(false);
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

    const updateBuildStatus = async () => {
        try {
            const statusResponse = await requestBuildStatusAC() as BuildStatusType;
            await handleBuildStatus(statusResponse);
        } catch (error) {
            console.error("Error checking build status:", error);
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        }
    };

    const handleBuildStatus = async (statusRes: BuildStatusType) => {
        console.log(statusRes);
        const buildId = statusRes.lastBuildId ?? "";
        if (!statusRes.isRunning) {
            alert(`The model ${buildId} was built successfully!`);
            onSuccess(buildId);
        }
        updateBuildState(buildId, statusRes.isRunning);
        if (statusRes.isRunning) {
            intervalIdRef.current = setTimeout(updateBuildStatus, 3000);
        }
    };

    const updateBuildState = (buildId: string | number, isRunning: TODO) => {
        setIsRunning(isRunning);
    };

    useEffect(() => {
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }
        };
    }, []);

    return {updateBuildStatus, isRunning};
};

export default CheckBuildStatusUtil;
