import React, {useState, FormEvent, useEffect} from 'react';
import {Container, Form, Row, Col, Button, InputGroup, Card, Spinner} from 'react-bootstrap';
import PieChartComponent from '../Charts/PieChartComponent';
import ProbabilityTable from "../Charts/ProbabilityTable";
import LimeDataUpdater from '../util/LimeDataUpdater';
import useFetchModelDataset from "../datasets/useFetchModelDataset";
import {monitorStatus} from "../util/XAIUtility";
import {requestLimeValues} from "../../api";
import LollipopChart from "../Plots/LolipopChart";

import {LIMETabProps} from '../../types/LimeTypes';
import TooltipComponent from '../util/TooltipComponent/TooltipComponentProps';

interface LimeItem {
    value: number;
    feature: string | string[];
}

type LimeResults = LimeItem[];

export const LIMETab: React.FC<LIMETabProps> = ({state, updateState}) => {
    const [newState, setNewState] = useState({...state});
    const allowedValues = [1, 5, 10, 15, 20, 25, 30];
    const [triggerDataUpdate, setTriggerDataUpdate] = useState(false);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [maskedFeatures, setMaskedFeatures] = useState<any>([]);
    const [isLoading, setIsLoading] = useState(false);
    const {originalDataset, error} = useFetchModelDataset(false, newState.modelId, "train");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const target = event.target;
        const name = target.name;

        if (target instanceof HTMLSelectElement && target.multiple) {
            const selectedOptions = Array.from(target.selectedOptions, option => option.value);
            setSelectedFeatures(selectedOptions);
            setNewState((prevState: any) => ({...prevState, maskedFeatures: selectedOptions}));
        } else if (target instanceof HTMLInputElement && target.type === 'checkbox') {
            setNewState(prevState => ({
                ...prevState,
                [name]: target.checked,
            }));
        } else {
            setNewState(prevState => ({
                ...prevState,
                [name]: target.value,
            }));
        }
    };

    const handleMultiSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedFeatures(selectedOptions);
        setMaskedFeatures(selectedOptions);
    };
    const handleRunAnalysis = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsLoading(true);

        if (!newState.modelId) {
            setIsLoading(false);
            return;
        }

        const {sampleId, maxDisplay} = newState;
        const LIMEConfig: any = {modelId: newState.modelId, sampleId, maxDisplay};
        setTriggerDataUpdate(true);
        await monitorStatus("LIME", LIMEConfig).catch((e) => console.log(e));

        const limeVal = await requestLimeValues(newState.modelId, 1);
        setNewState((prevState: any) => ({...prevState, limeValues: limeVal}));
        setIsLoading(false);
    };

    useEffect(() => {
        if (originalDataset && originalDataset.resultData && originalDataset.resultData.length > 0) {
            setNewState((prevState: any) => ({...prevState, maskedFeatures: originalDataset.resultData}));
        }
    }, [originalDataset, newState.negativeChecked, newState.positiveChecked, isLoading]);

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
        const modelDetails: Array<Array<string | number>> = [
            [`Model ID`, newState.modelId],
            [`Sample ID`, newState.sampleId],
            [`Number of Samples`, newState.numberSamples],
            [`Max Display`, newState.maxDisplay]
        ];
        const modelDetailsCSV = createCSVContent('Model Details:', [], modelDetails);
        const separator = [[''], ['---'], ['']];

        const selectedFeaturesCSV = createCSVContent(
            'Masked Features:',
            ['count', 'Features'],
            selectedFeatures.map((feature, index) => [index.toString(), feature])
        );

        const limeValuesCSV = createCSVContent(
            'LIME Values:',
            ['Feature', 'Value'],
            toDisplayLime ? toDisplayLime.map((item: { feature: any; value: { toString: () => any; }; }) => [item.feature, item.value.toString()]) : []
        );

        const dataTableProbsCSV = createCSVContent(
            'Data Table Probabilities:',
            ['Key', 'Label', 'Probability'],
            newState.dataTableProbs.map((prob: { key: any; label: any; probability: { toString: () => any; }; }) => [prob.key, prob.label, prob.probability.toString()])
        );

        const pieDataCSV = createCSVContent(
            'Pie Chart Data:',
            ['Type', 'Value'],
            newState.pieData.map((data: { type: any; value: { toString: () => any; }; }) => [data.type, data.value.toString()])
        );

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

        downloadCSV(combinedCSV, `${newState.modelId}_analysis.csv`);
    };

    const filteredValuesLime = Array.isArray(newState.limeValues) && newState.limeValues.filter((d: { value: number; }) => {
        if (d.value > 0 && newState.positiveChecked) return true;
        if (d.value < 0 && newState.negativeChecked) return true;
        return false;
    });

    const filteredMaskedValuesLime = Array.isArray(filteredValuesLime) && filteredValuesLime.filter((obj: { feature: string | any[]; }) => !maskedFeatures.some((feature: string) => obj.feature.includes(feature)));

    const toDisplayLime = filteredMaskedValuesLime && filteredMaskedValuesLime.slice(0, newState.maxDisplay);

    const SpinnerComponent = () => (
        <div className="text-center my-5">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
    );

    return (
        <Container fluid>
            {/*<h2 className="my-4 text-center">Understand AI Decisions with LIME</h2>*/}
            <Form onSubmit={handleRunAnalysis}>
                <Row className="g-4">
                    <Col md={8}>
                        <Card className="mb-4">
                            <LimeDataUpdater state={newState} updateState={setNewState} triggerUpdate={triggerDataUpdate}/>
                            <Card.Header as="h5" className="text-primary">LIME Configuration</Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sample ID</Form.Label>
                                    <TooltipComponent message="Unique identifier for the sample.">
                                        <i className="bi bi-info-circle ms-2" style={{cursor: 'pointer'}}></i>
                                    </TooltipComponent>
                                    <Form.Control type="number" name="sampleId" placeholder="Enter Sample ID" value={newState.sampleId} onChange={handleInputChange}/>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="featuresToMask">Feature(s) to Hide</Form.Label>
                                    <TooltipComponent message="Select the details you want to examine to see their impact on the AI's decision.">
                                        <i className="bi bi-info-circle ms-2" style={{cursor: 'pointer'}}></i>
                                    </TooltipComponent>
                                    <InputGroup>
                                        <Form.Select multiple name="featuresToMask" className="form-select" onChange={handleMultiSelectChange} aria-label="Features to Mask">
                                            <option value="%tcp_protocol">%tcp_protocol</option>
                                            {newState.maskedFeatures.length > 0 && Object.keys(newState.maskedFeatures[0]).sort().map((key, index) => (
                                                <option value={key} key={key}>{key}</option>
                                            ))}
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
                    <Col md={4}>
                        <Card className="mb-4">
                            <Card.Header as="h5" className="text-primary">Display Options</Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="maxValue">How many details to show? <span className="ms-2 badge bg-secondary">{newState.maxDisplay}</span></Form.Label>
                                    <Form.Range name="maxDisplay" value={newState.maxDisplay} onChange={handleInputChange} min="5" max="30" step="1"/>
                                </Form.Group>
                                <div className="p-3 mb-3 border rounded">
                                    <Form.Group className="mb-2">
                                        <div className="d-flex align-items-center">
                                            <Form.Check type="checkbox" id="positiveCheck" name="positiveChecked" className="me-2" checked={newState.positiveChecked} onChange={handleInputChange}/>
                                            <Form.Label htmlFor="positiveCheck" className="mb-0">Positive</Form.Label>
                                        </div>
                                    </Form.Group>
                                    <Form.Group>
                                        <Form.Check type="checkbox" id="negativeCheck" name="negativeChecked" label="Negative" checked={newState.negativeChecked} onChange={handleInputChange}/>
                                    </Form.Group>
                                </div>
                                <Button variant="primary" type="submit" className="mt-3 w-100" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                            Loading...
                                        </>
                                    ) : (
                                        "Explain the AI's Decision"
                                    )}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col md={12}>
                        {/*<LimeChartsDisplay state={newState} loading={isLoading}/>*/}
                        <Card>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        {isLoading ? <SpinnerComponent/> : <LollipopChart data={toDisplayLime as any}/>}
                                    </Col>
                                    {/*<Col md={6}>*/}
                                    {/*    <PieChartComponent data={newState.pieData}/>*/}
                                    {/*</Col>*/}
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Button variant="primary" onClick={handleExportToCSV} className="w-100 mt-3">Download Explanations</Button>
            </Form>
        </Container>

    );
}

export const LimeChartsDisplay = ({state, loading}: any) => (
    <Card>
        <Card.Body>
            <Row>
                <Col md={12}>
                    <ProbabilityTable data={state.dataTableProbs}/>
                </Col>
            </Row>
        </Card.Body>
    </Card>
);
