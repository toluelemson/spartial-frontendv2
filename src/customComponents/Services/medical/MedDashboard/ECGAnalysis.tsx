import React, { useState, useEffect } from "react";
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
import {
  visualizeECG,
  descriptionECGSignal,
  descriptionTickImportance,
  descriptionTimeImportance,
  descriptionLeadImportance,
} from "../../../../api";
import { useRoleContext, Role } from "../../../RoleProvider/RoleContext";

interface InsertECGProps {
  modelId: string;
  setAnalyzeData: (data: {
    result1: string | null;
    explanations: { [key: string]: string };
    allResponses: { [key: string]: string }[];
  }) => void;
}

export const ECGAnalysis: React.FC<InsertECGProps> = ({
  modelId,
  setAnalyzeData,
}) => {
  const [formData, setFormData] = useState({
    dat: "",
    hea: "",
    cut_classification_window: "--",
  });
  const { roles, userRole } = useRoleContext();
  const [loading, setLoading] = useState(false);
  const [result1, setResult1] = useState<string | null>(null);
  const [explanations, setExplanations] = useState<{ [key: string]: string }>(
    {}
  );

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

  const fetchExplanations = async () => {
    try {
      const rolePromises = roles.map((role) =>
        descriptionECGSignal(role, formData.cut_classification_window)
          .then((response) => {
            if (response) {
              return { [`${role}_description`]: response.description };
            } else {
              console.error(`Invalid response format for ${role} description`);
              return { [`${role}_description`]: "No description available" };
            }
          })
          .catch((error) => {
            console.error(`Error fetching ${role} description:`, error);
            return { [`${role}_description`]: "Error fetching description" };
          })
      );

      const additionalPromises = roles.flatMap((role) => [
        descriptionTickImportance(formData.cut_classification_window, role)
          .then((response) => {
            if (response) {
              return { [`${role}_tickImportance`]: response.description };
            } else {
              console.error(
                `Invalid response format for ${role} tick importance`
              );
              return { [`${role}_tickImportance`]: "No description available" };
            }
          })
          .catch((error) => {
            console.error(
              `Error fetching ${role} tick importance description:`,
              error
            );
            return { [`${role}_tickImportance`]: "Error fetching description" };
          }),
        descriptionTimeImportance(formData.cut_classification_window, role)
          .then((response) => {
            if (response) {
              return { [`${role}_timeImportance`]: response.description };
            } else {
              console.error(
                `Invalid response format for ${role} time importance`
              );
              return { [`${role}_timeImportance`]: "No description available" };
            }
          })
          .catch((error) => {
            console.error(
              `Error fetching ${role} time importance description:`,
              error
            );
            return { [`${role}_timeImportance`]: "Error fetching description" };
          }),
        descriptionLeadImportance(formData.cut_classification_window, role)
          .then((response) => {
            if (response) {
              return { [`${role}_leadImportance`]: response.description };
            } else {
              console.error(
                `Invalid response format for ${role} lead importance`
              );
              return { [`${role}_leadImportance`]: "No description available" };
            }
          })
          .catch((error) => {
            console.error(
              `Error fetching ${role} lead importance description:`,
              error
            );
            return { [`${role}_leadImportance`]: "Error fetching description" };
          }),
      ]);

      const promises = rolePromises.concat(additionalPromises);

      const descriptions = await Promise.all(promises);
      console.log("descriptions", descriptions);
      const explanationsObject = descriptions.reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      );

      setExplanations(explanationsObject);
      setAnalyzeData({
        result1,
        explanations: explanationsObject,
        allResponses: descriptions,
      });
    } catch (error) {
      console.error("Error fetching explanations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response1 = await visualizeECG(
        formData.dat,
        formData.hea,
        formData.cut_classification_window
      );
      if (response1) {
        const strippedModelId = stripPrefix(modelId);
        const submissionData = { ...formData, modelId: strippedModelId };
        const imageUrl1 = URL.createObjectURL(response1);

        setResult1(imageUrl1);
        await fetchExplanations(); // Fetch explanations after visualizing ECG
      } else {
        console.error("Invalid response format for API 1:", response1);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result1) {
      fetchExplanations(); // Fetch explanations when the component mounts and when the user role changes
    }
  }, [userRole]);

  return (
    <Container>
      <h2 className="my-4 text-center">
        Medical Analysis for ECG Data with Explanations
      </h2>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <h3 className="mb-4">Insert ECG Data</h3>

                <Form.Group className="mb-3">
                  <Form.Label htmlFor="featuresToMask">
                    Cut Classification Window:
                  </Form.Label>
                  <InputGroup>
                    <Form.Select
                      multiple={false}
                      name="cut_classification_window"
                      className="form-select"
                      onChange={handleInputChange}
                      value={formData.cut_classification_window}
                    >
                      <option value="--">--</option>
                      <option value="true">True</option>
                      <option value="false">False</option>
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
                <Button variant="primary" type="submit" className="mt-3 w-100">
                  Run Analysis
                </Button>
                {loading && <SpinnerComponent />}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                {result1 && (
                  <div className="border p-3">
                    <h3>ECG Image</h3>
                    <img
                      src={result1}
                      width="500"
                      height="250"
                      alt="Result Image"
                      className="img-fluid"
                    />
                  </div>
                )}
                {explanations[`${userRole}_description`] && (
                  <div className="border p-3 mt-4">
                    <h2>Description:</h2>
                    <p>{explanations[`${userRole}_description`]}</p>
                  </div>
                )}
                {/* {explanations[`${userRole}_tickImportance`] && (
                  <div className="border p-3 mt-4">
                    <h2>Tick Importance:</h2>
                    <p>{explanations[`${userRole}_tickImportance`]}</p>
                  </div>
                )}
                {explanations[`${userRole}_timeImportance`] && (
                  <div className="border p-3 mt-4">
                    <h2>Time Importance:</h2>
                    <p>{explanations[`${userRole}_timeImportance`]}</p>
                  </div>
                )}
                {explanations[`${userRole}_leadImportance`] && (
                  <div className="border p-3 mt-4">
                    <h2>Lead Importance:</h2>
                    <p>{explanations[`${userRole}_leadImportance`]}</p>
                  </div>
                )} */}
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <h2>Tick Importance:</h2>
                {explanations[`${userRole}_tickImportance`] ? (
                  <p>{explanations[`${userRole}_tickImportance`]}</p>
                ) : (
                  <p>No Tick Importance available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <h2>Time Importance:</h2>
                {explanations[`${userRole}_timeImportance`] ? (
                  <p>{explanations[`${userRole}_timeImportance`]}</p>
                ) : (
                  <p>No Time Importance available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4">
              <Card.Body>
                <h2>Channel Importance:</h2>
                {explanations[`${userRole}_leadImportance`] ? (
                  <p>{explanations[`${userRole}_leadImportance`]}</p>
                ) : (
                  <p>No Lead Importance available.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Form>
    </Container>
  );
};

const SpinnerComponent = () => (
  <div className="text-center my-5">
    <Spinner animation="border" role="status">
      <span className="visually-hidden">Loading...</span>
    </Spinner>
  </div>
);

export default ECGAnalysis;
