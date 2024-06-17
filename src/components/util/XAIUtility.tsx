import {useEffect, useState} from 'react';
import * as api from '../../api';
import {extractLabelsFromDataset} from './utility';
import {requestRunLime, requestXAIStatus, requestRunShap} from '../../api';
import fetchDataset from './fetchDataset';

type PieChartData = { type: string; value: number };

interface ProbabilityData {
    key: number;
    label: string;
    probability: string;
}

type LimeResult = {
    isRunning: boolean;
};

type StatusResult = {
    isRunning: boolean;
};

export const useProbsData = (modelId: string, sampleId: number | null) => {
    const [dataTableProbs, setDataTableProbs] = useState<ProbabilityData[]>([]);
    const [pieData, setPieData] = useState<PieChartData[]>([]);
    const [error, setError] = useState<Error | null>(null);
    const [normalDataset, setNormalDataset] = useState<any>(null);

    // const { originalDataset, refetch: refetchOriginalDataset } = useFetchModelDataset(false, modelId, "train");

    const fetchPoisonedDataset = async () => {
        // const {poisonedDataset} = await fetchDataset(true, formData.modelId, formData.attackType);
        const {originalDataset} = await fetchDataset(false, modelId, "");
        // setPoisonedDataset(poisonedDataset);
        setNormalDataset(originalDataset);

    };


    useEffect(() => {
        fetchPoisonedDataset();
    }, []);


    useEffect(() => {
        const fetchData = async () => {
            try {

                const predictedProbsResponse = await api.requestPredictedProbsModel(modelId);
                const yProbs = parsePredictedProbs(predictedProbsResponse, sampleId);

                const labelsFromOriginalDataset = normalDataset ? await extractLabelsFromDataset({
                    modelId,
                    datasets: normalDataset.resultData,
                }) : [];

                const labels = labelsFromOriginalDataset;
                console.log('labels', labels, modelId, normalDataset.resultData);

                let newDataTableProbs: ProbabilityData[] = [];
                let newPieData: PieChartData[] = [];

                if (modelId.startsWith('ac-')) {
                    newDataTableProbs = await formatProbabilityData(yProbs, labels, sampleId);
                    console.log(yProbs, labels, sampleId)
                    newPieData = formatPieChartData(yProbs, sampleId, labels);
                } else {
                    newDataTableProbs = await formatProbabilityData(yProbs, labels, sampleId);
                    newPieData = formatPieChartData(yProbs, sampleId, labels);
                }

                setDataTableProbs(newDataTableProbs);
                setPieData(newPieData);
            } catch (error) {
                setError(error as Error);
            }
        };

        fetchData();

        // Cleanup function
        return () => {
            // Perform any cleanup if needed
        };
    }, [modelId, sampleId]);

    return {dataTableProbs, pieData, error};
};

const parsePredictedProbs = (probs: string, sampleId: number | null): number[][] => {
    return probs.split('\n').slice(1).map(line =>
        line.split(',').map(val => parseFloat(val))
    );
};

const formatProbabilityData = async (yProbs: number[][], labels: string[], sampleId: number | null): Promise<ProbabilityData[]> => {
    return labels.map((label, index) => ({
        key: index,
        label,
        probability: sampleId != null && yProbs[sampleId] ? yProbs[sampleId][index].toFixed(6) : '-'
    }));
};

const formatPieChartData = (yProbs: number[][], sampleId: number | null, labels: string[]): PieChartData[] => {
    return sampleId ? yProbs[sampleId].map((prob, i) => ({
        type: labels[i],
        value: parseFloat((prob * 100).toFixed(2))
    })) : [];
};

export const monitorStatus = async (method: string, config: any) => {
    let intervalId: NodeJS.Timer | null = null;

    try {
        const res: LimeResult | StatusResult = method === 'LIME'
            ? await requestRunLime(config.modelId, config.sampleId, config.featuresToDisplay)
            : await requestRunShap('ac-xgboost', config.backgroundSamples, config.explainedSamples, config.maxDisplay);

        if (res && 'isRunning' in res && res.isRunning) {
            intervalId = setInterval(async () => {
                const status: StatusResult = await requestXAIStatus();
                console.log(status);
                if (!status.isRunning && intervalId) {
                    clearInterval(intervalId);
                    console.log(res);
                    intervalId = null;
                    console.log('Task completed, interval cleared.');
                }
            }, 1000);
        }
        console.log(res);
    } catch (error) {
        console.error('Error during request:', error);
        if (intervalId) clearInterval(intervalId);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
};
