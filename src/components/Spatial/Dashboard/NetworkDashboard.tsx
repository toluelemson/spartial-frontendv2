import React, {useEffect, useState, useMemo} from "react";
import {useParams} from "react-router";
import {Col, Container, Form, Row, Tab, Tabs} from "react-bootstrap";
import {requestAllModels} from "../../../api";
import {ModelListType} from "../../../types/types";
import ModelSelection from "../../Models/Comparison/ModelSelection";
import DatasetList from "../../Datasets/DatasetList";

import {loadPredictionsData} from "../../util/PredictiionLoader/PredictionLoaderUtil";
import ComparisonTab from "../Tab/ComparisonTab";
import NetworkTrafficTab from "../Tab/NetworkTrafficTab";

interface ComparisonState {
    models: ModelListType | null;
    dataStatsLeft: any[];
    dataStatsRight: any[];
    dataBuildConfigLeft: object;
    dataBuildConfigRight: object;
    selectedModelLeft: any;
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

const NetworkDashboard: React.FC = () => {
    const {modelId: routeModelId} = useParams();
    const [comparisonState, setComparisonState] = useState<ComparisonState>(
        initialComparisonState
    );

    const getFirstTwoCharsOfModelId = (params: string): string =>
        params.length >= 2 ? params.substring(0, 2) : "";

    const filterModelsByService = (
        models: ModelListType,
        servicePrefix: string
    ) => {
        return models.filter((model) =>
            model.modelId.toLowerCase().startsWith(servicePrefix)
        );
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
        combineLoad();
    }, [
        comparisonState.selectedModelLeft,
        comparisonState.selectedModelRight,
        comparisonState.selectedCriteria,
    ]);

    useEffect(() => {
        const fetchAllModels = async () => {
            try {
                const networkModels = await requestAllModels();
                setComparisonState((prevState) => ({
                    ...prevState,
                    selectedModelLeft: prevState.selectedModelLeft || routeModelId,
                    models: networkModels,
                }));
            } catch (error) {
                console.error(error);
            }
        };

        fetchAllModels();
    }, [
        routeModelId,
        comparisonState.selectedCriteria,
        comparisonState.selectedModelLeft,
        comparisonState.selectedModelRight,
        comparisonState.stats,
        comparisonState.dataStatsLeft,
        comparisonState.dataStatsRight,
    ]);

    const handleCriteriaSelection = (criteria: { target: { value: any } }) => {
        setComparisonState((prevState) => ({
            ...prevState,
            selectedCriteria: criteria.target.value,
        }));
    };

    const handleModelSelection = (
        modelId: string | null,
        isLeft: boolean | null
    ) => {
        if (modelId) {
            const servicePrefix = getFirstTwoCharsOfModelId(modelId);
            const serviceModels = filterModelsByService(
                comparisonState.models || [],
                servicePrefix
            );
            setComparisonState((prevState) => ({
                ...prevState,
                models: serviceModels,
                ...(isLeft
                    ? {selectedModelLeft: modelId}
                    : {selectedModelRight: modelId}),
            }));
        }
    };

    const loadPredictions = async (model: string | null, isLeft: boolean) => {
        if (!model) {
            console.error(
                `Error: ${isLeft ? "left" : "right"} model is null or undefined.`
            );
            return;
        }
        try {
            const result = await loadPredictionsData(model, isLeft, 0.5);
            if (result) {
                setComparisonState((prevState) => ({...prevState, ...result}));
            }
        } catch (error) {
            console.error(
                `Error loading ${isLeft ? "left" : "right"} predictions:`,
                error
            );
        }
    };

    const loadPredLeft = () =>
        loadPredictions(comparisonState.selectedModelLeft, true);
    const loadPredRight = () =>
        loadPredictions(comparisonState.selectedModelRight, false);

    const combineLoad = async () => {
        await Promise.all([loadPredLeft(), loadPredRight()]);
    };

    return (
        <Container className="mt-5">
            <h2>Network Dashboard</h2>
            <Form>
                <Row>
                    <Col md={12}>
                        <Form.Group controlId="modelSelect" className="mb-3">
                            <Form.Label>Model *</Form.Label>
                            <ModelSelection
                                models={comparisonState.models}
                                selectedModel={
                                    routeModelId || comparisonState.selectedModelLeft
                                }
                                handleModelSelection={handleModelSelection}
                                label="Model 1"
                            />
                        </Form.Group>
                    </Col>
                </Row>
            </Form>

            <Tabs>
                <Tab eventKey="subtab6" title={"NetworkTrafficTab"}>
                    <NetworkTrafficTab
                        filtteredModels={filteredModels}
                        comparisonState={comparisonState}
                        handleModelSelection={handleModelSelection}
                        handleCriteriaSelection={handleCriteriaSelection}
                    />
                </Tab>

                <Tab eventKey="subtab8" title="Compare">
                    <ComparisonTab
                        filteredModels={filteredModels}
                        comparisonState={comparisonState}
                        handleModelSelection={handleModelSelection}
                        handleCriteriaSelection={handleCriteriaSelection}
                    />
                </Tab>
                <Tab eventKey="subtab4" title="Train Dataset">
                    <DatasetList modelIdProp={routeModelId} datasetTypeProp="train"/>
                </Tab>
                <Tab eventKey="subtab5" title="Test Dataset">
                    <DatasetList modelIdProp={routeModelId} datasetTypeProp="test"/>
                </Tab>
            </Tabs>
        </Container>
    );
};

export default NetworkDashboard;
