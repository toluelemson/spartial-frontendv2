import React, {useState, FormEvent, useEffect} from 'react';
import {Container, Form, Row, Col, Button, InputGroup, Card, Spinner} from 'react-bootstrap';
import PieChartComponent from '../Charts/PieChartComponent';
import ProbabilityTable from "../Charts/ProbabilityTable";
import LimeDataUpdater from '../util/LimeDataUpdater';
import * as api from '../../api';
import useFetchModelDataset from "../datasets/useFetchModelDataset";
import {runLimeAndMonitorStatus} from "../util/LimeUtility";
import {requestLimeValues} from "../../api";
import LollipopChart from "../Plots/LolipopChart";

import {LIMETabProps} from '../../types/LimeTypes';


export const LIMETab: React.FC<LIMETabProps> = ({state, updateState}) => {

    const allowedValues = [1, 5, 10, 15, 20, 25, 30];
    const [triggerDataUpdate, setTriggerDataUpdate] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const {data, error} = useFetchModelDataset(state.modelId, api);

    useEffect(() => {
        if (data && data.resultData && data.resultData.length > 0) {
            console.log(data);
            updateState((prevState: any) => ({...prevState, maskedFeatures: data.resultData}));
        }
    }, [data, selectedFeatures, updateState]);


    // if (loading) return <div>Loading...</div>;
    // if (error) return <div>Error: {error.message}</div>;


    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

        if (target instanceof HTMLSelectElement && target.multiple) {
            // Handle multi-select
            const selectedOptions = Array.from(target.selectedOptions, option => option.value);
            setSelectedFeatures(selectedOptions);
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
    const handleRunAnalysis = async (event: FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        setLoading(true)

        if (!state.modelId) {
            setLoading(false);
            return;
        }

        setTriggerDataUpdate(true);
        await runLimeAndMonitorStatus(state.modelId, state.sampleId, state.featuresToDisplay).catch((e) => console.log(e))

        const limeVal = await requestLimeValues(state.modelId, 1)
        updateState((prevState: any) => ({...prevState, limeValues: limeVal}));

        setLoading(false);
    }

    const arrayToCSV = (array: (string | string[][])[]): string => array.join('\n');

    const downloadCSV = (csvContent: string, filename: string): void => {
        const blob = new Blob([csvContent], {type: 'text/csv;charset=utf-8;'});
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const createCSVContent = (title: string, headers: string[], data: Array<Array<string | number | undefined>>): string => {
        const headerRow = headers.join(',');
        const dataRows = data.map(row => row.join(','));
        return [title, headerRow, ...dataRows].join('\n');
    };

    const handleExportToCSV = (): void => {
        // Model Details
        const modelDetails: Array<Array<string | number>> = [
            [`Model ID`, state.modelId],
            [`Sample ID`, state.sampleId],
            [`Number of Samples`, state.numberSamples],
            [`Max Display`, state.maxDisplay]
        ];
        const modelDetailsCSV = createCSVContent('Model Details:', [], modelDetails);

        // Separator
        const separator = [[''], ['---'], ['']];

        // Selected Features
        const selectedFeaturesCSV = createCSVContent(
            'Selected Features:',
            ['count', 'Features'],
            selectedFeatures.map((feature, index) => [index.toString(), feature])
        );

        // LIME Values
        const limeValuesCSV = createCSVContent(
            'LIME Values:',
            ['Feature', 'Value'],
            state.limeValues ? state.limeValues.map((item: {
                feature: any;
                value: { toString: () => any; };
            }) => [item.feature, item.value.toString()]) : []
        );

        // Data Table Probabilities
        const dataTableProbsCSV = createCSVContent(
            'Data Table Probabilities:',
            ['Key', 'Label', 'Probability'],
            state.dataTableProbs.map((prob: {
                key: any;
                label: any;
                probability: { toString: () => any; };
            }) => [prob.key, prob.label, prob.probability.toString()])
        );

        // Pie Chart Data
        const pieDataCSV = createCSVContent(
            'Pie Chart Data:',
            ['Type', 'Value'],
            state.pieData.map((data: {
                type: any;
                value: { toString: () => any; };
            }) => [data.type, data.value.toString()])
        );

        // Combining all sections with separators
        const combinedCSV = arrayToCSV([
            modelDetailsCSV,
            separator,
            selectedFeaturesCSV,
            separator,
            limeValuesCSV,
            separator,
            dataTableProbsCSV,
            separator,
            pieDataCSV
        ]);

        // Download CSV
        downloadCSV(combinedCSV, `${state.modelId}_analysis.csv`);
    };


    return (

        <Container>
            <h2 className="my-4 text-center">Explainable AI with Local Interpretable Model-agnostic Explanations
                (LIME)</h2>

            <Form onSubmit={handleRunAnalysis}>
                <Row>
                    <Col md={6}>
                        <Card className="mb-4">
                            <LimeDataUpdater state={state} updateState={updateState} triggerUpdate={triggerDataUpdate}/>
                            <Card.Body>
                                <h3 className="mb-4">Analysis Settings</h3>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sample ID</Form.Label>
                                    <Form.Control type="number" name="sampleId" placeholder="Enter Sample ID"
                                                  value={state.sampleId} onChange={handleInputChange}/>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="featuresToMask">Feature(s) to Mask</Form.Label>
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
                                            {selectedFeatures.map((feature, index) => (
                                                <span key={index} className="badge bg-secondary me-2">{feature}</span>
                                            ))}
                                        </div>
                                    </div>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col md={6}>
                        <Card className="mb-4">
                            <Card.Body>
                                <h3 className="mb-4">Display Options</h3>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="featuresToDisplay">
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
                                <div className="p-3 mb-3 border rounded">
                                    <Form.Group className="mb-2">
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
                                    <Form.Group>
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
                                <Button variant="primary" type="submit" className="mt-3 w-100">Run Analysis</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>


                    <Col md={9}>
                        <LimeChartsDisplay state={state} loading={loading}/>
                    </Col>


                    <Col md={3} className="d-flex align-items-center">
                        <Button variant="primary" onClick={handleExportToCSV} className="w-100 mt-3">Save Data to
                            CSV</Button>
                    </Col>
                </Row>


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

export const LimeChartsDisplay = ({state}: any, {loading}: any) => (
    <Card>
        <Card.Body>
            <Row>
                <Col md={12}>
                    <ProbabilityTable data={state.dataTableProbs}/>
                </Col>
            </Row>

            <Row>
                <Col md={6}>
                    {loading ? <SpinnerComponent/> : <LollipopChart data={state.limeValues}/>}
                </Col>

                <Col md={6}>
                    <PieChartComponent data={state.pieData}/>
                </Col>
            </Row>
        </Card.Body>
    </Card>
);
