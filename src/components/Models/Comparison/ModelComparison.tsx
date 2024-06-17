import React, {useEffect, useState} from 'react';
import ModelRow from '../Details/ModelRow';
import {requestAllModels, requestBuildConfigModel, requestPredictionsModel} from "../../../api";
import {
    getConfigConfusionMatrix,
    getTablePerformanceStats,
    removeCsvPath,
    transformConfigStrToTableData,
} from "../../util/utility";
import {CRITERIA_LIST} from "../../../constants";
import ModelSelection from "../Comparison/ModelSelection";
import SelectionCriteria from "../Comparison/SelectionCriteria";
import {ModelListType} from "../../../types/types";
import PredictionsLoader from "../../util/PredictiionLoader/PredictionLoader";

interface Performance {
    web: number;
    interactive: number;
    video: number;
}

interface Model {
    modelId: number;
    name: string;
    performance: Performance;
}

interface Performance {
    web: number;
    interactive: number;
    video: number;
}

// interface Model {
//     modelId: number;
//     name: string;
//     performance: Performance;
// }

interface State {
    models: ModelListType | null
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
    cutoffProb: number
    confusionMatrix?: any;
    classificationData?: any;
}

const initialState: State = {
    models: [],
    dataStatsLeft: [],
    dataStatsRight: [],
    dataBuildConfigLeft: {},
    dataBuildConfigRight: {},
    selectedModelLeft: null,
    selectedModelRight: null,
    confusionMatrix: null,
    cmConfigLeft: null,
    cmConfigRight: null,
    selectedOption: null,
    selectedCriteria: null,
    cutoffProb: 0.5,
    stats: null
};

const loadBuildConfig = async (modelId: string) => {
    const buildConfig = await requestBuildConfigModel(modelId);
    return transformConfigStrToTableData(buildConfig);
};

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

const ModelsComparison: React.FC = () => {
    const [state, setState] = useState<State>(initialState);

    useEffect(() => {
        const fetchAllModels = async () => {
            try {
                const res = await requestAllModels();
                setState(prevState => ({...prevState, models: res}));
            } catch (error) {
                console.error(error);
            }
        };
        fetchAllModels();
    }, [state.selectedCriteria, state.selectedModelLeft, state.selectedModelRight, state.stats, state.dataStatsLeft, state.dataStatsRight]);

    const updateState = (updates: Partial<State>) => {
        console.log(updates.dataStatsRight)
        setState(prevState => ({...prevState, ...updates}));
    };

    const handleModelSelection = async (modelId: string | null, isLeft: boolean | null) => {

        if (modelId) {
            try {
                setState(prevState => ({
                        ...prevState,
                        ...(isLeft ? {selectedModelLeft: modelId} : {selectedModelRight: modelId})
                    }
                ));

                // await loadPredictions(modelId, isLeft);

            } catch (error) {
                console.error("Error loading predictions:", error);
            }
        } else {
            updateState(isLeft ? {selectedModelLeft: null} : {selectedModelRight: null});
        }
    };

    const handleCriteriaSelection = (criteria: { target: { value: any; }; }) => {
        setState(prevState => ({...prevState, selectedCriteria: criteria.target.value}))

    }
    // const loadPredictions = async (modelId: string, isLeft: boolean | null) => {
    //     try {
    //         // Load configurations and predictions
    //         const dataBuildConfig = await loadBuildConfig(modelId);
    //         const predictions = await loadPredictionsValues(modelId);
    //
    //         // Update confusion matrix and get necessary data
    //         const {
    //             confusionMatrix,
    //             stats,
    //             classificationData
    //         } = await updateConfusionMatrix(modelId, predictions, state.cutoffProb);
    //
    //         // Log and update state with initial data
    //         console.log(stats);
    //         updateState({
    //             predictions,
    //             stats
    //         });
    //
    //         // Load additional data based on the updated state
    //         const dataStats = await getTablePerformanceStats(modelId, stats, confusionMatrix);
    //         const configCM = confusionMatrix && await getConfigConfusionMatrix(modelId, confusionMatrix);
    //
    //         // Update state with additional data
    //         updateState({
    //             confusionMatrix,
    //             classificationData,
    //             ...(isLeft !== null && (isLeft ? {
    //                 selectedModelLeft: modelId,
    //                 dataBuildConfigLeft: dataBuildConfig,
    //                 dataStatsLeft: dataStats,
    //                 cmConfigLeft: configCM,
    //             } : {
    //                 selectedModelRight: modelId,
    //                 dataBuildConfigRight: dataBuildConfig,
    //                 dataStatsRight: dataStats,
    //                 cmConfigRight: configCM,
    //             }))
    //         });
    //     } catch (error) {
    //         console.error("Error loading predictions:", error);
    //     }
    // };

    return (
        <>
            <section className="models-comparison container my-4">
                <header>
                    <h1 className="text-center mb-3">Models Comparison</h1>
                    <p className="text-muted text-center mb-4">
                        Comparing models based on performance metrics
                    </p>
                </header>
                <div className="row justify-content-center">
                    <div className="col-md-4 col-sm-6">
                        <ModelSelection models={state.models} selectedModel={state.selectedModelLeft || ''}
                                        handleModelSelection={handleModelSelection} label={"Model 1"}/>
                    </div>
                    <div className="col-md-4 col-sm-6">
                        <SelectionCriteria selectedCriteria={state.selectedCriteria}
                                           handleCriteriaSelection={handleCriteriaSelection}
                                           criteriaList={CRITERIA_LIST}/>
                    </div>
                    <div className="col-md-4 col-sm-6">
                        <ModelSelection models={state.models} selectedModel={state.selectedModelRight || ''}
                                        handleModelSelection={handleModelSelection} label={"Model 2"}/>
                    </div>
                </div>

                {state.selectedModelLeft &&
                <PredictionsLoader
                    modelId={state.selectedModelLeft}
                    isLeft={true}
                    updateComparisonState={updateState}
                    cutoffProb={state.cutoffProb}
                />
            }
            {state.selectedModelRight &&
                <PredictionsLoader
                    modelId={state.selectedModelRight}
                    isLeft={false}
                    updateComparisonState={updateState}
                    cutoffProb={state.cutoffProb}
                />
            }
                <div className="model-list">
                    <ModelRow state={state}/>
                </div>
            </section>
        </>
    )
};

export default ModelsComparison;
