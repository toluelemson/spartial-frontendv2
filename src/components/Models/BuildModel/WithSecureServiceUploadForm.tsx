import React, { useState } from "react";
import { Button, Form, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PostWithSecureModels } from "../../../api";
import { ServiceFormProps } from "../../../types/types";
import CheckBuildStatusUtil from "../../util/CheckBuildStatusUtil";

const WithSecureServiceUploadForm: React.FC<ServiceFormProps> = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [version, setVersion] = useState("");
  const [classname, setClassname] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { updateBuildStatus, isRunning } = CheckBuildStatusUtil(() => {});
  const navigate = useNavigate();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleNavigate = (modelId: string) => {
    const prefixedModelId = `ws-${modelId}`;
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
      const response = await PostWithSecureModels(
        selectedFile,
        name,
        version,
        classname
      );
      const modelId = handleNavigate(response.id);
      if (response) {
        navigate(`/spatial/dashboard/${modelId}`);
      } else {
        console.log("Response is null or undefined");
      }
    } catch (error) {
      alert("Failed to upload the model. Please try again.");
      console.error("Upload Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form onSubmit={handleUploadSubmit}>
      <InputGroup className="mb-3">
        {/* <InputGroup.Text>File:</InputGroup.Text> */}
        <Form.Control type="file" onChange={handleFileChange} required />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text>Name:</InputGroup.Text>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text>Version:</InputGroup.Text>
        <Form.Control
          type="text"
          value={version}
          onChange={(e) => setVersion(e.target.value)}
          required
        />
      </InputGroup>
      <InputGroup className="mb-3">
        <InputGroup.Text>Classname:</InputGroup.Text>
        <Form.Control
          type="text"
          value={classname}
          onChange={(e) => setClassname(e.target.value)}
          required
        />
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

export default WithSecureServiceUploadForm;
