import * as api from "../../api";
import {extractLabelsFromDataset} from "./utility";
import {requestRunLime, requestXAIStatus, requestRunShap} from "../../api";

type PieChartData = { type: string; value: number };

interface ProbabilityData {
    key: number;
    label: string;
    probability: string;
}

type LimeResult = {
    isRunning: boolean;
}

type StatusResult = {
    isRunning: boolean;
};

// export const runLimeAndMonitorStatus = async (modelId: string, sampleId: number | string[], featuresToDisplay: number) => {
//     let intervalId: NodeJS.Timer | null = null;
//
//     try {
//         const res: LimeResult = await requestRunLime(modelId, sampleId, featuresToDisplay);
//
//         if (res && res.isRunning) {
//             intervalId = setInterval(async () => {
//                 const status: StatusResult = await requestXAIStatus();
//                 console.log(status);
//                 if (!status.isRunning && intervalId) {
//                     clearInterval(intervalId);
//                     console.log(res)
//                     intervalId = null;
//                     console.log('Task completed, interval cleared.');
//                 }
//             }, 1000);
//         }
//         console.log(res);
//     } catch (error) {
//         console.error('Error during requestRunLime:', error);
//         if (intervalId) clearInterval(intervalId);
//     }
//
//     // Ensure the interval is cleared when the task is complete or an error occurs
//     return () => {
//         if (intervalId) clearInterval(intervalId);
//     };
// };



export const monitorStatus = async (method: string, config: any) => {
    let intervalId: NodeJS.Timer | null = null;

    try {
        // const res: any = await requestRunShap("ac-xgboost", backgroundSamples, explainedSamples, newState.maxDisplay);

        const res: LimeResult = method = 'LIME' ?  await requestRunLime(config.modelId, config.sampleId, config.featuresToDisplay) : await requestRunShap("ac-xgboost", config.backgroundSamples, config.explainedSamples, config.maxDisplay)

        if (res && res.isRunning) {
            intervalId = setInterval(async () => {
                const status: StatusResult = await requestXAIStatus();
                console.log(status);
                if (!status.isRunning && intervalId) {
                    clearInterval(intervalId);
                    console.log(res)
                    intervalId = null;
                    console.log('Task completed, interval cleared.');
                }
            }, 1000);
        }
        console.log(res);
    } catch (error) {
        console.error('Error during requestRunLime:', error);
        if (intervalId) clearInterval(intervalId);
    }

    // Ensure the interval is cleared when the task is complete or an error occurs
    return () => {
        if (intervalId) clearInterval(intervalId);
    };
};

export const formatProbabilityData = async (yProbs: number[][], labelsPromise: Promise<string[]>, sampleId: number | null): Promise<ProbabilityData[]> => {
    const labels = await labelsPromise;

    return labels.map((label, index) => ({
        key: index,
        label,
        probability: sampleId != null && yProbs[sampleId] ? yProbs[sampleId][index].toFixed(6) : '-'
    }));
};

export const formatPieChartData = (yProbs: number[][], sampleId: number | null, labels: string[]): PieChartData[] => {
    return sampleId ? yProbs[sampleId].map((prob, i) => ({
        type: labels[i],
        value: parseFloat((prob * 100).toFixed(2))
    })) : [];
};

export const parsePredictedProbs = (probs: string, sampleId: number | null): number[][] => {
    return probs.split('\n').slice(1).map(line =>
        line.split(',').map(val => parseFloat(val))
    );
};

export const processProbsData = async (modelId: string, sampleId: number | null) => {
    const predictedProbsResponse = await api.requestPredictedProbsModel(modelId);
    const yProbs = parsePredictedProbs(predictedProbsResponse, sampleId);
    let dataTableProbs: ProbabilityData[] = [];
    let pieData: PieChartData[] = [];

    if (modelId.startsWith('ac-')) {
        dataTableProbs = await formatProbabilityData(yProbs, extractLabelsFromDataset(modelId), sampleId);
        pieData = formatPieChartData(yProbs, sampleId, await extractLabelsFromDataset(modelId));
    } else {
        dataTableProbs = await formatProbabilityData(yProbs, extractLabelsFromDataset(modelId), sampleId);
        pieData = formatPieChartData(yProbs, sampleId, await extractLabelsFromDataset(modelId));
    }

    return {dataTableProbs, pieData};
};
