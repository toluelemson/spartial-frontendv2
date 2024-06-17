import {
    getTablePerformanceStats,
    getConfigConfusionMatrix,
    transformConfigStrToTableData,
    updateConfusionMatrix
} from "../utility";
import { requestBuildConfigModel, requestPredictionsModel } from "../../../api";

interface Prediction {
    prediction: number;
    trueLabel: number;
}

interface UpdateComparisonStateProps {
    predictions: Prediction[];
    stats: any;
    confusionMatrix: any;
    classificationData: any;
    selectedModelLeft?: string;
    dataBuildConfigLeft?: any[];
    dataStatsLeft?: any;
    cmConfigLeft?: any;
    selectedModelRight?: string;
    dataBuildConfigRight?: any[];
    dataStatsRight?: any;
    cmConfigRight?: any;
}

// const loadBuildConfig = async (modelId: string) => {
//     const buildConfig = await requestBuildConfigModel(modelId);
//     return transformConfigStrToTableData(buildConfig);
// };

const parsePredictions = (predictionsValues: string): Prediction[] => {
    return predictionsValues.split('\n').map((line) => {
        const [prediction, trueLabel] = line.split(',');
        return {
            prediction: parseFloat(prediction),
            trueLabel: parseInt(trueLabel, 10),
        };
    });
};

const loadPredictionsValues = async (modelId: string) => {
    const predictionsValues = await requestPredictionsModel(modelId);
    console.log(predictionsValues, "predictionsValues");
    if (!predictionsValues) {
        throw new Error("No prediction values received.");
    }
    return parsePredictions(predictionsValues);
};

export const loadPredictionsData = async (
    modelId: string | null,
    isLeft: boolean,
    cutoffProb: number
): Promise<Partial<UpdateComparisonStateProps> | null> => {
    if (!modelId) return null;

    try {
        // const buildConfigResult = await loadBuildConfig(modelId);
        // const dataBuildConfig = Array.isArray(buildConfigResult) ? buildConfigResult : [];

        const predictions = await loadPredictionsValues(modelId);
        console.log('loadPredictionsData:', modelId, predictions);

        const { confusionMatrix, stats, classificationData } = await updateConfusionMatrix(modelId, predictions, cutoffProb);

        console.log('Stats:', stats);

        const dataStats = await getTablePerformanceStats(modelId, stats, confusionMatrix);
        const configCM = confusionMatrix ? await getConfigConfusionMatrix(modelId, confusionMatrix) : {};

        console.log('loadPredictionsData:', dataStats, configCM);

        return {
            predictions,
            stats,
            confusionMatrix,
            classificationData,
            ...(isLeft ? {
                selectedModelLeft: modelId,
                // dataBuildConfigLeft: dataBuildConfig,
                dataStatsLeft: dataStats,
                cmConfigLeft: configCM,
            } : {
                selectedModelRight: modelId,
                // dataBuildConfigRight: dataBuildConfig,
                dataStatsRight: dataStats,
                cmConfigRight: configCM,
            })
        };
    } catch (error) {
        console.error("Error loading predictions:", error);
        return null;
    }
};