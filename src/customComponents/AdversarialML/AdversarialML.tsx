import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {Button, Container, Form, Row, Col, Card, Badge, Spinner} from "react-bootstrap";
import {countLabels, extractLabelsFromDataset} from "../util/utility";
// import {requestAttacksStatus, requestPerformAttack} from "./../api";
import useFetchModelDataset from "../datasets/useFetchModelDataset";
import {TODO} from "../../types/types";
// import AttackChart from "../Plots/AttackChart";
// import ResilienceMetrics from "./ResilienceMetrics";
// import RslChart from "../Plots/RslChart";
// import RandomSampleChart from "./Plots/RandomSampleChart";


const AdversarialTab: React.FC<any> = ({state}) => {

    const [formData, setFormData] = useState<TODO>({
        modelId: state.modelId,
        poisoningRate: 0,
        attackType: '',
        sourceClass: [],
        targetClass: [],
    });

    const [formErrors, setFormErrors] = useState({
        poisoningRate: '',
    });

    const [attackStatus, setAttackStatus] = useState({isLoading: false});
    const [originalDatasetLabels, setOriginalDatasetLabels] = useState<string[]>([]);
    const [poisonedDatasetLabels, setPoisonedDatasetLabels] = useState<string[]>([]);
    const [combinedDatasetLabels, setCombinedDatasetLabels] = useState<DatasetLabelColumn[]>([]);
    const {poisonedDataset} = useFetchModelDataset(true, formData.modelId, "rsl");
    const {originalDataset} = useFetchModelDataset(false, formData.modelId, "train");

    console.log(originalDataset, "originalDataSet");
    console.log(poisonedDataset, "poisonedDataSet");


    interface DatasetLabelColumn {
        datasetType: string;
        classLabels: string;
        count: number;
        value: number;
    }

    useEffect(() => {
        const loadLabels = async () => {
            if (!formData.modelId) return;

            const labelsFromOriginalDataset = originalDataset ? await extractLabelsFromDataset({
                modelId: formData.modelId,
                datasets: originalDataset.resultData,
            }) : [];
            
            setOriginalDatasetLabels(labelsFromOriginalDataset);
            const labelsFromPoisonedDataset = poisonedDataset ? await extractLabelsFromDataset({
                modelId: formData.modelId,
                datasets: poisonedDataset,
            }) : [];
            setPoisonedDatasetLabels(labelsFromPoisonedDataset);
            const originalDataCounts = countLabels(originalDataset?.resultData || []);
            const poisonedDataCounts = countLabels(poisonedDataset?.resultData || []);

            const originalLabels = labelsFromOriginalDataset.map(label => ({
                datasetType: 'original',
                classLabels: label,
                count: originalDataCounts.get(label) || 0,
                value: 100,
            }));

            const poisonedLabels = labelsFromPoisonedDataset.map(label => ({
                datasetType: 'poisoned',
                classLabels: label,
                count: poisonedDataCounts.get(label) || 0,
                value: 100,
            }));

            const combinedLabels = [...originalLabels, ...poisonedLabels];

            // Set the combined labels state
            setCombinedDatasetLabels(combinedLabels);
        };

        loadLabels();
    }, [formData.modelId, originalDataset, poisonedDataset, attackStatus.isLoading]);

    const prevAttacksStatusIsRunningRef = useRef<boolean | undefined>(undefined);

    useEffect(() => {
        if (prevAttacksStatusIsRunningRef.current && !attackStatus.isLoading) {
            console.log('State isRunning has been changed from true to false')
        }
        prevAttacksStatusIsRunningRef.current = attackStatus.isLoading;
    }, [attackStatus.isLoading]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> | ChangeEvent<TODO>) => {
        const {name, value} = event.target;
        console.log(name, value);
        console.log(originalDatasetLabels)

        setFormErrors({
            ...formErrors,
            [name]: '',
        });
        if (name === "poisoningRate") {
            if (value === "0") {
                setFormErrors({
                    ...formErrors,
                    [name]: "Poisoning rate must be greater than 0.",
                });
                setFormData((prevFormData: any) => ({
                    [name]: Number(value)
                }));
            }
        }
        setFormData((prevFormData: any) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handlePerformAttack = async (event: { preventDefault: () => void; }) => {
        event.preventDefault();
        setAttackStatus((prev) => ({...prev, isLoading: true}));
        try {
            // await requestPerformAttack(formData);
            // const intervalId = setInterval(async () => {
            //     const statusRes = await requestAttacksStatus();
            //     if (!statusRes.isRunning) {
            //         clearInterval(intervalId);
            //         setAttackStatus({isLoading: false});
            //     } else {
            //         setAttackStatus((prev) => ({...prev, isRunning: true}));
            //     }
            // }, 3000);
        } catch (error) {
            console.error('Failed to perform attack:', error);

        }
        setAttackStatus((prev) => ({...prev, isLoading: false}))
    };


    return (
        <Container fluid="lg">
            <Row className="g-4">
                <Col lg={8}>
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
                                    {/*{formErrors.poisoningRate &&*/}
                                    {/*    <div className="error">{formErrors.poisoningRate}*/}
                                    {/*    </div>}*/}
                                </Form.Group>
                                <Form.Group as={Row} className="mb-4" controlId="attackType">
                                    <><Form.Label column sm={4} className="text-secondary">
                                        Attack Type
                                    </Form.Label><Col sm={8}>
                                        <Form.Select
                                            name="attackType"
                                            value={formData.attackType}
                                            onChange={handleInputChange}
                                            required
                                            className="shadow-sm"
                                        >
                                            <option value="">Select an attack...</option>
                                            <option value="tlf">TLF - Target Label Flipping</option>
                                            <option value="rsl">RSL - Random Sampling Labels</option>
                                        </Form.Select>
                                    </Col></>
                                </Form.Group>
                                {formData.attackType === "tlf" && (
                                    <Row className="g-3">
                                        <Col sm={6}>
                                            <Form.Group controlId="sourceClassNumber">
                                                <Form.Label>Source Class Number</Form.Label>
                                                <Form.Control
                                                    type="number"
                                                    value={formData.sourceClass}
                                                    onChange={handleInputChange}
                                                    name="sourceClass"
                                                    min="1"
                                                    max={originalDatasetLabels.length}
                                                    className="shadow-sm"
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group controlId="targetClassNumber">
                                                <Form.Label>Target Class Number</Form.Label>
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
                                <Button variant="primary" type="submit" className="mt-3"
                                        disabled={formData.poisoningRate === 0 || attackStatus.isLoading}>
                                    {attackStatus.isLoading ? 'Performing Attack...' : 'Perform Attack'}
                                    {attackStatus.isLoading &&
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"
                                                 className="ms-2"/>}
                                </Button>
                            </Form>

                        </Card.Body>
                    </Card>
                    <Row className={"mt-3"}>
                        <Col lg={12}>
                            {/*<Card> <ResilienceMetrics modelId={formData.modelId}/></Card>*/}
                        </Col>
                    </Row>

                </Col>
                <Col lg={4}>
                    <Card className="shadow-sm">
                        <Card.Header as="h5" className="text-primary">
                            {formData.attackType === "tlf" ? "TLF Attack Details" : "RSL Attack Details"}
                        </Card.Header>
                        <Card.Body>
                            <Card.Text>
                                {formData.attackType === "tlf" ? "Target Label Flipping" : "Random Sampling Labels"} strategy
                                insights.
                            </Card.Text>
                            {/*<AttackBarChart dataSets={combinedDatasetLabels} attackStatus={attackStatus.isRunning}/>*/}
                            {/*<AttackChart dataSets={combinedDatasetLabels} attackStatus={attackStatus.isLoading}/>*/}
                            {/*/!*<RandomSampleChart dataSets={combinedDatasetLabels}/>*!/*/}
                            {/*<RslChart dataSets={combinedDatasetLabels} attackStatus={attackStatus.isLoading}/>*/}
                            {/*<RandomSampleChart dataSets={combinedDatasetLabels} attackStatus={attackStatus.isLoading}/>*/}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );

}

export default AdversarialTab;
