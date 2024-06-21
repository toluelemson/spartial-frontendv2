import React, {useEffect} from 'react';

import {
    getTablePerformanceStats,
    getConfigConfusionMatrix,
    updateConfusionMatrix,
    loadBuildConfig
} from "../utility";
import {requestBuildConfigModel, requestPredictionsModel} from "../../../api";


interface PredictionsLoaderProps {
    modelId: string | null;
    isLeft: boolean;
    updateComparisonState: (updates: any) => void;
    cutoffProb: number;
}

const parsePredictions = (predictionsValues: string): Array<{ prediction: number, trueLabel: number }> => {
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

const PredictionsLoader: React.FC<PredictionsLoaderProps> = ({modelId, isLeft, updateComparisonState, cutoffProb}) => {
    useEffect(() => {
        const loadPredictions = async () => {
            if (!modelId) return;

            try {
                const buildConfigResult = await loadBuildConfig(modelId);
                console.log(buildConfigResult);
                const dataBuildConfig = Array.isArray(buildConfigResult) ? buildConfigResult : [];
                const predictions = await loadPredictionsValues(modelId);
                const {
                    confusionMatrix,
                    stats,
                    classificationData
                } = await updateConfusionMatrix(modelId, predictions, cutoffProb);

                const dataStats = await getTablePerformanceStats(modelId, stats, confusionMatrix);
                const configCM = confusionMatrix ? await getConfigConfusionMatrix(modelId, confusionMatrix) : {};
                updateComparisonState({
                    predictions,
                    stats,
                    confusionMatrix,
                    classificationData,
                    ...(isLeft ? {
                        dataBuildConfigLeft: dataBuildConfig,
                        dataStatsLeft: dataStats,
                        cmConfigLeft: configCM,
                    } : {
                        dataBuildConfigRight: dataBuildConfig,
                        dataStatsRight: dataStats,
                        cmConfigRight: configCM,
                    })
                });
            } catch (error) {
                console.error("Error loading predictions:", error);
            }
        };

        loadPredictions();
    }, [cutoffProb, isLeft, modelId]);

    return null;
};

export default PredictionsLoader;
