import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";

import { tickImportance } from "../../api";

import MedicalNavbar from "./medicalNavbar";

const TickImportance: React.FC = () => {
  const [formData, setFormData] = useState({
    dat: "",
    hea: "",
    xai_method: "shap",
    model_id: "",
  });
  const [result, setResult] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };
  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Make API request
      const response = await tickImportance(
        formData.dat,
        formData.hea,
        formData.xai_method,
        formData.model_id
      );

      console.log("API Response:", response); // Log the response to the console

      // Check if response is defined
      if (response) {
        // Create a data URL directly from the Blob
        const imageUrl = URL.createObjectURL(response);

        // Set the result to the image URL
        setResult(imageUrl);
      } else {
        console.error("Invalid response format:", response);
      }
    } catch (error) {
      // Handle API request error
      console.error("Error in handleSubmit:", error);
      // You might want to set an error state or display an error message to the user
    }
  };

  return (
    <>
      <MedicalNavbar />
      <div className="container mt-4">
        <Row>
          {/* Left side with the form */}
          <Col md={6}>
            <div className="border p-3">
              <form onSubmit={handleSubmit}>
                <h2 className="text-gray">
                  Generate explanation (highlighting the relevant time ticks)
                  for the provided ECG signal applying the specified XAI method
                  on the specified model
                </h2>
                <div className="mb-3">
                  <label htmlFor="selectxai_method" className="form-label">
                    Xai Method:
                  </label>
                  <select
                    id="selectxai_method"
                    name="xai_method"
                    value={formData.xai_method}
                    onChange={handleInputChange}
                    // handleSelectChange
                    className="form-select"
                  >
                    <option value="shap">Shap</option>
                    <option value="gradCam">GradCam</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label htmlFor="textareamodel_id" className="form-label">
                    model id:
                  </label>
                  <textarea
                    id="textareamodel_id"
                    name="model_id"
                    value={formData.model_id}
                    onChange={handleInputChange}
                    className="form-control"
                    rows={1}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="textareaDat" className="form-label">
                    dat:
                  </label>
                  <textarea
                    id="textareaDat"
                    name="dat"
                    value={formData.dat}
                    onChange={handleInputChange}
                    className="form-control"
                    rows={4}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="textareaHea" className="form-label">
                    hea:
                  </label>
                  <textarea
                    id="textareaHea"
                    name="hea"
                    value={formData.hea}
                    onChange={handleInputChange}
                    className="form-control"
                    rows={4}
                  />
                </div>

                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </form>
            </div>
          </Col>

          {/* Right side with the results */}
          <Col md={6}>
            {result && (
              <div className="border p-3">
                <h2>Results:</h2>
                <img src={result} alt="Result Image" className="img-fluid" />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </>
  );
};

export default TickImportance;
