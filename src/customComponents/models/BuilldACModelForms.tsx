import React, { useEffect, useMemo, useState } from "react";
import { Button, Container, Form, InputGroup, Row } from "react-bootstrap";
import { FEATURE_OPTIONS, AI_MODEL_TYPES } from "../../constants";
import { useSpatialContext } from "../../context/context";
import { requestBuildACModel, MIEmergencyModels } from "../../api"; // Updated import for the new function
import useCheckBuildStatus from "../util/useCheckBuildStatus";

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
  const { acDataset } = useSpatialContext();
  const [{ buildStatusStatex, updateBuildStatus }] = useCheckBuildStatus();

  const initialFormData: FormState = useMemo(
    () => ({
      modelType: "",
      featureList: "Raw Features",
      trainingRatio: 0.7,
      serviceType: "",
      dataSet: "",
    }),
    []
  );
  const [formData, setFormData] = useState<FormState>(initialFormData);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleInputChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, files } = event.target as HTMLInputElement;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: files ? files[0] : value,
    }));
  };

  const handleBuildACModelSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
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
      } else if (serviceType === "Medical") {
        response = await MIEmergencyModels(modelFile!);
      }

      if (response && !buildStatusStatex?.isRunning) {
        updateBuildStatus();
      } else {
        console.log("Response is null or undefined");
      }
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

  const selectedServiceConfig = formConfigurations[formData.serviceType] || [];

  return (
    <Container>
      <Row className="contentContainer">
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
          <Button variant="primary mt-3" type="submit" disabled={!isFormValid}>
            Build Model
          </Button>
        </Form>
      </Row>
    </Container>
  );
};

export default BuildACModelForm;
