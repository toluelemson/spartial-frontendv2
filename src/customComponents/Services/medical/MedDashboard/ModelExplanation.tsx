import React, { useState } from "react";
import {
  Container,
  Form,
  Button,
  Col,
  Row,
  Card,
  InputGroup,
  Spinner,
} from "react-bootstrap";
import { MIModelExplanation } from "../../../../api";
import "../../../../MIConfusion.css";

interface InsertECGProps {
  modelId: string;
  setAnalyzeData: (data: {
    result1: string | null;
    explanations: { [key: string]: string };
    allResponses: { [key: string]: string }[];
  }) => void;
}

export const ModelExplanation: React.FC<InsertECGProps> = ({
  modelId,
  setAnalyzeData,
}) => {
  const [formData, setFormData] = useState({
    dat: "",
    hea: "",
    xai_method: "LRP",
    ignore_cached_relevances: "true",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [result2, setResult2] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<any>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const stripPrefix = (id: string) => {
    const prefixMatch = id.match(/^[a-z]+-/);
    return prefixMatch ? id.replace(prefixMatch[0], "") : id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const strippedModelId = stripPrefix(modelId);
      const submissionData = { ...formData, modelId: strippedModelId };

      const response = await MIModelExplanation(
        submissionData.dat,
        submissionData.hea,
        strippedModelId,
        formData.xai_method,
        formData.ignore_cached_relevances
      );

      console.log("MIModelExplanation:", response);

      if (response) {
        setResult(response.xai_method);
        const formattedResult = `${response.shape}`;
        setResult2(formattedResult);
        setExplanations(response.explanations);
        // visualizeECG(response); // Removed this line
      } else {
        console.error("Invalid response format for API:", response);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadJSON = (data: any, filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Container>
        <h2 className="my-4 text-center">
          Model explanation for provided instance using specified XAI method
        </h2>

        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="ignore_cached_relevances">
                      Ignore Cached Relevances:
                    </Form.Label>
                    <InputGroup>
                      <Form.Select
                        multiple={false}
                        name="ignore_cached_relevances"
                        className="form-select"
                        onChange={handleInputChange}
                        value={formData.ignore_cached_relevances}
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="xai_method">XAI Method:</Form.Label>
                    <InputGroup>
                      <Form.Select
                        multiple={false}
                        name="xai_method"
                        className="form-select"
                        onChange={handleInputChange}
                        value={formData.xai_method}
                      >
                        <option value="LRP">LRP</option>
                        <option value="GradientSHAP">GradientSHAP</option>
                        <option value="DeepSHAP">DeepSHAP</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Dat:</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="dat"
                      placeholder="Enter ECG Signal"
                      value={formData.dat}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Hea:</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="hea"
                      placeholder="Enter ECG Signal"
                      value={formData.hea}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </Form.Group>
                  <Button
                    variant="primary"
                    type="submit"
                    className="mt-3 w-100"
                    disabled={loading}
                  >
                    {loading ? "Loading..." : "Submit"}
                  </Button>

                  {loading && <SpinnerComponent />}
                </Card.Body>
              </Card>
              <br /> <br />
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h3>Model Explanation:</h3>

                  {loading && <SpinnerComponent />}
                  {result && (
                    <div>
                      <p>XAI Method: {result}</p>
                      <p> Shape: [{result2}]</p>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          downloadJSON(explanations, "explanations.json")
                        }
                      >
                        Download Explanations as JSON
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Form>
      </Container>
    </>
  );
};

const SpinnerComponent = () => (
  <div className="text-center my-5">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default ModelExplanation;
