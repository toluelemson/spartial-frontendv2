export type DatasetType = { datasetId: string | null; isAttack: boolean }[]


export type TODO = any

export interface TParamType {
    [key: string]: string;
}
export type TrainingParameterType = {
    [key: string]: string;
    nb_epoch_cnn: string;
    b_epoch_sae: string;
    batch_size_cnnN: string;
    batch_size_sae: string;
};

type Config = {
    datasets: DatasetType;
    training_ratio: number;
    training_parameters: TrainingParameterType;
};

export type BuildStatusType = {
    isRunning: boolean | null;
    lastBuildAt: number | null;
    lastBuildId: string | null;
    buildStatus: any,
    config: Config;
}

export type OptionInterface  = {
    reports: string;
}

export type MMTStatusInterface  = {
    isRunning: boolean;
}

export type AcDataSetInterface = {
    datasets: string[]
}


export type ModelData = {
    modelId: string;
    lastBuildAt: number;
    buildConfig: object;
};

export type ModelListType = ModelData[];

export interface ServiceFormProps {
    serviceType: string;
    onServiceTypeChange: (newServiceType: string) => void;
}

export type XAIStatusType = {
    isRunning: boolean | null;
    lastBuildAt: number | null;
    buildStatus: any,
    config: Config;
}

export interface RetrainStatus {
    retrainStatus: {
        lastRetrainId: string;
        isRunning: boolean;
    };
}

export interface ComparisonState {
    models: ModelListType | null;
    dataStatsLeft: any[];
    dataStatsRight: any[];
    dataBuildConfigLeft: object;
    dataBuildConfigRight: object;
    selectedModelLeft: string | null;
    selectedModelRight: string | null;
    cmConfigLeft: object | null;
    cmConfigRight: object | null;
    selectedOption: any | null;
    selectedCriteria: any | null;
    predictions?: any[];
    stats: any[] | null;
    cutoffProb: number;
    confusionMatrix?: any;
    classificationData?: any;
}