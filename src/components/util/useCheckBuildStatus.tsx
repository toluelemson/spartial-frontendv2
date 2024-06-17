import {requestBuildStatusAC} from "../../api";
import {BuildStatusType} from "../../types/types";
import {useSpatialContext} from "../../context/context";


const useCheckBuildStatus = (): [{ setBuildStatusStatex: (value: (((prevState: (BuildStatusType | null)) => (BuildStatusType | null)) | BuildStatusType | null)) => void; updateBuildStatus: () => () => void; buildStatusStatex: BuildStatusType | null }] => {
    const { buildStatusState, setBuildStatusState } = useSpatialContext();

    const updateBuildStatus = () => {
        let intervalId: NodeJS.Timeout;
        intervalId = setInterval(async () => {
            try {
                const statusResponse = await requestBuildStatusAC();
                if (!statusResponse.isRunning) {
                    clearInterval(intervalId);
                    setBuildStatusState(statusResponse);
                    const builtModelId = statusResponse.lastBuildAt ?? "";
                    alert(`The model ${builtModelId} was built successfully!`);
                }
            } catch (error) {
                clearInterval(intervalId);
                console.error("Error checking build status:", error);
            }
        }, 3000);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    };

    return [{ "buildStatusStatex": buildStatusState, "setBuildStatusStatex": setBuildStatusState, "updateBuildStatus": updateBuildStatus }];
};

export default useCheckBuildStatus;