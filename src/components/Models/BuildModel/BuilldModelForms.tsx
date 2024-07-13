import React, {useState} from "react";
import {Container, Row, Col, Form, InputGroup} from "react-bootstrap";
import NetworkTrafficForm from "./NetworkTrafficForm";
import {ServiceFormProps} from "../../../types/types";
import MedicalServiceUploadForm from "./MedicalServiceUploadForm";

const serviceForms: { [key: string]: React.FC<ServiceFormProps> } = {
    "Network Traffic": NetworkTrafficForm,
    "Medical": MedicalServiceUploadForm
};

const serviceHeadings: { [key: string]: { title: string, description: string } } = {
    "Network Traffic": {
        title: "Build Network Traffic Models",
        description: "Build a new AI model for Network Traffic Service"
    },
    "Medical": {
        title: "Upload Medical Model",
        description: "Upload a pre-trained AI model for Medical Service"
    }
};

const BuildModelForms: React.FC = () => {
    const [serviceType, setServiceType] = useState("Network Traffic");

    const handleServiceTypeChange = (newServiceType: string) => {
        setServiceType(newServiceType);
    };

    const SelectedServiceForm = serviceForms[serviceType];
    const {title, description} = serviceHeadings[serviceType];

    return (
        <Container fluid>
            <Row className="contentContainer justify-content-center">
                <Col md={10} lg={8}>
                    <h2>{title}</h2>
                    <p>{description}</p>
                    <Form.Group as={Row} className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>Service Type:</InputGroup.Text>
                            <Form.Select
                                name="serviceType"
                                value={serviceType}
                                onChange={(e) => handleServiceTypeChange(e.target.value)}
                            >
                                <option value="Network Traffic">Network Traffic</option>
                                <option value="Medical">Medical</option>
                            </Form.Select>
                        </InputGroup>
                    </Form.Group>
                    <SelectedServiceForm serviceType={serviceType} onServiceTypeChange={handleServiceTypeChange}/>
                </Col>
            </Row>
        </Container>
    );
};

export default BuildModelForms;
