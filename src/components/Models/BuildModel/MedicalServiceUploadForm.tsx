import React, { useState } from "react";
import { Button, Form, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MIEmergencyModels } from "../../../api";
import { ServiceFormProps } from "../../../types/types";
import CheckBuildStatusUtil from "../../util/CheckBuildStatusUtil";

const MedicalServiceUploadForm: React.FC<ServiceFormProps> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { updateBuildStatus, isRunning } = CheckBuildStatusUtil(() => {});
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleNavigate = (modelId: string) => {
    // const trimmedModelId = modelId.replace(/^ma-/, "");
    const prefixedModelId = `ma-${modelId}`;
    // navigate(`/spatial/dashboard/${prefixedModelId}`);
    return prefixedModelId;
  };

  const handleUploadSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    try {
      const response = await MIEmergencyModels(selectedFile);
      const modelId = handleNavigate(response.model_id);
      if (response) {
        // updateBuildStatus();
        navigate(`/spatial/dashboard/${modelId}`);
      } else {
        console.log("Response is null or undefined");
      }
      // updateBuildStatus();
      // navigate(`/spatial/dashboard/${selectedFile.name}`);
    } catch (error) {
      alert("Failed to upload the model. Please try again.");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form onSubmit={handleUploadSubmit}>
      <InputGroup className="mb-3">
        <Form.Control type="file" onChange={handleFileChange} required />
      </InputGroup>
      <Button
        variant="primary"
        type="submit"
        disabled={isUploading || isRunning}
      >
        {isUploading || isRunning ? (
          <>
            <Spinner
              as="span"
              animation="border"
              size="sm"
              role="status"
              aria-hidden="true"
              className="me-2"
            />
            {isUploading ? "Uploading..." : "Uploading Model..."}
          </>
        ) : (
          "Upload Model"
        )}
      </Button>
    </Form>
  );
};

export default MedicalServiceUploadForm;
