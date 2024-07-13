import React, {ChangeEvent, ChangeEventHandler, useEffect, useRef, useState} from 'react';
import {useNavigate} from "react-router-dom";
import {Button, Container, Form, Row, Col, Card, Badge, Spinner} from "react-bootstrap";
import {countLabels, extractLabelsFromDataset, loadBuildConfig} from "../util/utility";
import {
    requestAttackStatus, requestAttacksDatasets,
    requestPerformAttack, requestRetrainModelAC, requestRetrainStatusAC
} from '../../api';
import RandomSampleChart from '../Datasets/RslChart';
import AttackBarChart from '../Datasets/AttackBarChart';
import TooltipComponent from '../util/TooltipComponent/TooltipComponentProps';
import {RetrainStatus, TODO} from '../../types/types';
import fetchDataset from '../util/fetchDataset';

interface FormData {
    modelId: string;
    poisoningRate: number;
    attackType: string;
    sourceClass: number;
    targetClass: number;
}

interface DatasetLabelColumn {
    datasetType: string;
    classLabels: string;
    count: number;
    value: number;
}

const AdversarialTab: React.FC<any> = ({state}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        modelId: state.modelId,
        poisoningRate: 0,
        attackType: '',
        sourceClass: 0,
        targetClass: 0,
    });

    const [formErrors, setFormErrors] = useState<{ poisoningRate: string }>({poisoningRate: ''});
    const [attackStatus, setAttackStatus] = useState({isLoading: false, isRunning: false, error: ''});
    const [originalDatasetLabels, setOriginalDatasetLabels] = useState<string[]>([]);
    const [combinedDatasetLabels, setCombinedDatasetLabels] = useState<DatasetLabelColumn[]>([]);
    const [poisonedDataset, setPoisonedDataset] = useState<any>(null);
    const [normalDataset, setNormalDataset] = useState<any>(null);
    const [retrainId, setRetrainId] = useState<any>(null);
    const [attackDatasets, setAttackDatasets] = useState<TODO[]>([]);

    useEffect(() => {
        if (retrainId && !attackStatus.isRunning && !attackStatus.isLoading) {
            pollRetrainStatus();
            navigate(`/models/all/ac`);
        }
    }, [retrainId, attackStatus.isLoading, attackStatus.isRunning]);

    useEffect(() => {
        const fetchRequestDatasets = async () => {
            try {
                const attackDatasets = await requestAttacksDatasets(formData.modelId);
                setAttackDatasets(attackDatasets);
            } catch (error) {
                console.error("Failed to fetch models:", error);
            }
        };
        fetchRequestDatasets();
    }, [formData.attackType, formData.modelId]);

    const retrain = async () => {
        const testingDataset = "Test_samples.csv";
        const trainingDataset = formData.attackType === 'rsl' ? 'rsl_poisoned_dataset.csv' : 'tlf_poisoned_dataset.csv';

        const buildConfigResult = await loadBuildConfig(formData.modelId);
        const modelType = buildConfigResult.find(config => config.parameter === "modelType")?.value;

        if (modelType) {
            await requestRetrainModelAC(formData.modelId, trainingDataset, testingDataset, modelType);
            pollRetrainStatus();
        }
    };

    const pollRetrainStatus = async () => {
        try {
            const statusRes = await requestRetrainStatusAC() as RetrainStatus;
            handleRetrainStatus(statusRes);
        } catch (error) {
            console.error("Failed to fetch retrain status:", error);
        }
    };

    const handleRetrainStatus = (statusRes: RetrainStatus) => {
        const retrainId = statusRes.retrainStatus.lastRetrainId;
        setRetrainId(retrainId);
    };

    const fetchPoisonedDataset = async () => {
        const {poisonedDataset} = await fetchDataset(true, formData.modelId, formData.attackType);
        const {originalDataset} = await fetchDataset(false, formData.modelId, "");
        setPoisonedDataset(poisonedDataset);
        setNormalDataset(originalDataset);
    };

    const fetchAttackStatus = async () => {
        setAttackStatus({isLoading: true, isRunning: true, error: ''});

        let retryCount = 0;
        const maxRetries = 20;

        const intervalId = setInterval(async () => {
            retryCount += 1;

            try {
                const statusRes = await requestAttackStatus();
                if (!statusRes.isRunning || retryCount >= maxRetries) {
                    clearInterval(intervalId);
                    setAttackStatus({
                        isLoading: false,
                        isRunning: false,
                        error: retryCount >= maxRetries ? 'Performing Attack timed out' : ''
                    });
                }
            } catch (statusError) {
                clearInterval(intervalId);
                setAttackStatus({isLoading: false, isRunning: false, error: 'Failed to check attack status'});
            }
        }, 3000);
    };
    const loadLabels = async () => {
        if (!formData.modelId) return;

        const labelsFromOriginalDataset = normalDataset ? await extractLabelsFromDataset({
            modelId: formData.modelId,
            datasets: normalDataset?.resultData,
        }) : [];

        setOriginalDatasetLabels(labelsFromOriginalDataset);

        await fetchPoisonedDataset();

        if (poisonedDataset) {
            const labelsFromPoisonedDataset = await extractLabelsFromDataset({
                modelId: formData.modelId,
                datasets: poisonedDataset?.resultData,
            });

            const originalDataCounts = countLabels(normalDataset?.resultData || []);
            const poisonedDataCounts = countLabels(poisonedDataset?.resultData || []);

            const combinedLabels = [
                ...labelsFromOriginalDataset.map(label => ({
                    datasetType: 'original',
                    classLabels: label,
                    count: originalDataCounts.get(label) || 0,
                    value: 100,
                })),
                ...labelsFromPoisonedDataset.map(label => ({
                    datasetType: 'poisoned',
                    classLabels: label,
                    count: poisonedDataCounts.get(label) || 0,
                    value: 100,
                }))
            ];

            setCombinedDatasetLabels(combinedLabels);
        }
    };

    useEffect(() => {
        loadLabels();
    }, [formData.modelId, attackStatus.isLoading, attackStatus.isRunning, formData.attackType]);

    const prevAttacksStatusIsRunningRef = useRef<boolean | undefined>(undefined);

    useEffect(() => {
        if (prevAttacksStatusIsRunningRef.current && !attackStatus.isLoading) {
            console.log('State isRunning has been changed from true to false');
        }
        prevAttacksStatusIsRunningRef.current = attackStatus.isLoading;
    }, [attackStatus.isLoading]);

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | any>
    ) => {
        const {name, value} = event.target;
        let error = '';
        let newValue: any = value;

        if (name === "poisoningRate" || name === "sourceClass" || name === "targetClass") {
            const numValue = Number(value);
            if (name === "poisoningRate" && numValue <= 0) {
                error = "Poisoning rate must be greater than 0.";
                newValue = 0;
            } else {
                newValue = numValue;
            }
        }

        setFormErrors(prevErrors => ({
            ...prevErrors,
            [name]: error,
        }));

        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: newValue,
        }));
    };

    const handlePerformAttack = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await requestPerformAttack(formData);
            fetchAttackStatus();
            retrain();
        } catch (error) {
            console.error('Failed to perform attack:', error);
            setAttackStatus({isLoading: false, isRunning: false, error: 'Failed to perform attack'});
        }
    };

    return (
        <Container fluid="lg">
            <Row className="g-4">
                <Col lg={8} md={12}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="text-primary">
                            Adversarial Attacks Configuration
                        </Card.Header>
                        <Card.Body className="p-4">
                            <Card.Text>
                                Configure the parameters to perform adversarial attacks against models.
                            </Card.Text>
                            <Form onSubmit={handlePerformAttack}>
                                <Form.Group className="mb-4" controlId="poisoningRate">
                                    <Form.Label>
                                        Poisoning Percentage: <Badge bg="info">{formData.poisoningRate}%</Badge>
                                    </Form.Label>
                                    <Form.Range
                                        name="poisoningRate"
                                        value={formData.poisoningRate}
                                        onChange={handleInputChange}
                                        min={0}
                                        max={100}
                                        step={5}
                                        className="custom-range"
                                    />
                                    {formErrors.poisoningRate && (
                                        <div className="error">{formErrors.poisoningRate}</div>
                                    )}
                                </Form.Group>
                                <Form.Group as={Row} className="mb-4" controlId="attackType">
                                    <Form.Label column sm={4} className="text-secondary">
                                        Attack Type
                                    </Form.Label>
                                    <Col sm={8}>
                                        <Form.Select
                                            name="attackType"
                                            value={formData.attackType}
                                            onChange={handleInputChange}
                                            required
                                            className="shadow-sm"
                                        >
                                            <option value="">Select an attack...</option>
                                            <option value="tlf">TLF - Target Label Flipping</option>
                                            <option value="rsl">RSL - Random Swapping Labels</option>
                                        </Form.Select>
                                    </Col>
                                </Form.Group>
                                {formData.attackType === "tlf" && (
                                    <Row className="g-3">
                                        <Col sm={6}>
                                            <Form.Group controlId="targetClassNumber">
                                                <Form.Label>
                                                    Target Class Number
                                                    <TooltipComponent
                                                        message="Enter the class number from which samples will be generated or manipulated. This setting is crucial for generating adversarial samples or testing the model's robustness against data corruption."
                                                    >
                                                        <i className="bi bi-info-circle ms-2"
                                                           style={{cursor: "pointer"}}></i>
                                                    </TooltipComponent>
                                                </Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={formData.targetClass}
                                                    onChange={handleInputChange}
                                                    name="targetClass"
                                                    min="1"
                                                    max={originalDatasetLabels.length}
                                                    className="shadow-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                                <Button
                                    variant="primary"
                                    type="submit"
                                    className="mt-3"
                                    disabled={formData.poisoningRate === 0 || attackStatus.isLoading}
                                >
                                    {attackStatus.isLoading
                                        ? "Performing Attack..."
                                        : "Perform Attack"}
                                    {attackStatus.isLoading && (
                                        <Spinner
                                            as="span"
                                            animation="border"
                                            size="sm"
                                            role="status"
                                            aria-hidden="true"
                                            className="ms-2"
                                        />
                                    )}
                                </Button>
                                {attackStatus.error && (
                                    <div className="error mt-2 text-danger">
                                        {attackStatus.error}
                                    </div>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>
                    <Row className="mt-3">
                        <Col lg={12}>
                            <RandomSampleChart
                                dataSets={normalDataset}
                                label={"Original Dataset"}
                                attackStatus={attackStatus}
                            />
                            <RandomSampleChart
                                dataSets={poisonedDataset}
                                label={"Poisoned Dataset"}
                                attackStatus={attackStatus}
                            />
                        </Col>
                    </Row>
                </Col>
                <Col lg={4} md={12}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="text-primary">
                            {formData.attackType === "tlf"
                                ? "TLF Attack Details"
                                : "RSL Attack Details"}
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {formData.attackType === "tlf"
                                    ? "Target Label Flipping"
                                    : "Random Sampling Labels"}{" "}
                                strategy insights.
                            </Card.Text>
                            <AttackBarChart dataSets={combinedDatasetLabels}/>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdversarialTab;
