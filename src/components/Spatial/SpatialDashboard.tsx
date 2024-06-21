import React, {useEffect, useMemo, useState} from 'react';
import {Col, Container, Form, Nav, Row, Tab, Tabs,} from 'react-bootstrap';
import {getLabelsListAppXAI} from '../util/utility'

import {useSpatialContext} from "../../context/context";
import {useParams} from "react-router";
// import Fairness from "../Services/Fairness/Fairness";
// import Privacy from "../Services/Privacy/Privacy";
// import EnhancedX from "../Services/EnhancedX/EnhancedX";
import {LIMETab} from "../XAI/LimeTab";
import ModelSelection from "../Models/Comparison/ModelSelection";
import CriteriaSelection from "../Models/Comparison/SelectionCriteria";
import {CRITERIA_LIST} from "../../constants";
import ModelRow from "../Models/Details/ModelRow";
import {ModelListType, TODO} from "../../types/types";
import PredictionsLoader from "../util/PredictiionLoader/PredictionLoader";
import {requestAllModels} from "../../api";

import DatasetList from "../Datasets/DatasetList";
import {ILIMEParametersState} from "../../types/LimeTypes";
import SHAPTab from '../XAI/SHAPTab';
import AdversatialTab from '../AdversarialML/AdversarialML';
import ResilienceMetrics from '../ResiliienceMetrics/ResilienceMetrics';
import {loadPredictionsData} from '../util/PredictiionLoader/PredictionLoaderUtil';


const SpatialDashboard: React.FC = () => {
    const {modelId: routeModelId}: string | any = useParams();

    const {XAIStatusState, allModel} = useSpatialContext();

    const isDisabled = routeModelId !== undefined && routeModelId !== '';
    const allowedValues = [1, 5, 10, 15, 20, 25, 30]; //TODO DETERMINE IF ALL MODEL SHOULD BE CALLED GLOBAL

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


    const getFirstTwoCharsOfModelId = (params: string): string => {
        return params.length >= 2 ? params.substring(0, 2) : '';
    }

    const filteredModels = useMemo(() => {
        if (routeModelId && routeModelId) {
            return comparisonState.models?.filter(model =>
                model.modelId.toLowerCase().startsWith(getFirstTwoCharsOfModelId(routeModelId))
            );
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
                const res = await requestAllModels();
                setComparisonState(prevState => ({
                    ...prevState,
                    selectedModelLeft: comparisonState.selectedModelLeft || state.modelId,
                    models: res
                }));
            } catch (error) {
                console.error(error);
            }
        };
        fetchAllModels();
    }, [state.modelId, routeModelId, comparisonState.selectedCriteria, comparisonState.selectedModelLeft, comparisonState.selectedModelRight]);

    const handleCriteriaSelection = (criteria: { target: { value: any; }; }) => {
        setComparisonState(prevState => ({...prevState, selectedCriteria: criteria.target.value}))
    }

    const handleModelSelection = (modelId: string | null, isLeft: boolean | null) => {
        setState(prevState => ({...prevState, modelId}));

        if (modelId) {
            setComparisonState(prevState => ({
                ...prevState,
                ...(isLeft ? {selectedModelLeft: modelId} : {selectedModelRight: modelId})
            }));
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

                            </Tabs>
                        </div>
                    </Tab>
                )}
                {comparisonState.selectedModelLeft?.startsWith('model_') && (
                    <Tab eventKey="tab8" title={"Configure Another Service"}>Configure Another Service</Tab>
                )}
                <Tab eventKey="tab1" title={"Compare"}>
                    <ModelSelection models={filteredModels as TODO}
                                    selectedModel={comparisonState.selectedModelRight || ''}
                                    handleModelSelection={handleModelSelection} label={" "}/>
                    <CriteriaSelection selectedCriteria={comparisonState.selectedCriteria}
                                       handleCriteriaSelection={handleCriteriaSelection} criteriaList={CRITERIA_LIST}/>
                    <div className="model-list">
                        <div className="model-list">
                            <ModelRow state={comparisonState}/>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey="tab2" title="Train Dataset">
                    <DatasetList modelIdProp={state.modelId} datasetTypeProp="train"/>
                </Tab>
                <Tab eventKey="tab3" title="Test Dataset">
                    <DatasetList modelIdProp={state.modelId} datasetTypeProp="test"/>
                </Tab>
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
