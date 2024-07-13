import React, { useState } from "react";
import { Button, Form, Spinner, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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

    const handleUploadSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedFile) {
            alert("Please select a file to upload.");
            return;
        }

        setIsUploading(true);
        try {
            // const response = await uploadFileAPI(selectedFile);  
            updateBuildStatus();
            navigate(`/spatial/dashboard/${selectedFile.name}`);
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
                <Form.Control
                    type="file"
                    onChange={handleFileChange}
                    required
                />
            </InputGroup>
            <Button variant="primary" type="submit" disabled={isUploading || isRunning}>
                {(isUploading || isRunning) ? (
                    <>
                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                        {(isUploading ? "Uploading..." : "Uploading Model...")}
                    </>
                ) : (
                    "Upload Model"
                )}
            </Button>
        </Form>
    );
};

export default MedicalServiceUploadForm;
