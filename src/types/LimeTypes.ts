export type ProbabilityData = { key: number; label: string; probability: string };
export type PieChartData = { type: string; value: number };

export interface ILIMEParametersState {
    sampleId: number;
    featuresToDisplay: number;
    positiveChecked: boolean;
    negativeChecked: boolean;
    modelId: string,
    label: string,
    numberSamples: number,
    maxDisplay: number,
    maskedFeatures: string[]
    pieData: PieChartData[],
    dataTableProbs: ProbabilityData[],
    isRunning: any,
    limeValues: string[],
    isLabelEnabled: boolean,
    predictions: null | string,
    pieDataLeft: null,
    pieDataRight: null,
    pieTableLeft: null,
    pieTableRight: null
}

export interface LIMETabProps {
    state: any;
    updateState: any
}
