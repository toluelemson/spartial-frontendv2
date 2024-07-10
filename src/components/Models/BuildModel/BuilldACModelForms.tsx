import React, {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Col, Container, Form, InputGroup, Row, Spinner} from "react-bootstrap";
import {FEATURE_OPTIONS, AI_MODEL_TYPES} from "../../../constants";
import {useSpatialContext} from "../../../context/context";
import {MIEmergencyModels, requestBuildACModel} from "../../../api";
import CheckBuildStatusUtil from "../../util/CheckBuildStatusUtil";

interface FormState {
    serviceType: string;
    modelType: string;
    featureList: string;
    trainingRatio: number;
    dataSet: string;
    modelFile?: File;

    [key: string]: any;
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
        const validateForm = () => {
            if (formData.serviceType === "Network Traffic") {
                return (
                    formData.modelType !== "" &&
                    formData.featureList !== "" &&
                    formData.dataSet !== "" &&
                    formData.trainingRatio !== null
                );
            } else if (formData.serviceType === "Medical") {
                return formData.modelFile !== undefined;
            }
            return false;
        };
        setIsFormValid(validateForm());
    }, [formData]);

    // useEffect(() => {
    //     const isAnyFieldEmpty = Object.values(formData).some((value) => value === null || value === '');
    //     setIsFormValid(!isAnyFieldEmpty);
    // }, [formData]);
    // const inputGroups = useMemo(() => [
    //     {
    //         label: 'Service Type:',
    //         name: 'serviceType',
    //         type: 'select',
    //         value: formData.serviceType,
    //         placeholder: 'Select Service Type...',
    //         options: ["Network Traffic", "Medical"]
    //     },
    //     {
    //         label: 'Model Type:',
    //         name: 'modelType',
    //         type: 'select',
    //         value: formData.modelType,
    //         placeholder: 'Select model type...',
    //         options: AI_MODEL_TYPES
    //     },
    //     {
    //         label: 'Feature List:',
    //         name: 'featureList',
    //         type: 'select',
    //         value: formData.featureList,
    //         placeholder: 'Select feature List...',
    //         options: FEATURE_OPTIONS
    //     },
    //     {
    //         label: 'DataSet:',
    //         name: 'dataSet',
    //         type: 'select',
    //         value: formData.dataSet,
    //         placeholder: 'Select Dataset...',
    //         options: acDataset?.datasets || []
    //     },
    //     {
    //         label: 'Training Ratio:',
    //         name: 'trainingRatio',
    //         type: 'number',
    //         value: formData.trainingRatio.toString(),
    //         placeholder: '',
    //     }
    // ], [formData, acDataset]);
    // const handleInputChange = (
    //     event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    // ) => {
    //     const {name, value} = event.target;
    //     setFormData(prevFormData => ({...prevFormData, [name]: value}));
    // };

    const handleInputChange = (
        event: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) => {
        const {name, value, files} = event.target as HTMLInputElement;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: files ? files[0] : value,
        }));
    };

    // const handleBuildACModelSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    //     event.preventDefault();
    //     if (!isFormValid) {
    //         alert('Please fill out all required fields.');
    //         return;
    //     }
    //     const {modelType, featureList, dataSet, trainingRatio} = formData;
    //     setIsBuilding(true);
    //     try {
    //         const response = await requestBuildACModel(modelType, dataSet, featureList, trainingRatio);
    //         if (response) {
    //             updateBuildStatus();
    //         } else {
    //             console.log('Response is null or undefined');
    //         }
    //     } catch (error) {
    //         alert("Failed to build the model. Please try again.");
    //         console.error(error);
    //     } finally {
    //         setIsBuilding(false);
    //     }
    // };

    const handleBuildACModelSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setIsBuilding(true);
        if (!isFormValid) {
            alert("Please fill out all required fields.");
            return;
        }
        const {
            modelType,
            featureList,
            dataSet,
            trainingRatio,
            serviceType,
            modelFile,
        } = formData;
        try {
            let response;
            if (serviceType === "Network Traffic") {
                response = await requestBuildACModel(
                    modelType,
                    dataSet,
                    featureList,
                    trainingRatio
                );
                setIsBuilding(false);
            } else if (serviceType === "Medical") {
                response = await MIEmergencyModels(modelFile!);
                setIsBuilding(false);
            }
            // if (response && !buildStatusStatex?.isRunning) {
            //     updateBuildStatus();
            // } else {
            //     console.log("Response is null or undefined");
            // }
        } catch (error) {
            alert("Failed to build the model. Please try again.");
            console.error(error);
        }
    };

    const formConfigurations: { [key: string]: any[] } = {
        "Network Traffic": [
            {
                label: "Model Type:",
                name: "modelType",
                type: "select",
                value: formData.modelType,
                placeholder: "Select model type...",
                options: AI_MODEL_TYPES,
            },
            {
                label: "Feature List:",
                name: "featureList",
                type: "select",
                value: formData.featureList,
                placeholder: "Select feature List...",
                options: FEATURE_OPTIONS,
            },
            {
                label: "DataSet:",
                name: "dataSet",
                type: "select",
                value: formData.dataSet,
                placeholder: "Select Dataset...",
                options: acDataset?.datasets || [],
            },
            {
                label: "Training Ratio:",
                name: "trainingRatio",
                type: "number",
                value: formData.trainingRatio.toString(),
                placeholder: "",
            },
        ],
        Medical: [
            {
                label: "Model File:",
                name: "modelFile",
                type: "file",
                placeholder: "Upload model file...",
            },
            // Add other medical-specific fields if needed
        ],
        // Add other service configurations here
    };
    const selectedServiceConfig = formConfigurations[formData.serviceType] || []

    return (
        <Container fluid>
            <Row className="contentContainer justify-content-center">
                <Col md={10} lg={8}>
                    <Form onSubmit={handleBuildACModelSubmit}>
                        <h2>Build Models</h2>
                        <p>Build a new AI model</p>
                        <InputGroup className="mb-3">
                            <InputGroup.Text>Service Type:</InputGroup.Text>
                            <Form.Select
                                name="serviceType"
                                value={formData.serviceType}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Service Type...</option>
                                <option value="Network Traffic">Network Traffic</option>
                                <option value="Medical">Medical</option>
                            </Form.Select>
                        </InputGroup>
                        {selectedServiceConfig.map((group: any, index: number) => (
                            <InputGroup key={index} className="mb-3">
                                <InputGroup.Text>{group.label}</InputGroup.Text>
                                {group.type === "select" ? (
                                    <Form.Select
                                        name={group.name}
                                        value={formData[group.name] || ""}
                                        onChange={handleInputChange}
                                        required
                                    >
                                        <option value="">{group.placeholder}</option>
                                        {group.options?.map((option: string) => (
                                            <option key={option} value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : group.type === "file" ? (
                                    <Form.Control
                                        type="file"
                                        name={group.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                ) : (
                                    <Form.Control
                                        type={group.type}
                                        name={group.name}
                                        value={formData[group.name] || ""}
                                        onChange={handleInputChange}
                                        placeholder={group.placeholder}
                                        min={group.type === "number" ? "0" : undefined}
                                        max={group.type === "number" ? "1" : undefined}
                                        step={group.type === "number" ? "0.1" : undefined}
                                        required
                                    />
                                )}
                            </InputGroup>
                        ))}

                        {/*{inputGroups.map((group, index) => (*/}
                        {/*    <InputGroup key={index} className="mb-3">*/}
                        {/*        <InputGroup.Text>{group.label}</InputGroup.Text>*/}
                        {/*        {group.type === 'select' ? (*/}
                        {/*            <Form.Select*/}
                        {/*                name={group.name}*/}
                        {/*                value={group.value}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                required*/}
                        {/*            >*/}
                        {/*                <option value="">{group.placeholder}</option>*/}
                        {/*                {group && group.options && Array.isArray(group.options) ? (*/}
                        {/*                    group.options.map((g) => (*/}
                        {/*                        <option key={g} value={g}>{g}</option>*/}
                        {/*                    ))*/}
                        {/*                ) : (*/}
                        {/*                    <option value="">No options available</option>*/}
                        {/*                )}*/}
                        {/*            </Form.Select>*/}
                        {/*        ) : (*/}
                        {/*            <Form.Control*/}
                        {/*                type={group.type}*/}
                        {/*                name={group.name}*/}
                        {/*                value={group.value}*/}
                        {/*                onChange={handleInputChange}*/}
                        {/*                min={group.type === 'number' ? "0" : undefined}*/}
                        {/*                max={group.type === 'number' ? "1" : undefined}*/}
                        {/*                step={group.type === 'number' ? "0.1" : undefined}*/}
                        {/*            />*/}
                        {/*        )}*/}
                        {/*    </InputGroup>*/}
                        {/*// ))}*/}
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