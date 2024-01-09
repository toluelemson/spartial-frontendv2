import React, { useState } from "react";
import { Col, Row } from "react-bootstrap";

import { predictMIEmergencies } from "../../api";

import MedicalNavbar from "./medicalNavbar";

interface formData {
  dat: string;
  hea: string;
}

const DetectMIEmergencies: React.FC = () => {
  const [formData, setFormData] = useState({ dat: "", hea: "" });
  const [results, setResults] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await predictMIEmergencies(formData.dat, formData.hea);

    console.log("API Response:", response); // Log the response to the console
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
                  Detect MI emergencies using default emergency model
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
            <div className="col">
              <h3>Results:</h3>
              {results.map((result, index) => (
                <div key={index} className="border-top pt-3">
                  {result}
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default DetectMIEmergencies;
