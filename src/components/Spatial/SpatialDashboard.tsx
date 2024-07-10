import React, {useEffect, useMemo, useState} from 'react';
import {Col, Container, Form, Nav, Row, Tab, Tabs,} from 'react-bootstrap';
import {getLabelsListAppXAI} from '../util/utility'

import {useSpatialContext} from "../../context/context";
import {useParams} from "react-router";
import {LIMETab} from "../XAI/LimeTab";
import ModelSelection from "../Models/Comparison/ModelSelection";
import CriteriaSelection from "../Models/Comparison/SelectionCriteria";
import {CRITERIA_LIST} from "../../constants";
import ModelRow from "../Models/Details/ModelRow";
import {ModelListType} from "../../types/types";
import PredictionsLoader from "../util/PredictiionLoader/PredictionLoader";
import {requestAllModels, requestMedicalModels} from "../../api";

import DatasetList from "../Datasets/DatasetList";
import {ILIMEParametersState} from "../../types/LimeTypes";
import {useRoleContext, Role} from '../RoleProvider/RoleContext';
import SHAPTab from '../XAI/SHAPTab';
import AdversatialTab from '../AdversarialML/AdversarialML';
import ECGAnalysis from "../Services/medical/MedDashboard/ECGAnalysis";
import ModelExplanation from "../Services/medical/MedDashboard/ModelExplanation";
import {loadPredictionsData} from '../util/PredictiionLoader/PredictionLoaderUtil';


const SpatialDashboard: React.FC = () => {
    const {modelId: routeModelId}: string | any = useParams();

    const {XAIStatusState, allModel} = useSpatialContext();

    const isDisabled = routeModelId !== undefined && routeModelId !== '';
    const allowedValues = [1, 5, 10, 15, 20, 25, 30]; //TODO DETERMINE IF ALL MODEL SHOULD BE CALLED GLOBAL
    const {setCurrentService} = useRoleContext();


    const initialState: ILIMEParametersState = {
        modelId: "",
        sampleId: 5,
        featuresToDisplay: 5,
        positiveChecked: true,
        negativeChecked: true,
        label: getLabelsListAppXAI("ac")[1],
        numberSamples: 10,
        maxDisplay: 15,
        maskedFeatures: [],
        pieData: [],
        dataTableProbs: [],
        isRunning: XAIStatusState ? XAIStatusState.isRunning : null,
        limeValues: [],
        isLabelEnabled: false,
        predictions: null
    }

    interface ComparisonState {
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


    const initialComparisonState: ComparisonState = {
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
        stats: null,

    };

    const [comparisonState, setComparisonState] = useState<ComparisonState>(initialComparisonState);

    const [state, setState] = useState({...initialState, modelId: routeModelId || comparisonState.selectedModelLeft});

    const [activeTab, setActiveTab] = useState<string>("tab1");

    const getFirstTwoCharsOfModelId = (params: string): string => {
        return params.length >= 2 ? params.substring(0, 2) : "";
    };

    const [analyzeData, setAnalyzeData] = useState<{
        result1: string | null;
        explanations: { [key: string]: string };
        allResponses: { [key: string]: string }[];
    }>({
        result1: null,
        explanations: {},
        allResponses: [],
    });
    const serviceMapping: { [key: string]: string } = {
        ac: "Network",
        ma: "Medical",
        // Add more mappings here
    };

    const updateServiceBasedOnModel = (modelId: string | null) => {
        if (modelId) {
            const servicePrefix = getFirstTwoCharsOfModelId(modelId);
            const service = serviceMapping[servicePrefix] || "Unknown";
            setCurrentService(service);
        }
    };

    const filteredModels = useMemo(() => {
        if (routeModelId) {
            const servicePrefix = getFirstTwoCharsOfModelId(routeModelId);
            return filterModelsByService(comparisonState.models || [], servicePrefix);
        } else {
            return comparisonState.models;
        }
    }, [comparisonState.models, routeModelId]);

    useEffect(() => {
        combineLoad()
    }, [comparisonState.selectedModelLeft, comparisonState.selectedModelRight, comparisonState.selectedCriteria]);

    useEffect(() => {
        const fetchAllModels = async () => {
            try {
                // const res = await requestAllModels();
                const [networkModels, medicalModels] = await Promise.all([
                    requestAllModels(),
                    requestMedicalModels(),
                ]);
                setComparisonState((prevState) => ({
                    ...prevState,
                    selectedModelLeft: comparisonState.selectedModelLeft || state.modelId,
                    models: [...networkModels, ...medicalModels],
                }));
            } catch (error) {
                console.error(error);
            }
        };
        fetchAllModels();
    }, [state.modelId, routeModelId, comparisonState.selectedCriteria, comparisonState.selectedModelLeft, comparisonState.selectedModelRight, comparisonState.stats, comparisonState.dataStatsLeft, comparisonState.dataStatsRight]);

    const updateComparisonState = (updates: Partial<ComparisonState>) => {
        setComparisonState((prevState) => ({...prevState, ...updates}));
    };

    const handleCriteriaSelection = (criteria: { target: { value: any; }; }) => {
        setComparisonState((prevState) => ({...prevState, selectedCriteria: criteria.target.value}))
    }

    const handleModelSelection = (modelId: string | null, isLeft: boolean | null) => {
        setState((prevState) => ({...prevState, modelId}));
        updateServiceBasedOnModel(modelId);
        if (modelId) {
            const servicePrefix = getFirstTwoCharsOfModelId(modelId);
            const serviceModels = filterModelsByService(
                comparisonState.models || [],
                servicePrefix
            );
            // setComparisonState((prevState) => ({
            //     ...prevState,
            //     models: serviceModels,
            //     ...(isLeft
            //         ? {selectedModelLeft: modelId}
            //         : {selectedModelRight: modelId}),
            // }));
        } else {
            updateComparisonState(
                isLeft ? {selectedModelLeft: null} : {selectedModelRight: null}
            );
        }
    };

    const loadPredictions = async (model: string | null, isLeft: boolean) => {
        if (!model) {
            console.error(`Error: ${isLeft ? 'left' : 'right'} model is null or undefined.`);
            return;
        }
        try {
            const result = await loadPredictionsData(model, isLeft, 0.5);
            console.log(isLeft ? "loadPredLeft" : "loadPredRight", result);
            if (result) {
                setComparisonState(prevState => ({...prevState, ...result}));
            }
        } catch (error) {
            console.error(`Error loading ${isLeft ? 'left' : 'right'} predictions:`, error);
        }
    };

    const loadPredLeft = () => loadPredictions(comparisonState.selectedModelLeft, true);
    const loadPredRight = () => loadPredictions(comparisonState.selectedModelRight, false);

    const combineLoad = async () => {
        await Promise.all([loadPredLeft(), loadPredRight()]);
    };


    return (
        <Container className="mt-5">
            <h2> Spatial Dashboard</h2>
            <Form>
                <Row>
                    <Col md={12}>
                        <Form.Group controlId="modelSelect" className="mb-3">
                            <Form.Label>Model *</Form.Label>
                            <ModelSelection models={comparisonState.models} isFieldDisabled={isDisabled}
                                            selectedModel={routeModelId || comparisonState.selectedModelLeft}
                                            handleModelSelection={handleModelSelection} label={"Model 1"}/>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <Tabs defaultActiveKey="tab1" id="uncontrolled-tab-example" className="mb-3">
                {comparisonState.selectedModelLeft?.startsWith('ac-') && (
                    <Tab eventKey="tab7" title="Configure Network Traffic">
                        <div className="d-flex">
                            {/* Nested Tabs with Bootstrap 5 classes */}
                            <Tabs defaultActiveKey="subtab1" className="flex-column">
                                <Tab eventKey="subtab1" title="LIME">
                                    <div className="side-content px-3"><LIMETab state={state} updateState={setState}/>
                                    </div>
                                </Tab>
                                <Tab eventKey="subtab2" title="SHAP">
                                    <SHAPTab state={state} updateState={setState}/>
                                </Tab>
                                {!comparisonState.selectedModelLeft?.includes('at') &&
                                    <Tab eventKey="subtab3" title="ATTACKS">
                                        <AdversatialTab state={state}/>
                                    </Tab>}

                                {/*<Tab eventKey="subtab4" title="ATTACKS">*/}
                                {/*    <div className="px-3">Content for Sub Tab 2</div>*/}
                                {/*</Tab>*/}
                            </Tabs>
                        </div>
                    </Tab>
                )}
                {comparisonState.selectedModelLeft?.startsWith("ma-") && (
                    <Tab eventKey="tab2" title={"Configure Medical Service"}>
                        <div className="d-flex">
                            {/* Nested Tabs with Bootstrap 5 classes */}
                            <Tabs defaultActiveKey="subtab5" className="flex-column">
                                <Tab eventKey="subtab5" title="Insert ECG">
                                    <div className="side-content px-3">
                                        {/* <InsertECG
                      modelId={state.modelId || ""}
                      // setActiveTab={setActiveTab}
                      setAnalyzeData={setAnalyzeData}
                    /> */}
                                        <ECGAnalysis
                                            modelId={state.modelId || ""}
                                            // setActiveTab={setActiveTab}
                                            setAnalyzeData={setAnalyzeData}
                                        />
                                    </div>
                                </Tab>
                                <Tab eventKey="subtab6" title="Model Explanation">
                                    {/* <div className="px-3">Content for subtab6</div> */}
                                    <ModelExplanation
                                        modelId={state.modelId || ""}
                                        // setActiveTab={setActiveTab}
                                        setAnalyzeData={setAnalyzeData}
                                    />
                                </Tab>
                            </Tabs>
                        </div>
                    </Tab>
                )}
                {comparisonState.selectedModelLeft?.startsWith('model_') && (
                    <Tab eventKey="tab8" title={"Configure Another Service"}>Configure Another Service</Tab>
                )}
                <Tab eventKey="tab1" title={"Compare"}>
                    <ModelSelection models={filteredModels as any}
                                    selectedModel={comparisonState.selectedModelRight || ''}
                                    handleModelSelection={handleModelSelection} label={" "}/>
                    <CriteriaSelection selectedCriteria={comparisonState.selectedCriteria}
                                       handleCriteriaSelection={handleCriteriaSelection} criteriaList={CRITERIA_LIST}/>
                    <div className="model-list">
                        {comparisonState.selectedModelLeft &&
                            <PredictionsLoader
                                modelId={comparisonState.selectedModelLeft}
                                isLeft={true}
                                updateComparisonState={updateComparisonState}
                                cutoffProb={comparisonState.cutoffProb}
                            />
                        }
                        {
                            comparisonState.selectedModelRight &&
                            <PredictionsLoader
                                modelId={comparisonState.selectedModelRight}
                                isLeft={false}
                                updateComparisonState={updateComparisonState}
                                cutoffProb={comparisonState.cutoffProb}
                            />
                        }
                        {/*{*/}
                        {/*    comparisonState.selectedModelLeft &&*/}
                        {/*    <LimeComparisonLoader state={state} selectedModelId={comparisonState.selectedModelLeft}*/}
                        {/*                          isLeft={true} updateComparisonState={updateComparisonState}/>*/}
                        {/*}*/}
                        <div className="model-list">
                            <ModelRow state={comparisonState}/>
                        </div>
                    </div>
                </Tab>
                {comparisonState.selectedModelLeft?.startsWith("ac-") && (
                    <Tab eventKey="tab5" title="Train Dataset">
                        <DatasetList modelIdProp={state.modelId} datasetTypeProp="train"/>
                    </Tab>
                )}
                {comparisonState.selectedModelLeft?.startsWith("ac-") && (
                    <Tab eventKey="tab6" title="Test Dataset">
                        <DatasetList modelIdProp={state.modelId} datasetTypeProp="test"/>
                    </Tab>
                )}
                {/*<Tab eventKey="tab3" title="Lime">*/}
                {/*   */}
                {/*</Tab>*/}
                {/*<Tab eventKey="tab4" title="XExplanability">*/}
                {/*    <EnhancedX/>*/}
                {/*</Tab>*/}
                {/*<Tab eventKey="tab5" title="Fairness">*/}
                {/*    <PieChartComponent data={state.pieData}/>*/}
                {/*    <Fairness/>*/}
                {/*</Tab>*/}
                {/*<Tab eventKey="tab6" title="Privacy">*/}
                {/*    <Privacy/>*/}
                {/*</Tab>*/}
            </Tabs>

        </Container>
    );
};

export default SpatialDashboard;

function updateServiceBasedOnModel(modelId: string | null) {
    throw new Error('Function not implemented.');
}

function filterModelsByService(arg0: ModelListType, servicePrefix: string) {
    throw new Error('Function not implemented.');
}

