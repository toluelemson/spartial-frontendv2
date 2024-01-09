import React, { useState } from "react";
import { Col, Row, Table } from "react-bootstrap";

import { predictMIEmergencies } from "../../api";

import MedicalNavbar from "./medicalNavbar";

interface formData {
  dat: string;
  hea: string;
  store_data: string;
}

interface Result {
  predicted_class: string;
  classification_score: number;
  emergency: boolean;
  emergency_data: string | null;
}

const DetectMIEmergencies: React.FC = () => {
  const [formData, setFormData] = useState({
    dat: "",
    hea: "",
    store_data: "--",
  });

  const [results, setResults] = useState<Result[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await predictMIEmergencies(
      formData.dat,
      formData.hea,
      formData.store_data
    );

    console.log("API Response:", response); // Log the response to the console
    setResults([response]);
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
                  <label htmlFor="selectstore_data" className="form-label">
                    store data:
                  </label>
                  <select
                    id="selectCutClassificationWindow"
                    name="store_data"
                    value={formData.store_data}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    <option value="--">--</option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
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
            <div className="col">
              <h3>Results:</h3>
              <Table striped bordered hover>
                <thead>
                  <tr>
                    <th>Predicted Class</th>
                    <th>Classification Score</th>
                    <th>Emergency</th>
                    <th>Emergency Data</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td>{result.predicted_class}</td>
                      <td>{result.classification_score}</td>
                      <td>{result.emergency ? "Yes" : "No"}</td>
                      <td>{result.emergency_data || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default DetectMIEmergencies;
