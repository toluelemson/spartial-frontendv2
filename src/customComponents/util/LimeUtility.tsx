import * as api from "../../api";
import {AC_OUTPUT_LABELS, AD_OUTPUT_LABELS} from "../../constants";

type ProbabilityData = { key: number; label: string; probability: string };
type PieChartData = { type: string; value: number };


 export const runLimeAndMonitorStatus = async ({modelId, sampleId, featuresToDisplay} : any) => {
            let intervalId: NodeJS.Timer | null = null;
            try {
                //TODO Replace 'any' with actual type for modelId, sampleId, featuresToDisplay, and res
                const res: any = await api.requestRunLime(modelId, sampleId, featuresToDisplay);
                console.log(res)

                if (res && res.isRunning) {
                    intervalId = setInterval(() => {
                        api.requestXAIStatus();
                    }, 1000);
                }
            } catch (error: any) {
                console.error('Error during requestRunLime:', error);

                if (intervalId) clearInterval(intervalId);
            }

            if (intervalId) clearInterval(intervalId);
        };

      export const formatProbabilityData = (yProbs: number[][], labels: string[], sampleId: number | null): ProbabilityData[] => {
            return labels.map((label, index) => ({
                key: index,
                label,
                probability: sampleId && yProbs[sampleId] ? yProbs[sampleId][index].toFixed(6) : '-'
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
                dataTableProbs = formatProbabilityData(yProbs, ['Web', 'Interactive', 'Video'], sampleId);
                pieData = formatPieChartData(yProbs, sampleId, AC_OUTPUT_LABELS);
            } else {
                dataTableProbs = formatProbabilityData(yProbs, ['Normal traffic', 'Malware traffic'], sampleId);
                pieData = formatPieChartData(yProbs, sampleId, AD_OUTPUT_LABELS);
            }

            return {dataTableProbs, pieData};
        };
