import Papa from 'papaparse';
import React, {useState, FormEvent, useEffect} from 'react';
import {Container, Form, Row, Col, Button, InputGroup, Card, Spinner} from 'react-bootstrap';
import PieChartComponent from '../Charts/PieChartComponent';
import ProbabilityTable from "../Charts/ProbabilityTable";
import LimeDataUpdater from '../util/LimeDataUpdater';
import * as api from '../../api';

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
    state: any;
    updateState: any
}


export const LIMETab: React.FC<LIMETabProps> = ({state, updateState}) => {

    const allowedValues = [1, 5, 10, 15, 20, 25, 30];
    const [triggerDataUpdate, setTriggerDataUpdate] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const csvDataString = await api.requestViewModelDatasets("ac-xgboost", "train");
                Papa.parse(csvDataString, {
                    complete: result => {
                        if (Array.isArray(result.data)) {
                            updateState((prevState: any) => ({...prevState, maskedFeatures: result.data as string[]}))
                        }
                    }, header: true,
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [state.modelId, updateState]);

    useEffect(() => {
        const loadDataFromStorage = () => {
            if (!state.modelId) return;
            try {
                const storedPieData = localStorage.getItem('pieData' + state.modelId);
                const storedDataTableProbs = localStorage.getItem('dataTableProbs' + state.modelId);

                let newState: Partial<ILIMEParametersState> = {};

                if (storedPieData) {
                    const pieData = JSON.parse(storedPieData);
                    if (pieData[state.modelId]) {
                        newState.pieData = pieData[state.modelId];
                    }
                }

                if (storedDataTableProbs) {
                    const dataTableProbs = JSON.parse(storedDataTableProbs);
                    if (dataTableProbs[state.modelId]) {
                        newState.dataTableProbs = dataTableProbs[state.modelId];
                    }
                }

                if (Object.keys(newState).length > 0) {
                    updateState((prevState: ILIMEParametersState) => ({...prevState, ...newState}));
                }
            } catch (error) {
                console.error('Error loading data from localStorage:', error);
            }
        }
        loadDataFromStorage();
    }, [state.modelId]);

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
            updateState({
                ...state,
                [target.name]: (target as HTMLInputElement).checked,
            });
        } else {
            updateState({
                ...state,
                [target.name]: target.value,
            });
        }
    }
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        setLoading(true)

        if (!state.modelId) return

        setTriggerDataUpdate(true);
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
                            <LimeDataUpdater state={state} updateState={updateState} triggerUpdate={triggerDataUpdate}/>
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
                {loading ? <SpinnerComponent/> : <ChartsDisplay state={state}/>}
            </Form>
        </Container>
    )
}

const SpinnerComponent = () => (
    <div className="text-center my-5">
        <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
        </Spinner>
    </div>
);

export const ChartsDisplay = ({state}: any) => (
    <Row className="mt-4">
        <Col md={6}>
            <PieChartComponent data={state.pieData}/>
        </Col>
        <Col md={6}>
            <ProbabilityTable data={state.dataTableProbs as any}/>
        </Col>
    </Row>
);
