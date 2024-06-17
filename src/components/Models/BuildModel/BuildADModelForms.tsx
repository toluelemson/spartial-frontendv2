import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
    Form,
    Button,
    Container,
    Row,
    InputGroup,
    Accordion,
    Card,
    Col,
} from 'react-bootstrap';
import { useSpatialContext } from '../../../context/context';
import { requestBuildADModel } from "../../../api";
import { BuildStatusType, TParamType } from "../../../types/types";
import useCheckBuildStatus from "../../util/useCheckBuildStatus";

interface FormState {
    maliciousDataset: string | null;
    normalDataset: string | null;
    featureList: string;
    trainingRatio: number;
    epochsCNN: number;
    epochsSAE: number;
    batchSizeCNN: number;
    batchSizeSAE: number;
}


const BuildADModelForm: React.FC = () => {
    const { reportState } = useSpatialContext();
    const [{buildStatusStatex, updateBuildStatus}] = useCheckBuildStatus();

    const initialFormData: FormState = useMemo(() => ({
        maliciousDataset: null,
        normalDataset: null,
        featureList: 'Raw Features',
        trainingRatio: 0.7,
        epochsCNN: 5,
        epochsSAE: 3,
        batchSizeCNN: 16,
        batchSizeSAE: 32,
    }), []);


    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [options, setOptions] = useState<any>(reportState || null);
    const [isFormValid, setIsFormValid] = useState(false);


    const trainingParameters = useMemo(() => [
        {
            label: 'Number of Epochs (CNN):',
            name: 'nb_epoch_cnn',
            value: formData.epochsCNN.toString(),
        },
        {
            label: 'Number of Epochs (SAE):',
            name: 'b_epoch_sae',
            value: formData.epochsSAE.toString(),
        },
        {
            label: 'Batch Size (CNN):',
            name: 'batch_size_cnnN',
            value: formData.batchSizeCNN.toString(),
        },
        {
            label: 'Batch Size (SAE):',
            name: 'batch_size_sae',
            value: formData.batchSizeSAE.toString(),
        },
    ], [formData]);

    useEffect(() => {
        if (!reportState) {
            console.error('API response does not contain an array of options.');
        }

        const isAnyFieldEmpty = Object.values(formData).some((value) => value === null);
        setIsFormValid(!isAnyFieldEmpty);
        setOptions(reportState);
    }, [reportState, formData])


    const handleBuildADModelSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isFormValid) {
            alert('Please fill out all required fields.');
            return;
        }

        const TParam = trainingParameters.reduce<TParamType>((acc, param) => {
            acc[param.name] = param.value;
            return acc;
        }, {});

        const datasets = [
            {datasetId: formData.maliciousDataset, isAttack: true},
            {datasetId: formData.normalDataset, isAttack: false},
        ];
        try {
            const response : BuildStatusType | null = await requestBuildADModel(datasets, formData.trainingRatio, TParam);
            if (response && !buildStatusStatex?.isRunning) {
                updateBuildStatus()
            } else {
                console.log('Response is null or undefined');
            }
        } catch (error) {
            alert("Failed to build the model. Please try again.");
            console.error(error);
        }
    }, [isFormValid, formData, trainingParameters]);

    const handleInputChange = (
        event:  React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({ ...prevFormData, [name]: value }));
    };

    const inputGroups = useMemo(() => [
        {
            label: 'Malicious Dataset:',
            name: 'maliciousDataset',
            value: formData.maliciousDataset || '',
            placeholder: 'Select malicious MMT reports...',
        },
        {
            label: 'Normal Dataset:',
            name: 'normalDataset',
            value: formData.normalDataset || '',
            placeholder: 'Select normal MMT reports...',
        },
    ], [formData]);

    return (
        <Container fluid>
            <Row className="contentContainer justify-content-center">
                <Col md={10} lg={8}>
                    <Form onSubmit={handleBuildADModelSubmit}>
                        <h2>Build Models</h2>
                        <p>Build a new AI model for anomaly detection</p>
                        {inputGroups.map((group, index) => (
                            <InputGroup key={index} className="mb-3">
                                <InputGroup.Text>{group.label}</InputGroup.Text>
                                <Form.Select
                                    name={group.name}
                                    value={group.value}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value=""></option>
                                    {options && options.reports && Array.isArray(options.reports) ? (
                                        options.reports.map((option: string) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="">No options available</option>
                                    )}
                                </Form.Select>
                                <Button variant="outline-secondary">Upload pcaps only</Button>
                            </InputGroup>
                        ))}
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Feature List:</InputGroup.Text>
                            <Form.Select
                                name="featureList"
                                value={formData.featureList}
                                onChange={handleInputChange}
                            >
                                <option>Raw Features</option>
                            </Form.Select>
                        </InputGroup>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Training Ratio:</InputGroup.Text>
                            <Form.Control
                                type="number"
                                step="0.1"
                                min="0"
                                max="1"
                                name="trainingRatio"
                                value={formData.trainingRatio.toString()}
                                onChange={(event) => handleInputChange(event)}
                            />
                        </InputGroup>
                        <Accordion defaultActiveKey="0">
                            <Card>
                                <Accordion.Collapse eventKey="0">
                                    <Card.Body>
                                        {trainingParameters.map((param, index) => (
                                            <Form.Group key={index} className="mb-3">
                                                <Form.Label>{param.label}</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    name={param.name}
                                                    value={param.value}
                                                    onChange={(event) => handleInputChange(event)}
                                                />
                                            </Form.Group>
                                        ))}
                                    </Card.Body>
                                </Accordion.Collapse>
                            </Card>
                        </Accordion>
                        <Button
                            variant="primary mt-3"
                            type="submit"
                            disabled={!isFormValid}
                        >
                            Build Model
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default BuildADModelForm;
