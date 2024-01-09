import React, {useState, FormEvent, useEffect} from 'react';
import {Container, Form, Row, Col, Button, InputGroup, FormControl, Card, Spinner} from 'react-bootstrap';
import {getLabelsListAppXAI} from '../util/utility'
import PieChartComponent from '../Charts/PieChartComponent';

import {useSpatialContext} from "../../context/context";
import * as api from '../../api';
import Papa from "papaparse";
import {AC_OUTPUT_LABELS, AD_OUTPUT_LABELS} from "../../constants";
import ProbabilityTable from "../Charts/ProbabilityTable";


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

interface LIMETabProps {
    modelId: string;
}


export const LIMETab: React.FC<LIMETabProps> = ({modelId}) => {

    // const { modelId } = useParams();
    console.log(modelId)
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
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const csvDataString = await api.requestViewModelDatasets("ac-xgboost", "train");
                Papa.parse(csvDataString, {
                    complete: result => {
                        if (Array.isArray(result.data)) {
                            setState((prevState) => ({...prevState, maskedFeatures: result.data as string[]}))
                        }
                    }, header: true,
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
        const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

        if (target instanceof HTMLSelectElement && target.multiple) {
            // Handle multi-select
            const selectedOptions = Array.from(target.selectedOptions, option => option.value);
            setSelectedOptions(selectedOptions);
        } else if (target.type === 'checkbox') {
            // Handle checkbox
            setState({
                ...state,
                [target.name]: (target as HTMLInputElement).checked,
            });
        } else {
            // Handle other inputs (text, textarea, etc.)
            setState({
                ...state,
                [target.name]: target.value,
            });
        }
    }
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        setLoading(true);

        const {modelId, sampleId, featuresToDisplay} = state

        const predictionModelResponse = await api.requestPredictionsModel(state.modelId)

        setState((prevState) => ({...prevState, predictions: predictionModelResponse}))

        let intervalId: NodeJS.Timer | null = null;
        const runLimeAndMonitorStatus = async () => {
            try {
                //TODO Replace 'any' with actual type for modelId, sampleId, featuresToDisplay, and res
                const res: any = await api.requestRunLime(modelId, sampleId, featuresToDisplay);
                console.log(res)

                if (res && res.isRunning) {
                    intervalId = setInterval(() => {
                        api.requestXAIStatus();
                    }, 1000);
                }
            } catch (error: any) {
                console.error('Error during requestRunLime:', error);

                if (intervalId) clearInterval(intervalId);
            }

            if (intervalId) clearInterval(intervalId);
        };

        // Call the function
        await runLimeAndMonitorStatus();

        const formatProbabilityData = (yProbs: number[][], labels: string[], sampleId: number | null): ProbabilityData[] => {
            return labels.map((label, index) => ({
                key: index,
                label,
                probability: sampleId && yProbs[sampleId] ? yProbs[sampleId][index].toFixed(6) : '-'
            }));
        };

        const formatPieChartData = (yProbs: number[][], sampleId: number | null, labels: string[]): PieChartData[] => {
            return sampleId ? yProbs[sampleId].map((prob, i) => ({
                type: labels[i],
                value: parseFloat((prob * 100).toFixed(2))
            })) : [];
        };

        const parsePredictedProbs = (probs: string, sampleId: number | null): number[][] => {
            return probs.split('\n').slice(1).map(line =>
                line.split(',').map(val => parseFloat(val))
            );
        };

        const processProbsData = async (modelId: string, sampleId: number | null) => {
            const predictedProbsResponse = await api.requestPredictedProbsModel(state.modelId);
            const yProbs = parsePredictedProbs(predictedProbsResponse, sampleId);
            let dataTableProbs: ProbabilityData[] = [];
            let pieData: PieChartData[] = [];

            if (modelId.startsWith('ac-')) {
                dataTableProbs = formatProbabilityData(yProbs, ['Web', 'Interactive', 'Video'], sampleId);
                pieData = formatPieChartData(yProbs, sampleId, AC_OUTPUT_LABELS);
            } else {
                dataTableProbs = formatProbabilityData(yProbs, ['Normal traffic', 'Malware traffic'], sampleId);
                pieData = formatPieChartData(yProbs, sampleId, AD_OUTPUT_LABELS);
            }

            return {dataTableProbs, pieData};
        };

        const updateData = async () => {
            const {dataTableProbs, pieData} = await processProbsData(state.modelId, state.sampleId);
            setState((prevState) => ({...prevState, pieData: pieData, dataTableProbs: dataTableProbs}))

        };

        await updateData();
        setLoading(false);
    }

    return (
        <Container fluid>
            <h2 className="my-4 text-center"> Explainable AI with Local Interpretable Model-agnostic Explanations
                (LIME) </h2>
            <Form onSubmit={handleSubmit}>
                <Row>
                    <Col md={6}>
                        <Card className="mb-4">
                            {/*<Form.Group controlId="modelSelect" className="mb-3">*/}
                            {/*  <Form.Label>Model *</Form.Label>*/}
                            {/*    <Form.Select*/}
                            {/*          name="modelId"*/}
                            {/*          aria-label="Model select"*/}
                            {/*          className="mb-3"*/}
                            {/*          onChange={handleInputChange}*/}
                            {/*          value={state.modelId}*/}
                            {/*        >*/}
                            {/*         <option value="" disabled selected={!!state.modelId}>Select a model</option>*/}
                            {/*          {allModel && allModel.map(m => (*/}
                            {/*            <option key={m.modelId} value={m.modelId}>{m.modelId}</option>*/}
                            {/*          ))}*/}
                            {/*        </Form.Select>*/}
                            {/*</Form.Group>*/}
                            <Card.Body>
                                <Form.Group controlId="sampleID" className="mb-3">
                                    <Form.Label>Sample ID</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="sampleId"
                                        placeholder="Enter Sample ID"
                                        value={state.sampleId}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group controlId="sampleID" className="mb-3">
                                    <Form.Label>Sample ID</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="sampleId"
                                        placeholder="Enter Sample ID"
                                        value={state.sampleId}
                                        onChange={handleInputChange}
                                        className="mb-3"
                                    />
                                </Form.Group>
                                <Form.Group controlId="featuresToMask" className="mb-3">
                                    <Form.Label>Feature(s) to Mask</Form.Label>
                                    <InputGroup>
                                        <Form.Select
                                            multiple={true}
                                            name="featuresToMask"
                                            className="form-select"
                                            onChange={handleInputChange}
                                        >
                                            <option value="%tcp_protocol">%tcp_protocol</option>
                                            {state.maskedFeatures.length > 0 && Object.keys(state.maskedFeatures[0]).sort()
                                                .map((key, index) => (
                                                    <option value={key} key={index}>{key}</option>
                                                ))
                                            }
                                        </Form.Select>
                                    </InputGroup>
                                    <div className="mt-3">
                                        <strong>Selected Features:</strong>
                                        <div>
                                            {selectedOptions.map((feature, index) => (
                                                <span key={index} className="badge bg-secondary me-2">{feature}</span>
                                            ))}
                                        </div>
                                    </div>
                                </Form.Group>
                                <Button variant="primary" type="submit" className="mt-3 w-100">Run Analysis</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6}>
                        <Card className="mb-4">
                            <Card.Body>
                                <Form.Group controlId="featuresToDisplay" className="mb-3">
                                    <Form.Label>
                                        Features to display:
                                        <span className="ms-2 badge bg-secondary">
                                                {allowedValues[state.featuresToDisplay]}
                                            </span>
                                    </Form.Label>
                                    <Form.Range
                                        name="featuresToDisplay"
                                        value={state.featuresToDisplay}
                                        onChange={handleInputChange}
                                        min="0"
                                        max={allowedValues.length - 1}
                                        step="1"
                                        className="form-range custom-range-slider"
                                    />
                                </Form.Group>
                                {/* Positive/Negative Checkboxes */}
                                <Form.Group controlId="contributionsToDisplay" className="mb-2">
                                    <Form.Check
                                        type="checkbox"
                                        id="positiveCheck"
                                        name="positiveChecked"
                                        label="Positive"
                                        checked={state.positiveChecked}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <div className="p-3 mb-3 border rounded">
                                    <Form.Group controlId="contributionsToDisplay" className="mb-2">
                                        <div className="d-flex align-items-center">
                                            <Form.Check
                                                type="checkbox"
                                                id="positiveCheck"
                                                name="positiveChecked"
                                                className="me-2"
                                                checked={state.positiveChecked}
                                                onChange={handleInputChange}
                                            />
                                            <Form.Label htmlFor="positiveCheck" className="mb-0">Positive</Form.Label>
                                        </div>
                                    </Form.Group>
                                    <Form.Group controlId="contributionsToDisplay">
                                        <Form.Check
                                            type="checkbox"
                                            id="negativeCheck"
                                            name="negativeChecked"
                                            label="Negative"
                                            checked={state.negativeChecked}
                                            onChange={handleInputChange}
                                        />
                                    </Form.Group>

                                </div>
                            </Card.Body>
                        </Card>


                    </Col>

                </Row>
                {loading ? (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            ) : (
                <Row className="mt-4">
                    <Col md={6}>
                        <PieChartComponent data={state.pieData} />
                    </Col>
                    <Col md={6}>
                        <ProbabilityTable data={state.dataTableProbs as any} />
                    </Col>
                </Row>
            )}
            </Form>

        </Container>

    )
}
