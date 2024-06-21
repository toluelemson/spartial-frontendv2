import { requestBuildConfigModel } from "../../api";
import {AC_OUTPUT_LABELS, AD_OUTPUT_LABELS, AD_OUTPUT_LABELS_XAI, HEADER_ACCURACY_STATS} from "../../constants";
import fetchDataset from "./fetchDataset";

interface PerformanceStats {
    key: string;
    metric: string;

    [classMetric: string]: number | string;
}

export const ConvertTimeStamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toUTCString();
};

export const isACApp = (app: string) => app === 'ac';
export const isACModel = (modelId: string) => modelId && modelId.startsWith('ac-');
export const getLabelsListApp = (app: string) => {
    return isACApp(app) ? AC_OUTPUT_LABELS : AD_OUTPUT_LABELS;
}
export const getLabelsListAppXAI = (app: string) => {
    return isACApp(app) ? AC_OUTPUT_LABELS : AD_OUTPUT_LABELS_XAI;
}
export const getLabelsListXAI = (modelId: string) => {
    return isACModel(modelId) ? AC_OUTPUT_LABELS : AD_OUTPUT_LABELS_XAI;
}

export const removeCsvPath = (buildConfig: { [x: string]: any; datasets?: any; }) => {
    const updatedDatasets = buildConfig.datasets?.map((dataset: { csvPath: string; }) => {
        const parts = dataset.csvPath.split('/');
        const newCsvPath = parts.slice(parts.indexOf('outputs') + 1).join('/');
        return {
            ...dataset,
            csvPath: newCsvPath,
        };
    });

    const {total_samples, ...newBuildConfig} = buildConfig;
    return {
        ...newBuildConfig,
        datasets: updatedDatasets,
    };
}

export const transformConfigStrToTableData = (configStr: string) => {
    try {
        const config = JSON.parse(configStr);
        return Object.entries(config).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
                return {parameter: key, value: JSON.stringify(value)};
            } else {
                return {parameter: key, value: String(value)};
            }
        });
    } catch (e) {
        console.error('Failed to parse config as JSON:', e);
        return [];
    }
}
export const updateConfusionMatrix = async (modelId: string, predictions: {
    prediction: any;
    trueLabel: any;
}[], cutoffProb: number) => {

    const classificationLabels = await fetchClassificationLabels(modelId);

    const numClasses = classificationLabels.length;
    let confusionMatrix = Array.from({length: numClasses}, () => Array(numClasses).fill(0));

    let stats = [];

    predictions.forEach(({prediction, trueLabel}) => {
        if (isNaN(prediction) || isNaN(trueLabel)) return;

        const predictedClassIndex = classificationLabels
            ? Math.max(0, Math.min(numClasses - 1, Math.round(prediction) - 1))
            : prediction >= cutoffProb ? 1 : 0;
        const trueLabelIndex = classificationLabels
            ? Math.max(0, Math.min(numClasses - 1, trueLabel - 1))
            : trueLabel;

        console.log(confusionMatrix)

        confusionMatrix[trueLabelIndex][predictedClassIndex]++;
    });

    for (let i = 0; i < numClasses; i++) {
        const TP = confusionMatrix[i][i];
        const FP = confusionMatrix.map(row => row[i]).reduce((a, b) => a + b, 0) - TP;
        const FN = confusionMatrix[i].reduce((a, b) => a + b, 0) - TP;
        stats.push(calculateMetrics(TP, FP, FN));
    }

    const classificationData = classificationLabels.flatMap((label, index) => {
        const TP = confusionMatrix[index][index];
        const FP = confusionMatrix.reduce((acc, row) => acc + row[index], 0) - TP;
        return [
            {
                "cutoffProb": "Below cutoff",
                "class": label,
                "value": TP
            },
            {
                "cutoffProb": "Above cutoff",
                "class": label,
                "value": FP
            }
        ];
    });
    console.log(stats)

    return {
        confusionMatrix,
        stats,
        classificationData
    };
};


export const calculateMetrics = (TP: number, FP: number, FN: number) => {
    const precision = FP + TP === 0 ? 0 : Number((TP / (TP + FP)).toFixed(6));
    const recall = FN + TP === 0 ? 0 : Number((TP / (TP + FN)).toFixed(6));
    const f1Score = precision + recall === 0 ? 0 : Number((2 * precision * recall / (precision + recall)).toFixed(6));
    const support = TP + FN;
    return [precision, recall, f1Score, support];
}

export const calculateImpactMetric = (app: string, confusionMatrix: string | any[], attacksConfusionMatrix: string | any[]) => {
    let impact = 0;
    if (confusionMatrix && attacksConfusionMatrix) {
        let errors = 0;
        let errorsAttack = 0;

        if (app === 'ad') {
            errors = confusionMatrix[0][1] + confusionMatrix[1][0];
            errorsAttack = attacksConfusionMatrix[0][1] + attacksConfusionMatrix[1][0];
        } else if (app === 'ac' && confusionMatrix.length > 2 && attacksConfusionMatrix.length > 2) { // Check length before accessing
            errors = confusionMatrix[0][1] + confusionMatrix[0][2] +
                confusionMatrix[1][0] + confusionMatrix[1][2] +
                confusionMatrix[2][0] + confusionMatrix[2][1];

            errorsAttack = attacksConfusionMatrix[0][1] + attacksConfusionMatrix[0][2] +
                attacksConfusionMatrix[1][0] + attacksConfusionMatrix[1][2] +
                attacksConfusionMatrix[2][0] + attacksConfusionMatrix[2][1];
        }

        impact = errors !== 0 ? (errorsAttack - errors) / errors : 0;
    }
    return impact;
}

export const computeAccuracy = (confusionMatrix: any[]) => {

    console.log(confusionMatrix)
    const correctPredictions = Array.isArray(confusionMatrix) && confusionMatrix ? confusionMatrix.reduce((sum, row, i) => sum + row[i], 0) : "";
    console.log(correctPredictions)
    const totalPredictions = Array.isArray(confusionMatrix) && confusionMatrix && confusionMatrix.reduce((sum, row) => sum + row.reduce((a: any, b: any) => a + b, 0), 0);
    return (correctPredictions / totalPredictions).toFixed(6);
}

export async function fetchClassificationLabels(modelId: string): Promise<string[]> {

    const {originalDataset} = await fetchDataset(false, modelId)

    console.log(originalDataset)

    if (!modelId) {
        // Rejecting the promise immediately if modelId is not provided
        return Promise.reject(new Error("Model ID is required to fetch classification labels"));
    }

    try {

        const labels = await extractLabelsFromDataset({
            modelId: modelId,
            datasets: originalDataset.resultData,
        });
        console.log(labels, "labels");
        return labels;
    } catch (error) {
        console.error("Failed to fetch classification labels:", error);
        // Rethrowing the error to be handled by the caller
        throw error;
    }
}

export const extractLabelsFromDataset = async ({modelId, datasets}: {
    modelId: string,
    datasets: any[]
}): Promise<string[]> => {
    console.log(modelId, datasets)
    try {
        if (!datasets || datasets.length === 0) {
            console.log("Datasets are empty or undefined.");
            return [];
        }

        const targetColumnName = findTargetColumn(datasets);
        console.log(targetColumnName);
        if (!targetColumnName) {
            console.log("target column name is missing");
            return [];
        }

        const labelsSet = new Set(datasets.map((row: { [x: string]: any }) => row[targetColumnName]).filter(Boolean));
        const labels = Array.from(labelsSet)
            .map(label => `class ${parseInt(label as string, 10)}`)
            .sort();

        return labels;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Helper function to identify the target column
function findTargetColumn(dataset: any[]) {
    for (const columnName in dataset[0]) {
        if (columnName.includes("output") || columnName.includes("malware")) {
            return columnName;
        }
    }
    return null;
}

function processStats(stats: any[] | null, numClasses: number, accuracy: any): PerformanceStats[] {
    let dataStats: PerformanceStats[] = [];

    const statsStr = stats && stats.map((row: any[], i: any) => `${i},${row.join(',')}`).join('\n');
    console.log(statsStr);
    const rowsStats = statsStr && statsStr.split('\n').map((row: string) => row.split(','));


    // Loop over the rows in rowsStats excluding the accuracy row
    for (let rowIndex = 0; rowIndex < numClasses; rowIndex++) {
        if (rowsStats) {
            const row = rowsStats[rowIndex];

            HEADER_ACCURACY_STATS.forEach((metric: string, metricIndex: number) => {
                if (!dataStats[metricIndex]) {
                    dataStats[metricIndex] = {
                        key: metricIndex.toString(),
                        metric,
                    };
                }
                if (row && row[metricIndex + 1]) {
                    dataStats[metricIndex]['class' + rowIndex] = +row[metricIndex + 1];
                }
            });
        }
    }

    const accuracyRow: any = {
        key: dataStats.length.toString(),
        metric: 'accuracy',
    };
    for (let i = 0; i < numClasses; i++) {
        accuracyRow['class' + i] = accuracy;
    }
    dataStats.push(accuracyRow);

    return dataStats;
}

export const getTablePerformanceStats = async (modelId: string, stats: any[] | null, confusionMatrix: any): Promise<PerformanceStats[]> => {
    console.log(stats)
    if (!modelId && !stats) {
        throw new Error("Invalid input data for getTablePerformanceStats");
    }

    const classificationLabels = await fetchClassificationLabels(modelId);

    console.log(classificationLabels)
    const numClasses = classificationLabels.length;

    const accuracy = computeAccuracy(confusionMatrix);
    console.log(`Accuracy: ${accuracy}`);

    return processStats(stats, numClasses, accuracy);
};

export const getConfigConfusionMatrix = async (modelId: string, confusionMatrix: any []) => {
    const classificationLabels = await fetchClassificationLabels(modelId);
    const cmStr = confusionMatrix.map((row, i) => `${i},${row.join(',')}`).join('\n');
    const rows = cmStr.trim().split('\n');
    const data = rows.flatMap((row, i) => {
        const cols = row.split(',');
        const rowTotal = cols.slice(1).reduce((acc, val) => acc + Number(val), 0);
        return cols.slice(1).map((val, j) => ({
            actual: classificationLabels[i],
            predicted: classificationLabels[j],
            count: Number(val),
            percentage: `${((Number(val) / rowTotal) * 100).toFixed(2)}%`,
        }));
    });

    const configCM = {
        data: data,
        forceFit: true,
        xField: 'predicted',
        yField: 'actual',
        colorField: 'count',
        shape: 'square',
        tooltip: false,
        xAxis: {title: {style: {fontSize: 20}, text: 'Predicted',}},
        yAxis: {title: {style: {fontSize: 20}, text: 'Observed',}},
        label: {
            visible: true,
            position: 'middle',
            style: {
                fontSize: '18',
            },
            formatter: (datum: any) => {
                return `${datum.count}\n(${datum.percentage})`;
            },
        },
        heatmapStyle: {
            padding: 0,
            stroke: '#fff',
            lineWidth: 1,
        },
    };

    return configCM;
}


export function countLabels(dataset: any) {
    const labelsCount = new Map();

    const targetColumnName = findTargetColumn(dataset) ?? "";

    dataset.forEach((row: { [x: string]: any; }) => {
        const labelValue = row[targetColumnName];
        let parsedLabel: number;

        if (typeof labelValue === 'number') {
            parsedLabel = labelValue;
        } else {
            parsedLabel = parseInt(labelValue, 10);
        }

        if (!isNaN(parsedLabel)) {
            const label = `class ${parsedLabel}`;
            labelsCount.set(label, (labelsCount.get(label) || 0) + 1);
        } else {
            console.warn(`Invalid label value: ${labelValue}`);
        }
    });

    console.log(labelsCount);

    return labelsCount;
}

export const loadBuildConfig = async (modelId: string) => {
    const buildConfig = await requestBuildConfigModel(modelId);
    return transformConfigStrToTableData(buildConfig);
};