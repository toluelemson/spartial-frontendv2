import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";

import MedicalNavbar from "./medicalNavbar";

const GenerateExplanations: React.FC = () => {
  const [formData, setFormData] = useState({ dat: "", hea: "" });
  const [result, setResult] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(JSON.stringify(formData, null, 2));
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
                  Generate default explanation for MI detection emergency use
                  case
                </h2>
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

export default GenerateExplanations;
