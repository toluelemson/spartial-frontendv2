import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Col, Container, Form, InputGroup, Row, Spinner} from "react-bootstrap";
import {FEATURE_OPTIONS, AI_MODEL_TYPES} from "../../../constants";
import {useSpatialContext} from "../../../context/context";
import {requestBuildACModel} from "../../../api";
import CheckBuildStatusUtil from "../../util/CheckBuildStatusUtil";

interface FormState {
    serviceType: string;
    modelType: string;
    featureList: string;
    trainingRatio: number;
    dataSet: string;
}

const BuildACModelForm: React.FC = () => {
    const {acDataset} = useSpatialContext();
    const navigate = useNavigate();
    const onSuccess = (buildId: string | number) => {
        // navigate(`/models/all`);
        navigate(`/spatial/dashboard/${buildId}`);
    };
    const {updateBuildStatus, isRunning} = CheckBuildStatusUtil(onSuccess);

    const initialFormData: FormState = useMemo(() => ({
        modelType: '',
        featureList: 'Raw Features',
        trainingRatio: 0.7,
        serviceType: 'Network Traffic',
        dataSet: ''
    }), []);
    const [formData, setFormData] = useState<FormState>(initialFormData);
    const [isFormValid, setIsFormValid] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isBuilding, setIsBuilding] = useState(false); // New state for managing the building process


    useEffect(() => {
        if (acDataset && acDataset.datasets) {
            setIsLoading(false);
        }
    }, [acDataset, isLoading]);

    useEffect(() => {
        const isAnyFieldEmpty = Object.values(formData).some((value) => value === null || value === '');
        setIsFormValid(!isAnyFieldEmpty);
    }, [formData]);

    const inputGroups = useMemo(() => [
        {
            label: 'Service Type:',
            name: 'serviceType',
            type: 'select',
            value: formData.serviceType,
            placeholder: 'Select Service Type...',
            options: ["Network Traffic"]
        },
        {
            label: 'Model Type:',
            name: 'modelType',
            type: 'select',
            value: formData.modelType,
            placeholder: 'Select model type...',
            options: AI_MODEL_TYPES
        },
        {
            label: 'Feature List:',
            name: 'featureList',
            type: 'select',
            value: formData.featureList,
            placeholder: 'Select feature List...',
            options: FEATURE_OPTIONS
        },
        {
            label: 'DataSet:',
            name: 'dataSet',
            type: 'select',
            value: formData.dataSet,
            placeholder: 'Select Dataset...',
            options: acDataset?.datasets || []
        },
        {
            label: 'Training Ratio:',
            name: 'trainingRatio',
            type: 'number',
            value: formData.trainingRatio.toString(),
            placeholder: '',
        }
    ], [formData, acDataset]);
    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const {name, value} = event.target;
        setFormData(prevFormData => ({...prevFormData, [name]: value}));
    };
    const handleBuildACModelSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!isFormValid) {
            alert('Please fill out all required fields.');
            return;
        }

        const {modelType, featureList, dataSet, trainingRatio} = formData;

        setIsBuilding(true);
        try {
            const response = await requestBuildACModel(modelType, dataSet, featureList, trainingRatio);
            if (response) {
                updateBuildStatus();
            } else {
                console.log('Response is null or undefined');
            }

        } catch (error) {
            alert("Failed to build the model. Please try again.");
            console.error(error);
        } finally {
            setIsBuilding(false);
        }
    };

    return (
        <Container fluid>
            <Row className="contentContainer justify-content-center">
                <Col md={10} lg={8}>
                    <Form onSubmit={handleBuildACModelSubmit}>
                        <h2>Build Models</h2>
                        <p>Build a new AI model</p>
                        {inputGroups.map((group, index) => (
                            <InputGroup key={index} className="mb-3">
                                <InputGroup.Text>{group.label}</InputGroup.Text>
                                {group.type === 'select' ? (
                                    <Form.Select
                                        name={group.name}
                                        value={group.value}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">{group.placeholder}</option>
                                        {group && group.options && Array.isArray(group.options) ? (
                                            group.options.map((g) => (
                                                <option key={g} value={g}>{g}</option>
                                            ))
                                        ) : (
                                            <option value="">No options available</option>
                                        )}
                                    </Form.Select>
                                ) : (
                                    <Form.Control
                                        type={group.type}
                                        name={group.name}
                                        value={group.value}
                                        onChange={handleInputChange}
                                        min={group.type === 'number' ? "0" : undefined}
                                        max={group.type === 'number' ? "1" : undefined}
                                        step={group.type === 'number' ? "0.1" : undefined}
                                    />
                                )}
                            </InputGroup>
                        ))}
                        <Button variant="primary mt-3" type="submit" disabled={!isFormValid || isBuilding || isRunning}>
                            {(isBuilding || isRunning) ? (
                                <>
                                    <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true"
                                             className="me-2"/>
                                    {(isBuilding ? "Building..." : "Checking Status...")}
                                </>
                            ) : (
                                "Build Model"
                            )}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default BuildACModelForm;
