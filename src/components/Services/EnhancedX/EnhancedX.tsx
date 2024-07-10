import React, { useState } from "react";
import FileUpload from "../Fairness/FileUploadForm";
import { enhancedInterpretability } from "../../../api";
import { Card, Col } from "react-bootstrap";
import { Link, To } from "react-router-dom";

const fairnessHomepage = "/xai/service/enhancedX";

const EnhancedX: React.FC = () => {
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (files: File[] | File) => {
    setError(null);
    setIsLoading(true);
    const filesArray = Array.isArray(files) ? files : [files];

    for (const file of filesArray) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an Image.");
        setIsLoading(false);
        return;
      }
    }

    for (const file of filesArray) {
      const formData = new FormData();
      formData.append("file", file);
      await handleFileSubmit(formData);
    }

    setIsLoading(false);
  };

  const handleFileSubmit = async (formData: FormData): Promise<string> => {
    try {
      const response = await enhancedInterpretability(formData);
      if (response) {
        const blob = new Blob([response], { type: "image/png" });
        const imageUrl = URL.createObjectURL(blob);
        setImageUrls((prevUrls) => [...prevUrls, imageUrl]);
        return imageUrl;
      }
      return "";
    } catch (error) {
      console.error(error);
      setError("Error processing your request. Please try again.");
      return "";
    }
  };

  return (
    <div className="container mt-5">
      {/* <h2 className="mb-4">Enhanced Interpretability Service</h2> */}
      <Link to={fairnessHomepage} className="nav-link text-lightblue fs-5">
        Enhanced Interpretability Service
      </Link>
      <br />
      {error && <div className="alert alert-danger">{error}</div>}
      <FileUpload
        onFileUpload={handleFileUpload}
        onFileSubmit={handleFileSubmit}
      />
      {isLoading && <p>Loading...</p>}
      <Col md={12}>
        {imageUrls.map((imageUrl, index) => (
          <Card className="mb-4" key={index}>
            <Card.Body>
              <h4>Interpreted Output {index + 1}:</h4>
              <div className="border p-3">
                <img
                  src={imageUrl}
                  alt={`Interpreted Output ${index}`}
                  width="500"
                  height="250"
                  className="img-fluid rounded shadow"
                />
              </div>
            </Card.Body>
          </Card>
        ))}
      </Col>
    </div>
  );
};

export default EnhancedX;
