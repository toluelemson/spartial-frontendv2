import React, {useEffect, useState} from 'react';
import {ChartsDisplay} from "../../XAI/LimeTab";

interface PredictionsLoaderProps {
    state: any;
    isLeft: boolean;
    updateComparisonState: (updates: any) => void;
    selectedModelId: string
}

const LimeComparisonLoader: React.FC<PredictionsLoaderProps> = ({
                                                                state,
                                                                selectedModelId,
                                                                isLeft,
                                                                updateComparisonState
                                                            }) => {

    const [triggerDataUpdate, setTriggerDataUpdate] = useState(false);
    const [loading, setLoading] = useState(false);
    const modelId = selectedModelId


    useEffect(() => {
        const updateDataFunction = async () => {
            if (!modelId) return;
        }

        updateDataFunction()
    }, [triggerDataUpdate, selectedModelId, modelId, state.sampleId]);


    return <>

        {loading ? 'loading' : <ChartsDisplay state={state}/>}
    </>
};

export default LimeComparisonLoader;
