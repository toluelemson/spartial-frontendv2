import React, {useState, FormEvent, useEffect} from 'react';
import {Container, Form, Row, Col, Button, InputGroup, Card, Spinner} from 'react-bootstrap';
import PieChartComponent from '../Charts/PieChartComponent';
import ProbabilityTable from "../Charts/ProbabilityTable";
import LimeDataUpdater from '../util/LimeDataUpdater';
import * as api from '../../api';
import useFetchModelDataset from "../datasets/useFetchModelDataset";
import {monitorStatus} from "../util/XAIUtility";
import {requestLimeValues} from "../../api";
import LollipopChart from "../Plots/LolipopChart";

import {LIMETabProps} from '../../types/LimeTypes';

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
    const [loading, setLoading] = useState(false);
    const {originalDataset, error} = useFetchModelDataset(false, newState.modelId, "train");

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = event.target;
        const name = target.name;

        console.log(target.value)

        if (target instanceof HTMLSelectElement && target.multiple) {
            const selectedOptions = Array.from(target.selectedOptions, option => option.value);
            setSelectedFeatures(selectedOptions);
            setNewState((prevState: any) => ({...prevState, maskedFeatures: selectedOptions}))
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
        //setNewState((prevState: any) => ({...prevState, maskedFeatures: selectedFeatures}))
        setMaskedFeatures(selectedOptions)
    };
    const handleRunAnalysis = async (event: FormEvent<HTMLFormElement>) => {

        event.preventDefault();
        setLoading(true)

        if (!newState.modelId) {
            setLoading(false);
            return;
        }

        const {sampleId, maxDisplay} = newState
        const LIMEConfig: any = {modelId: newState.modelId, sampleId, maxDisplay}
        setTriggerDataUpdate(true);
        await monitorStatus("LIME", LIMEConfig).catch((e) => console.log(e))

        const limeVal = await requestLimeValues(newState.modelId, 1)
        setNewState((prevState: any) => ({...prevState, limeValues: limeVal}));
        setLoading(false);
    }

    // function filterAndPrepareLimeData(
    //     limeResults: Array<{ feature: string; value: any }> | undefined,
    //     positiveChecked: boolean,
    //     negativeChecked: boolean,
    //     maskedFeatures: string[],
    //     maxDisplay: number
    // ): LimeResults {
    //     if (!Array.isArray(limeResults)) {
    //         return [];
    //     }
    //
    //     const filteredValuesLime = limeResults.filter(({value}) => {
    //         return (value > 0 && positiveChecked) || (value < 0 && negativeChecked);
    //     });
    //
    //     const filteredMaskedValuesLime = filteredValuesLime.filter(({feature}) => {
    //         if (Array.isArray(feature)) {
    //             return feature.every(featureElement => !maskedFeatures.includes(featureElement));
    //         } else {
    //             return !maskedFeatures.includes(feature);
    //         }
    //     });
    //
    //     return filteredMaskedValuesLime.slice(0, maxDisplay);
    // }


    useEffect(() => {

        if (originalDataset && originalDataset.resultData && originalDataset.resultData.length > 0) {
            setNewState((prevState: any) => ({...prevState, maskedFeatures: originalDataset.resultData}));
        }

    }, [originalDataset, newState.negativeChecked, newState.positiveChecked]);

    //
    // const limeResults: LimeResults = filterAndPrepareLimeData(newState.limeValues, newState.positiveChecked, newState.negativeChecked, newState.maskedFeatures, maxDisplay);
    //
    //
    // console.log(limeResults)
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
            [`Model ID`, newState.modelId],
            [`Sample ID`, newState.sampleId],
            [`Number of Samples`, newState.numberSamples],
            [`Max Display`, newState.maxDisplay]
        ];
        const modelDetailsCSV = createCSVContent('Model Details:', [], modelDetails);

        // Separator
        const separator = [[''], ['---'], ['']];

        // Selected Features
        const selectedFeaturesCSV = createCSVContent(
            'Masked Features:',
            ['count', 'Features'],
            selectedFeatures.map((feature, index) => [index.toString(), feature])
        );

        // LIME Values
        const limeValuesCSV = createCSVContent(
            'LIME Values:',
            ['Feature', 'Value'],
            toDisplayLime ? toDisplayLime.map((item: {
                feature: any;
                value: { toString: () => any; };
            }) => [item.feature, item.value.toString()]) : []
        );


        // Data Table Probabilities
        const dataTableProbsCSV = createCSVContent(
            'Data Table Probabilities:',
            ['Key', 'Label', 'Probability'],
            newState.dataTableProbs.map((prob: {
                key: any;
                label: any;
                probability: { toString: () => any; };
            }) => [prob.key, prob.label, prob.probability.toString()])
        );

        // Pie Chart Data
        const pieDataCSV = createCSVContent(
            'Pie Chart Data:',
            ['Type', 'Value'],
            newState.pieData.map((data: {
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
        downloadCSV(combinedCSV, `${newState.modelId}_analysis.csv`);
    };


    const filteredValuesLime = Array.isArray(newState.limeValues) && newState.limeValues.filter((d: {
        value: number;
    }) => {
        if (d.value > 0 && newState.positiveChecked) return true;
        if (d.value < 0 && newState.negativeChecked) return true;
        return false;
    });


    const filteredMaskedValuesLime = Array.isArray(filteredValuesLime) && filteredValuesLime.filter((obj: {
        feature: string | any[];
    }) => !maskedFeatures.some((feature: string) => obj.feature.includes(feature)));

    const toDisplayLime = filteredMaskedValuesLime && filteredMaskedValuesLime.slice(0, newState.maxDisplay)


    return (

        <Container>
            <h2 className="my-4 text-center">Explainable AI with Local Interpretable Model-agnostic Explanations
                (LIME)</h2>

            <Form onSubmit={handleRunAnalysis}>
                <Row>
                    <Col md={6}>
                        <Card className="mb-4">
                            <LimeDataUpdater state={newState} updateState={setNewState}
                                             triggerUpdate={triggerDataUpdate}/>
                            <Card.Header as="h5" className="text-primary">
                                Analysis Settings
                            </Card.Header>
                            <Card.Body>

                                <Form.Group className="mb-3">
                                    <Form.Label>Sample ID</Form.Label>
                                    <Form.Control type="number" name="sampleId" placeholder="Enter Sample ID"
                                                  value={newState.sampleId} onChange={handleInputChange}/>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="featuresToMask">Feature(s) to Mask</Form.Label>
                                    <InputGroup>
                                        <Form.Select
                                            multiple={true}
                                            name="featuresToMask"
                                            className="form-select"
                                            onChange={handleMultiSelectChange}
                                        >
                                            <option value="%tcp_protocol">%tcp_protocol</option>
                                            {newState.maskedFeatures.length > 0 && Object.keys(newState.maskedFeatures[0]).sort()
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
                            <Card.Header as="h5" className="text-primary">
                                Display Options
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="maxValue">
                                        Features to display:
                                        <span className="ms-2 badge bg-secondary">
                                    {newState.maxDisplay}
                                </span>
                                    </Form.Label>
                                    <Form.Range
                                        name="maxDisplay"
                                        value={newState.maxDisplay}
                                        onChange={handleInputChange}
                                        min="5"
                                        max="30"
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
                                                checked={newState.positiveChecked}
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
                                            checked={newState.negativeChecked}
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
                        <LimeChartsDisplay state={newState} loading={loading}/>

                        <Card>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        {loading ? <SpinnerComponent/> : <LollipopChart data={toDisplayLime as any}/>}
                                    </Col>

                                    <Col md={6}>
                                        <PieChartComponent data={newState.pieData}/>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
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

            {/*<Row>*/}
            {/*    /!*<Col md={6}>*!/*/}
            {/*    /!*    {loading ? <SpinnerComponent/> : <LollipopChart data={state.limeValues}/>}*!/*/}
            {/*    /!*</Col>*!/*/}

            {/*    /!*<Col md={6}>*!/*/}
            {/*    /!*    <PieChartComponent data={state.pieData}/>*!/*/}
            {/*    /!*</Col>*!/*/}
            {/*</Row>*/}
        </Card.Body>
    </Card>
);