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

export type DataItem = {
    id: string;
    name: string;
    digest: string;
    mime_type: string;
    classname: string;
    extension: string;
};

export interface AttackParams {
    targeted: boolean;
    confidence: number;
    learning_rate: number;
    max_iter: number;
    binary_search_steps: number;
    initial_const: number;
    abort_early: boolean;
    use_resize: boolean;
    use_importance: boolean;
    nb_parallel: number;
    variable_h: number;
    verbose: boolean;
    norm: number;
}

export interface Attack {
    classname: string;
    params: AttackParams;
    metrics_collector_kwargs: {
        measure_every: number;
    };
    maldoc?: boolean;
}

export interface FormDataState {
    attackType: string;
    experimentName: string;
    model: object | string;
    data: string;
    constraints: {
        clip_min?: number;
        clip_max?: number;
        df?: string;
    };
    random_seed: number;
    num_examples: number;
    attacks: Attack[];
}

export interface InputState {
    modelId: string;
}
