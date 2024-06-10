import React, { useState } from "react";
import { Col, Row, Button } from "react-bootstrap";

import { getSpecificModel } from "../../../api";

import MedicalNavbar from "./medicalNavbar";

interface ResultItem {
  _id: string;
  hea: string;
  dat: string;
}

const ModelSpecific: React.FC = () => {
  const [formData, setFormData] = useState({
    model_id: "5a0d5c66-8698-4c28-8177-5729ba1e2d0c",
  });

  const [result, setResult] = useState<Array<ResultItem>>([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await getSpecificModel(formData.model_id);
      console.log("API Response:", response);
      setResult(response);
    } catch (error) {
      // Handle API request error
      console.error("Error in handleSubmit:", error);
      // You might want to set an error state or display an error message to the user
    } finally {
      setLoading(false); // Set loading state to false after the API call completes
    }
  };

  const handleCopyToClipboard = (content: string) => {
    const tempTextArea = document.createElement("textarea");
    tempTextArea.value = content;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand("copy");
    document.body.removeChild(tempTextArea);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + " ...";
    }
    return text;
  };

  return (
    <>
      <MedicalNavbar />
      <div className="container mt-4">
        {/* Left side with the form */}

        <div className="border p-3">
          <form onSubmit={handleSubmit}>
            <h2 className="text-gray">Get a stored model by ID</h2>
            <div className="mb-3">
              <label htmlFor="textareadata_id" className="form-label">
                model_id:
              </label>
              <textarea
                id="model_id"
                name="model_id"
                value={formData.model_id}
                onChange={handleInputChange}
                className="form-control"
                rows={1}
                required
              />
            </div>
            <br />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      </div>
      {/* Right side with the results */}
      <br />
      <div className="container mt-4">
        {result && (
          <div className="border p-3">
            <h3>Model Details:</h3>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </>
  );
};

export default ModelSpecific;
