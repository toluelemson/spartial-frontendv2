import React, {useEffect, useMemo, useState} from 'react';
import {Col, Container, Form, Row, Tab, Tabs,} from 'react-bootstrap';
import {getLabelsListAppXAI} from '../util/utility'

import {useSpatialContext} from "../../context/context";
import {useParams} from "react-router";
import Fairness from "../Services/Fairness/Fairness";
import Privacy from "../Services/Privacy/Privacy";
import EnhancedX from "../Services/EnhancedX/EnhancedX";
import {LIMETab} from "../XAI/LimeTab";
import ModelSelection from "../models/modelComparison/ModelSelection";
import CriteriaSelection from "../models/modelComparison/SelectionCriteria";
import {CRITERIA_LIST} from "../../constants";
import ModelRow from "../models/ModelRow";
import {ModelListType} from "../../types/types";
import PredictionsLoader from "../util/PredictiionLoader/PredictionLoader";
import {requestAllModels} from "../../api";
import PieChartComponent from "../Charts/PieChartComponent";
import LimeComparisonLoader from "../util/LimeResultLoader/LimeComparisonLoader";
import LimeDataUpdater from "../util/LimeDataUpdater";

type ProbabilityData = { key: number; label: string; probability: string };
type PieChartData = { type: string; value: number };

interface ILIMEParametersState {
    sampleId: number;
    featuresToDisplay: number;
    positiveChecked: boolean;
    negativeChecked: boolean;
    label: string,
    numberSamples: number,
    maxDisplay: number,
    maskedFeatures: string[],
    pieData: PieChartData[],
    dataTableProbs: ProbabilityData[],
    isRunning: any,
    limeValues: string[],
    isLabelEnabled: boolean,
    predictions: null | string
}

const SpatialDashboard: React.FC = () => {
    const {modelId: routeModelId} = useParams();
    const {fp: filterPrefix} = useParams();
    const {XAIStatusState, allModel} = useSpatialContext();

    const isDisabled = routeModelId !== undefined && routeModelId !== '';
    // const allowedValues = [1, 5, 10, 15, 20, 25, 30]; //TODO DETERMINE IF ALL MODEL SHOULD BE CALLED GLOBAL

    const initialState: ILIMEParametersState = {
        sampleId: 5,
        featuresToDisplay: 10,
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
        predictions: null,
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
        pieDataLeft: any;
        pieDataRight: any;
        pieTableLeft: any
        pieTableRight: any
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
        pieDataLeft: null,
        pieDataRight: null,
        pieTableLeft: null,
        pieTableRight: null
    };

    const [comparisonState, setComparisonState] = useState<ComparisonState>(initialComparisonState);

    const [state, setState] = useState({...initialState, modelId: routeModelId || comparisonState.selectedModelLeft});

    console.log(state, comparisonState)
    const filteredModels = useMemo(() => {
        // Check if filterPrefix is defined and not equal to 'all'
        if (filterPrefix && filterPrefix !== 'all') {
            return comparisonState.models?.filter(model =>
                model.modelId.toLowerCase().startsWith(filterPrefix.toLowerCase())
            );
        } else {
            return comparisonState.models;
        }
    }, [comparisonState.models, filterPrefix]);


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
    }, [state.modelId, routeModelId, comparisonState.selectedCriteria, comparisonState.selectedModelLeft, comparisonState.selectedModelRight, comparisonState.stats, comparisonState.dataStatsLeft, comparisonState.dataStatsRight]);

    const updateComparisonState = (updates: Partial<ComparisonState>) => {
        setComparisonState(prevState => ({...prevState, ...updates}));
    };

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
        } else {
            updateComparisonState(isLeft ? {selectedModelLeft: null} : {selectedModelRight: null});
        }
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
                    <Tab eventKey="tab7" title={"Configure Network Traffic"}>Configure</Tab>
                )}
                {comparisonState.selectedModelLeft?.startsWith('model_') && (
                    <Tab eventKey="tab8" title={"Configure Another Service"}>Configure Another Service</Tab>
                )}
                {/*{filterPrefix === 'ac-' && <Tab eventKey="tab7" title={"Configure"}>Configure</Tab>}*/}
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
                        {
                            // comparisonState.selectedModelLeft &&
                            // <LimeComparisonLoader state={state} selectedModelId={comparisonState.selectedModelLeft}
                            //                       isLeft={true} updateComparisonState={updateComparisonState}/>
                        }
                        <div className="model-list">
                            <ModelRow state={comparisonState}/>
                        </div>
                    </div>
                </Tab>
                {/*<Tab eventKey="tab1" title="Train Dataset">*/}
                {/*    <DatasetList modelIdProp={state.modelId} datasetTypeProp="train"/>*/}
                {/*</Tab>*/}
                {/*<Tab eventKey="tab2" title="Test Dataset">*/}
                {/*    <DatasetList modelIdProp={state.modelId} datasetTypeProp="test"/>*/}
                {/*</Tab>*/}
                <Tab eventKey="tab3" title="Lime">
                    <LIMETab state={state} updateState={setState}/>
                </Tab>
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
