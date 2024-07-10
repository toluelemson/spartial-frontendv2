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
  Tabs,
  Tab,
} from "react-bootstrap";
import {
  visualizeECG,
  identifySegments,
  descriptionECGSignal,
  descriptionECGClassification,
  MI_ModelPrediction,
  MI_ModelEvaluate,
  descriptionTickImportance,
  descriptionTimeImportance,
  descriptionLeadImportance,
  LRP_TICK_Visualize,
  GradientSHAP_TICK_Visualize,
  DeepSHAP_TICK_Visualize,
  LRP_TIME_Visualize,
  GradientSHAP_TIME_Visualize,
  DeepSHAP_TIME_Visualize,
  LRP_LEAD_Visualize,
  GradientSHAP_LEAD_Visualize,
  DeepSHAP_LEAD_Visualize,
} from "../../../../api";
import "../../../../MIConfusion.css";
import { useRoleContext, Role } from "../../../RoleProvider/RoleContext";
import LlamaParaphrase from "../../Llama/LlamaParaphrase";

interface InsertECGProps {
  modelId: string;
  setAnalyzeData: (data: {
    result1: string | null;
    explanations: { [key: string]: string };
    allResponses: { [key: string]: string }[];
  }) => void;
}
interface EvaluationData {
  accuracy: number;
  auc: number;
  f1: number;
  fn: number;
  fp: number;
  precision: number;
  recall: number;
  sensitivity: number;
  specificity: number;
  tn: number;
  tp: number;
}

export const ECGAnalysis: React.FC<InsertECGProps> = ({
  modelId,
  setAnalyzeData,
}) => {
  const [formData, setFormData] = useState({
    dat: "",
    hea: "",
    cut_classification_window: "--",
    ignore_cached_relevances: "--",
  });
  const { roles, userRole } = useRoleContext();
  const [loading, setLoading] = useState(false);
  const [result1, setResult1] = useState<string | null>(null);
  const [result2, setResult2] = useState<string | null>(null);
  const [result3, setResult3] = useState<string | null>(null);
  const [predictedClass, setPredictedClass] = useState<string | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(
    null
  );
  const [explanations, setExplanations] = useState<{ [key: string]: string }>(
    {}
  );

  const [tickImages, setTickImages] = useState<{
    [key: string]: string | null;
  }>({
    LRP: null,
    GradientSHAP: null,
    DeepSHAP: null,
  });

  const [timeImages, setTimeImages] = useState<{
    [key: string]: string | null;
  }>({
    LRP: null,
    GradientSHAP: null,
    DeepSHAP: null,
  });

  const [leadImages, setLeadImages] = useState<{
    [key: string]: string | null;
  }>({
    LRP: null,
    GradientSHAP: null,
    DeepSHAP: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            const json = JSON.parse(event.target.result as string);
            setFormData((prevData) => ({
              ...prevData,
              dat: json.dat || "",
              hea: json.hea || "",
            }));
          } catch (error) {
            console.error("Invalid JSON file:", error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const stripPrefix = (id: string) => {
    const prefixMatch = id.match(/^[a-z]+-/);
    return prefixMatch ? id.replace(prefixMatch[0], "") : id;
  };

  const removeHTMLTags = (str: string): string => {
    return str.replace(/<\/?[^>]+(>|$)/g, "");
  };

  const fetchExplanations = async () => {
    try {
      const rolePromises = roles.map((role) =>
        descriptionECGSignal(role, "true")
          .then((response) => {
            if (response) {
              return {
                [`${role}_description`]: removeHTMLTags(response.description),
              };
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
              return {
                [`${role}_tickImportance`]: removeHTMLTags(
                  response.description
                ),
              };
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
        descriptionECGSignal(role, "false")
          .then((response) => {
            if (response) {
              return {
                [`${role}_CLASSdescription`]: removeHTMLTags(
                  response.description
                ),
              };
            } else {
              console.error(`Invalid response format for ${role} description`);
              return {
                [`${role}_CLASSdescription`]: "No description available",
              };
            }
          })
          .catch((error) => {
            console.error(`Error fetching ${role} description:`, error);
            return {
              [`${role}_CLASSdescription`]: "Error fetching description",
            };
          }),
        descriptionTimeImportance(formData.cut_classification_window, role)
          .then((response) => {
            if (response) {
              return {
                [`${role}_timeImportance`]: removeHTMLTags(
                  response.description
                ),
              };
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
              return {
                [`${role}_leadImportance`]: removeHTMLTags(
                  response.description
                ),
              };
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
        descriptionECGClassification(role)
          .then((response) => {
            if (response) {
              return {
                [`${role}_ECGClassification`]: removeHTMLTags(
                  response.description
                ),
              };
            } else {
              console.error(
                `Invalid response format for ${role} ECG Classification description`
              );
              return {
                [`${role}_ECGClassification`]: "No description available",
              };
            }
          })
          .catch((error) => {
            console.error(`Error fetching ${role} description:`, error);
            return {
              [`${role}_ECGClassification`]: "Error fetching description",
            };
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
    console.log("ECGAnalysis loading started");
    try {
      const strippedModelId = stripPrefix(modelId);
      const submissionData = { ...formData, modelId: strippedModelId };

      // Fetch all data in parallel
      const [
        response1,
        identifyECGVisualizations,
        MI_ModelPredictionDetails,
        MI_ModelEvaluateDetails,
        timeVisualizations,
        tickVisualizations,
        leadVisualizations,
      ] = await Promise.all([
        visualizeECG(
          formData.dat,
          formData.hea,
          formData.cut_classification_window
        ),
        identifySegments(submissionData.dat, submissionData.hea),
        MI_ModelPrediction(
          submissionData.dat,
          submissionData.hea,
          strippedModelId
        ),
        MI_ModelEvaluate(strippedModelId, "PTB-XL"),

        Promise.all([
          LRP_TIME_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
          GradientSHAP_TIME_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
          DeepSHAP_TIME_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
        ]),
        Promise.all([
          LRP_TICK_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
          GradientSHAP_TICK_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
          DeepSHAP_TICK_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
        ]),
        Promise.all([
          LRP_LEAD_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
          GradientSHAP_LEAD_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
          DeepSHAP_LEAD_Visualize(
            submissionData.dat,
            submissionData.hea,
            strippedModelId,
            "false"
            // formData.ignore_cached_relevances
          ),
        ]),
      ]);

      console.log("Time visualizations:", timeVisualizations);
      console.log("Tick visualizations:", tickVisualizations);
      console.log("Lead visualizations:", leadVisualizations);

      if (response1) {
        const imageUrl1 = URL.createObjectURL(response1);
        setResult1(imageUrl1);

        const imageUrl2 = URL.createObjectURL(identifyECGVisualizations);
        setResult2(imageUrl2);

        const formattedResult = `Score: ${MI_ModelPredictionDetails.score}, Predicted Class: ${MI_ModelPredictionDetails.predicted_class}`;
        setResult3(formattedResult);
        setPredictedClass(MI_ModelPredictionDetails.predicted_class);

        setEvaluationData(MI_ModelEvaluateDetails);

        // Fetch explanations after visualizing ECG
        await fetchExplanations();

        setTimeImages({
          LRP: timeVisualizations[0]
            ? URL.createObjectURL(timeVisualizations[0])
            : null,
          GradientSHAP: timeVisualizations[1]
            ? URL.createObjectURL(timeVisualizations[1])
            : null,
          DeepSHAP: timeVisualizations[2]
            ? URL.createObjectURL(timeVisualizations[2])
            : null,
        });

        setLeadImages({
          LRP: leadVisualizations[0]
            ? URL.createObjectURL(leadVisualizations[0])
            : null,
          GradientSHAP: leadVisualizations[1]
            ? URL.createObjectURL(leadVisualizations[1])
            : null,
          DeepSHAP: leadVisualizations[2]
            ? URL.createObjectURL(leadVisualizations[2])
            : null,
        });

        setTickImages({
          LRP: tickVisualizations[0]
            ? URL.createObjectURL(tickVisualizations[0])
            : null,
          GradientSHAP: tickVisualizations[1]
            ? URL.createObjectURL(tickVisualizations[1])
            : null,
          DeepSHAP: tickVisualizations[2]
            ? URL.createObjectURL(tickVisualizations[2])
            : null,
        });
      } else {
        console.error("Invalid response format for API 1:", response1);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
    } finally {
      setLoading(false);
      console.log("ECGAnalysis loading ended");
    }
  };

  useEffect(() => {
    if (result1) {
      fetchExplanations(); // Fetch explanations when the component mounts and when the user role changes
    }
  }, [userRole]);

  return (
    <>
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
                    <Form.Label htmlFor="cut_classification_window">
                      Show Cut Classification Window:
                    </Form.Label>
                    <InputGroup>
                      <Form.Select
                        multiple={false}
                        name="cut_classification_window"
                        className="form-select"
                        onChange={handleInputChange}
                        value={formData.cut_classification_window}
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </Form.Select>
                    </InputGroup>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Upload ECG Signal (JSON File):</Form.Label>
                    <Form.Control
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                    />
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
                    {loading ? "Loading..." : "Run Analysis"}
                  </Button>

                  {loading && <SpinnerComponent />}
                </Card.Body>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="mb-4">
                <Card.Body>
                  <h3>Model Prediction:</h3>

                  {loading && <SpinnerComponent />}
                  {result3}
                  {result3 ? (
                    <>
                      <div
                        className={`d-flex justify-content-center align-items-center  p-3 mb-3 text-white fw-bold rounded ${
                          predictedClass === "MI" ? "bg-danger" : "bg-success"
                        }`}
                      >
                        {predictedClass}
                      </div>
                      <p>{explanations[`${userRole}_ECGClassification`]}</p>
                      <LlamaParaphrase
                        explanation={
                          explanations[`${userRole}_ECGClassification`] || ""
                        }
                        userRole={userRole}
                      />
                    </>
                  ) : (
                    <p>Prediction details not available.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Tabs defaultActiveKey="LRP" className="flex-row mb-4">
            <Tab eventKey="LRP" title="LRP">
              <div>
                <Row>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Tick Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {tickImages.LRP ? (
                          <>
                            <img
                              src={tickImages.LRP}
                              alt="LRP Tick"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_tickImportance`] ? (
                              <>
                                {" "}
                                <p>
                                  {explanations[`${userRole}_tickImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_tickImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />{" "}
                              </>
                            ) : (
                              <p>No Tick Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Tick Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Time Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {timeImages.LRP ? (
                          <>
                            <img
                              src={timeImages.LRP}
                              alt="LRP Time"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_timeImportance`] ? (
                              <>
                                <p>
                                  {explanations[`${userRole}_timeImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_timeImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />
                              </>
                            ) : (
                              <p>No Time Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Time Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Lead Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {leadImages.LRP ? (
                          <>
                            <img
                              src={leadImages.LRP}
                              alt="LRP Lead"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_leadImportance`] ? (
                              <>
                                <p>
                                  {explanations[`${userRole}_leadImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_leadImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />
                              </>
                            ) : (
                              <p>No Lead Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Lead Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>
            <Tab eventKey="GradientSHAP" title="GradientSHAP">
              <div>
                <Row>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Tick Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {tickImages.GradientSHAP ? (
                          <>
                            <img
                              src={tickImages.GradientSHAP}
                              alt="GradientSHAP Tick"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_tickImportance`] ? (
                              <>
                                <p>
                                  {explanations[`${userRole}_tickImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_tickImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />{" "}
                              </>
                            ) : (
                              <p>No Tick Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Tick Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Time Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {timeImages.GradientSHAP ? (
                          <>
                            <img
                              src={timeImages.GradientSHAP}
                              alt="GradientSHAP Time"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_timeImportance`] ? (
                              <>
                                {" "}
                                <p>
                                  {explanations[`${userRole}_timeImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_timeImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />
                              </>
                            ) : (
                              <p>No Time Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Time Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Lead Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {leadImages.GradientSHAP ? (
                          <>
                            <img
                              src={leadImages.GradientSHAP}
                              alt="GradientSHAP Lead"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_leadImportance`] ? (
                              <>
                                {" "}
                                <p>
                                  {explanations[`${userRole}_leadImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_leadImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />
                              </>
                            ) : (
                              <p>No Lead Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Lead Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>
            <Tab eventKey="DeepSHAP" title="DeepSHAP">
              <div>
                <Row>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Tick Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {tickImages.DeepSHAP ? (
                          <>
                            <img
                              src={tickImages.DeepSHAP}
                              alt="DeepSHAP Tick"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_tickImportance`] ? (
                              <>
                                <p>
                                  {explanations[`${userRole}_tickImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_tickImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />
                              </>
                            ) : (
                              <p>No Tick Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Tick Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Time Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {timeImages.DeepSHAP ? (
                          <>
                            <img
                              src={timeImages.DeepSHAP}
                              alt="DeepSHAP Time"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_timeImportance`] ? (
                              <>
                                <p>
                                  {explanations[`${userRole}_timeImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_timeImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />
                              </>
                            ) : (
                              <p>No Time Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Time Importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={4}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h3>Lead Importance:</h3>
                        {loading && <SpinnerComponent />}
                        {leadImages.DeepSHAP ? (
                          <>
                            <img
                              src={leadImages.DeepSHAP}
                              alt="DeepSHAP Lead"
                              className="img-fluid"
                            />
                            {explanations[`${userRole}_leadImportance`] ? (
                              <>
                                <p>
                                  {explanations[`${userRole}_leadImportance`]}
                                </p>
                                <LlamaParaphrase
                                  explanation={
                                    explanations[
                                      `${userRole}_leadImportance`
                                    ] || ""
                                  }
                                  userRole={userRole}
                                />
                              </>
                            ) : (
                              <p>No Lead Importance explanation available.</p>
                            )}
                          </>
                        ) : (
                          <p className="">
                            Lead importance image not available.
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab>
          </Tabs>
          {userRole === "endUser" && (
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Body>
                    <h3>ECG Segments:</h3>
                    {loading && <SpinnerComponent />}
                    {!loading && (
                      <>
                        {result2 ? (
                          <div className="border p-3">
                            <img
                              src={result2}
                              width="500"
                              height="250"
                              alt="Result Image"
                              className="img-fluid"
                            />
                          </div>
                        ) : (
                          <p className="">ECG segment image not available.</p>
                        )}
                      </>
                    )}
                  </Card.Body>
                </Card>{" "}
                <br />
                <br />
              </Col>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Body>
                    <h3>Explanation:</h3>
                    {loading && <SpinnerComponent />}
                    {explanations[`${userRole}_description`] ? (
                      <>
                        {" "}
                        <p>{explanations[`${userRole}_description`]}</p>
                        <LlamaParaphrase
                          explanation={
                            explanations[`${userRole}_description`] || ""
                          }
                          userRole={userRole}
                        />{" "}
                      </>
                    ) : (
                      <p>Explanation not available.</p>
                    )}
                  </Card.Body>
                </Card>{" "}
                <br />
                <br />
              </Col>
            </Row>
          )}
          {userRole !== "endUser" && (
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Body>
                    <h3>ECG Classification:</h3>
                    {loading && <SpinnerComponent />}
                    {result1 ? (
                      <div className="border p-3">
                        <img
                          src={result1}
                          alt="Result Image"
                          className="img-fluid"
                        />
                      </div>
                    ) : (
                      <p className="">
                        ECG classification image not available.
                      </p>
                    )}
                  </Card.Body>
                </Card>{" "}
                {userRole == "medicalExpert" && (
                  <>
                    <br />
                    <br />
                  </>
                )}
              </Col>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Body>
                    <h3>Explanation:</h3>
                    {loading && <SpinnerComponent />}
                    {explanations[`${userRole}_CLASSdescription`] ? (
                      <div className="border p-3">
                        <p>{explanations[`${userRole}_CLASSdescription`]}</p>
                        <LlamaParaphrase
                          explanation={
                            explanations[`${userRole}_CLASSdescription`] || ""
                          }
                          userRole={userRole}
                        />
                      </div>
                    ) : (
                      <p className="">Explanation not available.</p>
                    )}
                  </Card.Body>
                </Card>{" "}
              </Col>
            </Row>
          )}

          {userRole === "developer" && (
            <Row>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Body>
                    <h3>Confusion Matrix:</h3>
                    {loading && <SpinnerComponent />}
                    {evaluationData ? (
                      <>
                        <br /> <br />
                        <div className="confusion-matrix">
                          <div className="header">True Class</div>
                          <div className="side-label">Predicted Class</div>
                          <div className="cell tp">tp: {evaluationData.tp}</div>
                          <div className="cell fp">fp: {evaluationData.fp}</div>
                          <div className="cell fn">fn: {evaluationData.fn}</div>
                          <div className="cell tn">tn: {evaluationData.tn}</div>
                        </div>
                      </>
                    ) : (
                      <p className="">
                        Confusion matrix details not available.
                      </p>
                    )}
                  </Card.Body>
                </Card>{" "}
                <br />
                <br />
              </Col>
              <Col md={6}>
                <Card className="mb-4">
                  <Card.Body>
                    <h3>Model Performance:</h3>
                    {loading && <SpinnerComponent />}
                    {evaluationData ? (
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>
                              <b>Metric</b>
                            </th>
                            <th>
                              <b>Value</b>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(evaluationData)
                            .filter(
                              ([key]) => !["fn", "fp", "tn", "tp"].includes(key)
                            )
                            .map(([key, value]) => (
                              <tr key={key}>
                                <td>{key}</td>
                                <td>{value}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="">Performance details not available.</p>
                    )}
                  </Card.Body>
                </Card>{" "}
                <br /> <br />
              </Col>
            </Row>
          )}
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

export default ECGAnalysis;
