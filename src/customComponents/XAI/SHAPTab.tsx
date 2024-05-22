import React, {FormEvent, useEffect, useState} from 'react';
import {Container, Row, Col, Form, Button, InputGroup, Table, Card, Spinner} from 'react-bootstrap';
import {LIMETabProps} from '../../types/LimeTypes';
import {fetchSHAPValues, requestRunShap} from "../../api";
import FeatureImportanceBarChart from "../Plots/FeatureImportanceBarChart";
import useFetchModelDataset from "../datasets/useFetchDataset";
import {monitorStatus} from '../util/XAIUtility';

const ShapTab: React.FC<LIMETabProps> = ({state, updateState}) => {

    const [newState, setNewState] = useState({...state});

    const allowedValues = [1, 5, 10, 15, 20, 25, 30];
    type ShapValue = {
        importance_value: number;
    };

    type ShapItem = {
        feature: string;
        importance_value: number;
    };

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


    const [backgroundSamples, setBackgroundSamples] = useState(20);
    const [explainedSamples, setExplainedSamples] = useState(10);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [shapResults, setShapResults] = useState<any | null>([]);
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<any | null>(null)
    const [maskedFeatures, setMaskedFeatures] = useState<any>([]);
    const {originalDataset} = useFetchModelDataset(newState.modelId, "train");


    useEffect(() => {

        if (originalDataset && originalDataset.resultData && originalDataset.resultData.length > 0) {
            setNewState((prevState: any) => ({...prevState, maskedFeatures: originalDataset.resultData}));
        }
        console.log(`Background Samples: ${backgroundSamples}, Explained Samples: ${explainedSamples}`);

    }, [backgroundSamples, originalDataset, explainedSamples, newState.negativeChecked, newState.positiveChecked]);


    const createCSVContent = (title: string, headers: string[], data: Array<Array<string | number | undefined>>): string => {
        const headerRow = headers.join(',');
        const dataRows = data.map(row => row.join(','));
        return [title, headerRow, ...dataRows].join('\n');
    };


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


    const handleExportToCSV = (): void => {
        // Model Details
        const modelDetails: Array<Array<string | number>> = [
            [`Model ID`, newState.modelId],
            [`Explained Samples`, explainedSamples],
            [`Background Samples`, backgroundSamples],
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
        const shapValuesCSV = createCSVContent(
            'SHAP Values:',
            ['Feature', 'Importance Value'],
            toDisplayShap ? toDisplayShap.map((item: {
                feature: any;
                importance_value
                    : { toString: () => any; };
            }) => [item.feature, item.importance_value]) : []
        );

        console.log(shapResults)


        // // Data Table Probabilities
        // const dataTableProbsCSV = createCSVContent(
        //     'Data Table Probabilities:',
        //     ['Key', 'Label', 'Probability'],
        //     newState.dataTableProbs.map((prob: {
        //         key: any;
        //         label: any;
        //         probability: { toString: () => any; };
        //     }) => [prob.key, prob.label, prob.probability.toString()])
        // );

        // // Pie Chart Data
        // const pieDataCSV = createCSVContent(
        //     'Pie Chart Data:',
        //     ['Type', 'Value'],
        //     newState.pieData.map((data: {
        //         type: any;
        //         value: { toString: () => any; };
        //     }) => [data.type, data.value.toString()])
        // );

        // Combining all sections with separators
        const combinedCSV = arrayToCSV([
            modelDetailsCSV,
            separator,
            selectedFeaturesCSV,
            separator,
            shapValuesCSV,
            separator,
            // dataTableProbsCSV,
            separator,
        ]);

        // Download CSV
        downloadCSV(combinedCSV, `${newState.modelId}_analysis.csv`);
    };
    const handleShapExplain = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        setIsLoading(true);


        try {
            const {maxDisplay} = newState
            const method: string = 'SHAP'
            const SHAPConfig: any = {modelId: "ac-xgboost", backgroundSamples, explainedSamples, maxDisplay}
            const res: any = await monitorStatus(method, SHAPConfig).catch((e: any) => console.log(e))


            const shapValues = await fetchSHAPValues("ac-xgboost", 0);
            console.log(shapValues)
            setShapResults(shapValues);
        } catch (error) {
            setError('Failed to fetch SHAP values. Please try again.');
        } finally {
            setIsLoading(false);
        }

    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {

        const target = event.target;
        const name = target.name;
        setNewState(prevState => ({
            ...prevState,
            [name]: target.checked,
        }));

    };

    const handleMultiSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOptions = Array.from(event.target.selectedOptions, option => option.value);
        setSelectedFeatures(selectedOptions);
        setMaskedFeatures(selectedOptions)
    };

    const filteredValuesShap: ShapItem[] = (shapResults || []).filter(({importance_value}: ShapItem) =>
        (importance_value > 0 && newState.positiveChecked) || (importance_value < 0 && newState.negativeChecked)
    );


    const filteredMaskedShap: ShapItem[] = filteredValuesShap.filter(obj =>
        Array.isArray(obj.feature)
            ? obj.feature.every(featureElement => !maskedFeatures.includes(featureElement))
            : !maskedFeatures.includes(obj.feature)
    );

    const toDisplayShap = filteredMaskedShap.slice(0, newState.maxDisplay)

    const topFeatures = toDisplayShap.map((item: ShapItem, index: number) => ({
        key: index + 1,
        name: item.feature.toString(),
        // description: features[item.feature]?.description || 'N/A',
    }));


    return (
        <Container fluid="lg"> <Row className="g-4"> <Col lg={8}> <Card className="shadow-sm mb-4"> <Card.Header as="h5"
                                                                                                                 className="text-primary"> Explainable
            AI with SHapley Additive exPlanations
            (SHAP) </Card.Header> {/*<h2 className="my-4 text-center">Explainable AI with SHapley Additive exPlanations (SHAP)</h2>*/}
            <Card.Body className="p-4"> <Card.Text> Configure SHAP parameters and run the analysis to explain the
                model's predictions. </Card.Text> <Form onSubmit={handleShapExplain}> <Form.Group as={Row}
                                                                                                  controlId="backgroundSamples">
                <Form.Label column sm={2}>Background samples:</Form.Label> <Col sm={10}> <Form.Control type="number"
                                                                                                       value={backgroundSamples}
                                                                                                       onChange={(e) => setBackgroundSamples(Number(e.target.value))}/>
            </Col> </Form.Group> <Form.Group as={Row} controlId="explainedSamples"> <Form.Label column sm={2}>Explained
                samples:</Form.Label> <Col sm={10}> <Form.Control type="number" value={explainedSamples}
                                                                  onChange={(e) => setExplainedSamples(Number(e.target.value))}/>
            </Col> </Form.Group> <Form.Group className="mb-3"> <Form.Label htmlFor="maxValue"> Features to
                display: <span className="ms-2 badge bg-secondary">{newState.maxDisplay}</span> </Form.Label>
                <Form.Range name="maxDisplay" value={newState.maxDisplay} onChange={handleInputChange} min="2" max="30"
                            step="1" className="form-range custom-range-slider"/> </Form.Group>
                <div className="p-3 mb-3 border rounded"><Form.Group className="mb-2">
                    <div className="d-flex align-items-center"><Form.Check type="checkbox" id="positiveCheck"
                                                                           name="positiveChecked" className="me-2"
                                                                           label="Positive"
                                                                           checked={newState.positiveChecked}
                                                                           onChange={handleCheckboxChange}/></div>
                </Form.Group> <Form.Group> <Form.Check type="checkbox" id="negativeCheck" name="negativeChecked"
                                                       label="Negative" checked={newState.negativeChecked}
                                                       onChange={handleCheckboxChange}/> </Form.Group></div>
                <Form.Group className="mb-3"> <Form.Label htmlFor="featuresToMask">Feature(s) to Mask</Form.Label>
                    <InputGroup> <Form.Select multiple={true} name="featuresToMask" className="form-select"
                                              onChange={handleMultiSelectChange}>
                        <option value="%tcp_protocol">%tcp_protocol</option>
                        {newState.maskedFeatures.length > 0 && Object.keys(newState.maskedFeatures[0]).sort().map((key, index) => (
                            <option value={key} key={index}>{key}</option>))} </Form.Select> </InputGroup>
                    <div className="mt-3"><strong>Selected Features:</strong>
                        <div> {selectedFeatures.map((feature, index) => (
                            <span key={index} className="badge bg-secondary me-2">{feature}</span>))} </div>
                    </div>
                </Form.Group> {/*<Button variant="primary" type="submit" className="mt-3 w-100">SHAP Explain</Button>*/}
                <Button variant="primary" type="submit" className="mt-3 w-100" disabled={isLoading}> {isLoading ? (<>
                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"
                             className="me-2"/> Loading... </>) : ("Run Analysis")} </Button> </Form> </Card.Body>
        </Card> {shapResults ? (<div><FeatureImportanceBarChart data={toDisplayShap}/></div>) : (
            <p>No SHAP analysis results to display. Please submit parameters above.</p>)} </Col> <Col lg={4}> <Card
            className="shadow-sm"> <Card.Header as="h5" className="text-primary"> Top Features </Card.Header>
            <Card.Body><Table striped bordered hover>
                <thead>
                <tr>
                    <th>#</th>
                    <th>Feature Name</th>
                </tr>
                </thead>
                <tbody> {topFeatures.map((feature) => (<tr key={feature.key}>
                    <td>{feature.key}</td>
                    <td>{feature.name}</td>
                    {/* <td>{feature.description || 'N/A'}</td> */} </tr>))} </tbody>
            </Table> </Card.Body> </Card> </Col> </Row> </Container>);


};

export default ShapTab;