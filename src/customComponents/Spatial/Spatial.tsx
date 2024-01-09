import React, {useState, FormEvent, useEffect} from 'react';
import {Container, Form, Row, Col, Tabs, Tab,} from 'react-bootstrap';
import {getLabelsListAppXAI} from '../util/utility'

import {useSpatialContext} from "../../context/context";
import * as api from '../../api';
import Papa from "papaparse";
import {useParams} from "react-router";
import Fairness from "../Services/Fairness/Fairness";
import Privacy from "../Services/Privacy/Privacy";
import EnhancedX from "../Services/EnhancedX/EnhancedX";
import {LIMETab} from "../XAI/LimeTab";
import DatasetList from "../datasets/DatasetList";
import {To, useNavigate} from "react-router-dom";


type ProbabilityData = { key: number; label: string; probability: string };
type PieChartData = { type: string; value: number };

interface ILIMEParametersState {
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
    predictions: null | string
}

const LIMEParameters: React.FC = () => {
    const {modelId} = useParams();
    const navigate = useNavigate();


    const handleButtonNavigate = (targetPath: To) => {
        navigate(targetPath);
    };

    const isDisabled = modelId !== undefined;
    const allowedValues = [1, 5, 10, 15, 20, 25, 30];
    const {XAIStatusState, allModel} = useSpatialContext();  //TODO DETERMINE IF ALL MODEL SHOULD BE CALLED GLOBALLY
    const initialState: ILIMEParametersState = {
        sampleId: 5,
        featuresToDisplay: 10,
        positiveChecked: true,
        negativeChecked: true,
        modelId: modelId || "",
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

    const [state, setState] = useState<ILIMEParametersState>(initialState);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const csvDataString = await api.requestViewModelDatasets("ac-xgboost", "train");
                Papa.parse(csvDataString, {
                    complete: result => {
                        if (Array.isArray(result.data)) {
                            setState((prevState) => ({...prevState, maskedFeatures: result.data as string[]}))
                        }
                    },
                    header: true,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = event.target as HTMLInputElement;
        const value = target.type === 'checkbox' ? target.checked : target.value;

        setState({
            ...state,
            [target.name]: value,
        });
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {

        event.preventDefault();

        // const target = event.target as HTMLInputElement;
        const {modelId, sampleId, featuresToDisplay} = state

        const predictionModelResponse = await api.requestPredictionsModel(state.modelId)

        setState((prevState) => ({...prevState, predictions: predictionModelResponse}))

    }

    return (
        <Container className="mt-5">
            <h2> Spatial </h2>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={12}>
                        <Form.Group controlId="modelSelect" className="mb-3">
                            <Form.Label>Model *</Form.Label>
                            <Form.Select
                                name="modelId"
                                aria-label="Model select"
                                className="mb-3"
                                onChange={handleInputChange}
                                value={state.modelId}
                                disabled={isDisabled}
                            >
                                <option value="" disabled selected={!!state.modelId}>Select a model</option>
                                {allModel && allModel.map(m => (
                                    <option key={m.modelId} value={m.modelId}>{m.modelId}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
            <Tabs defaultActiveKey="tab1" id="uncontrolled-tab-example" className="mb-3">
                <Tab eventKey="tab1" title="Train Dataset">
                    <DatasetList modelIdProp={state.modelId} datasetTypeProp="train"/>
                </Tab>
                <Tab eventKey="tab2" title="Test Dataset">
                    <DatasetList modelIdProp={state.modelId} datasetTypeProp="test"/>
                </Tab>
                <Tab eventKey="tab3" title="Lime">
                    <LIMETab modelId={state.modelId}/>
                </Tab>
                <Tab eventKey="tab4" title="XExplanability">
                    <EnhancedX/>
                </Tab>
                <Tab eventKey="tab5" title="Fairness">
                    <Fairness/>
                </Tab>
                <Tab eventKey="tab6" title="Privacy">
                    <Privacy/>
                </Tab>


            </Tabs>

        </Container>
    );
};

export default LIMEParameters;
