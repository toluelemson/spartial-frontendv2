export type ProbabilityData = { key: number; label: string; probability: string };
export type BarChartData = { type: string; value: number };

export interface ILIMEParametersState {
    sampleId: number;
    featuresToDisplay: number;
    positiveChecked: boolean;
    negativeChecked: boolean;
    modelId: string,
    label: string | null,
    numberSamples: number,
    maxDisplay: number,
    maskedFeatures: string[]
    pieData: BarChartData[],
    dataTableProbs: ProbabilityData[],
    isRunning: any,
    limeValues?: Array<{ feature: string, value: any }>,
    isLabelEnabled: boolean,
    predictions: null | string
}

export interface LIMETabProps {
    state: ILIMEParametersState;
    updateState: any
}