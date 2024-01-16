import React, {useEffect} from 'react';
import {PieChartData, ProbabilityData, ILIMEParametersState} from '../../types/LimeTypes';
import {processProbsData} from "./LimeUtility";

interface DataUpdaterProps {
    state: ILIMEParametersState;
    updateState: (state: ILIMEParametersState) => void;
    triggerUpdate: boolean;
    selectedModelId?: string
}

const LimeDataUpdater: React.FC<DataUpdaterProps> = ({state, selectedModelId, updateState, triggerUpdate}) => {

    const modelId = state.modelId
    const updateData = async () => {
        let storedPieData: PieChartData[] | null = null;
        let storedDataTableProbs: ProbabilityData[] | null = null;

        const storedPieDataString = localStorage.getItem('pieData' + modelId);
        const storedDataTableProbsString = localStorage.getItem('dataTableProbs' + modelId);

        if (storedPieDataString) {
            const pieDataObject: { [modelId: string]: PieChartData[] } = JSON.parse(storedPieDataString);
            if (modelId) storedPieData = pieDataObject[modelId];
        }

        if (storedDataTableProbsString) {
            const dataTableProbsObject: {
                [modelId: string]: ProbabilityData[]
            } = JSON.parse(storedDataTableProbsString);
            if (modelId) storedDataTableProbs = dataTableProbsObject[modelId];
        }

        if (storedPieData && storedDataTableProbs) {

            updateState({...state, pieData: storedPieData, dataTableProbs: storedDataTableProbs});
            console.log(storedPieData)
        } else {

            if (modelId) {
                console.log(modelId)
                const {dataTableProbs, pieData} = await processProbsData(modelId, state.sampleId);

                updateState({...state, pieData: pieData, dataTableProbs: dataTableProbs});
            }
        }
    };

    useEffect(() => {
        const updateDataFunction = async () => {

            if (triggerUpdate) {
                await updateData();
            }
        }

        updateDataFunction()
        console.log(state)
    }, [triggerUpdate, selectedModelId, modelId, state.sampleId]);
//
    return null;
};

export default LimeDataUpdater;
