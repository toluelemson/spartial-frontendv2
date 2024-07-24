import React, { useState, FormEvent } from "react";
import { differentialPrivacy } from "../../../api";
import { Card, Row, Col } from "react-bootstrap";
import { Link, To } from "react-router-dom";

const privacyHomepage = "/xai/service/privacy";

interface PrivacyMicroservicesFormProps {}

interface FormState {
  clientSamplingRate: number;
  clippingValue: number;
  delta: number;
  epsilon: number;
  modelParameters: number[][][]; // Should be a nested array
  noiseType: number; // Should be an integer
  sigma: number;
  totalFLRounds: number;
}

interface ResponseData {
  noisyWeights: number[][][];
  sigma: number;
}

const PrivacyMicroservicesForm: React.FC<
  PrivacyMicroservicesFormProps
> = () => {
  const [formState, setFormState] = useState<FormState>({
    clientSamplingRate: 0.5,
    clippingValue: 15.5,
    delta: 0.01,
    epsilon: 5,
    modelParameters: [], // Initialize as an empty array
    noiseType: 1127, // Change to integer
    sigma: 1.2,
    totalFLRounds: 100,
  });

  const [result, setResult] = useState<ResponseData | null>(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormState((prevState) => ({
      ...prevState,
      [name]:
        name === "modelParameters"
          ? JSON.parse(value) // Parse JSON string to array
          : name === "noiseType"
          ? parseInt(value, 10)
          : parseFloat(value),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setFormState((prevState) => ({
            ...prevState,
            modelParameters: json,
          }));
        } catch (error) {
          console.error("Error parsing file:", error);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    console.log(formState);
    const res = await differentialPrivacy(formState);
    console.log(res);
    setResult(res);
    setLoading(false);
  };

  const downloadJSON = (data: object, filename: string) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mt-5">
      {/* <h2 className="mb-4">Differential Privacy Service</h2> */}
      <Link to={privacyHomepage} className="nav-link text-lightblue fs-5">
        Differential Privacy Service
      </Link>
      <p>
        Execute differential privacy adding noise and clipping to a collection
        of local client updates before executing the aggregation procedure.{" "}
      </p>
      <br />
      <form onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="clientSamplingRate" className="form-label">
                  Client Sampling Rate:
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control"
                  id="clientSamplingRate"
                  name="clientSamplingRate"
                  value={formState.clientSamplingRate}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="clippingValue" className="form-label">
                  Clipping Value:
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control"
                  id="clippingValue"
                  name="clippingValue"
                  value={formState.clippingValue}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="delta" className="form-label">
                  Delta:
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control"
                  id="delta"
                  name="delta"
                  value={formState.delta}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="epsilon" className="form-label">
                  Epsilon:
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="form-control"
                  id="epsilon"
                  name="epsilon"
                  value={formState.epsilon}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="modelParameters" className="form-label">
                  Model Parameters (as JSON or TXT file):
                </label>
                <input
                  type="file"
                  className="form-control"
                  id="modelParameters"
                  name="modelParameters"
                  accept=".json,.txt"
                  onChange={handleFileUpload}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="noiseType" className="form-label">
                  Noise Type:
                </label>
                <input
                  type="number"
                  step="1" // Integer step
                  className="form-control"
                  id="noiseType"
                  name="noiseType"
                  value={formState.noiseType}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="sigma" className="form-label">
                  Sigma:
                </label>
                <input
                  type="number"
                  step="0.0001"
                  className="form-control"
                  id="sigma"
                  name="sigma"
                  value={formState.sigma}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Body>
                <label htmlFor="totalFLRounds" className="form-label">
                  Total FL Rounds:
                </label>
                <input
                  type="number"
                  step="1"
                  className="form-control"
                  id="totalFLRounds"
                  name="totalFLRounds"
                  value={formState.totalFLRounds}
                  onChange={handleInputChange}
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </Col>
        </Row>
      </form>
      <Row className="mt-4">
        <Col>
          {result && (
            <Card className="border-top pt-3">
              <Card.Body>
                <h3>Results:</h3>
                <p>
                  <strong>Sigma:</strong> {result.sigma}
                </p>
                <p>
                  <strong>Noisy Weights:</strong>
                </p>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    downloadJSON(result.noisyWeights, `noisyWeights.json`)
                  }
                >
                  Download Noisy Weights JSON
                </button>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default PrivacyMicroservicesForm;
