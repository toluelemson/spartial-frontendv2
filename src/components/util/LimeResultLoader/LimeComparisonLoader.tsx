import React, {useEffect, useState} from 'react';
import {LimeChartsDisplay} from "../../XAI/LimeTab";

interface PredictionsLoaderProps {
    state: any;
    isLeft: boolean;
    updateComparisonState: (updates: any) => void
    selectedModelId: string;
}


//TODO THIS is not used right now. It might be used to dynamically fetch Lime result based on ID
const LimeComparisonLoader: React.FC<PredictionsLoaderProps> = ({
                                                                    state, selectedModelId
                                                                }) => {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDataAndUpdateState = () => {
            if (!selectedModelId) return;

            setLoading(true);
            // Implement data fetching and state updating logic here
            // Example: const data = await fetchData(selectedModelId);
            // updateComparisonState({ ...state, newData: data });
            setLoading(false);
        };

        fetchDataAndUpdateState();
    }, [selectedModelId, state.sampleId]);

    return (
        <>
            {loading ? <div>Loading...</div> : <LimeChartsDisplay state={state} loading={loading}/>}
        </>
    );
};

export default LimeComparisonLoader;
